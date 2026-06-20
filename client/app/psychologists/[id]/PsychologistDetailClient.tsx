"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { notFound, useRouter } from "next/navigation";
import { Star, GraduationCap, FileBadge, Phone, Video } from "lucide-react";
import { getTodayBookingDateStr, isPastBookingSlot, type Psychologist } from "@mindbridge/shared";
import { Footer } from "../../../components/Footer";
import { NavBar } from "../../../components/NavBar";
import { apiFetch } from "../../../lib/api";

export default function PsychologistDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(`/api/psychologists/${id}`);
        if (res.data) {
          setPsychologist(res.data);
        } else {
          setError(true);
        }
      } catch (e) {
        console.error("Not found", e);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const groupedSlots = useMemo(() => {
    if (!psychologist) return {};
    return psychologist.availableSlots.reduce((acc, slot) => {
      const [date, time] = slot.split("T");
      if (!acc[date]) acc[date] = [];
      acc[date].push(time);
      return acc;
    }, {} as Record<string, string[]>);
  }, [psychologist]);

  const availableDates = useMemo(() => Object.keys(groupedSlots).sort(), [groupedSlots]);
  const firstSelectableDate = useMemo(() => {
    return availableDates.find((date) => groupedSlots[date]?.some((slot) => !isPastBookingSlot(date, slot, currentTime))) || availableDates[0] || "";
  }, [availableDates, currentTime, groupedSlots]);
  const isSelectedTimePast = useMemo(() => Boolean(selectedDate && selectedTime && isPastBookingSlot(selectedDate, selectedTime, currentTime)), [currentTime, selectedDate, selectedTime]);
  const canBookSelectedSlot = Boolean(selectedDate && selectedTime && !isSelectedTimePast);

  useEffect(() => {
    if (firstSelectableDate && !selectedDate) {
      setSelectedDate(firstSelectableDate);
    }
  }, [firstSelectableDate, selectedDate]);

  useEffect(() => {
    if (isSelectedTimePast) {
      setSelectedTime("");
    }
  }, [isSelectedTimePast]);

  if (isLoading) {
    return (
      <div className="page-shell" style={{ backgroundColor: "#F8FAFC" }}>
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
        <NavBar active="psychologists" />
        <main className="container section">
          <section className="dashboard-grid" style={{ alignItems: "flex-start", gap: 32 }}>
            {/* Left Content Skeleton */}
            <div style={{ display: "flex", flexDirection: "column", gap: 48, flex: 1, minWidth: 0 }}>
              {/* Header Skeleton */}
              <div>
                <div className="skeleton-pulse" style={{ height: 26, width: 250, backgroundColor: "#E2E8F0", borderRadius: 4, marginBottom: 24 }} />
                <div className="psychologist-detail-header" style={{ gap: 24, display: "flex" }}>
                  <div className="skeleton-pulse" style={{ width: 140, height: 140, borderRadius: 16, backgroundColor: "#E2E8F0", flexShrink: 0 }} />
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, flex: 1 }}>
                    <div className="skeleton-pulse" style={{ height: 28, width: "60%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <div className="skeleton-pulse" style={{ height: 32, width: 100, backgroundColor: "#E2E8F0", borderRadius: 20 }} />
                      <div className="skeleton-pulse" style={{ height: 32, width: 100, backgroundColor: "#E2E8F0", borderRadius: 20 }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Skeleton */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="skeleton-pulse" style={{ height: 26, width: 200, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                </div>
                <div style={{ display: "flex", gap: 16, overflowX: "hidden" }}>
                  {[1, 2].map((i) => (
                    <div key={i} style={{ minWidth: 280, backgroundColor: "#FFFFFF", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0", flex: 1 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                        <div className="skeleton-pulse" style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#E2E8F0" }} />
                        <div className="skeleton-pulse" style={{ height: 14, width: 80, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                      </div>
                      <div className="skeleton-pulse" style={{ height: 14, width: "100%", backgroundColor: "#E2E8F0", borderRadius: 4, marginBottom: 6 }} />
                      <div className="skeleton-pulse" style={{ height: 14, width: "70%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* About Skeleton */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="skeleton-pulse" style={{ height: 26, width: 150, backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                <div className="profile-info-grid" style={{ gap: 24, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  <div className="skeleton-pulse" style={{ height: 80, backgroundColor: "#E2E8F0", borderRadius: 12 }} />
                  <div className="skeleton-pulse" style={{ height: 80, backgroundColor: "#E2E8F0", borderRadius: 12 }} />
                </div>
                <div className="skeleton-pulse" style={{ height: 14, width: "100%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                <div className="skeleton-pulse" style={{ height: 14, width: "95%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
                <div className="skeleton-pulse" style={{ height: 14, width: "40%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
              </div>
            </div>

            {/* Right Sidebar Skeleton */}
            <aside style={{ backgroundColor: "#FFFFFF", padding: 24, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", width: 320, display: "flex", flexDirection: "column", gap: 20, flexShrink: 0 }}>
              <div className="skeleton-pulse" style={{ height: 22, width: "50%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
              <div className="skeleton-pulse" style={{ height: 16, width: "80%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
              <div style={{ display: "flex", gap: 8, overflowX: "hidden" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-pulse" style={{ height: 50, width: 70, backgroundColor: "#E2E8F0", borderRadius: 8, flexShrink: 0 }} />
                ))}
              </div>
              <div className="skeleton-pulse" style={{ height: 16, width: "40%", backgroundColor: "#E2E8F0", borderRadius: 4 }} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-pulse" style={{ height: 36, width: 80, backgroundColor: "#E2E8F0", borderRadius: 8 }} />
                ))}
              </div>
              <div className="skeleton-pulse" style={{ height: 48, width: "100%", backgroundColor: "#E2E8F0", borderRadius: 8 }} />
            </aside>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !psychologist) {
    notFound();
  }

  const firstName = psychologist.name.replace("Dr. ", "").split(",")[0].split(" ")[0];

  function handleBooking() {
    if (!canBookSelectedSlot) {
      alert("Silakan pilih tanggal dan jam yang masih tersedia terlebih dahulu");
      return;
    }
    // Set query params in the URL so BookingFlow can automatically pick up this slot if needed
    router.push(`/booking?psychologist=${psychologist?.id}&date=${selectedDate}&time=${selectedTime}`);
  }

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
    const day = d.getDate();
    const month = d.toLocaleDateString("id-ID", { month: "short" });
    return { dayName, dayMonth: `${day} ${month}` };
  };

  return (
    <div className="page-shell" style={{ backgroundColor: "#F8FAFC" }}>
      <NavBar active="psychologists" />
      <main className="container section">
        <section className="dashboard-grid" style={{ alignItems: "flex-start", gap: 32 }}>

          {/* Main Left Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>

            {/* Header Area */}
            <div>
              <h1 style={{ fontSize: 26, marginBottom: 24, color: "#0F172A", fontWeight: 700 }}>Profil Psikolog {firstName}</h1>
              <div className="psychologist-detail-header">
                <div style={{ width: 140, height: 140, borderRadius: 16, overflow: "hidden", flexShrink: 0 }}>
                  <img src={psychologist.avatarUrl} alt={psychologist.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>{psychologist.name}</h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {psychologist.specializations.map((spec) => (
                      <span key={spec} style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                        {spec}
                      </span>
                    ))}
                    <span style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                      + lainnya
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Area */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Reviews Psikolog {firstName}</h3>
                <Link href="#" style={{ color: "#2563EB", fontWeight: 600, fontSize: 15 }}>Lihat Semua</Link>
              </div>
              <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
                {[1, 2].map((i) => (
                  <div key={i} style={{ minWidth: 280, backgroundColor: "#FFFFFF", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#2563EB", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                        {i === 1 ? "N." : "S."}
                      </div>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill="#F59E0B" color="#F59E0B" />)}
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.5 }}>
                      {i === 1 ? "Sangat membantu memahami hal-hal yang membebani dan banyak dapet framework, exercise, dan resource" : "Terima kasih kak sudah mendengarkanku, memahami ceritaku, memberikan tips buat"}
                      <strong style={{ color: "#2563EB", cursor: "pointer", marginLeft: 4 }}>Lihat lebih banyak</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* About Area */}
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Tentang {firstName}</h3>
              <div className="profile-info-grid">
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <GraduationCap size={18} color="#2563EB" /> Pendidikan
                  </h4>
                  <ul style={{ paddingLeft: 24, margin: 0, color: "#64748B", fontSize: 14, lineHeight: 1.6 }}>
                    <li>Profesi Psikolog Umum Universitas Terkemuka</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <FileBadge size={18} color="#2563EB" /> Nomor Izin Praktek
                  </h4>
                  <p style={{ color: "#64748B", fontSize: 14, paddingLeft: 26 }}>STR20261358-2026-0525</p>
                </div>
              </div>
              <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6 }}>
                {psychologist.bio} Ia meyakini bahwa pikiran, emosi, dan pengalaman hidup saling terhubung dalam membentuk cara seseorang mem...
                <strong style={{ color: "#2563EB", cursor: "pointer" }}>Lihat lebih banyak</strong>
              </p>
            </div>

            {/* Contact Methods */}
            <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 24 }}>
              <span style={{ fontSize: 15, color: "#64748B", marginRight: 16 }}>Melayani via :</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, color: "#0F172A", fontWeight: 500, marginRight: 16 }}>
                <Phone size={16} color="#2563EB" /> Voice Call
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, color: "#0F172A", fontWeight: 500 }}>
                <Video size={16} color="#2563EB" /> Video Call
              </span>
            </div>

            {/* Quote Block */}
            <div style={{ backgroundColor: "#FEFAED", padding: "24px 48px", borderRadius: 16, textAlign: "center", position: "relative", marginTop: 16 }}>
              <span style={{ position: "absolute", top: 12, left: 16, fontSize: 64, color: "#FDE68A", lineHeight: 1, fontFamily: "serif" }}>"</span>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#2563EB", fontStyle: "italic", position: "relative", zIndex: 2 }}>
                "Everything will be okay in the end. If it's not okay, it's not the end"
              </p>
              <span style={{ position: "absolute", bottom: -24, right: 16, fontSize: 64, color: "#FDE68A", lineHeight: 1, fontFamily: "serif", transform: "rotate(180deg)" }}>"</span>
            </div>
          </div>

          {/* Right Sidebar - Jadwal Praktek */}
          <aside style={{ backgroundColor: "#FFFFFF", padding: 24, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", position: "sticky", top: 100 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 20 }}>Jadwal Praktek</h3>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 12 }}>Pilih Tanggal dan Waktu Online</p>

            {availableDates.length > 0 ? (
              <>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #F1F5F9" }}>
                  {availableDates.map((dateStr, idx) => {
                    const { dayName, dayMonth } = formatDateLabel(dateStr);
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => { setSelectedDate(dateStr); setSelectedTime(""); }}
                        style={{
                          minWidth: 70, padding: "8px 12px", borderRadius: 8, border: `1px solid ${isSelected ? "#2563EB" : "#E2E8F0"}`,
                          backgroundColor: "#FFF", color: isSelected ? "#2563EB" : "#64748B", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer"
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400 }}>{dateStr === getTodayBookingDateStr(currentTime) ? "Hari ini" : dayName}</span>
                        <span style={{ fontSize: 12 }}>{dayMonth}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 12 }}>Siang-Sore</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
                      {groupedSlots[selectedDate]?.map((time) => {
                        const isSelected = selectedTime === time;
                        const isPast = isPastBookingSlot(selectedDate, time, currentTime);
                        return (
                          <button
                            key={time}
                            disabled={isPast}
                            onClick={() => setSelectedTime(time)}
                            style={{
                              padding: "8px 16px", borderRadius: 8, border: `1px solid ${isSelected ? "#2563EB" : "#E2E8F0"}`,
                              backgroundColor: isPast ? "#F8FAFC" : "#FFF", color: isSelected ? "#2563EB" : (isPast ? "#94A3B8" : "#475569"), fontSize: 14, fontWeight: isSelected ? 600 : 500, cursor: isPast ? "not-allowed" : "pointer", opacity: isPast ? 0.7 : 1
                            }}
                          >
                            {time} WIB
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: 14, color: "#64748B", marginBottom: 24 }}>Belum ada jadwal tersedia saat ini.</p>
            )}

            <button
              onClick={handleBooking}
              style={{
                width: "100%", padding: "14px 0", backgroundColor: canBookSelectedSlot ? "#2563EB" : "#94A3B8",
                color: "#FFF", borderRadius: 8, fontSize: 15, fontWeight: 600, border: "none", cursor: canBookSelectedSlot ? "pointer" : "not-allowed"
              }}
            >
              Pilih Jadwal
            </button>
          </aside>

        </section>
      </main>
      <Footer />
    </div>
  );
}
