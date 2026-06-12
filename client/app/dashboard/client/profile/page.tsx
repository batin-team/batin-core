"use client";

import { useEffect, useState, useRef } from "react";
import { NavBar } from "../../../../components/NavBar";
import { Footer } from "../../../../components/Footer";
import { apiFetch } from "../../../../lib/api";
import { User, Mail, Phone, Camera, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ClientProfilePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiFetch("/api/auth/me");
        if (res) {
          setFullName(res.fullName || "");
          setEmail(res.email || "");
          setPhone(res.phone || "");
          setAvatarUrl(res.avatarUrl || null);
        }
      } catch (e) {
        console.error("Failed to load client profile from API", e);
        // Fallback to localstorage
        const raw = localStorage.getItem("mindbridge_user");
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setFullName(parsed.fullName || "");
            setEmail(parsed.email || "");
            setPhone(parsed.phone || "");
            setAvatarUrl(parsed.avatarUrl || null);
          } catch (err) { }
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. 2MB max for base64)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Ukuran file foto maksimal adalah 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
      setErrorMsg("");
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    setErrorMsg("");

    try {
      const res = await apiFetch("/api/client/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          email,
          phone,
          avatarUrl: avatarUrl || ""
        })
      });

      if (res && res.data) {
        // Sync local storage
        const raw = localStorage.getItem("mindbridge_user");
        if (raw) {
          const userObj = JSON.parse(raw);
          const updatedUser = {
            ...userObj,
            fullName: res.data.fullName,
            email: res.data.email,
            phone: res.data.phone,
            avatarUrl: res.data.avatarUrl
          };
          localStorage.setItem("mindbridge_user", JSON.stringify(updatedUser));
          // Dispatch window event to instantly update NavBar
          window.dispatchEvent(new Event("user-updated"));
        }
        setMessage("Profil Anda berhasil diperbarui!");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menyimpan perubahan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const userInitial = fullName ? fullName[0].toUpperCase() : (email ? email[0].toUpperCase() : "U");

  return (
    <div className="page-shell">
      <NavBar active="sessions" />

      <main className="container section">

        <div style={{ marginBottom: 32 }}>
          <span className="eyebrow" style={{ color: "#2563EB", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontSize: 13, marginBottom: 8, display: "block" }}>
            PENGATURAN AKUN
          </span>
          <h1 style={{ fontSize: 36, color: "#0F172A", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6 }}>
            Profil Saya
          </h1>
          <p style={{ color: "#64748B", fontSize: 16, fontWeight: 500 }}>
            Kelola informasi profil pribadi dan foto profil utama Anda
          </p>
        </div>

        {isLoading ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <h3>Memuat data profil...</h3>
          </div>
        ) : (
          <div className="profile-settings-grid">

            {/* Left Settings Card */}
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 32, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)" }}>

              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                {message && (
                  <div style={{ backgroundColor: "#ECFDF5", border: "1px solid #10B981", color: "#065F46", padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} />
                    {message}
                  </div>
                )}

                {errorMsg && (
                  <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #EF4444", color: "#991B1B", padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertCircle size={16} />
                    {errorMsg}
                  </div>
                )}

                {/* Avatar Uploader Section */}
                <div className="avatar-upload-row">
                  <div style={{ position: "relative", width: 96, height: 96, borderRadius: "50%", overflow: "hidden", backgroundColor: "#F1F5F9", border: "2px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #2563EB, #0d9488)", color: "#FFFFFF", fontSize: 32, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {userInitial}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>Foto Profil</span>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        onClick={handleTriggerUpload}
                        style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                      >
                        <Camera size={14} /> Pilih Foto
                      </button>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "#FFF", color: "#EF4444", border: "1px solid #FCA5A5", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: "#94A3B8" }}>Format JPG/PNG, ukuran file maksimal 2MB.</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                      <User size={15} color="#94A3B8" /> Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Masukkan nama lengkap Anda"
                      style={{ borderRadius: 8, height: 44, padding: "0 14px", border: "1px solid #E2E8F0", fontSize: 14, color: "#1E293B", fontWeight: 500 }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                      <Mail size={15} color="#94A3B8" /> Alamat Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="contoh@domain.com"
                      style={{ borderRadius: 8, height: 44, padding: "0 14px", border: "1px solid #E2E8F0", fontSize: 14, color: "#1E293B", fontWeight: 500 }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                      <Phone size={15} color="#94A3B8" /> Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      style={{ borderRadius: 8, height: 44, padding: "0 14px", border: "1px solid #E2E8F0", fontSize: 14, color: "#1E293B", fontWeight: 500 }}
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    backgroundColor: "#2563EB",
                    color: "#FFFFFF",
                    height: 48,
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 14,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 4px 6px -1px rgba(37,99,235,0.2)",
                    opacity: isSaving ? 0.7 : 1,
                    alignSelf: "flex-start",
                    padding: "0 32px",
                    marginTop: 10
                  }}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>

            </div>

            {/* Right Instructions / Summary Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 24, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)" }}>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginTop: 0, marginBottom: 12 }}>Panduan Akun</h4>
                <ul style={{ paddingLeft: 18, color: "#64748B", fontSize: 13, display: "flex", flexDirection: "column", gap: 12, margin: 0, lineHeight: 1.6 }}>
                  <li><strong>Informasi Personal</strong>: Pastikan nama dan kontak Anda sudah benar agar psikolog dapat menghubungi Anda untuk sesi konseling.</li>
                  <li><strong>Foto Profil</strong>: Mengunggah foto profil asli akan memudahkan verifikasi kehadiran oleh psikolog saat sesi online maupun offline berlangsung.</li>
                  <li><strong>Keamanan Akun</strong>: Gunakan alamat email aktif yang dapat dihubungi untuk menerima notifikasi link meeting, struk pembayaran, dan catatan hasil konseling.</li>
                </ul>
              </div>

            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
