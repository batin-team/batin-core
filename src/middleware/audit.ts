import { prisma } from "../db";
import { MiddlewareHandler } from "hono";

export function maskMetadata(val: any): any {
  if (val === null || val === undefined) return val;
  if (typeof val !== "object") return val;
  if (Array.isArray(val)) {
    return val.map(maskMetadata);
  }
  const result: Record<string, any> = {};
  for (const key of Object.keys(val)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("email") ||
      lowerKey.includes("address") ||
      lowerKey.includes("phone")
    ) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = maskMetadata(val[key]);
    }
  }
  return result;
}

export async function logAudit(params: {
  userId?: string | null;
  action: string;
  entityId?: string | null;
  metadata?: any;
}) {
  const maskedMetadata = params.metadata ? maskMetadata(params.metadata) : null;
  return prisma.auditLog.create({
    data: {
      userId: params.userId || null,
      action: params.action,
      entityId: params.entityId || null,
      metadata: maskedMetadata,
    },
  });
}

// Optional Hono middleware to intercept and log request metadata
export const auditMiddleware = (action: string): MiddlewareHandler => {
  return async (c, next) => {
    const userId = c.req.header("x-user-id") || null;
    let requestBody: any = null;
    try {
      const clone = c.req.raw.clone();
      requestBody = await clone.json().catch(() => null);
    } catch {
      // Body may not be JSON
    }

    await next();

    // Log after execution
    const responseStatus = c.res.status;
    await logAudit({
      userId,
      action,
      metadata: {
        method: c.req.method,
        url: c.req.url,
        status: responseStatus,
        body: requestBody
      }
    });
  };
};
