import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../services/passwordService.js";
import {
  createSubscriberSession,
  verifySubscriberAuth,
  sanitizeSubscriber,
  checkLoginAttempts,
  recordFailedLogin,
  recordSuccessfulLogin,
  hashToken,
} from "../services/subscriberAuthService.js";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(150),
  email: z.string().email("Please provide a valid email address").max(255),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number")
    .optional()
    .nullable(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and privacy policy" }),
  }),
});

const loginSchema = z.object({
  identifier: z.string().min(3, "Please enter your registered email or mobile number"),
  password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
});

export const subscriberAuthRoutes: FastifyPluginAsync = async (app) => {
  // 1. Subscriber Registration
  app.post("/register", async (req, reply) => {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid registration data",
          details: parseResult.error.errors,
        },
      });
    }

    const { fullName, email, mobileNumber, password } = parseResult.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing subscriber with email or mobile
    const existing = await app.prisma.subscriber.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(mobileNumber ? [{ mobileNumber }] : []),
        ],
      },
    });

    if (existing) {
      const isEmailConflict = existing.email === normalizedEmail;
      return reply.status(409).send({
        success: false,
        error: {
          code: isEmailConflict ? "EMAIL_ALREADY_REGISTERED" : "MOBILE_ALREADY_REGISTERED",
          message: isEmailConflict
            ? "An account with this email already exists. Please log in."
            : "An account with this mobile number already exists. Please log in.",
        },
      });
    }

    const passwordHash = await hashPassword(password);

    const subscriber = await app.prisma.subscriber.create({
      data: {
        fullName,
        email: normalizedEmail,
        mobileNumber: mobileNumber || null,
        passwordHash,
        status: "ACTIVE",
        isEmailVerified: false,
      },
    });

    // Create immediate session
    const ipAddress = req.ip || (req.headers["x-forwarded-for"] as string);
    const userAgent = req.headers["user-agent"];
    const session = await createSubscriberSession(app.prisma, subscriber.id, ipAddress, userAgent);

    return reply.status(201).send({
      success: true,
      message: "Subscriber registration successful.",
      token: session.rawToken,
      expiresAt: session.expiresAt.toISOString(),
      subscriber: sanitizeSubscriber(subscriber),
    });
  });

  // 2. Subscriber Login (Brute-force protected)
  app.post("/login", async (req, reply) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid credentials format",
        },
      });
    }

    const { identifier, password } = parseResult.data;
    const cleanId = identifier.trim().toLowerCase();
    const ipAddress = req.ip || (req.headers["x-forwarded-for"] as string);
    const userAgent = req.headers["user-agent"] ? String(req.headers["user-agent"]) : undefined;

    // Check brute force lockout via persistent database audit logs
    const attemptCheck = await checkLoginAttempts(app.prisma, cleanId);
    if (!attemptCheck.allowed) {
      return reply.status(429).send({
        success: false,
        error: {
          code: "ACCOUNT_TEMPORARILY_LOCKED",
          message: `Too many failed login attempts. Please try again in ${attemptCheck.waitMinutes} minute(s).`,
        },
      });
    }

    // Lookup subscriber by email or mobile number
    const subscriber = await app.prisma.subscriber.findFirst({
      where: {
        OR: [
          { email: cleanId },
          { mobileNumber: cleanId },
        ],
      },
    });

    if (!subscriber || !subscriber.passwordHash) {
      await recordFailedLogin(app.prisma, cleanId, ipAddress, userAgent);
      return reply.status(401).send({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Incorrect email/mobile number or password.",
        },
      });
    }

    // Check subscriber status
    if (subscriber.status === "BLOCKED") {
      return reply.status(403).send({
        success: false,
        error: {
          code: "ACCOUNT_SUSPENDED",
          message: "Your subscription account has been suspended. Please contact customer support.",
        },
      });
    }

    // Verify password with constant-time scrypt comparison
    const isValid = await verifyPassword(password, subscriber.passwordHash);
    if (!isValid) {
      await recordFailedLogin(app.prisma, cleanId, ipAddress, userAgent);
      return reply.status(401).send({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Incorrect email/mobile number or password.",
        },
      });
    }

    // Login successful
    await recordSuccessfulLogin(app.prisma, cleanId);

    const session = await createSubscriberSession(app.prisma, subscriber.id, ipAddress, userAgent);

    return reply.status(200).send({
      success: true,
      message: "Login successful.",
      token: session.rawToken,
      expiresAt: session.expiresAt.toISOString(),
      subscriber: sanitizeSubscriber(subscriber),
    });
  });

  // 3. Subscriber Logout
  app.post("/logout", { preHandler: verifySubscriberAuth }, async (req, reply) => {
    const authHeader = req.headers.authorization!;
    const rawToken = authHeader.substring(7);
    const tokenHash = hashToken(rawToken);

    await app.prisma.subscriberSession.deleteMany({
      where: { tokenHash },
    });

    return reply.status(200).send({
      success: true,
      message: "You have been logged out successfully.",
    });
  });

  // 4. Subscriber Profile & Active Subscriptions Summary
  app.get("/me", { preHandler: verifySubscriberAuth }, async (req, reply) => {
    const subscriber = (req as any).subscriber;

    // Fetch active subscriptions with plan details
    const subscriptions = await app.prisma.userSubscription.findMany({
      where: { subscriberId: subscriber.id },
      include: {
        plan: {
          include: { publication: { select: { id: true, nameEn: true, nameGu: true, code: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === "ACTIVE" && s.expiresAt.getTime() > Date.now()
    );

    return reply.status(200).send({
      success: true,
      subscriber: sanitizeSubscriber(subscriber),
      activeSubscriptions: activeSubscriptions.map((s) => ({
        id: s.id,
        planId: s.planId,
        planNameEn: s.plan.nameEn,
        planNameGu: s.plan.nameGu,
        publicationNameEn: s.plan.publication.nameEn,
        publicationNameGu: s.plan.publication.nameGu,
        publicationCode: s.plan.publication.code,
        startsAt: s.startsAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
        daysRemaining: Math.max(0, Math.ceil((s.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        autoRenew: s.autoRenew,
      })),
      allSubscriptionsCount: subscriptions.length,
    });
  });

  // 5. Change Password
  app.post("/change-password", { preHandler: verifySubscriberAuth }, async (req, reply) => {
    const subscriber = (req as any).subscriber;
    const parseResult = changePasswordSchema.safeParse(req.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid password format",
        },
      });
    }

    const { currentPassword, newPassword } = parseResult.data;

    // Fetch stored hash
    const currentSub = await app.prisma.subscriber.findUnique({
      where: { id: subscriber.id },
      select: { passwordHash: true },
    });

    if (!currentSub?.passwordHash) {
      return reply.status(400).send({
        success: false,
        error: { code: "NO_PASSWORD_SET", message: "Account has no password set." },
      });
    }

    const isCurrentValid = await verifyPassword(currentPassword, currentSub.passwordHash);
    if (!isCurrentValid) {
      return reply.status(401).send({
        success: false,
        error: { code: "INVALID_CURRENT_PASSWORD", message: "Current password does not match." },
      });
    }

    const newHash = await hashPassword(newPassword);
    await app.prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { passwordHash: newHash },
    });

    // Revoke all other sessions for security
    const authHeader = req.headers.authorization!;
    const currentTokenHash = hashToken(authHeader.substring(7));
    await app.prisma.subscriberSession.deleteMany({
      where: {
        subscriberId: subscriber.id,
        tokenHash: { not: currentTokenHash },
      },
    });

    return reply.status(200).send({
      success: true,
      message: "Password changed successfully. All other sessions have been logged out.",
    });
  });

  // 6. Automated Password Reset Request (Requires External SMTP / SMS Provider)
  app.post("/forgot-password", async (_req, reply) => {
    return reply.status(501).send({
      success: false,
      error: {
        code: "EMAIL_SERVICE_NOT_CONFIGURED",
        message:
          "Automated password reset via email/SMS is currently unavailable until the transactional messaging provider is configured. Please contact customer support for password assistance.",
      },
    });
  });

  // 7. Reset Password with Token (Requires External SMTP Provider)
  app.post("/reset-password", async (_req, reply) => {
    return reply.status(501).send({
      success: false,
      error: {
        code: "EMAIL_SERVICE_NOT_CONFIGURED",
        message:
          "Password reset link processing is currently unavailable until the transactional messaging provider is configured.",
      },
    });
  });

  // 8. Verify Email Token (Requires External SMTP Provider)
  app.post("/verify-email", async (_req, reply) => {
    return reply.status(501).send({
      success: false,
      error: {
        code: "EMAIL_SERVICE_NOT_CONFIGURED",
        message:
          "Email verification link processing is currently unavailable until the transactional email provider is configured.",
      },
    });
  });
};
