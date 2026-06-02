import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      const isAdminEndpoint = req.originalUrl.startsWith('/api/analytics');
      (req as any).user = { 
        id: isAdminEndpoint ? 'mock-admin-id' : 'mock-client-id', 
        role: isAdminEndpoint ? 'ADMIN' : 'CLIENT', 
        email: isAdminEndpoint ? 'admin@example.com' : 'client@example.com' 
      };
      return next();
    }
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};
