import Razorpay from "razorpay";
import crypto from "node:crypto";
import { env } from "../config/env.js";

// Initialize Razorpay SDK instance
export const razorpayClient = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * Creates an order in Razorpay using official SDK.
 * In development / test environments with placeholder sandbox credentials,
 * falls back to a deterministic development stub so that local testing and development
 * can proceed without external network dependencies.
 */
export async function createRazorpayOrder(params: {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string | number>;
}) {
  const currency = params.currency || "INR";

  try {
    return await razorpayClient.orders.create({
      amount: params.amountPaise,
      currency,
      receipt: params.receipt,
      notes: params.notes,
    });
  } catch (err: any) {
    if (
      env.NODE_ENV !== "production" &&
      (env.RAZORPAY_KEY_ID.includes("Janmabhoomi") ||
        err?.statusCode === 401 ||
        err?.error?.description === "Authentication failed")
    ) {
      // Safe development stub for local testing when test keys are placeholders
      const mockOrderId = `order_test_${crypto.randomBytes(8).toString("hex")}`;
      return {
        id: mockOrderId,
        entity: "order",
        amount: params.amountPaise,
        amount_paid: 0,
        amount_due: params.amountPaise,
        currency,
        receipt: params.receipt,
        offer_id: null,
        status: "created",
        attempts: 0,
        notes: params.notes || {},
        created_at: Math.floor(Date.now() / 1000),
      } as any;
    }
    throw err;
  }
}

/**
 * Verifies Razorpay checkout signature:
 * generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret)
 * Uses crypto.timingSafeEqual to prevent timing attacks.
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { orderId, paymentId, signature } = params;
  if (!orderId || !paymentId || !signature) return false;

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");

  try {
    const signatureBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Verifies Razorpay webhook signature:
 * expected_signature = hmac_sha256(raw_body, webhook_secret)
 * Uses crypto.timingSafeEqual on exact raw byte buffers.
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string
): boolean {
  if (!rawBody || !signatureHeader) return false;

  const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, "utf8");
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(bodyBuffer)
    .digest("hex");

  try {
    const signatureBuffer = Buffer.from(signatureHeader.trim(), "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
