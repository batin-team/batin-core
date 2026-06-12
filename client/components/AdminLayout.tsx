"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, UserCog, LogOut, Bell, HeartHandshake, ShieldCheck, Calendar, Menu } from "lucide-react";

type AdminLayoutProps = {
  children: React.ReactNode;
  activeTab: "dashboard" | "psychologists" | "clients" | "leaves";
};

type UserData = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

const NAV_ITEMS = [
  { tab: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/admin" },
  { tab: "psychologists" as const, label: "Kelola Terapis", icon: UserCog, href: "/dashboard/admin/psychologists" },
  { tab: "clients" as const, label: "Kelola Pasien", icon: Users, href: "/dashboard/admin/clients" },
  { tab: "leaves" as const, label: "Persetujuan Cuti", icon: Calendar, href: "/dashboard/admin/leaves" },
];

export function AdminLayout({ children, activeTab }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("mindbridge_user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as UserData;
        if (parsed.role !== "ADMIN") {
          router.replace("/login");
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

  const name = user?.fullName || "Admin";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="dashboard-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside 
        className={`dashboard-aside ${menuOpen ? "open" : ""}`}
        style={{ width: 260, backgroundColor: "#0F172A", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}
      >
        {/* Brand */}
        <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, color: "#FFFFFF", fontWeight: 800, fontSize: 20, textDecoration: "none", letterSpacing: "-0.5px" }}>
            <HeartHandshake size={26} style={{ color: "#60A5FA" }} />
            Batin
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, backgroundColor: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "5px 10px", width: "fit-content" }}>
            <ShieldCheck size={13} style={{ color: "#F87171" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#FCA5A5", letterSpacing: 0.5 }}>PANEL ADMIN</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV_ITEMS.map(({ tab, label, icon: Icon, href }) => {
            const isActive = activeTab === tab;
            return (
              <Link 
                key={tab} 
                href={href} 
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
                  borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none",
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  backgroundColor: isActive ? "#2563EB" : "transparent",
                  transition: "all 0.2s"
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, backgroundColor: "rgba(255,255,255,0.04)", marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: "#EF4444", color: "#FFFFFF", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
              {initial}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#F87171", background: "none", border: "none", width: "100%", cursor: "pointer" }}
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Bar */}
        <header className="dashboard-topbar" style={{ height: 68, backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", flexShrink: 0, position: "sticky", top: 0, zIndex: 90 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Hamburger Button for Mobile */}
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
              <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Admin</span>
              <span style={{ fontSize: 15, color: "#0F172A", fontWeight: 800 }}>Operasional Batin</span>
            </div>
          </div>
          <button style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", position: "relative" }}>
            <Bell size={20} />
          </button>
        </header>

        {/* Content */}
        <main className="dashboard-main-content" style={{ flex: 1, overflowY: "auto", padding: "40px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
