# Janmabhoomi Digital Newspaper – Phase 3A: Relational Database Schema Design (Revised)

**Document Version:** 2.0.0  
**Database Engine:** PostgreSQL 16+  
**Collation:** UTF-8 (`en_US.UTF-8` or `und-x-icu` with Gujarati Unicode support)  
**ORM Definition:** Prisma Schema Specification (`schema.prisma`)  
**Scope:** Saurashtra Trust 8-Publication Ecosystem

---

## 1. Schema Design Principles & Corrections

In accordance with Phase 3A requirements:
1. **Full 8-Publication Tenancy:** Supports all 8 publications/products across 5 publication types (`DAILY_NEWSPAPER`, `BIWEEKLY_NEWSPAPER`, `WEEKLY_NEWSPAPER`, `MAGAZINE`, `ALMANAC`) with diverse publishing frequencies.
2. **Persistent Staff Sessions:** Added `staff_sessions` model. All staff authentications are persisted in PostgreSQL with token hashes, IP addresses, user agents, and expiry timestamps. Zero reliance on volatile in-memory storage.
3. **Zero Hardcoded Admin Passwords in Seed:** Seed scripts **never** insert default administrator passwords or fixed credentials into the database. A dedicated secure initialization command (`npm run setup:admin`) is provided for initial bootstrapping.
4. **Configurable Subscription & Access Rules:** Free E-Paper preview page limits (`epaper_free_preview_pages`) default to `0` and are configurable per publication. Subscription pricing, durations, and renewal policies reside entirely in `subscription_plans`.
5. **Sample Data Identification:** All development and mock records include an explicit `is_sample_data: true` column to strictly distinguish demo records from production data.
6. **Panchang Product Integration:** Panchang is integrated both as an official publication record (`pub-panchang`) and as daily astronomical records (`panchang_daily`), flagged as demo data until an approved astronomical feed is connected.

---

## 2. Prisma Schema Specification (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============================================================================
// 1. TENANCY & PUBLICATIONS (ALL 8 SAURASHTRA TRUST PRODUCTS)
// ============================================================================

enum PublicationType {
  DAILY_NEWSPAPER      // Janmabhoomi, Kutchmitra, Phulchhab
  BIWEEKLY_NEWSPAPER   // Vyapar Gujarati
  WEEKLY_NEWSPAPER     // Vyapar Hindi, Janmabhoomi Pravasi
  MAGAZINE             // Kavita (Quarterly)
  ALMANAC              // Janmabhoomi Panchang (Annual / Daily)
}

enum PublicationStatus {
  ACTIVE
  PLANNED
  ARCHIVED
}

model Publication {
  id                      String            @id @db.VarChar(50) // 'pub-janmabhoomi', 'pub-kavita', etc.
  code                    String            @unique @db.VarChar(10) // 'JB', 'PC', 'KM', 'VG', 'VH', 'JP', 'PAN', 'KAV'
  slug                    String            @unique @db.VarChar(60)
  publicationType         PublicationType   @default(DAILY_NEWSPAPER) @map("publication_type")
  nameEn                  String            @map("name_en") @db.VarChar(100)
  nameGu                  String            @map("name_gu") @db.VarChar(100)
  taglineEn               String?           @map("tagline_en") @db.VarChar(255)
  taglineGu               String?           @map("tagline_gu") @db.VarChar(255)
  frequencyEn             String            @map("frequency_en") @db.VarChar(100) // 'Daily Evening', 'Quarterly'
  frequencyGu             String            @map("frequency_gu") @db.VarChar(100) // 'દૈનિક સાંધ્ય', 'ત્રિમાસિક'
  establishedYear         Int               @map("established_year")
  primaryCity             String            @map("primary_city") @db.VarChar(50)
  websiteUrl              String            @map("website_url") @db.VarChar(255)
  epaperUrl               String            @map("epaper_url") @db.VarChar(255)
  logoAssetPath           String?           @map("logo_asset_path") @db.VarChar(255)
  logoPlaceholderCode     String            @map("logo_placeholder_code") @db.VarChar(20)
  epaperFreePreviewPages  Int               @default(0) @map("epaper_free_preview_pages") // Configurable preview limit
  settings                Json              @default("{}") // Flexible JSONB for access rules & publishing deadlines
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

  @@map("publications")
}

// ============================================================================
// 2. TAXONOMY & CATEGORIES
// ============================================================================

model Category {
  id              String    @id @db.VarChar(50) // 'national', 'city', 'maran', 'business', etc.
  slug            String    @unique @db.VarChar(60)
  nameEn          String    @map("name_en") @db.VarChar(100)
  nameGu          String    @map("name_gu") @db.VarChar(100)
  descriptionEn   String?   @map("description_en") @db.Text
  descriptionGu   String?   @map("description_gu") @db.Text
  parentId        String?   @map("parent_id") @db.VarChar(50)
  createdAt       DateTime  @default(now()) @map("created_at")

  parent          Category? @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children        Category[] @relation("CategoryHierarchy")
  publications    PublicationCategory[]
  articles        Article[]

  @@map("categories")
}

model PublicationCategory {
  publicationId   String      @map("publication_id") @db.VarChar(50)
  categoryId      String      @map("category_id") @db.VarChar(50)
  displayOrder    Int         @default(0) @map("display_order")
  isNavVisible    Boolean     @default(true) @map("is_nav_visible")

  publication     Publication @relation(fields: [publicationId], references: [id], onDelete: Cascade)
  category        Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([publicationId, categoryId])
  @@map("publication_categories")
}

// ============================================================================
// 3. ARTICLES & BILINGUAL TRANSLATIONS
// ============================================================================

enum ArticleStatus {
  DRAFT
  UNDER_REVIEW
  APPROVED
  SCHEDULED
  PUBLISHED
  ARCHIVED
}

model Article {
  id                      String        @id @default(uuid()) @db.Uuid
  publicationId           String        @map("publication_id") @db.VarChar(50)
  categoryId              String        @map("category_id") @db.VarChar(50)
  authorId                String?       @map("author_id") @db.Uuid
  status                  ArticleStatus @default(DRAFT)
  isBreaking              Boolean       @default(false) @map("is_breaking")
  isLeadStory             Boolean       @default(false) @map("is_lead_story")
  isSubLead               Boolean       @default(false) @map("is_sub_lead")
  isHeadlineBrief         Boolean       @default(false) @map("is_headline_brief")
  isPaywalled             Boolean       @default(false) @map("is_paywalled")
  isSampleData            Boolean       @default(false) @map("is_sample_data") // Explicit development flag
  epaperPageNumber        Int?          @map("epaper_page_number")
  featuredImageUrl        String?       @map("featured_image_url") @db.VarChar(500)
  imageCaptionEn          String?       @map("image_caption_en") @db.VarChar(500)
  imageCaptionGu          String?       @map("image_caption_gu") @db.VarChar(500)
  publishedAt             DateTime?     @map("published_at")
  scheduledFor            DateTime?     @map("scheduled_for")
  viewCount               BigInt        @default(0) @map("view_count")
  createdBy               String?       @map("created_by") @db.Uuid
  createdAt               DateTime      @default(now()) @map("created_at")
  updatedAt               DateTime      @updatedAt @map("updated_at")

  publication             Publication   @relation(fields: [publicationId], references: [id])
  category                Category      @relation(fields: [categoryId], references: [id])
  author                  Author?       @relation(fields: [authorId], references: [id], onDelete: SetNull)
  translations            ArticleTranslation[]
  tags                    ArticleTag[]
  hotspots                EPaperHotspot[]

  @@index([publicationId, status, publishedAt(sort: Desc)])
  @@index([categoryId, status, publishedAt(sort: Desc)])
  @@index([publicationId, isLeadStory, publishedAt(sort: Desc)])
  @@map("articles")
}

model ArticleTranslation {
  id                  String    @id @default(uuid()) @db.Uuid
  articleId           String    @map("article_id") @db.Uuid
  language            String    @db.VarChar(10) // 'gu' or 'en'
  slug                String    @db.VarChar(255)
  headline            String    @db.VarChar(300)
  summary             String    @db.Text
  teaserParagraphs    Json      @map("teaser_paragraphs") // String array of public teaser paragraphs
  contentHtml         String    @map("content_html") @db.Text
  metaTitle           String?   @map("meta_title") @db.VarChar(200)
  metaDescription     String?   @map("meta_description") @db.VarChar(300)
  readTimeMinutes     Int       @default(3) @map("read_time_minutes")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  article             Article   @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([articleId, language])
  @@unique([slug, language])
  @@index([slug, language])
  @@map("article_translations")
}

model Author {
  id          String    @id @default(uuid()) @db.Uuid
  slug        String    @unique @db.VarChar(100)
  nameEn      String    @map("name_en") @db.VarChar(150)
  nameGu      String    @map("name_gu") @db.VarChar(150)
  roleEn      String?   @map("role_en") @db.VarChar(100)
  roleGu      String?   @map("role_gu") @db.VarChar(100)
  bioEn       String?   @map("bio_en") @db.Text
  bioGu       String?   @map("bio_gu") @db.Text
  avatarUrl   String?   @map("avatar_url") @db.VarChar(500)
  email       String?   @db.VarChar(255)
  createdAt   DateTime  @default(now()) @map("created_at")

  articles    Article[]
  editorials  Editorial[]

  @@map("authors")
}

model Tag {
  id          String       @id @default(uuid()) @db.Uuid
  slug        String       @unique @db.VarChar(100)
  nameEn      String       @map("name_en") @db.VarChar(100)
  nameGu      String       @map("name_gu") @db.VarChar(100)

  articles    ArticleTag[]

  @@map("tags")
}

model ArticleTag {
  articleId   String  @map("article_id") @db.Uuid
  tagId       String  @map("tag_id") @db.Uuid

  article     Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag         Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([articleId, tagId])
  @@map("article_tags")
}

// ============================================================================
// 4. EDITORIALS & ARCHIVE
// ============================================================================

model Editorial {
  id                  String        @id @default(uuid()) @db.Uuid
  publicationId       String        @map("publication_id") @db.VarChar(50)
  authorId            String?       @map("author_id") @db.Uuid
  publicationDate     DateTime      @map("publication_date") @db.Date
  slugEn              String        @map("slug_en") @db.VarChar(255)
  slugGu              String        @map("slug_gu") @db.VarChar(255)
  titleEn             String        @map("title_en") @db.VarChar(300)
  titleGu             String        @map("title_gu") @db.VarChar(300)
  excerptEn           String        @map("excerpt_en") @db.Text
  excerptGu           String        @map("excerpt_gu") @db.Text
  teaserParagraphsEn  Json          @map("teaser_paragraphs_en")
  teaserParagraphsGu  Json          @map("teaser_paragraphs_gu")
  contentEn           String        @map("content_en") @db.Text
  contentGu           String        @map("content_gu") @db.Text
  status              ArticleStatus @default(PUBLISHED)
  isSampleData        Boolean       @default(false) @map("is_sample_data")
  epaperPageNumber    Int           @default(4) @map("epaper_page_number")
  createdAt           DateTime      @default(now()) @map("created_at")
  updatedAt           DateTime      @updatedAt @map("updated_at")

  publication         Publication   @relation(fields: [publicationId], references: [id])
  author              Author?       @relation(fields: [authorId], references: [id], onDelete: SetNull)

  @@unique([publicationId, publicationDate])
  @@map("editorials")
}

// ============================================================================
// 5. PANCHANG ASTRONOMICAL DATA
// ============================================================================

model PanchangDaily {
  id              String    @id @default(uuid()) @db.Uuid
  calendarDate    DateTime  @map("calendar_date") @db.Date
  city            String    @db.VarChar(50) // 'mumbai', 'rajkot', 'ahmedabad', 'surat'
  tithiGu         String    @map("tithi_gu") @db.VarChar(150)
  tithiEn         String    @map("tithi_en") @db.VarChar(150)
  nakshatraGu     String    @map("nakshatra_gu") @db.VarChar(150)
  nakshatraEn     String    @map("nakshatra_en") @db.VarChar(150)
  sunriseTime     String    @map("sunrise_time") @db.VarChar(20)
  sunsetTime      String    @map("sunset_time") @db.VarChar(20)
  rahuKaal        String    @map("rahu_kaal") @db.VarChar(50)
  vikramSamvat    Int       @map("vikram_samvat")
  auspiciousNoteGu String?  @map("auspicious_note_gu") @db.Text
  auspiciousNoteEn String?  @map("auspicious_note_en") @db.Text
  isDemoSample    Boolean   @default(true) @map("is_demo_sample") // Flagged until approved data provider connects
  createdAt       DateTime  @default(now()) @map("created_at")

  @@unique([calendarDate, city])
  @@map("panchang_daily")
}

// ============================================================================
// 6. EPAPER DIGITAL EDITIONS & HOTSPOTS
// ============================================================================

enum EPaperStatus {
  PROCESSING
  READY
  FAILED
  ARCHIVED
}

model EPaperEdition {
  id                  String        @id @default(uuid()) @db.Uuid
  publicationId       String        @map("publication_id") @db.VarChar(50)
  editionDate         DateTime      @map("edition_date") @db.Date
  editionCity         String        @map("edition_city") @db.VarChar(50)
  editionNameEn       String        @map("edition_name_en") @db.VarChar(150)
  editionNameGu       String        @map("edition_name_gu") @db.VarChar(150)
  volumeYear          Int?          @map("volume_year") // Supports magazine volume/year (e.g. for Kavita)
  issueNumber         Int?          @map("issue_number") // Supports magazine issue number
  coverImageUrl       String?       @map("cover_image_url") @db.VarChar(500)
  totalPageCount      Int           @default(0) @map("total_page_count")
  pdfSourceStorageKey String        @map("pdf_source_storage_key") @db.VarChar(500)
  status              EPaperStatus  @default(PROCESSING)
  isSampleData        Boolean       @default(false) @map("is_sample_data")
  publishedAt         DateTime?     @map("published_at")
  createdAt           DateTime      @default(now()) @map("created_at")

  publication         Publication   @relation(fields: [publicationId], references: [id])
  pages               EPaperPage[]

  @@unique([publicationId, editionDate, editionCity])
  @@map("epaper_editions")
}

model EPaperPage {
  id                  String          @id @default(uuid()) @db.Uuid
  editionId           String          @map("edition_id") @db.Uuid
  pageNumber          Int             @map("page_number")
  labelEn             String          @map("label_en") @db.VarChar(100)
  labelGu             String          @map("label_gu") @db.VarChar(100)
  imageHighresKey     String          @map("image_highres_key") @db.VarChar(500)
  imageThumbnailKey   String          @map("image_thumbnail_key") @db.VarChar(500)
  widthPx             Int             @map("width_px")
  heightPx            Int             @map("height_px")
  createdAt           DateTime        @default(now()) @map("created_at")

  edition             EPaperEdition   @relation(fields: [editionId], references: [id], onDelete: Cascade)
  hotspots            EPaperHotspot[]

  @@unique([editionId, pageNumber])
  @@map("epaper_pages")
}

model EPaperHotspot {
  id              String      @id @default(uuid()) @db.Uuid
  pageId          String      @map("page_id") @db.Uuid
  articleId       String?     @map("article_id") @db.Uuid
  xPercent        Decimal     @map("x_percent") @db.Decimal(5, 2)
  yPercent        Decimal     @map("y_percent") @db.Decimal(5, 2)
  widthPercent    Decimal     @map("width_percent") @db.Decimal(5, 2)
  heightPercent   Decimal     @map("height_percent") @db.Decimal(5, 2)
  headlineText    String?     @map("headline_text") @db.VarChar(300)
  createdAt       DateTime    @default(now()) @map("created_at")

  page            EPaperPage  @relation(fields: [pageId], references: [id], onDelete: Cascade)
  article         Article?    @relation(fields: [articleId], references: [id], onDelete: SetNull)

  @@map("epaper_hotspots")
}

// ============================================================================
// 7. USERS, ROLES & PERSISTENT SESSIONS
// ============================================================================

enum UserStatus {
  ACTIVE
  SUSPENDED
  DEACTIVATED
}

model User {
  id                  String             @id @default(uuid()) @db.Uuid
  email               String             @unique @db.VarChar(255)
  fullName            String             @map("full_name") @db.VarChar(150)
  passwordHash        String             @map("password_hash") @db.VarChar(255) // Argon2id hash
  isStaff             Boolean            @default(true) @map("is_staff")
  status              UserStatus         @default(ACTIVE)
  lastLoginAt         DateTime?          @map("last_login_at")
  createdAt           DateTime           @default(now()) @map("created_at")
  updatedAt           DateTime           @updatedAt @map("updated_at")

  roles               UserRole[]
  sessions            StaffSession[]
  auditLogs           AuditLog[]

  @@map("users")
}

model StaffSession {
  id              String      @id @default(uuid()) @db.Uuid
  userId          String      @map("user_id") @db.Uuid
  tokenHash       String      @unique @map("token_hash") @db.VarChar(255)
  ipAddress       String?     @map("ip_address") @db.VarChar(50)
  userAgent       String?     @map("user_agent") @db.Text
  expiresAt       DateTime    @map("expires_at")
  createdAt       DateTime    @default(now()) @map("created_at")

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@map("staff_sessions")
}

model Role {
  id          String      @id @db.VarChar(50) // 'super_admin', 'editor', 'reporter', etc.
  name        String      @db.VarChar(100)
  description String?     @db.Text

  permissions RolePermission[]
  users       UserRole[]

  @@map("roles")
}

model Permission {
  id          String      @id @db.VarChar(100) // 'articles:create', 'articles:publish'
  category    String      @db.VarChar(50)
  description String?     @db.Text

  roles       RolePermission[]

  @@map("permissions")
}

model RolePermission {
  roleId          String      @map("role_id") @db.VarChar(50)
  permissionId    String      @map("permission_id") @db.VarChar(100)

  role            Role        @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission      Permission  @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@map("role_permissions")
}

model UserRole {
  userId          String       @map("user_id") @db.Uuid
  roleId          String       @map("role_id") @db.VarChar(50)
  publicationId   String?      @map("publication_id") @db.VarChar(50) // Scoped to specific publication if staff

  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  role            Role         @relation(fields: [roleId], references: [id], onDelete: Cascade)
  publication     Publication? @relation(fields: [publicationId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("user_roles")
}

// ============================================================================
// 8. SUBSCRIPTIONS & PAYMENT TRANSACTIONS (CONFIGURABLE)
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
  transactions      PaymentTransaction[]

  @@map("subscription_plans")
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
}

model UserSubscription {
  id              String              @id @default(uuid()) @db.Uuid
  userId          String              @map("user_id") @db.Uuid
  planId          String              @map("plan_id") @db.VarChar(50)
  status          SubscriptionStatus  @default(ACTIVE)
  startsAt        DateTime            @map("starts_at")
  expiresAt       DateTime            @map("expires_at")
  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")

  plan            SubscriptionPlan    @relation(fields: [planId], references: [id])

  @@index([userId, status, expiresAt])
  @@map("user_subscriptions")
}

enum PaymentStatus {
  INITIATED
  SUCCESS
  FAILURE
  REFUNDED
}

model PaymentTransaction {
  id                      String            @id @default(uuid()) @db.Uuid
  transactionReference    String            @unique @map("transaction_reference") @db.VarChar(100) // JNB-PAY-...
  userId                  String            @map("user_id") @db.Uuid
  planId                  String            @map("plan_id") @db.VarChar(50)
  gateway                 String            @default("payu_sandbox") @db.VarChar(30)
  gatewayTransactionId    String?           @map("gateway_transaction_id") @db.VarChar(150)
  amount                  Decimal           @db.Decimal(10, 2)
  currency                String            @default("INR") @db.VarChar(10)
  status                  PaymentStatus     @default(INITIATED)
  requestHash             String            @map("request_hash") @db.VarChar(255)
  responseHash            String?           @map("response_hash") @db.VarChar(255)
  rawWebhookPayload       Json?             @map("raw_webhook_payload")
  paidAt                  DateTime?         @map("paid_at")
  createdAt               DateTime          @default(now()) @map("created_at")

  plan                    SubscriptionPlan  @relation(fields: [planId], references: [id])

  @@map("payment_transactions")
}

// ============================================================================
// 9. ADVERTISEMENTS & BANNER PLACEMENTS
// ============================================================================

enum AdPlacementPosition {
  HEADER_BANNER
  ARTICLE_SIDEBAR
  ARTICLE_IN_FEED
  EPAPER_INTERSTITIAL
  FOOTER_BANNER
}

model Advertisement {
  id                    String              @id @default(uuid()) @db.Uuid
  publicationId         String              @map("publication_id") @db.VarChar(50)
  title                 String              @db.VarChar(150)
  clientName            String              @map("client_name") @db.VarChar(150)
  position              AdPlacementPosition
  imageStorageKey       String              @map("image_storage_key") @db.VarChar(500)
  targetUrl             String              @map("target_url") @db.VarChar(1000)
  startTime             DateTime            @map("start_time")
  endTime               DateTime            @map("end_time")
  deliveredImpressions  BigInt              @default(0) @map("delivered_impressions")
  clicksCount           BigInt              @default(0) @map("clicks_count")
  isActive              Boolean             @default(true) @map("is_active")
  createdAt             DateTime            @default(now()) @map("created_at")

  publication           Publication         @relation(fields: [publicationId], references: [id])

  @@map("advertisements")
}

// ============================================================================
// 10. AUDIT LOGS
// ============================================================================

model AuditLog {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String?   @map("user_id") @db.Uuid
  action      String    @db.VarChar(100)
  entityName  String    @map("entity_name") @db.VarChar(50)
  entityId    String    @map("entity_id") @db.VarChar(100)
  oldValues   Json?     @map("old_values")
  newValues   Json?     @map("new_values")
  ipAddress   String?   @map("ip_address") @db.VarChar(45)
  userAgent   String?   @map("user_agent") @db.Text
  createdAt   DateTime  @default(now()) @map("created_at")

  user        User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([entityName, entityId])
  @@index([createdAt(sort: Desc)])
  @@map("audit_logs")
}
```

---

## 3. Database Backup & Restoration Instructions

To ensure operational reliability without third-party services:

### 3.1 Local Backup Procedure (`pg_dump`)
```bash
# Export full PostgreSQL schema and data to compressed format
pg_dump -U postgres -h localhost -p 5432 -F c -b -v -f ./backups/janmabhoomi_dev_$(date +%Y%m%d_%H%M%S).dump janmabhoomi_dev
```

### 3.2 Local Restoration Procedure (`pg_restore`)
```bash
# 1. Terminate active backend connections to the database
# 2. Re-create or clean target database
dropdb -U postgres -h localhost -p 5432 --if-exists janmabhoomi_dev
createdb -U postgres -h localhost -p 5432 janmabhoomi_dev

# 3. Restore from binary dump
pg_restore -U postgres -h localhost -p 5432 -d janmabhoomi_dev -v ./backups/janmabhoomi_dev_<timestamp>.dump
```

### 3.3 Verification Test
- During local setup in Phase 3A, a test backup and restoration will be executed to verify that foreign key relationships, Gujarati Unicode characters, and Prisma migration checksums restore cleanly without corruption.
