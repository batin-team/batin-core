"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useMemo } from "react";
import { Calendar, CheckCircle2, AlertCircle, Video, MapPin, FileText, ClipboardCheck, ArrowRight, User } from "lucide-react";
import { PsychologistLayout } from "../../../components/PsychologistLayout";
import { apiFetch } from "../../../lib/api";

type StoredSession = {
  id: string;
  clientName: string;
  sessionType: string;
  status: string;
  scheduledAt: string;
  amount: number;
  location?: string;
  meetUrl?: string;
  clientIssues: string[];
  clientNotes?: string;
  hasNotes: boolean;
  hasAttendance: boolean;
  createdAt: string;
  timeRange?: string;
};

export default function PsychologistDashboardPage() {
  const [allSessions, setAllSessions] = useState<StoredSession[]>([]);
  const [todaySessions, setTodaySessions] = useState<StoredSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Date navigator state — starts at today
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const notifications = useMemo(() => {
    return generateNotifications(allSessions);
  }, [allSessions]);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (err) {
        dateInputRef.current.click();
      }
    }
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const formatSelectedDate = (d: Date) =>
    d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const shiftDay = (delta: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  // Sessions for the currently selected date
  const selectedDaySessions = allSessions.filter((s) => {
    const d = new Date(s.scheduledAt);
    // Convert UTC to WIB (+7) for comparison
    const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return (
      wib.getUTCFullYear() === selectedDate.getFullYear() &&
      wib.getUTCMonth() === selectedDate.getMonth() &&
      wib.getUTCDate() === selectedDate.getDate()
    );
  });

  useEffect(() => {
    const raw = localStorage.getItem("mindbridge_user");
    if (raw) {
      setUser(JSON.parse(raw));
    }

    async function loadData() {
      try {
        const [allRes, todayRes] = await Promise.all([
          apiFetch("/api/psychologist/sessions"),
          apiFetch("/api/psychologist/sessions/today")
        ]);
        setAllSessions(allRes.data || []);
        setTodaySessions(todayRes.data || []);
      } catch (e) {
        console.error("Failed to load psychologist sessions data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute stats
  const completedCount = allSessions.filter((s) => s.status === "COMPLETED").length;
  const pendingCount = allSessions.filter((s) => s.status === "PENDING_PAYMENT" || s.status === "IN_PROGRESS").length;

  const weekSessionsCount = allSessions.filter((s) => {
    const d = new Date(s.scheduledAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "Dokter";

  const getStatusBadge = (status: string) => {
    if (status === "COMPLETED") {
      return (
        <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#D1FAE5", color: "#059669", padding: "4px 8px", borderRadius: 6 }}>
          Selesai
        </span>
      );
    } else if (status === "IN_PROGRESS") {
      return (
        <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#F3E8FF", color: "#7E22CE", padding: "4px 8px", borderRadius: 6 }}>
          Berlangsung
        </span>
      );
    } else {
      return (
        <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#DBEAFE", color: "#1D4ED8", padding: "4px 8px", borderRadius: 6 }}>
          Terkonfirmasi
        </span>
      );
    }
  };

  const getSessionTimeRange = (scheduledAtStr: string) => {
    const d = new Date(scheduledAtStr);
    const localTime = new Date(d.getTime() + 7 * 60 * 60 * 1000); // Shift for representation
    const startStr = localTime.toISOString().split("T")[1].substring(0, 5);
    const endHour = String((localTime.getUTCHours() + 1) % 24).padStart(2, "0");
    const endStr = `${endHour}:${String(localTime.getUTCMinutes()).padStart(2, "0")}`;
    return `${startStr} - ${endStr}`;
  };

  return (
    <PsychologistLayout activeTab="dashboard">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
          Selamat sore, {firstName} 👋
        </h1>
        <p style={{ color: "#64748B", fontSize: 15, fontWeight: 500 }}>
          Anda memiliki {todaySessions.length} sesi terjadwal hari ini
        </p>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 40 }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#EFF6FF", display: "grid", placeItems: "center", color: "#2563EB" }}>
            <Calendar size={20} />
          </div>
          <div>
            <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Sesi Hari Ini</span>
            <strong style={{ display: "block", fontSize: 24, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{todaySessions.length}</strong>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#D1FAE5", display: "grid", placeItems: "center", color: "#10B981" }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Selesai</span>
            <strong style={{ display: "block", fontSize: 24, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{completedCount}</strong>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#FEF3C7", display: "grid", placeItems: "center", color: "#F59E0B" }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Perlu Konfirmasi</span>
            <strong style={{ display: "block", fontSize: 24, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{pendingCount}</strong>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#F3E8FF", display: "grid", placeItems: "center", color: "#8B5CF6" }}>
            <Calendar size={20} />
          </div>
          <div>
            <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Sesi Minggu Ini</span>
            <strong style={{ display: "block", fontSize: 24, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{weekSessionsCount}</strong>
          </div>
        </div>
      </div>

      {/* Grid Layout: Sessions (Left) and Notifications (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "start" }}>

        {/* Left Column: Jadwal dengan Navigasi Tanggal */}
        <section style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 32, border: "1px solid #E2E8F0" }}>
          {/* Date Navigator Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: 0 }}>Jadwal Konseling</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Prev day */}
              <button
                onClick={() => shiftDay(-1)}
                title="Hari sebelumnya"
                style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", display: "grid", placeItems: "center", fontSize: 16, color: "#475569", fontWeight: 700, transition: "all 0.15s" }}
              >
                ‹
              </button>

              {/* Date display / click to pick date */}
              <div
                onClick={handleCalendarClick}
                style={{ position: "relative", cursor: "pointer", display: "inline-block" }}
              >
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 8, border: "1px solid #E2E8F0",
                  backgroundColor: isToday(selectedDate) ? "#EFF6FF" : "#F8FAFC",
                  color: isToday(selectedDate) ? "#2563EB" : "#1E293B",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", userSelect: "none"
                }}>
                  <Calendar size={14} />
                  {isToday(selectedDate) ? "Hari Ini" : ""} {formatSelectedDate(selectedDate)}
                </span>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate.toISOString().split("T")[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split("-").map(Number);
                      const nd = new Date(y, m - 1, d);
                      nd.setHours(0, 0, 0, 0);
                      setSelectedDate(nd);
                    }
                  }}
                  style={{ position: "absolute", opacity: 0, width: 0, height: 0, top: 0, left: 0, pointerEvents: "none" }}
                />
              </div>

              {/* Next day */}
              <button
                onClick={() => shiftDay(1)}
                title="Hari berikutnya"
                style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", display: "grid", placeItems: "center", fontSize: 16, color: "#475569", fontWeight: 700, transition: "all 0.15s" }}
              >
                ›
              </button>

              {/* Jump to today */}
              {!isToday(selectedDate) && (
                <button
                  onClick={() => { const t = new Date(); t.setHours(0, 0, 0, 0); setSelectedDate(t); }}
                  style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #2563EB", background: "transparent", color: "#2563EB", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  Hari Ini
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#64748B" }}>Memuat sesi konseling...</p>
          ) : selectedDaySessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94A3B8" }}>
              <Calendar size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>Tidak ada sesi yang dijadwalkan pada hari ini.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {selectedDaySessions.map((session) => {
                const isOnline = session.sessionType === "ONLINE";
                const d = new Date(session.scheduledAt);
                const localTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
                const hourStr = localTime.toISOString().split("T")[1].substring(0, 5);

                return (
                  <div key={session.id} style={{ display: "flex", gap: 24 }}>
                    {/* Time Label on left */}
                    <div style={{ width: 100, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", textAlign: "center" }}>{(session as any).timeRange || hourStr}</span>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: isOnline ? "#10B981" : "#8B5CF6", marginTop: 8 }} />
                    </div>

                    {/* Session Details Card on right */}
                    <div style={{ flex: 1, backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>{session.clientName}</h3>
                          <div style={{ display: "flex", gap: 6 }}>
                            {session.clientIssues.map((issue) => (
                              <span key={issue} style={{ fontSize: 11, fontWeight: 600, backgroundColor: "#F1F5F9", color: "#475569", padding: "2px 8px", borderRadius: 4 }}>
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>

                      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {isOnline ? <Video size={15} /> : <MapPin size={15} />}
                          {session.sessionType} ({(session as any).timeRange || getSessionTimeRange(session.scheduledAt)})
                        </div>
                      </div>

                      {session.clientNotes && (
                        <div style={{ fontSize: 13, color: "#475569", backgroundColor: "#F8FAFC", borderRadius: 8, padding: "10px 14px", borderLeft: "3px solid #3B82F6", marginTop: -4 }}>
                          <strong style={{ display: "block", fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Keluhan dari Klien:</strong>
                          "{session.clientNotes}"
                        </div>
                      )}

                      {/* Progress Bar for partially filled session (only 1 of 2 submitted) */}
                      {((session.hasNotes && !session.hasAttendance) || (!session.hasNotes && session.hasAttendance)) && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "4px 0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, fontWeight: 700, color: "#7C3AED" }}>
                            <span>Progress Pengisian Sesi</span>
                            <span>50% (1 dari 2 form disubmit)</span>
                          </div>
                          <div style={{ width: "100%", height: 6, backgroundColor: "#EDE9FE", borderRadius: 999, overflow: "hidden" }}>
                            <div style={{ width: "50%", height: "100%", backgroundColor: "#7C3AED", borderRadius: 999 }} />
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                        {isOnline && session.meetUrl && (
                          <a
                            href={session.meetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="button button-secondary"
                            style={{ padding: "8px 14px", minHeight: 36, fontSize: 13, borderRadius: 8, borderColor: "#CBD5E1", display: "flex", alignItems: "center", gap: 6 }}
                          >
                            <Video size={14} /> Buka Meet
                          </a>
                        )}
                        <Link
                          href={`/dashboard/psychologist/notes?sessionId=${session.id}`}
                          className="button button-primary"
                          style={{ padding: "8px 14px", minHeight: 36, fontSize: 13, borderRadius: 8, backgroundColor: "#2563EB", display: "flex", alignItems: "center", gap: 6 }}
                        >
                          <FileText size={14} />
                          {session.hasNotes ? "Edit Catatan" : "Buat Catatan"}
                        </Link>
                        <Link
                          href={`/dashboard/psychologist/attendance?sessionId=${session.id}`}
                          className="button button-secondary"
                          style={{ padding: "8px 14px", minHeight: 36, fontSize: 13, borderRadius: 8, color: "#7C3AED", borderColor: "#7C3AED", display: "flex", alignItems: "center", gap: 6 }}
                        >
                          <ClipboardCheck size={14} />
                          {session.hasAttendance ? "Lihat Kehadiran" : "Bukti Kehadiran"}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Notifikasi Terbaru */}
        <aside style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 32, border: "1px solid #E2E8F0" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 24 }}>Notifikasi Terbaru</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {loading ? (
              <p style={{ color: "#64748B", fontSize: 13 }}>Memuat notifikasi...</p>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#94A3B8" }}>
                <AlertCircle size={28} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                <p style={{ fontSize: 13, fontWeight: 500 }}>Tidak ada notifikasi terbaru.</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 13, color: "#1E293B", fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                    {notif.text}
                  </p>
                  <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500, display: "block", marginTop: 8 }}>{notif.timeLabel}</span>
                </div>
              ))
            )}
          </div>
        </aside>

      </div>
    </PsychologistLayout>
  );
}

type NotificationItem = {
  id: string;
  text: string;
  timeLabel: string;
  timestamp: number;
};

function formatDateForNotification(scheduledAtStr: string, timeRange?: string) {
  const d = new Date(scheduledAtStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isTodayDate = d.getFullYear() === today.getFullYear() &&
                      d.getMonth() === today.getMonth() &&
                      d.getDate() === today.getDate();

  const isTomorrowDate = d.getFullYear() === tomorrow.getFullYear() &&
                         d.getMonth() === tomorrow.getMonth() &&
                         d.getDate() === tomorrow.getDate();

  let dateStr = "";
  if (isTodayDate) {
    dateStr = "hari ini";
  } else if (isTomorrowDate) {
    dateStr = "besok";
  } else {
    dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
  }

  const timeStr = timeRange ? timeRange.split(" - ")[0] : d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
  return `${dateStr} pukul ${timeStr}`;
}

function getTimeElapsedText(createdAtStr: string) {
  const diffMs = Date.now() - new Date(createdAtStr).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return `${diffDays} hari lalu`;
}

function generateNotifications(sessions: StoredSession[]): NotificationItem[] {
  const items: NotificationItem[] = [];

  sessions.forEach((s) => {
    const sessionTime = new Date(s.scheduledAt).getTime();
    const createdTime = new Date(s.createdAt).getTime();

    const diffMs = Date.now() - createdTime;
    
    // 1. New booking
    if (diffMs < 7 * 24 * 60 * 60 * 1000) {
      items.push({
        id: `new-${s.id}`,
        text: `Booking baru dari ${s.clientName} untuk ${formatDateForNotification(s.scheduledAt, s.timeRange)}`,
        timeLabel: getTimeElapsedText(s.createdAt),
        timestamp: createdTime
      });
    }

    // 2. Completed payment
    if (s.status !== "PENDING_PAYMENT" && s.status !== "CANCELLED" && diffMs < 7 * 24 * 60 * 60 * 1000) {
      items.push({
        id: `pay-${s.id}`,
        text: `${s.clientName} telah menyelesaikan pembayaran sesi konseling`,
        timeLabel: getTimeElapsedText(s.createdAt),
        timestamp: createdTime + 1000 // slightly newer than new booking
      });
    }

    // 3. Session reminder (future sessions in the next 24h)
    const timeToSession = sessionTime - Date.now();
    if (timeToSession > 0 && timeToSession < 24 * 60 * 60 * 1000) {
      const minutesToSession = Math.floor(timeToSession / (1000 * 60));
      const hoursToSession = Math.floor(timeToSession / (1000 * 60 * 60));
      
      let reminderText = "";
      let reminderLabel = "Pengingat otomatis";

      if (minutesToSession < 60) {
        reminderText = `Pengingat: Sesi dengan ${s.clientName} dimulai dalam ${minutesToSession} menit`;
        reminderLabel = `${60 - minutesToSession} menit lalu`;
      } else {
        reminderText = `Pengingat: Sesi dengan ${s.clientName} dimulai dalam ${hoursToSession} jam`;
        reminderLabel = `${hoursToSession} jam sebelum sesi`;
      }

      items.push({
        id: `remind-${s.id}`,
        text: reminderText,
        timeLabel: reminderLabel,
        timestamp: sessionTime - 30 * 60 * 1000
      });
    }
  });

  return items.sort((a, b) => b.timestamp - a.timestamp);
}
