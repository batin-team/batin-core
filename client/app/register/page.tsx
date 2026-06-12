"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { UserPlus } from "lucide-react";
import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";

import { apiFetch } from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, phone, password })
      });
      localStorage.setItem("mindbridge_user", JSON.stringify(res.user));
      router.push("/booking");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Pendaftaran gagal, coba lagi nanti.");
    }
  }

  return (
    <div className="page-shell" style={{ backgroundColor: "#F1F5F9" }}>
      <NavBar />
      <main style={{ minHeight: "calc(100vh - 140px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 16px" }}>
        <div className="register-container">
          {/* Left Side: Brand Promo / Gradient Banner */}
          <div className="register-left" style={{
            background: "linear-gradient(135deg, #035285 0%, #006b54 100%)",
            padding: "56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "#FFFFFF",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Decorative patterns */}
            <div style={{
              position: "absolute",
              top: "-10%",
              right: "-10%",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)",
              pointerEvents: "none"
            }} />
            <div style={{
              position: "absolute",
              bottom: "-5%",
              left: "-5%",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)",
              pointerEvents: "none"
            }} />

            <div style={{ zIndex: 2, position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "rgba(255, 255, 255, 0.15)", padding: "8px 16px", borderRadius: 99, backdropFilter: "blur(4px)", marginBottom: 36 }}>
                <UserPlus size={16} />
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase" }}>Registrasi Klien</span>
              </div>
              
              <h1 style={{ fontSize: 38, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.25, marginBottom: 20, letterSpacing: "-1px", fontFamily: "inherit" }}>
                Langkah Awal Menuju Kesehatan Mental Lebih Baik
              </h1>
              <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: 15, lineHeight: 1.6, marginBottom: 44 }}>
                Daftarkan akun klien Anda hari ini untuk terhubung dengan psikolog klinis profesional kami secara online maupun offline.
              </p>

              {/* Benefits List */}
              <div style={{ display: "grid", gap: 28 }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0, fontWeight: "bold", fontSize: 14 }}>
                    ✓
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#FFFFFF" }}>Psikolog Terverifikasi</h4>
                    <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.5 }}>Seluruh terapis kami merupakan psikolog klinis berlisensi resmi.</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0, fontWeight: "bold", fontSize: 14 }}>
                    ✓
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#FFFFFF" }}>Konseling Fleksibel</h4>
                    <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.5 }}>Pilih metode tatap muka langsung (offline) maupun video call (online).</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0, fontWeight: "bold", fontSize: 14 }}>
                    ✓
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#FFFFFF" }}>Privasi 100% Terjamin</h4>
                    <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.5 }}>Seluruh catatan konseling dilindungi dengan kerahasiaan medis tertinggi.</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 48, fontSize: 12, color: "rgba(255, 255, 255, 0.5)", fontWeight: 500 }}>
              © {new Date().getFullYear()} Batin Kesehatan Mental. All rights reserved.
            </div>
          </div>

          {/* Right Side: Registration Form */}
          <div style={{ padding: "56px", display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginBottom: 8, letterSpacing: "-0.5px" }}>Buat Akun Baru</h2>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 28, fontWeight: 500 }}>Mulai pemesanan konseling Anda sekarang.</p>

            {error && (
              <div className="badge warning" style={{ 
                borderRadius: 10, 
                padding: "12px 16px", 
                justifyContent: "center", 
                width: "100%", 
                marginBottom: 20, 
                fontSize: 13,
                fontWeight: 700
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
              <div className="field">
                <label htmlFor="fullName" style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Nama Lengkap</label>
                <input className="input" id="fullName" placeholder="Masukkan nama lengkap Anda" value={fullName} onChange={(event) => setFullName(event.target.value)} required style={{ borderRadius: 8, padding: "12px 14px" }} />
              </div>
              <div className="field">
                <label htmlFor="email" style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Email</label>
                <input className="input" id="email" type="email" placeholder="contoh@email.com" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ borderRadius: 8, padding: "12px 14px" }} />
              </div>
              <div className="field">
                <label htmlFor="phone" style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Nomor HP</label>
                <input className="input" id="phone" placeholder="08xxxxxxxxxx" value={phone} onChange={(event) => setPhone(event.target.value)} required style={{ borderRadius: 8, padding: "12px 14px" }} />
              </div>
              <div className="field">
                <label htmlFor="password" style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Password</label>
                <input className="input" id="password" type="password" placeholder="Minimal 6 karakter" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} style={{ borderRadius: 8, padding: "12px 14px" }} />
              </div>
              
              <button className="button button-primary" type="submit" style={{ borderRadius: 8, minHeight: 48, fontSize: 15, fontWeight: 700, backgroundColor: "#2563EB", display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
                <UserPlus size={18} /> Daftar & Mulai Booking
              </button>
            </form>

            <p style={{ marginTop: 28, fontSize: 14, color: "#64748B", textAlign: "center", fontWeight: 500 }}>
              Sudah punya akun? <Link style={{ color: "#2563EB", fontWeight: 700, textDecoration: "none" }} href="/login">Masuk</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
