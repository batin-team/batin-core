import { BookingService } from '../src/services/booking';
import prisma from '../src/config/database';

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    bookingLock: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    provider: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    appointment: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb({ 
        appointment: { create: jest.fn().mockResolvedValue({ id: 'appt1' }) },
        bookingLock: { delete: jest.fn().mockResolvedValue({}) }
    })),
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    }
  },
}));

describe('Phase 3: Booking & Concurrency Tests', () => {
  it('should create a booking lock', async () => {
    const lockData = { id: 'l1', providerId: 'p1', startTime: new Date() };
    (prisma.bookingLock.create as jest.Mock).mockResolvedValue(lockData);

    const lock = await BookingService.createLock('p1', lockData.startTime);
    expect(lock.id).toBe('l1');
  });

  it('should cleanup expired locks', async () => {
    (prisma.bookingLock.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
    const count = await BookingService.cleanupExpiredLocks();
    expect(count).toBe(2);
  });

  it('should confirm a booking and clear lock', async () => {
    const mockDate = new Date();
    (prisma.bookingLock.findUnique as jest.Mock).mockResolvedValue({ id: 'l1', providerId: 'p1', startTime: mockDate, expiresAt: new Date(Date.now() + 10000) });
    (prisma.provider.findUnique as jest.Mock).mockResolvedValue({ id: 'p1', user: { email: 'p@test.com' } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', email: 'c@test.com' });

    const appt = await BookingService.confirmBooking('l1', 'u1');
    expect(appt.id).toBe('appt1');
  });
});
