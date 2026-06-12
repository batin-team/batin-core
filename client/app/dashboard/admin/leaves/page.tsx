"use client";
import { useEffect, useState } from "react";
import { Check, X, Calendar, User, ShieldAlert, Sparkles, RefreshCw, Clock, CheckCircle } from "lucide-react";
import { AdminLayout } from "../../../../components/AdminLayout";
import { apiFetch } from "../../../../lib/api";

type LeaveRequest = {
  id: string;
  date: string;
  isApproved: boolean;
  psychologistId: string;
  psychologistName: string;
  psychologistEmail: string;
};

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"pending" | "approved">("pending");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  async function loadLeaves() {
    setLoading(true);
    setActionMessage("");
    setActionError("");
    try {
      const res = await apiFetch("/api/admin/leaves");
      setLeaves(res.data || []);
    } catch (e) {
      console.error("Failed to load leaves", e);
      setActionError("Gagal mengambil data pengajuan cuti.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleApprove = async (id: string, date: string, name: string) => {
    try {
      await apiFetch(`/api/admin/leaves/${id}/approve`, {
        method: "PATCH"
      });
      setActionMessage(`Cuti psikolog ${name} pada tanggal ${date} berhasil disetujui!`);
      await loadLeaves();
    } catch (e) {
      console.error(e);
      setActionError("Gagal menyetujui pengajuan cuti.");
    }
  };

  const handleReject = async (id: string, date: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menolak pengajuan cuti ${name} pada tanggal ${date}?`)) {
      return;
    }
    try {
      await apiFetch(`/api/admin/leaves/${id}`, {
        method: "DELETE"
      });
      setActionMessage(`Pengajuan cuti psikolog ${name} pada tanggal ${date} berhasil ditolak/dihapus.`);
      await loadLeaves();
    } catch (e) {
      console.error(e);
      setActionError("Gagal menolak/menghapus pengajuan cuti.");
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (activeFilter === "pending") return !leave.isApproved;
    return leave.isApproved;
  });

  return (
    <AdminLayout activeTab="leaves">
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Operasional</p>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>Persetujuan Cuti</h1>
        </div>
        <button
          onClick={loadLeaves}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            color: "#475569",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Action Status Messages */}
      {actionMessage && (
        <div style={{ backgroundColor: "#D1FAE5", color: "#065F46", padding: "14px 20px", borderRadius: 14, marginBottom: 24, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle size={18} />
          {actionMessage}
        </div>
      )}
      {actionError && (
        <div style={{ backgroundColor: "#FEE2E2", color: "#991B1B", padding: "14px 20px", borderRadius: 14, marginBottom: 24, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldAlert size={18} />
          {actionError}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", backgroundColor: "#E2E8F0", borderRadius: 12, padding: 4, width: "fit-content", marginBottom: 28 }}>
        <button
          onClick={() => setActiveFilter("pending")}
          style={{
            padding: "10px 24px",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            backgroundColor: activeFilter === "pending" ? "#FFFFFF" : "transparent",
            color: activeFilter === "pending" ? "#0F172A" : "#64748B",
            boxShadow: activeFilter === "pending" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Clock size={15} />
          Menunggu Persetujuan
          {leaves.filter(l => !l.isApproved).length > 0 && (
            <span style={{ backgroundColor: "#EF4444", color: "#FFFFFF", fontSize: 10, padding: "2px 6px", borderRadius: 10, marginLeft: 4 }}>
              {leaves.filter(l => !l.isApproved).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveFilter("approved")}
          style={{
            padding: "10px 24px",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            backgroundColor: activeFilter === "approved" ? "#FFFFFF" : "transparent",
            color: activeFilter === "approved" ? "#0F172A" : "#64748B",
            boxShadow: activeFilter === "approved" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Check size={15} />
          Disetujui
        </button>
      </div>

      {/* Table Card */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#94A3B8", fontSize: 14, fontWeight: 500 }}>
            Memuat pengajuan cuti...
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div style={{ padding: 64, textAlign: "center", color: "#94A3B8", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Calendar size={40} style={{ color: "#CBD5E1" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: "#475569" }}>Tidak Ada Pengajuan Cuti</div>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Semua pengajuan cuti telah diproses.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC" }}>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9" }}>Psikolog</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9" }}>Tanggal Cuti</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9" }}>Status</th>
                  {activeFilter === "pending" && (
                    <th style={{ padding: "14px 24px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9", width: 220 }}>Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave, index) => (
                  <tr
                    key={leave.id}
                    style={{
                      borderBottom: index < filteredLeaves.length - 1 ? "1px solid #F8FAFC" : "none",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* Psychologist Info */}
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "#EFF6FF", display: "grid", placeItems: "center", color: "#2563EB", fontWeight: 700 }}>
                          <User size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>{leave.psychologistName}</div>
                          <div style={{ fontSize: 12, color: "#64748B" }}>{leave.psychologistEmail}</div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 700, color: "#334155" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Calendar size={16} style={{ color: "#94A3B8" }} />
                        {new Date(leave.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: "16px 24px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          backgroundColor: leave.isApproved ? "#D1FAE5" : "#FEF3C7",
                          color: leave.isApproved ? "#065F46" : "#92400E",
                          padding: "5px 12px",
                          borderRadius: 8,
                          letterSpacing: 0.3
                        }}
                      >
                        {leave.isApproved ? "DISETUJUI" : "MENUNGGU PERSETUJUAN"}
                      </span>
                    </td>

                    {/* Action buttons */}
                    {activeFilter === "pending" && (
                      <td style={{ padding: "16px 24px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                          <button
                            onClick={() => handleApprove(leave.id, leave.date, leave.psychologistName)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#2563EB",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              transition: "background 0.2s"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1D4ED8")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
                          >
                            <Check size={14} /> Setujui
                          </button>
                          <button
                            onClick={() => handleReject(leave.id, leave.date, leave.psychologistName)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#FFFFFF",
                              color: "#EF4444",
                              border: "1px solid #FCA5A5",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#FEF2F2";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#FFFFFF";
                            }}
                          >
                            <X size={14} /> Tolak
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
