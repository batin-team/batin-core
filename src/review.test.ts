import { ReviewService } from '../src/services/review';
import prisma from '../src/config/database';

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    appointment: {
      findUnique: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    }
  },
}));

describe('Phase 6: Review System Tests', () => {
  it('should submit a review for a completed appointment', async () => {
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue({ id: 'a1', status: 'COMPLETED' });
    (prisma.review.create as jest.Mock).mockResolvedValue({ id: 'rv1', rating: 5 });

    const review = await ReviewService.submitReview('a1', 5, 'Great!');
    expect(review.rating).toBe(5);
  });

  it('should fail to review a non-completed appointment', async () => {
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue({ id: 'a1', status: 'CONFIRMED' });
    await expect(ReviewService.submitReview('a1', 5)).rejects.toThrow('Only completed sessions can be reviewed');
  });
});
