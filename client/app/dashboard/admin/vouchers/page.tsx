"use client";

import { useEffect, useState } from "react";
import { Check, X, Calendar, Ticket, ShieldAlert, Sparkles, RefreshCw, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminLayout } from "../../../../components/AdminLayout";
import { apiFetch } from "../../../../lib/api";
import { formatCurrency } from "@mindbridge/shared";

type Voucher = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  quota: number;
  usedCount: number;
  isActive: boolean;
  packages: string[];
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
};

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Form States
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("FIXED");
  const [discountValue, setDiscountValue] = useState(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | "">("");
  const [minOrderAmount, setMinOrderAmount] = useState<number | "">("");
  const [quota, setQuota] = useState(0);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Alerts
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadVouchers() {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const res = await apiFetch("/api/admin/vouchers");
      setVouchers(res.data || []);
    } catch (e: any) {
      console.error("Failed to load vouchers", e);
      setErrorMessage("Gagal memuat data voucher.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVouchers();
  }, []);

  function handleOpenCreateModal() {
    setEditingVoucher(null);
    setCode("");
    setName("");
    setDescription("");
    setDiscountType("FIXED");
    setDiscountValue(0);
    setMaxDiscountAmount("");
    setMinOrderAmount("");
    setQuota(0);
    setSelectedPackages(["ONLINE", "OFFLINE"]);
    setValidFrom("");
    setValidUntil("");
    setIsActive(true);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(v: Voucher) {
    setEditingVoucher(v);
    setCode(v.code);
    setName(v.name);
    setDescription(v.description || "");
    setDiscountType(v.discountType);
    setDiscountValue(v.discountValue);
    setMaxDiscountAmount(v.maxDiscountAmount ?? "");
    setMinOrderAmount(v.minOrderAmount ?? "");
    setQuota(v.quota);
    setSelectedPackages(v.packages);
    setValidFrom(v.validFrom ? new Date(v.validFrom).toISOString().slice(0, 16) : "");
    setValidUntil(v.validUntil ? new Date(v.validUntil).toISOString().slice(0, 16) : "");
    setIsActive(v.isActive);
    setIsModalOpen(true);
  }

  async function handleSaveVoucher(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!code.trim() || !name.trim()) {
      setErrorMessage("Kode dan Nama Voucher wajib diisi.");
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || null,
      discountType,
      discountValue: Number(discountValue),
      maxDiscountAmount: maxDiscountAmount !== "" ? Number(maxDiscountAmount) : null,
      minOrderAmount: minOrderAmount !== "" ? Number(minOrderAmount) : null,
      quota: Number(quota),
      packages: selectedPackages,
      validFrom: validFrom ? new Date(validFrom).toISOString() : null,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      isActive
    };

    try {
      if (editingVoucher) {
        await apiFetch(`/api/admin/vouchers/${editingVoucher.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        setSuccessMessage(`Voucher ${payload.code} berhasil diperbarui.`);
      } else {
        await apiFetch("/api/admin/vouchers", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setSuccessMessage(`Voucher ${payload.code} berhasil dibuat.`);
      }
      setIsModalOpen(false);
      loadVouchers();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan voucher.");
    }
  }

  async function handleDeleteVoucher(id: string, code: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus voucher ${code}?`)) return;
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await apiFetch(`/api/admin/vouchers/${id}`, {
        method: "DELETE"
      });
      setSuccessMessage(`Voucher ${code} berhasil dihapus.`);
      loadVouchers();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghapus voucher.");
    }
  }

  async function handleToggleStatus(id: string, code: string) {
    try {
      await apiFetch(`/api/admin/vouchers/${id}/toggle`, {
        method: "PATCH"
      });
      setSuccessMessage(`Status aktif voucher ${code} berhasil diubah.`);
      loadVouchers();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengubah status aktif voucher.");
    }
  }

  function togglePackage(pkg: string) {
    if (selectedPackages.includes(pkg)) {
      setSelectedPackages(selectedPackages.filter((p) => p !== pkg));
    } else {
      setSelectedPackages([...selectedPackages, pkg]);
    }
  }

  return (
    <AdminLayout activeTab="vouchers">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            Promosi & Diskon
          </p>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Kelola Voucher
          </h1>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={loadVouchers}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              color: "#475569",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleOpenCreateModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              border: "none",
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Plus size={16} /> Tambah Voucher
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div style={{ backgroundColor: "#D1FAE5", color: "#065F46", padding: "14px 20px", borderRadius: 14, marginBottom: 24, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <Check size={18} /> {successMessage}
        </div>
      )}
      {errorMessage && (
        <div style={{ backgroundColor: "#FEE2E2", color: "#991B1B", padding: "14px 20px", borderRadius: 14, marginBottom: 24, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldAlert size={18} /> {errorMessage}
        </div>
      )}

      {/* Table Card */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#94A3B8", fontSize: 14, fontWeight: 500 }}>
            Memuat daftar voucher...
          </div>
        ) : vouchers.length === 0 ? (
          <div style={{ padding: 64, textAlign: "center", color: "#94A3B8", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Ticket size={40} style={{ color: "#CBD5E1" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: "#475569" }}>Belum Ada Voucher</div>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Klik "Tambah Voucher" untuk membuat diskon baru.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC" }}>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9" }}>Voucher</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9" }}>Diskon</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9" }}>Layanan</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9" }}>Kuota / Terpakai</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9" }}>Masa Berlaku</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9" }}>Status</th>
                  <th style={{ padding: "14px 24px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9", width: 150 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher, index) => {
                  const hasValidity = voucher.validFrom || voucher.validUntil;
                  return (
                    <tr
                      key={voucher.id}
                      style={{
                        borderBottom: index < vouchers.length - 1 ? "1px solid #F8FAFC" : "none",
                        transition: "background 0.15s"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "#EEF2FF", display: "grid", placeItems: "center", color: "#4F46E5" }}>
                            <Ticket size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#1E293B" }}>{voucher.code}</div>
                            <div style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{voucher.name}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                          {voucher.discountType === "PERCENTAGE" ? `${voucher.discountValue}%` : formatCurrency(voucher.discountValue)}
                        </div>
                        {voucher.maxDiscountAmount && (
                          <div style={{ fontSize: 11, color: "#64748B" }}>
                            Max: {formatCurrency(voucher.maxDiscountAmount)}
                          </div>
                        )}
                        {voucher.minOrderAmount && (
                          <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 500 }}>
                            Min Transaksi: {formatCurrency(voucher.minOrderAmount)}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {voucher.packages.map((pkg) => (
                            <span
                              key={pkg}
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                color: "#475569",
                                backgroundColor: "#F1F5F9",
                                padding: "2px 8px",
                                borderRadius: 6
                              }}
                            >
                              {pkg}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                          {voucher.quota > 0 ? `${voucher.usedCount} / ${voucher.quota}` : `${voucher.usedCount} / ∞`}
                        </div>
                      </td>

                      <td style={{ padding: "16px 24px" }}>
                        {hasValidity ? (
                          <div style={{ fontSize: 12, color: "#475569", display: "flex", flexDirection: "column", gap: 2 }}>
                            {voucher.validFrom && (
                              <span>Mulai: {new Date(voucher.validFrom).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            )}
                            {voucher.validUntil && (
                              <span>Selesai: {new Date(voucher.validUntil).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94A3B8" }}>Selamanya</span>
                        )}
                      </td>

                      <td style={{ padding: "16px 24px" }}>
                        <button
                          onClick={() => handleToggleStatus(voucher.id, voucher.code)}
                          style={{
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            color: voucher.isActive ? "#2563EB" : "#94A3B8"
                          }}
                        >
                          {voucher.isActive ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                        </button>
                      </td>

                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                          <button
                            onClick={() => handleOpenEditModal(voucher)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#FFFFFF",
                              color: "#475569",
                              border: "1px solid #E2E8F0",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              transition: "all 0.2s"
                            }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteVoucher(voucher.id, voucher.code)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#FFFFFF",
                              color: "#EF4444",
                              border: "1px solid #FCA5A5",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              transition: "all 0.2s"
                            }}
                          >
                            <Trash2 size={13} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Voucher Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "grid",
          placeItems: "center",
          zIndex: 999
        }}>
          <div style={{
            backgroundColor: "#1E293B",
            width: "100%",
            maxWidth: 600,
            borderRadius: 20,
            padding: 32,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            color: "#FFFFFF",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            {/* Modal Title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
                  {editingVoucher ? "Edit Voucher" : "Create Voucher"}
                </h2>
                <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 4, margin: 0 }}>
                  Fill in the details to {editingVoucher ? "modify the" : "create a new"} voucher.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: 4
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveVoucher} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Packages Selection */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>
                  Packages
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  {["ONLINE", "OFFLINE"].map((pkg) => {
                    const isSel = selectedPackages.includes(pkg);
                    return (
                      <button
                        type="button"
                        key={pkg}
                        onClick={() => togglePackage(pkg)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: 10,
                          border: isSel ? "2px solid #6366F1" : "1px solid #475569",
                          backgroundColor: isSel ? "rgba(99, 102, 241, 0.15)" : "#334155",
                          color: isSel ? "#818CF8" : "#E2E8F0",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        {pkg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code & Name Row */}
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>
                    Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter voucher code..."
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #475569",
                      backgroundColor: "#334155",
                      color: "#FFFFFF",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter voucher name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #475569",
                      backgroundColor: "#334155",
                      color: "#FFFFFF",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* Discount Type & Discount Value Row */}
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #475569",
                      backgroundColor: "#334155",
                      color: "#FFFFFF",
                      fontSize: 14,
                      outline: "none"
                    }}
                  >
                    <option value="FIXED">Fixed Amount</option>
                    <option value="PERCENTAGE">Percentage</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g., 50000"
                    value={discountValue || ""}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #475569",
                      backgroundColor: "#334155",
                      color: "#FFFFFF",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* Max Discount & Min Order Row */}
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>
                    Max Discount Amount - (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 100000"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value !== "" ? Number(e.target.value) : "")}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #475569",
                      backgroundColor: "#334155",
                      color: "#FFFFFF",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>
                    Min Order Amount - (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 500000"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value !== "" ? Number(e.target.value) : "")}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #475569",
                      backgroundColor: "#334155",
                      color: "#FFFFFF",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* Quota & Status Row */}
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>
                    Quota
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter quota..."
                    value={quota || ""}
                    onChange={(e) => setQuota(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #475569",
                      backgroundColor: "#334155",
                      color: "#FFFFFF",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>
                    Status
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, height: 42 }}>
                    <input
                      type="checkbox"
                      id="isActiveToggle"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      style={{
                        width: 18,
                        height: 18,
                        cursor: "pointer"
                      }}
                    />
                    <label htmlFor="isActiveToggle" style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1", cursor: "pointer" }}>
                      Active
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>
                  Description - (Optional)
                </label>
                <textarea
                  placeholder="Enter description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: "100%",
                    height: 80,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #475569",
                    backgroundColor: "#334155",
                    color: "#FFFFFF",
                    fontSize: 14,
                    outline: "none",
                    resize: "none"
                  }}
                />
              </div>

              {/* Valid From & Valid Until Row */}
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>
                    Valid From - (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #475569",
                      backgroundColor: "#334155",
                      color: "#FFFFFF",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>
                    Valid Until - (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #475569",
                      backgroundColor: "#334155",
                      color: "#FFFFFF",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#E2E8F0",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    borderRadius: 10,
                    border: "none",
                    backgroundColor: "#6366F1",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer"
                  }}
                >
                  {editingVoucher ? "Save Changes" : "Create Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
