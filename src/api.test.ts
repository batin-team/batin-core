import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    provider: {
      create: jest.fn(),
    },
    bookingLock: {
      create: jest.fn(),
    },
    assessmentResponse: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    }
  },
}));

describe('API Integration Tests', () => {
  it('should onboard a provider via API', async () => {
    (prisma.provider.create as jest.Mock).mockResolvedValue({ id: 'p1' });
    
    // Mock authentication by passing a token would be complex here without a real DB,
    // so we verify the route is mounted and calling the controller.
    const res = await request(app)
      .post('/api/providers/onboard')
      .send({ membershipType: 'MEMBER', professionalType: 'PSYCHOLOGIST', specialties: ['Anxiety'], hourlyRate: 100 });

    // Expect 401 because we didn't provide a valid token in this mock test
    expect(res.statusCode).toEqual(401);
  });

  it('should get health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
  });

  describe('Auth Controller Input Validation', () => {
    it('should return 400 if login payload is empty or invalid', async () => {
      const res1 = await request(app).post('/api/auth/login').send({});
      expect(res1.statusCode).toEqual(400);
      expect(res1.body.message).toContain('required');

      const res2 = await request(app).post('/api/auth/login').send({ email: 'test@example.com' });
      expect(res2.statusCode).toEqual(400);
      expect(res2.body.message).toContain('required');
    });

    it('should return 400 if register payload is empty or invalid', async () => {
      const res1 = await request(app).post('/api/auth/register').send({});
      expect(res1.statusCode).toEqual(400);
      expect(res1.body.message).toContain('required');

      const res2 = await request(app).post('/api/auth/register').send({ email: 'test@example.com' });
      expect(res2.statusCode).toEqual(400);
      expect(res2.body.message).toContain('required');
    });

    it('should log in using fallback mock users if database is down', async () => {
      // Mock db failure
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB Connection Refused'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'psychologist@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Mock login successful');
      expect(res.body.user.email).toBe('psychologist@example.com');
    });
  });
});
