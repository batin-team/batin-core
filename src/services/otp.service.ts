import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { sendOtpEmail } from "./email.service";

export type OtpPurpose = "REGISTRATION" | "PASSWORD_RESET";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
// Minimum seconds between OTP requests for the same email+purpose (anti-spam).
const RESEND_COOLDOWN_SECONDS = 60;

function generateCode(): string {
  // 6-digit numeric, zero-padded.
  const n = Math.floor(Math.random() * 1_000_000);
  return String(n).padStart(6, "0");
}

/**
 * Generates an OTP, invalidates previous unconsumed ones for the same
 * email+purpose, persists a hash, and emails the plain code.
 * Throws Error("RESEND_COOLDOWN") if requested too soon.
 */
export async function createAndSendOtp(email: string, purpose: OtpPurpose) {
  const normalizedEmail = email.trim().toLowerCase();

  const recent = await prisma.otpCode.findFirst({
    where: { email: normalizedEmail, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" }
  });
  if (recent) {
    const ageSeconds = (Date.now() - recent.createdAt.getTime()) / 1000;
    if (ageSeconds < RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - ageSeconds);
      const err = new Error("RESEND_COOLDOWN");
      (err as any).retryAfter = wait;
      throw err;
    }
  }

  // Invalidate any outstanding codes so only the newest is valid.
  await prisma.otpCode.updateMany({
    where: { email: normalizedEmail, purpose, consumedAt: null },
    data: { consumedAt: new Date() }
  });

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { email: normalizedEmail, codeHash, purpose, expiresAt }
  });

  const result = await sendOtpEmail(normalizedEmail, code, purpose, OTP_TTL_MINUTES);
  return { ...result, ttlMinutes: OTP_TTL_MINUTES };
}

/**
 * Verifies a submitted code. On success the OTP is consumed.
 * Returns { ok: true } or { ok: false, error } with a user-facing message.
 */
export async function verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<{ ok: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  const otp = await prisma.otpCode.findFirst({
    where: { email: normalizedEmail, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" }
  });

  if (!otp) {
    return { ok: false, error: "Kode OTP tidak ditemukan. Silakan minta kode baru." };
  }
  if (otp.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "Kode OTP sudah kedaluwarsa. Silakan minta kode baru." };
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Terlalu banyak percobaan. Silakan minta kode baru." };
  }

  const matches = await bcrypt.compare(String(code || "").trim(), otp.codeHash);
  if (!matches) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, error: "Kode OTP salah." };
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  return { ok: true };
}
