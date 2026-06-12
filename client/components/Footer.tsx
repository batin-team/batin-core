"use client";

import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="footer-new">
      <div className="container">
        {/* Emergency Warning Banner */}
        <div style={{
          backgroundColor: "#FFF5F5",
          borderLeft: "4px solid #EF4444",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "32px",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <span style={{ fontSize: "18px", lineHeight: "1" }}>⚠️</span>
            <div>
              <h5 style={{ margin: "0 0 4px 0", color: "#991B1B", fontWeight: 700, fontSize: "14px" }}>
                PENTING: Bukan Layanan Medis Darurat (Not an Emergency Service)
              </h5>
              <p style={{ margin: 0, color: "#7F1D1D", fontSize: "13px", lineHeight: "1.5" }}>
                Batin adalah platform <strong>Layanan Dukungan Berbasis Manusia (Human-Led Support)</strong>. Kami tidak menyediakan penanganan krisis darurat. Jika Anda berada dalam situasi bahaya atau memiliki kecenderungan melukai diri sendiri/bunuh diri, segera hubungi layanan darurat nasional <strong>119</strong> atau hubungi hotline pencegahan bunuh diri di <strong>(021) 500-454</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Top Section */}
        <div className="footer-top">
          {/* Brand, Tagline, and Store Buttons */}
          <div className="footer-brand">
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, color: "#1D4ED8", fontWeight: 800, fontSize: 22, textDecoration: "none", letterSpacing: "-0.5px" }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'float-slow 4s ease-in-out infinite' }}>
                <path d="M16 28C16 28 3 20 3 11C3 6.5 6.5 3 11 3C13.8 3 15.2 4.5 16 5.5C16.8 4.5 18.2 3 21 3C25.5 3 29 6.5 29 11C29 20 16 28 16 28Z" fill="url(#logo-grad-footer)" style={{ animation: 'heartbeat 3s ease-in-out infinite', transformOrigin: 'center' }} />
                <path d="M9 13C11 11 13 15 15 12C17 9 19 14 21 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="30" strokeDashoffset="30" style={{ animation: 'draw-path 2s ease-out forwards', animationDelay: '0.3s' }} />
                <defs>
                  <linearGradient id="logo-grad-footer" x1="3" y1="3" x2="29" y2="28" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1D4ED8" />
                    <stop offset="100%" stopColor="#60A5FA" />
                  </linearGradient>
                </defs>
              </svg>
              <span>Batin</span>
            </Link>

            <p className="footer-tagline">
              &ldquo;Bicarakan isi hatimu, temukan jalan keluar atas masalahmu&rdquo;
            </p>

            <div className="footer-apps">
              {/* Play Store */}
              <a href="#" className="footer-app-btn">
                <svg viewBox="0 0 512 512" width="20" height="20">
                  <path fill="#00e5ff" d="M10 28.5L256 256L10 483.5c-5.5-5.5-8.5-13-8.5-21V49.5c0-8 3-15.5 8.5-21z" />
                  <path fill="#ffeb3b" d="M397.5 142.5l-95.5 95.5l95.5 95.5c24-14 36-39.5 36-69.5s-12-55.5-36-69.5z" />
                  <path fill="#ff2d55" d="M10 483.5L302 333.5l95.5 95.5c-15.5 24-42.5 36-73.5 36H31c-8 0-15.5-3-21-9z" />
                  <path fill="#4cd964" d="M10 28.5L302 178.5l95.5-95.5c-15.5-24-42.5-36-73.5-36H31c-8 0-15.5 3-21 9z" />
                </svg>
                <div className="footer-app-text">
                  <span className="footer-app-label">GET IT ON</span>
                  <span className="footer-app-name">Google Play</span>
                </div>
              </a>

              {/* App Store */}
              <a href="#" className="footer-app-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                </svg>
                <div className="footer-app-text">
                  <span className="footer-app-label">Download on the</span>
                  <span className="footer-app-name">App Store</span>
                </div>
              </a>
            </div>
          </div>

          {/* Column 1: Layanan */}
          <div className="footer-col">
            <h4>Layanan</h4>
            <div className="footer-links">
              <Link href="/booking">Video/voice call</Link>
              <Link href="/booking">Janji Tatap Muka</Link>
              <Link href="/booking">Batin for Kids</Link>
            </div>
          </div>

          {/* Column 2: Tentang Kami */}
          <div className="footer-col">
            <h4>Tentang Kami</h4>
            <div className="footer-links">
              <Link href="/about">Tentang Batin</Link>
              <Link href="/">Hubungi Kami</Link>
              <Link href="/">FAQ</Link>
              <Link href="/">Batin for Business</Link>
              <Link href="/">Karir</Link>
            </div>
          </div>

          {/* Column 3: Lainnya */}
          <div className="footer-col">
            <h4>Lainnya</h4>
            <div className="footer-links">
              <Link href="/">Panduan Konseling</Link>
              <Link href="/">Peraturan Konseling</Link>
              <Link href="/">Aplikasi Batin</Link>
              <Link href="/">Indonesia Sehat Mental</Link>
              <Link href="/">Batin Blog</Link>
            </div>
          </div>

          {/* Column 4: Lokasi */}
          <div className="footer-col">
            <h4>Lokasi</h4>
            <div className="footer-links">
              <Link href="/psychologists">Rumah Bicara Bintaro</Link>
              <Link href="/psychologists">Rumah Bicara Puri Indah</Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom Section */}
        <div className="footer-bottom">
          {/* Left: Policy links */}
          <div className="footer-policies">
            <Link href="/">Kebijakan Privasi</Link>
            <span style={{ color: "#94A3B8" }}>&bull;</span>
            <Link href="/">Syarat &amp; Ketentuan</Link>
          </div>

          {/* Center: Copyright */}
          <div className="footer-copyright">
            &copy; PT Mental Anak Bangsa
          </div>

          {/* Right: Social Icons */}
          <div className="footer-socials">
            {[
              {
                name: "WhatsApp",
                color: "#25D366",
                svg: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.214 8.214 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.188 8.188 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.26-8.24zm-1.85 4.33c-.27 0-.54.07-.75.25-.26.23-.62.59-.62 1.22 0 .63.46 1.24.66 1.5.2.26 1.83 2.8 4.43 3.93.62.27 1.1.43 1.48.55.62.2 1.19.17 1.64.1.5-.08 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.1-.26-.17-.55-.31-.29-.14-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.2.3-.77.97-.95 1.17-.18.2-.36.23-.66.08-.29-.14-1.24-.46-2.37-1.47-.88-.78-1.47-1.75-1.64-2.05-.18-.3-.02-.46.13-.61.14-.14.29-.34.44-.5.15-.17.2-.29.3-.49.1-.2.05-.38-.02-.52-.07-.15-.66-1.6-.9-2.18-.23-.58-.46-.5-.66-.5z" />
                </svg>
              },
              {
                name: "Instagram",
                color: "#E1306C",
                svg: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              },
              {
                name: "TikTok",
                color: "#010101",
                svg: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.17.94.94 2.22 1.51 3.56 1.68V9.75c-1.61-.06-3.15-.69-4.37-1.76-.08.68-.04 1.37-.04 2.05v6.52c.07 1.83-.79 3.61-2.29 4.63-1.68 1.15-3.95 1.39-5.85.6-2.14-.83-3.69-3.05-3.79-5.34-.17-2.95 2.11-5.63 5.06-5.88.93-.08 1.87.1 2.73.47V6.86c-1.39-.46-2.88-.47-4.28-.01-2.91.86-4.99 3.65-4.99 6.7 0 3.73 3.03 6.75 6.75 6.75 3.59.08 6.64-2.67 6.75-6.25V5.11c1.07.75 2.37 1.14 3.7 1.13V2.33c-.93 0-1.85-.23-2.67-.68-.86-.48-1.57-1.2-2.06-2.06a6.49 6.49 0 0 1-.77-2.6c0 .02.01.02.01.03z" />
                </svg>
              },
              {
                name: "YouTube",
                color: "#FF0000",
                svg: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              },
              {
                name: "Spotify",
                color: "#1DB954",
                svg: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.894-.982-.336.076-.67-.135-.746-.472-.076-.336.135-.67.472-.746 3.856-.88 7.15-.506 9.822 1.13.295.18.387.563.206.863zm1.224-2.724c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.08-1.182-.413.125-.845-.107-.97-.52-.125-.413.108-.844.52-.97 3.674-1.115 8.243-.573 11.344 1.332.367.226.487.707.26 1.08zm.106-2.833C14.492 8.88 8.828 8.693 5.54 9.69c-.506.153-1.04-.137-1.193-.642-.153-.505.137-1.04.642-1.193 3.77-1.143 10.005-.928 14.03 1.462.455.27.606.856.337 1.31-.27.455-.856.607-1.31.337z" />
                </svg>
              },
              {
                name: "LinkedIn",
                color: "#0077B5",
                svg: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              }
            ].map(social => (
              <a
                key={social.name}
                href="#"
                className="footer-social-link"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = social.color; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#CBD5E1"; }}
                title={social.name}
              >
                {social.svg}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
