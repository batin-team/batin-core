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

export function DiscoveryDrawer({ isOpen, onClose }: DiscoveryDrawerProps) {
  // 1. Hooks for State Machines
  const [assessmentState, transitionAssessment] = useStateMachine(
    AssessmentState.IDLE,
    assessmentTransitions
  );

  // 2. Hooks for Sanitized States (Memory Sanitization)
  const [responses, setResponses, sanitizeResponses] = useSanitizedState<Record<string, number>>({});
  const [assessmentResult, setAssessmentResult, sanitizeResult] = useSanitizedState<any>(null);
  const [crisisResources, setCrisisResources, sanitizeCrisis] = useSanitizedState<CrisisResource[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Questions definitions
  const questions = [
    {
      id: "q1",
      text: "Seberapa sering Anda merasa cemas, gelisah, atau khawatir berlebihan dalam 2 minggu terakhir?",
      category: "Kecemasan"
    },
    {
      id: "q2",
      text: "Seberapa sering Anda merasa sedih, murung, putus asa, atau kehilangan minat pada hobi?",
      category: "Depresi"
    },
    {
      id: "q3",
      text: "Seberapa sering Anda merasa lelah secara emosional dan fisik akibat tekanan rutinitas (burnout)?",
      category: "Burnout"
    },
    {
      id: "q4",
      text: "Apakah Anda mengalami trauma masa lalu yang mengganggu aktivitas sehari-hari Anda akhir-akhir ini?",
      category: "Trauma"
    }
  ];

  // Handle keyboard event to close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus trapping when open
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex="0"]'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  // Clean wipe of all states on close
  function handleClose() {
    sanitizeResponses();
    sanitizeResult();
    sanitizeCrisis();
    transitionAssessment(AssessmentState.IDLE);
    onClose();
  }

  // Answer selection handler
  function handleSelectAnswer(questionId: string, score: number) {
    setResponses((prev) => ({
      ...prev,
      [questionId]: score
    }));
  }

  // Submit assessment logic
  async function handleSubmit() {
    setIsLoading(true);
    transitionAssessment(AssessmentState.SCORING);

    const userStr = localStorage.getItem("mindbridge_user");
    let clientId = "";
    if (userStr) {
      try {
        clientId = JSON.parse(userStr).id;
      } catch (e) {
        console.error(e);
      }
    }

    if (!clientId) {
      alert("Silakan masuk terlebih dahulu untuk melakukan asesmen.");
      setIsLoading(false);
      transitionAssessment(AssessmentState.QUESTIONNAIRE);
      return;
    }

    try {
      const payload = {
        clientId,
        category: "Mental Health Triage",
        responses
      };

      const res = await apiFetch("/api/assessments", {
        method: "POST",
        body: JSON.stringify(payload)
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

  const isAllAnswered = Object.keys(responses).length === questions.length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.35)",
        backdropFilter: "blur(4px)",
        zIndex: 999,
        display: "flex",
        justifyContent: "flex-end"
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Discovery & Assessment Drawer"
        style={{
          width: "100%",
          maxWidth: 520,
          height: "100vh",
          backgroundColor: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(20px)",
          boxShadow: "-8px 0 32px rgba(15, 23, 42, 0.12)",
          borderLeft: "1px solid rgba(226, 232, 240, 0.8)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          animation: "slideInDrawer 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes slideInDrawer {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .custom-focus:focus-visible {
            outline: 2px solid #2563EB !important;
            outline-offset: 2px;
          }
          `
        }} />

        {/* Drawer Header */}
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>Intake Mental Wellness</h2>
            <span style={{ fontSize: 12, color: "#64748B" }}>Evaluasi mandiri psikologis Anda</span>
          </div>
          <button
            onClick={handleClose}
            className="custom-focus"
            style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: 6, borderRadius: "50%" }}
            aria-label="Tutup Drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          {/* IDLE state */}
          {assessmentState === AssessmentState.IDLE && (
            <div style={{ textAlign: "center", paddingTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ backgroundColor: "#EFF6FF", width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}>
                <HeartPulse size={36} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>Mulai Asesmen Personal</h3>
              <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.6, maxWidth: 360 }}>
                Hanya butuh 1 menit untuk memahami kondisi emosional Anda saat ini. Kami akan menyarankan rekomendasi psikolog yang paling sesuai.
              </p>
              <button
                onClick={() => transitionAssessment(AssessmentState.QUESTIONNAIRE)}
                className="custom-focus"
                style={{
                  marginTop: 12,
                  padding: "12px 28px",
                  backgroundColor: "#2563EB",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
                }}
              >
                Mulai Sekarang <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* QUESTIONNAIRE state */}
          {assessmentState === AssessmentState.QUESTIONNAIRE && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {questions.map((q, qIndex) => (
                <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <label style={{ fontSize: 14, fontWeight: 700, color: "#1E293B", lineHeight: 1.5 }}>
                    {qIndex + 1}. {q.text}
                  </label>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = responses[q.id] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, val)}
                          className="custom-focus"
                          style={{
                            flex: 1,
                            padding: "10px 0",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            border: isSelected ? "2px solid #2563EB" : "1px solid #CBD5E1",
                            backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                            color: isSelected ? "#2563EB" : "#475569",
                            cursor: "pointer",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94A3B8" }}>
                    <span>Tidak pernah</span>
                    <span>Sangat sering</span>
                  </div>
                </div>
              ))}

              <button
                type="button"
                disabled={!isAllAnswered}
                onClick={handleSubmit}
                className="custom-focus"
                style={{
                  marginTop: 16,
                  padding: "14px",
                  backgroundColor: isAllAnswered ? "#2563EB" : "#CBD5E1",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isAllAnswered ? "pointer" : "not-allowed",
                  transition: "background 0.2s"
                }}
              >
                Kirim Hasil Asesmen
              </button>
            </div>
          )}

          {/* SCORING (Loading) state */}
          {assessmentState === AssessmentState.SCORING && (
            <div role="status" style={{ textAlign: "center", paddingTop: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ color: "#2563EB", animation: "spin 1.5s linear infinite" }}>
                <RefreshCw size={44} />
              </div>
              <style dangerouslySetInnerHTML={{
                __html: `@keyframes spin { 100% { transform: rotate(360deg); } }`
              }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", margin: 0 }}>Mengevaluasi Kondisi Anda</h3>
              <p style={{ color: "#64748B", fontSize: 13 }}>Sistem sedang menghitung skor triase klinis...</p>
            </div>
          )}

          {/* RESULT state */}
          {assessmentState === AssessmentState.RESULT && assessmentResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div
                style={{
                  backgroundColor: assessmentResult.isHighRisk ? "#FEF2F2" : "#ECFDF5",
                  border: assessmentResult.isHighRisk ? "1px solid #FCA5A5" : "1px solid #A7F3D0",
                  borderRadius: 16,
                  padding: "20px",
                  textAlign: "center"
                }}
              >
                {assessmentResult.isHighRisk ? (
                  <ShieldAlert size={40} color="#EF4444" style={{ margin: "0 auto 12px auto" }} />
                ) : (
                  <CheckCircle size={40} color="#10B981" style={{ margin: "0 auto 12px auto" }} />
                )}
                <h3 style={{ fontSize: 16, fontWeight: 700, color: assessmentResult.isHighRisk ? "#991B1B" : "#065F46", margin: "0 0 6px 0" }}>
                  Skor Triase: {assessmentResult.score} / 20
                </h3>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: assessmentResult.isHighRisk ? "#EF4444" : "#10B981", margin: "0 0 10px 0" }}>
                  {assessmentResult.summary}
                </h4>
                <p style={{ fontSize: 13, color: assessmentResult.isHighRisk ? "#7F1D1D" : "#064E3B", margin: 0, lineHeight: 1.5 }}>
                  {assessmentResult.isHighRisk
                    ? "Sistem mendeteksi tingkat kecemasan / tekanan emosi yang tinggi. Harap perhatikan petunjuk keselamatan di bawah."
                    : "Kondisi Anda tergolong stabil. Anda tetap dapat melakukan konseling pencegahan bersama terapis kami."}
                </p>
              </div>

              {/* High risk emergency details */}
              {assessmentResult.isHighRisk && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "16px" }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#B45309", margin: "0 0 8px 0" }}>LAYANAN KESEHATAN DARURAT (CRISIS HOTLINES):</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {crisisResources.map((res) => (
                        <div key={res.id} style={{ fontSize: 12, color: "#78350F" }}>
                          <strong>{res.name}</strong>: {res.contactInfo} ({res.location})
                        </div>
                      ))}
                    </div>
                  </div>

                  <p style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, textAlign: "center", margin: 0, fontStyle: "italic" }}>
                    Disclaimer: Batin bukan pengganti layanan darurat medis. Jika Anda berniat menyakiti diri sendiri, segera hubungi 119 atau kunjungi UGD terdekat.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                <a
                  href="/booking?specialty=Kecemasan"
                  style={{
                    padding: "14px",
                    backgroundColor: "#2563EB",
                    color: "#FFFFFF",
                    textAlign: "center",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
                  }}
                >
                  Pesan Sesi Konseling Sekarang
                </a>
                <button
                  onClick={() => transitionAssessment(AssessmentState.QUESTIONNAIRE)}
                  className="custom-focus"
                  style={{
                    padding: "12px",
                    backgroundColor: "transparent",
                    color: "#475569",
                    border: "1px solid #CBD5E1",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  Ulangi Asesmen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
