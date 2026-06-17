"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Download, ReceiptText, Video } from "lucide-react";
import { formatCurrency, type Session } from "@mindbridge/shared";

type StoredSession = Session & {
  clientName?: string;
  psychologistName?: string;
  psychologistTitle?: string;
  psychologistAvatar?: string;
  assignmentMethod?: "AUTO_ASSIGN" | "SELF_SELECT";
};

import { apiFetch } from "../../../lib/api";

export function ClientSessions() {
  const [items, setItems] = useState<StoredSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "UPCOMING" | "COMPLETED">("ALL");

  const getTabStyle = (tab: "ALL" | "UPCOMING" | "COMPLETED") => {
    const isActive = activeTab === tab;
    return {
      paddingBottom: 16,
      borderBottom: isActive ? "2px solid #2563EB" : "2px solid transparent",
      marginBottom: -2,
      background: "none",
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none",
      color: isActive ? "#2563EB" : "#64748B",
      fontWeight: isActive ? 700 : 600,
      fontSize: 15,
      cursor: "pointer",
      outline: "none"
    };
  };

  useEffect(() => {
    async function loadSessions() {
      try {
        const rawUser = localStorage.getItem("mindbridge_user");
        let clientId = "";
        if (rawUser) {
          try {
            clientId = JSON.parse(rawUser).id;
          } catch (e) { }
        }
        const res = await apiFetch(`/api/client/sessions?clientId=${clientId}`);
        setItems(res.data || []);
      } catch (e) {
        console.error("Failed to load PostgreSQL sessions list", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSessions();
  }, []);

  if (isLoading) {
    return (
      <>
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
        <div className="section-heading">
          <div className="skeleton-pulse" style={{ height: 16, width: 150, backgroundColor: "#E2E8F0", borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton-pulse" style={{ height: 36, width: 300, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
          <div className="skeleton-pulse" style={{ height: 16, width: 450, backgroundColor: "#E2E8F0", borderRadius: 4, marginTop: 8 }} />
        </div>

        <div style={{ display: "flex", gap: 32, borderBottom: "2px solid #E2E8F0", marginBottom: 32, paddingBottom: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-pulse" style={{ height: 20, width: 80, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
          ))}
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
          {[1, 2, 3].map(i => (
            <article
              key={i}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                border: "1px solid #E2E8F0",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="skeleton-pulse" style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#E2E8F0", flexShrink: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <div className="skeleton-pulse" style={{ height: 18, width: "70%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                  <div className="skeleton-pulse" style={{ height: 14, width: "50%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                </div>
              </div>

              <div className="skeleton-pulse" style={{ height: 24, width: 100, backgroundColor: "#E2E8F0", borderRadius: 8 }} />

              <div style={{ backgroundColor: "#F8FAFC", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {[1, 2, 3].map(idx => (
                  <div key={idx} className="skeleton-pulse" style={{ height: 14, width: "80%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: "auto" }}>
                <div className="skeleton-pulse" style={{ height: 40, backgroundColor: "#E2E8F0", borderRadius: 10 }} />
                <div className="skeleton-pulse" style={{ height: 40, backgroundColor: "#E2E8F0", borderRadius: 10 }} />
              </div>
            </article>
          ))}
        </section>
      </>
    );
  }


  return (
    <>
      <div className="section-heading">
        <span className="eyebrow" style={{ color: "#2563EB", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontSize: 13, marginBottom: 8, display: "block" }}>DASHBOARD CLIENT</span>
        <h1 style={{ fontSize: 36, color: "#0F172A", fontWeight: 800, letterSpacing: "-0.5px" }}>Riwayat Konseling</h1>
        <p style={{ color: "#64748B", fontSize: 16, marginTop: 8 }}>Booking baru dari flow register, login, dan pembayaran akan muncul di sini.</p>
      </div>

      <div style={{ display: "flex", gap: 32, borderBottom: "2px solid #E2E8F0", marginBottom: 32 }}>
        <button onClick={() => setActiveTab("ALL")} style={getTabStyle("ALL")}>Semua</button>
        <button onClick={() => setActiveTab("UPCOMING")} style={getTabStyle("UPCOMING")}>Mendatang</button>
        <button onClick={() => setActiveTab("COMPLETED")} style={getTabStyle("COMPLETED")}>Selesai</button>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
        {items.filter(item => {
          if (activeTab === "ALL") return true;
          if (activeTab === "UPCOMING") return item.status !== "COMPLETED" && item.status !== "CANCELLED";
          if (activeTab === "COMPLETED") return item.status === "COMPLETED";
          return true;
        }).length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", color: "#64748B" }}>
            <p style={{ fontSize: 16, fontWeight: 500 }}>Tidak ada riwayat konseling pada kategori ini.</p>
          </div>
        ) : (
          items.filter(item => {
            if (activeTab === "ALL") return true;
            if (activeTab === "UPCOMING") return item.status !== "COMPLETED" && item.status !== "CANCELLED";
            if (activeTab === "COMPLETED") return item.status === "COMPLETED";
            return true;
          }).map((session) => {
            const isConfirmed = session.status === "CONFIRMED";
            return (
              <article
                key={session.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  border: "1px solid #E2E8F0",
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", backgroundColor: "#F1F5F9", flexShrink: 0 }}>
                    {session.psychologistAvatar ? (
                      <img alt={session.psychologistName} src={session.psychologistAvatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>?</div>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{session.psychologistName}</h3>
                    <p style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>{session.clientName ? `Untuk ${session.clientName}` : session.psychologistTitle}</p>
                  </div>
                </div>

                <div style={{
                  alignSelf: "flex-start",
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  backgroundColor: isConfirmed ? "#D1FAE5" : "#FEF3C7",
                  color: isConfirmed ? "#059669" : "#D97706"
                }}>
                  {session.status}
                </div>

                <div style={{ backgroundColor: "#F8FAFC", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#475569", fontSize: 14, fontWeight: 500 }}>
                    <CalendarDays size={18} color="#94A3B8" /> {new Date(session.scheduledAt).toLocaleDateString("id-ID", { dateStyle: "long" })}, {(session as any).timeRange || new Date(session.scheduledAt).toLocaleTimeString("id-ID", { timeStyle: "short" })} WIB
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#475569", fontSize: 14, fontWeight: 500 }}>
                    <Video size={18} color="#94A3B8" /> {session.sessionType}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#0F172A", fontSize: 15, fontWeight: 700 }}>
                    <ReceiptText size={18} color="#94A3B8" /> {formatCurrency(session.amount)}
                  </div>
                  {session.assignmentMethod && (
                    <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4, fontStyle: "italic" }}>
                      Tipe Assignment: {session.assignmentMethod === "AUTO_ASSIGN" ? "Auto" : "Manual"}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: "auto" }}>
                  <Link
                    href={`/dashboard/client/${session.id}`}
                    style={{
                      backgroundColor: "#2563EB", color: "#FFFFFF", padding: "12px 0", textAlign: "center", borderRadius: 10, fontSize: 14, fontWeight: 600, display: "block"
                    }}
                  >
                    Detail
                  </Link>
                  <Link
                    href="/receipt"
                    style={{
                      backgroundColor: "#FFFFFF", color: "#2563EB", border: "1px solid #2563EB", padding: "12px 0", textAlign: "center", borderRadius: 10, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                    }}
                  >
                    <Download size={16} /> PDF
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </section>
    </>
  );
}
