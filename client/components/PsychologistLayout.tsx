"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CalendarDays, LogOut, Bell, HeartHandshake, User, Menu } from "lucide-react";

type PsychologistLayoutProps = {
  children: React.ReactNode;
  activeTab: "dashboard" | "schedule" | "attendance" | "notes" | "profile";
};

type UserData = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

export function PsychologistLayout({ children, activeTab }: PsychologistLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("mindbridge_user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as UserData;
        if (parsed.role !== "PSYCHOLOGIST") {
          router.replace("/dashboard/client");
        } else {
          setUser(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      router.replace("/login?next=" + encodeURIComponent(pathname));
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("mindbridge_user");
    router.push("/");
    router.refresh();
  };

  const name = user?.fullName || "Psikolog";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="dashboard-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar Menu */}
      <aside 
        className={`dashboard-aside ${menuOpen ? "open" : ""}`}
        style={{ width: 260, backgroundColor: "#FFFFFF", borderRight: "1px solid #E2E8F0", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}
      >
        {/* Brand Logo */}
        <div style={{ padding: "24px 32px", borderBottom: "1px solid #F1F5F9" }}>
          <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 8, color: "#1D4ED8", fontWeight: 800, fontSize: 20, textDecoration: "none", letterSpacing: "-0.5px" }}>
            <HeartHandshake size={24} />
            Batin
          </Link>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <Link
            href="/dashboard/psychologist"
            onClick={() => setMenuOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              color: activeTab === "dashboard" ? "#FFFFFF" : "#64748B",
              backgroundColor: activeTab === "dashboard" ? "#2563EB" : "transparent",
              transition: "all 0.2s"
            }}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            href="/dashboard/psychologist/schedule"
            onClick={() => setMenuOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              color: activeTab === "schedule" ? "#FFFFFF" : "#64748B",
              backgroundColor: activeTab === "schedule" ? "#2563EB" : "transparent",
              transition: "all 0.2s"
            }}
          >
            <CalendarDays size={18} />
            Jadwal & Ketersediaan
          </Link>

          <Link
            href="/dashboard/psychologist/profile"
            onClick={() => setMenuOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              color: activeTab === "profile" ? "#FFFFFF" : "#64748B",
              backgroundColor: activeTab === "profile" ? "#2563EB" : "transparent",
              transition: "all 0.2s"
            }}
          >
            <User size={18} />
            Pengaturan Profil
          </Link>
        </nav>

        {/* Logout Button */}
        <div style={{ padding: "24px 16px", borderTop: "1px solid #F1F5F9" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              color: "#EF4444",
              background: "none",
              border: "none",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header Bar */}
        <header className="dashboard-topbar" style={{ height: 72, backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", flexShrink: 0, position: "sticky", top: 0, zIndex: 90 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Hamburger Menu Toggle */}
            <button
              className="mobile-only"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "none",
                border: "none",
                color: "#64748B",
                cursor: "pointer",
                padding: 6,
                display: "none", /* Handled by globals.css */
                alignItems: "center"
              }}
            >
              <Menu size={24} />
            </button>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Portal Terapis</span>
              <span style={{ fontSize: 16, color: "#0F172A", fontWeight: 800 }}>Batin</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <button style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
              <Bell size={20} />
            </button>

            {/* Active Status Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#D1FAE5", color: "#059669", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10B981" }} />
              Aktif
            </div>

            {/* Profile Info */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }} className="desktop-only">
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{name}</span>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>Psikolog Klinis</span>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#EFF6FF", color: "#2563EB", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, border: "2px solid #DBEAFE" }}>
                {initial}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Body Content */}
        <main className="dashboard-main-content" style={{ flex: 1, overflowY: "auto", padding: "40px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
