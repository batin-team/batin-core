import PDFDocument from "pdfkit";

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

export type CounselingNotesPdfData = {
  sessionRef: string;
  docId: string;
  verificationHash: string;
  psychologistName: string;
  clientName: string;
  scheduledAt?: Date | null;
  sessionTypeLabel: string;
  chiefComplaint: string;
  assessmentObservation: string;
  interventions: string;
  followUpPlan: string;
  recommendations: string;
};

const BRAND = "#1D4ED8";
const TEXT = "#0F172A";
const MUTED = "#64748B";

function formatDateId(date?: Date | null): string {
  if (!date) return "-";
  try {
    return date.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "-";
  }
}

/** Builds a real, downloadable counseling-notes PDF as a Buffer. */
export function buildCounselingNotesPdf(data: CounselingNotesPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // A4 Accent Header strip
    doc.rect(0, 0, doc.page.width, 6).fillColor(BRAND).fill();

    // Document Logo & Header Title
    doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(20).text("Batin", left, 36);
    doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(16).text("Catatan Konseling", left, 58);
    doc.fillColor(MUTED).font("Helvetica").fontSize(9)
      .text("Salinan Resmi Dokumen Layanan Kesehatan Mental Batin (PT Mental Anak Bangsa)", left, 75);
    doc.fillColor(MUTED).font("Courier").fontSize(8.5).text(`Doc ID: ${data.docId}`, left, 87);

    // Confidentiality Badge (top right)
    const badgeW = 150;
    const badgeH = 20;
    const badgeX = doc.page.width - doc.page.margins.right - badgeW;
    doc.roundedRect(badgeX, 36, badgeW, badgeH, 4).fillColor("#FEF3C7").fill();
    doc.fillColor("#B45309").font("Helvetica-Bold").fontSize(8).text("RAHASIA - DOKUMEN MEDIS", badgeX, 42, { align: "center", width: badgeW });

    // Under header divider
    doc.moveTo(left, 102).lineTo(left + contentWidth, 102).strokeColor("#E2E8F0").lineWidth(1.5).stroke();

    // Metadata block
    const metaY = 112;
    const metaH = 68;
    // Draw background container
    doc.roundedRect(left, metaY, contentWidth, metaH, 8).fillColor("#F8FAFC").fill();
    doc.roundedRect(left, metaY, contentWidth, metaH, 8).strokeColor("#E2E8F0").lineWidth(1).stroke();

    const padding = 12;
    const colW = (contentWidth - padding * 2) / 2;

    // Row 1
    // Psikolog
    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(7.5).text("PSIKOLOG", left + padding, metaY + padding);
    doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(10).text(data.psychologistName || "-", left + padding, metaY + padding + 11, { width: colW - 10 });

    // Klien
    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(7.5).text("KLIEN", left + padding + colW, metaY + padding);
    doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(10).text(data.clientName || "-", left + padding + colW, metaY + padding + 11, { width: colW - 10 });

    // Row 2
    // Jadwal
    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(7.5).text("JADWAL KONSELING", left + padding, metaY + padding + 28);
    doc.fillColor(TEXT).font("Helvetica").fontSize(10).text(formatDateId(data.scheduledAt), left + padding, metaY + padding + 39, { width: colW - 10 });

    // Metode
    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(7.5).text("METODE LAYANAN", left + padding + colW, metaY + padding + 28);
    doc.fillColor(TEXT).font("Helvetica").fontSize(10).text(`${data.sessionTypeLabel} (Sesi ID: ${data.sessionRef})`, left + padding + colW, metaY + padding + 39, { width: colW - 10 });

    // Reset layout coordinate cursor below the metadata box
    doc.y = metaY + metaH + 16;

    // Structured Clinical Cards
    const renderSection = (title: string, bodyText: string, color: string, bgColor: string) => {
      const currentY = doc.y;
      
      // Calculate text height in advance to draw cards dynamically
      doc.font("Helvetica").fontSize(9.5);
      const textHeight = doc.heightOfString(bodyText || "-", { width: contentWidth - 24, lineGap: 1.5 });
      const cardHeight = textHeight + 22;

      // Draw card background & border
      doc.roundedRect(left, currentY, contentWidth, cardHeight, 6).fillColor(bgColor).fill();
      doc.roundedRect(left, currentY, contentWidth, cardHeight, 6).strokeColor("#E2E8F0").lineWidth(0.75).stroke();
      
      // Draw left vertical accent bar
      doc.rect(left, currentY, 4, cardHeight).fillColor(color).fill();

      // Print Section Title
      doc.fillColor(color).font("Helvetica-Bold").fontSize(9.5).text(title, left + 12, currentY + 6);

      // Print Section Body
      doc.fillColor(TEXT).font("Helvetica").fontSize(9.5).text(bodyText || "-", left + 12, currentY + 16, { width: contentWidth - 24, lineGap: 1.5 });

      // Move cursor below the card
      doc.y = currentY + cardHeight + 10;
    };

    renderSection("Keluhan Utama", data.chiefComplaint, "#1D4ED8", "#F8FAFC");
    renderSection("Observasi & Asesmen Klinis", data.assessmentObservation, "#006B54", "#F0FDF4");
    renderSection("Intervensi Terapi", data.interventions, "#7A3F02", "#FFFBEB");
    renderSection("Rencana Tindak Lanjut", data.followUpPlan, "#D97706", "#FFFBF5");

    // Recommendations Callout Box
    if (data.recommendations) {
      const currentY = doc.y;
      doc.font("Helvetica").fontSize(9.5);
      const textHeight = doc.heightOfString(data.recommendations || "-", { width: contentWidth - 24, lineGap: 1.5 });
      const cardHeight = textHeight + 22;

      doc.roundedRect(left, currentY, contentWidth, cardHeight, 6).fillColor("#F0FDF4").fill();
      doc.roundedRect(left, currentY, contentWidth, cardHeight, 6).strokeColor("#DCFCE7").lineWidth(1).stroke();

      // Left bar
      doc.rect(left, currentY, 4, cardHeight).fillColor("#15803D").fill();

      doc.fillColor("#15803D").font("Helvetica-Bold").fontSize(9.5).text("Rekomendasi Psikolog", left + 12, currentY + 6);
      doc.fillColor("#166534").font("Helvetica").fontSize(9.5).text(data.recommendations || "-", left + 12, currentY + 16, { width: contentWidth - 24, lineGap: 1.5 });

      doc.y = currentY + cardHeight + 12;
    }

    // Verification Seal Box
    const verifyY = doc.y;
    const verifyBoxH = 54;
    
    // Draw boundary line
    doc.moveTo(left, verifyY).lineTo(left + contentWidth, verifyY).strokeColor("#E2E8F0").lineWidth(1).stroke();

    // Draw verification card
    doc.roundedRect(left, verifyY + 8, contentWidth, verifyBoxH, 6).fillColor("#F9FAF6").fill();
    doc.roundedRect(left, verifyY + 8, contentWidth, verifyBoxH, 6).strokeColor("#E2E8F0").lineWidth(0.75).stroke();

    // Content inside card
    doc.fillColor("#0F6A52").font("Helvetica-Bold").fontSize(7.5).text("CLINICAL RECORD VERIFICATION", left + 10, verifyY + 14);
    const footnoteText = "Dokumen ini diterbitkan secara resmi oleh psikolog berlisensi di platform Batin (PT Mental Anak Bangsa). Kerahasiaan data medis dilindungi di bawah Undang-Undang Kesehatan Republik Indonesia.";
    doc.fillColor(MUTED).font("Helvetica").fontSize(7).text(footnoteText, left + 10, verifyY + 23, { width: contentWidth - 160, lineGap: 1 });

    // Seal on the right
    const sealX = left + contentWidth - 130;
    doc.roundedRect(sealX, verifyY + 14, 120, 42, 4).fillColor("#FFFFFF").fill();
    doc.roundedRect(sealX, verifyY + 14, 120, 42, 4).strokeColor("#15803D").lineWidth(0.5).stroke();

    doc.fillColor("#15803D").font("Helvetica-Bold").fontSize(6.5).text("SIGN-OK: VERIFIED SYSTEM", sealX, verifyY + 19, { width: 120, align: "center" });
    doc.fillColor("#0F172A").font("Courier-Bold").fontSize(7).text(data.verificationHash.slice(0, 16), sealX, verifyY + 27, { width: 120, align: "center" });
    doc.fillColor(MUTED).font("Helvetica").fontSize(6).text("PT MENTAL ANAK BANGSA", sealX, verifyY + 36, { width: 120, align: "center" });

    doc.end();
  });
}
