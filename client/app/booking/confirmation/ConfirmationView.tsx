"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Copy, History, FileText, Video, MapPin, User, Calendar } from "lucide-react";
import { formatCurrency } from "@mindbridge/shared";

type ConfirmedBooking = {
  id: string;
  clientName: string;
  psychologistId: string;
  sessionType: "ONLINE" | "OFFLINE";
  status: string;
  scheduledAt: string;
  amount: number;
  location?: string;
  meetUrl?: string;
  psychologistName?: string;
  slotKey?: string;
  timeRange?: string;
};

function getFormattedDateTime(scheduledAtStr: string, slotKey?: string, timeRange?: string) {
  let datePart = "";
  let timePart = "";

  if (slotKey && slotKey.includes("T")) {
    const parts = slotKey.split("T");
    datePart = parts[0];
    timePart = parts[1];
  } else if (timeRange) {
    datePart = scheduledAtStr.slice(0, 10);
    timePart = timeRange;
  } else {
    const d = new Date(scheduledAtStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    datePart = `${year}-${month}-${day}`;
    
    const startHour = String(d.getHours()).padStart(2, "0");
    const startMin = String(d.getMinutes()).padStart(2, "0");
    
    const endWib = new Date(d.getTime() + 60 * 60 * 1000);
    const endHour = String(endWib.getHours()).padStart(2, "0");
    const endMin = String(endWib.getMinutes()).padStart(2, "0");
    timePart = `${startHour}:${startMin} - ${endHour}:${endMin}`;
  }

  const d = new Date(datePart + "T00:00:00");
  const formattedDate = d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  
  return `${formattedDate}, ${timePart} WIB`;
}

export function ConfirmationView() {
  const [booking, setBooking] = useState<ConfirmedBooking | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("mindbridge_confirmed_booking");
    if (raw) setBooking(JSON.parse(raw) as ConfirmedBooking);
  }, []);

  const handleCopy = () => {
    if (booking?.id) {
      navigator.clipboard.writeText(booking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!booking) {
    return (
      <section className="panel" style={{ display: "grid", gap: 18, margin: "0 auto", maxWidth: 760, textAlign: "center", padding: 48 }}>
        <p style={{ color: "#64748B", fontWeight: 600 }}>Belum ada booking yang baru dikonfirmasi.</p>
        <Link className="button button-primary" href="/booking" style={{ marginTop: 16, marginInline: "auto" }}>
          Buat Booking
        </Link>
      </section>
    );
  }

  const formattedDateTime = getFormattedDateTime(booking.scheduledAt, booking.slotKey, booking.timeRange);

  return (
    <div className="confirmation-card">
      {/* Green Check Circle */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          backgroundColor: "#D1FAE5",
          color: "#059669",
          display: "grid",
          placeItems: "center",
          marginBottom: 28
        }}
      >
        <Check size={36} strokeWidth={3} />
      </div>

      {/* Heading Title */}
      <h1 style={{ fontSize: 30, color: "#0F172A", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 12 }}>
        Booking Berhasil Dikonfirmasi
      </h1>
      
      <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.6, maxWidth: 540, marginBottom: 40 }}>
        Pembayaran berhasil dan sesi sudah tersimpan ke riwayat client.
        <span style={{ display: "block", marginTop: 4 }}>Kami telah mengirimkan detail konfirmasi ke email Anda.</span>
      </p>

      {/* 2x3 Grid details box */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px 32px",
          textAlign: "left",
          backgroundColor: "#F8FAFC",
          borderRadius: 16,
          padding: 32,
          border: "1px solid #E2E8F0",
          width: "100%",
          marginBottom: 40
        }}
      >
        {/* Session ID */}
        <div>
          <span style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
            Nomor Sesi
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{booking.id}</span>
            <button
              onClick={handleCopy}
              style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#10B981" : "#64748B", display: "inline-flex", alignItems: "center", padding: 2 }}
              title="Salin Nomor Sesi"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Client */}
        <div>
          <span style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
            Client
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{booking.clientName}</span>
        </div>

        {/* Psychologist */}
        <div>
          <span style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
            Psikolog
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
            <User size={16} style={{ color: "#2563EB" }} />
            {booking.psychologistName || "Bagus Wiratama, M.Psi"}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <span style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
            Jadwal
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
            <Calendar size={16} style={{ color: "#2563EB", flexShrink: 0 }} />
            {formattedDateTime}
          </div>
        </div>

        {/* Total Payment */}
        <div>
          <span style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
            Total Pembayaran
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#2563EB" }}>
            {formatCurrency(booking.amount)}
          </span>
        </div>

        {/* Meeting Link */}
        <div>
          <span style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
            Tautan Pertemuan (Meet)
          </span>
          {booking.sessionType === "ONLINE" ? (
            <a
              href={booking.meetUrl || "https://meet.google.com/mock-meet-link"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#2563EB", textDecoration: "none" }}
            >
              <Video size={16} style={{ flexShrink: 0 }} />
              {(booking.meetUrl || "meet.google.com/mock-meet-link").replace("https://", "")}
            </a>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
              <MapPin size={16} style={{ color: "#2563EB", flexShrink: 0 }} />
              {booking.location || "Klinik Offline"}
            </div>
          )}
        </div>
      </div>

      {/* Actions Row */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", width: "100%", flexWrap: "wrap" }}>
        <Link
          href="/dashboard/client"
          style={{
            padding: "14px 28px",
            borderRadius: 12,
            backgroundColor: "#2563EB",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2563EB"}
        >
          <History size={16} /> Lihat Riwayat
        </Link>
        <Link
          href={`/receipt?id=${booking.id}`}
          style={{
            padding: "14px 28px",
            borderRadius: 12,
            border: "1px solid #2563EB",
            backgroundColor: "#FFFFFF",
            color: "#2563EB",
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F0F7FF"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}
        >
          <FileText size={16} /> Kwitansi PDF
        </Link>
      </div>

      {/* Support footer */}
      <p style={{ marginTop: 32, fontSize: 13, color: "#64748B", fontWeight: 600 }}>
        Ada kendala? <a href="mailto:support@hatikehati.com" style={{ color: "#2563EB", textDecoration: "none", fontWeight: 700 }}>Hubungi Tim Support</a>
      </p>
    </div>
  );
}
