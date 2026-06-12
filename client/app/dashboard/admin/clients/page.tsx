"use client";

import { useEffect, useState } from "react";
import { Users, Search, Calendar, TrendingUp, Phone, Mail, ToggleLeft, ToggleRight, Edit2, CheckCircle, X } from "lucide-react";
import { AdminLayout } from "../../../../components/AdminLayout";
import { apiFetch } from "../../../../lib/api";
import { formatCurrency } from "@mindbridge/shared";

type Client = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  totalSessions: number;
  totalSpent: number;
  lastSession: string | null;
  createdAt: string;
};

export default function AdminClientsPage() {
  const [list, setList] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "sessions" | "spent" | "joined">("joined");
  const [toastMsg, setToastMsg] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await apiFetch(`/api/admin/users/${id}/toggle-active`, { method: "PATCH" });
      setList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: res.data.isActive } : c))
      );
      showToast(`Status client berhasil diubah.`);
    } catch (e) {
      console.error(e);
      showToast("Gagal mengubah status.");
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setEditName(client.name);
    setEditEmail(client.email);
    setEditPhone(client.phone || "");
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      await apiFetch(`/api/admin/users/${editingClient.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone
        })
      });
      setList((prev) =>
        prev.map((c) =>
          c.id === editingClient.id
            ? { ...c, name: editName, email: editEmail, phone: editPhone }
            : c
        )
      );
      setIsEditOpen(false);
      showToast("Data client berhasil diperbarui.");
    } catch (err) {
      console.error(err);
      showToast("Gagal memperbarui data.");
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/api/admin/clients");
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
    let result = [...list];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortBy === "sessions") return b.totalSessions - a.totalSessions;
      if (sortBy === "spent") return b.totalSpent - a.totalSpent;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setFiltered(result);
  }, [search, sortBy, list]);

  const totalRevenue = list.reduce((s, c) => s + c.totalSpent, 0);
  const totalSessions = list.reduce((s, c) => s + c.totalSessions, 0);
  const activeClients = list.filter((c) => c.totalSessions > 0).length;

  return (
    <AdminLayout activeTab="clients">
      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", top: 24, right: 32, zIndex: 999, backgroundColor: "#0F172A", color: "#FFFFFF", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle size={16} style={{ color: "#4ADE80" }} />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Manajemen</p>
        <h1 style={{ fontSize: 34, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>Kelola Pasien</h1>
        <p style={{ color: "#64748B", fontSize: 14, fontWeight: 500, marginTop: 6 }}>
          {list.length} client terdaftar
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Client", value: list.length, icon: Users, bg: "#EFF6FF", color: "#2563EB" },
          { label: "Client Aktif", value: activeClients, icon: TrendingUp, bg: "#F0FDF4", color: "#16A34A" },
          { label: "Total Sesi", value: totalSessions, icon: Calendar, bg: "#FFF7ED", color: "#EA580C" },
          { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, bg: "#FFF1F2", color: "#E11D48" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: "20px 22px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", marginTop: 2 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 400 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            style={{ width: "100%", height: 40, paddingLeft: 36, paddingRight: 12, borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ height: 40, padding: "0 12px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13, color: "#0F172A", backgroundColor: "#FFFFFF", cursor: "pointer" }}
          >
            <option value="joined">Terbaru Bergabung</option>
            <option value="sessions">Sesi Terbanyak</option>
            <option value="spent">Pengeluaran Tertinggi</option>
            <option value="name">Nama A–Z</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 60, textAlign: "center", color: "#94A3B8", border: "1px solid #E2E8F0" }}>
          Memuat data client...
        </div>
      ) : (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC" }}>
                  {["Pasien", "Kontak", "Bergabung", "Sesi", "Total Sesi Terakhir", "Pengeluaran", "Status", "Aksi"].map((h) => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>Tidak ada client ditemukan.</td></tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* Pasien */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "#F0FDF4", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14, color: "#16A34A", flexShrink: 0, overflow: "hidden" }}>
                            {c.avatarUrl ? (
                              <img src={c.avatarUrl} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              c.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>{c.id.slice(0, 12)}...</div>
                          </div>
                        </div>
                      </td>

                      {/* Kontak */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#475569" }}>
                            <Mail size={12} style={{ color: "#94A3B8" }} />
                            {c.email}
                          </div>
                          {c.phone && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#475569" }}>
                              <Phone size={12} style={{ color: "#94A3B8" }} />
                              {c.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Bergabung */}
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "#64748B" }}>
                        {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>

                      {/* Total Sesi */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: c.totalSessions > 0 ? "#0F172A" : "#CBD5E1" }}>{c.totalSessions}</span>
                          <span style={{ fontSize: 12, color: "#94A3B8" }}>sesi</span>
                        </div>
                      </td>

                      {/* Sesi Terakhir */}
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "#64748B" }}>
                        {c.lastSession
                          ? new Date(c.lastSession).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                          : <span style={{ color: "#CBD5E1" }}>—</span>
                        }
                      </td>

                      {/* Pengeluaran */}
                      <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 700, color: c.totalSpent > 0 ? "#0F172A" : "#CBD5E1" }}>
                        {c.totalSpent > 0 ? formatCurrency(c.totalSpent) : "—"}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 20px" }}>
                        <button
                          onClick={() => handleToggleActive(c.id)}
                          title={c.isActive ? "Nonaktifkan" : "Aktifkan"}
                          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0 }}
                        >
                          {c.isActive ? (
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

                      {/* Aksi */}
                      <td style={{ padding: "16px 20px" }}>
                        <button
                          onClick={() => openEditModal(c)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, backgroundColor: "#E2E8F0", color: "#475569", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#CBD5E1"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#E2E8F0"; }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
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
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: 20, width: "100%", maxWidth: 480, padding: 32, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0", position: "relative" }}>
            <button
              onClick={() => setIsEditOpen(false)}
              style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "grid", placeItems: "center", padding: 4 }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 8px 0" }}>Edit Profil Pasien</h3>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 24px 0", fontWeight: 500 }}>Perbarui informasi dasar akun pasien.</p>

            <form onSubmit={handleEditSubmit} style={{ display: "grid", gap: 20 }}>
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
