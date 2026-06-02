import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';

// Mock Prisma
jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
  },
}));

describe('Phase 1 Foundation Tests', () => {
  it('should return 200 OK for health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('OK');
  });

  it('should register a new user', async () => {
    const mockUser = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: '123', ...mockUser });

    const res = await request(app)
      .post('/api/auth/register')
      .send(mockUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('User registered successfully');
    
    // Verify Audit Log was called
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });
});
