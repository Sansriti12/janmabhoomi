import crypto from "node:crypto";
import { PrismaClient, Subscriber } from "@prisma/client";
import { FastifyRequest, FastifyReply } from "fastify";

const SESSION_DURATION_DAYS = 30;

// Database-backed rate limiting / Brute force tracker (persists across backend restarts)
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function checkLoginAttempts(
  prisma: PrismaClient,
  identifier: string
): Promise<{ allowed: boolean; waitMinutes?: number }> {
  const cleanId = identifier.trim().toLowerCase();
  const windowStart = new Date(Date.now() - LOCKOUT_MS);

  // Count failed login attempts within the lockout window from audit_logs
  const failedCount = await prisma.auditLog.count({
    where: {
      entityName: "subscriber_auth",
      entityId: cleanId,
      action: "LOGIN_FAILED",
      createdAt: { gte: windowStart },
    },
  });

  if (failedCount >= MAX_ATTEMPTS) {
    const latestAttempt = await prisma.auditLog.findFirst({
      where: {
        entityName: "subscriber_auth",
        entityId: cleanId,
        action: "LOGIN_FAILED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (latestAttempt) {
      const lockExpiry = latestAttempt.createdAt.getTime() + LOCKOUT_MS;
      const remainingMs = lockExpiry - Date.now();
      if (remainingMs > 0) {
        return {
          allowed: false,
          waitMinutes: Math.max(1, Math.ceil(remainingMs / 60000)),
        };
      }
    }
  }

  return { allowed: true };
}

export async function recordFailedLogin(
  prisma: PrismaClient,
  identifier: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const cleanId = identifier.trim().toLowerCase();
  await prisma.auditLog.create({
    data: {
      action: "LOGIN_FAILED",
      entityName: "subscriber_auth",
      entityId: cleanId,
      ipAddress: ipAddress ? ipAddress.substring(0, 45) : null,
      userAgent: userAgent ? userAgent.substring(0, 500) : null,
      newValues: { attemptedAt: new Date().toISOString() },
    },
  });
}

export async function recordSuccessfulLogin(
  prisma: PrismaClient,
  identifier: string
): Promise<void> {
  const cleanId = identifier.trim().toLowerCase();
  // Clean up failed attempts for this identifier so subscriber has clean slate
  await prisma.auditLog.deleteMany({
    where: {
      entityName: "subscriber_auth",
      entityId: cleanId,
      action: "LOGIN_FAILED",
    },
  }).catch(() => {});
}

/**
 * Creates a cryptographically random session token for a subscriber,
 * hashes it using SHA-256 for database storage, and returns the raw bearer token.
 */
export async function createSubscriberSession(
  prisma: PrismaClient,
  subscriberId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = "sub_" + crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.subscriberSession.create({
    data: {
      subscriberId,
      tokenHash,
      ipAddress: ipAddress?.substring(0, 50),
      userAgent: userAgent ? userAgent.substring(0, 500) : null,
      expiresAt,
    },
  });

  // Update subscriber lastLoginAt timestamp
  await prisma.subscriber.update({
    where: { id: subscriberId },
    data: { lastLoginAt: new Date() },
  });

  return { rawToken, expiresAt };
}

/**
 * Computes a SHA-256 hash of a bearer token for safe lookup in the database.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
}

/**
 * Validates a subscriber bearer token and returns the active subscriber if valid.
 */
export async function validateSubscriberToken(
  prisma: PrismaClient,
  rawToken: string
): Promise<{ subscriber: Subscriber; sessionExpiresAt: Date } | null> {
  if (!rawToken || typeof rawToken !== "string" || !rawToken.startsWith("sub_")) {
    return null;
  }

  const tokenHash = hashToken(rawToken);
  const session = await prisma.subscriberSession.findUnique({
    where: { tokenHash },
    include: { subscriber: true },
  });

  if (!session) return null;

  // Check if session has expired
  if (session.expiresAt.getTime() < Date.now()) {
    // Delete expired session
    await prisma.subscriberSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // Check if subscriber is active
  if (session.subscriber.status !== "ACTIVE") {
    return null;
  }

  return {
    subscriber: session.subscriber,
    sessionExpiresAt: session.expiresAt,
  };
}

/**
 * Fastify pre-handler hook to authenticate requests requiring subscriber identity.
 * Attaches authenticated subscriber to req.subscriber.
 */
export async function verifySubscriberAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({
      success: false,
      error: {
        code: "SUBSCRIBER_AUTH_REQUIRED",
        message: "A valid subscriber bearer token is required.",
      },
    });
  }

  const token = authHeader.substring(7);
  const authResult = await validateSubscriberToken(req.server.prisma, token);

  if (!authResult) {
    return reply.status(401).send({
      success: false,
      error: {
        code: "INVALID_OR_EXPIRED_TOKEN",
        message: "Your subscriber session is invalid or has expired. Please log in again.",
      },
    });
  }

  // Attach to request
  (req as any).subscriber = authResult.subscriber;
  (req as any).subscriberSessionExpiresAt = authResult.sessionExpiresAt;
}

/**
 * Strips passwordHash and internal sensitive fields from subscriber response.
 */
export function sanitizeSubscriber(subscriber: Subscriber) {
  const { passwordHash: _discarded, ...safeProfile } = subscriber;
  return safeProfile;
}
