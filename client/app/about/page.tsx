import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";
import { HeartHandshake, ShieldCheck, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami - Batin",
  description: "Pelajari lebih lanjut tentang misi, visi, dan kisah kami dalam membangun kedamaian batin Anda."
};

export default function AboutPage() {
  return (
    <div className="page-shell" style={{ backgroundColor: "#F8FAFC" }}>
      <NavBar />

      {/* Hero Header Section */}
      <div className="about-hero">
        {/* Animated SVG background */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} viewBox="0 0 800 300" preserveAspectRatio="none">
          <defs>
            <radialGradient id="aboutHeroGlow1" cx="20%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="aboutHeroGlow2" cx="80%" cy="70%" r="50%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="#1E3A8A" />
          {/* Glowing backgrounds */}
          <circle cx="150" cy="100" r="250" fill="url(#aboutHeroGlow1)" className="animate-pulse-soft" />
          <circle cx="650" cy="200" r="250" fill="url(#aboutHeroGlow2)" className="animate-pulse-soft" style={{ animationDelay: "2s" }} />
          {/* Floating SVG blobs/waves */}
          <path d="M-100,150 Q100,80 300,180 T700,100 T900,200 L900,300 L-100,300 Z" fill="rgba(255,255,255,0.03)" className="animate-float" />
          <path d="M-100,200 Q200,250 500,120 T900,150 L900,300 L-100,300 Z" fill="rgba(255,255,255,0.02)" className="animate-float" style={{ animationDelay: "1.5s", animationDuration: "8s" }} />
          {/* Floating stars */}
          <circle cx="80" cy="60" r="2" fill="#FFF" className="animate-pulse-slow" />
          <circle cx="200" cy="220" r="3" fill="#FFF" className="animate-pulse-slow" style={{ animationDelay: "1s" }} />
          <circle cx="350" cy="90" r="2" fill="#FFF" className="animate-pulse-slow" style={{ animationDelay: "2.5s" }} />
          <circle cx="500" cy="200" r="2.5" fill="#FFF" className="animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
          <circle cx="650" cy="70" r="2.5" fill="#FFF" className="animate-pulse-slow" style={{ animationDelay: "3s" }} />
          <circle cx="720" cy="180" r="4" fill="#FFF" className="animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
        </svg>
        <div className="about-hero-content">
          <span className="eyebrow" style={{ color: "#93C5FD", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontSize: 13, marginBottom: 8, display: "block" }}>Tentang Kami</span>
          <h1 className="about-hero-title">Mengenal Batin Lebih Dekat</h1>
          <p style={{ color: "#BFDBFE", fontSize: 18, marginTop: 8 }}>Kami percaya bahwa setiap batin berhak mendapatkan ruang aman untuk sembuh, tumbuh, dan hidup secara sehat.</p>
        </div>
      </div>

      <main className="container section" style={{ display: "flex", flexDirection: "column", gap: 64 }}>
        
        {/* Story Section */}
        <section className="about-section-grid">
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>Kisah Di Balik Batin</h2>
            <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Didirikan dengan visi untuk memecah stigma seputar kesehatan mental di Indonesia, <strong>Batin</strong> hadir sebagai jembatan yang menghubungkan Anda dengan psikolog dan konselor profesional berlisensi secara mudah, aman, dan tanpa batasan jarak.
            </p>
            <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.7 }}>
              Nama "Batin" sendiri melambangkan dunia emosional, pikiran, dan spiritual terdalam dari setiap individu. Kami berkomitmen untuk merawat dan mendengarkan batin Anda, memberikan panduan profesional agar Anda bisa menjalani kehidupan yang lebih bahagia, seimbang, dan tenang.
            </p>
          </div>
          <div className="about-image-container">
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80" alt="Meditasi Kesehatan Mental" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </section>

        {/* Vision & Mission Card */}
        <section className="about-vision-grid">
          <div className="about-card-premium">
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#EFF6FF", color: "#2563EB", display: "grid", placeItems: "center", marginBottom: 20 }}>
              <HeartHandshake size={24} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 14 }}>Visi Kami</h3>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.6 }}>
              Menjadi platform layanan kesehatan mental terdepan dan terpercaya di Indonesia yang mampu menghadirkan kedamaian, kesejahteraan emosional, dan kepedulian batin bagi setiap lapisan masyarakat.
            </p>
          </div>
          <div className="about-card-premium">
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#EFF6FF", color: "#2563EB", display: "grid", placeItems: "center", marginBottom: 20 }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 14 }}>Misi Kami</h3>
            <ul style={{ paddingLeft: 18, color: "#64748B", fontSize: 15, display: "flex", flexDirection: "column", gap: 10, margin: 0, lineHeight: 1.6 }}>
              <li>Menghadirkan layanan konseling psikologi online & offline yang mudah diakses dan ramah pengguna.</li>
              <li>Menjamin kerahasiaan, privasi, dan standar profesionalisme tertinggi dalam setiap sesi konseling.</li>
              <li>Membangun ekosistem dan konten edukatif untuk mereduksi stigma sosial kesehatan mental.</li>
            </ul>
          </div>
        </section>

        {/* Core Values */}
        <section style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>Nilai-Nilai Utama Kami</h2>
          <p style={{ color: "#64748B", fontSize: 16, maxWidth: 600, margin: "0 auto 48px auto" }}>Prinsip yang mendasari setiap layanan dan interaksi kami dengan para pengguna.</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              { icon: <Heart size={24} />, title: "Empati Mendalam", desc: "Kami mendengarkan tanpa menghakimi, memahami dengan hati, dan menemani proses penyembuhan Anda." },
              { icon: <ShieldCheck size={24} />, title: "Kerahasiaan Mutlak", desc: "Setiap data pribadi dan rincian sesi konseling Anda tersimpan dengan aman dan rahasia." },
              { icon: <HeartHandshake size={24} />, title: "Aksesibilitas Luas", desc: "Layanan konsultasi online dari mana saja dan offline di klinik rekanan terpilih." }
            ].map((val, idx) => (
              <div key={idx} className="about-value-card">
                <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#EFF6FF", color: "#2563EB", display: "grid", placeItems: "center", marginBottom: 20 }}>
                  {val.icon}
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>{val.title}</h4>
                <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Footer Section */}
        <section style={{ padding: "0" }}>
          <div className="about-cta">
            <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} viewBox="0 0 800 300" preserveAspectRatio="none">
              <defs>
                <radialGradient id="aboutCtaGlow1" cx="20%" cy="30%" r="50%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="aboutCtaGlow2" cx="80%" cy="70%" r="50%">
                  <stop offset="0%" stopColor="#EC4899" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="#1E3A8A" />
              {/* Glowing backgrounds */}
              <circle cx="150" cy="100" r="250" fill="url(#aboutCtaGlow1)" className="animate-pulse-soft" />
              <circle cx="650" cy="200" r="250" fill="url(#aboutCtaGlow2)" className="animate-pulse-soft" style={{ animationDelay: "2s" }} />
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
              <h2 style={{ fontSize: 30, fontWeight: 800, color: "#FFFFFF", marginBottom: 12 }}>Siap melangkah menuju kehidupan yang lebih tenang?</h2>
              <p style={{ color: "#93C5FD", fontSize: 15, marginBottom: 28 }}>Bicarakan keluhan Anda secara privat dengan psikolog profesional berlisensi kami.</p>
              <Link href="/booking" className="about-cta-btn">Mulai Konseling</Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
