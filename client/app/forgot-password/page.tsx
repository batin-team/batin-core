"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { KeyRound, MailCheck, ArrowLeft, LogIn } from "lucide-react";
import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";
import { apiFetch } from "../../lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setStep("reset");
      setInfo(res?.data?.message || "Jika email terdaftar, kode OTP telah dikirim.");
    } catch (err: any) {
      setError(err.message || "Gagal mengirim kode OTP, coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code: otp, newPassword })
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Gagal mengatur ulang password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    try {
      await apiFetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
      setInfo("Kode OTP baru telah dikirim.");
    } catch (err: any) {
      setError(err.message || "Gagal mengirim ulang kode OTP.");
    }
  }

  return (
    <div className="page-shell">
      <NavBar />
      <main className="container section auth-layout">
        <section className="panel auth-panel" style={{ maxWidth: 440, margin: "0 auto", padding: "32px 20px", borderRadius: 20, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)", border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{ backgroundColor: "#2563EB", color: "#FFFFFF", width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center" }}>
              <KeyRound size={26} />
            </div>
          </div>

          {done ? (
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Password Diperbarui</h2>
              <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
                Password Anda berhasil diatur ulang. Silakan masuk dengan password baru Anda.
              </p>
              <button onClick={() => router.push("/login")} className="button button-primary" style={{ borderRadius: 8, minHeight: 46, fontSize: 15, fontWeight: 700, backgroundColor: "#2563EB", width: "100%", display: "flex", gap: 8, justifyContent: "center" }}>
                <LogIn size={18} /> Ke Halaman Masuk
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", textAlign: "center", marginBottom: 8 }}>
                {step === "email" ? "Lupa Password" : "Reset Password"}
              </h2>
              <p style={{ color: "#64748B", fontSize: 14, textAlign: "center", marginBottom: 24 }}>
                {step === "email"
                  ? "Masukkan email akun Anda untuk menerima kode OTP."
                  : "Masukkan kode OTP dari email Anda dan password baru."}
              </p>

              {error && (
                <div className="badge warning" style={{ borderRadius: 8, padding: 12, justifyContent: "center", width: "100%", marginBottom: 16, fontSize: 13, fontWeight: 700 }}>
                  {error}
                </div>
              )}
              {info && (
                <div style={{ borderRadius: 8, padding: 12, width: "100%", marginBottom: 16, fontSize: 13, fontWeight: 700, backgroundColor: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", gap: 8 }}>
                  <MailCheck size={16} /> {info}
                </div>
              )}

              {step === "email" ? (
                <form onSubmit={handleRequest} style={{ display: "grid", gap: 20 }}>
                  <div className="field">
                    <label htmlFor="email" style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Email</label>
                    <input className="input" id="email" type="email" placeholder="contoh@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ borderRadius: 8 }} />
                  </div>
                  <button className="button button-primary" type="submit" disabled={isSubmitting} style={{ borderRadius: 8, minHeight: 46, fontSize: 15, fontWeight: 700, backgroundColor: "#2563EB", opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? "Mengirim kode..." : "Kirim Kode OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReset} style={{ display: "grid", gap: 20 }}>
                  <div className="field">
                    <label htmlFor="otp" style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Kode OTP</label>
                    <input
                      className="input"
                      id="otp"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      required
                      style={{ borderRadius: 8, letterSpacing: 8, textAlign: "center", fontSize: 22, fontWeight: 800 }}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="newPassword" style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Password Baru</label>
                    <input className="input" id="newPassword" type="password" placeholder="Minimal 6 karakter" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} style={{ borderRadius: 8 }} />
                  </div>
                  <button className="button button-primary" type="submit" disabled={isSubmitting || otp.length < 6 || newPassword.length < 6} style={{ borderRadius: 8, minHeight: 46, fontSize: 15, fontWeight: 700, backgroundColor: "#2563EB", opacity: (isSubmitting || otp.length < 6 || newPassword.length < 6) ? 0.7 : 1 }}>
                    {isSubmitting ? "Memproses..." : "Atur Ulang Password"}
                  </button>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <button type="button" onClick={() => { setStep("email"); setError(""); setInfo(""); setOtp(""); }} style={{ background: "none", border: "none", color: "#64748B", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
                      <ArrowLeft size={14} /> Ganti email
                    </button>
                    <button type="button" onClick={handleResend} style={{ background: "none", border: "none", color: "#2563EB", fontWeight: 700, cursor: "pointer", padding: 0 }}>
                      Kirim ulang kode
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748B" }}>
            Ingat password Anda? <Link style={{ color: "#2563EB", fontWeight: 700, textDecoration: "none" }} href="/login">Masuk</Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
