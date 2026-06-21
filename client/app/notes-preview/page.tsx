"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Download, 
  AlertTriangle, 
  ArrowLeft, 
  Printer, 
  ShieldCheck, 
  Lock, 
  User, 
  Clock, 
  Video, 
  FileText, 
  Eye, 
  Brain, 
  Calendar, 
  CheckCircle2 
} from "lucide-react";
import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";
import { apiFetch, apiDownload } from "../../lib/api";

type UserData = {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  avatarUrl?: string;
};

function NotesDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  
  const [notes, setNotes] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load logged in user information
    const rawUser = localStorage.getItem("mindbridge_user");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser) as UserData);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setError("ID Sesi tidak ditemukan.");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      try {
        // Fetch counseling notes
        const notesRes = await apiFetch(`/api/sessions/${id}/notes`);
        if (notesRes && notesRes.data) {
          setNotes(notesRes.data);
        } else {
          setError("Catatan sesi tidak ditemukan.");
        }

        // Fetch session details with self-healing fallback
        try {
          const sRes = await apiFetch(`/api/sessions/${id}`);
          if (sRes && sRes.data) {
            setSession(sRes.data);
          }
        } catch (e) {
          // Fallback to client-specific session route if unauthorized for admin endpoint
          try {
            const sRes = await apiFetch(`/api/client/sessions/${id}`);
            if (sRes && sRes.data) {
              setSession(sRes.data);
            }
          } catch (err) {
            console.warn("Failed to fetch session details on fallback:", err);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat catatan konseling.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!id) return;
    setIsDownloading(true);
    try {
      const blob = await apiDownload(`/api/sessions/${id}/notes/pdf`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `catatan-konseling-${id.substring(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message || "Gagal mengunduh file.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDateIndonesian = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getSessionTypeLabel = (type?: string) => {
    switch (type) {
      case "ONLINE":
      case "VIDEO_CALL":
        return "Online Video Call";
      case "VOICE_CALL":
        return "Online Voice Call";
      case "OFFLINE":
        return "Tatap Muka (Offline)";
      default:
        return type || "Konseling";
    }
  };

  // Display-friendly verification hash, e.g. "A1B2C3D4-E5F6"
  const formattedHash = notes?.verificationHash
    ? `${notes.verificationHash.slice(0, 8)}-${notes.verificationHash.slice(8, 12)}`
    : (id?.substring(0, 12).toUpperCase() || "—");
  const docId = notes?.docId || `BTN-CN-${id?.substring(0, 8).toUpperCase() || "UNKNOWN"}`;
  const sessionRef = notes?.sessionRef || id?.substring(0, 8).toUpperCase() || "—";

  if (isLoading) {
    return (
      <section className="panel" style={{ maxWidth: 820, margin: "40px auto", textAlign: "center", padding: "48px" }}>
        <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Memuat catatan konseling...</p>
      </section>
    );
  }

  if (error || !notes) {
    return (
      <section className="panel" style={{ maxWidth: 820, margin: "40px auto", textAlign: "center", display: "grid", gap: 16, padding: "48px" }}>
        <span className="icon-tile red" style={{ margin: "0 auto" }}>
          <AlertTriangle />
        </span>
        <h1 style={{ fontSize: 28, color: "var(--error)", fontWeight: 700 }}>Catatan Tidak Ditemukan</h1>
        <p className="error" style={{ color: "var(--text-secondary)", margin: 0 }}>{error || "Data catatan tidak tersedia."}</p>
        <button className="button button-secondary" style={{ margin: "16px auto 0" }} onClick={() => router.back()}>
          <ArrowLeft size={16} /> Kembali
        </button>
      </section>
    );
  }

  const clientDisplayName = (user?.role === "CLIENT" && user?.fullName) 
    ? user.fullName 
    : (session?.clientName && session.clientName !== "Konseling" ? session.clientName : "Klien Batin");

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Print styles injected cleanly */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          nav, footer, .no-print, button, .back-button, header {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }
          .page-shell {
            min-height: auto !important;
          }
          .container.section {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      ` }} />

      {/* Kembali ke Dashboard Button (no-print) */}
      <div className="no-print" style={{ marginBottom: 20, display: "flex", justifyContent: "flex-start" }}>
        <button 
          onClick={() => router.back()} 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 8, 
            background: "none", 
            border: "none", 
            color: "var(--text-secondary)", 
            fontWeight: 700, 
            fontSize: 14, 
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: 8,
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-container-low)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </button>
      </div>

      {/* Main Medical Document Card */}
      <div className="print-card" style={{ 
        border: "1px solid var(--border)", 
        borderRadius: 18, 
        backgroundColor: "var(--surface)", 
        boxShadow: "var(--shadow)", 
        padding: "40px", 
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Accent Top Color Strip */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "linear-gradient(90deg, var(--primary) 0%, var(--primary-container) 50%, var(--secondary) 100%)"
        }} />

        {/* Document Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start", 
          flexWrap: "wrap", 
          gap: 16, 
          borderBottom: "2px solid var(--border)", 
          paddingBottom: 24, 
          marginBottom: 28 
        }}>
          <div>
            {/* Logo Batin */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#1D4ED8", fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 28C16 28 3 20 3 11C3 6.5 6.5 3 11 3C13.8 3 15.2 4.5 16 5.5C16.8 4.5 18.2 3 21 3C25.5 3 29 6.5 29 11C29 20 16 28 16 28Z" fill="url(#logo-grad-preview)" />
                <path d="M9 13C11 11 13 15 15 12C17 9 19 14 21 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="logo-grad-preview" x1="3" y1="3" x2="29" y2="28" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1D4ED8" />
                    <stop offset="100%" stopColor="#60A5FA" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 800, letterSpacing: "-0.5px" }}>Batin</span>
            </div>
            <h1 style={{ fontSize: 28, color: "var(--primary)", fontFamily: "var(--font-playfair)", fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>Catatan Konseling</h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Salinan Resmi Dokumen Layanan Kesehatan Mental Batin</p>
          </div>
          
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <span className="badge warning" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, padding: "6px 12px", borderRadius: 4, textTransform: "uppercase", fontSize: 11 }}>
              <Lock size={12} /> RAHASIA - DOKUMEN MEDIS
            </span>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "monospace" }}>
              Doc ID: {docId}
            </span>
          </div>
        </div>

        {/* Session Metadata Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
          gap: 16, 
          marginBottom: 32 
        }}>
          {/* Card 1: Psikolog */}
          <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 12, backgroundColor: "var(--surface-bright)", display: "flex", gap: 12, alignItems: "center" }}>
            {session?.psychologistAvatar ? (
              <img src={session.psychologistAvatar} alt="Psikolog" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }} />
            ) : (
              <div style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: "var(--primary-fixed)", color: "var(--primary)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                {session?.psychologistName ? session.psychologistName[0].toUpperCase() : "P"}
              </div>
            )}
            <div>
              <span style={{ fontSize: 10, color: "var(--text-secondary)", display: "block", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Psikolog</span>
              <strong style={{ fontSize: 13, color: "var(--text-primary)", display: "block", marginTop: 2 }}>{session?.psychologistName || "Psikolog Batin"}</strong>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginTop: 1 }}>Psikolog Terverifikasi</span>
            </div>
          </div>

          {/* Card 2: Klien */}
          <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 12, backgroundColor: "var(--surface-bright)", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: "var(--secondary-container)", color: "var(--secondary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <User size={18} />
            </div>
            <div>
              <span style={{ fontSize: 10, color: "var(--text-secondary)", display: "block", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Klien</span>
              <strong style={{ fontSize: 13, color: "var(--text-primary)", display: "block", marginTop: 2 }}>{clientDisplayName}</strong>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginTop: 1 }}>Klien Terverifikasi</span>
            </div>
          </div>

          {/* Card 3: Jadwal */}
          <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 12, backgroundColor: "var(--surface-bright)", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: "rgba(244, 162, 97, 0.15)", color: "var(--tertiary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Clock size={18} />
            </div>
            <div>
              <span style={{ fontSize: 10, color: "var(--text-secondary)", display: "block", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Jadwal Konseling</span>
              <strong style={{ fontSize: 13, color: "var(--text-primary)", display: "block", marginTop: 2 }}>{formatDateIndonesian(session?.scheduledAt)}</strong>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginTop: 1 }}>{session?.timeRange || "Selesai"} WIB</span>
            </div>
          </div>

          {/* Card 4: Metode */}
          <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 12, backgroundColor: "var(--surface-bright)", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: "var(--primary-fixed)", color: "var(--primary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Video size={18} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontSize: 10, color: "var(--text-secondary)", display: "block", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Metode Layanan</span>
              <strong style={{ fontSize: 13, color: "var(--text-primary)", display: "block", marginTop: 2 }}>{getSessionTypeLabel(session?.sessionType)}</strong>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginTop: 1 }}>Sesi ID: {sessionRef}</span>
            </div>
          </div>
        </div>

        {/* Structured Clinical Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 36 }}>
          
          {/* Keluhan Utama */}
          <div style={{ 
            borderLeft: "4px solid var(--primary-container)", 
            borderRadius: "0 12px 12px 0", 
            backgroundColor: "#F8FAFC", 
            padding: "20px 24px", 
            border: "1px solid var(--border)", 
            borderLeftWidth: 4,
            transition: "transform 0.2s ease, box-shadow 0.2s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary)", fontWeight: 700, marginBottom: 10, fontSize: 15 }}>
              <FileText size={18} />
              <span>Keluhan Utama</span>
            </div>
            <p style={{ color: "var(--text-primary)", margin: 0, fontSize: 14, lineHeight: 1.6 }}>{notes.chiefComplaint}</p>
          </div>

          {/* Observasi & Asesmen Klinis */}
          <div style={{ 
            borderLeft: "4px solid var(--secondary)", 
            borderRadius: "0 12px 12px 0", 
            backgroundColor: "#F0FDF4", 
            padding: "20px 24px", 
            border: "1px solid var(--border)", 
            borderLeftWidth: 4 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--secondary)", fontWeight: 700, marginBottom: 10, fontSize: 15 }}>
              <Eye size={18} />
              <span>Observasi & Asesmen Klinis</span>
            </div>
            <p style={{ color: "var(--text-primary)", margin: 0, fontSize: 14, lineHeight: 1.6 }}>{notes.assessmentObservation}</p>
          </div>

          {/* Intervensi Terapi */}
          <div style={{ 
            borderLeft: "4px solid #7a3f02", 
            borderRadius: "0 12px 12px 0", 
            backgroundColor: "#FFFBEB", 
            padding: "20px 24px", 
            border: "1px solid var(--border)", 
            borderLeftWidth: 4 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#7a3f02", fontWeight: 700, marginBottom: 10, fontSize: 15 }}>
              <Brain size={18} />
              <span>Intervensi Terapi</span>
            </div>
            <p style={{ color: "var(--text-primary)", margin: 0, fontSize: 14, lineHeight: 1.6 }}>{notes.interventions}</p>
          </div>

          {/* Rencana Tindak Lanjut */}
          <div style={{ 
            borderLeft: "4px solid var(--warning)", 
            borderRadius: "0 12px 12px 0", 
            backgroundColor: "#FFFBF5", 
            padding: "20px 24px", 
            border: "1px solid var(--border)", 
            borderLeftWidth: 4 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--tertiary)", fontWeight: 700, marginBottom: 10, fontSize: 15 }}>
              <Calendar size={18} />
              <span>Rencana Tindak Lanjut</span>
            </div>
            <p style={{ color: "var(--text-primary)", margin: 0, fontSize: 14, lineHeight: 1.6 }}>{notes.followUpPlan}</p>
          </div>

          {/* Rekomendasi Psikolog Callout Box */}
          {notes.recommendations && (
            <div style={{ 
              border: "1.5px dashed var(--success)", 
              borderRadius: 12, 
              backgroundColor: "rgba(76, 175, 145, 0.05)", 
              padding: "20px 24px", 
              marginTop: 8,
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#0f6a52", fontWeight: 800, marginBottom: 8, fontSize: 15 }}>
                <CheckCircle2 size={20} />
                <span>Rekomendasi Psikolog</span>
              </div>
              <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 15, margin: 0, lineHeight: 1.6 }}>{notes.recommendations}</p>
            </div>
          )}
        </div>

        {/* Verification Footer & Seal */}
        <div style={{ 
          borderTop: "1px solid var(--border)", 
          paddingTop: 28, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          flexWrap: "wrap", 
          gap: 20 
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", maxWidth: 480 }}>
            <div style={{ color: "var(--success)", flexShrink: 0 }}>
              <ShieldCheck size={40} />
            </div>
            <div>
              <strong style={{ fontSize: 13, color: "var(--text-primary)", display: "block", marginBottom: 2 }}>Dokumen Resmi Terverifikasi</strong>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.45 }}>
                Catatan konseling ini diterbitkan secara resmi oleh psikolog berlisensi di platform Batin (PT Mental Anak Bangsa). Kerahasiaan data medis dilindungi di bawah Undang-Undang Kesehatan Republik Indonesia.
              </p>
            </div>
          </div>
          
          <div style={{ 
            border: "1px solid rgba(76, 175, 145, 0.3)", 
            backgroundColor: "rgba(76, 175, 145, 0.03)", 
            padding: "10px 16px", 
            borderRadius: 8, 
            textAlign: "right" 
          }}>
            <span style={{ fontSize: 9, color: "#0f6a52", display: "block", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Clinical Record Verification</span>
            <span style={{ fontSize: 12, color: "var(--text-primary)", display: "block", fontWeight: 700, fontFamily: "monospace", margin: "2px 0" }}>HASH: {formattedHash}</span>
            <span style={{ fontSize: 9, color: "var(--text-secondary)", display: "block" }}>ELECTRONIC RECORD SYSTEM</span>
          </div>
        </div>

        {/* Action Buttons (no-print) */}
        <div className="no-print" style={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: 12, 
          marginTop: 36, 
          borderTop: "1px solid var(--border)", 
          paddingTop: 24 
        }}>
          <button 
            className="button button-secondary" 
            type="button" 
            onClick={handlePrint} 
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Printer size={18} /> Cetak Catatan
          </button>
          
          <button
            className="button button-primary"
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            style={{ display: "flex", alignItems: "center", gap: 8, opacity: isDownloading ? 0.7 : 1 }}
          >
            <Download size={18} /> {isDownloading ? "Menyiapkan PDF..." : "Unduh PDF Resmi"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotesPreviewPage() {
  return (
    <div className="page-shell">
      <NavBar />
      <main className="container section">
        <Suspense fallback={
          <section className="panel" style={{ maxWidth: 820, margin: "40px auto", textAlign: "center", padding: "48px" }}>
            <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Menyiapkan catatan...</p>
          </section>
        }>
          <NotesDetails />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

