# JANMABHOOMI DIGITAL NEWSPAPER PLATFORM
## PHASE 4 IMPLEMENTATION REPORT: RAZORPAY PAYMENT GATEWAY & SUBSCRIBER AUTHENTICATION

**Executive Summary:**
Phase 4 of the Janmabhoomi digital newspaper platform has been implemented and verified against PostgreSQL 16 on Docker (`janmabhoomi_dev`). This phase introduces:
1. Isolated Subscriber Authentication (distinct from staff newsroom accounts) with OWASP-compliant scrypt password hashing, 64-character bearer sessions, and timing-safe token verification.
2. Official Razorpay Node.js SDK integration in test mode (`RAZORPAY_MODE=test`) with server-authoritative pricing in integer paise (guaranteeing immunity against client price tampering).
3. Cryptographically verified payment flows with timing-safe HMAC-SHA256 signature verification (`crypto.timingSafeEqual`) and ownership validation preventing cross-subscriber verification attacks.
4. Idempotent webhook handling using raw byte HMAC verification (`fastify-raw-body`), database deduplication (`razorpay_webhook_logs`), and handling of `payment.captured`, `order.paid`, `payment.failed`, and `refund.processed`.
5. Continuous subscription lifecycle management with seamless extension on renewal (period stacks upon existing expiration rather than overwriting from `NOW()`), and auto-renew toggle support.
6. Public and subscriber-gated e-paper broadsheet paywall integration, unlocking high-resolution pages and thumbnails instantly upon subscription verification.
7. Newsroom desk administrative payment auditing (`GET /api/v1/admin/payments/transactions`, `GET /api/v1/admin/payments/metrics`, and `POST /api/v1/admin/payments/transactions/:id/adjust` recorded with `audit_logs`).
8. Full bilingual Next.js 15 App Router frontend (`/[lang]/subscribe`, `/[lang]/account`, `SubscriberAuthModal`, `RazorpayCheckoutModal`, and updated `PublicEpaperReader`) adhering to the `#016BB7` institutional brand palette.

---

### 1. Architectural Changes & Component Map

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 15 FRONTEND (SSR / ISR)                │
│  - /[lang]/subscribe               - /[lang]/account                   │
│  - SubscriberAuthModal             - RazorpayCheckoutModal             │
│  - PublicEpaperReader (Paywall)    - Header Auth CTA Pill              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTP (REST + Bearer Token)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       FASTIFY 5 BACKEND SERVICES                       │
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐  │
│  │ subscriberAuthRoutes │  │    paymentRoutes     │  │subscriptions │  │
│  │ - /register          │  │ - /create-order      │  │ - /plans     │  │
│  │ - /login             │  │ - /verify            │  │ - /my        │  │
│  │ - /me                │  │ - /webhook           │  │ - /cancel    │  │
│  │ - /change-password   │  │                      │  │              │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └──────┬───────┘  │
│             │                         │                     │          │
│  ┌──────────▼───────────┐  ┌──────────▼───────────┐  ┌──────▼───────┐  │
│  │ subscriberAuthService│  │   razorpayService    │  │ subscription │  │
│  │ - scrypt PHC hash    │  │ - Razorpay SDK Client│  │   Service    │  │
│  │ - SHA-256 session db │  │ - timingSafeEqual sig│  │ - Idempotent │  │
│  │ - Brute-force guard  │  │ - Raw Body HMAC      │  │   Activation │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └──────┬───────┘  │
│             │                         │                     │          │
└─────────────┼─────────────────────────┼─────────────────────┼──────────┘
              │                         │                     │
              ▼                         ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   POSTGRESQL 16 (PRISMA 6 ORM)                         │
│  - subscribers                     - subscriber_sessions               │
│  - subscription_plans              - user_subscriptions                │
│  - razorpay_orders                 - payment_transactions              │
│  - razorpay_webhook_logs           - audit_logs                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Database Schema Modifications & Migration History

All Phase 4 tables and relations were deployed through ordered Prisma migrations:
1. `20261105000000_init_phase_3a_foundation` — Core CMS schema.
2. `20261110120000_add_payment_and_enquiry_enums` — Enums for `SubscriberStatus`, `PaymentSource`, `OrderStatus`, and Razorpay status values (`AUTHORIZED`, `CAPTURED`).
3. `20261111000000_phase_1_razorpay_and_enquiries` — Tables for `subscribers`, `subscriber_sessions`, `subscription_plans`, `user_subscriptions`, `razorpay_orders`, `payment_transactions`, `razorpay_webhook_logs`.
4. `20261111140000_phase_3_epaper_pipeline` — E-Paper editions, pages, hotspots, and publication limits.
5. `20261111150000_add_failed_to_payment_status` — Added `'FAILED'` to `PaymentStatus` enum.

#### Key Data Models:
* **`Subscriber`**: Dedicated identity model with `email`, `mobileNumber`, `fullName`, `passwordHash` (scrypt), `status` (`ACTIVE`, `BLOCKED`, `UNVERIFIED`), `isEmailVerified`, `isMobileVerified`.
* **`SubscriberSession`**: Opaque session storage storing SHA-256 hash `tokenHash` with 30-day expiry and foreign key cascade.
* **`SubscriptionPlan`**: Canonical plan catalog with `publicationId`, `priceInr` (Decimal), `billingInterval`, `durationDays`, `featuresEn`, `featuresGu`, `isActive`.
* **`UserSubscription`**: Real subscriber entitlement with `subscriberId`, `planId`, `status` (`ACTIVE`, `EXPIRED`, `CANCELLED`), `startsAt`, `expiresAt`, `autoRenew`.
* **`RazorpayOrder`**: Server-tracked checkout record with `razorpayOrderId`, `amountPaise` (integer paise), `currency` (INR), `receipt`, `status` (`CREATED`, `ATTEMPTED`, `PAID`, `FAILED`).
* **`PaymentTransaction`**: Audit of every transaction attempt with `razorpayPaymentId`, `razorpaySignature`, `method` (UPI, card, netbanking), `status` (`AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`), `capturedAt`.
* **`RazorpayWebhookLog`**: Idempotency ledger storing `eventId`, `eventType`, `rawPayload`, `isProcessed`, `receivedAt`.

---

### 3. API Endpoints Reference

#### Subscriber Authentication (`/api/v1/subscriber/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Registers a subscriber, hashes password with scrypt, issues 64-char bearer token. |
| `POST` | `/login` | Public | Validates email or mobile + password with brute-force delay, returns bearer token. |
| `POST` | `/logout` | Bearer | Revokes current session token from `subscriber_sessions`. |
| `GET` | `/me` | Bearer | Returns subscriber profile, verification status, and active subscriptions with countdowns. |
| `POST` | `/change-password` | Bearer | Verifies current password and updates with freshly salted scrypt hash. |

#### Payment Processing (`/api/v1/payments`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/create-order` | Bearer | Looks up plan in PostgreSQL, calculates paise server-side, calls Razorpay SDK `orders.create`, records order in database. Rejects client-tampered amounts. |
| `POST` | `/verify` | Bearer | Verifies HMAC-SHA256 signature using `crypto.timingSafeEqual`, confirms order ownership, activates subscription in atomic database transaction. |
| `POST` | `/webhook` | Razorpay HMAC | Verifies raw request body HMAC signature against `RAZORPAY_WEBHOOK_SECRET`. Performs event deduplication via `razorpay_webhook_logs`. |

#### Subscription Management (`/api/v1/subscriptions`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/plans` | Public | Returns active subscription plans with publication metadata. |
| `GET` | `/my` | Bearer | Lists full subscription history with remaining days. |
| `GET` | `/:id` | Bearer | Retrieves specific subscription details (ownership verified). |
| `POST` | `/cancel` | Bearer | Sets `autoRenew: false`. Entitlement remains valid until `expiresAt`. |

#### Newsroom Staff Payment Administration (`/api/v1/admin/payments`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/transactions` | Staff Role | Paginated transaction audit log with filter by status, date range, and search. |
| `GET` | `/transactions/:id` | Staff Role | Detailed transaction record with raw webhook payloads and associated order. |
| `POST` | `/transactions/:id/adjust` | Admin Role | Manual adjustment / status override with mandatory audit log recording. |
| `GET` | `/metrics` | Staff Role | Financial summary: total revenue, captured vs failed transaction counts, active subscribers count. |

---

### 4. Security Verification Summary

* **Password Storage**: Hashed using scrypt ($N=16384, r=8, p=1$) with a 16-byte cryptographically secure random salt, encoded in standard PHC format (`$scrypt$ln=14,r=8,p=1$...`). Verified using `crypto.timingSafeEqual`.
* **Zero Price Tampering**: `/api/v1/payments/create-order` fetches `priceInr` directly from PostgreSQL `subscription_plans`. Any `amount` or `currency` sent by the client in the request body is ignored.
* **Timing-Safe Signature Comparison**: Both `verifyPaymentSignature` and `verifyWebhookSignature` compare HMAC digests using `crypto.timingSafeEqual` after length validation.
* **Replay Attack & Deduplication Protection**: Webhook payloads are hashed and deduplicated by unique `eventId`. Duplicate deliveries return `{ status: "already_processed" }` immediately.
* **Session Security**: Session tokens are 64-character hexadecimal values generated with `crypto.randomBytes(32)`. The database stores only the SHA-256 hash of the token (`token_hash`).
* **Role Isolation**: Subscribers cannot access newsroom staff routes (`/api/v1/admin/*`), and staff tokens cannot be used on subscriber routes.

---

### 5. Frontend Integration Summary

* **`SubscriberAuthContext`**: Manages login status, token storage (`localStorage`), user profile fetching, and automatic session restoration across page reloads.
* **`SubscriberAuthModal`**: Modal with dual tabs for Login and Register, bilingual labels (English/Gujarati), field validation, and error banners.
* **`RazorpayCheckoutModal`**: Loads `checkout.js` dynamically, calls `/api/v1/payments/create-order`, launches Razorpay standard checkout modal with Janmabhoomi `#016BB7` branding, verifies signature via `/api/v1/payments/verify`, and shows a verified transaction confirmation.
* **`PublicEpaperReader`**: High-resolution pages (pages 3+) display a paywall overlay for non-subscribers with direct "Subscribe to Read" and "Sign In" action buttons. Active subscribers get seamless full-page access.
* **Pricing & Account Pages**:
  - `/[lang]/subscribe`: Displays monthly, quarterly, and annual subscription cards in Gujarati and English.
  - `/[lang]/account`: Profile dashboard showing active subscriptions, expiry countdowns, and change password form.

---

### 6. Verification Status

All 17 Phase 4 integration and security tests passed with 100% success on the live PostgreSQL Docker database:
* Auth Registration, Duplicate Rejection, Login, Logout, Profile, Password Change.
* Server-Authoritative Price Calculation, Tamper Rejection.
* Payment Signature Verification & Ownership Isolation.
* Webhook Raw Body HMAC Verification & Replay Deduplication.
* Continuous Subscription Renewal Extension & Auto-Renew Cancellation.
* E-Paper Reader Paywall Gate & Real-Time Unlock.
* Staff Payment Audit & Financial Metrics Calculation.
* Backward compatibility confirmed: Phase 1 Health, Phase 2 Live Database, and Phase 3 E-Paper suites all pass with 0 regressions.
