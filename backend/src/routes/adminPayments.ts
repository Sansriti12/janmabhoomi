import { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";

/**
 * Shared Staff Auth Verification for Admin Routes
 */
export async function verifyStaffAuth(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({
      success: false,
      error: { code: "STAFF_AUTH_REQUIRED", message: "A valid staff bearer token is required." },
    });
  }

  const token = authHeader.substring(7);
  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = await req.server.prisma.staffSession.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            roles: { include: { role: true } },
          },
        },
      },
    });

    if (!session || !session.user || session.expiresAt.getTime() < Date.now()) {
      return reply.status(401).send({
        success: false,
        error: { code: "INVALID_STAFF_TOKEN", message: "Staff session is invalid or expired." },
      });
    }

    const roles = session.user.roles.map((ur: { role: { id: string } }) => ur.role.id);
    (req as any).staffUser = session.user;
    (req as any).staffRoles = roles;
  } catch (err: any) {
    req.log.error(err);
    return reply.status(500).send({ error: "Staff authentication error" });
  }
}

/**
 * Only Super Admin and Administrator can access payment management
 */
export async function verifyAdminOrSupportRole(req: FastifyRequest, reply: FastifyReply) {
  await verifyStaffAuth(req, reply);
  if (reply.sent) return;

  const roles: string[] = (req as any).staffRoles || [];
  const permitted = roles.some((r) =>
    ["super_admin", "administrator", "ad_manager", "support"].includes(r)
  );

  if (!permitted) {
    return reply.status(403).send({
      success: false,
      error: { code: "ADMIN_ROLE_REQUIRED", message: "Only administrators can access payment data." },
    });
  }
}

const auditAdjustmentSchema = z.object({
  status: z.enum(["CAPTURED", "REFUNDED", "FAILED"]),
  reason: z.string().min(10, "A detailed reason (min 10 characters) is mandatory for financial adjustments"),
});

export const adminPaymentRoutes: FastifyPluginAsync = async (app) => {
  // 1. List / Search Payment Transactions
  app.get("/transactions", { preHandler: verifyAdminOrSupportRole }, async (req, reply) => {
    const query = req.query as {
      search?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      limit?: string;
      page?: string;
    };

    const take = Math.min(Math.max(parseInt(query.limit || "25", 10), 1), 100);
    const page = Math.max(parseInt(query.page || "1", 10), 1);
    const skip = (page - 1) * take;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { razorpayPaymentId: { contains: s, mode: "insensitive" } },
        { razorpayOrderId: { contains: s, mode: "insensitive" } },
        { subscriber: { email: { contains: s, mode: "insensitive" } } },
        { subscriber: { fullName: { contains: s, mode: "insensitive" } } },
        { subscriber: { mobileNumber: { contains: s, mode: "insensitive" } } },
      ];
    }

    const [total, transactions] = await Promise.all([
      app.prisma.paymentTransaction.count({ where }),
      app.prisma.paymentTransaction.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          subscriber: {
            select: { id: true, email: true, fullName: true, mobileNumber: true },
          },
          order: {
            select: { id: true, planId: true, receipt: true, plan: { select: { nameEn: true, nameGu: true } } },
          },
        },
      }),
    ]);

    return reply.status(200).send({
      success: true,
      total,
      page,
      limit: take,
      transactions: transactions.map((t) => ({
        id: t.id,
        orderId: t.razorpayOrderId,
        paymentId: t.razorpayPaymentId,
        amountInr: t.amountPaise / 100,
        amountPaise: t.amountPaise,
        currency: t.currency,
        status: t.status,
        method: t.method || "N/A",
        bank: t.bank || null,
        vpa: t.vpa || null,
        subscriberName: t.subscriber.fullName,
        subscriberEmail: t.subscriber.email,
        subscriberMobile: t.subscriber.mobileNumber,
        planNameEn: t.order?.plan?.nameEn || "N/A",
        receipt: t.order?.receipt || "N/A",
        capturedAt: t.capturedAt ? t.capturedAt.toISOString() : null,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  });

  // 2. Transaction Details (Sanitized for Admin and Support Staff Triage)
  app.get("/transactions/:id", { preHandler: verifyAdminOrSupportRole }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const transaction = await app.prisma.paymentTransaction.findUnique({
      where: { id },
      include: {
        subscriber: {
          select: {
            id: true,
            email: true,
            fullName: true,
            mobileNumber: true,
            status: true,
            isEmailVerified: true,
            isMobileVerified: true,
            createdAt: true,
          },
        },
        order: {
          include: {
            plan: { include: { publication: true } },
          },
        },
      },
    });

    if (!transaction) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Transaction record not found" },
      });
    }

    // Exclude password hashes, cryptographic signatures and raw webhook payloads from triage response
    const sanitizedTransaction = {
      id: transaction.id,
      orderDbId: transaction.orderDbId,
      subscriberId: transaction.subscriberId,
      razorpayOrderId: transaction.razorpayOrderId,
      razorpayPaymentId: transaction.razorpayPaymentId,
      amountPaise: transaction.amountPaise,
      amountInr: transaction.amountPaise / 100,
      currency: transaction.currency,
      status: transaction.status,
      method: transaction.method,
      bank: transaction.bank,
      wallet: transaction.wallet,
      vpa: transaction.vpa,
      cardId: transaction.cardId,
      source: transaction.source,
      errorCode: transaction.errorCode,
      errorDescription: transaction.errorDescription,
      capturedAt: transaction.capturedAt,
      createdAt: transaction.createdAt,
      subscriber: transaction.subscriber,
      order: transaction.order,
    };

    return reply.status(200).send({
      success: true,
      transaction: sanitizedTransaction,
    });
  });

  // 3. Super-Admin Audited Manual Status Correction (Strict Audit Log Required)
  app.post("/transactions/:id/adjust", { preHandler: verifyAdminOrSupportRole }, async (req, reply) => {
    const staffRoles: string[] = (req as any).staffRoles || [];
    if (!staffRoles.includes("super_admin") && !staffRoles.includes("administrator")) {
      return reply.status(403).send({
        success: false,
        error: { code: "SUPER_ADMIN_REQUIRED", message: "Only Super Administrators can adjust payment records" },
      });
    }

    const { id } = req.params as { id: string };
    const parseResult = auditAdjustmentSchema.safeParse(req.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parseResult.error.errors[0]?.message },
      });
    }

    const { status, reason } = parseResult.data;
    const staffUser = (req as any).staffUser;

    const existingTx = await app.prisma.paymentTransaction.findUnique({
      where: { id },
    });

    if (!existingTx) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Transaction not found" },
      });
    }

    const previousStatus = existingTx.status;

    // Transactionally update status and write audit log
    const updated = await app.prisma.$transaction(async (tx) => {
      const t = await tx.paymentTransaction.update({
        where: { id },
        data: { status },
      });

      // If status adjusted to REFUNDED, immediately revoke associated subscription
      if (status === "REFUNDED") {
        const order = await tx.razorpayOrder.findUnique({
          where: { id: existingTx.orderDbId },
        });
        if (order) {
          await tx.userSubscription.updateMany({
            where: {
              subscriberId: existingTx.subscriberId,
              planId: order.planId,
              status: "ACTIVE",
            },
            data: {
              status: "CANCELLED",
              expiresAt: new Date(),
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: staffUser.id,
          action: "PAYMENT_STATUS_MANUAL_ADJUSTMENT",
          entityName: "payment_transactions",
          entityId: id,
          oldValues: { status: previousStatus },
          newValues: { status, reason, adjustedBy: staffUser.email },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"] ? String(req.headers["user-agent"]) : null,
        },
      });

      return t;
    });

    return reply.status(200).send({
      success: true,
      message: `Transaction ${id} status updated from ${previousStatus} to ${status}. Change has been recorded in audit logs.`,
      transaction: updated,
    });
  });

  // 4. Financial Summary Metrics
  app.get("/metrics", { preHandler: verifyAdminOrSupportRole }, async (_req, reply) => {
    const [totalCaptured, totalRefunded, totalFailed, totalCount] = await Promise.all([
      app.prisma.paymentTransaction.aggregate({
        where: { status: "CAPTURED" },
        _sum: { amountPaise: true },
        _count: true,
      }),
      app.prisma.paymentTransaction.aggregate({
        where: { status: "REFUNDED" },
        _sum: { amountPaise: true },
        _count: true,
      }),
      app.prisma.paymentTransaction.count({ where: { status: "FAILED" } }),
      app.prisma.paymentTransaction.count(),
    ]);

    const activeSubscribersCount = await app.prisma.userSubscription.count({
      where: {
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
      },
    });

    return reply.status(200).send({
      success: true,
      metrics: {
        totalRevenueInr: (totalCaptured._sum.amountPaise || 0) / 100,
        capturedTransactionsCount: totalCaptured._count,
        refundedAmountInr: (totalRefunded._sum.amountPaise || 0) / 100,
        refundedTransactionsCount: totalRefunded._count,
        failedTransactionsCount: totalFailed,
        totalTransactionsCount: totalCount,
        activeSubscribersCount,
      },
    });
  });
};
