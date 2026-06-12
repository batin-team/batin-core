"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { LogIn, HeartHandshake } from "lucide-react";

import { apiFetch } from "../../lib/api";

type RoleOption = "CLIENT" | "PSYCHOLOGIST" | "ADMIN";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [activeRole, setActiveRole] = useState<RoleOption>("CLIENT");
  const [email, setEmail] = useState("client@batin.test");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  // Redirect away if already logged in
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mindbridge_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user?.role === "PSYCHOLOGIST") {
          router.replace("/dashboard/psychologist");
        } else if (user?.role === "ADMIN") {
          router.replace("/dashboard/admin");
        } else {
          router.replace("/dashboard/client");
        }
      }
    } catch {
      // invalid / corrupt storage — ignore and show the login form
    }
  }, [router]);


  const handleRoleSelect = (role: RoleOption) => {
    setActiveRole(role);
    setError("");
    if (role === "CLIENT") {
      setEmail("client@batin.test");
      setPassword("password");
    } else if (role === "PSYCHOLOGIST") {
      setEmail("psy-amanda@batin.test");
      setPassword("password");
    } else {
      setEmail("admin@batin.test");
      setPassword("password");
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("mindbridge_user", JSON.stringify(res.user));

      let redirectUrl = params.get("next");
      if (!redirectUrl) {
        if (res.user.role === "PSYCHOLOGIST") {
          redirectUrl = "/dashboard/psychologist";
        } else if (res.user.role === "ADMIN") {
          redirectUrl = "/dashboard/admin";
        } else {
          redirectUrl = "/booking";
        }
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal masuk, periksa kembali email Anda.");
    }
  }

  return (
    <section className="panel auth-panel" style={{ maxWidth: 440, margin: "0 auto", padding: "32px 20px", borderRadius: 20, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)", border: "1px solid #E2E8F0" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div style={{ backgroundColor: "#2563EB", color: "#FFFFFF", width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center" }}>
          <HeartHandshake size={28} />
        </div>
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", textAlign: "center", marginBottom: 8 }}>Masuk ke Batin</h2>
      <p style={{ color: "#64748B", fontSize: 14, textAlign: "center", marginBottom: 24 }}>Gunakan role dummy untuk membuka dashboard tanpa backend.</p>

      {error && (
        <div className="badge warning" style={{ borderRadius: 8, padding: 12, justifyContent: "center", width: "100%", marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
        <div className="field">
          <label htmlFor="email" style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Email</label>
          <input className="input" id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ borderRadius: 8 }} />
        </div>

        <div className="field">
          <label htmlFor="password" style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Password</label>
          <input className="input" id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ borderRadius: 8 }} />
        </div>

        {/* Role Segmented Selector matching Mockup */}
        <div style={{ display: "flex", backgroundColor: "#F1F5F9", borderRadius: 10, padding: 4, marginTop: 4 }}>
          <button
            type="button"
            onClick={() => handleRoleSelect("CLIENT")}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: activeRole === "CLIENT" ? "#2563EB" : "transparent",
              color: activeRole === "CLIENT" ? "#FFFFFF" : "#475569"
            }}
          >
            CLIENT
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect("PSYCHOLOGIST")}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: activeRole === "PSYCHOLOGIST" ? "#2563EB" : "transparent",
              color: activeRole === "PSYCHOLOGIST" ? "#FFFFFF" : "#475569"
            }}
          >
            PSIKOLOG
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect("ADMIN")}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: activeRole === "ADMIN" ? "#2563EB" : "transparent",
              color: activeRole === "ADMIN" ? "#FFFFFF" : "#475569"
            }}
          >
            ADMIN
          </button>
        </div>

        <button className="button button-primary" type="submit" style={{ borderRadius: 8, minHeight: 46, fontSize: 15, fontWeight: 700, backgroundColor: "#2563EB" }}>
          <LogIn size={18} /> Masuk
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748B" }}>
        Belum punya akun? <Link style={{ color: "#2563EB", fontWeight: 700, textDecoration: "none" }} href="/register">Daftar dulu</Link>
      </p>
    </section>
  );
}
