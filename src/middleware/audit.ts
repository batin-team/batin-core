import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

const maskPII = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  const maskedObj = { ...obj };
  const sensitiveFields = ['password', 'passwordHash', 'email', 'phone', 'phoneNumber', 'address', 'emergencyContact'];
  
  for (const key of Object.keys(maskedObj)) {
    if (sensitiveFields.includes(key)) {
      maskedObj[key] = '***MASKED***';
    } else if (typeof maskedObj[key] === 'object') {
      maskedObj[key] = maskPII(maskedObj[key]);
    }
  }
  return maskedObj;
};

export const auditMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body) {
    const userId = (req as any).user?.id || null;
    const action = `${req.method} ${req.originalUrl}`;
    const entityId = (req.params.id as string) || null;

    const metadata = maskPII({
      query: req.query,
      body: req.body,
      statusCode: res.statusCode
    });

    // Use a background promise to not block the response
    prisma.auditLog.create({
      data: {
        userId,
        action,
        entityId,
        metadata
      }
    }).catch((err: any) => console.error('Audit Log Error:', err));

    return originalSend.apply(res, arguments as any);
  };

  next();
};
