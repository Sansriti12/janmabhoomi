# JANMABHOOMI DIGITAL NEWSPAPER
## CONTENT AND DATA ARCHITECTURE SPECIFICATION (PHASE 2B)

**Document Version:** 2.0.0  
**Status:** Approved & Implemented  
**Scope:** Content Models, Data Contracts, Future Relational DB Schema Mapping  
**Target Organization:** Saurashtra Trust / Janmabhoomi Group  

---

### 1. Executive Summary

Phase 2B establishes the formal data architecture and content abstraction layer for the Janmabhoomi Digital Newspaper platform. In strict adherence to project guidelines, **no external databases, Supabase, Firebase, or cloud backend services have been coupled to the codebase in this phase**.

Instead, a production-grade interface abstraction (`INewsDataProvider`) and centralized data models have been established under `src/lib/data/types.ts`. All frontend components consume data exclusively through this provider layer. When the company server and relational database are provisioned in Phase 3, the backend database adapter can replace `MockNewsDataProvider` with zero frontend component refactoring.

---

### 2. Core Entity Definitions

```
 ┌────────────────┐          ┌──────────────────────┐
 │  Publication   │1       * │     NewsArticle      │*        1┌──────────────┐
 │ (Janmabhoomi)  ├──────────┤ (Bilingual Content)  ├──────────┤   Category   │
 └───────┬────────┘          └──────────┬───────────┘          └──────────────┘
         │1                             │1
         │                              │
         │*                             │1
 ┌───────┴────────┐          ┌──────────┴───────────┐
 │ EPaperEdition  │          │    ArticlePaywall    │
 │ (16 Broadsheet)│          │ (Public Preview/Gate)│
 └────────────────┘          └──────────────────────┘
```

#### 2.1 Publication Entity (`Publication`)
Represents individual newspapers and periodicals operating under the Saurashtra Trust umbrella.

| Field Name | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | No | Unique identifier (e.g., `pub-janmabhoomi`, `pub-vyapar-gu`). |
| `code` | `string` | No | Short code / abbreviation (`JB`, `KM`, `PC`, `VG`, `VH`, `JP`). |
| `slug` | `string` | No | URL identifier for publication-specific routing. |
| `name` | `BilingualText` | No | Full publication title in English and Gujarati. |
| `tagline` | `BilingualText` | Yes | Regional publication motto or description. |
| `type` | `PublicationType` | No | Enum: `'daily'` \| `'weekly'` \| `'periodical'` \| `'almanac'`. |
| `language` | `BilingualText` | No | Editorial language of the print publication. |
| `frequency` | `BilingualText` | No | Publishing frequency (e.g., Daily Evening, Weekly). |
| `establishedYear`| `string` | No | Historical establishment year (e.g., `"1934"`). |
| `headquarters` | `BilingualText` | No | Editorial headquarters (e.g., Janmabhoomi Bhavan, Mumbai). |
| `region` | `BilingualText` | No | Primary circulation region (e.g., Mumbai Metropolitan). |
| `epaperUrl` | `string` | No | Target path to digital broadsheet edition. |
| `logoAssetPath` | `string` | Yes | Path in `/public/assets/logos/` for the publication masthead. |
| `isPlaceholderAsset` | `boolean` | No | Flags whether asset is currently using standard typography fallback. |

---

#### 2.2 Category Entity (`Category`)
Taxonomical classification of articles and regional reportage.

| Field Name | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | No | Unique identifier (e.g., `cat-national`, `cat-city`). |
| `slug` | `CategorySlug` | No | URL slug matching route `/[lang]/category/[slug]`. |
| `title` | `BilingualText` | No | Localized category heading (`National` / `રાષ્ટ્રીય`). |
| `description` | `BilingualText` | Yes | Meta description for category landing page. |
| `displayOrder`| `number` | No | Sorting index in header and mobile drawers. |
| `isActive` | `boolean` | No | Status toggle for CMS administrative control. |

Supported Slugs: `national`, `city`, `business`, `sports`, `entertainment`, `international`, `education`, `religion-culture`, `special-coverage`, `maran`.

---

#### 2.3 News Article Entity (`NewsArticle`)
Core content item supporting full English and Gujarati localization, teaser paywall restrictions, and SEO structured data.

| Field Name | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | No | Unique identifier (`jb-lead-01`, `jb-city-02`). |
| `slug` | `string` | No | SEO-optimized URL slug. |
| `publicationId`| `string` | Yes | References `Publication.id`. Defaults to `pub-janmabhoomi`. |
| `categoryId` | `string` | Yes | References `Category.id`. |
| `category` | `CategorySlug` | No | Category discriminator slug. |
| `categoryLabel`| `BilingualText` | No | Localized badge text displayed on cards. |
| `title` | `BilingualText` | No | Article headline in English and Gujarati. |
| `summary` | `BilingualText` | No | Lead summary paragraph (used in meta tags and preview). |
| `teaserParagraphs`| `Record<'en'\|'gu', string[]>` | No | Publicly accessible teaser paragraphs before paywall. |
| `author` | `BilingualText` | Yes | Byline author or Bureau credit (`વિશેષ પ્રતિનિધિ`). |
| `location` | `BilingualText` | Yes | Dateline city (`MUMBAI`, `AHMEDABAD`, `NEW DELHI`). |
| `publishedAt` | `string` (ISO 8601) | No | Official publication timestamp with IST offset (+05:30). |
| `updatedAt` | `string` (ISO 8601) | Yes | Last editorial amendment timestamp. |
| `readTimeMinutes` | `number` | No | Calculated reading duration. |
| `imageUrl` | `string` | No | Primary featured image URL (remote CDN or local asset). |
| `imageCaption` | `BilingualText` | Yes | Editorial caption and source attribution. |
| `isBreaking` | `boolean` | Yes | Displays in top Breaking News red ticker. |
| `isLeadStory` | `boolean` | Yes | Positioned in Section 1 primary hero spot. |
| `isSubLead` | `boolean` | Yes | Positioned in Section 1 secondary hero cards. |
| `isHeadlineBrief`| `boolean` | Yes | Displayed in Section 1 right-hand brief rail. |
| `epaperPageNumber`| `number` | Yes | Broadsheet print replica page reference (e.g., `Page 1`). |
| `epaperEdition` | `BilingualText` | Yes | Print edition designation (`Mumbai Main Edition`). |
| `isDemonstrationData` | `boolean` | Yes | Clear flag preventing indexing as company news. |

---

#### 2.4 Editorial Article Entity (`EditorialArticle`)
Represents the prestigious institutional *અગ્રલેખ* (Agralekh) and opinion columns.

| Field Name | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | No | Unique editorial ID (`jb-editorial-2026-11-03`). |
| `slug` | `string` | No | Editorial slug for archive URL. |
| `editionDate` | `string` (YYYY-MM-DD) | No | Calendar date of publication. |
| `title` | `BilingualText` | No | Agralekh headline. |
| `subtitle` | `BilingualText` | Yes | Contextual subtitle or theme. |
| `summary` | `BilingualText` | No | Overview of the institutional position. |
| `author` | `BilingualText` | No | Default: *"તંત્રીલેખ (Editorial Board)"*. |
| `columnName` | `BilingualText` | Yes | Column title (*અગ્રલેખ અને વિચાર*). |
| `paragraphs` | `Record<'en'\|'gu', string[]>` | No | Lead editorial paragraphs for public preview. |
| `imageUrl` | `string` | Yes | Optional editorial board illustration or archival image. |
| `publishedAt` | `string` (ISO 8601) | No | Timestamp of publication. |
| `epaperPageNumber`| `number` | No | Always `8` (standard Janmabhoomi editorial broadsheet page). |
| `isDemonstrationData`| `boolean` | Yes | Demonstration disclaimer flag. |

---

#### 2.5 Panchang & Choghadiya Entity (`PanchangData`)
Astronomical and traditional almanac calculations segregated from news.

| Field Name | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `editionCity` | `BilingualText` | No | City designation (`Mumbai`, `Ahmedabad`, `Rajkot`). |
| `date` | `string` (YYYY-MM-DD) | No | Calendar date. |
| `vikramSamvat` | `BilingualText` | No | Vikram Samvat almanac year and month (`વિ.સં. ૨૦૮૨`). |
| `tithi` | `BilingualText` | No | Lunar day (`કારતક વદ નોમ`). |
| `nakshatra` | `BilingualText` | No | Constellation (`મઘા નક્ષત્ર`). |
| `yoga` | `BilingualText` | No | Astrological yoga & karana. |
| `sunrise` | `string` | No | City sunrise timing (`06:38 AM`). |
| `sunset` | `string` | No | City sunset timing (`06:04 PM`). |
| `rahuKaal` | `string` | No | Rahu Kaal window (`03:00 PM – 04:30 PM`). |
| `choghadiya` | `ChoghadiyaSchedule` | No | Day (8 slots) and Night (8 slots) table. |
| `auspiciousNote` | `BilingualText` | Yes | General astrological note. |
| `isSampleData` | `boolean` | No | Always `true` in demo environment. |

---

#### 2.6 EPaper Edition Entity (`EPaperEdition`)
Print broadsheet metadata supporting digital replica navigation.

| Field Name | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | No | Edition ID (`epaper-jb-2026-11-03`). |
| `publicationId`| `string` | No | References `Publication.id`. |
| `editionDate` | `string` (YYYY-MM-DD) | No | Broadsheet date. |
| `editionName` | `BilingualText` | No | Full edition name (`Mumbai Main Daily Broadsheet`). |
| `language` | `'gu' \| 'en'` | No | Language of the edition (`gu`). |
| `thumbnail` | `string` | No | Cover preview thumbnail path. |
| `pageCount` | `number` | No | Total broadsheet pages (typically 16). |
| `status` | `string` | No | Status (`'available'` \| `'processing'`). |
| `isDemonstrationEdition` | `boolean` | No | Demonstration badge flag. |
| `pages` | `EPaperPagePreview[]` | No | Array of page metadata (pageNumber, label, preview). |

---

### 3. Future Relational Database Schema Design (PostgreSQL / MySQL)

When the company server is provisioned, the following SQL schema aligns 1:1 with the implemented TypeScript models:

```sql
-- 1. Publications Table
CREATE TABLE publications (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(16) NOT NULL UNIQUE,
    slug VARCHAR(64) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_gu VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'daily',
    language_en VARCHAR(64) NOT NULL,
    language_gu VARCHAR(64) NOT NULL,
    frequency_en VARCHAR(64) NOT NULL,
    frequency_gu VARCHAR(64) NOT NULL,
    established_year VARCHAR(8) NOT NULL,
    headquarters_en VARCHAR(255) NOT NULL,
    headquarters_gu VARCHAR(255) NOT NULL,
    region_en VARCHAR(255) NOT NULL,
    region_gu VARCHAR(255) NOT NULL,
    epaper_url VARCHAR(255) NOT NULL,
    logo_asset_path VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE categories (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    title_en VARCHAR(128) NOT NULL,
    title_gu VARCHAR(128) NOT NULL,
    description_en TEXT,
    description_gu TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. Articles Table
CREATE TABLE articles (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    publication_id VARCHAR(64) REFERENCES publications(id),
    category_id VARCHAR(64) REFERENCES categories(id),
    title_en TEXT NOT NULL,
    title_gu TEXT NOT NULL,
    summary_en TEXT NOT NULL,
    summary_gu TEXT NOT NULL,
    teaser_paragraphs_en JSONB NOT NULL,
    teaser_paragraphs_gu JSONB NOT NULL,
    author_en VARCHAR(128),
    author_gu VARCHAR(128),
    location_en VARCHAR(128),
    location_gu VARCHAR(128),
    image_url VARCHAR(512) NOT NULL,
    image_caption_en TEXT,
    image_caption_gu TEXT,
    is_breaking BOOLEAN DEFAULT FALSE,
    is_lead_story BOOLEAN DEFAULT FALSE,
    is_sub_lead BOOLEAN DEFAULT FALSE,
    is_headline_brief BOOLEAN DEFAULT FALSE,
    epaper_page_number INT,
    epaper_edition_en VARCHAR(128),
    epaper_edition_gu VARCHAR(128),
    is_demonstration_data BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_articles_publication_cat ON articles(publication_id, category_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_slug ON articles(slug);
```

---

### 4. Architectural Boundaries Maintained

1. **No External Service Coupling:** Zero database drivers, Supabase packages, or cloud backend SDKs are introduced.
2. **Deterministic Data Contracts:** All mock datasets implement the exact interfaces expected by future database ORMs.
3. **Bilingual Separation:** Content entities strictly isolate English (`en`) and Gujarati (`gu`) fields, preventing translation bleed.
4. **Subscription Business Model Preserved:** Full broadsheet pages remain paywalled behind `epaper_page_number` references; public web articles expose only teaser paragraphs.
