export function generateReceiptPdf(sessionId: string) {
  return {
    sessionId,
    fileName: `receipt-${sessionId}.pdf`,
    status: "MOCK_GENERATED",
    watermark: "MIND_BRIDGE_RECEIPT"
  };
}

export function generateCounselingNotesPdf(sessionId: string) {
  return {
    sessionId,
    fileName: `counseling-notes-${sessionId}.pdf`,
    status: "MOCK_GENERATED",
    watermark: "RAHASIA - DOKUMEN RESMI"
  };
}
