# Janmabhoomi — Phase 4 Master Implementation Plan: Razorpay Payment Gateway & Subscriber Authentication

**Date:** November 11, 2026  
**System:** Saurashtra Trust Janmabhoomi Digital Newspaper Platform  
**Architecture:** Next.js 15 App Router Frontend + Fastify 5 TypeScript Backend + PostgreSQL 16 (Prisma) on Docker / Hostinger KVM VPS  
**Status:** Pre-Implementation Architectural Blueprint  

---

## 1. Baseline Audit & Schema Preparedness

An inspection of `backend/prisma/schema.prisma` and the live PostgreSQL database confirms that **all required Phase 4 models already exist in the database**:

1. **`Subscriber`**: Dedicated public customer account entity completely isolated from newsroom staff (`users` table). Includes `id`, `email`, `mobileNumber`, `fullName`, `passwordHash`, `status`, `isEmailVerified`, `isMobileVerified`.
2. **`SubscriberSession`**: Token-based authentication session with SHA-256 `tokenHash`, IP address, User-Agent, and expiry timestamp.
3. **`SubscriptionPlan`**: Configurable pricing tiers (`priceInr`, `billingInterval`, `durationDays`, `featuresEn`, `featuresGu`, `isActive`).
4. **`UserSubscription`**: Tracks active subscriber access (`startsAt`, `expiresAt`, `status: ACTIVE | EXPIRED | CANCELLED`, `autoRenew`).
5. **`RazorpayOrder`**: Tracks order generation with `amountPaise` (integer currency), `currency`, `receipt`, `status: CREATED | ATTEMPTED | PAID | FAILED`, and `source: WEBSITE`.
6. **`PaymentTransaction`**: Tracks payment completion with `razorpayPaymentId`, `razorpaySignature`, `amountPaise`, payment `method` (UPI, card, netbanking), `status: CAPTURED | AUTHORIZED | FAILED | REFUNDED`, and `rawWebhookPayload`.
7. **`RazorpayWebhookLog`**: Idempotency and replay-prevention log storing `eventId`, `eventType`, `isProcessed`, `processError`, and raw payload.

*Zero destructive database migrations are required.* All work is additive, robust, and strictly backward-compatible.

---

## 2. Logical Stage Breakdown

```mermaid
flowchart TD
    subgraph Stage 1: Backend Foundation
        A1[Install Razorpay SDK & Auth Dependencies]
        A2[Update Config & Env Validation]
        A3[Fastify Raw Body Plugin for Webhook Signature]
    end

    subgraph Stage 2: Subscriber Authentication Engine
        B1[Subscriber Password Hashing Service]
        B2[Subscriber Session & Token Management]
        B3[Subscriber Auth Routes: Register, Login, Logout, Profile]
    end

    subgraph Stage 3: Razorpay Payments & Subscriptions
        C1[Order Creation API: Trust DB Price in Paise]
        C2[HMAC-SHA256 Signature Verification API]
        C3[Webhook Handler with Idempotency & Replay Protection]
        C4[Subscription Lifecycle: Activation, Expiry, Renewal]
    end

    subgraph Stage 4: E-Paper & Admin Integration
        D1[E-Paper Paywall Server-Side Subscriber Hook]
        D2[Admin Payment Audit & Transaction History Routes]
    end

    subgraph Stage 5: Frontend Experience
        E1[Subscriber Auth Context & Modals/Pages]
        E2[Subscription Plans & Razorpay Checkout Modal]
        E3[Subscriber Profile & Payment History Dashboard]
    end

    subgraph Stage 6: Security Verification & Audit
        F1[Automated Test Suite: 35+ Scenarios]
        F2[Reports & Setup Guides]
    end

    Stage 1 --> Stage 2
    Stage 2 --> Stage 3
    Stage 3 --> Stage 4
    Stage 4 --> Stage 5
    Stage 5 --> Stage 6
```

---

## Stage-by-Stage Implementation Details

### Stage 1: Backend Foundation & SDK Configuration
- **Dependencies**: Install `razorpay` (v2.9.8) and `@node-rs/argon2` or native `crypto.scrypt` password hashing.
- **Environment Configuration (`backend/src/config/env.ts`)**:
  - `RAZORPAY_KEY_ID`: Razorpay test key ID.
  - `RAZORPAY_KEY_SECRET`: Razorpay test key secret (backend only, never exposed to client).
  - `RAZORPAY_WEBHOOK_SECRET`: Secret used to sign incoming webhook events.
  - `RAZORPAY_MODE`: `test` (defaults to test mode).
- **Fastify Raw Body Plugin**:
  - Webhooks require the exact unparsed HTTP body buffer for HMAC-SHA256 verification. We will register `fastify-raw-body` or a dedicated pre-parsing hook for `/api/v1/payments/webhook`.

### Stage 2: Subscriber Authentication Engine (`backend/src/routes/subscriberAuth.ts`)
- **Isolation**: Public subscribers authenticate against the `subscribers` and `subscriber_sessions` tables. They have **zero access** to newsroom administrative APIs.
- **Password Security**:
  - Passwords hashed using OWASP-compliant Argon2id (or crypto `scrypt` with 32-byte salt).
  - Password hashes never returned in any API response or logged.
- **Session Management**:
  - Generates cryptographically secure 64-character random session tokens.
  - Tokens are hashed with SHA-256 before storage in `subscriber_sessions`.
  - Supports token expiration (30 days default) and explicit revocation on logout.
- **Endpoints**:
  - `POST /api/v1/subscriber/auth/register`: Full name, email, mobile, password, consent.
  - `POST /api/v1/subscriber/auth/login`: Email/mobile + password credential check.
  - `POST /api/v1/subscriber/auth/logout`: Revokes active session.
  - `GET /api/v1/subscriber/auth/me`: Returns sanitized profile and active subscription summary.

### Stage 3: Razorpay Payment & Subscription Order Processing (`backend/src/routes/payments.ts`)
- **Order Creation (`POST /api/v1/payments/create-order`)**:
  1. Authenticates subscriber via `Authorization: Bearer <subscriberToken>`.
  2. Queries `subscription_plans` from PostgreSQL using `planId`.
  3. Verifies `plan.isActive === true`.
  4. Calculates amount in integer paise server-side (`amountPaise = Math.round(plan.priceInr * 100)`). Rejects any client-provided amounts.
  5. Generates unique internal receipt code: `RCPT-<timestamp>-<rand>`.
  6. Calls `razorpay.orders.create({ amount: amountPaise, currency: "INR", receipt, notes: { subscriberId, planId } })`.
  7. Inserts `razorpay_orders` record in PostgreSQL with `status: CREATED`.
  8. Returns `{ orderId, amountPaise, currency: "INR", keyId: env.RAZORPAY_KEY_ID, planName }`.
- **Payment Verification (`POST /api/v1/payments/verify`)**:
  1. Receives `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }`.
  2. Generates expected signature: `HMAC_SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)`.
  3. Executes `crypto.timingSafeEqual` comparison.
  4. In a Prisma `$transaction`:
     - Updates `razorpay_orders` to `status: PAID`.
     - Creates `payment_transactions` record with `status: CAPTURED`.
     - Computes subscription period: `startsAt = NOW()`, `expiresAt = NOW() + plan.durationDays`.
     - If subscriber already has active subscription for the same publication, extends from current `expiresAt`.
     - Creates/Updates `user_subscriptions` to `status: ACTIVE`.
  5. Returns HTTP 200 with subscription confirmation.
- **Webhook Processing (`POST /api/v1/payments/webhook`)**:
  1. Computes `HMAC_SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)`.
  2. Compares with `x-razorpay-signature` header via `crypto.timingSafeEqual`.
  3. Checks `razorpay_webhook_logs` by `eventId` for deduplication.
  4. Handles:
     - `payment.captured` / `order.paid`: Activates subscription if not already activated.
     - `payment.failed`: Records error code and failure description.
     - `refund.created` / `refund.processed`: Updates transaction status to `REFUNDED` and adjusts subscription if applicable.
  5. Returns HTTP 200 `{ status: "ok" }`.

### Stage 4: E-Paper Paywall & Admin Audit
- **E-Paper Paywall Integration (`backend/src/routes/epaper.ts`)**:
  - Gated broadsheet pages (pages 3+) and thumbnails verify `Authorization: Bearer <token>`.
  - Checks if `user_subscriptions` has `status: ACTIVE` and `expiresAt > NOW()`.
  - Immediate real-time access granted once payment is verified.
- **Admin Payment Audit (`backend/src/routes/adminPayments.ts`)**:
  - Protected by `verifyStaffAuth` and `verifyAdminRole` (Admin / Super Admin).
  - Search transactions by subscriber, payment ID, order ID, date range, or status.
  - Read-only historical ledger preserving all PayU and Razorpay audit records.

### Stage 5: Subscriber Frontend Experience
- **Components & Pages (Tailwind CSS, Brand Blue `#016BB7`, English & Gujarati)**:
  - `src/components/auth/SubscriberAuthModal.tsx`: Dual English/Gujarati login and register tab modal.
  - `src/app/[lang]/subscribe/page.tsx`: Subscription plans showcase with monthly/annual tiers, feature comparison, and currency formatting.
  - `src/components/subscription/RazorpayCheckoutButton.tsx`: Loads `https://checkout.razorpay.com/v1/checkout.js` dynamically, launches standard payment drawer, and handles verification response.
  - `src/app/[lang]/account/page.tsx`: Subscriber profile, active subscriptions with expiry countdown, and historical payment receipts.
  - `src/components/epaper/PublicEpaperReader.tsx`: Updated paywall banner with direct "Subscribe to Read" / "Login" actions.

### Stage 6: Security Verification & Documentation
- Comprehensive test suite covering all 35+ scenarios:
  - Signature tampering, replay attacks, duplicate webhooks, out-of-bounds amounts, expired sessions, brute force.
- Reports:
  - `PHASE_4_IMPLEMENTATION_REPORT.md`
  - `PHASE_4_SECURITY_AUDIT.md`
  - `PHASE_4_TEST_RESULTS.md`
  - `RAZORPAY_SETUP_GUIDE.md`
