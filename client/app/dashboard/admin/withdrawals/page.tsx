"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "../../../../components/AdminLayout";
import { apiFetch } from "../../../../lib/api";
import { formatCurrency } from "../../../../lib/shared";
import { Wallet, Users } from "lucide-react";

type WalletRow = {
  psychologistId: string;
  name: string;
  email: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  hasBankAccount: boolean;
};

type WithdrawalRow = {
  id: string;
  psychologistName: string;
  amount: number;
  adminFee: number;
  netAmount: number;
  status: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  gatewayReference: string;
  failureReason: string;
  createdAt: string;
  processedAt: string;
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PENDING: { bg: "#FEF3C7", color: "#92400E", label: "Menunggu" },
  PROCESSING: { bg: "#DBEAFE", color: "#1D4ED8", label: "Diproses" },
  COMPLETED: { bg: "#D1FAE5", color: "#065F46", label: "Selesai" },
  FAILED: { bg: "#FEE2E2", color: "#991B1B", label: "Gagal" }
};

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminWithdrawalsPage() {
  const [tab, setTab] = useState<"withdrawals" | "wallets">("withdrawals");
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    try {
      const [wRes, dRes] = await Promise.all([
        apiFetch("/api/admin/wallets"),
        apiFetch(`/api/admin/withdrawals${statusFilter ? `?status=${statusFilter}` : ""}`)
      ]);
      if (wRes?.data) setWallets(wRes.data);
      if (dRes?.data) setWithdrawals(dRes.data);
    } catch (e) {
      console.error("Failed to load admin payouts", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const totalOutstanding = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalPaid = withdrawals.filter((w) => w.status === "COMPLETED").reduce((s, w) => s + w.netAmount, 0);

  return (
    <AdminLayout activeTab="withdrawals">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Pencairan Komisi</h1>
        <p style={{ color: "#64748B", fontSize: 15, fontWeight: 500 }}>
          Pantau saldo komisi psikolog dan riwayat pencairan ke rekening bank mereka.
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 28 }}>
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#64748B" }}><Wallet size={16} /> Total Saldo Belum Dicairkan</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10, color: "#0F172A" }}>{formatCurrency(totalOutstanding)}</div>
        </div>
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#64748B" }}><Users size={16} /> Total Sudah Ditransfer</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10, color: "#059669" }}>{formatCurrency(totalPaid)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {([["withdrawals", "Riwayat Pencairan"], ["wallets", "Saldo Psikolog"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "1px solid " + (tab === key ? "#2563EB" : "#E2E8F0"), backgroundColor: tab === key ? "#2563EB" : "#FFFFFF", color: tab === key ? "#FFFFFF" : "#475569" }}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p style={{ color: "#64748B", fontSize: 15 }}>Memuat data...</p>
      ) : tab === "withdrawals" ? (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>Riwayat Pencairan</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ borderRadius: 8, height: 38, padding: "0 12px", border: "1px solid #E2E8F0", fontSize: 13, color: "#0F172A", backgroundColor: "#FFF", fontWeight: 600 }}
            >
              <option value="">Semua Status</option>
              <option value="PROCESSING">Diproses</option>
              <option value="COMPLETED">Selesai</option>
              <option value="FAILED">Gagal</option>
              <option value="PENDING">Menunggu</option>
            </select>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC" }}>
                  {["Tanggal", "Psikolog", "Nominal", "Biaya", "Ditransfer", "Rekening", "Status"].map((h) => (
                    <th key={h} style={{ padding: "12px 24px", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", textAlign: "left", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>Belum ada pencairan.</td></tr>
                ) : (
                  withdrawals.map((w) => {
                    const st = STATUS_STYLES[w.status] || STATUS_STYLES.PENDING;
                    return (
                      <tr key={w.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "14px 24px", fontSize: 13, color: "#475569" }}>{formatDate(w.createdAt)}</td>
                        <td style={{ padding: "14px 24px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{w.psychologistName}</td>
                        <td style={{ padding: "14px 24px", fontSize: 13, color: "#0F172A" }}>{formatCurrency(w.amount)}</td>
                        <td style={{ padding: "14px 24px", fontSize: 13, color: "#64748B" }}>{formatCurrency(w.adminFee)}</td>
                        <td style={{ padding: "14px 24px", fontSize: 13, fontWeight: 700, color: "#059669" }}>{formatCurrency(w.netAmount)}</td>
                        <td style={{ padding: "14px 24px", fontSize: 13, color: "#475569" }}>{w.bankName} · {w.bankAccountNumber}<div style={{ fontSize: 11, color: "#94A3B8" }}>{w.bankAccountHolder}</div></td>
                        <td style={{ padding: "14px 24px" }}>
                          <span style={{ backgroundColor: st.bg, color: st.color, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{st.label}</span>
                          {w.status === "FAILED" && w.failureReason && <div style={{ fontSize: 11, color: "#991B1B", marginTop: 4 }}>{w.failureReason}</div>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>Saldo Komisi Psikolog</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC" }}>
                  {["Psikolog", "Saldo", "Total Komisi", "Total Dicairkan", "Rekening"].map((h) => (
                    <th key={h} style={{ padding: "12px 24px", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", textAlign: "left", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wallets.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>Belum ada data.</td></tr>
                ) : (
                  wallets.map((w) => (
                    <tr key={w.psychologistId} style={{ borderTop: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "14px 24px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{w.name}<div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>{w.email}</div></td>
                      <td style={{ padding: "14px 24px", fontSize: 13, fontWeight: 700, color: "#2563EB" }}>{formatCurrency(w.balance)}</td>
                      <td style={{ padding: "14px 24px", fontSize: 13, color: "#475569" }}>{formatCurrency(w.totalEarned)}</td>
                      <td style={{ padding: "14px 24px", fontSize: 13, color: "#475569" }}>{formatCurrency(w.totalWithdrawn)}</td>
                      <td style={{ padding: "14px 24px", fontSize: 13 }}>
                        {w.hasBankAccount ? (
                          <span style={{ backgroundColor: "#D1FAE5", color: "#065F46", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Lengkap</span>
                        ) : (
                          <span style={{ backgroundColor: "#FEF3C7", color: "#92400E", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Belum diisi</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
