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
    <section className="dashboard-grid">
      <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 4 }}>Sesi Konseling</h1>
            <span style={{ fontSize: 14, opacity: 0.5, fontFamily: "monospace", letterSpacing: 1 }}>
              #{session.id.split("-")[0].toUpperCase()}
            </span>
          </div>
          <span className={session.status === "CONFIRMED" ? "badge success" : "badge warning"} style={{ padding: "6px 14px", fontSize: 13 }}>
            {session.status}
          </span>
        </div>

        <div className="muted-box" style={{ display: "flex", gap: 16, alignItems: "center", padding: 20 }}>
          <div className="avatar" style={{ width: 64, height: 64, flexShrink: 0, backgroundColor: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {session.psychologistAvatar ? (
              <img alt={session.psychologistName} src={session.psychologistAvatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ opacity: 0.4 }}>?</span>
            )}
          </div>
          <div>
            <h3 style={{ fontSize: 22, marginBottom: 4 }}>{session.psychologistName}</h3>
            <p style={{ opacity: 0.7, fontSize: 15 }}>
              {session.clientName ? `Sesi untuk ${session.clientName}` : session.psychologistTitle}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div className="muted-box" style={{ padding: 16 }}>
            <span style={{ fontSize: 12, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Jadwal</span>
            <p style={{ fontWeight: 500, marginTop: 8, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={18} opacity={0.7} />
              {new Date(session.scheduledAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })} WIB
            </p>
          </div>
          <div className="muted-box" style={{ padding: 16 }}>
            <span style={{ fontSize: 12, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Biaya Sesi</span>
            <p style={{ fontWeight: 500, marginTop: 8, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
              <CreditCard size={18} opacity={0.7} />
              {formatCurrency(session.amount)}
            </p>
          </div>
        </div>

        <div className="muted-box" style={{ padding: 16 }}>
          <span style={{ fontSize: 12, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>
            {session.sessionType === "ONLINE" ? "Link Google Meet" : "Lokasi Pertemuan"}
          </span>
          <div style={{ marginTop: 8, fontSize: 15, fontWeight: 500, display: "flex", alignItems: "flex-start", gap: 8, wordBreak: "break-all" }}>
            {session.sessionType === "ONLINE" ? <Video size={18} opacity={0.7} style={{ flexShrink: 0, marginTop: 2 }} /> : <MapPin size={18} opacity={0.7} style={{ flexShrink: 0, marginTop: 2 }} />}
            {session.sessionType === "ONLINE" ? (
              <a href={session.meetUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }}>
                {session.meetUrl || "Link belum tersedia"}
              </a>
            ) : (
              <span>{session.location || "Lokasi belum ditentukan"}</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
          {session.status === "PENDING_PAYMENT" ? (
            <>
              <button 
                className="button button-primary" 
                onClick={handlePayNow} 
                style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}
              >
                <CreditCard size={18} /> Bayar Sekarang
              </button>
              <Link className="button button-secondary" href={`/receipt?id=${session.id}`}>
                <Download size={18} /> Unduh Kwitansi
              </Link>
            </>
          ) : (
            <Link className="button button-primary" href={`/receipt?id=${session.id}`}>
              <Download size={18} /> Unduh Kwitansi
            </Link>
          )}
          {session.hasNotes ? (
            <Link className="button button-secondary" href={`/notes-preview?id=${session.id}`}>
              <FileText size={18} /> Lihat Catatan
            </Link>
          ) : (
            <button
              className="button button-secondary"
              disabled
              style={{ opacity: 0.5, cursor: "not-allowed", display: "flex", alignItems: "center", gap: 8 }}
              title="Catatan belum dipublikasikan oleh psikolog"
            >
              <FileText size={18} /> Lihat Catatan
            </button>
          )}
        </div>

      </div>

      {session.status === "COMPLETED" ? (
        submittedReview ? (
          <aside className="panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 28, marginBottom: 4 }}>Ulasan Anda</h2>
              <p style={{ opacity: 0.7 }}>Terima kasih telah memberikan ulasan untuk sesi ini.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "8px 0" }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  fill={i < submittedReview.rating ? "#F59E0B" : "transparent"}
                  color="#F59E0B"
                />
              ))}
            </div>
            <p style={{ fontSize: 15, fontStyle: "italic", color: "#475569", backgroundColor: "#F8FAFC", padding: "14px 18px", borderRadius: 12, border: "1px solid #E2E8F0", lineHeight: 1.5 }}>
              &ldquo;{submittedReview.comment || "Tidak ada komentar tambahan."}&rdquo;
            </p>
          </aside>
        ) : (
          <aside className="panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 28, marginBottom: 4 }}>Ulasan</h2>
              <p style={{ opacity: 0.7 }}>Bagikan pengalaman Anda setelah sesi selesai.</p>
            </div>

            {submitMessage && (
              <div className="badge warning" style={{ borderRadius: 8, padding: 10, justifyContent: "center", width: "100%", fontSize: 13 }}>
                {submitMessage}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map((item) => {
                const isSelected = userRating === item;
                return (
                  <button
                    className="chip-button"
                    key={item}
                    type="button"
                    onClick={() => setUserRating(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 12,
                      border: isSelected ? "2px solid #2563EB" : "1px solid #E2E8F0",
                      backgroundColor: isSelected ? "#F0F7FF" : "#FFFFFF",
                      cursor: "pointer",
                      fontWeight: isSelected ? 700 : 500,
                      transition: "all 0.2s"
                    }}
                  >
                    <Star size={16} fill="#F59E0B" color="#F59E0B" /> {item}
                  </button>
                );
              })}
            </div>
            <textarea
              className="textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan bagaimana sesi ini membantu Anda..."
              style={{ minHeight: 120, resize: "vertical", borderRadius: 10, padding: 12 }}
            />
            <button
              className="button button-primary"
              onClick={handleSendReview}
              disabled={isSubmitting}
              style={{ marginTop: "auto", minHeight: 44, borderRadius: 10, backgroundColor: "#2563EB", fontWeight: 700 }}
            >
              {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </aside>
        )
      ) : (
        <aside className="panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 28, marginBottom: 4 }}>Ulasan</h2>
            <p style={{ opacity: 0.7 }}>Ulasan dapat diberikan setelah sesi selesai terlaksana.</p>
          </div>
        </aside>
      )}
    </section>
  );
}
