import nodemailer, { Transporter } from "nodemailer";

// Builds a nodemailer transporter from MAIL_* env vars. Returns null when SMTP
// is not configured, so callers can gracefully fall back to logging in dev.
let cachedTransporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (cachedTransporter !== undefined) return cachedTransporter;

  const host = process.env.MAIL_HOST;
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;

  if (!host || !user || !pass) {
    cachedTransporter = null;
    return null;
  }

  const port = Number(process.env.MAIL_PORT || 587);
  // STARTTLS on 587 => secure:false; implicit TLS on 465 => secure:true
  const secure = port === 465;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
  return cachedTransporter;
}

function fromHeader(): string {
  const name = process.env.MAIL_FROM_NAME || "Batin Apps";
  const address = process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || "no-reply@batin.app";
  return `"${name}" <${address}>`;
}

/** Verifies SMTP credentials/connectivity. Returns true if reachable. */
export async function verifyEmailTransport(): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;
  try {
    await transporter.verify();
    return true;
  } catch (err) {
    console.error("[email] SMTP verify failed:", err);
    return false;
  }
}

type OtpPurpose = "REGISTRATION" | "PASSWORD_RESET";

const PURPOSE_COPY: Record<OtpPurpose, { subject: string; heading: string; intro: string }> = {
  REGISTRATION: {
    subject: "Kode OTP Registrasi Akun Batin",
    heading: "Verifikasi Email Anda",
    intro: "Gunakan kode di bawah ini untuk menyelesaikan pendaftaran akun Batin Anda."
  },
  PASSWORD_RESET: {
    subject: "Kode OTP Reset Password Batin",
    heading: "Permintaan Reset Password",
    intro: "Gunakan kode di bawah ini untuk mengatur ulang password akun Batin Anda."
  }
};

function otpEmailHtml(code: string, purpose: OtpPurpose, ttlMinutes: number): string {
  const copy = PURPOSE_COPY[purpose];
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#F8FAFC;border-radius:16px;">
    <h2 style="color:#0F172A;margin:0 0 8px;">${copy.heading}</h2>
    <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">${copy.intro}</p>
    <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;padding:24px;text-align:center;">
      <div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#2563EB;">${code}</div>
    </div>
    <p style="color:#94A3B8;font-size:12px;line-height:1.6;margin:20px 0 0;">
      Kode ini berlaku selama ${ttlMinutes} menit. Jangan bagikan kode ini kepada siapa pun.
      Jika Anda tidak meminta kode ini, abaikan email ini.
    </p>
    <p style="color:#94A3B8;font-size:12px;margin:16px 0 0;">— Tim Batin</p>
  </div>`;
}

/**
 * Sends an OTP email. In dev without SMTP configured, logs the code instead of
 * throwing, so the flow remains testable.
 */
export async function sendOtpEmail(to: string, code: string, purpose: OtpPurpose, ttlMinutes: number) {
  const transporter = getTransporter();
  const copy = PURPOSE_COPY[purpose];

  if (!transporter) {
    console.warn(`[email] SMTP not configured. OTP for ${to} (${purpose}): ${code}`);
    return { sent: false, mocked: true };
  }

  await transporter.sendMail({
    from: fromHeader(),
    to,
    subject: copy.subject,
    text: `${copy.intro}\n\nKode OTP Anda: ${code}\nBerlaku ${ttlMinutes} menit.`,
    html: otpEmailHtml(code, purpose, ttlMinutes)
  });

  return { sent: true, mocked: false };
}
