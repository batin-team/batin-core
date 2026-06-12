"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Camera, ClipboardCheck, CheckCircle, ArrowLeft, Calendar, User } from "lucide-react";
import { PsychologistLayout } from "../../../../components/PsychologistLayout";
import { apiFetch } from "../../../../lib/api";

type SessionInfo = {
  id: string;
  clientName: string;
  sessionType: string;
  status: string;
  scheduledAt: string;
};

function AttendanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId") || "";

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loadingSession, setLoadingSession] = useState(!!sessionId);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [clientAttended, setClientAttended] = useState(true);
  const [notes, setNotes] = useState("");
  const [actualStart, setActualStart] = useState("09:00");
  const [actualEnd, setActualEnd] = useState("10:00");
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [message, setMessage] = useState("");

  // Load session info
  useEffect(() => {
    if (!sessionId) return;
    async function loadSession() {
      try {
        const res = await apiFetch(`/api/psychologist/sessions/${sessionId}`);
        setSession(res.data || null);
        // Pre-fill start/end from scheduled time
        if (res.data?.scheduledAt) {
          const d = new Date(res.data.scheduledAt);
          const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
          const hh = String(wib.getUTCHours()).padStart(2, "0");
          const mm = String(wib.getUTCMinutes()).padStart(2, "0");
          const endHH = String((wib.getUTCHours() + 1) % 24).padStart(2, "0");
          setActualStart(`${hh}:${mm}`);
          setActualEnd(`${endHH}:${mm}`);
        }
      } catch (e) {
        console.error("Failed to load session info", e);
      } finally {
        setLoadingSession(false);
      }
    }
    loadSession();
  }, [sessionId]);

  // Load existing attendance
  useEffect(() => {
    if (!sessionId) return;
    async function loadAttendance() {
      setLoadingAttendance(true);
      setMessage("");
      try {
        const res = await apiFetch(`/api/sessions/${sessionId}/attendance`);
        if (res && res.data) {
          setClientAttended(res.data.clientAttended);
          setNotes(res.data.notes || "");
          setExists(res.data.exists);
          setEvidencePhotoUrl(res.data.evidencePhotoUrl || "");
          
          if (res.data.actualStartTime) {
            const d = new Date(res.data.actualStartTime);
            const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
            const hh = String(wib.getUTCHours()).padStart(2, "0");
            const mm = String(wib.getUTCMinutes()).padStart(2, "0");
            setActualStart(`${hh}:${mm}`);
          }
          if (res.data.actualEndTime) {
            const d = new Date(res.data.actualEndTime);
            const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
            const hh = String(wib.getUTCHours()).padStart(2, "0");
            const mm = String(wib.getUTCMinutes()).padStart(2, "0");
            setActualEnd(`${hh}:${mm}`);
          }
        }
      } catch (e) {
        console.error("Failed to load attendance", e);
      } finally {
        setLoadingAttendance(false);
      }
    }
    loadAttendance();
  }, [sessionId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidencePhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    setIsSaving(true);
    setMessage("");
    try {
      const sessionDateStr = session ? session.scheduledAt.split("T")[0] : new Date().toISOString().split("T")[0];
      const actualStartTime = new Date(`${sessionDateStr}T${actualStart}:00+07:00`);
      const actualEndTime = new Date(`${sessionDateStr}T${actualEnd}:00+07:00`);

      const method = exists ? "PATCH" : "POST";
      await apiFetch(`/api/sessions/${sessionId}/attendance`, {
        method,
        body: JSON.stringify({
          clientAttended,
          notes,
          actualStartTime: actualStartTime.toISOString(),
          actualEndTime: actualEndTime.toISOString(),
          evidencePhotoUrl
        })
      });
      setMessage("Bukti kehadiran berhasil disimpan! Mengarahkan ke jadwal...");
      setExists(true);
      setTimeout(() => {
        router.push("/dashboard/psychologist");
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage("Gagal menyimpan bukti kehadiran.");
    } finally {
      setIsSaving(false);
    }
  };

  // No sessionId
  if (!sessionId) {
    return (
      <PsychologistLayout activeTab="attendance">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: "#F1F5F9", display: "grid", placeItems: "center", color: "#94A3B8" }}>
            <ClipboardCheck size={28} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>Pilih Sesi Terlebih Dahulu</h2>
          <p style={{ color: "#64748B", fontSize: 14, maxWidth: 380, margin: 0 }}>
            Halaman bukti kehadiran diakses melalui tombol <strong>"Bukti Kehadiran"</strong> pada kartu jadwal di Dashboard.
          </p>
          <button
            onClick={() => router.push("/dashboard/psychologist")}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, backgroundColor: "#7C3AED", color: "#FFFFFF", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </button>
        </div>
      </PsychologistLayout>
    );
  }

  return (
    <PsychologistLayout activeTab="attendance">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, background: "none", border: "none", color: "#64748B", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0 }}
      >
        <ArrowLeft size={16} /> Kembali ke Jadwal
      </button>

      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Bukti Kehadiran</h1>
        <p style={{ color: "#64748B", fontSize: 15, fontWeight: 500 }}>Isi dan kelola kehadiran client untuk sesi konseling</p>
      </div>

      {/* Session info card */}
      {loadingSession ? (
        <div style={{ marginBottom: 24, backgroundColor: "#F8FAFC", borderRadius: 12, padding: 16, fontSize: 14, color: "#64748B" }}>Memuat info sesi...</div>
      ) : session ? (
        <div style={{ marginBottom: 32, backgroundColor: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 16, padding: "16px 24px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#EDE9FE", display: "grid", placeItems: "center", color: "#7C3AED" }}>
              <User size={20} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#4C1D95" }}>{session.clientName}</div>
              <div style={{ fontSize: 12, color: "#7C3AED", fontWeight: 600 }}>{session.sessionType}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#5B21B6", fontSize: 14, fontWeight: 600 }}>
            <Calendar size={16} />
            {new Date(session.scheduledAt).toLocaleDateString("id-ID", { dateStyle: "long" })}, {(session as any).timeRange || new Date(session.scheduledAt).toLocaleTimeString("id-ID", { timeStyle: "short" })} WIB
          </div>
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, backgroundColor: exists ? "#D1FAE5" : "#FEF3C7", color: exists ? "#059669" : "#92400E", padding: "4px 10px", borderRadius: 20 }}>
            {exists ? "Kehadiran tercatat" : "Belum diisi"}
          </span>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "start" }}>
        {/* Form */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          {message && (
            <div style={{
              backgroundColor: message.includes("Gagal") ? "#FEE2E2" : "#D1FAE5",
              color: message.includes("Gagal") ? "#DC2626" : "#059669",
              padding: "12px 16px", borderRadius: 12, fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8, marginBottom: 24
            }}>
              <CheckCircle size={16} />
              {message}
            </div>
          )}

          {loadingAttendance ? (
            <p style={{ color: "#64748B", fontSize: 14 }}>Memuat data kehadiran...</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Waktu aktual */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Waktu Mulai Aktual</label>
                  <input
                    type="time"
                    value={actualStart}
                    onChange={(e) => setActualStart(e.target.value)}
                    style={{ borderRadius: 8, height: 42, padding: "0 12px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Waktu Selesai Aktual</label>
                  <input
                    type="time"
                    value={actualEnd}
                    onChange={(e) => setActualEnd(e.target.value)}
                    style={{ borderRadius: 8, height: 42, padding: "0 12px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A" }}
                  />
                </div>
              </div>

              {/* Client hadir */}
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", padding: 14, borderRadius: 12 }}>
                <input
                  type="checkbox"
                  checked={clientAttended}
                  onChange={(e) => setClientAttended(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#7C3AED" }}
                />
                <strong style={{ fontSize: 14, color: "#1E293B" }}>Client hadir dalam sesi konseling</strong>
              </label>

              {/* Evidence foto */}
              <div style={{ display: "grid", gap: 8, backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", padding: 14, borderRadius: 12 }}>
                <strong style={{ fontSize: 14, color: "#1E293B", display: "flex", alignItems: "center", gap: 8 }}>
                  <Camera size={18} style={{ color: "#64748B" }} /> Evidence foto / screenshot
                </strong>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ fontSize: 13, color: "#64748B", cursor: "pointer" }}
                />
                <span style={{ fontSize: 11, color: "#94A3B8" }}>* Upload foto disimulasikan menggunakan base64 (tersimpan ke database local)</span>
                {evidencePhotoUrl && (
                  <div style={{ marginTop: 12, borderTop: "1px dashed #E2E8F0", paddingTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>Pratinjau Foto Bukti:</div>
                    <img src={evidencePhotoUrl} alt="Evidence Preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, border: "1px solid #E2E8F0", objectFit: "contain" }} />
                  </div>
                )}
              </div>

              {/* Catatan internal */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Catatan Internal Kehadiran</label>
                <textarea
                  placeholder="Tuliskan catatan kehadiran internal di sini..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ borderRadius: 8, minHeight: 100, padding: 12, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                style={{ backgroundColor: "#7C3AED", color: "#FFFFFF", height: 46, borderRadius: 8, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 6px -1px rgba(124,58,237,0.2)", opacity: isSaving ? 0.7 : 1 }}
              >
                <ClipboardCheck size={18} />
                {isSaving ? "Menyimpan..." : exists ? "Perbarui Bukti Kehadiran" : "Simpan Bukti Kehadiran"}
              </button>
            </form>
          )}
        </div>

        {/* Info panel */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginTop: 0, marginBottom: 12 }}>Mengapa Harus Mengisi Kehadiran?</h3>
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12, color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
            <li><strong>Validasi Sesi</strong>: Bukti kehadiran memverifikasi bahwa sesi konseling benar-benar telah terlaksana sebelum pembayaran diproses.</li>
            <li><strong>Pencatatan Kehadiran</strong>: Status kehadiran client terekam pada dashboard admin dan menjadi bahan evaluasi.</li>
            <li><strong>Catatan Internal</strong>: Catatan internal tidak dibagikan kepada client, hanya dapat diakses oleh Anda dan administrator.</li>
          </ul>
        </div>
      </div>
    </PsychologistLayout>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "#64748B" }}>Memuat halaman...</div>}>
      <AttendanceContent />
    </Suspense>
  );
}
