"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, AlertTriangle } from "lucide-react";
import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";
import { apiFetch } from "../../lib/api";
import { formatCurrency } from "@mindbridge/shared";

function ReceiptDetails() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID Sesi tidak ditemukan.");
      setIsLoading(false);
      return;
    }

    async function fetchSession() {
      try {
        const res = await apiFetch(`/api/client/sessions/${id}`);
        if (res && res.data) {
          setSession(res.data);
        } else {
          setError("Data sesi tidak ditemukan.");
        }
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat detail kwitansi.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, [id]);

  const handleDownload = async () => {
    if (!id) return;
    try {
      const res = await apiFetch(`/api/client/sessions/${id}/receipt`);
      alert(
        `Simulasi Unduhan File PDF:\n\n` +
        `Nama File: ${res.data.fileName}\n` +
        `Status: ${res.data.status}\n` +
        `Watermark: ${res.data.watermark}\n\n` +
        `Telah tersimpan di folder unduhan Anda.`
      );
    } catch (e) {
      alert("Gagal mengunduh file.");
    }
  };

  if (isLoading) {
    return (
      <section className="panel" style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <p>Memuat data kwitansi...</p>
      </section>
    );
  }

  if (error || !session) {
    return (
      <section className="panel" style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", display: "grid", gap: 14 }}>
        <span className="icon-tile red" style={{ margin: "0 auto" }}>
          <AlertTriangle />
        </span>
        <h1 style={{ fontSize: 32 }}>Kwitansi Tidak Ditemukan</h1>
        <p className="error">{error || "Sesi konseling tidak valid."}</p>
      </section>
    );
  }

  const isPaid = session.status !== "PENDING_PAYMENT" && session.status !== "CANCELLED";

  return (
    <section className="panel" style={{ display: "grid", gap: 18, maxWidth: 760, margin: "0 auto" }}>
      <span className={`badge ${isPaid ? "success" : "warning"}`}>
        {isPaid ? "LUNAS" : session.status}
      </span>
      <h1 style={{ fontSize: 44 }}>Kwitansi Pembayaran</h1>
      <div className="muted-box" style={{ display: "grid", gap: 10 }}>
        <p><strong>Nomor Sesi:</strong> {session.id}</p>
        <p><strong>Client Issues:</strong> {session.clientName || "Konseling Umum"}</p>
        <p><strong>Psikolog:</strong> {session.psychologistName}</p>
        <p><strong>Metode Konseling:</strong> {session.sessionType === "ONLINE" ? "Online (Google Meet)" : "Offline (Tatap Muka)"}</p>
        <p><strong>Jadwal Sesi:</strong> {new Date(session.scheduledAt).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}</p>
        <p><strong>Total Pembayaran:</strong> {formatCurrency(session.amount)}</p>
        <p style={{ fontSize: "14px", marginTop: 10, borderTop: "1px dashed var(--border)", paddingTop: 10 }}>
          <strong>Catatan:</strong> Dokumen ini merupakan bukti pembayaran resmi yang sah dari Batin dan dapat digunakan sebagai bukti klaim asuransi kesehatan yang berlaku.
        </p>
      </div>
      <button className="button button-primary" type="button" onClick={handleDownload}>
        <Download size={18} /> Download PDF Resmi
      </button>
    </section>
  );
}

export default function ReceiptPage() {
  return (
    <div className="page-shell">
      <NavBar />
      <main className="container section">
        <Suspense fallback={
          <section className="panel" style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <p>Menyiapkan kwitansi...</p>
          </section>
        }>
          <ReceiptDetails />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
