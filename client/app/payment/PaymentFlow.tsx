"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CreditCard, Smartphone, Wallet } from "lucide-react";
import { formatCurrency } from "@mindbridge/shared";
import { apiFetch } from "../../lib/api";

type PendingBooking = {
  id: string;
  clientName: string;
  psychologistId: string;
  psychologist?: {
    name: string;
    title: string;
    pricePerSession: number;
  };
  sessionType: "ONLINE" | "OFFLINE";
  status: string;
  scheduledAt: string;
  slotKey?: string;
  amount: number;
  location?: string;
  meetUrl?: string;
  assignmentMethod: "AUTO_ASSIGN" | "SELF_SELECT";
  distanceKm?: number;
  payment?: {
    orderId: string;
    amount: number;
    snapToken: string;
    redirectUrl: string;
  };
};

const paymentMethods = [
  { id: "va", title: "Virtual Account", description: "BCA, BNI, BRI, Mandiri", icon: Building2 },
  { id: "qris", title: "GoPay / QRIS", description: "Pembayaran cepat dengan e-wallet", icon: Wallet },
  { id: "card", title: "Kartu Debit/Kredit", description: "Visa, Mastercard, JCB", icon: CreditCard },
  { id: "dana", title: "DANA / OVO", description: "E-wallet populer Indonesia", icon: Smartphone }
];

function getFormattedDateTime(scheduledAtStr: string, slotKey?: string) {
  let datePart = "";
  let timePart = "";

  if (slotKey && slotKey.includes("T")) {
    const parts = slotKey.split("T");
    datePart = parts[0];
    timePart = parts[1];
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
  
  return {
    date: formattedDate,
    time: `${timePart} WIB`
  };
}

export function PaymentFlow() {
  const router = useRouter();
  const [booking, setBooking] = useState<PendingBooking | null>(null);
  const [selectedMethod, setSelectedMethod] = useState("Virtual Account");

  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("mindbridge_pending_booking");
    if (!raw) {
      router.replace("/booking");
      return;
    }
    const parsed = JSON.parse(raw) as PendingBooking;
    setBooking(parsed);

    // Sync current payment state from server
    apiFetch(`/api/payments/${parsed.id}`)
      .then((res) => {
        if (res.data && res.data.voucherCode) {
          setAppliedVoucher({
            code: res.data.voucherCode,
            name: `Voucher ${res.data.voucherCode}`,
            discountType: "FIXED",
            discountValue: res.data.discountAmount,
            discountAmount: res.data.discountAmount
          });
          setVoucherCodeInput(res.data.voucherCode);
        }
      })
      .catch((err) => console.error("Error syncing payment details:", err));
  }, [router]);

  async function handleApplyVoucher() {
    if (!booking) return;
    if (!voucherCodeInput.trim()) {
      setVoucherError("Silakan masukkan kode voucher");
      return;
    }
    setIsApplyingVoucher(true);
    setVoucherError("");
    try {
      const res = await apiFetch(`/api/payments/${booking.id}/apply-voucher`, {
        method: "POST",
        body: JSON.stringify({ code: voucherCodeInput })
      });
      if (res.error) {
        setVoucherError(res.error);
      } else if (res.success) {
        setAppliedVoucher(res.voucher);
      }
    } catch (err: any) {
      setVoucherError(err.message || "Gagal menerapkan voucher");
    } finally {
      setIsApplyingVoucher(false);
    }
  }

  async function handleCancelVoucher() {
    if (!booking) return;
    setIsApplyingVoucher(true);
    setVoucherError("");
    try {
      const res = await apiFetch(`/api/payments/${booking.id}/cancel-voucher`, {
        method: "POST"
      });
      if (res.error) {
        setVoucherError(res.error);
      } else if (res.success) {
        setAppliedVoucher(null);
        setVoucherCodeInput("");
      }
    } catch (err: any) {
      setVoucherError(err.message || "Gagal membatalkan voucher");
    } finally {
      setIsApplyingVoucher(false);
    }
  }

  async function handlePay() {
    if (!booking) return;
    try {
      // Trigger the mock payment settlement callback to update PostgreSQL state
      await apiFetch("/api/payments/webhook", {
        method: "POST",
        body: JSON.stringify({
          order_id: booking.payment?.orderId || `MB-ORDER-${booking.id}`,
          transaction_status: "settlement",
          payment_type: "credit_card",
          signature_key: "mock-signature"
        })
      });

      // Query database for the updated session details
      const sessionRes = await apiFetch(`/api/sessions/${booking.id}`);

      // Save confirmed details for receipt visual rendering
      localStorage.setItem("mindbridge_confirmed_booking", JSON.stringify({
        ...sessionRes.data,
        slotKey: booking.slotKey,
        assignmentMethod: booking.assignmentMethod,
        distanceKm: booking.distanceKm
      }));

      localStorage.removeItem("mindbridge_pending_booking");
      router.push("/booking/confirmation");
      router.refresh();
    } catch (err: any) {
      alert("Proses pembayaran gagal: " + err.message);
    }
  }

  if (!booking) {
    return (
      <section className="panel" style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <p style={{ color: "#64748B", fontWeight: 600 }}>Memuat ringkasan pembayaran...</p>
      </section>
    );
  }

  const dateTimeInfo = getFormattedDateTime(booking.scheduledAt, booking.slotKey);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Eyebrow & Titles */}
      <div style={{ marginBottom: 40 }}>
        <span style={{ color: "#2563EB", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", fontSize: 13, marginBottom: 8, display: "block" }}>
          Pembayaran
        </span>
        <h1 style={{ fontSize: 36, color: "#0F172A", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 12 }}>
          Selesaikan pembayaran sesi
        </h1>
        <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.6, maxWidth: 680 }}>
          Setelah pembayaran berhasil, sesi akan dikonfirmasi. Sesi online mendapat link Google Meet mock otomatis.
        </p>
      </div>

      {/* Main Grid */}
      <div className="payment-grid">
        {/* Left Column: Payment Methods */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: 0 }}>
            Metode Pembayaran
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod === method.title;
              return (
                <div
                  key={method.title}
                  onClick={() => setSelectedMethod(method.title)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "20px",
                    borderRadius: 16,
                    border: `2px solid ${isSelected ? "#2563EB" : "#E2E8F0"}`,
                    backgroundColor: isSelected ? "#F0F7FF" : "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {/* Styled Radio indicator */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `2px solid ${isSelected ? "#2563EB" : "#CBD5E1"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 4,
                      flexShrink: 0
                    }}
                  >
                    {isSelected && (
                      <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#2563EB" }} />
                    )}
                  </div>

                  {/* Icon Tile */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: isSelected ? "#E0F2FE" : "#F1F5F9",
                      color: isSelected ? "#0284C7" : "#64748B",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0
                    }}
                  >
                    <method.icon size={20} />
                  </div>

                  {/* Descriptions */}
                  <div>
                    <strong style={{ display: "block", fontSize: 15, color: "#0F172A", fontWeight: 700 }}>
                      {method.title}
                    </strong>
                    <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500, marginTop: 2, display: "block" }}>
                      {method.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ringkasan Sidebar */}
        <aside
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 32,
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: 20
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>
            Ringkasan
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, borderTop: "1px solid #F1F5F9", paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Client</span>
              <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>{booking.clientName}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Psikolog</span>
              <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>{booking.psychologist?.name || "Bagus Wiratama, M.Psi"}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Metode</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#2563EB",
                  backgroundColor: "#EFF6FF",
                  padding: "4px 10px",
                  borderRadius: 99,
                  textTransform: "uppercase"
                }}
              >
                {booking.sessionType}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Jadwal</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
                <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>{dateTimeInfo.date}</span>
                <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500, marginTop: 2 }}>{dateTimeInfo.time}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Assign</span>
              <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>
                {booking.assignmentMethod === "AUTO_ASSIGN" ? "Auto assign" : "Pilih manual"}
              </span>
            </div>

            {booking.sessionType === "OFFLINE" && booking.location && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Lokasi</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right", maxWidth: "60%" }}>
                  <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>{booking.location}</span>
                  {booking.distanceKm !== undefined && (
                    <span style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Jarak: {booking.distanceKm} km</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Voucher input form */}
          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 14, color: "#475569", fontWeight: 600 }}>Voucher Diskon</span>
            
            {appliedVoucher ? (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F0FDF4",
                border: "1px solid #BBF7D0",
                padding: "10px 14px",
                borderRadius: 12,
                transition: "all 0.2s"
              }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}>{appliedVoucher.code}</span>
                  <span style={{ fontSize: 11, color: "#15803d", fontWeight: 500 }}>Hemat {formatCurrency(appliedVoucher.discountAmount)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelVoucher}
                  disabled={isApplyingVoucher}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#DC2626",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "4px 8px"
                  }}
                >
                  Batal
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Masukkan kode voucher"
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value)}
                  disabled={isApplyingVoucher}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #CBD5E1",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  disabled={isApplyingVoucher}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "none",
                    backgroundColor: "#2563EB",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                >
                  {isApplyingVoucher ? "..." : "Gunakan"}
                </button>
              </div>
            )}

            {voucherError && (
              <span style={{ fontSize: 12, color: "#DC2626", fontWeight: 600 }}>{voucherError}</span>
            )}
          </div>

          {/* Pricing shaded box */}
          <div style={{ backgroundColor: "#F0F7FF", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>Biaya sesi</span>
              <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>
                {formatCurrency((booking.psychologist?.pricePerSession ?? (booking.amount - 35000)))}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>Biaya platform</span>
              <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>{formatCurrency(35000)}</span>
            </div>

            {appliedVoucher && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#166534", fontWeight: 600 }}>Diskon ({appliedVoucher.code})</span>
                <span style={{ fontSize: 14, color: "#166534", fontWeight: 700 }}>-{formatCurrency(appliedVoucher.discountAmount)}</span>
              </div>
            )}

            <div style={{ borderTop: "1px solid #BFDBFE", margin: "6px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, color: "#0F172A", fontWeight: 800 }}>Total</span>
              <span style={{ fontSize: 18, color: "#2563EB", fontWeight: 800 }}>
                {formatCurrency(appliedVoucher ? booking.amount - appliedVoucher.discountAmount : booking.amount)}
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handlePay}
            type="button"
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 12,
              border: "none",
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1)",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2563EB"}
          >
            <CreditCard size={18} /> Bayar Sekarang
          </button>

          {/* Secure Muted text */}
          <span style={{ display: "block", fontSize: 12, color: "#94A3B8", textAlign: "center", fontWeight: 600, marginTop: 4 }}>
            🔒 Pembayaran Aman & Terenkripsi
          </span>
        </aside>
      </div>
    </div>
  );
}
