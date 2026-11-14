import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { verifySubscriberAuth } from "../services/subscriberAuthService.js";

const cancelSchema = z.object({
  subscriptionId: z.string().uuid("Invalid subscription ID"),
});

export const subscriptionRoutes: FastifyPluginAsync = async (app) => {
  // 1. Get Available Subscription Plans (Public)
  app.get("/plans", async (_req, reply) => {
    const plans = await app.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      include: {
        publication: {
          select: {
            id: true,
            code: true,
            slug: true,
            nameEn: true,
            nameGu: true,
            taglineEn: true,
            taglineGu: true,
            logoAssetPath: true,
            logoPlaceholderCode: true,
          },
        },
      },
      orderBy: [{ publicationId: "asc" }, { priceInr: "asc" }],
    });

    return reply.status(200).send({
      success: true,
      count: plans.length,
      plans: plans.map((p) => ({
        id: p.id,
        publicationId: p.publicationId,
        publicationCode: p.publication.code,
        publicationNameEn: p.publication.nameEn,
        publicationNameGu: p.publication.nameGu,
        nameEn: p.nameEn,
        nameGu: p.nameGu,
        descriptionEn: p.descriptionEn,
        descriptionGu: p.descriptionGu,
        priceInr: Number(p.priceInr),
        pricePaise: Math.round(Number(p.priceInr) * 100),
        billingInterval: p.billingInterval,
        durationDays: p.durationDays,
        featuresEn: p.featuresEn,
        featuresGu: p.featuresGu,
      })),
    });
  });

  // 2. Get Subscriber's Subscriptions (Active & History)
  app.get("/my", { preHandler: verifySubscriberAuth }, async (req, reply) => {
    const subscriber = (req as any).subscriber;

    const subscriptions = await app.prisma.userSubscription.findMany({
      where: { subscriberId: subscriber.id },
      include: {
        plan: {
          include: {
            publication: {
              select: {
                id: true,
                code: true,
                nameEn: true,
                nameGu: true,
                logoPlaceholderCode: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = Date.now();
    return reply.status(200).send({
      success: true,
      subscriptions: subscriptions.map((s) => {
        const isActive = s.status === "ACTIVE" && s.expiresAt.getTime() > now;
        return {
          id: s.id,
          planId: s.planId,
          planNameEn: s.plan.nameEn,
          planNameGu: s.plan.nameGu,
          publicationNameEn: s.plan.publication.nameEn,
          publicationNameGu: s.plan.publication.nameGu,
          publicationCode: s.plan.publication.code,
          startsAt: s.startsAt.toISOString(),
          expiresAt: s.expiresAt.toISOString(),
          status: isActive ? "ACTIVE" : "EXPIRED",
          isCurrentlyValid: isActive,
          autoRenew: s.autoRenew,
          createdAt: s.createdAt.toISOString(),
        };
      }),
    });
  });

  // 3. Get Subscription Details
  app.get("/:id", { preHandler: verifySubscriberAuth }, async (req, reply) => {
    const subscriber = (req as any).subscriber;
    const { id } = req.params as { id: string };

    const subscription = await app.prisma.userSubscription.findFirst({
      where: { id, subscriberId: subscriber.id },
      include: {
        plan: {
          include: {
            publication: true,
          },
        },
      },
    });

    if (!subscription) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Subscription not found" },
      });
    }

    const now = Date.now();
    const isActive = subscription.status === "ACTIVE" && subscription.expiresAt.getTime() > now;

    return reply.status(200).send({
      success: true,
      subscription: {
        id: subscription.id,
        planId: subscription.planId,
        planNameEn: subscription.plan.nameEn,
        planNameGu: subscription.plan.nameGu,
        publicationNameEn: subscription.plan.publication.nameEn,
        publicationNameGu: subscription.plan.publication.nameGu,
        startsAt: subscription.startsAt.toISOString(),
        expiresAt: subscription.expiresAt.toISOString(),
        status: isActive ? "ACTIVE" : "EXPIRED",
        isCurrentlyValid: isActive,
        autoRenew: subscription.autoRenew,
        featuresEn: subscription.plan.featuresEn,
        featuresGu: subscription.plan.featuresGu,
      },
    });
  });

  // 4. Cancel Auto-Renew
  app.post("/cancel", { preHandler: verifySubscriberAuth }, async (req, reply) => {
    const subscriber = (req as any).subscriber;
    const parseResult = cancelSchema.safeParse(req.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Valid subscriptionId is required" },
      });
    }

    const { subscriptionId } = parseResult.data;

    const subscription = await app.prisma.userSubscription.findFirst({
      where: { id: subscriptionId, subscriberId: subscriber.id },
    });

    if (!subscription) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Subscription not found" },
      });
    }

    const updated = await app.prisma.userSubscription.update({
      where: { id: subscription.id },
      data: { autoRenew: false },
    });

    return reply.status(200).send({
      success: true,
      message: "Subscription auto-renewal has been cancelled. Access remains valid until expiry date.",
      expiresAt: updated.expiresAt.toISOString(),
    });
  });
};
