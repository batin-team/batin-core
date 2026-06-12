"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, AlertTriangle } from "lucide-react";
import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";
import { apiFetch } from "../../lib/api";

function NotesDetails() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [notes, setNotes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID Sesi tidak ditemukan.");
      setIsLoading(false);
      return;
    }

    async function fetchNotes() {
      try {
        const res = await apiFetch(`/api/sessions/${id}/notes`);
        if (res && res.data) {
          setNotes(res.data);
        } else {
          setError("Catatan sesi tidak ditemukan.");
        }
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat catatan konseling.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotes();
  }, [id]);

  const handleDownload = async () => {
    if (!id) return;
    try {
      const res = await apiFetch(`/api/client/sessions/${id}/notes`);
      alert(
        `Simulasi Unduhan File PDF:\n\n` +
        `Nama File: ${res.data.fileName}\n` +
        `Status: ${res.data.status}\n` +
        `Watermark: ${res.data.watermark}\n\n` +
        `Telah tersimpan di folder unduhan medis Anda.`
      );
    } catch (e) {
      alert("Gagal mengunduh file.");
    }
  };

  if (isLoading) {
    return (
      <section className="panel" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
        <p>Memuat catatan konseling...</p>
      </section>
    );
  }

  if (error || !notes) {
    return (
      <section className="panel" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center", display: "grid", gap: 14 }}>
        <span className="icon-tile red" style={{ margin: "0 auto" }}>
          <AlertTriangle />
        </span>
        <h1 style={{ fontSize: 32 }}>Catatan Tidak Ditemukan</h1>
        <p className="error">{error || "Data catatan tidak tersedia."}</p>
      </section>
    );
  }

  return (
    <section className="panel" style={{ display: "grid", gap: 18, maxWidth: 820, margin: "0 auto" }}>
      <span className="badge warning">RAHASIA - DOKUMEN RESMI</span>
      <h1 style={{ fontSize: 44 }}>Catatan Konseling</h1>
      <div className="muted-box" style={{ display: "grid", gap: 14 }}>
        <p><strong>Keluhan Utama:</strong><br />{notes.chiefComplaint}</p>
        <p><strong>Observasi & Asesmen Klinis:</strong><br />{notes.assessmentObservation}</p>
        <p><strong>Intervensi Terapi:</strong><br />{notes.interventions}</p>
        <p><strong>Rencana Tindak Lanjut:</strong><br />{notes.followUpPlan}</p>
        {notes.recommendations && <p><strong>Rekomendasi Psikolog:</strong><br />{notes.recommendations}</p>}
      </div>
      <button className="button button-primary" type="button" onClick={handleDownload}>
        <Download size={18} /> Download PDF Resmi
      </button>
    </section>
  );
}

export default function NotesPreviewPage() {
  return (
    <div className="page-shell">
      <NavBar />
      <main className="container section">
        <Suspense fallback={
          <section className="panel" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
            <p>Menyiapkan catatan...</p>
          </section>
        }>
          <NotesDetails />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
