# JANMABHOOMI DIGITAL NEWSPAPER — PRIORITISED FRONTEND IMPLEMENTATION CHECKLIST

This checklist organizes all audit findings from [`FRONTEND_AUDIT_REPORT.md`](./FRONTEND_AUDIT_REPORT.md) into actionable, non-destructive implementation phases. 

> [!IMPORTANT]
> **GOVERNANCE RULES**:
> 1. Do not rewrite existing components unnecessarily.
> 2. Do not remove existing functionality.
> 3. Do not connect a database or introduce Supabase / Firebase.
> 4. Do not alter the technology stack (Next.js 15, React 19, TypeScript, Tailwind v4).
> 5. Preserve English and Gujarati routes (`/en` and `/gu`).
> 6. Preserve the paid E-Paper subscription business model.

---

## Phase 1: Critical Fixes (Core Accessibility, HTML Standards & Assets) — COMPLETED

- [x] **Task 1.1: Create Public Directory & Core Static Assets** (COMPLETED)
  - **Files**: `/public/favicon.ico`, `/public/favicon.svg`, `/public/site.webmanifest`, `/public/assets/logos/`, `/public/assets/icons/`, `/public/assets/images/`
  - **Component**: Root Asset Tree & `src/app/layout.tsx`
  - **Action**: Created `/public` structure, generated valid `favicon.ico`, SVG favicon, web manifest with brand color `#174F73`, linked in `metadata.icons` and `metadata.manifest`, and established documentation in `/public/assets/logos/README.md`.
  - **Verification**: Verified with HTTP 200 responses.

- [x] **Task 1.2: Dynamic HTML Language Attribute for English & Gujarati** (COMPLETED)
  - **Files**: `src/app/layout.tsx`, `src/app/[lang]/layout.tsx`, `src/components/shared/HtmlLangSetter.tsx`
  - **Component**: `RootLayout`, `LocaleLayout`, `HtmlLangSetter`
  - **Action**: Added immediate synchronous documentElement language synchronization in `src/app/[lang]/layout.tsx`, client-side `HtmlLangSetter` for route transitions, container `lang={lang}` and `dir="ltr"`, and `suppressHydrationWarning` on root `<html>`.
  - **Verification**: Verified DOM exposes `lang="gu"` on `/gu/*` and `lang="en"` on `/en/*`.

- [x] **Task 1.3: Convert Lead Story & Hero Images to Next.js `<Image>`** (COMPLETED)
  - **Files**: `src/components/home/LeadStoryHero.tsx`, `src/components/shared/NewsCard.tsx`
  - **Component**: `LeadStoryHero`, `NewsCard`
  - **Action**: Replaced native `<img>` tags with `next/image` (`<Image fill sizes="..." priority={isLeadStory} />`). Preserved `aspect-16/10` containers to prevent layout shifts.

- [x] **Task 1.4: Implement Accessible "Skip to Main Content" Bypass Link** (COMPLETED)
  - **Files**: `src/app/[lang]/layout.tsx`
  - **Component**: `LocaleLayout`
  - **Action**: Injected an accessible skip link as first focusable element targeting `<main id="main-content" tabIndex={-1}>`, localized in English and Gujarati ("મુખ્ય સામગ્રી પર જાઓ" / "Skip to main content").

- [x] **Task 1.5: Accessibility Overhaul for Delayed Subscription Popup** (COMPLETED)
  - **Files**: `src/components/layout/SubscriptionPopup.tsx`
  - **Component**: `SubscriptionPopup`
  - **Action**: Added `Escape` key listener, focus trapping within dialog, body scroll locking (`overflow: hidden`), and restored focus upon dismissal.

---

## Phase 2A: Frontend Enhancements & SEO Polish — COMPLETED

- [x] **Task 2.1: Add Reduced-Motion Support & Touch Controls to Breaking News Ticker** (COMPLETED)
  - **Files**: `src/components/home/BreakingNewsTicker.tsx`, `src/app/globals.css`
  - **Action**: Added `@media (prefers-reduced-motion: reduce)` rule stopping animation. Added touch pause handlers (`onTouchStart` / `onTouchEnd`) for mobile readers.

- [x] **Task 2.2: Convert `NewsCard` Images to `next/image`** (COMPLETED)
  - **Files**: `src/components/shared/NewsCard.tsx`
  - **Action**: Implemented `<Image fill sizes="..." />` in `NewsCard` with responsive proportions and zero layout shift.

- [x] **Task 2.3: Create Custom Localized 404 & Error Boundary Pages** (COMPLETED)
  - **Files**: `src/app/[lang]/not-found.tsx`, `src/app/[lang]/error.tsx`
  - **Action**: Implemented branded, bilingual 404 and error boundaries offering recovery navigation back to the homepage and key categories.

- [x] **Task 2.4: SEO `metadataBase`, Robots & Sitemap Implementation** (COMPLETED)
  - **Files**: `src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`
  - **Action**: Configured base URL (`process.env.NEXT_PUBLIC_SITE_URL || 'https://www.janmabhoomi.in'`), OpenGraph, Twitter Cards, `robots.ts`, and bilingual `sitemap.ts`.

- [x] **Task 2.5: Schema.org `NewsArticle` Structured Data & Paywall Tags** (COMPLETED)
  - **Files**: `src/components/shared/NewsArticleJsonLd.tsx`, `src/app/[lang]/article/[slug]/page.tsx`
  - **Action**: Injected Google News compliant `NewsArticle` JSON-LD with paywall specification pointing to `#epaper-subscription-gate`.

- [x] **Task 2.6: Social Share Bar for Article Previews** (COMPLETED)
  - **Files**: `src/components/shared/ArticleShareBar.tsx`, `src/app/[lang]/article/[slug]/page.tsx`
  - **Action**: Integrated one-click sharing for WhatsApp, X (Twitter), Facebook, and a "Copy Link" utility with feedback state.

- [x] **Task 2.7: Navigation Polish, Active States & Escape Key Listeners** (COMPLETED)
  - **Files**: `src/components/layout/Header.tsx`
  - **Action**: Added `isMoreActive` state for child routes, `aria-haspopup="menu"`, Escape key listener for menus/search, backdrop overlay, and body scroll lock for mobile menu.

- [x] **Task 2.8: Responsive Design Fixes (768px Tablet Grid & Mobile Banners)** (COMPLETED)
  - **Files**: `src/components/home/CategorySection.tsx`, `src/components/home/SpecialCoverageSection.tsx`
  - **Action**: Fixed orphaned 3rd card on 768px tablet grids (`md:col-span-2 lg:col-span-1`); replaced fixed `h-56` mobile banner with fluid responsive aspect ratios.

- [x] **Task 2.9: E-Paper Landing Page Overhaul** (COMPLETED)
  - **Files**: `src/app/[lang]/epaper/page.tsx`
  - **Action**: Displayed edition presentation (Mumbai Daily Broadsheet, 16 pages), realistic broadsheet miniature thumbnails with multi-column styling, URL `?page=X` active highlighting, and clear subscription CTA.

- [x] **Task 2.10: Regional Panchang City Selector & Choghadiya Tables** (COMPLETED)
  - **Files**: `src/components/home/PanchangWidget.tsx`, `src/app/[lang]/panchang/page.tsx`
  - **Action**: Added city switcher (Mumbai / Ahmedabad / Rajkot), standalone `/panchang` page with Day & Night Choghadiya tables, and explicit sample data disclaimers.

- [x] **Task 2.11: Footer Contrast Compliance** (COMPLETED)
  - **Files**: `src/components/layout/Footer.tsx`
  - **Action**: Increased text contrast from `text-[#FAF8F3]/65` to `text-[#FAF8F3]/85` for WCAG AA compliance.

---

## Phase 2B: Content & Data Architecture Preparation — COMPLETED

- [x] **Task 2B.1: Centralized Data Models & TypeScript Contracts** (COMPLETED)
  - **Files**: `src/lib/data/types.ts`
  - **Action**: Defined `Publication`, `Category`, `NewsArticle`, `EditorialArticle`, `SpecialEventItem`, `PanchangData`, `AdvertisementSlot`, `EPaperEdition`, `ArticleFilterParams`, and `PaginatedResult<T>`.

- [x] **Task 2B.2: Saurashtra Trust Publication Registry** (COMPLETED)
  - **Files**: `src/lib/data/config/publications.ts`
  - **Action**: Registered all 6 core publications (*Janmabhoomi*, *Kutchmitra*, *Phulchhab*, *Vyapar Gujarati*, *Vyapar Hindi*, *Janmabhoomi Pravasi*) + *Janmabhoomi Panchang*.

- [x] **Task 2B.3: Centralized Homepage Configuration** (COMPLETED)
  - **Files**: `src/lib/data/config/homepage.ts`
  - **Action**: Defined centralized section order, hero slot layout, and advertising placements.

- [x] **Task 2B.4: Data Provider Abstraction Enhancement** (COMPLETED)
  - **Files**: `src/lib/data/provider.ts`, `src/lib/data/mock/dataset.ts`
  - **Action**: Extended `INewsDataProvider` with `filterArticles`, `getPanchangByCity`, `getAllCityPanchang`, `getEPaperEditions`, and `getHomepageConfig`.

- [x] **Task 2B.5: Architectural Documentation Deliverables** (COMPLETED)
  - Created [`CONTENT_DATA_MODEL.md`](./CONTENT_DATA_MODEL.md)
  - Created [`API_INTEGRATION_SPECIFICATION.md`](./API_INTEGRATION_SPECIFICATION.md)
  - Created [`PUBLICATION_CONFIGURATION.md`](./PUBLICATION_CONFIGURATION.md)
  - Created [`BILINGUAL_CONTENT_GUIDE.md`](./BILINGUAL_CONTENT_GUIDE.md)
  - Created [`PHASE_2A_2B_IMPLEMENTATION_REPORT.md`](./PHASE_2A_2B_IMPLEMENTATION_REPORT.md)

---

## Phase 3: Future Roadmap (Database & CMS Integration) — PENDING CLIENT APPROVAL

- [ ] **Task 3.1: Connect Saurashtra Trust Central Database**
  - Implement `DbNewsDataProvider` implementing `INewsDataProvider`.
- [ ] **Task 3.2: Connect Subscriber Authentication & Payment Gateway**
  - Integrate subscriber entitlement token verification for full PDF access on `/epaper`.
- [ ] **Task 3.3: Ingest Production Content via Internal CMS**
  - Replace mock datasets with live editorial content feeds.
- [ ] **Task 3.4: Safe PostCSS Resolution**
  - Update Next.js when upstream patch release resolves nested internal PostCSS advisory without breaking changes.

---

## Verification & Sign-Off Checklist

- [x] Static TypeScript compilation check (`npm run lint` / `tsc --noEmit`) passes with 0 errors.
- [x] Production build (`npm run build`) compiles cleanly with exit code 0 in 19.8s.
- [x] Localized 404 (`/[lang]/not-found.tsx`) and error boundary (`/[lang]/error.tsx`) implemented.
- [x] XML Sitemap (`/sitemap.xml`) and Robots (`/robots.txt`) verified.
- [x] E-Paper page index, thumbnails, and `?page=X` highlighting verified.
- [x] Panchang city switcher and Choghadiya table verified.
- [x] Zero databases, Supabase, or Firebase SDKs introduced.
- [x] E-Paper subscription gate remains intact (`#epaper-subscription-gate`).
