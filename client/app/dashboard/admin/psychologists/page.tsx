"use client";

import { useEffect, useState } from "react";
import { UserCog, Search, CheckCircle, XCircle, Star, ToggleLeft, ToggleRight, ShieldCheck, X, Edit2 } from "lucide-react";
import { AdminLayout } from "../../../../components/AdminLayout";
import { apiFetch } from "../../../../lib/api";
import { formatCurrency } from "@mindbridge/shared";

type Psychologist = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  licenseNumber?: string;
  experienceYears?: number;
  pricePerSession: number;
  averageRating: number;
  totalSessions: number;
  specializations: string[];
  serviceMode?: string;
  gender?: string;
  homeAddress?: string;
  createdAt: string;
};

export default function AdminPsychologistsPage() {
  const [list, setList] = useState<Psychologist[]>([]);
  const [filtered, setFiltered] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVerif, setFilterVerif] = useState<"all" | "verified" | "pending">("all");
  const [toastMsg, setToastMsg] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPsychologist, setEditingPsychologist] = useState<Psychologist | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editExperienceYears, setEditExperienceYears] = useState(0);
  const [editPricePerSession, setEditPricePerSession] = useState(0);
  const [editLicenseNumber, setEditLicenseNumber] = useState("");
  const [editSpecializations, setEditSpecializations] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);
  const [editGender, setEditGender] = useState("FEMALE");
  const [editServiceMode, setEditServiceMode] = useState("ONLINE");
  const [editHomeAddress, setEditHomeAddress] = useState("");

  const openEditModal = (p: Psychologist) => {
    setEditingPsychologist(p);
    setEditName(p.name);
    setEditEmail(p.email);
    setEditPhone(p.phone || "");
    setEditExperienceYears(p.experienceYears || 0);
    setEditPricePerSession(p.pricePerSession);
    setEditLicenseNumber(p.licenseNumber || "");
    setEditSpecializations(p.specializations.join(", "));
    setEditAvatarUrl(p.avatarUrl || null);
    setEditGender(p.gender || "FEMALE");
    setEditServiceMode(p.serviceMode || "ONLINE");
    setEditHomeAddress(p.homeAddress || "");
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPsychologist) return;

    try {
      const specsArray = editSpecializations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await apiFetch(`/api/admin/users/${editingPsychologist.userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          avatarUrl: editAvatarUrl || "",
          experienceYears: Number(editExperienceYears),
          pricePerSession: Number(editPricePerSession),
          licenseNumber: editLicenseNumber,
          specializations: specsArray,
          gender: editGender,
          serviceMode: editServiceMode,
          homeAddress: editHomeAddress
        })
      });

      setList((prev) =>
        prev.map((item) =>
          item.id === editingPsychologist.id
            ? {
              ...item,
              name: editName,
              email: editEmail,
              phone: editPhone,
              avatarUrl: editAvatarUrl || undefined,
              experienceYears: Number(editExperienceYears),
              pricePerSession: Number(editPricePerSession),
              licenseNumber: editLicenseNumber,
              specializations: specsArray,
              gender: editGender,
              serviceMode: editServiceMode,
              homeAddress: editHomeAddress
            }
            : item
        )
      );
      setIsEditOpen(false);
      showToast("Data psikolog berhasil diperbarui.");
    } catch (err) {
      console.error(err);
      showToast("Gagal memperbarui data.");
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/api/admin/psychologists");
        setList(res.data || []);
        setFiltered(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let result = list;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
    }
    if (filterVerif === "verified") result = result.filter((p) => p.isVerified);
    if (filterVerif === "pending") result = result.filter((p) => !p.isVerified);
    setFiltered(result);
  }, [search, filterVerif, list]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await apiFetch(`/api/admin/psychologists/${id}/toggle-active`, { method: "PATCH" });
      setList((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: res.data.isActive } : p))
      );
      showToast(`Status psikolog berhasil diubah.`);
    } catch (e) {
      console.error(e);
      showToast("Gagal mengubah status.");
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await apiFetch(`/api/admin/psychologists/${id}/verify`, { method: "PATCH" });
      setList((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isVerified: true } : p))
      );
      showToast("Psikolog berhasil diverifikasi!");
    } catch (e) {
      console.error(e);
      showToast("Gagal memverifikasi psikolog.");
    }
  };

  const pendingCount = list.filter((p) => !p.isVerified).length;

  return (
    <AdminLayout activeTab="psychologists">
      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", top: 24, right: 32, zIndex: 999, backgroundColor: "#0F172A", color: "#FFFFFF", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle size={16} style={{ color: "#4ADE80" }} />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Manajemen</p>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>Kelola Psikolog</h1>
          <p style={{ color: "#64748B", fontSize: 14, fontWeight: 500, marginTop: 6 }}>
            {list.length} psikolog terdaftar{pendingCount > 0 && ` · ${pendingCount} menunggu verifikasi`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 400 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            style={{ width: "100%", height: 40, paddingLeft: 36, paddingRight: 12, borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
          />
        </div>

        {/* Verif filter chips */}
        {(["all", "verified", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterVerif(f)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid",
              fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              backgroundColor: filterVerif === f ? "#0F172A" : "#FFFFFF",
              borderColor: filterVerif === f ? "#0F172A" : "#E2E8F0",
              color: filterVerif === f ? "#FFFFFF" : "#475569"
            }}
          >
            {f === "all" ? "Semua" : f === "verified" ? "Terverifikasi" : "Menunggu Verifikasi"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 60, textAlign: "center", color: "#94A3B8", border: "1px solid #E2E8F0" }}>
          Memuat data psikolog...
        </div>
      ) : (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC" }}>
                  {["Psikolog", "Spesialisasi", "Harga/Sesi", "Rating", "Sesi", "Status", "Verifikasi", "Aksi"].map((h) => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>Tidak ada psikolog ditemukan.</td></tr>
                ) : (
                  filtered.map((p, i) => (
                    <tr
                      key={p.id}
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* Psikolog */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "#EFF6FF", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14, color: "#2563EB", flexShrink: 0, overflow: "hidden" }}>
                            {p.avatarUrl ? (
                              <img src={p.avatarUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              p.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>{p.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Spesialisasi */}
                      <td style={{ padding: "16px 20px", maxWidth: 180 }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {p.specializations.slice(0, 2).map((s) => (
                            <span key={s} style={{ fontSize: 10, fontWeight: 700, backgroundColor: "#F1F5F9", color: "#475569", padding: "2px 7px", borderRadius: 4 }}>
                              {s}
                            </span>
                          ))}
                          {p.specializations.length > 2 && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8" }}>+{p.specializations.length - 2}</span>
                          )}
                        </div>
                      </td>

                      {/* Harga */}
                      <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap" }}>
                        {formatCurrency(p.pricePerSession)}
                      </td>

                      {/* Rating */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Star size={13} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{p.averageRating?.toFixed(1) || "—"}</span>
                        </div>
                      </td>

                      {/* Total Sesi */}
                      <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 600, color: "#475569" }}>
                        {p.totalSessions}
                      </td>

                      {/* Aktif / Nonaktif toggle */}
                      <td style={{ padding: "16px 20px" }}>
                        <button
                          onClick={() => handleToggleActive(p.id)}
                          title={p.isActive ? "Nonaktifkan" : "Aktifkan"}
                          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0 }}
                        >
                          {p.isActive ? (
                            <>
                              <ToggleRight size={24} style={{ color: "#10B981" }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981" }}>Aktif</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={24} style={{ color: "#94A3B8" }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8" }}>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Verifikasi badge */}
                      <td style={{ padding: "16px 20px" }}>
                        {p.isVerified ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, backgroundColor: "#D1FAE5", color: "#065F46", padding: "4px 10px", borderRadius: 6 }}>
                            <CheckCircle size={12} /> Verified
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, backgroundColor: "#FEF3C7", color: "#92400E", padding: "4px 10px", borderRadius: 6 }}>
                            <XCircle size={12} /> Pending
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {!p.isVerified && (
                            <button
                              onClick={() => handleVerify(p.id)}
                              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              <ShieldCheck size={13} /> Verifikasi
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(p)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, backgroundColor: "#E2E8F0", color: "#475569", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#CBD5E1"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#E2E8F0"; }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.3)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: 20, width: "100%", maxWidth: 520, padding: 32, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0", position: "relative" }}>
            <button
              onClick={() => setIsEditOpen(false)}
              style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "grid", placeItems: "center", padding: 4 }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 8px 0" }}>Edit Profil Psikolog</h3>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 24px 0", fontWeight: 500 }}>Perbarui informasi akun dan profil layanan psikolog.</p>

            <form onSubmit={handleEditSubmit} style={{ display: "grid", gap: 20 }}>

              {/* Avatar Section */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #F1F5F9", paddingBottom: 16 }}>
                <div style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", overflow: "hidden", backgroundColor: "#F1F5F9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {editAvatarUrl ? (
                    <img src={editAvatarUrl} alt="Avatar Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #2563EB, #0d9488)", color: "#FFFFFF", fontSize: 24, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {editName ? editName.charAt(0).toUpperCase() : "P"}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Foto Profil</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => document.getElementById("admin-edit-avatar-input")?.click()}
                      style={{ backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      Pilih Foto
                    </button>
                    {editAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setEditAvatarUrl(null)}
                        style={{ backgroundColor: "#FFF", color: "#EF4444", border: "1px solid #FCA5A5", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <input
                    id="admin-edit-avatar-input"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        alert("Ukuran file foto maksimal adalah 2MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditAvatarUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ height: 42, padding: "0 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A" }}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{ height: 42, padding: "0 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A" }}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Nomor Telepon</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  style={{ height: 42, padding: "0 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Pengalaman (Tahun)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editExperienceYears}
                    onChange={(e) => setEditExperienceYears(Number(e.target.value))}
                    style={{ height: 42, padding: "0 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A" }}
                  />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Harga per Sesi (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editPricePerSession}
                    onChange={(e) => setEditPricePerSession(Number(e.target.value))}
                    style={{ height: 42, padding: "0 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Nomor Lisensi / Izin Praktek</label>
                <input
                  type="text"
                  required
                  value={editLicenseNumber}
                  onChange={(e) => setEditLicenseNumber(e.target.value)}
                  style={{ height: 42, padding: "0 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A" }}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Spesialisasi (pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="Kecemasan, Depresi, Hubungan"
                  value={editSpecializations}
                  onChange={(e) => setEditSpecializations(e.target.value)}
                  style={{ height: 42, padding: "0 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Jenis Kelamin</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    style={{ height: 42, padding: "0 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", backgroundColor: "#FFF" }}
                  >
                    <option value="FEMALE">Perempuan</option>
                    <option value="MALE">Laki-laki</option>
                  </select>
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Mode Layanan</label>
                  <select
                    value={editServiceMode}
                    onChange={(e) => setEditServiceMode(e.target.value)}
                    style={{ height: 42, padding: "0 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", backgroundColor: "#FFF" }}
                  >
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="BOTH">Hybrid</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Alamat Klinik / Kota</label>
                <input
                  type="text"
                  required
                  value={editHomeAddress}
                  onChange={(e) => setEditHomeAddress(e.target.value)}
                  style={{ height: 42, padding: "0 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A" }}
                  placeholder="Contoh: Jakarta Selatan atau alamat lengkap"
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  style={{ height: 42, padding: "0 20px", borderRadius: 10, border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", color: "#475569", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ height: 42, padding: "0 24px", borderRadius: 10, border: "none", backgroundColor: "#2563EB", color: "#FFFFFF", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
