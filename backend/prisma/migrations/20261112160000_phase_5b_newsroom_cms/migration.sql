-- ============================================================================
-- Migration: 20261112160000_phase_5b_newsroom_cms
-- Applies on top of: 20261111150000_add_failed_to_payment_status
-- Description: Phase 5B additive newsroom schema:
--              1. Categories: is_active, display_order, updated_at
--              2. Articles: primary_language, source_version, source_hash, created_by/published_by/updated_by foreign keys
--              3. Article Translations: translation_status, translation_quality_warnings, source_version_at_translation,
--                 source_hash_at_translation, previous_content_html, previous_headline, previous_summary,
--                 ai_provider, ai_model, translated_at, translation_error, retry_count, tokens_used,
--                 estimated_cost_usd, is_manually_edited, last_edited_by
--              4. E-paper Pages: is_supplement, supplement_name, supplement_issue_number, section_display_order
--              5. Media Assets: new media_assets table
-- ============================================================================

-- 1. Alter categories
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "display_order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Alter articles
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "primary_language" VARCHAR(10) NOT NULL DEFAULT 'gu';
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "source_version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "source_hash" VARCHAR(64);
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "published_by" UUID;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "updated_by" UUID;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'articles_created_by_fkey'
  ) THEN
    ALTER TABLE "articles" ADD CONSTRAINT "articles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'articles_published_by_fkey'
  ) THEN
    ALTER TABLE "articles" ADD CONSTRAINT "articles_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 3. Alter article_translations
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "translation_status" VARCHAR(30) NOT NULL DEFAULT 'COMPLETED';
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "translation_quality_warnings" JSONB;
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "source_version_at_translation" INTEGER;
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "source_hash_at_translation" VARCHAR(64);
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "previous_content_html" TEXT;
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "previous_headline" VARCHAR(300);
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "previous_summary" TEXT;
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "ai_provider" VARCHAR(50);
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "ai_model" VARCHAR(50);
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "translated_at" TIMESTAMP(3);
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "translation_error" TEXT;
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "retry_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "tokens_used" INTEGER;
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "estimated_cost_usd" DECIMAL(10, 6);
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "is_manually_edited" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "article_translations" ADD COLUMN IF NOT EXISTS "last_edited_by" UUID;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'article_translations_last_edited_by_fkey'
  ) THEN
    ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_last_edited_by_fkey" FOREIGN KEY ("last_edited_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "article_translations_translation_status_idx" ON "article_translations"("translation_status");

-- 4. Alter epaper_pages (Purti supplement support)
ALTER TABLE "epaper_pages" ADD COLUMN IF NOT EXISTS "is_supplement" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "epaper_pages" ADD COLUMN IF NOT EXISTS "supplement_name" VARCHAR(100);
ALTER TABLE "epaper_pages" ADD COLUMN IF NOT EXISTS "supplement_issue_number" INTEGER;
ALTER TABLE "epaper_pages" ADD COLUMN IF NOT EXISTS "section_display_order" INTEGER NOT NULL DEFAULT 0;

-- 5. Create media_assets table
CREATE TABLE IF NOT EXISTS "media_assets" (
  "id" UUID NOT NULL,
  "original_filename" VARCHAR(255) NOT NULL,
  "storage_key" VARCHAR(500) NOT NULL,
  "public_url" VARCHAR(500) NOT NULL,
  "mime_type" VARCHAR(100) NOT NULL,
  "file_size_bytes" BIGINT NOT NULL,
  "width_px" INTEGER,
  "height_px" INTEGER,
  "caption_en" VARCHAR(500),
  "caption_gu" VARCHAR(500),
  "alt_text_en" VARCHAR(255),
  "alt_text_gu" VARCHAR(255),
  "photographer" VARCHAR(150),
  "tags" JSONB NOT NULL DEFAULT '[]',
  "uploaded_by" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "media_assets_storage_key_key" ON "media_assets"("storage_key");
CREATE INDEX IF NOT EXISTS "media_assets_created_at_idx" ON "media_assets"("created_at" DESC);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_assets_uploaded_by_fkey'
  ) THEN
    ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
