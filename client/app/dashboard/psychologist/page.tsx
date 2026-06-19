"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Calendar, CheckCircle2, AlertCircle, Video, MapPin, FileText, ClipboardCheck } from "lucide-react";
import { PsychologistLayout } from "../../../components/PsychologistLayout";
import { apiFetch } from "../../../lib/api";
import { ScheduleCalendar } from "../../../components/ScheduleCalendar";

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
  assessment?: {
    id: string;
    score: number;
    summary: string;
    isHighRisk: boolean;
    responses: Record<string, number>;
  };
};

export default function PsychologistDashboardPage() {
  const [allSessions, setAllSessions] = useState<StoredSession[]>([]);
  const [todaySessions, setTodaySessions] = useState<StoredSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);


  const notifications = useMemo(() => {
    return generateNotifications(allSessions);
  }, [allSessions]);

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
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
          Selamat sore, {firstName} 👋
        </h1>
        {loading ? (
          <div className="skeleton-pulse" style={{ height: 20, width: 220, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
        ) : (
          <p style={{ color: "#64748B", fontSize: 15, fontWeight: 500 }}>
            Anda memiliki {todaySessions.length} sesi terjadwal hari ini
          </p>
        )}
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 40 }}>
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 16 }}>
              <div className="skeleton-pulse" style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#E2E8F0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <div className="skeleton-pulse" style={{ height: 14, width: "60%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                <div className="skeleton-pulse" style={{ height: 22, width: "40%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
              </div>
            </div>
          ))
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Grid Layout: Sessions (Left) and Notifications (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "start" }}>

        {/* Left Column: Jadwal Konseling — Full Calendar */}
        <section style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 32, border: "1px solid #E2E8F0" }}>
          <ScheduleCalendar sessions={allSessions} loading={loading} />
        </section>

        {/* Right Column: Notifikasi Terbaru */}
        <aside style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 32, border: "1px solid #E2E8F0" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 24 }}>Notifikasi Terbaru</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="skeleton-pulse" style={{ height: 14, width: "90%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                  <div className="skeleton-pulse" style={{ height: 14, width: "60%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                  <div className="skeleton-pulse" style={{ height: 11, width: "30%", backgroundColor: "#E2E8F0", borderRadius: 4, marginTop: 4 }} />
                </div>
              ))
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
