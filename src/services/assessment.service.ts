import { prisma } from "../db";
import { logAudit } from "../middleware/audit";

export class AssessmentService {
  /**
   * Evaluates an intake assessment, computes score, and triages high-risk cases.
   */
  static async submitAssessment(clientId: string, category: string, responses: Record<string, number>) {
    // 1. Calculate score
    const scores = Object.values(responses).map(v => Number(v) || 0);
    const score = scores.reduce((sum, current) => sum + current, 0);

    // 2. Determine risk level and generate summary
    const isHighRisk = score >= 15;
    let summary = "Kondisi Stabil";
    if (score >= 15) {
      summary = "Indikasi Risiko Tinggi / Krisis";
    } else if (score >= 8) {
      summary = "Gejala Sedang / Perlu Perhatian";
    } else {
      summary = "Gejala Ringan / Pemantauan Rutin";
    }

    // Retrieve client details for audit and notifications
    const clientUser = await prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!clientUser) {
      throw new Error("Klien tidak ditemukan. Silakan masuk kembali.");
    }

    const clientName = clientUser.fullName || "Klien";

    // 3. Create AssessmentResponse
    const responseRecord = await prisma.assessmentResponse.create({
      data: {
        clientId,
        category,
        responses: responses as any,
        score,
        summary,
        isHighRisk
      }
    });

    // 4. Crisis handling if high risk
    if (isHighRisk) {
      // Find all admin and super admin users
      const admins = await prisma.user.findMany({
        where: {
          role: { in: ["ADMIN", "SUPER_ADMIN"] }
        }
      });

      // Create in-app notification for each administrator
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: "CRISIS_ALERT",
            title: "Peringatan Krisis Risiko Tinggi",
            message: `Klien ${clientName} terdeteksi risiko tinggi krisis mental (Skor: ${score}). Segera hubungi emergency contacts.`
          }))
        });
      }

      // Record crisis escalation in audit log (using mask helper)
      await logAudit({
        userId: clientId,
        action: "CRISIS_ESCALATION",
        entityId: responseRecord.id,
        metadata: {
          score,
          category,
          clientId
        }
      });
    } else {
      // Normal audit log for intake submission
      await logAudit({
        userId: clientId,
        action: "SUBMIT_INTAKE_ASSESSMENT",
        entityId: responseRecord.id,
        metadata: {
          score,
          category,
          clientId
        }
      });
    }

    return responseRecord;
  }

  /**
   * Retrieves crisis resources
   */
  static async getCrisisResources() {
    return prisma.crisisResource.findMany();
  }
}
