"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FileText, Send, CheckCircle, ArrowLeft, Calendar, User } from "lucide-react";
import { PsychologistLayout } from "../../../../components/PsychologistLayout";
import { apiFetch } from "../../../../lib/api";

type SessionInfo = {
  id: string;
  clientName: string;
  sessionType: string;
  status: string;
  scheduledAt: string;
};

function NotesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId") || "";

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loadingSession, setLoadingSession] = useState(!!sessionId);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [message, setMessage] = useState("");

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [assessmentObservation, setAssessmentObservation] = useState("");
  const [interventions, setInterventions] = useState("");
  const [followUpPlan, setFollowUpPlan] = useState("");
  const [recommendations, setRecommendations] = useState("");

  // Load session info
  useEffect(() => {
    if (!sessionId) return;
    async function loadSession() {
      try {
        const res = await apiFetch(`/api/psychologist/sessions/${sessionId}`);
        setSession(res.data || null);
      } catch (e) {
        console.error("Failed to load session info", e);
      } finally {
        setLoadingSession(false);
      }
    }
    loadSession();
  }, [sessionId]);

  // Load existing notes
  useEffect(() => {
    if (!sessionId) return;
    async function loadNotes() {
      setLoadingNotes(true);
      setMessage("");
      try {
        const res = await apiFetch(`/api/sessions/${sessionId}/notes`);
        if (res && res.data) {
          setChiefComplaint(res.data.chiefComplaint || "");
          setAssessmentObservation(res.data.assessmentObservation || "");
          setInterventions(res.data.interventions || "");
          setFollowUpPlan(res.data.followUpPlan || "");
          setRecommendations(res.data.recommendations || "");
          setExists(res.data.exists);
        }
      } catch (e) {
        console.error("Failed to load notes", e);
      } finally {
        setLoadingNotes(false);
      }
    }
    loadNotes();
  }, [sessionId]);

  const handleSave = async (sendToClient = false) => {
    if (!sessionId) return;
    setIsSaving(true);
    setMessage("");
    try {
      const method = exists ? "PATCH" : "POST";
      await apiFetch(`/api/sessions/${sessionId}/notes`, {
        method,
        body: JSON.stringify({ chiefComplaint, assessmentObservation, interventions, followUpPlan, recommendations })
      });
      setExists(true);
      if (sendToClient) {
        await apiFetch(`/api/sessions/${sessionId}/notes/send`, { method: "POST" });
        setMessage("Catatan berhasil disimpan dan dikirim ke client! Mengarahkan ke jadwal...");
      } else {
        setMessage("Catatan draft berhasil disimpan! Mengarahkan ke jadwal...");
      }
      setTimeout(() => {
        router.push("/dashboard/psychologist");
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage("Gagal menyimpan catatan.");
    } finally {
      setIsSaving(false);
    }
  };

  // No sessionId — prompt user to go back to dashboard
  if (!sessionId) {
    return (
      <PsychologistLayout activeTab="notes">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: "#F1F5F9", display: "grid", placeItems: "center", color: "#94A3B8" }}>
            <FileText size={28} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>Pilih Sesi Terlebih Dahulu</h2>
          <p style={{ color: "#64748B", fontSize: 14, maxWidth: 380, margin: 0 }}>
            Halaman catatan konseling diakses melalui tombol <strong>"Buat Catatan"</strong> pada kartu jadwal di Dashboard.
          </p>
          <button
            onClick={() => router.push("/dashboard/psychologist")}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </button>
        </div>
      </PsychologistLayout>
    );
  }

  return (
    <PsychologistLayout activeTab="notes">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, background: "none", border: "none", color: "#64748B", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0 }}
      >
        <ArrowLeft size={16} /> Kembali ke Jadwal
      </button>

      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Catatan Konseling</h1>
        <p style={{ color: "#64748B", fontSize: 15, fontWeight: 500 }}>Tulis dan bagikan ringkasan hasil sesi konseling kepada client</p>
      </div>

      {/* Session info card */}
      {loadingSession ? (
        <div style={{ marginBottom: 24, backgroundColor: "#F8FAFC", borderRadius: 12, padding: 16, fontSize: 14, color: "#64748B" }}>Memuat info sesi...</div>
      ) : session ? (
        <div style={{ marginBottom: 32, backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 16, padding: "16px 24px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#DBEAFE", display: "grid", placeItems: "center", color: "#2563EB" }}>
              <User size={20} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1E3A8A" }}>{session.clientName}</div>
              <div style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600 }}>{session.sessionType}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#1D4ED8", fontSize: 14, fontWeight: 600 }}>
            <Calendar size={16} />
            {new Date(session.scheduledAt).toLocaleDateString("id-ID", { dateStyle: "long" })}, {(session as any).timeRange || new Date(session.scheduledAt).toLocaleTimeString("id-ID", { timeStyle: "short" })} WIB
          </div>
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, backgroundColor: exists ? "#D1FAE5" : "#FEF3C7", color: exists ? "#059669" : "#92400E", padding: "4px 10px", borderRadius: 20 }}>
            {exists ? "Catatan tersimpan" : "Belum ada catatan"}
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

          {loadingNotes ? (
            <p style={{ color: "#64748B", fontSize: 14 }}>Memuat catatan...</p>
          ) : (
            <div style={{ display: "grid", gap: 20 }}>
              {(
                [
                  { label: "Keluhan Utama", value: chiefComplaint, setter: setChiefComplaint, placeholder: "Tuliskan keluhan utama yang diceritakan oleh client..." },
                  { label: "Observasi & Asesmen", value: assessmentObservation, setter: setAssessmentObservation, placeholder: "Tuliskan hasil observasi klinis dan asesmen psikologis..." },
                  { label: "Intervensi", value: interventions, setter: setInterventions, placeholder: "Tuliskan teknik terapi atau intervensi yang telah diberikan..." },
                  { label: "Rencana Tindak Lanjut", value: followUpPlan, setter: setFollowUpPlan, placeholder: "Tuliskan rencana tindak lanjut untuk sesi berikutnya..." },
                  { label: "Rekomendasi / Catatan Tambahan", value: recommendations, setter: setRecommendations, placeholder: "Rekomendasi atau tugas rumah (homework) untuk dikerjakan client..." },
                ] as { label: string; value: string; setter: (v: string) => void; placeholder: string }[]
              ).map(({ label, value, setter, placeholder }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>{label}</label>
                  <textarea
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    style={{ borderRadius: 8, minHeight: 90, padding: 12, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>
              ))}

              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave(false)}
                  style={{ backgroundColor: "#F1F5F9", color: "#475569", padding: "0 24px", height: 46, borderRadius: 8, fontWeight: 700, fontSize: 14, border: "1px solid #E2E8F0", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                  Simpan Draft
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave(true)}
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF", padding: "0 24px", height: 46, borderRadius: 8, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 6px -1px rgba(37,99,235,0.2)" }}
                >
                  <Send size={16} />
                  {isSaving ? "Menyimpan..." : "Kirim ke Client"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Guide */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginTop: 0, marginBottom: 12 }}>Panduan Penulisan Catatan</h3>
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12, color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
            <li><strong>Objektivitas</strong>: Tuliskan keluhan secara objektif. Hindari penulisan yang memihak atau menghakimi.</li>
            <li><strong>Pengiriman ke Client</strong>: Tombol <em>Kirim ke Client</em> akan mempublikasikan catatan konseling. Client akan melihat rangkuman ini pada detail riwayat pemesanan mereka.</li>
            <li><strong>Simpan Draft</strong>: Jika catatan belum selesai ditulis, gunakan <em>Simpan Draft</em>. Client tidak dapat melihat catatan berstatus draft.</li>
          </ul>
        </div>
      </div>
    </PsychologistLayout>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "#64748B" }}>Memuat halaman...</div>}>
      <NotesContent />
    </Suspense>
  );
}
