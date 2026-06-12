"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { Search, Star, Clock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Psychologist } from "@mindbridge/shared";
import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";
import { apiFetch } from "../../lib/api";

export default function PsychologistsPage() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchInput, setSearchInput] = useState("");
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState("ALL");
  const [selectedSpecialization, setSelectedSpecialization] = useState("ALL");

  // Active filter states applied to search results
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [activeDateIndex, setActiveDateIndex] = useState<number | null>(null);
  const [activeTime, setActiveTime] = useState("ALL");
  const [activeSpecialization, setActiveSpecialization] = useState("ALL");
  const [isFiltered, setIsFiltered] = useState(false);

  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [psychRes, specRes] = await Promise.all([
          apiFetch("/api/psychologists"),
          apiFetch("/api/specializations")
        ]);
        setPsychologists(psychRes.data || []);
        setSpecializations(specRes.data || []);
      } catch (e) {
        console.error("Failed to load list", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Generate 14 days filter options dynamically
  const getFilterDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const filterDates = getFilterDates();

  const psychologists24h = useMemo(() => {
    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const filtered = psychologists.filter((p) => {
      return p.availableSlots.some((slot) => {
        const [dateStr, timeStr] = slot.split("T");
        const startTime = timeStr.split(" - ")[0];
        const slotDate = new Date(`${dateStr}T${startTime}:00+07:00`);
        return slotDate >= now && slotDate <= oneDayLater;
      });
    });
    const sorted = [...filtered].sort((a, b) => {
      const getSoonestSlot = (p: Psychologist) => {
        const slots = p.availableSlots
          .map((slot) => {
            const [d, t] = slot.split("T");
            return new Date(`${d}T${t.split(" - ")[0]}:00+07:00`).getTime();
          })
          .filter((time) => time >= now.getTime() && time <= oneDayLater.getTime());
        return slots.length > 0 ? Math.min(...slots) : Infinity;
      };
      return getSoonestSlot(a) - getSoonestSlot(b);
    });
    return sorted.length > 0 ? sorted.slice(0, 4) : psychologists.slice(0, 4);
  }, [psychologists]);

  const psychologistsNight = useMemo(() => {
    const now = new Date();
    const filtered = psychologists.filter((p) => {
      return p.availableSlots.some((slot) => {
        const timePart = slot.split("T")[1] || "";
        const startTime = timePart.split(" - ")[0] || "";
        return startTime >= "15:00";
      });
    });
    const sorted = [...filtered].sort((a, b) => {
      const getSoonestNight = (p: Psychologist) => {
        const slots = p.availableSlots
          .filter((slot) => (slot.split("T")[1] || "") >= "15:00")
          .map((slot) => {
            const [d, t] = slot.split("T");
            return new Date(`${d}T${t.split(" - ")[0]}:00+07:00`).getTime();
          });
        return slots.length > 0 ? Math.min(...slots) : Infinity;
      };
      return getSoonestNight(a) - getSoonestNight(b);
    });
    return sorted.length > 0 ? sorted.slice(0, 4) : psychologists.slice(2, 6);
  }, [psychologists]);

  const getLocalDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const date = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  };

  const getDayLabel = (date: Date, index: number) => {
    const dayName = date.toLocaleDateString("id-ID", { weekday: "long" });
    const dateStr = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    if (index === 0) {
      return `Besok\n${dateStr}`;
    }
    return `${dayName}\n${dateStr}`;
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearchQuery(searchInput);
    setActiveDateIndex(selectedDateIndex);
    setActiveTime(selectedTime);
    setActiveSpecialization(selectedSpecialization);
    setIsFiltered(!!searchInput || selectedDateIndex !== null || selectedTime !== "ALL" || selectedSpecialization !== "ALL");
  };

  const handleDateSelect = (index: number) => {
    const newIndex = selectedDateIndex === index ? null : index;
    setSelectedDateIndex(newIndex);
    setActiveDateIndex(newIndex);
    
    // Sync other inputs
    setActiveSearchQuery(searchInput);
    setActiveTime(selectedTime);
    setActiveSpecialization(selectedSpecialization);
    setIsFiltered(!!searchInput || newIndex !== null || selectedTime !== "ALL" || selectedSpecialization !== "ALL");
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedTime(val);
    setActiveTime(val);
    
    // Sync other inputs
    setActiveSearchQuery(searchInput);
    setActiveDateIndex(selectedDateIndex);
    setActiveSpecialization(selectedSpecialization);
    setIsFiltered(!!searchInput || selectedDateIndex !== null || val !== "ALL" || selectedSpecialization !== "ALL");
  };

  const handleSpecializationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSpecialization(val);
    setActiveSpecialization(val);
    
    // Sync other inputs
    setActiveSearchQuery(searchInput);
    setActiveDateIndex(selectedDateIndex);
    setActiveTime(selectedTime);
    setIsFiltered(!!searchInput || selectedDateIndex !== null || selectedTime !== "ALL" || val !== "ALL");
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSelectedDateIndex(null);
    setSelectedTime("ALL");
    setSelectedSpecialization("ALL");
    
    setActiveSearchQuery("");
    setActiveDateIndex(null);
    setActiveTime("ALL");
    setActiveSpecialization("ALL");
    setIsFiltered(false);
  };

  const filteredPsychologists = psychologists.filter((p) => {
    const matchesSearch = !activeSearchQuery ||
      p.name.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      p.specializations.some((s) => s.toLowerCase().includes(activeSearchQuery.toLowerCase()));

    const matchesSpecialization = activeSpecialization === "ALL" ||
      p.specializations.some((s) => s.toLowerCase() === activeSpecialization.toLowerCase());

    const hasMatchingSlot = (activeDateIndex === null && activeTime === "ALL") ||
      p.availableSlots.some((slot) => {
        const [datePart, timePart] = slot.split("T");

        // Date check
        if (activeDateIndex !== null) {
          const targetDate = filterDates[activeDateIndex];
          const targetDateStr = getLocalDateStr(targetDate);
          if (datePart !== targetDateStr) return false;
        }

        // Time check
        if (activeTime !== "ALL") {
          const startTime = timePart.split(" - ")[0];
          if (activeTime === "PAGI" && !(startTime >= "08:00" && startTime < "12:00")) return false;
          if (activeTime === "SIANG" && !(startTime >= "12:00" && startTime < "15:00")) return false;
          if (activeTime === "SORE" && !(startTime >= "15:00" && startTime < "18:00")) return false;
        }

        return true;
      });

    return matchesSearch && matchesSpecialization && hasMatchingSlot;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const HorizontalCard = ({ p }: { p: Psychologist }) => (
    <div style={{ minWidth: 260, width: 260, backgroundColor: "#FFF", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 260, width: "100%", backgroundColor: "#F1F5F9", position: "relative" }}>
        <img src={p.avatarUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        <div style={{ position: "absolute", bottom: 8, left: 8, backgroundColor: "#FFF", padding: "4px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, color: "#10B981", display: "flex", alignItems: "center", gap: 4 }}>
          <CheckCircle2 size={12} /> Psikolog Berlisensi
        </div>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 4, lineHeight: 1.3 }}>{p.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
          <Star size={14} fill="#F59E0B" color="#F59E0B" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>{p.rating}</span>
          <span style={{ fontSize: 13, color: "#64748B" }}>(90+ reviews)</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.6 }}>
            <span style={{ textDecoration: "line-through", fontSize: 13 }}>Rp350.000</span>
            <span style={{ backgroundColor: "#D1FAE5", color: "#059669", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>-25%</span>
          </div>
          <strong style={{ fontSize: 18, color: "#0F172A", display: "block", marginTop: 2 }}>{formatCurrency(p.pricePerSession)}</strong>
        </div>
        <p style={{ fontSize: 12, color: "#64748B", marginBottom: 8, fontWeight: 600 }}>Jadwal Tercepat</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "auto" }}>
          {p.availableSlots.slice(0, 2).map((s, i) => {
            const time = s.split("T")[1];
            return (
              <span key={i} style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 0", textAlign: "center", fontSize: 11, color: "#475569", fontWeight: 500 }}>
                {time} WIB
              </span>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 8, marginTop: 16 }}>
          <Link href={`/psychologists/${p.id}`} style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 36,
            fontSize: 13,
            padding: "0 8px",
            border: "1px solid #CBD5E1",
            borderRadius: 8,
            backgroundColor: "#FFFFFF",
            color: "#475569",
            fontWeight: 600,
            textDecoration: "none"
          }}>
            Lihat Profil
          </Link>
          <Link href={`/booking?psychologist=${p.id}`} style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 36,
            fontSize: 13,
            padding: "0 8px",
            borderRadius: 8,
            backgroundColor: "#2563EB",
            color: "#FFFFFF",
            fontWeight: 700,
            textDecoration: "none"
          }}>
            Konseling Sekarang
          </Link>
        </div>
      </div>
    </div>
  );

  const VerticalListCard = ({ p }: { p: Psychologist }) => (
    <div className="psychologist-list-card">
      <div className="psychologist-list-card-image">
        <img src={p.avatarUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#10B981" }}>
          <CheckCircle2 size={14} /> Psikolog Berlisensi
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{p.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Star size={14} fill="#F59E0B" color="#F59E0B" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>{p.rating}</span>
          <span style={{ fontSize: 13, color: "#64748B" }}>(120+ reviews)</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 12, color: "#64748B", marginBottom: 6, fontWeight: 600 }}>Jadwal Terdekat</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {p.availableSlots.slice(0, 2).map((s, i) => {
              const d = new Date(s.split("T")[0]);
              const time = s.split("T")[1];
              const day = d.toLocaleDateString("id-ID", { weekday: "short" });
              return (
                <span key={i} style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 16px", fontSize: 12, color: "#475569", fontWeight: 500 }}>
                  {day}, {time} WIB
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div className="psychologist-list-card-actions">
        <Link href={`/psychologists/${p.id}`} style={{ padding: "10px 0", textAlign: "center", border: "1px solid #2563EB", color: "#2563EB", borderRadius: 8, fontWeight: 600, fontSize: 14, display: "block" }}>
          Lihat Profil
        </Link>
        <Link href={`/booking?psychologist=${p.id}`} style={{ padding: "10px 0", textAlign: "center", backgroundColor: "#2563EB", color: "#FFF", borderRadius: 8, fontWeight: 600, fontSize: 14, display: "block" }}>
          Konseling Sekarang
        </Link>
      </div>
    </div>
  );

  return (
    <div className="page-shell" style={{ backgroundColor: "#F8FAFC" }}>
      <NavBar active="psychologists" />

      {/* Header Banner */}
      <div style={{ position: "relative", backgroundColor: "#1E3A8A", padding: "64px 24px", display: "flex", justifyContent: "center", overflow: "hidden" }}>
        {/* Animated SVG background */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} viewBox="0 0 800 300" preserveAspectRatio="none">
          <defs>
            <radialGradient id="bannerGlow1" cx="20%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bannerGlow2" cx="80%" cy="70%" r="50%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="#1E3A8A" />
          <circle cx="150" cy="100" r="250" fill="url(#bannerGlow1)" className="animate-pulse-soft" />
          <circle cx="650" cy="200" r="250" fill="url(#bannerGlow2)" className="animate-pulse-soft" style={{ animationDelay: "2s" }} />
          <path d="M-100,150 Q100,80 300,180 T700,100 T900,200 L900,300 L-100,300 Z" fill="rgba(255,255,255,0.03)" className="animate-float" />
          <path d="M-100,200 Q200,250 500,120 T900,150 L900,300 L-100,300 Z" fill="rgba(255,255,255,0.02)" className="animate-float" style={{ animationDelay: "1.5s", animationDuration: "8s" }} />
          <circle cx="100" cy="80" r="2" fill="#FFF" className="animate-pulse-slow" />
          <circle cx="250" cy="220" r="3" fill="#FFF" className="animate-pulse-slow" style={{ animationDelay: "1s" }} />
          <circle cx="550" cy="70" r="2" fill="#FFF" className="animate-pulse-slow" style={{ animationDelay: "2s" }} />
          <circle cx="700" cy="180" r="4" fill="#FFF" className="animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
        </svg>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#FFFFFF", textShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>Konseling dengan Psikolog Online</h1>
          <form onSubmit={handleSearchSubmit} className="search-bar-row">
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={20} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input
                type="text"
                placeholder="Cari nama psikolog atau spesialisasi"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: "100%", padding: "16px 24px 16px 48px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 15, outline: "none", backgroundColor: "#FFFFFF", color: "#0F172A" }}
              />
            </div>
            <button type="submit" style={{ backgroundColor: "#F59E0B", color: "#FFF", padding: "0 32px", borderRadius: 8, fontWeight: 700, border: "none", fontSize: 15, cursor: "pointer", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#D97706"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#F59E0B"}>
              Cari Psikolog
            </button>
          </form>
        </div>
      </div>

      <main className="container section psychologists-layout-grid">

        {/* Left Sidebar */}
        <aside className="psychologists-sidebar">
          {/* Terbantu Card */}
          <div style={{ backgroundColor: "#FFF", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#0F172A", fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>
              Lebih dari <span style={{ color: "#2563EB" }}>37.795+</span> orang<br />telah terbantu <Star size={12} fill="#F59E0B" color="#F59E0B" style={{ display: "inline", verticalAlign: "baseline" }} /> <span style={{ color: "#F59E0B" }}>5.0</span>
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {isLoading ? null : psychologists.slice(0, 4).map((p, i) => (
                <img key={i} src={p.avatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #FFF", marginLeft: i === 0 ? 0 : -10, objectFit: "cover" }} />
              ))}
            </div>
          </div>

          {/* Filter Card */}
          <div style={{ backgroundColor: "#FFF", padding: 24, borderRadius: 16, border: "1px solid #E2E8F0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Cari Berdasarkan Waktu</h3>
            <div className="hide-scrollbar" style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 8 }}>
              {filterDates.map((date, i) => {
                const isActive = selectedDateIndex === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDateSelect(i)}
                    style={{
                      minWidth: 72,
                      flexShrink: 0,
                      padding: "8px 0",
                      border: `1px solid ${isActive ? "#2563EB" : "#E2E8F0"}`,
                      borderRadius: 8,
                      backgroundColor: isActive ? "#EFF6FF" : "#FFFFFF",
                      textAlign: "center",
                      fontSize: 11,
                      color: isActive ? "#2563EB" : "#64748B",
                      fontWeight: isActive ? 700 : 500,
                      whiteSpace: "pre-wrap",
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    {getDayLabel(date, i)}
                  </button>
                );
              })}
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>Pilih Waktu</h4>
            <select
              value={selectedTime}
              onChange={handleTimeChange}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #E2E8F0", marginBottom: 16, color: "#475569", fontSize: 14, outline: "none" }}
            >
              <option value="ALL">Pilih Waktu</option>
              <option value="PAGI">Pagi (08:00 - 12:00)</option>
              <option value="SIANG">Siang (12:00 - 15:00)</option>
              <option value="SORE">Sore (15:00 - 18:00)</option>
            </select>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>Spesialisasi</h4>
            <select
              value={selectedSpecialization}
              onChange={handleSpecializationChange}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #E2E8F0", marginBottom: 20, color: "#475569", fontSize: 14, outline: "none" }}
            >
              <option value="ALL">Pilih Spesialisasi</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleSearchSubmit()}
              style={{ width: "100%", padding: "14px 0", backgroundColor: "#2563EB", color: "#FFF", borderRadius: 8, fontWeight: 600, border: "none", fontSize: 15, cursor: "pointer" }}
            >
              Cari Psikolog
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 48, minWidth: 0, paddingBottom: 60 }}>

          {isLoading ? (
            <p>Memuat daftar psikolog...</p>
          ) : isFiltered ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Hasil Pencarian</h2>
                  <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{filteredPsychologists.length} psikolog ditemukan berdasarkan filter Anda</p>
                </div>
                <button
                  onClick={handleResetFilters}
                  style={{
                    color: "#EF4444",
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FEE2E2",
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer"
                  }}
                >
                  Hapus Filter
                </button>
              </div>

              {filteredPsychologists.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {filteredPsychologists.map((p) => <VerticalListCard key={p.id} p={p} />)}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "48px 16px", backgroundColor: "#FFF", borderRadius: 16, border: "1px solid #E2E8F0" }}>
                  <p style={{ fontSize: 16, color: "#64748B", marginBottom: 12 }}>Tidak ada psikolog yang cocok dengan pencarian Anda.</p>
                  <button
                    onClick={handleResetFilters}
                    style={{
                      color: "#2563EB",
                      backgroundColor: "#EFF6FF",
                      border: "1px solid #DBEAFE",
                      padding: "8px 20px",
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer"
                    }}
                  >
                    Lihat Semua Psikolog
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Section 1: Horizontal Scroll */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 28, height: 28, backgroundColor: "#2563EB", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Clock size={16} color="#FFF" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Psikolog 24 Jam Kedepan</h2>
                      <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>Psikolog yang bersedia membantumu di 24 jam kedepan</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => scrollContainer(section1Ref, "left")} style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F1F5F9"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}>
                      <ChevronLeft size={16} color="#0F172A" />
                    </button>
                    <button type="button" onClick={() => scrollContainer(section1Ref, "right")} style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F1F5F9"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}>
                      <ChevronRight size={16} color="#0F172A" />
                    </button>
                  </div>
                </div>
                <div ref={section1Ref} className="hide-scrollbar" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, scrollBehavior: "smooth" }}>
                  {psychologists24h.map((p) => <HorizontalCard key={p.id} p={p} />)}
                </div>
              </div>

              {/* Section 2: Horizontal Scroll */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 28, height: 28, backgroundColor: "#2563EB", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Clock size={16} color="#FFF" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Psikolog Tercepat Di Jam Malam</h2>
                      <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>Psikolog yang bersedia membantumu di saat jam kerja</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => scrollContainer(section2Ref, "left")} style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F1F5F9"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}>
                      <ChevronLeft size={16} color="#0F172A" />
                    </button>
                    <button type="button" onClick={() => scrollContainer(section2Ref, "right")} style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F1F5F9"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}>
                      <ChevronRight size={16} color="#0F172A" />
                    </button>
                  </div>
                </div>
                <div ref={section2Ref} className="hide-scrollbar" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, scrollBehavior: "smooth" }}>
                  {psychologistsNight.map((p) => <HorizontalCard key={p.id} p={p} />)}
                </div>
              </div>

              {/* Section 3: Vertical List */}
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Psikolog Pilihan Untukmu</h2>
                  <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>Rekomendasi psikolog yang disesuaikan</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {psychologists.map((p) => <VerticalListCard key={p.id} p={p} />)}
                </div>
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button style={{ color: "#2563EB", fontWeight: 600, fontSize: 15, background: "none", border: "none", cursor: "pointer" }}>
                    Lihat Psikolog Lainnya
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
