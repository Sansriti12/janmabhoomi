import { PrismaClient, UserSubscription } from "@prisma/client";

export interface ActivationParams {
  subscriberId: string;
  orderDbId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  method?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  cardId?: string;
  rawWebhookPayload?: any;
}

/**
 * Idempotently activates or extends a subscription upon successful payment capture.
 * Wrapped in an atomic database transaction.
 */
export async function activateSubscriptionFromPayment(
  prisma: PrismaClient,
  params: ActivationParams
): Promise<{ subscription: UserSubscription; isAlreadyActivated: boolean }> {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Order and Plan
    const order = await tx.razorpayOrder.findUnique({
      where: { id: params.orderDbId },
      include: { plan: true },
    });

    if (!order) {
      throw new Error(`Order ${params.orderDbId} not found in database`);
    }

    // 2. Check if this payment ID was already processed
    const existingTx = await tx.paymentTransaction.findUnique({
      where: { razorpayPaymentId: params.razorpayPaymentId },
    });

    if (existingTx && existingTx.status === "CAPTURED") {
      // Find existing active subscription
      const existingSub = await tx.userSubscription.findFirst({
        where: {
          subscriberId: params.subscriberId,
          planId: order.planId,
          status: "ACTIVE",
        },
        orderBy: { expiresAt: "desc" },
      });

      if (existingSub) {
        return { subscription: existingSub, isAlreadyActivated: true };
      }
    }

    // 3. Upsert PaymentTransaction record
    if (existingTx) {
      await tx.paymentTransaction.update({
        where: { id: existingTx.id },
        data: {
          status: "CAPTURED",
          method: params.method || existingTx.method,
          bank: params.bank || existingTx.bank,
          wallet: params.wallet || existingTx.wallet,
          vpa: params.vpa || existingTx.vpa,
          cardId: params.cardId || existingTx.cardId,
          capturedAt: new Date(),
          rawWebhookPayload: params.rawWebhookPayload || existingTx.rawWebhookPayload,
        },
      });
    } else {
      await tx.paymentTransaction.create({
        data: {
          orderDbId: order.id,
          subscriberId: params.subscriberId,
          razorpayOrderId: params.razorpayOrderId,
          razorpayPaymentId: params.razorpayPaymentId,
          razorpaySignature: params.razorpaySignature,
          amountPaise: order.amountPaise,
          currency: order.currency,
          status: "CAPTURED",
          method: params.method,
          bank: params.bank,
          wallet: params.wallet,
          vpa: params.vpa,
          cardId: params.cardId,
          source: order.source,
          rawWebhookPayload: params.rawWebhookPayload,
          capturedAt: new Date(),
        },
      });
    }

    // 4. Update RazorpayOrder status to PAID
    await tx.razorpayOrder.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    // 5. Calculate Subscription Dates (Continuity Support)
    const now = new Date();
    const durationMs = order.plan.durationDays * 24 * 60 * 60 * 1000;

    // Check if subscriber currently has an active subscription for this publication
    const currentActive = await tx.userSubscription.findFirst({
      where: {
        subscriberId: params.subscriberId,
        plan: { publicationId: order.plan.publicationId },
        status: "ACTIVE",
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: "desc" },
    });

    let startsAt = now;
    let expiresAt = new Date(now.getTime() + durationMs);

    if (currentActive) {
      // Extend seamlessly from current expiry date
      startsAt = currentActive.startsAt;
      expiresAt = new Date(currentActive.expiresAt.getTime() + durationMs);

      const updatedSub = await tx.userSubscription.update({
        where: { id: currentActive.id },
        data: {
          expiresAt,
          planId: order.planId, // update to latest plan
          status: "ACTIVE",
        },
      });

      return { subscription: updatedSub, isAlreadyActivated: false };
    }

    // Create fresh subscription
    const newSub = await tx.userSubscription.create({
      data: {
        subscriberId: params.subscriberId,
        planId: order.planId,
        status: "ACTIVE",
        startsAt,
        expiresAt,
        autoRenew: false,
      },
    });

    return { subscription: newSub, isAlreadyActivated: false };
  });
}
