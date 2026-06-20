"use client";

import { useEffect, useState } from "react";
import { PsychologistLayout } from "../../../../components/PsychologistLayout";
import { apiFetch } from "../../../../lib/api";
import { User, DollarSign, Award, MapPin, RefreshCw, CheckCircle2 } from "lucide-react";

export default function PsychologistProfileSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [gender, setGender] = useState("FEMALE");
  const [serviceMode, setServiceMode] = useState("ONLINE");
  const [homeAddress, setHomeAddress] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState(350000);
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [allSpecializations, setAllSpecializations] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, specRes] = await Promise.all([
          apiFetch("/api/psychologist/profile"),
          apiFetch("/api/specializations")
        ]);
        if (profileRes && profileRes.data) {
          const d = profileRes.data;
          setProfile(d);
          setFullName(d.name || "");
          setAvatarUrl(d.avatarUrl || null);
          setGender(d.gender || "FEMALE");
          setServiceMode(d.serviceMode || "ONLINE");
          setHomeAddress(d.homeAddress || "");
          setLicenseNumber(d.licenseNumber || "");
          setExperienceYears(d.experienceYears || 0);
          setBio(d.bio || "");
          setPrice(d.pricePerSession || 350000);
          setBankName(d.bankName || "");
          setBankAccountNumber(d.bankAccountNumber || "");
          setBankAccountHolder(d.bankAccountHolder || "");
          setSelectedSpecs(d.specializations || []);
        }
        if (specRes && specRes.data) {
          setAllSpecializations(specRes.data);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    setErrorMsg("");
    try {
      await apiFetch("/api/psychologist/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          avatarUrl: avatarUrl || "",
          gender,
          serviceMode,
          homeAddress,
          licenseNumber,
          experienceYears: Number(experienceYears),
          bio,
          pricePerSession: Number(price),
          bankName,
          bankAccountNumber,
          bankAccountHolder,
          specializations: selectedSpecs
        })
      });
      setMessage("Profil berhasil diperbarui dan disimpan ke database!");
      
      // Update local profile state
      setProfile((prev: any) => ({
        ...prev,
        name: fullName,
        avatarUrl,
        gender,
        serviceMode,
        homeAddress,
        licenseNumber,
        experienceYears,
        bio,
        pricePerSession: price,
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        specializations: selectedSpecs
      }));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menyimpan perubahan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PsychologistLayout activeTab="profile">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
          Pengaturan Profil Saya
        </h1>
        <p style={{ color: "#64748B", fontSize: 15, fontWeight: 500 }}>
          Kelola informasi profil profesional dan tarif sesi layanan Anda
        </p>
      </div>

      <div className="profile-settings-grid">
        
        {/* Profile Edit Card */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          {isLoading ? (
            <p style={{ color: "#64748B", fontSize: 15 }}>Memuat data profil...</p>
          ) : !profile ? (
            <p style={{ color: "#EF4444", fontSize: 15, fontWeight: 600 }}>Profil psikolog tidak ditemukan.</p>
          ) : (
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {message && (
                <div style={{ backgroundColor: "#ECFDF5", border: "1px solid #10B981", color: "#065F46", padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={16} />
                  {message}
                </div>
              )}

              {errorMsg && (
                <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #EF4444", color: "#991B1B", padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700 }}>
                  {errorMsg}
                </div>
              )}

              {/* Avatar Section */}
              <div style={{ display: "flex", alignItems: "center", gap: 24, borderBottom: "1px solid #E2E8F0", paddingBottom: 24 }}>
                <div style={{ position: "relative", width: 80, height: 80, borderRadius: 16, overflow: "hidden", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #2563EB, #0d9488)", color: "#FFFFFF", fontSize: 32, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {fullName ? fullName.charAt(0).toUpperCase() : "P"}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Foto Profil Resmi</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => document.getElementById("psychologist-avatar-input")?.click()}
                      style={{ backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      Pilih Foto Baru
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(null)}
                        style={{ backgroundColor: "#FFF", color: "#EF4444", border: "1px solid #FCA5A5", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                  <input
                    id="psychologist-avatar-input"
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
                        setAvatarUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>File JPG/PNG maks. 2MB</span>
                </div>
              </div>

              {/* Form Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{ borderRadius: 8, height: 42, padding: "0 12px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", fontWeight: 500 }} 
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>ID / Nomor Lisensi</label>
                  <input 
                    type="text" 
                    value={licenseNumber} 
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                    style={{ borderRadius: 8, height: 42, padding: "0 12px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", fontWeight: 500 }} 
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ borderRadius: 8, height: 42, padding: "0 12px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", backgroundColor: "#FFF", fontWeight: 500 }}
                  >
                    <option value="FEMALE">Perempuan</option>
                    <option value="MALE">Laki-laki</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Pengalaman Praktek (Tahun)</label>
                  <input 
                    type="number" 
                    min={0}
                    value={experienceYears} 
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    required
                    style={{ borderRadius: 8, height: 42, padding: "0 12px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", fontWeight: 500 }} 
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Mode Layanan</label>
                  <select
                    value={serviceMode}
                    onChange={(e) => setServiceMode(e.target.value)}
                    style={{ borderRadius: 8, height: 42, padding: "0 12px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", backgroundColor: "#FFF", fontWeight: 500 }}
                  >
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="BOTH">Hybrid</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Tarif per Sesi (IDR)</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 14, fontWeight: 600 }}>Rp</div>
                    <input 
                      type="number" 
                      value={price} 
                      onChange={(e) => setPrice(Number(e.target.value))} 
                      required
                      style={{ borderRadius: 8, height: 42, padding: "0 12px 0 36px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", width: "100%", fontWeight: 600 }} 
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Alamat Klinik / Kota</label>
                  <input 
                    type="text" 
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    required
                    placeholder="Contoh: Jakarta Selatan atau alamat lengkap praktek offline Anda"
                    style={{ borderRadius: 8, height: 42, padding: "0 12px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", fontWeight: 500 }} 
                  />
                </div>

                {/* Specializations Checkboxes */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Spesialisasi Masalah</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, border: "1px solid #E2E8F0", borderRadius: 8, padding: 16, backgroundColor: "#F8FAFC" }}>
                    {allSpecializations.map((spec) => {
                      const isChecked = selectedSpecs.includes(spec);
                      return (
                        <label key={spec} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedSpecs(selectedSpecs.filter((s) => s !== spec));
                              } else {
                                setSelectedSpecs([...selectedSpecs, spec]);
                              }
                            }}
                            style={{ width: 16, height: 16, cursor: "pointer" }}
                          />
                          {spec}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Bank Account Section (for withdrawals) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, gridColumn: "1 / -1", borderTop: "1px solid #E2E8F0", paddingTop: 24 }}>
                  <label style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Rekening Bank untuk Pencairan</label>
                  <span style={{ fontSize: 12, color: "#94A3B8", marginTop: -4 }}>Data ini wajib diisi sebelum Anda dapat mencairkan saldo komisi.</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Nama Bank</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Contoh: BCA, Mandiri, BNI"
                    style={{ borderRadius: 8, height: 42, padding: "0 12px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", fontWeight: 500 }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Nomor Rekening</label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Contoh: 1234567890"
                    style={{ borderRadius: 8, height: 42, padding: "0 12px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", fontWeight: 500 }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    value={bankAccountHolder}
                    onChange={(e) => setBankAccountHolder(e.target.value)}
                    placeholder="Sesuai buku tabungan"
                    style={{ borderRadius: 8, height: 42, padding: "0 12px", border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", fontWeight: 500 }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Bio Profesional & Pengalaman</label>
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    required
                    style={{ borderRadius: 8, minHeight: 120, padding: 12, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", resize: "vertical", lineHeight: 1.5 }} 
                  />
                </div>

              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                style={{ 
                  backgroundColor: "#2563EB", 
                  color: "#FFFFFF", 
                  height: 46, 
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
                  padding: "0 24px"
                }}
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          )}
        </div>

        {/* Right Info Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Professional Badge Card */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#EFF6FF", color: "#2563EB", display: "grid", placeItems: "center" }}>
                <Award size={20} />
              </div>
              <div>
                <strong style={{ display: "block", fontSize: 15, color: "#0F172A" }}>Psikolog Terverifikasi</strong>
                <span style={{ fontSize: 12, color: "#64748B" }}>Status Keanggotaan Aktif</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#EFF6FF", color: "#2563EB", display: "grid", placeItems: "center" }}>
                <MapPin size={20} />
              </div>
              <div>
                <strong style={{ display: "block", fontSize: 15, color: "#0F172A" }}>Kota Klinik</strong>
                <span style={{ fontSize: 12, color: "#64748B" }}>{profile?.homeAddress || "Jakarta Selatan"}</span>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginTop: 0, marginBottom: 12 }}>Panduan Profil</h4>
            <ul style={{ paddingLeft: 18, color: "#64748B", fontSize: 13, display: "flex", flexDirection: "column", gap: 10, margin: 0, lineHeight: 1.5 }}>
              <li><strong>Foto Profil Resmi</strong>: Unggah foto profil yang jelas dengan senyuman ramah dan pencahayaan baik.</li>
              <li><strong>Bio Profesional</strong>: Ceritakan keahlian klinis Anda secara singkat dan ramah agar membangun kepercayaan client.</li>
              <li><strong>Tarif Konseling</strong>: Tarif ini akan ditampilkan langsung di platform client saat pemesanan sesi konseling.</li>
              <li><strong>Lisensi & Spesialisasi</strong>: Pastikan lisensi dan spesialisasi Anda sesuai dengan kompetensi terdaftar.</li>
            </ul>
          </div>

        </div>

      </div>
    </PsychologistLayout>
  );
}
