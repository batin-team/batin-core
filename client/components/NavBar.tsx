"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, HeartHandshake, History, LogOut, User, Menu, X } from "lucide-react";

type NavBarProps = {
  active?: "home" | "psychologists" | "sessions" | "psychologist" | "booking";
};

type UserData = {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  avatarUrl?: string;
  phone?: string;
};

export function NavBar({ active = "home" }: NavBarProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function loadUser() {
      const raw = localStorage.getItem("mindbridge_user");
      if (raw) {
        try {
          setUser(JSON.parse(raw) as UserData);
        } catch (e) {
          console.error(e);
        }
      }
    }
    loadUser();

    window.addEventListener("user-updated", loadUser);
    return () => {
      window.removeEventListener("user-updated", loadUser);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  function handleLogout() {
    localStorage.removeItem("mindbridge_user");
    setUser(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const userInitial = user ? (user.fullName || user.email || "U")[0].toUpperCase() : "";
  const dashboardPath = user?.role === "PSYCHOLOGIST" ? "/dashboard/psychologist" : "/dashboard/client";

  const [layananOpen, setLayananOpen] = useState(false);
  const [kontenOpen, setKontenOpen] = useState(false);

  return (
    <nav style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, color: "#1D4ED8", fontWeight: 800, fontSize: 22, textDecoration: "none", letterSpacing: "-0.5px", zIndex: 110 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'float-slow 4s ease-in-out infinite' }}>
            <path d="M16 28C16 28 3 20 3 11C3 6.5 6.5 3 11 3C13.8 3 15.2 4.5 16 5.5C16.8 4.5 18.2 3 21 3C25.5 3 29 6.5 29 11C29 20 16 28 16 28Z" fill="url(#logo-grad)" style={{ animation: 'heartbeat 3s ease-in-out infinite', transformOrigin: 'center' }} />
            <path d="M9 13C11 11 13 15 15 12C17 9 19 14 21 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="30" strokeDashoffset="30" style={{ animation: 'draw-path 2s ease-out forwards', animationDelay: '0.3s' }} />
            <defs>
              <linearGradient id="logo-grad" x1="3" y1="3" x2="29" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, letterSpacing: '-0.5px', fontSize: '1.4rem' }}>Batin</span>
        </Link>

        {/* Desktop Links (Hidden on Mobile) */}
        <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ position: "relative" }} onMouseEnter={() => setLayananOpen(true)} onMouseLeave={() => setLayananOpen(false)}>
            <button style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 4, color: active === "booking" ? "#1D4ED8" : "#2563EB", fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "24px 0" }}>
              Layanan <ChevronDown size={16} />
            </button>
            {layananOpen && (
              <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 0", minWidth: 200, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 50, marginTop: -8 }}>
                <Link href="/booking" style={{ display: "block", padding: "10px 20px", color: "#475569", fontSize: 14, textDecoration: "none" }}>Konseling Online</Link>
                <Link href="/booking" style={{ display: "block", padding: "10px 20px", color: "#475569", fontSize: 14, textDecoration: "none" }}>Konseling Offline</Link>
                <Link href="/booking" style={{ display: "block", padding: "10px 20px", color: "#475569", fontSize: 14, textDecoration: "none" }}>Batin for Kids</Link>
              </div>
            )}
          </div>

          <Link href="/psychologists" style={{ color: active === "psychologists" ? "#1D4ED8" : "#475569", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>List Psikolog</Link>
          <Link href="/about" style={{ color: "#475569", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Tentang Kami</Link>

          <div style={{ position: "relative" }} onMouseEnter={() => setKontenOpen(true)} onMouseLeave={() => setKontenOpen(false)}>
            <button style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 4, color: "#475569", fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "24px 0" }}>
              Konten Psikologi <ChevronDown size={16} />
            </button>
            {kontenOpen && (
              <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 0", minWidth: 160, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 50, marginTop: -8 }}>
                <Link href="/" style={{ display: "block", padding: "10px 20px", color: "#475569", fontSize: 14, textDecoration: "none" }}>Artikel Batin</Link>
                <Link href="/" style={{ display: "block", padding: "10px 20px", color: "#475569", fontSize: 14, textDecoration: "none" }}>Podcast #AngkatBicara</Link>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Actions (Hidden on Mobile) */}
        <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {!user ? (
            <Link href="/login" style={{ color: "#1D4ED8", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              Masuk / Daftar
            </Link>
          ) : (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                type="button"
                aria-expanded={dropdownOpen}
                style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              >
                <div className="user-avatar-small" style={{ overflow: "hidden" }}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    userInitial
                  )}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{user.fullName || user.email.split("@")[0]}</span>
                <ChevronDown size={14} color="#64748B" style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>
              {dropdownOpen && (
                <div className="user-dropdown" style={{ top: 40, right: 0 }}>
                  <div className="user-dropdown-header">
                    <strong>{user.fullName || "User"}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link className="user-dropdown-item" href={dashboardPath} onClick={() => setDropdownOpen(false)}>
                    <User size={16} /> Dashboard
                  </Link>
                  {user.role === "CLIENT" && (
                    <>
                      <Link className="user-dropdown-item" href="/dashboard/client/profile" onClick={() => setDropdownOpen(false)}>
                        <User size={16} /> Profil Saya
                      </Link>
                      <Link className="user-dropdown-item" href="/dashboard/client" onClick={() => setDropdownOpen(false)}>
                        <History size={16} /> Riwayat Sesi
                      </Link>
                    </>
                  )}
                  {user.role === "PSYCHOLOGIST" && (
                    <Link className="user-dropdown-item" href="/dashboard/psychologist/profile" onClick={() => setDropdownOpen(false)}>
                      <User size={16} /> Profil Terapis
                    </Link>
                  )}
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item logout" onClick={handleLogout} type="button">
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              )}
            </div>
          )}
          <Link href="/booking" style={{ backgroundColor: "#0044CC", color: "#FFFFFF", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-block", transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0033AA"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#0044CC"}>
            Konseling Sekarang
          </Link>
        </div>

        {/* Mobile Hamburger Button (Hidden on Desktop) */}
        <button
          className="mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: "none",
            border: "none",
            color: "#1E293B",
            cursor: "pointer",
            padding: 8,
            zIndex: 110,
            display: "none" /* Handled by CSS media query in globals.css */
          }}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Mobile Drawer Menu (Hidden on Desktop) */}
        {mobileMenuOpen && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            backgroundColor: "#FFFFFF",
            zIndex: 105,
            display: "flex",
            flexDirection: "column",
            padding: "80px 24px 40px 24px",
            boxSizing: "border-box",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            animation: "slideDown 0.3s ease-out"
          }}>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes slideDown {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
              }
            `}} />

            {/* Menu Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1, textAlign: "left" }}>
              <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Layanan Konseling</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 8 }}>
                  <Link href="/booking" onClick={() => setMobileMenuOpen(false)} style={{ color: "#1E293B", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>Konseling Online</Link>
                  <Link href="/booking" onClick={() => setMobileMenuOpen(false)} style={{ color: "#1E293B", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>Konseling Offline</Link>
                  <Link href="/booking" onClick={() => setMobileMenuOpen(false)} style={{ color: "#1E293B", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>Batin for Kids</Link>
                </div>
              </div>

              <Link href="/psychologists" onClick={() => setMobileMenuOpen(false)} style={{ color: "#1E293B", fontSize: 18, fontWeight: 700, textDecoration: "none", borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>List Psikolog</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} style={{ color: "#1E293B", fontSize: 18, fontWeight: 700, textDecoration: "none", borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>Tentang Kami</Link>

              <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Artikel & Konten</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 8 }}>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ color: "#1E293B", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>Artikel Batin</Link>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ color: "#1E293B", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>Podcast #AngkatBicara</Link>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {user ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 12, backgroundColor: "#F8FAFC" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#EFF6FF", color: "#2563EB", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14 }}>
                      {userInitial}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{user.fullName || user.email.split("@")[0]}</span>
                      <span style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase" }}>{user.role}</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Link href={dashboardPath} onClick={() => setMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", border: "1px solid #E2E8F0", borderRadius: 8, color: "#475569", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", backgroundColor: "#FEF2F2", border: "none", borderRadius: 8, color: "#EF4444", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                      <LogOut size={16} /> Keluar
                    </button>
                  </div>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "14px", border: "1px solid #CBD5E1", borderRadius: 8, color: "#1E293B", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                  Masuk / Daftar Akun
                </Link>
              )}
              <Link href="/booking" onClick={() => setMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "14px", backgroundColor: "#0044CC", borderRadius: 8, color: "#FFFFFF", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                Konseling Sekarang
              </Link>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}
