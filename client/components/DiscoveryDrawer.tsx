"use client";

import { useEffect, useRef, useState } from "react";
import { X, ShieldAlert, CheckCircle, ArrowRight, HeartPulse, RefreshCw } from "lucide-react";
import { useStateMachine, AssessmentState, assessmentTransitions } from "../hooks/useStateMachine";
import { useSanitizedState } from "../hooks/useSanitizedState";
import { apiFetch } from "../lib/api";

type DiscoveryDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

type CrisisResource = {
  id: string;
  name: string;
  contactInfo: string;
  location: string | null;
};

// ── Batin light-mode palette — calm, welcoming, clinical ─────────────────────
const C = {
  bg: "#FFFFFF",
  bgLeft: "#F8F7FF",           // very soft lavender-white
  bgCard: "#F1F0FB",           // gentle card tint
  bgCardSelected: "rgba(99,102,241,0.08)",
  topBar: "#FFFFFF",
  border: "#E4E2F7",
  accent: "#6366F1",           // keep brand indigo
  accentDim: "rgba(99,102,241,0.15)",
  accentLight: "#7C7FE9",
  textPrimary: "#1E1B3A",     // deep navy-ink, easy to read
  textMuted: "#A09EC0",       // muted lavender-grey
  textBody: "#5C5A7A",        // comfortable mid-tone
  red: "#DC2626",
  green: "#059669",
};

export function DiscoveryDrawer({ isOpen, onClose }: DiscoveryDrawerProps) {
  const [assessmentState, transitionAssessment] = useStateMachine(
    AssessmentState.IDLE,
    assessmentTransitions
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [responses, setResponses, sanitizeResponses] = useSanitizedState<Record<string, number>>({});
  const [assessmentResult, setAssessmentResult, sanitizeResult] = useSanitizedState<any>(null);
  const [crisisResources, setCrisisResources, sanitizeCrisis] = useSanitizedState<CrisisResource[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const [bookingMode, setBookingMode] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlMode = searchParams.get("mode");
      if (urlMode) {
        setBookingMode(urlMode);
      }
    }
  }, [isOpen]);

  const questions = [
    {
      id: "q1",
      label: "Kecemasan",
      text: "Seberapa sering kecemasan mengganggu Anda?",
      detail: "Seberapa sering Anda merasa cemas, gelisah, atau khawatir berlebihan dalam 2 minggu terakhir?",
    },
    {
      id: "q2",
      label: "Depresi",
      text: "Bagaimana kondisi suasana hati Anda?",
      detail: "Seberapa sering Anda merasa sedih, murung, putus asa, atau kehilangan minat pada hobi?",
    },
    {
      id: "q3",
      label: "Burnout",
      text: "Apakah Anda merasakan kelelahan emosional?",
      detail: "Seberapa sering Anda merasa lelah secara emosional dan fisik akibat tekanan rutinitas?",
    },
    {
      id: "q4",
      label: "Trauma",
      text: "Adakah trauma masa lalu yang masih berdampak?",
      detail: "Apakah trauma masa lalu masih mengganggu aktivitas sehari-hari Anda akhir-akhir ini?",
    },
  ];

  const optionTitles = ["Tidak Pernah", "Jarang", "Kadang-Kadang", "Sering", "Sangat Sering"];
  const optionDescriptions = [
    "Tidak pernah merasakan keluhan ini sama sekali.",
    "Jarang sekali dirasakan dalam situasi tertentu saja.",
    "Kadang-kadang dirasakan beberapa kali dalam seminggu.",
    "Sering dirasakan hampir setiap hari dalam beraktivitas.",
    "Sangat sering hingga mengganggu produktivitas harian.",
  ];

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const el = drawerRef.current.querySelector<HTMLElement>("button, [tabindex='0']");
      el?.focus();
    }
  }, [isOpen, assessmentState, currentQuestionIndex]);

  function handleClose() {
    sanitizeResponses();
    sanitizeResult();
    sanitizeCrisis();
    setCurrentQuestionIndex(0);
    transitionAssessment(AssessmentState.IDLE);
    onClose();
  }

  function handleSelectAnswer(questionId: string, score: number) {
    setResponses(prev => ({ ...prev, [questionId]: score }));
  }

  async function handleSubmit() {
    setIsLoading(true);
    transitionAssessment(AssessmentState.SCORING);

    const userStr = localStorage.getItem("mindbridge_user");
    let clientId = "";
    if (userStr) {
      try { clientId = JSON.parse(userStr).id; } catch (e) { console.error(e); }
    }

    if (!clientId) {
      alert("Silakan masuk terlebih dahulu untuk melakukan asesmen.");
      setIsLoading(false);
      transitionAssessment(AssessmentState.QUESTIONNAIRE);
      return;
    }

    try {
      const res = await apiFetch("/api/assessments", {
        method: "POST",
        body: JSON.stringify({ clientId, category: "Mental Health Triage", responses }),
      });
      setAssessmentResult(res.data);
      setCrisisResources(res.crisisResources || []);
      transitionAssessment(AssessmentState.RESULT);
    } catch (e: any) {
      console.error(e);
      alert("Gagal mengirimkan asesmen: " + e.message);
      transitionAssessment(AssessmentState.QUESTIONNAIRE);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  const isIdle = assessmentState === AssessmentState.IDLE;
  const isQuestionnaire = assessmentState === AssessmentState.QUESTIONNAIRE;
  const isScoring = assessmentState === AssessmentState.SCORING;
  const isResult = assessmentState === AssessmentState.RESULT;

  const currentAnswer = isQuestionnaire ? responses[questions[currentQuestionIndex]?.id] : undefined;

  const steps = [
    { label: "Profil Asesmen", active: isIdle || isQuestionnaire },
    { label: "Analisis Klinis", active: isScoring },
    { label: "Rekomendasi Medis", active: isResult },
  ];

  return (
    <div
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Asesmen Triage Kesehatan Mental"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: C.bg,
        color: C.textPrimary,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        #batin-assess * { box-sizing: border-box; }

        .ba-option { cursor: pointer; user-select: none; outline-style: solid; outline-width: 2px; outline-color: transparent; transition: outline-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.15s; }
        .ba-option:hover { outline-color: ${C.accent} !important; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.10); }
        .ba-option.active { outline-color: ${C.accent} !important; background: ${C.bgCardSelected} !important; box-shadow: 0 4px 16px rgba(99,102,241,0.12); }

        .ba-next-btn { transition: all 0.2s; }
        .ba-next-btn:not(:disabled):hover { background: #4F46E5 !important; box-shadow: 0 8px 24px rgba(99,102,241,0.30) !important; }
        .ba-next-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .ba-back-btn:hover { background: rgba(99,102,241,0.06) !important; color: ${C.accent} !important; }

        @keyframes ba-fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ba-in { animation: ba-fadeUp 0.28s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes ba-spin { to { transform: rotate(360deg); } }

        /* Responsive: stack below 1024px */
        @media (max-width: 1023px) {
          .ba-split { grid-template-columns: 1fr !important; overflow-y: auto !important; }
          .ba-left  { min-height: auto !important; border-right: none !important; border-bottom: 1px solid ${C.border} !important; padding: 28px 24px !important; }
          .ba-right { padding: 28px 24px !important; }
          .ba-steps { display: none !important; }
        }
      `}} />

      {/* ─── TOP BAR (56px) ─────────────────────────────────────── */}
      <div style={{
        height: 56,
        background: C.topBar,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(16px, 5vw, 80px)",
        flexShrink: 0,
        gap: 16,
      }}>
        {/* Horizontal step bar */}
        <div className="ba-steps" style={{ display: "flex", alignItems: "center", columnGap: 8, flex: 1, overflow: "hidden" }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", columnGap: 8, flexShrink: 0 }}>
              <div style={{
                width: 24, height: 24,
                borderRadius: "50%",
                background: step.active ? C.accent : C.border,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}>
                {step.active && i === steps.filter(s => s.active).length - 1
                  ? i + 1
                  : i + 1
                }
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                color: step.active ? C.accentLight : C.textMuted,
                whiteSpace: "nowrap",
              }}>
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <svg width={10} height={16} viewBox="0 0 10 16" fill="none" style={{ marginLeft: 4, flexShrink: 0 }}>
                  <path d="M0.5 14L2 15.5L10 8L2 0.5L0.5 2L7 8L0.5 14Z" fill={step.active ? C.accent : C.textMuted} />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Batin wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            background: C.accent, width: 26, height: 26,
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
          }}>
            <HeartPulse size={14} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "1.5px" }}>BATIN</span>
        </div>

        {/* Close */}
        <button onClick={handleClose} aria-label="Tutup" style={{
          background: "none", border: "none", color: C.textBody,
          cursor: "pointer", padding: 8, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "color 0.15s", flexShrink: 0,
        }}>
          <X size={22} />
        </button>
      </div>

      {/* ─── SPLIT BODY ─────────────────────────────────────────── */}
      <div
        id="batin-assess"
        className="ba-split"
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* ─── LEFT PANEL — Question stack ──────────────────────── */}
        <div
          className="ba-left"
          style={{
            background: C.bgLeft,
            backgroundImage: "radial-gradient(circle at 20% 30%, rgba(99,102,241,0.06) 0%, transparent 60%)",
            borderRight: `1px solid ${C.border}`,
            padding: "clamp(24px, 4vw, 64px) clamp(24px, 6vw, 88px)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Batin brand tag */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.accentLight }}>
              <HeartPulse size={16} />
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.5px" }}>
                Batin · Asesmen Klinis
              </span>
            </div>
          </div>

          {/* === IDLE === */}
          {isIdle && (
            <div className="ba-in" style={{ display: "flex", flexDirection: "column", rowGap: 40, flex: 1, justifyContent: "center" }}>
              {/* "coming up" preview of all 4 questions */}
              {[
                { n: "BERIKUTNYA", text: "Mulai asesmen mandiri Anda" },
                ...questions.map((q, i) => ({ n: `${i + 1} / ${questions.length}`, text: q.text })),
              ].map((item, i) => (
                <div key={i} style={{ transition: "all 0.3s" }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: i === 0 ? C.accentLight : C.textMuted,
                    display: "block", marginBottom: 6,
                  }}>
                    {item.n}
                  </span>
                  <h2 style={{
                    margin: 0, fontWeight: 700,
                    fontSize: i === 0 ? "clamp(28px, 3.5vw, 48px)" : "clamp(18px, 2vw, 24px)",
                    lineHeight: 1.2,
                    color: i === 0 ? C.textPrimary : C.textMuted,
                    transition: "all 0.2s",
                  }}>
                    {item.text}
                  </h2>
                </div>
              ))}
            </div>
          )}

          {/* === QUESTIONNAIRE === */}
          {isQuestionnaire && (
            <div className="ba-in" style={{ display: "flex", flexDirection: "column", rowGap: 40, flex: 1, justifyContent: "center" }}>
              {questions.map((q, idx) => {
                const isActive = idx === currentQuestionIndex;
                const isPast = idx < currentQuestionIndex;
                return (
                  <div key={q.id} style={{ transition: "all 0.3s" }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, letterSpacing: "1px",
                      textTransform: "uppercase", display: "block", marginBottom: 6,
                      color: isActive ? C.accentLight : C.textMuted,
                    }}>
                      {isPast ? "✓ SELESAI" : `${idx + 1} / ${questions.length}`}
                    </span>
                    <h2 style={{
                      margin: 0, fontWeight: 700,
                      fontSize: isActive
                        ? "clamp(24px, 3vw, 46px)"
                        : "clamp(16px, 1.8vw, 24px)",
                      lineHeight: 1.25,
                      color: isActive ? C.textPrimary : C.textMuted,
                      transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
                    }}>
                      {q.text}
                    </h2>
                    {isActive && (
                      <p style={{ margin: "10px 0 0 0", fontSize: 14, color: C.textBody, lineHeight: 1.6 }}>
                        {q.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* === SCORING === */}
          {isScoring && (
            <div className="ba-in" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", rowGap: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: C.accentLight }}>
                ANALISIS KLINIS
              </span>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: "clamp(28px, 3.5vw, 48px)", lineHeight: 1.2 }}>
                Memproses evaluasi medis Anda...
              </h2>
              <p style={{ margin: 0, fontSize: 15, color: C.textBody, lineHeight: 1.6 }}>
                Algoritma triase Batin menghitung skor kecemasan, burnout, dan kecenderungan stres klinis.
              </p>
            </div>
          )}

          {/* === RESULT === */}
          {isResult && assessmentResult && (
            <div className="ba-in" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", rowGap: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: C.accentLight }}>
                REKOMENDASI MEDIS
              </span>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: "clamp(28px, 3.5vw, 48px)", lineHeight: 1.2 }}>
                Laporan Triase Batin Anda
              </h2>
              {/* Score circle */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 8 }}>
                <div style={{
                  width: 96, height: 96,
                  borderRadius: "50%",
                  border: `4px solid ${assessmentResult.isHighRisk ? C.red : C.green}`,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 28px ${assessmentResult.isHighRisk ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                  background: C.bg, flexShrink: 0,
                }}>
                  <span style={{ fontSize: 26, fontWeight: 800 }}>{assessmentResult.score}</span>
                  <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: "0.5px" }}>SKOR</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: assessmentResult.isHighRisk ? C.red : C.green, marginBottom: 6 }}>
                    {assessmentResult.isHighRisk ? "⚠ Kategori Stres Tinggi" : "✓ Kategori Normal/Stabil"}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: C.textBody, lineHeight: 1.5 }}>
                    Skor total <strong style={{ color: C.textPrimary }}>{assessmentResult.score} dari 20</strong> berdasarkan 4 dimensi klinis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ paddingTop: 16, marginTop: "auto", borderTop: `1px solid ${C.border}` }}>
            <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>
              © {new Date().getFullYear()} Batin · Kesehatan Mental Indonesia
            </p>
          </div>
        </div>

        {/* ─── RIGHT PANEL — Options / Actions ──────────────────── */}
        <div
          className="ba-right"
          style={{
            background: C.bg,
            padding: "0 clamp(24px, 5vw, 80px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflowY: "auto",
          }}
        >
          <div style={{ maxWidth: 520, width: "100%", padding: "40px 0" }}>

            {/* === IDLE — Intro features === */}
            {isIdle && (
              <div className="ba-in">
                <h1 style={{ margin: "0 0 28px 0", fontSize: 20, fontWeight: 700, lineHeight: 1.4 }}>
                  Ikuti asesmen kesehatan mental Batin
                </h1>
                <div style={{ display: "flex", flexDirection: "column", rowGap: 14 }}>
                  {[
                    { icon: "⏱️", title: "Kurang dari 1 menit", desc: "Hanya 4 pertanyaan klinis terstruktur." },
                    { icon: "🔒", title: "Privasi medis terjamin", desc: "Respons terenkripsi dan tidak disebarluaskan." },
                    { icon: "🩺", title: "Hasil triase seketika", desc: "Skor klinis dan rujukan psikolog pendamping." },
                  ].map((f, i) => (
                    <div key={i} style={{
                      background: C.bgCard,
                      borderRadius: 12,
                      padding: "18px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      border: `2px solid ${C.border}`,
                    }}>
                      <span style={{ fontSize: 28, flexShrink: 0 }}>{f.icon}</span>
                      <div>
                        <h4 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700 }}>{f.title}</h4>
                        <span style={{ fontSize: 13, color: C.textBody, lineHeight: 1.5 }}>{f.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="ba-next-btn"
                  onClick={() => transitionAssessment(AssessmentState.QUESTIONNAIRE)}
                  style={{
                    marginTop: 28,
                    padding: "14px 28px",
                    background: C.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontFamily: "inherit",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 8px 24px rgba(99,102,241,0.25)",
                  }}
                >
                  Mulai Asesmen <ArrowRight size={17} />
                </button>
              </div>
            )}

            {/* === QUESTIONNAIRE — Option cards === */}
            {isQuestionnaire && (
              <div className="ba-in" key={`q-${currentQuestionIndex}`}>
                <h1 style={{ margin: "0 0 24px 0", fontSize: 18, fontWeight: 700, lineHeight: 1.5, color: C.textBody }}>
                  Pilih jawaban yang paling sesuai kondisi Anda:
                </h1>
                <div style={{ display: "flex", flexDirection: "column", rowGap: 12 }}>
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isSelected = responses[questions[currentQuestionIndex].id] === val;
                    return (
                      <div
                        key={val}
                        onClick={() => handleSelectAnswer(questions[currentQuestionIndex].id, val)}
                        className={`ba-option${isSelected ? " active" : ""}`}
                        style={{
                          background: isSelected ? C.bgCardSelected : C.bgCard,
                          borderRadius: 10,
                          minHeight: 80,
                          padding: "16px 20px",
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          outlineOffset: -2,
                        }}
                      >
                        {/* Radio indicator */}
                        <div style={{
                          width: 20, height: 20,
                          borderRadius: "50%",
                          border: `2px solid ${isSelected ? C.accent : C.textMuted}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, transition: "border-color 0.2s",
                        }}>
                          {isSelected && (
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.accent }} />
                          )}
                        </div>
                        <div>
                          <h5 style={{ margin: "0 0 3px 0", fontSize: 16, fontWeight: 700 }}>
                            {optionTitles[val - 1]}
                          </h5>
                          <span style={{ fontSize: 13, color: C.textBody, lineHeight: 1.4 }}>
                            {optionDescriptions[val - 1]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24 }}>
                  {currentQuestionIndex > 0 && (
                    <button
                      className="ba-back-btn"
                      onClick={() => setCurrentQuestionIndex(p => p - 1)}
                      style={{
                        padding: "12px 20px",
                        background: "transparent",
                        color: C.textBody,
                        border: "none",
                        borderRadius: 10,
                        fontFamily: "inherit",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                    >
                      ← Kembali
                    </button>
                  )}
                  <button
                    className="ba-next-btn"
                    disabled={currentAnswer === undefined}
                    onClick={() => {
                      if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(p => p + 1);
                      else handleSubmit();
                    }}
                    style={{
                      padding: "13px 28px",
                      background: C.accent,
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      fontFamily: "inherit",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 8px 24px rgba(99,102,241,0.25)",
                    }}
                  >
                    {currentQuestionIndex === questions.length - 1 ? "Kirim Hasil" : "Ok, Lanjut"}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            )}

            {/* === SCORING — Spinner === */}
            {isScoring && (
              <div className="ba-in" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", rowGap: 16 }}>
                <div style={{ color: C.accent, animation: "ba-spin 1.2s linear infinite", width: 40 }}>
                  <RefreshCw size={40} />
                </div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Mengevaluasi kondisi Anda...</h3>
                <p style={{ margin: 0, fontSize: 14, color: C.textBody, lineHeight: 1.6 }}>
                  Sistem sedang menghitung skor triase klinis berdasarkan 4 dimensi kesehatan mental.
                </p>
              </div>
            )}

            {/* === RESULT === */}
            {isResult && assessmentResult && (
              <div className="ba-in" style={{ display: "flex", flexDirection: "column", rowGap: 16 }}>
                {/* Risk badge */}
                <div style={{
                  background: assessmentResult.isHighRisk ? "rgba(239,68,68,0.07)" : "rgba(16,185,129,0.07)",
                  border: `1px solid ${assessmentResult.isHighRisk ? C.red : C.green}`,
                  borderRadius: 12,
                  padding: 22,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    {assessmentResult.isHighRisk
                      ? <ShieldAlert size={24} color={C.red} />
                      : <CheckCircle size={24} color={C.green} />
                    }
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{assessmentResult.summary}</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: C.textBody, lineHeight: 1.55 }}>
                    {assessmentResult.isHighRisk
                      ? "Triage mendeteksi indikasi kecemasan berat. Konsultasi dengan psikolog klinis sangat disarankan sesegera mungkin."
                      : "Skor Anda menunjukkan kondisi normal/stabil. Terapis Batin siap mendampingi untuk pemeliharaan kesehatan emosi preventif."
                    }
                  </p>
                </div>

                {/* Crisis hotlines */}
                {assessmentResult.isHighRisk && crisisResources.length > 0 && (
                  <div style={{
                    background: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: "16px 20px",
                  }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: 11, fontWeight: 700, color: "#FDBA74", textTransform: "uppercase", letterSpacing: "1px" }}>
                      Layanan Darurat Kesehatan Jiwa (24/7)
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", rowGap: 8 }}>
                      {crisisResources.map(res => (
                        <div key={res.id} style={{ fontSize: 13, color: C.textPrimary }}>
                          📞 <strong>{res.name}:</strong>{" "}
                          <span style={{ color: C.accentLight }}>{res.contactInfo}</span>
                          {res.location && <span style={{ color: C.textMuted }}> ({res.location})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <a
                  href={`/booking?specialty=Kecemasan${assessmentResult?.id ? `&assessmentId=${assessmentResult.id}` : ""}${bookingMode ? `&mode=${bookingMode}` : ""}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    marginTop: 8,
                    padding: "14px 28px",
                    background: C.accent,
                    color: "#fff",
                    borderRadius: 10,
                    fontWeight: 700, fontSize: 15,
                    textDecoration: "none",
                    fontFamily: "inherit",
                    boxShadow: "0 8px 24px rgba(99,102,241,0.25)",
                    transition: "background 0.2s, box-shadow 0.2s",
                    width: "fit-content",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#4F46E5"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = C.accent; }}
                >
                  Pesan Sesi Konseling <ArrowRight size={17} />
                </a>

                <button
                  className="ba-back-btn"
                  onClick={() => {
                    sanitizeResponses(); sanitizeResult(); sanitizeCrisis();
                    setCurrentQuestionIndex(0);
                    transitionAssessment(AssessmentState.QUESTIONNAIRE);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 16px",
                    background: "transparent", color: C.textBody,
                    border: "none", borderRadius: 10,
                    fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                    cursor: "pointer", width: "fit-content",
                    transition: "background 0.15s",
                  }}
                >
                  <RefreshCw size={14} /> Ulangi Asesmen
                </button>

                {assessmentResult.isHighRisk && (
                  <p style={{ margin: 0, fontSize: 11, color: C.red, fontStyle: "italic", lineHeight: 1.5 }}>
                    * Batin bukan pengganti layanan darurat medis. Jika Anda berniat menyakiti diri sendiri, segera hubungi 119 atau kunjungi fasilitas kesehatan terdekat.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
