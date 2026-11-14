-- ============================================================================
-- Migration: 20261111000000_phase_1_razorpay_and_enquiries
-- Applies on top of: 20261110120000_add_payment_and_enquiry_enums
-- Description: Creates Subscribers, Razorpay Orders/Transactions/Webhooks,
--              Archive Enquiries, and Contact Enquiries.
--              (Enums were created and committed in prerequisite migration)
-- ============================================================================

-- 1. Create Subscribers & Subscriber Sessions (Isolated from Newsroom Staff)
CREATE TABLE "subscribers" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mobile_number" VARCHAR(20),
    "full_name" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255),
    "status" "SubscriberStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_mobile_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");
CREATE UNIQUE INDEX "subscribers_mobile_number_key" ON "subscribers"("mobile_number");

CREATE TABLE "subscriber_sessions" (
    "id" UUID NOT NULL,
    "subscriber_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriber_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscriber_sessions_token_hash_key" ON "subscriber_sessions"("token_hash");
CREATE INDEX "subscriber_sessions_subscriber_id_idx" ON "subscriber_sessions"("subscriber_id");

-- 2. Update UserSubscriptions to link with Subscribers instead of Staff Users
ALTER TABLE "user_subscriptions" DROP CONSTRAINT IF EXISTS "user_subscriptions_user_id_fkey";
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE "user_subscriptions" RENAME COLUMN "user_id" TO "subscriber_id";
    END IF;
END $$;

-- Preserve all plan_id data (do not drop plan_id). Ensure auto_renew column is safely added.
ALTER TABLE "user_subscriptions" ADD COLUMN IF NOT EXISTS "auto_renew" BOOLEAN NOT NULL DEFAULT false;

-- Data preservation: If any existing subscriber_id references exist from users, copy to subscribers before FK constraint
INSERT INTO "subscribers" ("id", "email", "full_name", "created_at", "updated_at")
SELECT u."id", u."email", u."full_name", u."created_at", u."updated_at"
FROM "users" u
JOIN "user_subscriptions" s ON s."subscriber_id" = u."id"
ON CONFLICT ("id") DO NOTHING;

-- Recreate index on user_subscriptions
DROP INDEX IF EXISTS "user_subscriptions_user_id_status_expires_at_idx";
DROP INDEX IF EXISTS "user_subscriptions_subscriber_id_status_expires_at_idx";
CREATE INDEX "user_subscriptions_subscriber_id_status_expires_at_idx" ON "user_subscriptions"("subscriber_id", "status", "expires_at");

-- 3. Drop Deprecated PayU PaymentTransactions and Recreate for Razorpay
DROP TABLE IF EXISTS "payment_transactions";

CREATE TABLE "razorpay_orders" (
    "id" UUID NOT NULL,
    "razorpay_order_id" VARCHAR(100) NOT NULL,
    "subscriber_id" UUID NOT NULL,
    "plan_id" VARCHAR(50) NOT NULL,
    "amount_paise" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "receipt" VARCHAR(100) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'CREATED',
    "source" "PaymentSource" NOT NULL DEFAULT 'WEBSITE',
    "notes" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "razorpay_orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "razorpay_orders_razorpay_order_id_key" ON "razorpay_orders"("razorpay_order_id");
CREATE UNIQUE INDEX "razorpay_orders_receipt_key" ON "razorpay_orders"("receipt");

CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL,
    "order_db_id" UUID NOT NULL,
    "subscriber_id" UUID NOT NULL,
    "razorpay_order_id" VARCHAR(100) NOT NULL,
    "razorpay_payment_id" VARCHAR(100) NOT NULL,
    "razorpay_signature" VARCHAR(255),
    "amount_paise" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'CAPTURED',
    "method" VARCHAR(50),
    "bank" VARCHAR(50),
    "wallet" VARCHAR(50),
    "vpa" VARCHAR(100),
    "card_id" VARCHAR(100),
    "source" "PaymentSource" NOT NULL DEFAULT 'WEBSITE',
    "error_code" VARCHAR(100),
    "error_description" TEXT,
    "raw_webhook_payload" JSONB,
    "captured_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_transactions_razorpay_payment_id_key" ON "payment_transactions"("razorpay_payment_id");
CREATE INDEX "payment_transactions_razorpay_order_id_idx" ON "payment_transactions"("razorpay_order_id");
CREATE INDEX "payment_transactions_subscriber_id_idx" ON "payment_transactions"("subscriber_id");

-- 4. Create Razorpay Webhook Logs (Replay Protection & Audit)
CREATE TABLE "razorpay_webhook_logs" (
    "id" UUID NOT NULL,
    "event_id" VARCHAR(100) NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "razorpay_order_id" VARCHAR(100),
    "razorpay_payment_id" VARCHAR(100),
    "raw_payload" JSONB NOT NULL,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "process_error" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "razorpay_webhook_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "razorpay_webhook_logs_event_id_key" ON "razorpay_webhook_logs"("event_id");
CREATE INDEX "razorpay_webhook_logs_event_id_idx" ON "razorpay_webhook_logs"("event_id");

-- 5. Create Archive Enquiries & Contact Enquiries
CREATE TABLE "archive_enquiries" (
    "id" UUID NOT NULL,
    "reference_number" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "contact_number" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "publication_id" VARCHAR(50) NOT NULL,
    "year_requested" INTEGER NOT NULL,
    "info_type" VARCHAR(100) NOT NULL,
    "additional_details" TEXT,
    "preferred_contact" VARCHAR(20) NOT NULL DEFAULT 'either',
    "consent_given" BOOLEAN NOT NULL DEFAULT true,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'PENDING',
    "staff_notes" TEXT,
    "assigned_staff_id" UUID,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "archive_enquiries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "archive_enquiries_reference_number_key" ON "archive_enquiries"("reference_number");
CREATE INDEX "archive_enquiries_reference_number_idx" ON "archive_enquiries"("reference_number");
CREATE INDEX "archive_enquiries_status_idx" ON "archive_enquiries"("status");
CREATE INDEX "archive_enquiries_publication_id_year_requested_idx" ON "archive_enquiries"("publication_id", "year_requested");

CREATE TABLE "contact_enquiries" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mobile_number" VARCHAR(20),
    "subject" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_enquiries_pkey" PRIMARY KEY ("id")
);

-- 6. Add Foreign Keys
ALTER TABLE "subscriber_sessions" ADD CONSTRAINT "subscriber_sessions_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "subscribers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "subscribers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_subscriptions_plan_id_fkey'
    ) THEN
        ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

ALTER TABLE "razorpay_orders" ADD CONSTRAINT "razorpay_orders_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "subscribers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "razorpay_orders" ADD CONSTRAINT "razorpay_orders_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_order_db_id_fkey" FOREIGN KEY ("order_db_id") REFERENCES "razorpay_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "subscribers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "archive_enquiries" ADD CONSTRAINT "archive_enquiries_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "archive_enquiries" ADD CONSTRAINT "archive_enquiries_assigned_staff_id_fkey" FOREIGN KEY ("assigned_staff_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
