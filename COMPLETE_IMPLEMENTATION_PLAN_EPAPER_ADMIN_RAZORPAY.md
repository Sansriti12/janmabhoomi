# JANMABHOOMI GROUP DIGITAL NEWSPAPER
## Complete Backend, Database, E-Paper, Razorpay & Admin Panel Implementation Plan

**Document ID:** DOC-PLAN-MASTER-001  
**Date:** 11 November 2026  
**Engineering Custodian:** Lead Full-Stack Software Engineer (Frontend & Backend Custodian)  
**Organization:** Saurashtra Trust  
**Technology Stack:** Next.js 15 (React 19, TS), Fastify 5 (TS), PostgreSQL 16, Prisma 6.4.1, Razorpay, Hostinger KVM VPS  

---

## 1. System Architecture Overview

```
                      SAURASHTRA TRUST DIGITAL NEWSPAPER PLATFORM
                                           │
       ┌───────────────────────────────────┴───────────────────────────────────┐
       ▼                                                                       ▼
PUBLIC WEBSITE & E-PAPER (Next.js 15)                       STAFF ADMIN DESK (Next.js / Fastify)
- Gujarati & English Broadsheet Portal                       - Newsroom Editorial Workflow (CMS)
- Gated E-Paper Interactive Viewer Canvas                   - Pre-Press PDF Uploader & Hotspot Mapper
- Subscriber Account & Checkout Modal                       - Archive Enquiry Processing Desk
- Razorpay Checkout SDK (Client-Side)                       - Subscriber & Payment Ledger
       │                                                                       │
       └───────────────────────────────────┬───────────────────────────────────┘
                                           │ HTTPS (Let's Encrypt TLS 1.3)
                                           ▼
                    NGINX REVERSE PROXY & MEDIA CACHE (Port 80/443)
                    - /api/          ──► Fastify Backend (127.0.0.1:4000)
                    - /uploads/      ──► Direct Static NVMe Disk Delivery
                    - /              ──► Next.js App (127.0.0.1:3000)
                                           │
                                           ▼
                      FASTIFY 5 MODULAR MONOLITH BACKEND (Port 4000)
       ┌───────────────────────────────────┼───────────────────────────────────┐
       ▼                                   ▼                                   ▼
CORE REST CONTROLLERS             RAZORPAY PAYMENT ENGINE             E-PAPER INGESTION WORKER
- Articles, Categories, Panchang  - Server Order Generation           - Pre-Press PDF Ingestion
- Bilingual Translation Service   - HMAC-SHA256 Verification          - Poppler Rasterizer (300 DPI)
- Staff Auth (Argon2id + Session) - Webhook Idempotency Handler       - Sharp WebP / JPEG Thumbnailer
- Archive & Contact Enquiries     - Subscription Activation Worker    - Vector Bounding Box Mapper
       │                                   │                                   │
       └───────────────────────────────────┼───────────────────────────────────┘
                                           │ Prisma ORM 6.4.1 (Connection Pool: 25)
                                           ▼
                       POSTGRESQL 16 PRODUCTION DATABASE (Port 5432)
                       - Multi-Tenant Schema (8 Saurashtra Trust Publications)
                       - Relational News, Taxonomies, Staff RBAC, Subscriptions
                       - Razorpay Order & Payment Audit Trails
                       - JSONB Bilingual Stores & Full-Text Trigram Indexes
```

---

## 2. Complete Database Table & Relationship Plan (Replacing PayU with Razorpay)

### 2.1 Audit of Existing Schema vs Required Modifications

1. **Retain Intact:**
   - `Publication`: All 8 Saurashtra Trust publications with existing IDs (`pub-janmabhoomi`, `pub-kutchmitra`, `pub-phulchhab`, `pub-vyapar-gu`, `pub-vyapar-hi`, `pub-pravasi`, `pub-panchang`, `pub-kavita`).
   - `Category`, `PublicationCategory`: Existing 12 news categories.
   - `Author`, `Tag`, `ArticleTag`.
   - `Article`, `ArticleTranslation`: Bilingual news architecture (Gujarati & English).
   - `Editorial`: Daily institutional opinion pieces (અગ્રલેખ).
   - `PanchangDaily`: Daily astronomical data.
   - `User`, `StaffSession`, `Role`, `Permission`, `RolePermission`, `UserRole`: Staff RBAC and persistent sessions.
   - `AuditLog`: Immutable action audit trail.
2. **Remove & Replace:**
   - ❌ **Remove PayU models/columns:** Drop `requestHash`, `responseHash`, and PayU-specific fields from `PaymentTransaction`.
   - ✅ **Implement Razorpay Tables:** Create `RazorpayOrder` and revise `PaymentTransaction` with Razorpay fields (`razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `paymentSource`).
3. **Add Missing Models:**
   - ✅ `SubscriberUser`: Dedicated table for public subscribers (separate from internal newsroom `users`).
   - ✅ `ArchiveEnquiry`: Manages public archive requests submitted via `/archive-enquiry`.
   - ✅ `ContactEnquiry`: Manages general feedback submitted via `/contact`.
   - ✅ `RazorpayWebhookLog`: Stores all raw inbound webhook events for replay protection and auditability.

---

### 2.2 Revised Prisma Schema Specification

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============================================================================
// 1. TENANCY & PUBLICATIONS (PRESERVED)
// ============================================================================
enum PublicationType {
  DAILY_NEWSPAPER
  BIWEEKLY_NEWSPAPER
  WEEKLY_NEWSPAPER
  MAGAZINE
  ALMANAC
}

enum PublicationStatus {
  ACTIVE
  PLANNED
  ARCHIVED
}

model Publication {
  id                      String            @id @db.VarChar(50) // 'pub-janmabhoomi', etc.
  code                    String            @unique @db.VarChar(10)
  slug                    String            @unique @db.VarChar(60)
  publicationType         PublicationType   @default(DAILY_NEWSPAPER) @map("publication_type")
  nameEn                  String            @map("name_en") @db.VarChar(100)
  nameGu                  String            @map("name_gu") @db.VarChar(100)
  taglineEn               String?           @map("tagline_en") @db.VarChar(255)
  taglineGu               String?           @map("tagline_gu") @db.VarChar(255)
  frequencyEn             String            @map("frequency_en") @db.VarChar(100)
  frequencyGu             String            @map("frequency_gu") @db.VarChar(100)
  establishedYear         Int               @map("established_year")
  primaryCity             String            @map("primary_city") @db.VarChar(50)
  websiteUrl              String            @map("website_url") @db.VarChar(255)
  epaperUrl               String            @map("epaper_url") @db.VarChar(255)
  logoAssetPath           String?           @map("logo_asset_path") @db.VarChar(255)
  logoPlaceholderCode     String            @map("logo_placeholder_code") @db.VarChar(20)
  epaperFreePreviewPages  Int               @default(0) @map("epaper_free_preview_pages")
  settings                Json              @default("{}")
  status                  PublicationStatus @default(PLANNED)
  createdAt               DateTime          @default(now()) @map("created_at")
  updatedAt               DateTime          @updatedAt @map("updated_at")

  categories              PublicationCategory[]
  articles                Article[]
  editorials              Editorial[]
  epaperEditions          EPaperEdition[]
  subscriptionPlans       SubscriptionPlan[]
  advertisements          Advertisement[]
  userRoles               UserRole[]
  archiveEnquiries        ArchiveEnquiry[]

  @@map("publications")
}

// ============================================================================
// 2. SUBSCRIBER ACCOUNTS (SEPARATED FROM STAFF NEWSROOM USERS)
// ============================================================================
enum SubscriberStatus {
  ACTIVE
  BLOCKED
  UNVERIFIED
}

model Subscriber {
  id                String            @id @default(uuid()) @db.Uuid
  email             String            @unique @db.VarChar(255)
  mobileNumber      String?           @unique @map("mobile_number") @db.VarChar(20)
  fullName          String            @map("full_name") @db.VarChar(150)
  passwordHash      String?           @map("password_hash") @db.VarChar(255) // Optional if OTP-first
  status            SubscriberStatus  @default(ACTIVE)
  isEmailVerified   Boolean           @default(false) @map("is_email_verified")
  isMobileVerified  Boolean           @default(false) @map("is_mobile_verified")
  lastLoginAt       DateTime?         @map("last_login_at")
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")

  subscriptions     UserSubscription[]
  orders            RazorpayOrder[]
  transactions      PaymentTransaction[]
  sessions          SubscriberSession[]

  @@map("subscribers")
}

model SubscriberSession {
  id            String      @id @default(uuid()) @db.Uuid
  subscriberId  String      @map("subscriber_id") @db.Uuid
  tokenHash     String      @unique @map("token_hash") @db.VarChar(255)
  ipAddress     String?     @map("ip_address") @db.VarChar(50)
  userAgent     String?     @map("user_agent") @db.Text
  expiresAt     DateTime    @map("expires_at")
  createdAt     DateTime    @default(now()) @map("created_at")

  subscriber    Subscriber  @relation(fields: [subscriberId], references: [id], onDelete: Cascade)

  @@index([subscriberId])
  @@map("subscriber_sessions")
}

// ============================================================================
// 3. SUBSCRIPTION PLANS & USER SUBSCRIPTIONS
// ============================================================================
enum BillingInterval {
  MONTHLY
  QUARTERLY
  BIANNUAL
  ANNUAL
}

model SubscriptionPlan {
  id                String            @id @db.VarChar(50)
  publicationId     String            @map("publication_id") @db.VarChar(50)
  nameEn            String            @map("name_en") @db.VarChar(100)
  nameGu            String            @map("name_gu") @db.VarChar(100)
  descriptionEn     String?           @map("description_en") @db.Text
  descriptionGu     String?           @map("description_gu") @db.Text
  priceInr          Decimal           @map("price_inr") @db.Decimal(10, 2)
  billingInterval   BillingInterval   @map("billing_interval")
  durationDays      Int               @map("duration_days")
  featuresEn        Json              @default("[]") @map("features_en")
  featuresGu        Json              @default("[]") @map("features_gu")
  isActive          Boolean           @default(true) @map("is_active")
  createdAt         DateTime          @default(now()) @map("created_at")

  publication       Publication       @relation(fields: [publicationId], references: [id])
  subscriptions     UserSubscription[]
  orders            RazorpayOrder[]

  @@map("subscription_plans")
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
}

model UserSubscription {
  id              String              @id @default(uuid()) @db.Uuid
  subscriberId    String              @map("subscriber_id") @db.Uuid
  planId          String              @map("plan_id") @db.VarChar(50)
  status          SubscriptionStatus  @default(ACTIVE)
  startsAt        DateTime            @map("starts_at")
  expiresAt       DateTime            @map("expires_at")
  orderId         String?             @map("order_id") @db.Uuid
  paymentId       String?             @map("payment_id") @db.Uuid
  autoRenew       Boolean             @default(false) @map("auto_renew")
  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")

  subscriber      Subscriber          @relation(fields: [subscriberId], references: [id], onDelete: Cascade)
  plan            SubscriptionPlan    @relation(fields: [planId], references: [id])

  @@index([subscriberId, status, expiresAt])
  @@map("user_subscriptions")
}

// ============================================================================
// 4. RAZORPAY PAYMENT & ORDER LEDGER (REPLACING PAYU)
// ============================================================================
enum PaymentSource {
  WEBSITE
  ANDROID_APP
  IOS_APP
  MANUAL_ADMIN
}

enum OrderStatus {
  CREATED
  ATTEMPTED
  PAID
  FAILED
}

model RazorpayOrder {
  id                String            @id @default(uuid()) @db.Uuid
  razorpayOrderId   String            @unique @map("razorpay_order_id") @db.VarChar(100)
  subscriberId      String            @map("subscriber_id") @db.Uuid
  planId            String            @map("plan_id") @db.VarChar(50)
  amountPaise       Int               @map("amount_paise") // 7500 = ₹75.00
  currency          String            @default("INR") @db.VarChar(10)
  receipt           String            @unique @db.VarChar(100)
  status            OrderStatus       @default(CREATED)
  source            PaymentSource     @default(WEBSITE)
  notes             Json              @default("{}")
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")

  subscriber        Subscriber        @relation(fields: [subscriberId], references: [id])
  plan              SubscriptionPlan  @relation(fields: [planId], references: [id])
  transactions      PaymentTransaction[]

  @@map("razorpay_orders")
}

enum PaymentStatus {
  AUTHORIZED
  CAPTURED
  FAILED
  REFUNDED
}

model PaymentTransaction {
  id                    String            @id @default(uuid()) @db.Uuid
  orderDbId             String            @map("order_db_id") @db.Uuid
  subscriberId          String            @map("subscriber_id") @db.Uuid
  razorpayOrderId       String            @map("razorpay_order_id") @db.VarChar(100)
  razorpayPaymentId     String            @unique @map("razorpay_payment_id") @db.VarChar(100)
  razorpaySignature     String?           @map("razorpay_signature") @db.VarChar(255)
  amountPaise           Int               @map("amount_paise")
  currency              String            @default("INR") @db.VarChar(10)
  status                PaymentStatus     @default(CAPTURED)
  method                String?           @db.VarChar(50) // 'upi', 'card', 'netbanking'
  bank                  String?           @db.VarChar(50)
  wallet                String?           @db.VarChar(50)
  vpa                   String?           @db.VarChar(100) // UPI VPA
  cardId                String?           @map("card_id") @db.VarChar(100)
  source                PaymentSource     @default(WEBSITE)
  errorCode             String?           @map("error_code") @db.VarChar(100)
  errorDescription      String?           @map("error_description") @db.Text
  rawWebhookPayload     Json?             @map("raw_webhook_payload")
  capturedAt            DateTime?         @map("captured_at")
  createdAt             DateTime          @default(now()) @map("created_at")

  order                 RazorpayOrder     @relation(fields: [orderDbId], references: [id])
  subscriber            Subscriber        @relation(fields: [subscriberId], references: [id])

  @@index([razorpayOrderId])
  @@index([subscriberId])
  @@map("payment_transactions")
}

model RazorpayWebhookLog {
  id                String      @id @default(uuid()) @db.Uuid
  eventId           String      @unique @map("event_id") @db.VarChar(100)
  eventType         String      @map("event_type") @db.VarChar(100) // 'payment.captured', 'order.paid'
  razorpayOrderId   String?     @map("razorpay_order_id") @db.VarChar(100)
  razorpayPaymentId String?     @map("razorpay_payment_id") @db.VarChar(100)
  rawPayload        Json        @map("raw_payload")
  isProcessed       Boolean     @default(false) @map("is_processed")
  processError      String?     @map("process_error") @db.Text
  receivedAt        DateTime    @default(now()) @map("received_at")

  @@index([eventId])
  @@map("razorpay_webhook_logs")
}

// ============================================================================
// 5. ARCHIVED INFORMATION ENQUIRIES & CONTACT MANAGEMENT
// ============================================================================
enum EnquiryStatus {
  PENDING
  IN_REVIEW
  RESEARCHING
  CONTACTED
  COMPLETED
  REJECTED
}

model ArchiveEnquiry {
  id                  String        @id @default(uuid()) @db.Uuid
  referenceNumber     String        @unique @map("reference_number") @db.VarChar(50) // 'AR-2026-XXXX'
  fullName            String        @map("full_name") @db.VarChar(150)
  contactNumber       String        @map("contact_number") @db.VarChar(20)
  email               String        @db.VarChar(255)
  publicationId       String        @map("publication_id") @db.VarChar(50)
  yearRequested       Int           @map("year_requested")
  infoType            String        @map("info_type") @db.VarChar(100)
  additionalDetails   String?       @map("additional_details") @db.Text
  preferredContact    String        @default("either") @map("preferred_contact") @db.VarChar(20)
  consentGiven        Boolean       @default(true) @map("consent_given")
  status              EnquiryStatus @default(PENDING)
  staffNotes          String?       @map("staff_notes") @db.Text
  assignedStaffId     String?       @map("assigned_staff_id") @db.Uuid
  resolvedAt          DateTime?     @map("resolved_at")
  createdAt           DateTime      @default(now()) @map("created_at")
  updatedAt           DateTime      @updatedAt @map("updated_at")

  publication         Publication   @relation(fields: [publicationId], references: [id])
  assignedStaff       User?         @relation(fields: [assignedStaffId], references: [id], onDelete: SetNull)

  @@index([referenceNumber])
  @@index([status])
  @@index([publicationId, yearRequested])
  @@map("archive_enquiries")
}

model ContactEnquiry {
  id              String        @id @default(uuid()) @db.Uuid
  fullName        String        @map("full_name") @db.VarChar(150)
  email           String        @db.VarChar(255)
  mobileNumber    String?       @map("mobile_number") @db.VarChar(20)
  subject         String        @db.VarChar(255)
  message         String        @db.Text
  status          EnquiryStatus @default(PENDING)
  createdAt       DateTime      @default(now()) @map("created_at")

  @@map("contact_enquiries")
}
```

---

## 3. Razorpay Integration Plan

### 3.1 Flow Diagram: Order Creation, Checkout & Webhook Activation

```
READER (Browser)                  FASTIFY BACKEND                  RAZORPAY API
      │                                  │                               │
      │ 1. Click "Subscribe ₹75"         │                               │
      ├─────────────────────────────────►│                               │
      │                                  │ 2. Create Order in Razorpay   │
      │                                  ├──────────────────────────────►│
      │                                  │    orders.create({            │
      │                                  │      amount: 7500,            │
      │                                  │      currency: "INR",         │
      │                                  │      receipt: "rcpt_1234"     │
      │                                  │    })                         │
      │                                  │◄──────────────────────────────┤
      │                                  │ 3. Save RazorpayOrder (CREATED)
      │ 4. Return orderId & keyId        │                               │
      │◄─────────────────────────────────┤                               │
      │                                  │                               │
      │ 5. Open Razorpay Checkout Modal  │                               │
      │    (Reader completes UPI/Card)   │                               │
      │                                  │                               │
      │ 6. Submit razorpay_payment_id &  │                               │
      │    razorpay_signature            │                               │
      ├─────────────────────────────────►│                               │
      │                                  │ 7. Verify HMAC-SHA256 Signature
      │                                  │    generated_signature ===    │
      │                                  │    razorpay_signature         │
      │                                  │ 8. Activate UserSubscription  │
      │ 9. Redirect to Confirmed State   │    (Duration: 30 days)        │
      │◄─────────────────────────────────┤                               │
      │                                  │                               │
      │                                  │ 10. Webhook (payment.captured)│
      │                                  │◄──────────────────────────────┤
      │                                  │ 11. Idempotency Check & ACK   │
      │                                  ├──────────────────────────────►│
```

### 3.2 Secure Signature Verification (Server-Side)
```typescript
import crypto from "node:crypto";

export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
  keySecret,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): boolean {
  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf-8"),
    Buffer.from(signature, "utf-8")
  );
}
```

### 3.3 Webhook Validation & Replay Idempotency
- When Razorpay sends `POST /api/v1/payments/razorpay/webhook`:
  1. **Signature Header Check:** Validate `X-Razorpay-Signature` against `crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex')`.
  2. **Event Idempotency Guard:** Query `RazorpayWebhookLog` for `eventId = payload.event_id`. If record exists and `isProcessed = true`, return HTTP 200 immediately without duplicate processing.
  3. **Order Status Guard:** Check `RazorpayOrder.status`. If already `PAID`, acknowledge without duplicating the subscription duration.
  4. **Subscription Activation:** Update `UserSubscription.status = ACTIVE`, set `startsAt = now()`, `expiresAt = now() + plan.durationDays`.

### 3.4 Information Required from Client Management for Razorpay Setup
To configure live and testing environments:
1. **Merchant Account Confirmation:** Has Saurashtra Trust created a business Razorpay account under the registered trust legal name?
2. **KYC & Bank Account Status:** Is the Razorpay merchant account verified and approved for live settlement to the Trust's bank account?
3. **API Keys:**
   - Test Key ID (`rzp_test_...`) and Test Key Secret.
   - Live Key ID (`rzp_live_...`) and Live Key Secret.
4. **Webhook Secret:** A secure secret generated in Razorpay Dashboard > Settings > Webhooks for verifying webhook payloads.
5. **App vs Web Separation:** Does the existing mobile app use a separate Razorpay merchant ID, or will both app and website share the same merchant account with `notes.source = "android"` / `notes.source = "website"`?

---

## 4. E-Paper Architecture Plan

### 4.1 Broadsheet Pre-Press Ingestion Pipeline

```
Pre-Press PDF Upload (Admin Desk)
           │
           ▼
[ Fastify Upload Handler ] ──► Stores PDF at /var/www/uploads/epaper/source/{date}_{code}.pdf
           │
           ▼
[ Background Rasterizer Worker ] (Poppler pdftoppm / libvips)
   ├── 1. Extract Page 1..N at 300 DPI (High-Res WebP / JPEG, ~2400x3600px)
   │      Saved to: /var/www/uploads/epaper/pages/{editionId}/page_{num}_high.webp
   │
   └── 2. Generate Responsive Thumbnail (800x1200px)
          Saved to: /var/www/uploads/epaper/thumbs/{editionId}/page_{num}_thumb.webp
           │
           ▼
[ Database Record Creation (Prisma) ]
   ├── Create EPaperEdition record (Status: READY, totalPageCount: N)
   └── Bulk insert EPaperPage records with storage references and pixel dimensions
```

### 4.2 Interactive Hotspot & Article Clipping Architecture
- **Interactive Clipping:** Readers clicking a specific news section in the E-Paper viewer view that article in broadsheet clipping format or jump to the full text article.
- **Coordinate Model:** Stored in `epaper_hotspots` using percentage bounding boxes (`xPercent`, `yPercent`, `widthPercent`, `heightPercent` as `DECIMAL(5,2)`), making them completely resolution-independent across mobile, tablet, and 4K desktop screens.
- **Hotspot Mapper Tool:** Integrated into the Admin Panel, allowing layout editors to draw rectangular bounding boxes on page images and link them to an `articleId`.

### 4.3 Reader Access Gating & Back-Issue Calendar Archive
- **Preview Gating:** Each publication defines `epaper_free_preview_pages` (default: 0 or 1). Pages beyond the preview limit return blurred/watermarked thumbnails with `isLocked: true` unless an active `UserSubscription` exists in the reader session.
- **Calendar Archive:** Fastify provides `GET /api/v1/epaper/archive/calendar?year=2026&publicationId=pub-janmabhoomi` returning dates that have published editions, allowing readers to select past editions.

---

## 5. Admin Panel Module Plan

The Admin Panel will be built as a clean, unified dashboard for Saurashtra Trust journalists, editors, and administrators.

```
+─────────────────────────────────────────────────────────────────────────────+
|                    SAURASHTRA TRUST NEWSROOM ADMIN PANEL                    |
+─────────────────────────────────────────────────────────────────────────────+
| [Header] Janmabhoomi Group Admin | Active Pub: Janmabhoomi v | User: Editor |
+───────────────┬─────────────────────────────────────────────────────────────+
| SIDEBAR       | MAIN DESK WORKSPACE                                         |
|               |                                                             |
| 1. Dashboard  | [Today's Overview]                                          |
| 2. Articles   | - Published Today: 24 articles (18 Gu, 6 En)                |
|    - Drafts   | - Breaking Ticker: ACTIVE (3 stories)                       |
|    - Review   | - E-Paper Status: Today's Mumbai Edition (READY - 16 Pages) |
|    - Published| - Pending Archive Enquiries: 4 awaiting review              |
| 3. Editorials |                                                             |
| 4. E-Paper    | [Recent Submissions / Pre-Press Ingestion Desk]             |
|    - Upload   | + Upload Tomorrow's Broadsheet PDF (Drop area)              |
|    - Hotspots |                                                             |
| 5. Subscriptions                                                            |
|    - Plans    | [Quick Actions]                                             |
|    - Ledger   | [Write Article] [Upload E-Paper] [Review Archive Enquiries] |
| 6. Enquiries  |                                                             |
|    - Archive  |                                                             |
|    - Contact  |                                                             |
| 7. Audit Logs |                                                             |
+───────────────┴─────────────────────────────────────────────────────────────+
```

### Module Breakdown:
1. **Staff Authentication & RBAC Desk:** Login with Argon2id, session management, password resets, role-scoped publication assignments (`UserRole`).
2. **Article CMS (Bilingual Editor):** Dual Gujarati and English tabbed editor with rich HTML text editing, featured image upload with captioning, tag selection, category assignment, and draft/review/publish workflow.
3. **Editorial Desk (અગ્રલેખ):** Daily editorial publisher mapped to a specific calendar date and author byline.
4. **E-Paper Management Suite:** Drag-and-drop pre-press PDF ingestion, edition metadata editor (volume, issue, date, city), automated page split preview, and visual hotspot coordinate drawing tool.
5. **Archive Enquiry Desk:** Review inbound public archive requests from `/archive-enquiry`, assign enquiries to research staff, add internal notes, and update statuses (`PENDING`, `IN_REVIEW`, `COMPLETED`).
6. **Subscriber & Payment Ledger:** Live Razorpay order monitor, payment status verification, manual subscription extension tools, and CSV transaction exports.
7. **Audit Trail Viewer:** Real-time filterable log of all admin actions (who published which story, who altered subscription plans, timestamp, IP address).

---

## 6. Complete Backend REST API Endpoint List

### 6.1 Authentication & Staff Management (`/api/v1/auth/*`)
- `POST /api/v1/auth/staff/login` — Staff login (email/password, sets secure session cookie).
- `POST /api/v1/auth/staff/logout` — Destroys session in database and clears cookie.
- `GET /api/v1/auth/staff/me` — Returns current logged-in staff profile and permissions.
- `POST /api/v1/auth/subscribers/register` — Reader registration.
- `POST /api/v1/auth/subscribers/login` — Reader login.
- `GET /api/v1/auth/subscribers/me` — Returns subscriber profile and active subscription state.

### 6.2 Public Content Read APIs (`/api/v1/content/*`)
- `GET /api/v1/publications` — List all 8 active/planned publications.
- `GET /api/v1/categories` — List news categories for navigation.
- `GET /api/v1/articles/home?publication={pub}&lang={lang}` — Aggregated homepage feed.
- `GET /api/v1/articles/latest?page=1&limit=20` — Paginated latest news.
- `GET /api/v1/articles/:slug?lang={lang}` — Full article reading payload with teaser gating.
- `GET /api/v1/editorials/today?publication={pub}` — Today's lead editorial.
- `GET /api/v1/editorials/archive?year={year}&month={month}` — Editorial calendar archive.
- `GET /api/v1/panchang/:date?city={city}` — Astronomical almanac data.

### 6.3 E-Paper APIs (`/api/v1/epaper/*`)
- `GET /api/v1/epaper/editions/latest?publication={pub}&city={city}` — Today's edition.
- `GET /api/v1/epaper/editions/:id/pages` — Edition pages (enforces subscriber gating).
- `GET /api/v1/epaper/pages/:pageId/hotspots` — Interactive vector hotspots for a page.
- `GET /api/v1/epaper/archive/calendar?year={year}&month={month}` — Past edition dates.
- `POST /api/v1/admin/epaper/upload` — Pre-press PDF upload (Staff: `epaper_manager`).
- `POST /api/v1/admin/epaper/pages/:pageId/hotspots` — Save vector hotspot coordinates.

### 6.4 Razorpay Payments & Subscriptions (`/api/v1/payments/*`)
- `GET /api/v1/subscriptions/plans?publication={pub}` — Active pricing tiers.
- `POST /api/v1/payments/razorpay/create-order` — Creates Razorpay order (Authenticated subscriber).
- `POST /api/v1/payments/razorpay/verify-payment` — Validates HMAC-SHA256 signature and activates plan.
- `POST /api/v1/payments/razorpay/webhook` — Public webhook receiver with signature validation.
- `GET /api/v1/subscribers/me/subscriptions` — Reader subscription history.

### 6.5 Enquiries APIs (`/api/v1/enquiries/*`)
- `POST /api/v1/enquiries/archive` — Public submission (Rate limited, returns `AR-2026-XXXX`).
- `GET /api/v1/admin/enquiries/archive` — Staff list with status filters.
- `PATCH /api/v1/admin/enquiries/archive/:id` — Update status, staff notes, and resolution.
- `POST /api/v1/enquiries/contact` — Public general contact message submission.

---

## 7. Frontend-to-Backend Integration Plan

1. **Service Layer Implementation:**
   - Update `src/lib/services/archiveEnquiryService.ts` to consume `POST /api/v1/enquiries/archive`.
   - Create `src/lib/services/paymentService.ts` wrapping Razorpay checkout initialization and signature submission.
2. **Data Provider Swap:**
   - Create `src/lib/data/apiProvider.ts` conforming strictly to `INewsDataProvider`.
   - Replace mock data queries with native Next.js `fetch()` calls with incremental static revalidation (`revalidate: 60`).
3. **Razorpay Client Checkout:**
   - Load Razorpay SDK script: `https://checkout.razorpay.com/v1/checkout.js`.
   - Connect the existing `SubscriptionPopup.tsx` and `/epaper` subscription buttons to `createOrder` -> Razorpay Modal -> `verifyPayment`.

---

## 8. Security & Testing Checklist

- [ ] **Argon2id Hashes Only:** Password storage uses `@node-rs/argon2`.
- [ ] **No Hardcoded Admin Accounts:** Interactive CLI provisioning script `scripts/setup-admin.ts`.
- [ ] **Razorpay Secret Isolation:** `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` exist only in `backend/.env`.
- [ ] **Webhook Idempotency:** Duplicate events return HTTP 200 without duplicate credit.
- [ ] **Loopback Network Isolation:** Ports 3000, 4000, 5432 bound to `127.0.0.1`.
- [ ] **Strict UFW Firewall:** Only ports 22, 80, 443 open.
- [ ] **Rate Limiting Active:** Capped at 5 login attempts / 15 min and 10 enquiries / hour.
- [ ] **Magic Byte File Upload Check:** PDFs and images verified with `file-type` binary headers.
- [ ] **Automated Backup Drill:** Nightly `pg_dump` with GPG encryption tested for clean recovery.

---

## 9. Phase-Wise Implementation Roadmap

```
PHASE 1: Foundation & Auth (Days 1–2)
├── 1. Update schema.prisma (Remove PayU, Add Razorpay & Enquiries)
├── 2. Generate migration SQL & test locally
├── 3. Implement Prisma Fastify lifecycle plugin
├── 4. Implement Staff Authentication & setup-admin.ts script
└── Milestone: Secure staff login & session issuance green

PHASE 2: Enquiries & Core Content APIs (Days 3–4)
├── 1. Implement POST /api/v1/enquiries/archive & connect frontend form
├── 2. Implement Core News Read APIs (Articles, Categories, Editorials, Panchang)
├── 3. Implement ApiNewsDataProvider in Next.js
└── Milestone: Public website runs on live database data; archive enquiries live

PHASE 3: E-Paper Ingestion & Viewer (Days 5–7)
├── 1. Configure @fastify/multipart & local NVMe uploads directory
├── 2. Implement Poppler PDF to page rasterizer worker
├── 3. Build E-Paper edition & page read APIs
└── Milestone: Pre-press broadsheets rendered on web with interactive viewer

PHASE 4: Razorpay Payments & Subscriptions (Days 8–9)
├── 1. Install razorpay SDK & build order generation service
├── 2. Implement HMAC-SHA256 signature verification controller
├── 3. Implement idempotent webhook listener
├── 4. Integrate Razorpay Checkout Modal in Next.js frontend
└── Milestone: Reader can purchase subscription and unlock gated broadsheet pages

PHASE 5: Admin Panel Implementation (Days 10–12)
├── 1. Build Admin Desk layout & navigation
├── 2. Bilingual Article CMS editor
├── 3. Pre-Press PDF upload & Hotspot coordinate mapping tool
├── 4. Archive Enquiry processing desk & Audit log viewer
└── Milestone: Complete newsroom administrative autonomy

PHASE 6: Hostinger KVM Production Deployment (Days 13–14)
├── 1. Ubuntu 22.04 LTS hardening & PostgreSQL 16 tuning
├── 2. Nginx TLS 1.3 SSL configuration & PM2 cluster setup
├── 3. Automated nightly encrypted pg_dump cron
└── Milestone: Production Go-Live
```
