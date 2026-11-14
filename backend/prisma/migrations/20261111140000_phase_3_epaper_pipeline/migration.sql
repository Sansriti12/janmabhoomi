-- ============================================================================
-- Migration: 20261111140000_phase_3_epaper_pipeline
-- Applies on top of: 20261111000000_phase_1_razorpay_and_enquiries
-- Description: Enhances EPaperStatus enum, adds edition quarterly/file size fields,
--              hotspot external links, and free preview page flags.
-- ============================================================================

-- 1. Add new enum values to EPaperStatus
ALTER TYPE "EPaperStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "EPaperStatus" ADD VALUE IF NOT EXISTS 'UPLOADED';
ALTER TYPE "EPaperStatus" ADD VALUE IF NOT EXISTS 'PUBLISHED';

-- 2. Alter epaper_editions with non-destructive new columns
ALTER TABLE "epaper_editions" ADD COLUMN IF NOT EXISTS "quarter" VARCHAR(10);
ALTER TABLE "epaper_editions" ADD COLUMN IF NOT EXISTS "file_size_bytes" BIGINT;
ALTER TABLE "epaper_editions" ADD COLUMN IF NOT EXISTS "storage_directory" VARCHAR(500);
ALTER TABLE "epaper_editions" ADD COLUMN IF NOT EXISTS "free_preview_page_limit" INTEGER;
ALTER TABLE "epaper_editions" ADD COLUMN IF NOT EXISTS "processing_error" TEXT;
ALTER TABLE "epaper_editions" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Make pdf_source_storage_key nullable for DRAFT editions before upload
ALTER TABLE "epaper_editions" ALTER COLUMN "pdf_source_storage_key" DROP NOT NULL;

-- 3. Add indexes on epaper_editions
CREATE INDEX IF NOT EXISTS "epaper_editions_publication_id_edition_date_idx" ON "epaper_editions"("publication_id", "edition_date");
CREATE INDEX IF NOT EXISTS "epaper_editions_status_idx" ON "epaper_editions"("status");

-- 4. Alter epaper_pages
ALTER TABLE "epaper_pages" ADD COLUMN IF NOT EXISTS "is_free_preview" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "epaper_pages_edition_id_idx" ON "epaper_pages"("edition_id");

-- 5. Alter epaper_hotspots with external url and target type
ALTER TABLE "epaper_hotspots" ADD COLUMN IF NOT EXISTS "external_url" VARCHAR(1000);
ALTER TABLE "epaper_hotspots" ADD COLUMN IF NOT EXISTS "target_type" VARCHAR(20) NOT NULL DEFAULT 'article';
CREATE INDEX IF NOT EXISTS "epaper_hotspots_page_id_idx" ON "epaper_hotspots"("page_id");
