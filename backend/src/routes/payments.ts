import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { verifySubscriberAuth } from "../services/subscriberAuthService.js";
import { createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature } from "../services/razorpayService.js";
import { activateSubscriptionFromPayment } from "../services/subscriptionService.js";

const createOrderSchema = z.object({
  planId: z.string().min(1, "Subscription Plan ID is required"),
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Razorpay Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Razorpay Payment ID is required"),
  razorpay_signature: z.string().min(1, "Razorpay Signature is required"),
});

export const paymentRoutes: FastifyPluginAsync = async (app) => {
  // 1. Create Razorpay Payment Order
  app.post("/create-order", { preHandler: verifySubscriberAuth }, async (req, reply) => {
    const subscriber = (req as any).subscriber;
    const parseResult = createOrderSchema.safeParse(req.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid order parameters",
        },
      });
    }

    const { planId } = parseResult.data;

    // Server-Side Authoritative Pricing Check:
    // ALWAYS fetch price from PostgreSQL. Any price or amount sent by the client is ignored.
    const plan = await app.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { publication: true },
    });

    if (!plan || !plan.isActive) {
      return reply.status(404).send({
        success: false,
        error: {
          code: "PLAN_NOT_FOUND",
          message: "The requested subscription plan does not exist or is inactive.",
        },
      });
    }

    // Amount strictly in integer paise (e.g. ₹75.00 -> 7500 paise)
    const amountPaise = Math.round(Number(plan.priceInr) * 100);
    const currency = "INR";
    const receipt = `rcpt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder({
        amountPaise,
        currency,
        receipt,
        notes: {
          subscriberId: subscriber.id,
          subscriberEmail: subscriber.email,
          planId: plan.id,
          publicationId: plan.publicationId,
        },
      });
    } catch (gatewayErr: any) {
      req.log.error(gatewayErr);
      return reply.status(502).send({
        success: false,
        error: {
          code: "PAYMENT_GATEWAY_ERROR",
          message: "Unable to initiate payment with Razorpay. Please try again later.",
        },
      });
    }

    // Save order in database
    const order = await app.prisma.razorpayOrder.create({
      data: {
        razorpayOrderId: razorpayOrder.id,
        subscriberId: subscriber.id,
        planId: plan.id,
        amountPaise,
        currency,
        receipt,
        status: "CREATED",
        source: "WEBSITE",
        notes: {
          planNameEn: plan.nameEn,
          planNameGu: plan.nameGu,
          publicationNameEn: plan.publication.nameEn,
          durationDays: plan.durationDays,
        },
      },
    });

    return reply.status(201).send({
      success: true,
      order: {
        id: order.id,
        razorpayOrderId: order.razorpayOrderId,
        amountPaise: order.amountPaise,
        currency: order.currency,
        planNameEn: plan.nameEn,
        planNameGu: plan.nameGu,
        publicationNameEn: plan.publication.nameEn,
        keyId: env.RAZORPAY_KEY_ID, // Expose public key ID for checkout.js modal
      },
    });
  });

  // 2. Verify Razorpay Payment Signature & Activate Subscription
  app.post("/verify", { preHandler: verifySubscriberAuth }, async (req, reply) => {
    const subscriber = (req as any).subscriber;
    const parseResult = verifyPaymentSchema.safeParse(req.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid payment verification data",
        },
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parseResult.data;

    // 1. Look up order in database
    const order = await app.prisma.razorpayOrder.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: {
        plan: {
          include: { publication: true },
        },
      },
    });

    if (!order) {
      return reply.status(404).send({
        success: false,
        error: { code: "ORDER_NOT_FOUND", message: "Razorpay order not found in records." },
      });
    }

    // 2. Payment Ownership Verification: Order MUST belong to authenticated subscriber
    if (order.subscriberId !== subscriber.id) {
      return reply.status(403).send({
        success: false,
        error: { code: "UNAUTHORIZED_ORDER", message: "You are not authorized to verify this order." },
      });
    }

    // 3. Cryptographic Signature Verification using constant-time equality
    const isSignatureValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isSignatureValid) {
      // Mark transaction as failed
      await app.prisma.paymentTransaction.upsert({
        where: { razorpayPaymentId: razorpay_payment_id },
        update: { status: "FAILED", errorDescription: "Invalid HMAC signature" },
        create: {
          orderDbId: order.id,
          subscriberId: subscriber.id,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amountPaise: order.amountPaise,
          currency: order.currency,
          status: "FAILED",
          errorDescription: "Invalid HMAC signature",
        },
      });

      return reply.status(400).send({
        success: false,
        error: {
          code: "INVALID_SIGNATURE",
          message: "Payment verification failed. Digital signature does not match.",
        },
      });
    }

    // 4. Idempotent Subscription Activation within Atomic Transaction
    const { subscription, isAlreadyActivated } = await activateSubscriptionFromPayment(app.prisma, {
      subscriberId: subscriber.id,
      orderDbId: order.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    return reply.status(200).send({
      success: true,
      message: isAlreadyActivated
        ? "Payment already verified and subscription is active."
        : "Payment verified successfully. Subscription activated!",
      subscription: {
        id: subscription.id,
        planNameEn: order.plan.nameEn,
        planNameGu: order.plan.nameGu,
        publicationNameEn: order.plan.publication.nameEn,
        publicationNameGu: order.plan.publication.nameGu,
        startsAt: subscription.startsAt.toISOString(),
        expiresAt: subscription.expiresAt.toISOString(),
        status: subscription.status,
      },
    });
  });

  // 3. Razorpay Webhooks (Idempotent, Replay-Protected)
  app.post("/webhook", async (req, reply) => {
    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      return reply.status(400).send({ error: "Missing x-razorpay-signature header" });
    }

    // Access raw body (configured via fastify-raw-body)
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    const isWebhookValid = verifyWebhookSignature(rawBody, signature);
    if (!isWebhookValid) {
      return reply.status(400).send({ error: "Invalid webhook signature" });
    }

    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const eventId = payload?.event_id || payload?.id || `evt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const eventType = payload?.event || "unknown";

    // Deduplication check
    const existingLog = await app.prisma.razorpayWebhookLog.findUnique({
      where: { eventId },
    });

    if (existingLog && existingLog.isProcessed) {
      return reply.status(200).send({ status: "already_processed" });
    }

    // Record webhook log
    const webhookLog = existingLog || (await app.prisma.razorpayWebhookLog.create({
      data: {
        eventId,
        eventType,
        razorpayOrderId: payload?.payload?.payment?.entity?.order_id || payload?.payload?.order?.entity?.id,
        razorpayPaymentId: payload?.payload?.payment?.entity?.id,
        rawPayload: payload,
        isProcessed: false,
      },
    }));

    try {
      if (eventType === "payment.captured" || eventType === "order.paid") {
        const paymentEntity = payload?.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;
        const paymentId = paymentEntity?.id;

        if (orderId && paymentId) {
          const order = await app.prisma.razorpayOrder.findUnique({
            where: { razorpayOrderId: orderId },
          });

          if (order) {
            await activateSubscriptionFromPayment(app.prisma, {
              subscriberId: order.subscriberId,
              orderDbId: order.id,
              razorpayOrderId: orderId,
              razorpayPaymentId: paymentId,
              method: paymentEntity?.method,
              bank: paymentEntity?.bank,
              wallet: paymentEntity?.wallet,
              vpa: paymentEntity?.vpa,
              rawWebhookPayload: payload,
            });
          }
        }
      } else if (eventType === "payment.failed") {
        const paymentEntity = payload?.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;
        const paymentId = paymentEntity?.id;

        if (orderId && paymentId) {
          const order = await app.prisma.razorpayOrder.findUnique({
            where: { razorpayOrderId: orderId },
          });

          if (order) {
            await app.prisma.paymentTransaction.upsert({
              where: { razorpayPaymentId: paymentId },
              update: {
                status: "FAILED",
                errorCode: paymentEntity?.error_code,
                errorDescription: paymentEntity?.error_description,
                rawWebhookPayload: payload,
              },
              create: {
                orderDbId: order.id,
                subscriberId: order.subscriberId,
                razorpayOrderId: orderId,
                razorpayPaymentId: paymentId,
                amountPaise: order.amountPaise,
                currency: order.currency,
                status: "FAILED",
                errorCode: paymentEntity?.error_code,
                errorDescription: paymentEntity?.error_description,
                rawWebhookPayload: payload,
              },
            });
          }
        }
      } else if (eventType === "refund.processed" || eventType === "payment.refunded") {
        const refundEntity = payload?.payload?.refund?.entity;
        const paymentEntity = payload?.payload?.payment?.entity;
        const paymentId = paymentEntity?.id || refundEntity?.payment_id;

        if (paymentId) {
          const existingTx = await app.prisma.paymentTransaction.findUnique({
            where: { razorpayPaymentId: paymentId },
            include: { order: { include: { plan: true } } },
          });

          if (existingTx) {
            await app.prisma.$transaction(async (tx) => {
              // 1. Update payment transaction to REFUNDED
              await tx.paymentTransaction.update({
                where: { id: existingTx.id },
                data: {
                  status: "REFUNDED",
                  rawWebhookPayload: payload,
                },
              });

              // 2. Enforce Access Revocation on Confirmed Refund:
              // Immediately terminates subscriber broadsheet access by setting status to CANCELLED and expiresAt to now.
              if (existingTx.orderDbId && existingTx.order?.plan) {
                await tx.userSubscription.updateMany({
                  where: {
                    subscriberId: existingTx.subscriberId,
                    plan: { publicationId: existingTx.order.plan.publicationId },
                    status: "ACTIVE",
                  },
                  data: {
                    status: "CANCELLED",
                    expiresAt: new Date(),
                  },
                });
              }
            });
          }
        }
      }

      // Mark log as successfully processed
      await app.prisma.razorpayWebhookLog.update({
        where: { id: webhookLog.id },
        data: { isProcessed: true },
      });

      return reply.status(200).send({ status: "processed" });
    } catch (err: any) {
      app.log.error(err);
      await app.prisma.razorpayWebhookLog.update({
        where: { id: webhookLog.id },
        data: { processError: err?.message || String(err) },
      });
      return reply.status(500).send({ error: "Webhook processing failed" });
    }
  });
};
