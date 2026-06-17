"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { ArrowRight, Star, ShieldCheck, Video, CheckCircle2, ChevronLeft, ChevronRight, Brain, Heart, Moon, Sparkles, Frown, Compass, Search } from "lucide-react";
import type { Psychologist } from "@mindbridge/shared";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import { apiFetch } from "../lib/api";
import { InteractiveHeroIllustration } from "../components/InteractiveHeroIllustration";
import { DiscoveryDrawer } from "../components/DiscoveryDrawer";


const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export default function HomePage() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const psychRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);

  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: "", email: "", company: "", message: "" });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState("");

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryLoading(true);
    setInquiryError("");
    try {
      await apiFetch("/api/corporate/inquiry", {
        method: "POST",
        body: JSON.stringify(inquiryForm)
      });
      setInquirySuccess(true);
    } catch (err: any) {
      console.error(err);
      setInquiryError(err.message || "Gagal mengirim formulir kemitraan. Coba beberapa saat lagi.");
    } finally {
      setInquiryLoading(false);
    }
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const psychRes = await apiFetch("/api/psychologists");
        setPsychologists(psychRes.data || []);
      } catch (e) {
        console.error("Failed to load", e);
      }
    }
    load();
  }, []);

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
      <div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1, textAlign: "left" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 4, lineHeight: 1.3 }}>{p.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
          <Star size={14} fill="#F59E0B" color="#F59E0B" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>{p.rating}</span>
          <span style={{ fontSize: 13, color: "#64748B" }}>(90+ reviews)</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.6 }}>
            <span style={{ textDecoration: "line-through", fontSize: 13 }}>{formatCurrency(p.pricePerSession / 0.75)}</span>
            <span style={{ backgroundColor: "#D1FAE5", color: "#059669", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>-25%</span>
          </div>
          <strong style={{ fontSize: 18, color: "#0F172A", display: "block", marginTop: 2 }}>{formatCurrency(p.pricePerSession)}</strong>
        </div>

        {/* Card Action Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 8, marginTop: "auto" }}>
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
          <Link href={`/booking?psychologistId=${p.id}`} style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 36,
            fontSize: 13,
            padding: "0 8px",
            borderRadius: 8,
            backgroundColor: "#F59E0B",
            color: "#FFFFFF",
            fontWeight: 700,
            textDecoration: "none"
          }}>
            Booking
          </Link>
        </div>
      </div>
    </div>
  );

  const reviews = [
    {
      name: "Klien Batin",
      text: "Sesi konseling ini sangat membantu saya melewati masa sulit. Psikolognya sangat mendengarkan dan memberikan solusi praktis. Sangat direkomendasikan!",
      date: "2 hari yang lalu",
      bg: "linear-gradient(135deg, #2563EB, #1D4ED8)"
    },
    {
      name: "Budi Santoso",
      text: "Layanan yang profesional. Platformnya sangat mudah digunakan dan saya merasa sangat aman berbicara dengan ahlinya di sini.",
      date: "5 hari yang lalu",
      bg: "linear-gradient(135deg, #F59E0B, #D97706)"
    },
    {
      name: "Rini Wijaya",
      text: "Menemukan Batin adalah langkah terbaik untuk kesehatan mental saya tahun ini. Proses booking sangat cepat.",
      date: "1 minggu yang lalu",
      bg: "linear-gradient(135deg, #EC4899, #BE185D)"
    }
  ];

  const specialties = [
    { name: "Stress Kerja", icon: <Brain size={18} color="#2563EB" /> },
    { name: "Masalah Pasangan", icon: <Heart size={18} color="#2563EB" /> },
    { name: "Kecemasan (Anxiety)", icon: <ShieldCheck size={18} color="#2563EB" /> },
    { name: "Kesulitan Tidur", icon: <Moon size={18} color="#2563EB" /> },
    { name: "Trauma Masa Lalu", icon: <Sparkles size={18} color="#2563EB" /> },
    { name: "Pengembangan Diri", icon: <Compass size={18} color="#2563EB" /> },
    { name: "Quarter Life Crisis", icon: <Sparkles size={18} color="#2563EB" /> },
    { name: "Depresi", icon: <Frown size={18} color="#2563EB" /> }
  ];

  return (
    <div className="page-shell" style={{ backgroundColor: "#FFFFFF" }}>
      <NavBar active="home" />

      {/* Hero Section */}
      <section style={{ position: "relative", backgroundColor: "#F0F7FF", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
        {/* Animated Background SVG for Hero Banner */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} viewBox="0 0 1200 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="heroBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0F7FF" />
              <stop offset="50%" stopColor="#FAF5FF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
            <radialGradient id="heroGlow1" cx="10%" cy="20%" r="40%">
              <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F0F7FF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heroGlow2" cx="90%" cy="80%" r="55%">
              <stop offset="0%" stopColor="#FBCFE8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FAF5FF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroBgGrad)" />
          {/* Glowing blobs */}
          <circle cx="200" cy="150" r="300" fill="url(#heroGlow1)" className="animate-pulse-soft" />
          <circle cx="1000" cy="450" r="400" fill="url(#heroGlow2)" className="animate-pulse-soft" style={{ animationDelay: "2.5s" }} />
          {/* Floating smooth curves */}
          <path d="M-100,400 Q200,300 500,450 T1100,350 T1300,420 L1300,600 L-100,600 Z" fill="rgba(255,255,255,0.4)" className="animate-float" style={{ animationDuration: "12s" }} />
          <path d="M-100,450 Q300,550 700,380 T1300,450 L1300,600 L-100,600 Z" fill="rgba(255,255,255,0.25)" className="animate-float" style={{ animationDelay: "2s", animationDuration: "10s" }} />
          {/* Floating light particles */}
          <circle cx="150" cy="120" r="3" fill="#60A5FA" fillOpacity="0.3" className="animate-pulse-slow" />
          <circle cx="450" cy="80" r="2.5" fill="#EC4899" fillOpacity="0.25" className="animate-pulse-slow" style={{ animationDelay: "1.2s" }} />
          <circle cx="800" cy="220" r="4" fill="#3B82F6" fillOpacity="0.2" className="animate-pulse-slow" style={{ animationDelay: "2.4s" }} />
        </svg>

        <div className="container" style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap", paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <h2 style={{ fontSize: 16, color: "#2563EB", fontWeight: 700, marginBottom: 16 }}>PLATFORM PSIKOLOGI ONLINE TERPERCAYA & TERMUDAH</h2>
            <h1 style={{ fontSize: 48, fontWeight: 800, color: "#0F172A", lineHeight: 1.2, marginBottom: 24 }}>
              Disinilah Tempatmu <span style={{ color: "#1D4ED8" }}>Sembuh</span> dan Bertumbuh Secara Psikologis
            </h1>
            <p style={{ fontSize: 18, color: "#475569", marginBottom: 20 }}>
              Temukan penanganan yang tepat untukmu di sini bersama ahlinya. Sesi konseling aman, privat, dan profesional.
            </p>

            {/* Smart Human-Matching expanding search input */}
            <div style={{ position: "relative", marginBottom: 32, maxWidth: 500 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(8px)",
                borderRadius: 14,
                padding: "12px 18px",
                border: "2px solid rgba(226, 232, 240, 0.8)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
                transition: "all 0.3s ease"
              }}>
                <Search size={22} color="#2563EB" style={{ marginRight: 12 }} />
                <input
                  type="text"
                  placeholder="Ceritakan keluhan Anda di sini untuk dicocokkan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsDiscoveryOpen(true)}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: 16,
                    color: "#1E293B"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <button onClick={() => setIsDiscoveryOpen(true)} className="hero-btn-primary" style={{ padding: "16px 24px", border: "none", backgroundColor: "#2563EB", borderRadius: 12, display: "flex", alignItems: "center", gap: 12, color: "#FFFFFF", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" }}>
                <div>
                  <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.8)", display: "block", fontWeight: 500, textAlign: "left" }}>Asesmen Triase</span>
                  <span style={{ fontSize: 16 }}>Mulai Asesmen Personal</span>
                </div>
                <ArrowRight size={20} color="#FFFFFF" />
              </button>
              <button onClick={() => setIsInquiryOpen(true)} className="hero-btn-secondary" style={{ padding: "16px 24px", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, display: "flex", alignItems: "center", gap: 12, color: "#0F172A", fontWeight: 700, cursor: "pointer", outline: "none", textAlign: "left" }}>
                <div>
                  <span style={{ fontSize: 12, color: "#64748B", display: "block", fontWeight: 500 }}>Layanan Karyawan</span>
                  <span style={{ fontSize: 16, color: "#0F172A" }}>Untuk Business</span>
                </div>
                <ArrowRight size={20} color="#94A3B8" />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", minHeight: 460, minWidth: 320, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <InteractiveHeroIllustration />

            {/* Floating Glassmorphism Badges matching Mockup */}
            <div style={{
              position: "absolute",
              bottom: -10,
              left: "5%",
              width: "90%",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(8px)",
              borderRadius: 16,
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.06)",
              gap: 8,
              flexWrap: "wrap",
              zIndex: 5,
              border: "1px solid rgba(226, 232, 240, 0.8)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#1E293B" }}><ShieldCheck size={14} color="#2563EB" /> Psikolog Berlisensi</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#1E293B" }}><CheckCircle2 size={14} color="#2563EB" /> Privasi Terjamin</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#1E293B" }}><Video size={14} color="#2563EB" /> 100% Online & Offline</div>
            </div>
          </div>
        </div>
      </section>

      {/* Psikolog Section */}
      <section style={{ display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: "#F8FAFC", padding: "80px 0" }}>
        <style dangerouslySetInnerHTML={{
          __html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
            scroll-snap-type: x mandatory;
          }
          .snap-card {
            scroll-snap-align: center;
          }
          .specialty-card-hover {
            transition: all 0.2s ease-in-out !important;
          }
          .specialty-card-hover:hover {
            transform: translateY(-2px);
            border-color: #2563EB !important;
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.08) !important;
          }
          .hero-btn-primary {
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .hero-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 20px -5px rgba(37, 99, 235, 0.2) !important;
            border-color: #1D4ED8 !important;
          }
          .hero-btn-secondary {
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .hero-btn-secondary:hover {
            transform: translateY(-2px);
            background-color: #F8FAFC !important;
            border-color: #CBD5E1 !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important;
          }
          .cta-btn-hover {
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .cta-btn-hover:hover {
            transform: translateY(-2px);
            background-color: #D97706 !important;
            box-shadow: 0 12px 24px -6px rgba(245, 158, 11, 0.4) !important;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}} />
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A" }}>Profil Psikolog <span style={{ color: "#2563EB" }}>Batin</span></h2>
              <p style={{ fontSize: 16, color: "#64748B", marginTop: 8 }}>Alumni terbaik dari universitas terkemuka di Indonesia</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => scrollContainer(psychRef, "left")} style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F1F5F9"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}>
                <ChevronLeft size={20} color="#0F172A" />
              </button>
              <button onClick={() => scrollContainer(psychRef, "right")} style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F1F5F9"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}>
                <ChevronRight size={20} color="#0F172A" />
              </button>
            </div>
          </div>
          <div ref={psychRef} className="hide-scrollbar" style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 24, paddingLeft: 16, paddingRight: 16, scrollBehavior: "smooth" }}>
            {psychologists.map((p) => (
              <div key={p.id} className="snap-card" style={{ flexShrink: 0 }}>
                <HorizontalCard p={p} />
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Link href="/psychologists" style={{ color: "#2563EB", fontWeight: 600, fontSize: 16, textDecoration: "none", border: "1px solid #2563EB", padding: "12px 32px", borderRadius: 8, display: "inline-block" }}>Lihat Semua Psikolog</Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section style={{ display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: "#F8FAFC", padding: "80px 0", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 44, flexWrap: "wrap", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ backgroundColor: "#FFFFFF", padding: "6px 12px", borderRadius: 8, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <GoogleIcon />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Google Business</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>5.0 / 5.0</span>
                </div>
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", margin: 0 }}>
                1.379+ Ulasan Bintang 5 di Google
              </h2>
              <p style={{ fontSize: 15, color: "#64748B", margin: 0 }}>
                Ulasan asli dari klien yang telah berkonsultasi secara online maupun tatap muka langsung di Batin.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => scrollContainer(reviewRef, "left")} style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F1F5F9"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}>
                <ChevronLeft size={20} color="#0F172A" />
              </button>
              <button onClick={() => scrollContainer(reviewRef, "right")} style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F1F5F9"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}>
                <ChevronRight size={20} color="#0F172A" />
              </button>
            </div>
          </div>
          <div ref={reviewRef} className="hide-scrollbar" style={{ display: "flex", gap: 24, overflowX: "auto", paddingBottom: 24, paddingLeft: 8, paddingRight: 8, scrollBehavior: "smooth" }}>
            {reviews.map((r, i) => (
              <div key={i} className="snap-card" style={{
                position: "relative",
                minWidth: 320,
                width: 360,
                padding: 28,
                borderRadius: 20,
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                flexShrink: 0,
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px -12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)";
                }}
              >
                {/* Google logo watermark on top right */}
                <div style={{ position: "absolute", top: 24, right: 24 }}>
                  <GoogleIcon />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: r.bg,
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                  }}>
                    {r.name[0]}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>{r.name}</h4>
                    <span style={{ fontSize: 11, color: "#94A3B8" }}>{r.date}</span>
                  </div>
                </div>

                {/* Rating Stars and Verified Client Badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={14} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: "#ECFDF5", padding: "4px 8px", borderRadius: 9999, border: "1px solid #D1FAE5" }}>
                    <div style={{ display: "grid", placeItems: "center", width: 12, height: 12, borderRadius: "50%", backgroundColor: "#10B981", color: "#FFFFFF" }}>
                      <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#065F46" }}>Klien Terverifikasi</span>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: 0, textAlign: "left" }}>
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Masalah yang ditangani */}
      <section style={{ display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: "#F8FAFC", padding: "80px 0" }}>
        <div className="container" style={{ display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 300, borderRadius: 24, overflow: "hidden", height: 380, position: "relative" }}>
            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80" alt="Psikolog" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{
              position: "absolute",
              top: 16,
              right: 16,
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              padding: "8px 16px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}>
              <CheckCircle2 size={14} /> 25+ Psikolog Klinis
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h3 style={{ color: "#2563EB", fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Area Keahlian</h3>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 24 }}>Berikut ini berbagai masalah yang dapat kami tangani:</h2>

            {/* Grid Specialties matching Mockup */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {specialties.map(item => {
                // Map the display name to the database specialty parameter
                let specialtyParam = "Kecemasan";
                if (item.name.includes("Kerja") || item.name.includes("Pengembangan") || item.name.includes("Crisis")) {
                  specialtyParam = "Karier";
                } else if (item.name.includes("Pasangan")) {
                  specialtyParam = "Relasi";
                } else if (item.name.includes("Trauma")) {
                  specialtyParam = "Trauma";
                } else if (item.name.includes("Depresi")) {
                  specialtyParam = "Depresi";
                } else if (item.name.includes("Keluarga")) {
                  specialtyParam = "Keluarga";
                }

                return (
                  <Link
                    key={item.name}
                    href={`/booking?specialty=${specialtyParam}`}
                    className="specialty-card-hover"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: 12,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                      cursor: "pointer",
                      textDecoration: "none"
                    }}
                  >
                    <div style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 8, backgroundColor: "#EFF6FF" }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/booking"
              className="button button-primary"
              style={{
                marginTop: 32,
                padding: "0 32px",
                minHeight: 48,
                fontSize: 15,
                fontWeight: 700,
                backgroundColor: "#2563EB",
                boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 12,
                color: "#FFFFFF",
                border: "none",
                transition: "all 0.2s ease-in-out"
              }}
            >
              Konseling Sekarang <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Metode Konseling */}
      <section style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h3 style={{ color: "#2563EB", fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Layanan Kami</h3>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A" }}>Pilih medium konseling yang nyaman untukmu</h2>
          </div>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>

            <div style={{ width: 340, borderRadius: 24, border: "1px solid #E2E8F0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 180, backgroundColor: "#E2E8F0" }}>
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: 24, textAlign: "center", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Voice / Video Call</h3>
                <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>Tatap muka daring via Google Meet. Fleksibel dari mana saja.</p>
                <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  <div style={{ display: "flex", gap: 12, fontSize: 14, color: "#475569" }}><CheckCircle2 size={18} color="#2563EB" /> 60 Menit sesi</div>
                  <div style={{ display: "flex", gap: 12, fontSize: 14, color: "#475569" }}><CheckCircle2 size={18} color="#2563EB" /> Privasi sangat terjamin</div>
                  <div style={{ display: "flex", gap: 12, fontSize: 14, color: "#475569" }}><CheckCircle2 size={18} color="#2563EB" /> Fleksibel dari mana saja</div>
                </div>
                <Link href="/psychologists" style={{ display: "flex", width: "100%", padding: "12px 0", border: "1px solid #2563EB", color: "#2563EB", borderRadius: 8, fontWeight: 600, textDecoration: "none", marginTop: "auto", justifyContent: "center", alignItems: "center" }}>Pilih Layanan</Link>
              </div>
            </div>

            <div style={{ width: 340, borderRadius: 24, border: "1px solid #E2E8F0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 180, backgroundColor: "#E2E8F0" }}>
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: 24, textAlign: "center", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Tatap Muka (Offline)</h3>
                <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>Interaksi tatap muka langsung di klinik rekanan kami.</p>
                <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  <div style={{ display: "flex", gap: 12, fontSize: 14, color: "#475569" }}><CheckCircle2 size={18} color="#2563EB" /> 60 Menit sesi</div>
                  <div style={{ display: "flex", gap: 12, fontSize: 14, color: "#475569" }}><CheckCircle2 size={18} color="#2563EB" /> Interaksi langsung & mendalam</div>
                  <div style={{ display: "flex", gap: 12, fontSize: 14, color: "#475569" }}><CheckCircle2 size={18} color="#2563EB" /> Tempat yang nyaman & aman</div>
                </div>
                <Link href="/psychologists" style={{ display: "flex", width: "100%", padding: "12px 0", backgroundColor: "#2563EB", color: "#FFF", borderRadius: 8, fontWeight: 600, textDecoration: "none", marginTop: "auto", justifyContent: "center", alignItems: "center", border: "none" }}>Pilih Layanan</Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Big */}
      <section style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 24px" }}>
        <div className="container" style={{ position: "relative", backgroundColor: "#1E3A8A", borderRadius: 24, padding: "64px 24px", textAlign: "center", overflow: "hidden" }}>
          {/* Animated SVG background */}
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} viewBox="0 0 800 300" preserveAspectRatio="none">
            <defs>
              <radialGradient id="ctaGlow1" cx="20%" cy="30%" r="50%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ctaGlow2" cx="80%" cy="70%" r="50%">
                <stop offset="0%" stopColor="#EC4899" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="#1E3A8A" />
            {/* Glowing backgrounds */}
            <circle cx="150" cy="100" r="250" fill="url(#ctaGlow1)" className="animate-pulse-soft" />
            <circle cx="650" cy="200" r="250" fill="url(#ctaGlow2)" className="animate-pulse-soft" style={{ animationDelay: "2s" }} />
            {/* Floating SVG blobs/waves */}
            <path d="M-100,150 Q100,80 300,180 T700,100 T900,200 L900,300 L-100,300 Z" fill="rgba(255,255,255,0.03)" className="animate-float" />
            <path d="M-100,200 Q200,250 500,120 T900,150 L900,300 L-100,300 Z" fill="rgba(255,255,255,0.02)" className="animate-float" style={{ animationDelay: "1.5s", animationDuration: "8s" }} />
            {/* Floating stars */}
            <circle cx="100" cy="80" r="2" fill="#FFF" className="animate-pulse-slow" />
            <circle cx="250" cy="220" r="3" fill="#FFF" className="animate-pulse-slow" style={{ animationDelay: "1s" }} />
            <circle cx="550" cy="70" r="2" fill="#FFF" className="animate-pulse-slow" style={{ animationDelay: "2s" }} />
            <circle cx="700" cy="180" r="4" fill="#FFF" className="animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
          </svg>

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#FFFFFF", marginBottom: 16 }}>Siap untuk hidup lebih bahagia, tenang, dan percaya diri?</h2>
            <p style={{ color: "#93C5FD", fontSize: 16, marginBottom: 32 }}>Lakukan konseling dan rasakan perubahannya sekarang. Mulai perjalanan penyembuhanmu hari ini.</p>
            <Link href="/psychologists" className="cta-btn-hover" style={{ display: "inline-block", padding: "16px 40px", backgroundColor: "#F59E0B", color: "#FFF", borderRadius: 8, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>Mulai Konseling</Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Corporate Inquiry Modal */}
      {isInquiryOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 16,
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            width: "100%",
            maxWidth: 520,
            padding: 32,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid #E2E8F0",
            position: "relative",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <button
              onClick={() => {
                setIsInquiryOpen(false);
                setInquirySuccess(false);
                setInquiryError("");
                setInquiryForm({ name: "", email: "", company: "", message: "" });
              }}
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#64748B",
                lineHeight: 1
              }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1D4ED8", marginBottom: 8, textAlign: "left" }}>
              Kemitraan Corporate
            </h3>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 24, textAlign: "left", lineHeight: "1.5" }}>
              Bantu karyawan Anda mendapatkan dukungan kesehatan mental terbaik bersama psikolog profesional Batin. Hubungi kami untuk program kemitraan B2B.
            </p>

            {inquirySuccess ? (
              <div style={{
                backgroundColor: "#ECFDF5",
                border: "1px solid #A7F3D0",
                borderRadius: 16,
                padding: "24px",
                textAlign: "center"
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  color: "#FFFFFF",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 16px auto"
                }}>
                  <CheckCircle2 size={24} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#065F46", marginBottom: 8 }}>Pengiriman Berhasil!</h4>
                <p style={{ fontSize: 13, color: "#047857", margin: 0, lineHeight: 1.5 }}>
                  Terima kasih telah mengajukan kemitraan corporate. Tim kami akan segera meninjau permohonan Anda dan menghubungi melalui email yang Anda daftarkan dalam waktu 1x24 jam.
                </p>
                <button
                  onClick={() => {
                    setIsInquiryOpen(false);
                    setInquirySuccess(false);
                    setInquiryForm({ name: "", email: "", company: "", message: "" });
                  }}
                  style={{
                    marginTop: 20,
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#10B981",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {inquiryError && (
                  <div style={{
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FCA5A5",
                    color: "#991B1B",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "left"
                  }}>
                    {inquiryError}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Nama Lengkap Kontak</label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Email Perusahaan</label>
                  <input
                    type="email"
                    required
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    placeholder="Contoh: budi@company.com"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Nama Perusahaan</label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.company}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, company: e.target.value })}
                    placeholder="Contoh: PT Maju Bersama"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>Pesan & Kebutuhan Kemitraan</label>
                  <textarea
                    required
                    rows={3}
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    placeholder="Jelaskan kebutuhan konseling karyawan atau program kesejahteraan mental di perusahaan Anda..."
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 14,
                      outline: "none",
                      resize: "none"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={inquiryLoading}
                  style={{
                    marginTop: 8,
                    padding: "12px 24px",
                    backgroundColor: inquiryLoading ? "#94A3B8" : "#2563EB",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: inquiryLoading ? "not-allowed" : "pointer",
                    fontSize: 15,
                    transition: "background-color 0.2s"
                  }}
                >
                  {inquiryLoading ? "Mengirim..." : "Kirim Formulir Kemitraan"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      
      <DiscoveryDrawer isOpen={isDiscoveryOpen} onClose={() => setIsDiscoveryOpen(false)} />
    </div>
  );
}
