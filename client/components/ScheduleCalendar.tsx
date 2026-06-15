"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Video, MapPin, FileText, ClipboardCheck } from "lucide-react";

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

type CalendarView = "day" | "week" | "month";

const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function toWIB(utcDate: Date) {
  return new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function getSessionsForDay(sessions: StoredSession[], day: Date) {
  return sessions.filter(s => {
    const wib = toWIB(new Date(s.scheduledAt));
    return (
      wib.getUTCFullYear() === day.getFullYear() &&
      wib.getUTCMonth() === day.getMonth() &&
      wib.getUTCDate() === day.getDate()
    );
  });
}

function getSessionTime(scheduledAt: string) {
  const wib = toWIB(new Date(scheduledAt));
  const h = String(wib.getUTCHours()).padStart(2, "0");
  const m = String(wib.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function statusColor(status: string) {
  if (status === "COMPLETED") return { bg: "#D1FAE5", text: "#059669", label: "Selesai" };
  if (status === "IN_PROGRESS") return { bg: "#F3E8FF", text: "#7E22CE", label: "Berlangsung" };
  return { bg: "#DBEAFE", text: "#1D4ED8", label: "Terkonfirmasi" };
}

// ── Session detail card (used in Day & Week) ──────────────────────────────────
function SessionCard({ session }: { session: StoredSession }) {
  const isOnline = session.sessionType === "ONLINE";
  const time = (session as any).timeRange || getSessionTime(session.scheduledAt);
  const sc = statusColor(session.status);

  return (
    <div style={{
      border: "1px solid #E2E8F0", borderRadius: 14, padding: 18,
      display: "flex", flexDirection: "column", gap: 12, background: "#FFFFFF",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#6366F1", marginBottom: 3 }}>{time}</div>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0F172A" }}>{session.clientName}</h4>
          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            {session.clientIssues.map(issue => (
              <span key={issue} style={{ fontSize: 10, fontWeight: 600, background: "#F1F5F9", color: "#475569", padding: "2px 6px", borderRadius: 4 }}>
                {issue}
              </span>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.text, padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>
          {sc.label}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B" }}>
        {isOnline ? <Video size={13} /> : <MapPin size={13} />}
        {session.sessionType}
      </div>

      {session.clientNotes && (
        <div style={{ fontSize: 12, color: "#475569", background: "#F8FAFC", borderRadius: 8, padding: "8px 12px", borderLeft: "3px solid #3B82F6" }}>
          <strong style={{ display: "block", fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>
            Keluhan:
          </strong>
          "{session.clientNotes}"
        </div>
      )}

      {/* Progress bar */}
      {((session.hasNotes && !session.hasAttendance) || (!session.hasNotes && session.hasAttendance)) && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#7C3AED", marginBottom: 4 }}>
            <span>Progress Pengisian</span><span>50%</span>
          </div>
          <div style={{ height: 5, background: "#EDE9FE", borderRadius: 999 }}>
            <div style={{ width: "50%", height: "100%", background: "#7C3AED", borderRadius: 999 }} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {isOnline && session.meetUrl && (
          <a href={session.meetUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12, fontWeight: 600, color: "#475569", textDecoration: "none", background: "#F8FAFC" }}>
            <Video size={12} /> Buka Meet
          </a>
        )}
        <Link href={`/dashboard/psychologist/notes?sessionId=${session.id}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: "#2563EB", fontSize: 12, fontWeight: 600, color: "#fff", textDecoration: "none" }}>
          <FileText size={12} /> {session.hasNotes ? "Edit Catatan" : "Buat Catatan"}
        </Link>
        <Link href={`/dashboard/psychologist/attendance?sessionId=${session.id}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid #7C3AED", fontSize: 12, fontWeight: 600, color: "#7C3AED", textDecoration: "none" }}>
          <ClipboardCheck size={12} /> {session.hasAttendance ? "Lihat Kehadiran" : "Bukti Kehadiran"}
        </Link>
      </div>
    </div>
  );
}

// ── Day View ─────────────────────────────────────────────────────────────────
function DayView({ date, sessions }: { date: Date; sessions: StoredSession[] }) {
  const daySessions = getSessionsForDay(sessions, date);
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#64748B", marginBottom: 16 }}>
        {date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </div>
      {daySessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {daySessions.map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      )}
    </div>
  );
}

// ── Week View ─────────────────────────────────────────────────────────────────
function WeekView({ date, sessions }: { date: Date; sessions: StoredSession[] }) {
  // Get the Monday of the week containing `date`
  const monday = new Date(date);
  const dayOfWeek = monday.getDay(); // 0=Sun
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(monday.getDate() + diff);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const today = new Date();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
      {weekDays.map((day, i) => {
        const daySessions = getSessionsForDay(sessions, day);
        const isToday = isSameDay(day, today);
        const isSelected = isSameDay(day, date);

        return (
          <div key={i} style={{
            borderRadius: 12,
            border: `1px solid ${isSelected ? "#6366F1" : "#E2E8F0"}`,
            background: isSelected ? "#F5F3FF" : "#FAFAFA",
            padding: "10px 8px",
            minHeight: 100,
          }}>
            <div style={{
              textAlign: "center", marginBottom: 8,
              fontSize: 11, fontWeight: 700, color: "#94A3B8",
            }}>
              {DAYS_ID[day.getDay()]}
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              margin: "0 auto 8px",
              background: isToday ? "#6366F1" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 800,
              color: isToday ? "#fff" : "#0F172A",
            }}>
              {day.getDate()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {daySessions.slice(0, 3).map(s => (
                <div key={s.id} style={{
                  background: "#6366F1",
                  color: "#fff",
                  borderRadius: 4,
                  padding: "2px 5px",
                  fontSize: 10,
                  fontWeight: 600,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}>
                  {getSessionTime(s.scheduledAt)} {s.clientName.split(" ")[0]}
                </div>
              ))}
              {daySessions.length > 3 && (
                <div style={{ fontSize: 10, color: "#6366F1", fontWeight: 700, textAlign: "center" }}>
                  +{daySessions.length - 3} lagi
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Month View ────────────────────────────────────────────────────────────────
function MonthView({ date, sessions, onSelectDay }: { date: Date; sessions: StoredSession[]; onSelectDay: (d: Date) => void }) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // First day of the month and how many days
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Build grid cells (pad with nulls for leading blank days)
  const cells: (number | null)[] = [
    ...Array(firstDay === 0 ? 6 : firstDay - 1).fill(null), // Mon-start grid
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete the last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
        {DAYS_ID.slice(1).concat(DAYS_ID[0]).map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#94A3B8", padding: "4px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;

          const cellDate = new Date(year, month, day);
          const cellSessions = getSessionsForDay(sessions, cellDate);
          const isToday = isSameDay(cellDate, today);
          const isSelected = isSameDay(cellDate, date);

          return (
            <div
              key={i}
              onClick={() => onSelectDay(cellDate)}
              style={{
                borderRadius: 10,
                border: `1px solid ${isSelected ? "#6366F1" : "transparent"}`,
                background: isSelected ? "#F5F3FF" : isToday ? "#EFF6FF" : "#FAFAFA",
                padding: "6px 4px",
                minHeight: 72,
                cursor: "pointer",
                transition: "background 0.15s, border 0.15s",
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: isToday ? "#6366F1" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800,
                color: isToday ? "#fff" : isSelected ? "#6366F1" : "#1E293B",
                margin: "0 auto 4px",
              }}>
                {day}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {cellSessions.slice(0, 2).map(s => (
                  <div key={s.id} style={{
                    background: "#6366F1",
                    color: "#fff",
                    borderRadius: 3,
                    padding: "1px 4px",
                    fontSize: 9,
                    fontWeight: 600,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}>
                    {getSessionTime(s.scheduledAt)} {s.clientName.split(" ")[0]}
                  </div>
                ))}
                {cellSessions.length > 2 && (
                  <div style={{ fontSize: 9, color: "#6366F1", fontWeight: 700, textAlign: "center" }}>
                    +{cellSessions.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected day detail */}
      {getSessionsForDay(sessions, date).length > 0 && (
        <div style={{ marginTop: 24, borderTop: "1px solid #E2E8F0", paddingTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 12 }}>
            Sesi pada {date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {getSessionsForDay(sessions, date).map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "32px 0", color: "#94A3B8" }}>
      <Calendar size={36} style={{ margin: "0 auto 12px", opacity: 0.25 }} />
      <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Tidak ada sesi pada periode ini.</p>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export function ScheduleCalendar({ sessions, loading }: { sessions: StoredSession[]; loading: boolean }) {
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Navigation helpers
  function navigate(delta: number) {
    setCursor(prev => {
      const next = new Date(prev);
      if (view === "day") next.setDate(next.getDate() + delta);
      else if (view === "week") next.setDate(next.getDate() + delta * 7);
      else next.setMonth(next.getMonth() + delta);
      return next;
    });
  }

  function goToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setCursor(d);
  }

  // Title text per view
  function title() {
    if (view === "day") {
      return cursor.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    if (view === "week") {
      const monday = new Date(cursor);
      const dayOfWeek = monday.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      monday.setDate(monday.getDate() + diff);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      const fromStr = monday.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      const toStr = sunday.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
      return `${fromStr} – ${toStr}`;
    }
    return `${MONTHS_ID[cursor.getMonth()]} ${cursor.getFullYear()}`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isAtToday = isSameDay(cursor, today);

  const tabStyle = (v: CalendarView): React.CSSProperties => ({
    padding: "5px 14px",
    borderRadius: 8,
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    background: view === v ? "#6366F1" : "transparent",
    color: view === v ? "#fff" : "#64748B",
    transition: "all 0.15s",
  });

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: 0 }}>Jadwal Konseling</h2>

        {/* View switcher */}
        <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 10, padding: 4, gap: 2 }}>
          <button style={tabStyle("day")} onClick={() => setView("day")}>Hari</button>
          <button style={tabStyle("week")} onClick={() => setView("week")}>Minggu</button>
          <button style={tabStyle("month")} onClick={() => setView("month")}>Bulan</button>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", display: "grid", placeItems: "center", color: "#475569" }}
          >
            <ChevronLeft size={16} />
          </button>

          <span style={{
            padding: "5px 14px", borderRadius: 8, border: "1px solid #E2E8F0",
            background: "#F8FAFC", fontSize: 13, fontWeight: 700, color: "#1E293B",
            minWidth: 160, textAlign: "center",
          }}>
            {title()}
          </span>

          <button
            onClick={() => navigate(1)}
            style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", display: "grid", placeItems: "center", color: "#475569" }}
          >
            <ChevronRight size={16} />
          </button>

          {!isAtToday && (
            <button
              onClick={goToday}
              style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #6366F1", background: "transparent", color: "#6366F1", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              Hari Ini
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      {loading ? (
        <p style={{ color: "#64748B" }}>Memuat jadwal...</p>
      ) : view === "day" ? (
        <DayView date={cursor} sessions={sessions} />
      ) : view === "week" ? (
        <WeekView date={cursor} sessions={sessions} />
      ) : (
        <MonthView date={cursor} sessions={sessions} onSelectDay={d => { setCursor(d); }} />
      )}
    </div>
  );
}
