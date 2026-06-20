"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, ShieldAlert, Sparkles, CheckCircle } from "lucide-react";
import { PsychologistLayout } from "../../../../components/PsychologistLayout";
import { apiFetch } from "../../../../lib/api";
import { formatSlot } from "@mindbridge/shared";

type PreviewSlot = {
  slotKey: string;
  status: "AVAILABLE" | "BOOKED";
  clientName?: string;
  sessionId?: string;
};

const DAYS = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
  { value: 7, label: "Minggu" }
];

type ServiceMode = "ONLINE" | "OFFLINE" | "BOTH";

const MODES: { value: ServiceMode; label: string }[] = [
  { value: "BOTH", label: "Online & Offline" },
  { value: "ONLINE", label: "Online" },
  { value: "OFFLINE", label: "Offline" }
];

const MODE_BADGE: Record<ServiceMode, { label: string; bg: string; color: string }> = {
  ONLINE: { label: "Online", bg: "#DBEAFE", color: "#1D4ED8" },
  OFFLINE: { label: "Offline", bg: "#FEF3C7", color: "#92400E" },
  BOTH: { label: "Online & Offline", bg: "#D1FAE5", color: "#065F46" }
};

type Slot = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  serviceMode: ServiceMode;
};

type ActiveTab = "weekly" | "override" | "preview";

export default function SchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("weekly");
  const [loading, setLoading] = useState(true);

  // Weekly Form State
  const [selectedDay, setSelectedDay] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [selectedMode, setSelectedMode] = useState<ServiceMode>("BOTH");
  const [showAddForm, setShowAddForm] = useState(false);

  // Override Form State
  const [blockDate, setBlockDate] = useState("");
  const [blockMessage, setBlockMessage] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);

  // Leaves state
  const [leaves, setLeaves] = useState<{ id: string; date: string; isApproved: boolean }[]>([]);

  // Preview State
  const [previewSlots, setPreviewSlots] = useState<PreviewSlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadSlots() {
    try {
      const res = await apiFetch("/api/psychologist/slots");
      setSlots(res.data || []);
    } catch (e) {
      console.error("Failed to load slots", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadPreview() {
    setLoadingPreview(true);
    try {
      const res = await apiFetch("/api/psychologist/profile");
      if (res && res.data) {
        setPreviewSlots(res.data.slotsWithStatus || []);
        setBlockedDates(res.data.blockedDates || []);
        setLeaves(res.data.leaves || []);
      }
    } catch (e) {
      console.error("Failed to load preview slots", e);
    } finally {
      setLoadingPreview(false);
    }
  }

  useEffect(() => {
    loadSlots();
    loadPreview();
  }, []);

  useEffect(() => {
    if (activeTab === "preview" || activeTab === "override") {
      loadPreview();
    }
  }, [activeTab]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      await apiFetch("/api/psychologist/slots", {
        method: "POST",
        body: JSON.stringify({
          dayOfWeek: Number(selectedDay),
          startTime,
          endTime,
          serviceMode: selectedMode
        })
      });
      setMessage("Slot mingguan baru berhasil disimpan!");
      setShowAddForm(false);
      await loadSlots();
    } catch (err: any) {
      console.error(err);
      setMessage("Gagal menyimpan slot mingguan: " + (err.message || String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await apiFetch(`/api/psychologist/slots/${id}`, {
        method: "DELETE"
      });
      setMessage("Slot ketersediaan berhasil dihapus!");
      await loadSlots();
    } catch (err: any) {
      console.error(err);
      setMessage("Gagal menghapus slot: " + (err.message || String(err)));
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) return;
    setIsBlocking(true);
    setBlockMessage("");
    try {
      await apiFetch("/api/psychologist/slots/block", {
        method: "POST",
        body: JSON.stringify({
          date: blockDate
        })
      });
      setBlockMessage(`Pengajuan cuti/libur untuk tanggal ${blockDate} berhasil dikirim dan menunggu persetujuan admin.`);
      setBlockDate("");
      await loadPreview();
    } catch (err: any) {
      console.error(err);
      setBlockMessage("Gagal memblokir tanggal: " + (err.message || String(err)));
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <PsychologistLayout activeTab="schedule">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Manajemen Jadwal</h1>
          <p style={{ color: "#64748B", fontSize: 15, fontWeight: 500 }}>Kelola jadwal mingguan dan pengecualian jadwal Anda</p>
        </div>

        {activeTab === "weekly" && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(37,99,235,0.2)"
            }}
          >
            <Plus size={16} />
            Tambah Slot Baru
          </button>
        )}
      </div>

      {/* Segmented Tab Controls matching Mockup */}
      <div style={{ display: "flex", backgroundColor: "#F1F5F9", borderRadius: 12, padding: 4, width: "fit-content", marginBottom: 32 }}>
        <button
          onClick={() => { setActiveTab("weekly"); setMessage(""); }}
          style={{
            padding: "10px 24px",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            backgroundColor: activeTab === "weekly" ? "#FFFFFF" : "transparent",
            color: activeTab === "weekly" ? "#0F172A" : "#64748B",
            boxShadow: activeTab === "weekly" ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
          }}
        >
          Jadwal Mingguan
        </button>
        <button
          onClick={() => { setActiveTab("override"); setMessage(""); }}
          style={{
            padding: "10px 24px",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            backgroundColor: activeTab === "override" ? "#FFFFFF" : "transparent",
            color: activeTab === "override" ? "#0F172A" : "#64748B",
            boxShadow: activeTab === "override" ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
          }}
        >
          Override / Cuti
        </button>
        <button
          onClick={() => { setActiveTab("preview"); setMessage(""); }}
          style={{
            padding: "10px 24px",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            backgroundColor: activeTab === "preview" ? "#FFFFFF" : "transparent",
            color: activeTab === "preview" ? "#0F172A" : "#64748B",
            boxShadow: activeTab === "preview" ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
          }}
        >
          Ketersediaan Aktif
        </button>
      </div>

      {message && (
        <div style={{ 
          backgroundColor: message.includes("Gagal") ? "#FEE2E2" : "#D1FAE5", 
          color: message.includes("Gagal") ? "#DC2626" : "#059669", 
          padding: "12px 16px", 
          borderRadius: 12, 
          marginBottom: 24, 
          fontSize: 14, 
          fontWeight: 700, 
          display: "flex", 
          alignItems: "center", 
          gap: 8 
        }}>
          {message.includes("Gagal") ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
          {message}
        </div>
      )}

      {/* Tab 1: Jadwal Mingguan */}
      {activeTab === "weekly" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {showAddForm && (
            <form onSubmit={handleAddSlot} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24, display: "grid", gap: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: 0 }}>Buat Slot Baru</h3>
              <div className="add-slot-form-grid">
                <div className="field">
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Hari</label>
                  <select className="select" value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))} style={{ borderRadius: 8 }}>
                    {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Mulai</label>
                  <input className="input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ borderRadius: 8 }} />
                </div>
                <div className="field">
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Selesai</label>
                  <input className="input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ borderRadius: 8 }} />
                </div>
                <div className="field">
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Mode Konseling</label>
                  <select className="select" value={selectedMode} onChange={(e) => setSelectedMode(e.target.value as ServiceMode)} style={{ borderRadius: 8 }}>
                    {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowAddForm(false)} className="button button-secondary" style={{ borderRadius: 8, minHeight: 38, fontSize: 13 }}>Batal</button>
                <button type="submit" className="button button-primary" disabled={isSaving} style={{ borderRadius: 8, minHeight: 38, fontSize: 13, backgroundColor: "#2563EB" }}>
                  {isSaving ? "Menyimpan..." : "Tambah Slot"}
                </button>
              </div>
            </form>
          )}

          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", fontSize: 13, color: "#64748B", fontWeight: 700 }}>
              Jadwal mingguan adalah template berulang setiap minggu. Gunakan Override untuk pengecualian.
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {DAYS.map((day) => {
                const daySlots = slots.filter((s) => s.dayOfWeek === day.value);
                return (
                  <div key={day.value} className="weekly-day-row">
                    <strong style={{ fontSize: 15, color: "#1E293B", paddingTop: 8 }}>{day.label}</strong>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {daySlots.length === 0 ? (
                        <span style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic", paddingTop: 8 }}>Tidak ada jadwal</span>
                      ) : (
                        daySlots.map((slot) => (
                          <div key={slot.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", width: "fit-content" }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{slot.startTime}</span>
                              <span style={{ color: "#94A3B8" }}>-</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{slot.endTime}</span>
                            </div>
                            {(() => {
                              const badge = MODE_BADGE[slot.serviceMode] || MODE_BADGE.BOTH;
                              return (
                                <span style={{ fontSize: 11, fontWeight: 800, backgroundColor: badge.bg, color: badge.color, padding: "4px 10px", borderRadius: 6, whiteSpace: "nowrap" }}>
                                  {badge.label}
                                </span>
                              );
                            })()}
                            <button
                              type="button"
                              onClick={() => handleDeleteSlot(slot.id)}
                              style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", padding: 6, borderRadius: 6, transition: "background 0.2s" }}
                              title="Hapus slot"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMessage("Semua template jadwal mingguan berhasil disimpan!")}
            className="button button-primary"
            style={{ alignSelf: "flex-start", borderRadius: 8, minHeight: 44, padding: "0 24px", backgroundColor: "#2563EB", fontWeight: 700 }}
          >
            Simpan Semua Jadwal
          </button>
        </div>
      )}

      {/* Tab 2: Override / Cuti */}
      {activeTab === "override" && (
        <div className="profile-settings-grid">
          <form onSubmit={handleAddBlock} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 32, display: "flex", flexDirection: "column", gap: 20, height: "fit-content" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>Ajukan Override / Libur</h2>
            <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Pilih tanggal spesifik untuk menonaktifkan seluruh slot ketersediaan template mingguan Anda (misal untuk cuti atau liburan).</p>

            {blockMessage && (
              <div style={{ 
                backgroundColor: blockMessage.includes("Gagal") ? "#FEE2E2" : "#EFF6FF", 
                color: blockMessage.includes("Gagal") ? "#DC2626" : "#2563EB", 
                padding: "10px 14px", 
                borderRadius: 8, 
                fontSize: 13, 
                fontWeight: 700, 
                display: "flex", 
                alignItems: "center", 
                gap: 8 
              }}>
                {blockMessage.includes("Gagal") ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
                {blockMessage}
              </div>
            )}

            <div className="field">
              <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Pilih Tanggal</label>
              <input
                className="input"
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                required
                style={{ borderRadius: 8 }}
              />
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={isBlocking}
              style={{ borderRadius: 8, minHeight: 44, backgroundColor: "#EF4444" }}
            >
              <ShieldAlert size={18} />
              {isBlocking ? "Memproses..." : "Ajukan Cuti / Libur"}
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 16 }}>Daftar Pengajuan Cuti / Override</h2>

              {loadingPreview ? (
                <p style={{ color: "#64748B", fontSize: 14 }}>Memuat daftar cuti...</p>
              ) : leaves.length === 0 ? (
                <p style={{ color: "#94A3B8", fontSize: 14, fontStyle: "italic" }}>Belum ada pengajuan cuti.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 220, overflowY: "auto" }}>
                  {leaves.map((leave) => (
                    <div key={leave.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#1E293B" }}>
                        <Calendar size={16} style={{ color: "#64748B" }} />
                        {new Date(leave.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        backgroundColor: leave.isApproved ? "#D1FAE5" : "#FEF3C7",
                        color: leave.isApproved ? "#065F46" : "#92400E",
                        padding: "4px 10px",
                        borderRadius: 6
                      }}>
                        {leave.isApproved ? "Disetujui" : "Menunggu Persetujuan"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Penting Untuk Diketahui</h2>
              <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12, color: "#475569", fontSize: 14, lineHeight: 1.5 }}>
                <li><strong>Prioritas Override</strong>: Blokir tanggal akan membatasi sistem auto assign agar tidak mencocokkan jadwal client ke Anda di hari tersebut.</li>
                <li><strong>Sesi Terjadwal</strong>: Menambahkan cuti tidak membatalkan sesi konseling yang sudah terlanjur dipesan / dibayar oleh client. Hubungi admin jika membutuhkan pembatalan manual.</li>
                <li><strong>Jam Blokir</strong>: Saat ini memblokir tanggal akan memblokir penuh satu hari penuh dari jam 00:00 s.d. 23:59.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Ketersediaan Aktif */}
      {activeTab === "preview" && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>Daftar Ketersediaan & Kalender Aktif</h2>
              <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Kelola cuti, lihat status ketersediaan harian, dan pantau booking dalam bentuk kalender terpadu.</p>
            </div>
            <button onClick={loadPreview} style={{ background: "none", border: "none", color: "#2563EB", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Refresh
            </button>
          </div>

          {loadingPreview ? (
            <p style={{ color: "#64748B" }}>Menghitung dan memuat data ketersediaan...</p>
          ) : (
            <div className="profile-settings-grid">
              {/* Calendar Column */}
              <div style={{ border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, backgroundColor: "#F8FAFC" }}>
                {/* Calendar Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <button
                    onClick={() => {
                      setCurrentMonth(prev => {
                        const next = new Date(prev);
                        next.setMonth(next.getMonth() - 1);
                        return next;
                      });
                    }}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", color: "#475569", fontWeight: 700, cursor: "pointer" }}
                  >
                    ‹ Prev
                  </button>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", textTransform: "capitalize" }}>
                    {currentMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentMonth(prev => {
                        const next = new Date(prev);
                        next.setMonth(next.getMonth() + 1);
                        return next;
                      });
                    }}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", color: "#475569", fontWeight: 700, cursor: "pointer" }}
                  >
                    Next ›
                  </button>
                </div>

                {/* Day of Week Headers */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, textAlign: "center", marginBottom: 8 }}>
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(h => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Grid Cells */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                  {(() => {
                    const year = currentMonth.getFullYear();
                    const month = currentMonth.getMonth();
                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    const totalDays = lastDay.getDate();
                    const startDay = firstDay.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
                    const emptyCells = startDay === 0 ? 6 : startDay - 1;

                    const dayCells = [];
                    for (let i = 0; i < emptyCells; i++) {
                      dayCells.push(<div key={`empty-${i}`} />);
                    }

                    for (let d = 1; d <= totalDays; d++) {
                      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                      const isBlocked = blockedDates.includes(dateStr);
                      const daySlots = previewSlots.filter(s => s.slotKey.startsWith(dateStr));
                      const hasSlots = daySlots.length > 0;
                      const hasBooked = daySlots.some(s => s.status === "BOOKED");
                      const isSelected = selectedDateStr === dateStr;

                      // Decide styles
                      let bg = "#FFFFFF";
                      let border = "1px solid #E2E8F0";
                      let textColor = "#0F172A";

                      if (isSelected) {
                        bg = "#EDE9FE";
                        border = "2px solid #7C3AED";
                        textColor = "#5B21B6";
                      } else if (isBlocked) {
                        bg = "#FEE2E2";
                        border = "1px solid #FCA5A5";
                        textColor = "#991B1B";
                      }

                      dayCells.push(
                        <button
                          key={`day-${d}`}
                          onClick={() => setSelectedDateStr(dateStr)}
                          style={{
                            aspectRatio: "1/1",
                            borderRadius: 10,
                            backgroundColor: bg,
                            border,
                            color: textColor,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 6,
                            transition: "all 0.15s"
                          }}
                        >
                          <span style={{ alignSelf: "flex-start" }}>{d}</span>
                          {/* Indicator dots */}
                          <div style={{ display: "flex", gap: 3, marginBottom: 2 }}>
                            {isBlocked && (
                              <span style={{ fontSize: 9, fontWeight: 800, color: "#EF4444" }}>Cuti</span>
                            )}
                            {!isBlocked && hasBooked && (
                              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#7E22CE" }} title="Ada booking client" />
                            )}
                            {!isBlocked && hasSlots && !hasBooked && (
                              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10B981" }} title="Slot tersedia" />
                            )}
                          </div>
                        </button>
                      );
                    }
                    return dayCells;
                  })()}
                </div>
              </div>

              {/* Day Slots Detail Column */}
              <div style={{ border: "1px solid #E2E8F0", borderRadius: 16, padding: 24, backgroundColor: "#FFFFFF", minHeight: 320 }}>
                <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 16, marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>Detail Harian</span>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "4px 0 0 0" }}>
                    {new Date(selectedDateStr).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </h3>
                </div>

                {(() => {
                  const daySlots = previewSlots.filter(s => s.slotKey.startsWith(selectedDateStr));
                  const isBlocked = blockedDates.includes(selectedDateStr);

                  if (isBlocked) {
                    return (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", textAlign: "center", gap: 12, backgroundColor: "#FFF5F5", borderRadius: 12, border: "1px solid #FEE2E2" }}>
                        <span style={{ fontSize: 28 }}>🚫</span>
                        <strong style={{ fontSize: 15, color: "#991B1B" }}>Override / Cuti Aktif</strong>
                        <p style={{ fontSize: 13, color: "#C53030", margin: 0, lineHeight: 1.4 }}>
                          Anda telah memblokir tanggal ini. Seluruh ketersediaan slot Anda dinonaktifkan sehingga client tidak dapat melakukan pemesanan.
                        </p>
                      </div>
                    );
                  }

                  if (daySlots.length === 0) {
                    return (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", textAlign: "center", gap: 12, color: "#94A3B8" }}>
                        <span style={{ fontSize: 28 }}>📅</span>
                        <strong style={{ fontSize: 14 }}>Tidak Ada Jadwal</strong>
                        <p style={{ fontSize: 12, margin: 0, lineHeight: 1.4 }}>
                          Tidak ada slot ketersediaan template mingguan yang terjadwal pada hari ini.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {daySlots.map(slot => {
                        const isBooked = slot.status === "BOOKED";
                        return (
                          <div
                            key={slot.slotKey}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px 16px",
                              backgroundColor: isBooked ? "#F3E8FF" : "#F8FAFC",
                              border: "1px solid",
                              borderColor: isBooked ? "#C084FC" : "#E2E8F0",
                              borderRadius: 12,
                              transition: "all 0.2s"
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>
                                {slot.slotKey.split("T")[1]} WIB
                              </div>
                              <div style={{ fontSize: 12, marginTop: 4 }}>
                                {isBooked ? (
                                  <span style={{ color: "#7E22CE", fontWeight: 700 }}>
                                    Dipesan oleh: <strong>{slot.clientName}</strong>
                                  </span>
                                ) : (
                                  <span style={{ color: "#16A34A", fontWeight: 700 }}>Tersedia</span>
                                )}
                              </div>
                            </div>

                            {isBooked && (
                              <Link
                                href={`/dashboard/psychologist/notes?sessionId=${slot.sessionId}`}
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#7E22CE",
                                  textDecoration: "none",
                                  backgroundColor: "#FFFFFF",
                                  border: "1px solid #D8B4FE",
                                  padding: "6px 12px",
                                  borderRadius: 8,
                                  transition: "all 0.15s"
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F3E8FF"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
                              >
                                Tulis Catatan
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </PsychologistLayout>
  );
}
