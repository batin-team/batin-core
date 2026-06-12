"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CalendarDays, CheckCircle2, MapPin, Search, Star, UserRound, Video } from "lucide-react";
import {
  calculateDistanceKm,
  formatCurrency,
  formatSlot,
  toSlotKey,
  type Psychologist
} from "@mindbridge/shared";
import { apiFetch } from "../../lib/api";

type BookingMode = "ONLINE" | "OFFLINE";
type GenderPreference = "ANY" | "FEMALE" | "MALE";
type MatchResult = {
  psychologist: Psychologist;
  score: number;
  distanceKm?: number;
  reasons: string[];
};

const times = ["08:00 - 09:00", "10:00 - 11:00", "13:00 - 14:00", "14:30 - 15:30", "16:00 - 17:00"];
const defaultMeetingLocation = {
  label: "Jakarta Selatan",
  lat: -6.2607,
  lng: 106.7816
};

export function BookingFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const [isReady, setIsReady] = useState(false);
  const [mode, setMode] = useState<BookingMode>("ONLINE");
  const [gender, setGender] = useState<GenderPreference>("ANY");
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(["Kecemasan"]);
  const [date, setDate] = useState(params.get("date") ?? "2026-06-05");
  const [time, setTime] = useState(params.get("time") ?? "");
  const [meetingAddress, setMeetingAddress] = useState(defaultMeetingLocation.label);
  const [meetingLat, setMeetingLat] = useState(defaultMeetingLocation.lat);
  const [meetingLng, setMeetingLng] = useState(defaultMeetingLocation.lng);
  const [notes, setNotes] = useState("");
  const urlPsychologistId = params.get("psychologist") ?? params.get("psychologistId") ?? "";
  const [selectedPsychologistId, setSelectedPsychologistId] = useState(urlPsychologistId);
  const [manualMode, setManualMode] = useState(false);

  const [dbPsychologists, setDbPsychologists] = useState<Psychologist[]>([]);
  const [dbSpecializations, setDbSpecializations] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const isPreselected = Boolean(urlPsychologistId);
  const isLocked = isPreselected && !manualMode;

  useEffect(() => {
    const user = localStorage.getItem("mindbridge_user");
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search;
      router.replace(`/login?next=${encodeURIComponent(currentUrl)}`);
      return;
    }
    setIsReady(true);

    async function loadData() {
      try {
        const specRes = await apiFetch("/api/specializations");
        const psychRes = await apiFetch("/api/psychologists");
        const specs = specRes.data || [];
        setDbSpecializations(specs);
        const psychologistsData = psychRes.data || [];
        setDbPsychologists(psychologistsData);

        const urlSpec = params.get("specialty");
        if (urlSpec && specs.includes(urlSpec)) {
          setSelectedSpecializations([urlSpec]);
        }
      } catch (e) {
        console.error("Failed to fetch PostgreSQL records", e);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [router, params]);

  const slotKey = time ? toSlotKey(date, time) : "";

  const matches = useMemo(() => {
    if (!slotKey || dbPsychologists.length === 0) return [];
    return getMatches(
      {
        mode,
        gender,
        slotKey,
        specializations: selectedSpecializations,
        meetingLat,
        meetingLng
      },
      dbPsychologists
    );
  }, [gender, meetingLat, meetingLng, mode, selectedSpecializations, slotKey, dbPsychologists]);

  const autoMatch = matches[0];
  const selectedPsychologist = dbPsychologists.find((p) => p.id === selectedPsychologistId) ?? autoMatch?.psychologist;

  const isSlotAvailable = useMemo(() => {
    if (!slotKey || !selectedPsychologist) return true;
    return selectedPsychologist.availableSlots.includes(slotKey);
  }, [selectedPsychologist, slotKey]);

  const canContinue = Boolean(slotKey && selectedPsychologist && isSlotAvailable);

  const selectedMatch = useMemo(() => {
    if (!selectedPsychologist) return null;
    const existing = matches.find((item) => item.psychologist.id === selectedPsychologist.id);
    if (existing) return existing;
    return {
      psychologist: selectedPsychologist,
      score: 100,
      reasons: ["jadwal terisi/tidak tersedia", "spesialisasi sesuai", "preferensi gender sesuai"],
      distanceKm: calculateDistanceKm(selectedPsychologist.homeLat || 0, selectedPsychologist.homeLng || 0, meetingLat, meetingLng)
    };
  }, [selectedPsychologist, matches, meetingLat, meetingLng]);

  useEffect(() => {
    if (!isLocked && !manualMode && autoMatch) {
      setSelectedPsychologistId(autoMatch.psychologist.id);
    }
  }, [autoMatch, manualMode, isLocked]);

  function toggleSpecialization(item: string) {
    setSelectedSpecializations((current) => {
      if (current.includes(item)) return current.filter((value) => value !== item);
      return [...current, item];
    });
  }

  async function handleContinue() {
    if (!selectedPsychologist || !slotKey) return;
    const distanceKm = calculateDistanceKm(selectedPsychologist.homeLat, selectedPsychologist.homeLng, meetingLat, meetingLng);

    // Get client user info from localStorage
    const rawUser = localStorage.getItem("mindbridge_user");
    let clientId = "";
    if (rawUser) {
      try {
        clientId = JSON.parse(rawUser).id;
      } catch (e) { }
    }

    const [datePart, timePart] = slotKey.split("T");
    const startTimePart = timePart.split(" - ")[0] || "08:00";
    const scheduledAt = `${datePart}T${startTimePart}:00+07:00`;

    try {
      const res = await apiFetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          clientId,
          psychologistId: selectedPsychologist.id,
          sessionType: mode,
          scheduledAt,
          location: mode === "OFFLINE" ? meetingAddress : undefined,
          meetingLat: mode === "OFFLINE" ? meetingLat : undefined,
          meetingLng: mode === "OFFLINE" ? meetingLng : undefined,
          selectedSpecializations,
          notes
        })
      });

      // Save pending booking summary to localStorage for the payment page snap token rendering
      localStorage.setItem("mindbridge_pending_booking", JSON.stringify({
        ...res.data,
        clientName: getClientName(),
        psychologistId: selectedPsychologist.id,
        sessionType: mode,
        scheduledAt,
        slotKey, // Save the actual slotKey (with range string) for display
        amount: selectedPsychologist.pricePerSession + 35000,
        location: mode === "OFFLINE" ? meetingAddress : undefined,
        assignmentMethod: manualMode ? "SELF_SELECT" : "AUTO_ASSIGN",
        distanceKm: mode === "OFFLINE" ? Number(distanceKm.toFixed(1)) : undefined
      }));
      router.push("/payment");
      router.refresh();
    } catch (e: any) {
      alert("Gagal membuat sesi booking: " + e.message);
    }
  }

  if (!isReady || isLoadingData) {
    return (
      <section className="panel">
        <p>Memuat formulir pendaftaran konseling...</p>
      </section>
    );
  }

  return (
    <>
      <div className="section-heading" style={{ marginBottom: 40 }}>
        <span className="eyebrow" style={{ color: "#059669", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontSize: 13, marginBottom: 8, display: "block" }}>Booking Konseling</span>
        <h1 style={{ fontSize: 36, color: "#0F172A", fontWeight: 800, letterSpacing: "-0.5px" }}>Pesan online atau offline consulting</h1>
        <p style={{ color: "#64748B", fontSize: 16, marginTop: 8 }}>Auto assign berjalan setelah Anda memilih tanggal dan jam. Jika kurang cocok, gunakan opsi cari dan pilih psikolog sendiri.</p>
      </div>

      <section className="booking-grid">

        {/* LEFT PANEL: FORM */}
        <form style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 32, border: "1px solid #E2E8F0", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", display: "flex", flexDirection: "column", gap: 24 }} onSubmit={(event) => event.preventDefault()}>

          <div style={{ display: "flex", backgroundColor: "#F1F5F9", borderRadius: 12, padding: 6 }}>
            <button
              type="button"
              onClick={() => setMode("ONLINE")}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", backgroundColor: mode === "ONLINE" ? "#FFFFFF" : "transparent", color: mode === "ONLINE" ? "#0F172A" : "#64748B", boxShadow: mode === "ONLINE" ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}
            >
              <Video size={18} /> Online
            </button>
            <button
              type="button"
              onClick={() => setMode("OFFLINE")}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", backgroundColor: mode === "OFFLINE" ? "#FFFFFF" : "transparent", color: mode === "OFFLINE" ? "#0F172A" : "#64748B", boxShadow: mode === "OFFLINE" ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}
            >
              <MapPin size={18} /> Offline
            </button>
          </div>

          <div className="booking-form-row">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label htmlFor="gender" style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>Preferensi gender psikolog</label>
              <select id="gender" value={gender} onChange={(event) => setGender(event.target.value as GenderPreference)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #CBD5E1", backgroundColor: "#F8FAFC", fontSize: 14, color: "#0F172A", outline: "none", cursor: "pointer" }}>
                <option value="ANY">Tidak ada preferensi</option>
                <option value="FEMALE">Perempuan</option>
                <option value="MALE">Laki-laki</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label htmlFor="date" style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>Tanggal sesi</label>
              <input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #CBD5E1", backgroundColor: "#F8FAFC", fontSize: 14, color: "#0F172A", outline: "none", cursor: "pointer" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>Keahlian yang dibutuhkan</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {dbSpecializations.map((item) => {
                const isSelected = selectedSpecializations.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleSpecialization(item)}
                    type="button"
                    style={{ padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: isSelected ? "1px solid #10B981" : "1px solid #E2E8F0", backgroundColor: isSelected ? "#D1FAE5" : "#F8FAFC", color: isSelected ? "#059669" : "#64748B", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>Jam tersedia</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 10 }}>
              {times.map((item) => {
                const available = dbPsychologists.some((psychologist) => isCandidate(psychologist, mode, gender, toSlotKey(date, item), selectedSpecializations));
                const isSelected = time === item;
                return (
                  <button
                    key={item}
                    disabled={!available}
                    onClick={() => {
                      setTime(item);
                      setManualMode(false);
                    }}
                    type="button"
                    style={{ padding: "10px 0", borderRadius: 10, fontSize: 14, fontWeight: 600, border: isSelected ? "1px solid #10B981" : "1px solid #E2E8F0", backgroundColor: isSelected ? "#D1FAE5" : available ? "#F8FAFC" : "#F1F5F9", color: isSelected ? "#059669" : available ? "#475569" : "#CBD5E1", cursor: available ? "pointer" : "not-allowed", transition: "all 0.2s" }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {mode === "OFFLINE" && (
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 18, color: "#0F172A", fontWeight: 700, marginBottom: 4 }}>Lokasi Pertemuan</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label htmlFor="meetingAddress" style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Alamat / Area</label>
                <input id="meetingAddress" value={meetingAddress} onChange={(event) => setMeetingAddress(event.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", fontSize: 14, outline: "none" }} />
              </div>
              <div className="booking-form-row" style={{ gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label htmlFor="lat" style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Latitude</label>
                  <input id="lat" type="number" step="0.0001" value={meetingLat} onChange={(event) => setMeetingLat(Number(event.target.value))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", fontSize: 14, outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label htmlFor="lng" style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Longitude</label>
                  <input id="lng" type="number" step="0.0001" value={meetingLng} onChange={(event) => setMeetingLng(Number(event.target.value))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", fontSize: 14, outline: "none" }} />
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#64748B", fontStyle: "italic" }}>Untuk prototype, jarak dihitung dari koordinat psikolog ke koordinat meeting.</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label htmlFor="notes" style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>Keluhan awal</label>
            <textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ceritakan singkat kebutuhan konseling Anda..." style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #CBD5E1", backgroundColor: "#F8FAFC", fontSize: 14, color: "#0F172A", outline: "none", minHeight: 100, resize: "vertical" }} />
          </div>
        </form>

        {/* RIGHT PANEL: SIDEBAR */}
        <aside style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 32, border: "1px solid #E2E8F0", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", display: "flex", flexDirection: "column", gap: 24 }}>
          {!slotKey && !selectedPsychologist && (
            <div style={{ textAlign: "center", padding: "64px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ backgroundColor: "#F0F9FF", width: 64, height: 64, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0369A1" }}>
                <CalendarDays size={32} />
              </div>
              <h3 style={{ fontSize: 22, color: "#0F172A", fontWeight: 700 }}>Pilih tanggal dan jam</h3>
              <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.5 }}>Auto assign akan muncul otomatis setelah slot dipilih.</p>
            </div>
          )}

          {slotKey && !selectedPsychologist && (
            <div style={{ textAlign: "center", padding: "64px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ backgroundColor: "#FEF2F2", width: 64, height: 64, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#B91C1C" }}>
                <AlertCircle size={32} />
              </div>
              <h3 style={{ fontSize: 22, color: "#0F172A", fontWeight: 700 }}>Belum ada psikolog cocok</h3>
              <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.5 }}>Coba ubah gender, bidang, tanggal, atau jam sesi.</p>
            </div>
          )}

          {selectedPsychologist && !manualMode && (
            <>
              <div style={{ 
                alignSelf: "flex-start", 
                backgroundColor: !slotKey ? "#EFF6FF" : (isSlotAvailable ? "#D1FAE5" : "#FEE2E2"), 
                color: !slotKey ? "#1D4ED8" : (isSlotAvailable ? "#059669" : "#EF4444"), 
                padding: "6px 12px", 
                borderRadius: 8, 
                fontSize: 13, 
                fontWeight: 700, 
                display: "flex", 
                alignItems: "center", 
                gap: 6 
              }}>
                {!slotKey ? <CheckCircle2 size={16} /> : (isSlotAvailable ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />)} 
                {isLocked ? "Psikolog Pilihan Anda" : "Auto Assign Terbaik"}
              </div>
              <div style={{ border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden" }}>
                <PsychologistMatchCard match={selectedMatch || autoMatch} mode={mode} slotKey={slotKey} />
              </div>

              {/* Warning Banner for pre-selected psychologist slot occupied */}
              {slotKey && !isSlotAvailable && (
                <div style={{ 
                  backgroundColor: "#FEF2F2", 
                  border: "1px solid #FCA5A5", 
                  borderRadius: 12, 
                  padding: 16, 
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: 12, 
                  color: "#991B1B",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.5
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ display: "block", marginBottom: 2 }}>Jadwal Tidak Tersedia</strong>
                    <span style={{ fontSize: 13, color: "#7F1D1D" }}>
                      Jadwal ini tidak tersedia atau sudah terisi untuk {selectedPsychologist.name}. Silakan pilih tanggal atau jam lainnya.
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                <button 
                  type="button" 
                  disabled={!canContinue} 
                  onClick={handleContinue} 
                  style={{ 
                    width: "100%", 
                    padding: "14px", 
                    backgroundColor: canContinue ? "#2563EB" : "#CBD5E1", 
                    color: "#FFFFFF", 
                    borderRadius: 10, 
                    fontWeight: 700, 
                    fontSize: 15, 
                    border: "none", 
                    cursor: canContinue ? "pointer" : "not-allowed", 
                    transition: "background 0.2s" 
                  }}
                >
                  {!slotKey ? "Pilih Tanggal & Jam" : (isSlotAvailable ? "Setuju & Lanjut Bayar" : "Jadwal Terisi / Tidak Tersedia")}
                </button>
                <button 
                  type="button" 
                  onClick={() => setManualMode(true)} 
                  style={{ 
                    width: "100%", 
                    padding: "14px", 
                    backgroundColor: "#FFFFFF", 
                    color: "#475569", 
                    border: "1px solid #CBD5E1", 
                    borderRadius: 10, 
                    fontWeight: 700, 
                    fontSize: 15, 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: 8, 
                    transition: "background 0.2s" 
                  }}
                >
                  <Search size={18} /> Cari Psikolog Lain
                </button>
              </div>
            </>
          )}

          {manualMode && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 20, color: "#0F172A", fontWeight: 700 }}>Pilih psikolog sendiri</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 400, overflowY: "auto", paddingRight: 8 }}>
                {matches.map((match) => {
                  const isSelected = selectedPsychologistId === match.psychologist.id;
                  return (
                    <button
                      key={match.psychologist.id}
                      onClick={() => setSelectedPsychologistId(match.psychologist.id)}
                      type="button"
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderRadius: 12, border: isSelected ? "2px solid #2563EB" : "1px solid #E2E8F0", backgroundColor: isSelected ? "#F0F7FF" : "#FFFFFF", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
                    >
                      <div>
                        <strong style={{ display: "block", fontSize: 15, color: "#0F172A", marginBottom: 4 }}>{match.psychologist.name}</strong>
                        <p style={{ fontSize: 12, color: "#64748B" }}>{match.reasons.join(" • ")}</p>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{formatCurrency(match.psychologist.pricePerSession)}</span>
                    </button>
                  );
                })}
              </div>
              <button type="button" disabled={!canContinue} onClick={handleContinue} style={{ width: "100%", padding: "14px", backgroundColor: canContinue ? "#2563EB" : "#CBD5E1", color: "#FFFFFF", borderRadius: 10, fontWeight: 700, fontSize: 15, border: "none", cursor: canContinue ? "pointer" : "not-allowed", marginTop: 8 }}>
                Lanjut dengan Pilihan Ini
              </button>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}

function PsychologistMatchCard({ match, mode, slotKey }: { match: MatchResult; mode: BookingMode; slotKey: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 20, borderBottom: "1px solid #E2E8F0", display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "12px", overflow: "hidden", backgroundColor: "#F1F5F9" }}>
          <img src={match.psychologist.avatarUrl} alt={match.psychologist.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{match.psychologist.name}</h3>
          <p style={{ fontSize: 14, color: "#64748B" }}>{match.psychologist.title}</p>
        </div>
      </div>
      <div style={{ padding: 20, backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#475569", fontWeight: 500 }}>
          <CalendarDays size={18} color="#94A3B8" /> {slotKey ? formatSlot(slotKey) : "Silakan pilih tanggal & jam"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#475569", fontWeight: 500 }}>
          <UserRound size={18} color="#94A3B8" /> {match.psychologist.gender === "FEMALE" ? "Perempuan" : "Laki-laki"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#475569", fontWeight: 500 }}>
          <Star size={18} fill="#F59E0B" color="#F59E0B" /> Rating {match.psychologist.rating}
        </div>
        {mode === "OFFLINE" && typeof match.distanceKm === "number" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#475569", fontWeight: 500 }}>
            <MapPin size={18} color="#94A3B8" /> {match.distanceKm.toFixed(1)} km dari lokasi Anda
          </div>
        )}
      </div>
      <div style={{ padding: 20, display: "flex", flexWrap: "wrap", gap: 8, borderBottom: "1px solid #E2E8F0" }}>
        {match.psychologist.specializations.map((item) => (
          <span key={item} style={{ padding: "4px 10px", backgroundColor: "#F1F5F9", color: "#475569", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
            {item}
          </span>
        ))}
      </div>
      <div style={{ padding: 20, backgroundColor: "#F8FAFC" }}>
        <p style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>{match.reasons.join(" • ")}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "#475569", fontWeight: 600 }}>Total Pembayaran</span>
          <h3 style={{ fontSize: 20, color: "#0F172A", fontWeight: 800 }}>{formatCurrency(match.psychologist.pricePerSession + 35000)}</h3>
        </div>
      </div>
    </div>
  );
}

function getMatches(
  input: {
    mode: BookingMode;
    gender: GenderPreference;
    slotKey: string;
    specializations: string[];
    meetingLat: number;
    meetingLng: number;
  },
  psychologistsList: Psychologist[]
): MatchResult[] {
  return psychologistsList
    .filter((psychologist) => isCandidate(psychologist, input.mode, input.gender, input.slotKey, input.specializations))
    .map((psychologist) => {
      const matchedSkills = input.specializations.filter((skill) => psychologist.specializations.includes(skill)).length;
      const distanceKm = calculateDistanceKm(psychologist.homeLat, psychologist.homeLng, input.meetingLat, input.meetingLng);
      const onlineScore = (input.gender === "ANY" ? 8 : 14) + matchedSkills * 22 + psychologist.rating * 10;
      const offlineScore = onlineScore - distanceKm * 1.8;
      return {
        psychologist,
        distanceKm,
        score: input.mode === "OFFLINE" ? offlineScore : onlineScore,
        reasons: [
          "jadwal tersedia",
          `${matchedSkills} keahlian cocok`,
          input.gender === "ANY" ? "tanpa preferensi gender" : "gender sesuai",
          input.mode === "OFFLINE" ? `jarak ${distanceKm.toFixed(1)} km` : `rating ${psychologist.rating}`
        ]
      };
    })
    .filter((match) => input.mode === "ONLINE" || match.distanceKm <= 80)
    .sort((a, b) => {
      if (input.mode === "OFFLINE") return a.distanceKm - b.distanceKm || b.score - a.score;
      return b.score - a.score;
    });
}

function isCandidate(psychologist: Psychologist, mode: BookingMode, gender: GenderPreference, slotKey: string, specializationsInput: string[]) {
  const supportsMode = psychologist.serviceMode === "BOTH" || psychologist.serviceMode === mode;
  const genderMatches = gender === "ANY" || psychologist.gender === gender;
  const slotMatches = psychologist.availableSlots.includes(slotKey);
  const skillMatches = specializationsInput.length === 0 || skillTransitions(psychologist.specializations, specializationsInput);
  return supportsMode && genderMatches && slotMatches && skillMatches;
}

function skillTransitions(psychologistSpecs: string[], specializationsInput: string[]): boolean {
  return specializationsInput.some((skill) => psychologistSpecs.includes(skill));
}

function getClientName() {
  const raw = localStorage.getItem("mindbridge_user");
  if (!raw) return "Client Batin";
  try {
    const user = JSON.parse(raw) as { fullName?: string; email?: string };
    return user.fullName ?? user.email ?? "Client Batin";
  } catch {
    return "Client Batin";
  }
}
