"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, CreditCard, Download, FileText, MapPin, Star, Video } from "lucide-react";
import { formatCurrency, type Session } from "@mindbridge/shared";

type StoredSession = Session & {
  clientName?: string;
  psychologistName?: string;
  psychologistTitle?: string;
  psychologistAvatar?: string;
  assignmentMethod?: "AUTO_ASSIGN" | "SELF_SELECT";
  distanceKm?: number;
  hasNotes?: boolean;
  review?: {
    rating: number;
    comment: string;
  } | null;
};

import { apiFetch } from "../../../../lib/api";

export function ClientSessionDetail({ id }: { id: string }) {
  const router = useRouter();
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submittedReview, setSubmittedReview] = useState<{ rating: number; comment: string } | null>(null);

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await apiFetch(`/api/client/sessions/${id}`);
        setSession(res.data || null);
        if (res.data?.review) {
          setSubmittedReview(res.data.review);
        }
      } catch (e) {
        console.error("Failed to load session details", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const handleSendReview = async () => {
    setIsSubmitting(true);
    setSubmitMessage("");
    try {
      await apiFetch(`/api/client/sessions/${id}/review`, {
        method: "POST",
        body: JSON.stringify({
          rating: userRating,
          comment
        })
      });
      setSubmittedReview({ rating: userRating, comment });
      setSubmitMessage("Ulasan Anda berhasil dikirim!");
    } catch (e: any) {
      setSubmitMessage("Gagal mengirim ulasan: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="dashboard-grid">
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
        {/* Left Panel Skeleton */}
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div className="skeleton-pulse" style={{ height: 32, width: 200, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
              <div className="skeleton-pulse" style={{ height: 16, width: 100, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
            </div>
            <div className="skeleton-pulse" style={{ height: 24, width: 100, backgroundColor: "#E2E8F0", borderRadius: 8 }} />
          </div>

          <div className="muted-box" style={{ display: "flex", gap: 16, alignItems: "center", padding: 20 }}>
            <div className="skeleton-pulse" style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#E2E8F0", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div className="skeleton-pulse" style={{ height: 22, width: "60%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
              <div className="skeleton-pulse" style={{ height: 16, width: "40%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div className="muted-box skeleton-pulse" style={{ height: 80, backgroundColor: "#E2E8F0", borderRadius: 12 }} />
            <div className="muted-box skeleton-pulse" style={{ height: 80, backgroundColor: "#E2E8F0", borderRadius: 12 }} />
          </div>

          <div className="muted-box skeleton-pulse" style={{ height: 64, backgroundColor: "#E2E8F0", borderRadius: 12 }} />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
            <div className="skeleton-pulse" style={{ height: 44, width: 150, backgroundColor: "#E2E8F0", borderRadius: 8 }} />
            <div className="skeleton-pulse" style={{ height: 44, width: 150, backgroundColor: "#E2E8F0", borderRadius: 8 }} />
          </div>
        </div>

        {/* Right Panel Skeleton */}
        <aside className="panel" style={{ display: "flex", flexDirection: "column", gap: 16, width: 320, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="skeleton-pulse" style={{ height: 28, width: 150, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
            <div className="skeleton-pulse" style={{ height: 16, width: "80%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
          </div>
          <div className="skeleton-pulse" style={{ height: 120, width: "100%", backgroundColor: "#E2E8F0", borderRadius: 12 }} />
        </aside>
      </section>
    );
  }

  const handlePayNow = () => {
    if (!session) return;
    
    const pendingBooking = {
      id: session.id,
      clientName: session.clientName || "Client Batin",
      psychologistId: session.psychologistId,
      psychologist: {
        name: session.psychologistName || "",
        title: session.psychologistTitle || "",
        pricePerSession: session.amount - 35000
      },
      sessionType: session.sessionType,
      status: session.status,
      scheduledAt: session.scheduledAt,
      amount: session.amount,
      location: session.location || undefined,
      assignmentMethod: session.assignmentMethod || "AUTO_ASSIGN"
    };
    
    localStorage.setItem("mindbridge_pending_booking", JSON.stringify(pendingBooking));
    router.push("/payment");
  };

  if (!session) {
    return (
      <section className="panel">
        <h1 style={{ fontSize: 36 }}>Sesi tidak ditemukan</h1>
        <Link className="button button-primary" href="/dashboard/client" style={{ marginTop: 16 }}>
          Kembali ke Riwayat
        </Link>
      </section>
    );
  }

  return (
    <section className="dashboard-grid" style={{ display: "grid", gap: 24 }}>
      {/* Left Card: Sesi Konseling */}
      <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 20, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)", margin: "0 0 4px 0", fontFamily: "var(--font-playfair)" }}>Sesi Konseling</h1>
            <span style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "monospace" }}>
              #{session.id.split("-")[0].toUpperCase()}
            </span>
          </div>
          <span 
            className="badge warning" 
            style={{ 
              backgroundColor: "rgba(244, 162, 97, 0.15)", 
              color: "#D97706", 
              padding: "6px 14px", 
              fontSize: 11, 
              fontWeight: 800,
              borderRadius: 9999,
              textTransform: "uppercase"
            }}
          >
            {session.status}
          </span>
        </div>

        {/* Psychologist Profile Box */}
        <div className="muted-box" style={{ display: "flex", gap: 16, alignItems: "center", padding: "16px 20px", backgroundColor: "#F8FAFC", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", flexShrink: 0, backgroundColor: "#E2E8F0" }}>
            {session.psychologistAvatar ? (
              <img alt={session.psychologistName} src={session.psychologistAvatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--primary-fixed)", color: "var(--primary)", fontWeight: 700 }}>
                {session.psychologistName ? session.psychologistName[0].toUpperCase() : "?"}
              </div>
            )}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px 0" }}>{session.psychologistName}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
              {session.clientName ? `Sesi untuk ${session.clientName}` : session.psychologistTitle}
            </p>
          </div>
        </div>

        {/* Schedule & Price Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Jadwal */}
          <div>
            <span style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Jadwal</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <Calendar size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                {new Date(session.scheduledAt).toLocaleString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} pukul {new Date(session.scheduledAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </span>
            </div>
          </div>
          
          {/* Biaya Sesi */}
          <div>
            <span style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Biaya Sesi</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <CreditCard size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                Rp {session.amount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Google Meet Link Box */}
        <div style={{ 
          backgroundColor: "#EFF6FF", 
          border: "1px solid #DBEAFE", 
          borderRadius: 12, 
          padding: "16px 20px" 
        }}>
          <span style={{ fontSize: 10, color: "#1D4ED8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
            {session.sessionType === "ONLINE" ? "Link Google Meet" : "Lokasi Pertemuan"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            {session.sessionType === "ONLINE" ? (
              <>
                <Video size={16} color="#1D4ED8" style={{ flexShrink: 0 }} />
                <a 
                  href={session.meetUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ color: "#1D4ED8", fontSize: 13, fontWeight: 600, textDecoration: "underline", wordBreak: "break-all" }}
                >
                  {session.meetUrl || "Link belum tersedia"}
                </a>
              </>
            ) : (
              <>
                <MapPin size={16} color="#1D4ED8" style={{ flexShrink: 0 }} />
                <span style={{ color: "#1E293B", fontSize: 13, fontWeight: 600 }}>
                  {session.location || "Lokasi belum ditentukan"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Buttons Bar */}
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          {session.status === "PENDING_PAYMENT" ? (
            <>
              <button 
                className="button button-primary" 
                onClick={handlePayNow} 
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 700 }}
              >
                <CreditCard size={16} /> Bayar Sekarang
              </button>
              <Link 
                className="button button-secondary" 
                href={`/receipt?id=${session.id}`}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Download size={16} /> Unduh Kwitansi
              </Link>
            </>
          ) : (
            <Link 
              className="button button-primary" 
              href={`/receipt?id=${session.id}`}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Download size={16} /> Unduh Kwitansi
            </Link>
          )}
          {session.hasNotes ? (
            <Link 
              className="button button-secondary" 
              href={`/notes-preview?id=${session.id}`}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <FileText size={16} /> Lihat Catatan
            </Link>
          ) : (
            <button
              className="button button-secondary"
              disabled
              style={{ flex: 1, opacity: 0.5, cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              title="Catatan belum dipublikasikan oleh psikolog"
            >
              <FileText size={16} /> Lihat Catatan
            </button>
          )}
        </div>
      </div>

      {/* Right Card: Ulasan */}
      {session.status === "COMPLETED" ? (
        submittedReview ? (
          <aside className="panel" style={{ display: "flex", flexDirection: "column", gap: 16, padding: 28 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)", marginBottom: 4, fontFamily: "var(--font-playfair)" }}>Ulasan Anda</h2>
              <p style={{ opacity: 0.7, fontSize: 13 }}>Terima kasih telah memberikan ulasan untuk sesi ini.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "8px 0" }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < submittedReview.rating ? "#F59E0B" : "transparent"}
                  color="#F59E0B"
                />
              ))}
            </div>
            <p style={{ fontSize: 14, fontStyle: "italic", color: "#475569", backgroundColor: "#F8FAFC", padding: "14px 18px", borderRadius: 12, border: "1px solid #E2E8F0", lineHeight: 1.5 }}>
              &ldquo;{submittedReview.comment || "Tidak ada komentar tambahan."}&rdquo;
            </p>
          </aside>
        ) : (
          <aside className="panel" style={{ display: "flex", flexDirection: "column", gap: 16, padding: 28 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)", marginBottom: 4, fontFamily: "var(--font-playfair)" }}>Ulasan</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Bagikan pengalaman Anda setelah sesi selesai.</p>
            </div>

            {submitMessage && (
              <div className="badge warning" style={{ borderRadius: 8, padding: 10, justifyContent: "center", width: "100%", fontSize: 12 }}>
                {submitMessage}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0" }}>
              {[1, 2, 3, 4, 5].map((item) => {
                const isSelected = userRating === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setUserRating(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: isSelected ? "1.5px solid #F59E0B" : "1px solid #E2E8F0",
                      backgroundColor: isSelected ? "#FEF3C7" : "#FFFFFF",
                      color: isSelected ? "#B45309" : "#64748B",
                      cursor: "pointer",
                      fontWeight: isSelected ? 700 : 600,
                      fontSize: 13,
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Star size={14} fill="#F59E0B" color="#F59E0B" /> {item}
                  </button>
                );
              })}
            </div>
            
            <textarea
              className="textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan bagaimana sesi ini membantu Anda..."
              style={{ minHeight: 120, resize: "vertical", borderRadius: 8, padding: 12, border: "1px solid var(--border)", fontSize: 14, marginBottom: 12 }}
            />
            
            <button
              className="button button-primary"
              onClick={handleSendReview}
              disabled={isSubmitting}
              style={{ width: "100%", minHeight: 44, borderRadius: 8, fontWeight: 700 }}
            >
              {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </aside>
        )
      ) : (
        <aside className="panel" style={{ display: "flex", flexDirection: "column", gap: 16, padding: 28 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)", marginBottom: 4, fontFamily: "var(--font-playfair)" }}>Ulasan</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Ulasan dapat diberikan setelah sesi selesai terlaksana.</p>
          </div>
        </aside>
      )}
    </section>
  );
}
