"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PsychologistLayout } from "../../../../components/PsychologistLayout";
import { apiFetch } from "../../../../lib/api";
import { formatCurrency } from "../../../../lib/shared";
import { Wallet, ArrowDownToLine, TrendingUp, Banknote, CheckCircle2, AlertCircle, X } from "lucide-react";

type WalletEntry = {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
};

type WithdrawalRow = {
  id: string;
  amount: number;
  adminFee: number;
  netAmount: number;
  status: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  failureReason: string;
  createdAt: string;
  processedAt: string;
};

type WalletData = {
  balance: number;
  withdrawalAdminFee: number;
  withdrawalsThisMonth: number;
  maxWithdrawalsPerMonth: number;
  withdrawalsRemaining: number;
  totalEarned: number;
  totalWithdrawn: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  hasBankAccount: boolean;
  entries: WalletEntry[];
  withdrawals: WithdrawalRow[];
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PENDING: { bg: "#FEF3C7", color: "#92400E", label: "Menunggu" },
  PROCESSING: { bg: "#DBEAFE", color: "#1D4ED8", label: "Diproses" },
  COMPLETED: { bg: "#D1FAE5", color: "#065F46", label: "Selesai" },
  FAILED: { bg: "#FEE2E2", color: "#991B1B", label: "Gagal" }
};

const ENTRY_LABELS: Record<string, string> = {
  EARNING: "Komisi sesi",
  WITHDRAWAL: "Pencairan",
  WITHDRAWAL_FEE: "Biaya admin",
  REVERSAL: "Pengembalian dana",
  ADJUSTMENT: "Penyesuaian"
};

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function PsychologistWalletPage() {
  const [data, setData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function load() {
    try {
      const walletRes = await apiFetch("/api/psychologist/wallet");
      if (walletRes?.data) setData(walletRes.data);
    } catch (e) {
      console.error("Failed to load wallet", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const adminFee = data?.withdrawalAdminFee ?? 0;
  const numericAmount = Number(amount) || 0;
  const netReceived = Math.max(0, numericAmount - adminFee);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/psychologist/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount: numericAmount })
      });
      const status = res?.data?.status;
      setModalOpen(false);
      setAmount("");
      setMessage(
        status === "COMPLETED"
          ? "Pencairan berhasil diproses dan dana telah dikirim ke rekening Anda."
          : status === "FAILED"
          ? "Pencairan gagal diproses oleh gateway. Saldo Anda telah dikembalikan."
          : "Permintaan pencairan sedang diproses."
      );
      await load();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memproses pencairan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PsychologistLayout activeTab="wallet">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Wallet & Komisi</h1>
        <p style={{ color: "#64748B", fontSize: 15, fontWeight: 500 }}>
          Saldo komisi Anda bertambah otomatis setiap sesi konseling selesai. Cairkan ke rekening bank kapan saja.
        </p>
      </div>

      {message && (
        <div style={{ backgroundColor: "#ECFDF5", border: "1px solid #10B981", color: "#065F46", padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      {isLoading ? (
        <p style={{ color: "#64748B", fontSize: 15 }}>Memuat data wallet...</p>
      ) : !data ? (
        <p style={{ color: "#EF4444", fontSize: 15, fontWeight: 600 }}>Data wallet tidak ditemukan.</p>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 28 }}>
            <div style={{ background: "linear-gradient(135deg, #2563EB, #0d9488)", borderRadius: 20, padding: 24, color: "#FFFFFF", boxShadow: "0 8px 24px rgba(37,99,235,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, opacity: 0.9 }}>
                <Wallet size={16} /> Saldo Tersedia
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, marginTop: 10 }}>{formatCurrency(data.balance)}</div>
              {(() => {
                const quotaReached = data.withdrawalsRemaining <= 0;
                const disabled = data.balance <= 0 || quotaReached;
                return (
                  <>
                    <button
                      onClick={() => { setErrorMsg(""); setModalOpen(true); }}
                      disabled={disabled}
                      style={{ marginTop: 16, backgroundColor: "#FFFFFF", color: "#2563EB", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 800, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: disabled ? 0.6 : 1 }}
                    >
                      <ArrowDownToLine size={16} /> Cairkan Saldo
                    </button>
                    <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, opacity: 0.9 }}>
                      {quotaReached
                        ? `Batas pencairan bulan ini tercapai (maks. ${data.maxWithdrawalsPerMonth}x).`
                        : `Sisa kuota pencairan bulan ini: ${data.withdrawalsRemaining} dari ${data.maxWithdrawalsPerMonth}x`}
                    </div>
                  </>
                );
              })()}
            </div>

            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#64748B" }}>
                <TrendingUp size={16} /> Total Komisi Diterima
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10, color: "#0F172A" }}>{formatCurrency(data.totalEarned)}</div>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#64748B" }}>
                <Banknote size={16} /> Total Dicairkan
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10, color: "#0F172A" }}>{formatCurrency(data.totalWithdrawn)}</div>
            </div>
          </div>

          {/* Bank account notice */}
          {!data.hasBankAccount && (
            <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FCD34D", color: "#92400E", padding: 16, borderRadius: 12, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <AlertCircle size={18} />
              <span>
                Anda belum mengisi data rekening bank.{" "}
                <Link href="/dashboard/psychologist/profile" style={{ color: "#92400E", fontWeight: 800, textDecoration: "underline" }}>
                  Lengkapi di Pengaturan Profil
                </Link>{" "}
                untuk dapat mencairkan saldo.
              </span>
            </div>
          )}

          {/* Withdrawal history */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.02)", marginBottom: 28, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>Riwayat Pencairan</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC" }}>
                    {["Tanggal", "Nominal", "Biaya Admin", "Diterima", "Rekening", "Status"].map((h) => (
                      <th key={h} style={{ padding: "12px 24px", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", textAlign: "left", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.withdrawals.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>Belum ada pencairan.</td></tr>
                  ) : (
                    data.withdrawals.map((w) => {
                      const st = STATUS_STYLES[w.status] || STATUS_STYLES.PENDING;
                      return (
                        <tr key={w.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "14px 24px", fontSize: 13, color: "#475569" }}>{formatDate(w.createdAt)}</td>
                          <td style={{ padding: "14px 24px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{formatCurrency(w.amount)}</td>
                          <td style={{ padding: "14px 24px", fontSize: 13, color: "#64748B" }}>{formatCurrency(w.adminFee)}</td>
                          <td style={{ padding: "14px 24px", fontSize: 13, fontWeight: 700, color: "#059669" }}>{formatCurrency(w.netAmount)}</td>
                          <td style={{ padding: "14px 24px", fontSize: 13, color: "#475569" }}>{w.bankName} · {w.bankAccountNumber}</td>
                          <td style={{ padding: "14px 24px" }}>
                            <span style={{ backgroundColor: st.bg, color: st.color, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{st.label}</span>
                            {w.status === "FAILED" && w.failureReason && (
                              <div style={{ fontSize: 11, color: "#991B1B", marginTop: 4 }}>{w.failureReason}</div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Wallet ledger */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>Mutasi Saldo Terbaru</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC" }}>
                    {["Tanggal", "Jenis", "Keterangan", "Jumlah"].map((h) => (
                      <th key={h} style={{ padding: "12px 24px", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", textAlign: "left", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.entries.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>Belum ada mutasi saldo.</td></tr>
                  ) : (
                    data.entries.map((en) => {
                      const isCredit = en.amount >= 0;
                      return (
                        <tr key={en.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "14px 24px", fontSize: 13, color: "#475569" }}>{formatDate(en.createdAt)}</td>
                          <td style={{ padding: "14px 24px", fontSize: 13, color: "#475569" }}>{ENTRY_LABELS[en.type] || en.type}</td>
                          <td style={{ padding: "14px 24px", fontSize: 13, color: "#64748B" }}>{en.description || "-"}</td>
                          <td style={{ padding: "14px 24px", fontSize: 13, fontWeight: 700, color: isCredit ? "#059669" : "#DC2626" }}>
                            {isCredit ? "+" : "-"}{formatCurrency(Math.abs(en.amount))}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Withdraw modal */}
      {modalOpen && data && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: 20, width: "100%", maxWidth: 460, padding: 28, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>Cairkan Saldo</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}><X size={20} /></button>
            </div>

            {!data.hasBankAccount ? (
              <p style={{ fontSize: 14, color: "#991B1B", fontWeight: 600 }}>
                Lengkapi data rekening bank di Pengaturan Profil terlebih dahulu.
              </p>
            ) : (
              <form onSubmit={handleWithdraw} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {errorMsg && (
                  <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #EF4444", color: "#991B1B", padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700 }}>{errorMsg}</div>
                )}

                <div style={{ backgroundColor: "#F8FAFC", borderRadius: 12, padding: 14, fontSize: 13, color: "#475569" }}>
                  <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Tujuan transfer</div>
                  {data.bankName} · {data.bankAccountNumber}<br />
                  a.n. {data.bankAccountHolder}
                </div>

                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>
                  Sisa kuota pencairan bulan ini: {data.withdrawalsRemaining} dari {data.maxWithdrawalsPerMonth}x
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Nominal Pencairan</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 14, fontWeight: 600 }}>Rp</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={1}
                      max={data.balance}
                      required
                      placeholder="0"
                      style={{ borderRadius: 8, height: 44, padding: "0 12px 0 36px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", width: "100%", fontWeight: 600 }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>Saldo tersedia: {formatCurrency(data.balance)}</span>
                </div>

                <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12, fontSize: 13, color: "#475569", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Biaya admin</span><span>- {formatCurrency(adminFee)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#0F172A" }}><span>Diterima</span><span>{formatCurrency(netReceived)}</span></div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || numericAmount <= adminFee || numericAmount > data.balance}
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF", height: 46, borderRadius: 10, fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", opacity: (isSubmitting || numericAmount <= adminFee || numericAmount > data.balance) ? 0.6 : 1 }}
                >
                  {isSubmitting ? "Memproses..." : "Konfirmasi Pencairan"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </PsychologistLayout>
  );
}
