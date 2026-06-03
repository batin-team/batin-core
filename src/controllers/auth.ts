import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Mock DB store for when the main PostgreSQL instance is down/offline in local development
const mockDbUsers = [
  {
    id: 'mock-client-id',
    email: 'client@example.com',
    password: 'password123',
    role: 'CLIENT',
    fullName: 'Test Client'
  },
  {
    id: 'mock-provider-id',
    email: 'psychologist@example.com',
    password: 'password123',
    role: 'PROVIDER',
    fullName: 'Dr. Sarah Jenkins'
  },
  {
    id: 'mock-corporate-id',
    email: 'corporate@example.com',
    password: 'password123',
    role: 'CORPORATE',
    fullName: 'ACME Corporate Sponsor'
  },
  {
    id: 'mock-admin-id',
    email: 'admin@example.com',
    password: 'password123',
    role: 'ADMIN',
    fullName: 'System Administrator'
  }
];

export const register = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }
    const { email, password, role, fullName } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required and must be strings' });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      // In database, corporate maps to CLIENT if enum lacks it
      const dbRole = role === 'CORPORATE' ? 'CLIENT' : (role || 'CLIENT');

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          role: dbRole as any,
          fullName
        }
      });

      return res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
      console.warn('Prisma registration failed, using dev-mock fallback', error);

      const existingMock = mockDbUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingMock) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const newMockUser = {
        id: `mock-user-${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase(),
        password: password,
        role: role || 'CLIENT',
        fullName: fullName || email.split('@')[0]
      };
      mockDbUsers.push(newMockUser);

      return res.status(201).json({ message: 'Mock User registered successfully', userId: newMockUser.id });
    }
  } catch (err: any) {
    console.error('Unhandled error in registration controller:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required and must be strings' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      });

      return res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      console.warn('Prisma login failed, using dev-mock fallback', error);

      const mockUser = mockDbUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!mockUser || mockUser.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: mockUser.id, role: mockUser.role }, JWT_SECRET, { expiresIn: '1d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      });

      return res.status(200).json({ message: 'Mock login successful', user: { id: mockUser.id, email: mockUser.email, role: mockUser.role } });
    }
  } catch (err: any) {
    console.error('Unhandled error in login controller:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};
