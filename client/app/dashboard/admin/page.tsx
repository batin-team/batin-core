"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserCog, Calendar, DollarSign, AlertTriangle, ArrowUpRight, TrendingUp } from "lucide-react";
import { AdminLayout } from "../../../components/AdminLayout";
import { apiFetch } from "../../../lib/api";
import { formatCurrency } from "@mindbridge/shared";

type Stats = {
  totalUsers: number;
  totalPsychologists: number;
  totalSessions: number;
  totalRevenue: number;
  pendingVerification: number;
};

type RecentSession = {
  id: string;
  clientName: string;
  psychologistName: string;
  status: string;
  amount: number;
  scheduledAt: string;
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  CONFIRMED: { bg: "#DBEAFE", color: "#1D4ED8", label: "CONFIRMED" },
  PENDING_PAYMENT: { bg: "#FEF3C7", color: "#92400E", label: "PENDING_PAYMENT" },
  COMPLETED: { bg: "#D1FAE5", color: "#065F46", label: "COMPLETED" },
  CANCELLED: { bg: "#FEE2E2", color: "#991B1B", label: "CANCELLED" },
  IN_PROGRESS: { bg: "#F3E8FF", color: "#6B21A8", label: "IN_PROGRESS" },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          apiFetch("/api/admin/stats"),
          apiFetch("/api/admin/sessions/recent?limit=8")
        ]);
        setStats(statsRes.data);
        setRecentSessions(sessionsRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STAT_CARDS = [
    {
      label: "Total User",
      value: loading ? (
        <div className="skeleton-pulse" style={{ height: 26, width: 60, backgroundColor: "#E2E8F0", borderRadius: 4, marginTop: 4 }} />
      ) : (
        stats?.totalUsers ?? "—"
      ),
      icon: Users,
      bg: "#EFF6FF",
      color: "#2563EB",
      suffix: ""
    },
    {
      label: "Psikolog",
      value: loading ? (
        <div className="skeleton-pulse" style={{ height: 26, width: 60, backgroundColor: "#E2E8F0", borderRadius: 4, marginTop: 4 }} />
      ) : (
        stats?.totalPsychologists ?? "—"
      ),
      icon: UserCog,
      bg: "#F0FDF4",
      color: "#16A34A",
      suffix: ""
    },
    {
      label: "Sesi",
      value: loading ? (
        <div className="skeleton-pulse" style={{ height: 26, width: 60, backgroundColor: "#E2E8F0", borderRadius: 4, marginTop: 4 }} />
      ) : (
        stats?.totalSessions ?? "—"
      ),
      icon: Calendar,
      bg: "#FFF7ED",
      color: "#EA580C",
      suffix: ""
    },
    {
      label: "Revenue",
      value: loading ? (
        <div className="skeleton-pulse" style={{ height: 26, width: 120, backgroundColor: "#E2E8F0", borderRadius: 4, marginTop: 4 }} />
      ) : (
        stats ? formatCurrency(stats.totalRevenue) : "—"
      ),
      icon: DollarSign,
      bg: "#FFF1F2",
      color: "#E11D48",
      suffix: ""
    },
  ];

  return (
    <AdminLayout activeTab="dashboard">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .4; }
          }
          .skeleton-pulse {
            animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `
      }} />
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Overview</p>
        <h1 style={{ fontSize: 34, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>Dashboard Admin</h1>
      </div>

      {/* Pending Verification Alert */}
      {stats && stats.pendingVerification > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between",
          backgroundColor: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 14,
          padding: "14px 24px", marginBottom: 32
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AlertTriangle size={18} style={{ color: "#D97706", flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#92400E" }}>Verifikasi tertunda</span>
              <span style={{ fontSize: 14, color: "#92400E" }}>
                {" "}— Ada {stats.pendingVerification} psikolog menunggu review.
              </span>
            </div>
          </div>
          <Link
            href="/dashboard/admin/psychologists"
            style={{ fontSize: 13, fontWeight: 700, color: "#D97706", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
          >
            Lihat daftar <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 20, marginBottom: 40 }}>
        {STAT_CARDS.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: "24px 28px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", marginTop: 2, letterSpacing: "-0.5px" }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Sessions Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TrendingUp size={18} style={{ color: "#2563EB" }} />
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", margin: 0 }}>Sesi Terbaru</h2>
          </div>
          <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>
            {loading ? "Memuat..." : `${recentSessions.length} sesi`}
          </span>
        </div>

        {loading ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC" }}>
                  {["Order", "Client", "Psikolog", "Tanggal", "Status", "Nilai"].map((h) => (
                    <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F8FAFC" }}>
                    <td style={{ padding: "14px 24px" }}>
                      <div className="skeleton-pulse" style={{ height: 16, width: 120, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <div className="skeleton-pulse" style={{ height: 16, width: 100, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <div className="skeleton-pulse" style={{ height: 16, width: 100, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <div className="skeleton-pulse" style={{ height: 16, width: 80, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <div className="skeleton-pulse" style={{ height: 20, width: 80, backgroundColor: "#E2E8F0", borderRadius: 6 }} />
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <div className="skeleton-pulse" style={{ height: 16, width: 80, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : recentSessions.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>Belum ada sesi.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC" }}>
                  {["Order", "Client", "Psikolog", "Tanggal", "Status", "Nilai"].map((h) => (
                    <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s, i) => {
                  const st = STATUS_STYLE[s.status] || { bg: "#F1F5F9", color: "#475569", label: s.status };
                  const orderId = `MB-${s.scheduledAt.slice(0, 10).replace(/-/g, "")}-${s.id.split("-")[0].toUpperCase()}`;
                  return (
                    <tr
                      key={s.id}
                      style={{ borderBottom: i < recentSessions.length - 1 ? "1px solid #F8FAFC" : "none", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "14px 24px", fontSize: 13, fontWeight: 700, color: "#2563EB", fontFamily: "monospace" }}>
                        {orderId}
                      </td>
                      <td style={{ padding: "14px 24px", fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{s.clientName}</td>
                      <td style={{ padding: "14px 24px", fontSize: 14, color: "#475569" }}>{s.psychologistName}</td>
                      <td style={{ padding: "14px 24px", fontSize: 13, color: "#64748B" }}>
                        {new Date(s.scheduledAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 24px" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, backgroundColor: st.bg, color: st.color, padding: "4px 10px", borderRadius: 6, letterSpacing: 0.3 }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 24px", fontSize: 14, fontWeight: 700, color: "#0F172A", textAlign: "right" }}>
                        {formatCurrency(s.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
