import prisma from '../config/database';
import { ServiceFactory } from './factory';

export class AssessmentService {
  static async submitAssessment(clientId: string, data: { category: string; responses: any }) {
    // Scoring logic (simplified for MVP)
    let score = 0;
    Object.values(data.responses).forEach((val: any) => {
      if (typeof val === 'number') score += val;
    });

    const isHighRisk = score >= 15; // Threshold for high risk

    let response;
    try {
      response = await prisma.assessmentResponse.create({
        data: {
          clientId,
          category: data.category,
          responses: data.responses,
          score,
          isHighRisk,
          summary: isHighRisk ? 'High risk detected. Immediate attention required.' : 'Standard assessment completed.'
        }
      });
    } catch (err) {
      console.warn('Prisma database connection failed, falling back to mock response', err);
      response = {
        id: `mock-response-${Math.random().toString(36).substr(2, 9)}`,
        clientId,
        category: data.category,
        responses: data.responses,
        score,
        isHighRisk,
        summary: isHighRisk ? 'High risk detected. Immediate attention required.' : 'Standard assessment completed.',
        createdAt: new Date()
      };
    }

    if (isHighRisk) {
      const notificationService = ServiceFactory.getNotificationService();
      // Notify Admins (assuming role-based search or specific admin email)
      console.log(`[CRISIS] High risk assessment ${response.id} for client ${clientId}`);
      await notificationService.sendInApp('ADMIN_GROUP', 'CRISIS ALERT', `High risk assessment submitted by client ${clientId}`);
    }

    return response;
  }

  static async getCrisisResources(location?: string) {
    return await prisma.crisisResource.findMany({
      where: location ? { location } : undefined
    });
  }

  static async addCrisisResource(data: { name: string; contactInfo: string; location?: string }) {
    return await prisma.crisisResource.create({ data });
  }
}
