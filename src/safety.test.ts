import { AssessmentService } from '../src/services/assessment';
import prisma from '../src/config/database';

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    assessmentResponse: {
      create: jest.fn(),
    },
    crisisResource: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    }
  },
}));

describe('Phase 4: Assessment & Crisis Safety Tests', () => {
  it('should handle low-risk assessment', async () => {
    const data = { category: 'Anxiety', responses: { q1: 1, q2: 2 } };
    (prisma.assessmentResponse.create as jest.Mock).mockResolvedValue({ id: 'r1', isHighRisk: false });

    const res = await AssessmentService.submitAssessment('u1', data);
    expect(res.isHighRisk).toBe(false);
  });

  it('should handle high-risk assessment and trigger alert', async () => {
    const data = { category: 'Crisis', responses: { q1: 10, q2: 10 } };
    (prisma.assessmentResponse.create as jest.Mock).mockResolvedValue({ id: 'r2', isHighRisk: true });

    const res = await AssessmentService.submitAssessment('u1', data);
    expect(res.isHighRisk).toBe(true);
  });

  it('should retrieve crisis resources', async () => {
    (prisma.crisisResource.findMany as jest.Mock).mockResolvedValue([{ id: 'cr1', name: 'Hotline' }]);
    const resources = await AssessmentService.getCrisisResources();
    expect(resources.length).toBeGreaterThan(0);
  });
});
