# Janmabhoomi Digital Newspaper – Phase 3: Database Schema Design

**Document Version:** 1.0.0  
**Database Engine:** PostgreSQL 16+  
**Collation:** UTF-8 (`en_US.UTF-8` or `und-x-icu` with Gujarati Unicode support)  
**ORM Support:** Compatible with Prisma ORM / Drizzle ORM

---

## 1. Schema Overview & Entity Relationship Summary

The schema is normalized to 3NF with pragmatic denormalization (such as view counts and cached subscriber status) for high-concurrency read efficiency. It models the complete publishing operations of Saurashtra Trust across 20 primary relational tables:

1. `publications` – Master tenant definitions (Janmabhoomi, Vyapar, etc.)
2. `languages` – Supported system locales (`gu`, `en`)
3. `categories` – Standard content taxonomies and slug anchors
4. `publication_categories` – Multi-publication category assignment and ordering
5. `authors` – Journalists, columnists, agency bylines, and editorial boards
6. `articles` – Core publication-neutral content master records
7. `article_translations` – Localized headlines, excerpts, full body content, and metadata
8. `article_tags` & `tags` – Many-to-many taxonomy tagging
9. `editorials` – Daily masthead opinion pieces and historical archives
10. `special_events` – Curated elections, cultural festivals, and commemorative series
11. `advertisements` – Direct display ads and banner schedule tracking
12. `users` – Reader and internal staff account records
13. `roles` & `permissions` – Granular RBAC definitions
14. `user_roles` – Staff permission assignments
15. `subscription_plans` – E-Paper commercial packaging (Monthly, Annual, Lifetime)
16. `user_subscriptions` – Active subscriber grants and temporal validity
17. `payment_transactions` – PayU transactional history, hashes, and audit states
18. `epaper_editions` – Daily print digital editions partitioned by date and city
19. `epaper_pages` – Page-level high-res WebP images and layout sequence
20. `epaper_hotspots` – Interactive clickable vector clip regions mapping to articles
21. `panchang_daily` – Daily Hindu calendar and astrological data by city
22. `audit_logs` – Immutable tracking of editorial and administrative actions

---

## 2. Relational Entity Definitions (SQL DDL)

```sql
-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 1. TENANCY & LOCALIZATION
-- ============================================================================

CREATE TABLE publications (
    id VARCHAR(50) PRIMARY KEY,              -- 'janmabhoomi', 'vyapar', 'phulchhab', etc.
    name_en VARCHAR(100) NOT NULL,
    name_gu VARCHAR(100) NOT NULL,
    tagline_en VARCHAR(255),
    tagline_gu VARCHAR(255),
    established_year INT NOT NULL,
    primary_city VARCHAR(50) NOT NULL,       -- 'Mumbai', 'Rajkot', 'Bhuj'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE languages (
    code VARCHAR(10) PRIMARY KEY,            -- 'gu', 'en'
    name VARCHAR(50) NOT NULL,               -- 'Gujarati', 'English'
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- 2. TAXONOMY & CATEGORIES
-- ============================================================================

CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,              -- 'mumbai', 'gujarat', 'national', etc.
    slug VARCHAR(60) NOT NULL UNIQUE,
    name_en VARCHAR(100) NOT NULL,
    name_gu VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_gu TEXT,
    parent_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE publication_categories (
    publication_id VARCHAR(50) NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    is_nav_visible BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (publication_id, category_id)
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(100) NOT NULL,
    name_gu VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. AUTHORS & EDITORIAL STAFF
-- ============================================================================

CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(150) NOT NULL,
    name_gu VARCHAR(150) NOT NULL,
    role_en VARCHAR(100),                    -- 'Senior Editor', 'Special Correspondent'
    role_gu VARCHAR(100),
    bio_en TEXT,
    bio_gu TEXT,
    avatar_url VARCHAR(500),
    email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. ARTICLES & BILINGUAL CONTENT
-- ============================================================================

CREATE TYPE article_status_enum AS ENUM ('draft', 'review', 'scheduled', 'published', 'archived');

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id VARCHAR(50) NOT NULL REFERENCES publications(id),
    category_id VARCHAR(50) NOT NULL REFERENCES categories(id),
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    status article_status_enum NOT NULL DEFAULT 'draft',
    is_breaking BOOLEAN NOT NULL DEFAULT FALSE,
    is_lead_story BOOLEAN NOT NULL DEFAULT FALSE,
    is_exclusive BOOLEAN NOT NULL DEFAULT FALSE,
    is_paywalled BOOLEAN NOT NULL DEFAULT FALSE,
    featured_image_url VARCHAR(500),
    featured_image_caption_en VARCHAR(500),
    featured_image_caption_gu VARCHAR(500),
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    view_count BIGINT NOT NULL DEFAULT 0,
    created_by UUID,                         -- User ID of creator
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE article_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES languages(code),
    slug VARCHAR(255) NOT NULL,
    title VARCHAR(300) NOT NULL,
    excerpt TEXT NOT NULL,
    content_html TEXT NOT NULL,
    meta_title VARCHAR(200),
    meta_description VARCHAR(300),
    reading_time_minutes INT NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_article_language UNIQUE (article_id, language_code),
    CONSTRAINT uq_slug_language UNIQUE (slug, language_code)
);

CREATE TABLE article_tags (
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- ============================================================================
-- 5. EDITORIALS & ARCHIVE
-- ============================================================================

CREATE TABLE editorials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id VARCHAR(50) NOT NULL REFERENCES publications(id),
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    publication_date DATE NOT NULL,
    title_en VARCHAR(300) NOT NULL,
    title_gu VARCHAR(300) NOT NULL,
    slug_en VARCHAR(255) NOT NULL,
    slug_gu VARCHAR(255) NOT NULL,
    excerpt_en TEXT NOT NULL,
    excerpt_gu TEXT NOT NULL,
    content_en TEXT NOT NULL,
    content_gu TEXT NOT NULL,
    status article_status_enum NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_editorial_date_pub UNIQUE (publication_id, publication_date)
);

-- ============================================================================
-- 6. SPECIAL EVENTS & COMMEMORATIVE COVERAGE
-- ============================================================================

CREATE TABLE special_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title_en VARCHAR(200) NOT NULL,
    title_gu VARCHAR(200) NOT NULL,
    description_en TEXT,
    description_gu TEXT,
    banner_image_url VARCHAR(500),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE special_event_articles (
    event_id UUID NOT NULL REFERENCES special_events(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (event_id, article_id)
);

-- ============================================================================
-- 7. ADVERTISEMENTS & BANNER MANAGEMENT
-- ============================================================================

CREATE TYPE ad_position_enum AS ENUM (
    'header_banner', 'article_sidebar', 'article_in_feed', 'epaper_interstitial', 'footer_banner'
);

CREATE TABLE advertisements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    position ad_position_enum NOT NULL,
    image_desktop_url VARCHAR(500) NOT NULL,
    image_mobile_url VARCHAR(500),
    target_url VARCHAR(1000) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    max_impressions BIGINT,
    delivered_impressions BIGINT NOT NULL DEFAULT 0,
    clicks_count BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. PANCHANG (ASTRONOMICAL CALENDAR)
-- ============================================================================

CREATE TABLE panchang_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_date DATE NOT NULL,
    city VARCHAR(50) NOT NULL,               -- 'Mumbai', 'Rajkot', 'Surat', 'Ahmedabad'
    tithi_gu VARCHAR(100) NOT NULL,
    tithi_en VARCHAR(100) NOT NULL,
    paksha_gu VARCHAR(50) NOT NULL,
    paksha_en VARCHAR(50) NOT NULL,
    nakshatra_gu VARCHAR(100) NOT NULL,
    nakshatra_en VARCHAR(100) NOT NULL,
    sunrise_time TIME NOT NULL,
    sunset_time TIME NOT NULL,
    rahukal_time VARCHAR(50) NOT NULL,
    samvat_year INT NOT NULL,                -- Vikram Samvat (e.g. 2082)
    special_day_gu VARCHAR(200),
    special_day_en VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_panchang_date_city UNIQUE (calendar_date, city)
);

-- ============================================================================
-- 9. USER ACCOUNTS & RBAC
-- ============================================================================

CREATE TYPE user_status_enum AS ENUM ('active', 'suspended', 'pending_verification');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255),              -- Argon2id hash (null for OTP-only users)
    full_name VARCHAR(150) NOT NULL,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'gu' REFERENCES languages(code),
    status user_status_enum NOT NULL DEFAULT 'active',
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,              -- 'super_admin', 'editor', 'reporter', 'subscriber'
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE permissions (
    id VARCHAR(100) PRIMARY KEY,             -- 'articles:create', 'articles:publish', 'epaper:upload'
    category VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(100) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    publication_id VARCHAR(50) REFERENCES publications(id) ON DELETE CASCADE, -- Scoped permission
    PRIMARY KEY (user_id, role_id, publication_id)
);

-- ============================================================================
-- 10. SUBSCRIPTIONS & PAYMENT TRANSACTIONS
-- ============================================================================

CREATE TYPE billing_interval_enum AS ENUM ('monthly', 'quarterly', 'biannual', 'annual', 'lifetime');

CREATE TABLE subscription_plans (
    id VARCHAR(50) PRIMARY KEY,              -- 'janmabhoomi_epaper_annual'
    publication_id VARCHAR(50) NOT NULL REFERENCES publications(id),
    name_en VARCHAR(100) NOT NULL,
    name_gu VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_gu TEXT,
    price_inr NUMERIC(10, 2) NOT NULL,
    billing_interval billing_interval_enum NOT NULL,
    duration_days INT NOT NULL,
    features_en JSONB,                       -- Array of feature strings
    features_gu JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE subscription_status_enum AS ENUM ('active', 'expired', 'cancelled', 'grace_period');

CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
    publication_id VARCHAR(50) NOT NULL REFERENCES publications(id),
    status subscription_status_enum NOT NULL DEFAULT 'active',
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE payment_status_enum AS ENUM ('initiated', 'in_progress', 'success', 'failure', 'refunded');

CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_reference VARCHAR(100) NOT NULL UNIQUE, -- Internal ID: JNB-PAY-YYYYMMDD-XXXX
    user_id UUID NOT NULL REFERENCES users(id),
    plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
    gateway VARCHAR(30) NOT NULL DEFAULT 'payu',        -- 'payu'
    gateway_transaction_id VARCHAR(150),                -- PayU mihpayid
    gateway_bank_ref_no VARCHAR(150),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status payment_status_enum NOT NULL DEFAULT 'initiated',
    request_hash VARCHAR(255) NOT NULL,
    response_hash VARCHAR(255),
    raw_webhook_payload JSONB,
    error_message TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. EPAPER DIGITAL EDITIONS & HOTSPOTS
-- ============================================================================

CREATE TYPE epaper_status_enum AS ENUM ('processing', 'ready', 'failed', 'archived');

CREATE TABLE epaper_editions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id VARCHAR(50) NOT NULL REFERENCES publications(id),
    edition_date DATE NOT NULL,
    edition_city VARCHAR(50) NOT NULL,       -- 'Mumbai', 'Rajkot', 'Surat'
    total_pages INT NOT NULL DEFAULT 0,
    pdf_source_url VARCHAR(500) NOT NULL,    -- S3 raw storage URL
    pdf_file_size_bytes BIGINT NOT NULL,
    status epaper_status_enum NOT NULL DEFAULT 'processing',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_epaper_pub_date_city UNIQUE (publication_id, edition_date, edition_city)
);

CREATE TABLE epaper_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    edition_id UUID NOT NULL REFERENCES epaper_editions(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    page_image_highres_url VARCHAR(500) NOT NULL, -- 300 DPI WebP
    page_image_thumb_url VARCHAR(500) NOT NULL,   -- 150 DPI WebP
    width_px INT NOT NULL,
    height_px INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_epaper_page_num UNIQUE (edition_id, page_number)
);

CREATE TABLE epaper_hotspots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES epaper_pages(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE SET NULL, -- Optional link to digital article
    x_percent NUMERIC(5, 2) NOT NULL,        -- Relative percentage (0.00 - 100.00%)
    y_percent NUMERIC(5, 2) NOT NULL,
    width_percent NUMERIC(5, 2) NOT NULL,
    height_percent NUMERIC(5, 2) NOT NULL,
    headline_text VARCHAR(300),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. AUDIT TRAIL
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,            -- 'ARTICLE_PUBLISHED', 'USER_ROLE_UPDATED', etc.
    entity_name VARCHAR(50) NOT NULL,        -- 'articles', 'epaper_editions', 'subscriptions'
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 13. INDEXING STRATEGY FOR HIGH CONCURRENCY
-- ============================================================================

-- Feed and homepage query optimizations
CREATE INDEX idx_articles_feed ON articles (publication_id, status, published_at DESC);
CREATE INDEX idx_articles_lead ON articles (publication_id, is_lead_story, published_at DESC) WHERE is_lead_story = TRUE;
CREATE INDEX idx_articles_breaking ON articles (publication_id, is_breaking, published_at DESC) WHERE is_breaking = TRUE;
CREATE INDEX idx_articles_category ON articles (category_id, status, published_at DESC);

-- Translation lookup & slug resolution
CREATE INDEX idx_translations_slug ON article_translations (slug, language_code);
CREATE INDEX idx_translations_article_lang ON article_translations (article_id, language_code);

-- Full-text and trigram indexing for Gujarati and English search
CREATE INDEX idx_trigram_title ON article_translations USING gin (title gin_trgm_ops);
CREATE INDEX idx_trigram_excerpt ON article_translations USING gin (excerpt gin_trgm_ops);

-- Subscription & Entitlement validation (sub-millisecond lookups)
CREATE INDEX idx_active_sub ON user_subscriptions (user_id, publication_id, status, expires_at);
CREATE INDEX idx_payu_tx_ref ON payment_transactions (transaction_reference);

-- E-Paper lookups
CREATE INDEX idx_epaper_lookup ON epaper_editions (publication_id, edition_date, edition_city);
CREATE INDEX idx_epaper_hotspots_page ON epaper_hotspots (page_id);
```

---

## 3. Bilingual Translation Linking Pattern

To satisfy Saurashtra Trust's dual-language requirements without duplicating core article metadata (such as publication date, lead story designation, and hero image), the schema uses a **1:M Parent-Child Translation Architecture**:
- `articles` serves as the master record owning publication tenancy, categorization, author assignment, visual assets, and lifecycle state.
- `article_translations` holds the localized `slug`, `title`, `excerpt`, and `content_html` with a strict `(article_id, language_code)` unique constraint.
- This design guarantees that if an article is published in Gujarati only, English consumers safely fall back to an editorial notice or Gujarati canonical version without breaking database referential integrity.
