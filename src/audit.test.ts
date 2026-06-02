import request from 'supertest';
import app from './app';
import prisma from './config/database';

// Mock Prisma
jest.mock('./config/database', () => ({
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

describe('Audit Middleware PII Redaction Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redact sensitive PII (password, email, phone, address) from audit log metadata', async () => {
    const sensitivePayload = {
      email: 'sensitive@example.com',
      password: 'mypassword123',
      fullName: 'John Doe',
      phone: '123-456-7890',
      address: '123 Sensitive Lane',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: 'user-abc', ...sensitivePayload });

    const res = await request(app)
      .post('/api/auth/register')
      .send(sensitivePayload);

    expect(res.statusCode).toEqual(201);
    
    // Check that auditLog.create was called
    expect(prisma.auditLog.create).toHaveBeenCalled();
    
    // Retrieve the call arguments
    const createCallArgs = (prisma.auditLog.create as jest.Mock).mock.calls[0][0];
    const loggedMetadata = createCallArgs.data.metadata;

    // Verify all sensitive PII fields are redacted in the metadata log
    expect(loggedMetadata.body.email).toBe('***MASKED***');
    expect(loggedMetadata.body.password).toBe('***MASKED***');
    expect(loggedMetadata.body.phone).toBe('***MASKED***');
    expect(loggedMetadata.body.address).toBe('***MASKED***');
    
    // Non-sensitive fields should NOT be redacted
    expect(loggedMetadata.body.fullName).toBe('John Doe');
  });
});
