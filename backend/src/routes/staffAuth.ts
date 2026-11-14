import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import {
  createStaffSession,
  hashStaffToken,
  resolveUnifiedRole,
  verifyStaffAuth,
  PERMITTED_PUBLICATION_IDS,
} from "../services/staffAuthService.js";
import { verifyPassword } from "../services/passwordService.js";

const loginSchema = z.object({
  email: z.string().email("A valid email address is required").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const staffAuthRoutes: FastifyPluginAsync = async (app) => {
  // Simple in-memory tracker for staff login rate-limiting (max 5 failed attempts per 15 min per IP)
  const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

  /**
   * POST /api/v1/admin/auth/login
   * Authenticates newsroom staff and issues a 24-hour bearer token.
   */
  app.post("/login", async (req, reply) => {
    const ip = req.ip || "127.0.0.1";
    const now = Date.now();
    const attempts = failedAttempts.get(ip);

    if (attempts && attempts.lockedUntil > now) {
      const waitMinutes = Math.ceil((attempts.lockedUntil - now) / 60000);
      return reply.status(429).send({
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: `Too many failed login attempts. Please try again in ${waitMinutes} minutes.`,
        },
      });
    }

    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid input data",
        },
      });
    }

    const { email, password } = parseResult.data;

    const user = await app.prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });

    if (!user || !user.isStaff) {
      // Record failed attempt
      const curr = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
      curr.count += 1;
      if (curr.count >= 5) {
        curr.lockedUntil = now + 15 * 60 * 1000; // 15 min lockout
      }
      failedAttempts.set(ip, curr);

      return reply.status(401).send({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
      });
    }

    if (user.status !== "ACTIVE") {
      return reply.status(403).send({
        success: false,
        error: {
          code: "ACCOUNT_INACTIVE",
          message: `Your staff account is ${user.status.toLowerCase()}. Please contact an administrator.`,
        },
      });
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      const curr = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
      curr.count += 1;
      if (curr.count >= 5) {
        curr.lockedUntil = now + 15 * 60 * 1000;
      }
      failedAttempts.set(ip, curr);

      return reply.status(401).send({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
      });
    }

    // Reset failed attempts on success
    failedAttempts.delete(ip);

    const dbRoles = user.roles.map((r) => r.roleId);
    const unifiedRole = resolveUnifiedRole(dbRoles);

    if (!unifiedRole) {
      return reply.status(403).send({
        success: false,
        error: {
          code: "UNAUTHORIZED_ROLE",
          message: "You do not have staff permissions to access the Admin Panel.",
        },
      });
    }

    // Create session
    const { token, expiresAt } = await createStaffSession(
      app.prisma,
      user.id,
      ip,
      req.headers["user-agent"]
    );

    // Update lastLoginAt
    await app.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return reply.status(200).send({
      success: true,
      data: {
        token,
        expiresAt: expiresAt.toISOString(),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: unifiedRole,
          permittedPublications: PERMITTED_PUBLICATION_IDS,
        },
      },
    });
  });

  /**
   * POST /api/v1/admin/auth/logout
   * Immediately revokes current staff session.
   */
  app.post("/logout", { preHandler: verifyStaffAuth }, async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const tokenHash = hashStaffToken(token);
      await app.prisma.staffSession.deleteMany({
        where: { tokenHash },
      });
    }

    return reply.status(200).send({
      success: true,
      message: "Staff session logged out successfully.",
    });
  });

  /**
   * GET /api/v1/admin/auth/me
   * Returns authenticated staff profile and permissions.
   */
  app.get("/me", { preHandler: verifyStaffAuth }, async (req, reply) => {
    const user = req.staffUser!;
    return reply.status(200).send({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.unifiedRole,
        permittedPublications: PERMITTED_PUBLICATION_IDS,
      },
    });
  });
};
