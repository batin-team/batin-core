"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "../../../../components/AdminLayout";
import { apiFetch } from "../../../../lib/api";
import { formatCurrency } from "../../../../lib/shared";
import { Percent, Banknote, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [commissionPercent, setCommissionPercent] = useState("20");
  const [withdrawalAdminFee, setWithdrawalAdminFee] = useState("5000");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function load() {
    try {
      const res = await apiFetch("/api/admin/settings");
      if (res?.data) {
        setCommissionPercent(String(res.data.commissionPercent ?? 20));
        setWithdrawalAdminFee(String(res.data.withdrawalAdminFee ?? 5000));
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    setErrorMsg("");
    try {
      await apiFetch("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({
          commissionPercent: Number(commissionPercent),
          withdrawalAdminFee: Number(withdrawalAdminFee)
        })
      });
      setMessage("Pengaturan komisi berhasil disimpan.");
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  const pct = Number(commissionPercent) || 0;
  const exampleBase = 300000;
  const examplePlatform = Math.round(exampleBase * (pct / 100));
  const exampleProvider = exampleBase - examplePlatform;

  return (
    <AdminLayout activeTab="settings">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Pengaturan Komisi</h1>
        <p style={{ color: "#64748B", fontSize: 15, fontWeight: 500 }}>
          Atur persentase komisi platform dan biaya admin pencairan. Komisi dihitung dari harga dasar sesi saat sesi selesai.
        </p>
      </div>

      <div style={{ maxWidth: 720, display: "grid", gap: 24 }}>
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          {isLoading ? (
            <p style={{ color: "#64748B", fontSize: 15 }}>Memuat pengaturan...</p>
          ) : (
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {message && (
                <div style={{ backgroundColor: "#ECFDF5", border: "1px solid #10B981", color: "#065F46", padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={16} /> {message}
                </div>
              )}
              {errorMsg && (
                <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #EF4444", color: "#991B1B", padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700 }}>{errorMsg}</div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                  <Percent size={14} /> Persentase Komisi Platform (%)
                </label>
                <div style={{ position: "relative", maxWidth: 220 }}>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value)}
                    required
                    style={{ borderRadius: 8, height: 44, padding: "0 36px 0 12px", border: "1px solid #E2E8F0", fontSize: 16, color: "#0F172A", width: "100%", fontWeight: 700 }}
                  />
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontWeight: 700 }}>%</span>
                </div>
                <span style={{ fontSize: 12, color: "#94A3B8" }}>Bagian yang Anda (platform) ambil dari setiap sesi yang selesai.</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                  <Banknote size={14} /> Biaya Admin Pencairan (Rp)
                </label>
                <div style={{ position: "relative", maxWidth: 220 }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontWeight: 600 }}>Rp</span>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={withdrawalAdminFee}
                    onChange={(e) => setWithdrawalAdminFee(e.target.value)}
                    required
                    style={{ borderRadius: 8, height: 44, padding: "0 12px 0 36px", border: "1px solid #E2E8F0", fontSize: 16, color: "#0F172A", width: "100%", fontWeight: 700 }}
                  />
                </div>
                <span style={{ fontSize: 12, color: "#94A3B8" }}>Dipotong dari nominal pencairan psikolog setiap kali mencairkan saldo.</span>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                style={{ backgroundColor: "#2563EB", color: "#FFFFFF", height: 46, borderRadius: 10, fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", alignSelf: "flex-start", padding: "0 24px", opacity: isSaving ? 0.7 : 1 }}
              >
                {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </form>
          )}
        </div>

        {/* Example calculation */}
        <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 20, padding: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 0, marginBottom: 12 }}>Contoh Perhitungan</h4>
          <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 12px" }}>Untuk sesi dengan harga dasar {formatCurrency(exampleBase)}:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#475569" }}>Komisi platform ({pct}%)</span>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>{formatCurrency(examplePlatform)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#475569" }}>Diterima psikolog</span>
              <span style={{ fontWeight: 700, color: "#059669" }}>{formatCurrency(exampleProvider)}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
