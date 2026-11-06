-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('DAILY_NEWSPAPER', 'BIWEEKLY_NEWSPAPER', 'WEEKLY_NEWSPAPER', 'MAGAZINE', 'ALMANAC');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('ACTIVE', 'PLANNED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EPaperStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'SUCCESS', 'FAILURE', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AdPlacementPosition" AS ENUM ('HEADER_BANNER', 'ARTICLE_SIDEBAR', 'ARTICLE_IN_FEED', 'EPAPER_INTERSTITIAL', 'FOOTER_BANNER');

-- CreateTable
CREATE TABLE "publications" (
    "id" VARCHAR(50) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "publication_type" "PublicationType" NOT NULL DEFAULT 'DAILY_NEWSPAPER',
    "name_en" VARCHAR(100) NOT NULL,
    "name_gu" VARCHAR(100) NOT NULL,
    "tagline_en" VARCHAR(255),
    "tagline_gu" VARCHAR(255),
    "frequency_en" VARCHAR(100) NOT NULL,
    "frequency_gu" VARCHAR(100) NOT NULL,
    "established_year" INTEGER NOT NULL,
    "primary_city" VARCHAR(50) NOT NULL,
    "website_url" VARCHAR(255) NOT NULL,
    "epaper_url" VARCHAR(255) NOT NULL,
    "logo_asset_path" VARCHAR(255),
    "logo_placeholder_code" VARCHAR(20) NOT NULL,
    "epaper_free_preview_pages" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "status" "PublicationStatus" NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_gu" VARCHAR(100) NOT NULL,
    "description_en" TEXT,
    "description_gu" TEXT,
    "parent_id" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_categories" (
    "publication_id" VARCHAR(50) NOT NULL,
    "category_id" VARCHAR(50) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_nav_visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "publication_categories_pkey" PRIMARY KEY ("publication_id","category_id")
);

-- CreateTable
CREATE TABLE "authors" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(150) NOT NULL,
    "name_gu" VARCHAR(150) NOT NULL,
    "role_en" VARCHAR(100),
    "role_gu" VARCHAR(100),
    "bio_en" TEXT,
    "bio_gu" TEXT,
    "avatar_url" VARCHAR(500),
    "email" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_gu" VARCHAR(100) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_tags" (
    "article_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "article_tags_pkey" PRIMARY KEY ("article_id","tag_id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" UUID NOT NULL,
    "publication_id" VARCHAR(50) NOT NULL,
    "category_id" VARCHAR(50) NOT NULL,
    "author_id" UUID,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "is_breaking" BOOLEAN NOT NULL DEFAULT false,
    "is_lead_story" BOOLEAN NOT NULL DEFAULT false,
    "is_sub_lead" BOOLEAN NOT NULL DEFAULT false,
    "is_headline_brief" BOOLEAN NOT NULL DEFAULT false,
    "is_paywalled" BOOLEAN NOT NULL DEFAULT false,
    "is_sample_data" BOOLEAN NOT NULL DEFAULT false,
    "epaper_page_number" INTEGER,
    "featured_image_url" VARCHAR(500),
    "image_caption_en" VARCHAR(500),
    "image_caption_gu" VARCHAR(500),
    "published_at" TIMESTAMP(3),
    "scheduled_for" TIMESTAMP(3),
    "view_count" BIGINT NOT NULL DEFAULT 0,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_translations" (
    "id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "language" VARCHAR(10) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "headline" VARCHAR(300) NOT NULL,
    "summary" TEXT NOT NULL,
    "teaser_paragraphs" JSONB NOT NULL,
    "content_html" TEXT NOT NULL,
    "meta_title" VARCHAR(200),
    "meta_description" VARCHAR(300),
    "read_time_minutes" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editorials" (
    "id" UUID NOT NULL,
    "publication_id" VARCHAR(50) NOT NULL,
    "author_id" UUID,
    "publication_date" DATE NOT NULL,
    "slug_en" VARCHAR(255) NOT NULL,
    "slug_gu" VARCHAR(255) NOT NULL,
    "title_en" VARCHAR(300) NOT NULL,
    "title_gu" VARCHAR(300) NOT NULL,
    "excerpt_en" TEXT NOT NULL,
    "excerpt_gu" TEXT NOT NULL,
    "teaser_paragraphs_en" JSONB NOT NULL,
    "teaser_paragraphs_gu" JSONB NOT NULL,
    "content_en" TEXT NOT NULL,
    "content_gu" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'PUBLISHED',
    "is_sample_data" BOOLEAN NOT NULL DEFAULT false,
    "epaper_page_number" INTEGER NOT NULL DEFAULT 4,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editorials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panchang_daily" (
    "id" UUID NOT NULL,
    "calendar_date" DATE NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "tithi_gu" VARCHAR(150) NOT NULL,
    "tithi_en" VARCHAR(150) NOT NULL,
    "nakshatra_gu" VARCHAR(150) NOT NULL,
    "nakshatra_en" VARCHAR(150) NOT NULL,
    "sunrise_time" VARCHAR(20) NOT NULL,
    "sunset_time" VARCHAR(20) NOT NULL,
    "rahu_kaal" VARCHAR(50) NOT NULL,
    "vikram_samvat" INTEGER NOT NULL,
    "auspicious_note_gu" TEXT,
    "auspicious_note_en" TEXT,
    "is_demo_sample" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "panchang_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "epaper_editions" (
    "id" UUID NOT NULL,
    "publication_id" VARCHAR(50) NOT NULL,
    "edition_date" DATE NOT NULL,
    "edition_city" VARCHAR(50) NOT NULL,
    "edition_name_en" VARCHAR(150) NOT NULL,
    "edition_name_gu" VARCHAR(150) NOT NULL,
    "volume_year" INTEGER,
    "issue_number" INTEGER,
    "cover_image_url" VARCHAR(500),
    "total_page_count" INTEGER NOT NULL DEFAULT 0,
    "pdf_source_storage_key" VARCHAR(500) NOT NULL,
    "status" "EPaperStatus" NOT NULL DEFAULT 'PROCESSING',
    "is_sample_data" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "epaper_editions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "epaper_pages" (
    "id" UUID NOT NULL,
    "edition_id" UUID NOT NULL,
    "page_number" INTEGER NOT NULL,
    "label_en" VARCHAR(100) NOT NULL,
    "label_gu" VARCHAR(100) NOT NULL,
    "image_highres_key" VARCHAR(500) NOT NULL,
    "image_thumbnail_key" VARCHAR(500) NOT NULL,
    "width_px" INTEGER NOT NULL,
    "height_px" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "epaper_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "epaper_hotspots" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "article_id" UUID,
    "x_percent" DECIMAL(5,2) NOT NULL,
    "y_percent" DECIMAL(5,2) NOT NULL,
    "width_percent" DECIMAL(5,2) NOT NULL,
    "height_percent" DECIMAL(5,2) NOT NULL,
    "headline_text" VARCHAR(300),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "epaper_hotspots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_staff" BOOLEAN NOT NULL DEFAULT true,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" VARCHAR(50) NOT NULL,
    "permission_id" VARCHAR(100) NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" VARCHAR(50) NOT NULL,
    "publication_id" VARCHAR(50),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" VARCHAR(50) NOT NULL,
    "publication_id" VARCHAR(50) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_gu" VARCHAR(100) NOT NULL,
    "description_en" TEXT,
    "description_gu" TEXT,
    "price_inr" DECIMAL(10,2) NOT NULL,
    "billing_interval" "BillingInterval" NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "features_en" JSONB NOT NULL DEFAULT '[]',
    "features_gu" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_id" VARCHAR(50) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL,
    "transaction_reference" VARCHAR(100) NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_id" VARCHAR(50) NOT NULL,
    "gateway" VARCHAR(30) NOT NULL DEFAULT 'payu_sandbox',
    "gateway_transaction_id" VARCHAR(150),
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "request_hash" VARCHAR(255) NOT NULL,
    "response_hash" VARCHAR(255),
    "raw_webhook_payload" JSONB,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisements" (
    "id" UUID NOT NULL,
    "publication_id" VARCHAR(50) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "client_name" VARCHAR(150) NOT NULL,
    "position" "AdPlacementPosition" NOT NULL,
    "image_storage_key" VARCHAR(500) NOT NULL,
    "target_url" VARCHAR(1000) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "delivered_impressions" BIGINT NOT NULL DEFAULT 0,
    "clicks_count" BIGINT NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_name" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(100) NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "publications_code_key" ON "publications"("code");

-- CreateIndex
CREATE UNIQUE INDEX "publications_slug_key" ON "publications"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "authors_slug_key" ON "authors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "articles_publication_id_status_published_at_idx" ON "articles"("publication_id", "status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "articles_category_id_status_published_at_idx" ON "articles"("category_id", "status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "articles_publication_id_is_lead_story_published_at_idx" ON "articles"("publication_id", "is_lead_story", "published_at" DESC);

-- CreateIndex
CREATE INDEX "article_translations_slug_language_idx" ON "article_translations"("slug", "language");

-- CreateIndex
CREATE UNIQUE INDEX "article_translations_article_id_language_key" ON "article_translations"("article_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "article_translations_slug_language_key" ON "article_translations"("slug", "language");

-- CreateIndex
CREATE UNIQUE INDEX "editorials_publication_id_publication_date_key" ON "editorials"("publication_id", "publication_date");

-- CreateIndex
CREATE UNIQUE INDEX "panchang_daily_calendar_date_city_key" ON "panchang_daily"("calendar_date", "city");

-- CreateIndex
CREATE UNIQUE INDEX "epaper_editions_publication_id_edition_date_edition_city_key" ON "epaper_editions"("publication_id", "edition_date", "edition_city");

-- CreateIndex
CREATE UNIQUE INDEX "epaper_pages_edition_id_page_number_key" ON "epaper_pages"("edition_id", "page_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_sessions_token_hash_key" ON "staff_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "staff_sessions_user_id_idx" ON "staff_sessions"("user_id");

-- CreateIndex
CREATE INDEX "staff_sessions_token_hash_idx" ON "staff_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "user_subscriptions_user_id_status_expires_at_idx" ON "user_subscriptions"("user_id", "status", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_transaction_reference_key" ON "payment_transactions"("transaction_reference");

-- CreateIndex
CREATE INDEX "audit_logs_entity_name_entity_id_idx" ON "audit_logs"("entity_name", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_categories" ADD CONSTRAINT "publication_categories_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_categories" ADD CONSTRAINT "publication_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorials" ADD CONSTRAINT "editorials_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorials" ADD CONSTRAINT "editorials_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epaper_editions" ADD CONSTRAINT "epaper_editions_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epaper_pages" ADD CONSTRAINT "epaper_pages_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "epaper_editions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epaper_hotspots" ADD CONSTRAINT "epaper_hotspots_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "epaper_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epaper_hotspots" ADD CONSTRAINT "epaper_hotspots_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_sessions" ADD CONSTRAINT "staff_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

