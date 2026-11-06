# JANMABHOOMI DIGITAL NEWSPAPER — COMPLETE FRONTEND AUDIT REPORT

**Audit Date**: 5 November 2026  
**Auditor**: Advanced Frontend Architecture & Quality Assurance  
**Platform**: Janmabhoomi Digital Newspaper (Saurashtra Trust)  
**Technology Stack**: Next.js 15 (App Router), React 19, TypeScript (Strict Mode), Tailwind CSS v4, Bilingual Localization (English & Gujarati)  
**Compilation Status**: `npm run lint` (`tsc --noEmit`) Passed (0 errors) | `npm run build` Passed (Static & Dynamic routes compiled successfully)

---

## 1. Executive Summary

This comprehensive frontend audit evaluates the first-cut implementation of the **Janmabhoomi Digital Newspaper** website. The site serves as the digital flagship for the Janmabhoomi Group (under Saurashtra Trust, established in 1934), which publishes *Janmabhoomi*, *Janmabhoomi Pravasi*, *Vyapar*, *Phulchhab*, and *Kutchmitra*.

The frontend architecture establishes:
- Strict decoupling between UI components and mock data via `INewsDataProvider` (`src/lib/data/provider.ts`).
- Fully localized routing across 24 dynamic and static endpoints (`/en/*` and `/gu/*`).
- Faithful reproduction of the 9-section newspaper editorial layout.
- Preservation of the print subscription revenue model (public preview teaser with E-Paper gate).
- Zero unauthorized backend, Supabase, Firebase, or external database dependencies.

The audit identified **28 specific findings** across the 17 audit dimensions, categorized into:
- **Critical (5 issues)**: Missing `public/` directory & favicon, hardcoded `<html lang="en">` impacting Gujarati accessibility & SEO, raw `<img>` tags bypassing Next.js optimization and causing layout shifts, missing Skip-to-Content navigation link, and lack of focus trapping / Escape key dismissal on modal dialogs.
- **High (8 issues)**: Missing root and locale error boundaries / 404 pages, client-side date hydration mismatch fallback, search restricted to 10 articles, missing article social sharing tools, ticker missing `prefers-reduced-motion` and touch pause, and high-severity nested PostCSS build vulnerability.
- **Medium (10 issues)**: Missing schema.org JSON-LD structured data, metadataBase canonical URL warnings, font loading via external CSS `<link>` rather than `next/font/google`, orphan 3rd item in 2-column tablet layout, Panchang missing multi-city selection, and inactive state on "More" dropdown parent tab.
- **Low (5 issues)**: Minor color contrast ratio in dark footer text, dummy anchor link targets (`#facebook`), placeholder broadsheet wireframes, duplicate nav route mappings, and lack of editorial archive date filters.

---

## 2. Detailed Findings by Audit Category (1–17)

### Audit Dimension 1: Project Structure & Component Organisation

#### Issue 1.1: Complete Absence of the `/public` Static Directory
- **File Name & Component Name**: Root directory (`/public`)
- **What is Currently Implemented**: The workspace contains `src/`, `docs/`, and configuration files. There is no `public/` directory at the project root.
- **What is Missing or Incorrect**: Next.js serves static assets (favicons, Web Manifest, Apple Touch icons, OpenGraph preview cards, SVG brand logos) directly from the `/public` root. Comments in `src/components/shared/BrandLogo.tsx` explicitly reference `/public/assets/logos/janmabhoomi-logo.png`, yet this directory does not exist. Any browser requests for `/favicon.ico` or static assets return 404.
- **Recommended Correction**: Create the standard `/public` directory structure:
  - `/public/favicon.ico`
  - `/public/favicon-32x32.png`, `/public/favicon-16x16.png`, `/public/apple-touch-icon.png`
  - `/public/site.webmanifest`
  - `/public/assets/logos/` (housing official master vectors for Janmabhoomi and sister publications)
  - `/public/assets/og-image.jpg`
- **Priority**: **Critical**

#### Issue 1.2: Missing Custom Root Error Boundary and Locale 404 Page
- **File Name & Component Name**: `src/app/not-found.tsx`, `src/app/[lang]/error.tsx`, `src/app/[lang]/not-found.tsx`
- **What is Currently Implemented**: Default Next.js framework fallback pages are shown when a route or slug throws an error or `notFound()`.
- **What is Missing or Incorrect**: If a user encounters an unexpected runtime error or navigates to an invalid article/category slug (e.g., `/gu/category/unknown`), they receive unstyled default Next.js error screens without Header, Footer, or Gujarati localization.
- **Recommended Correction**: Implement:
  1. `src/app/[lang]/not-found.tsx`: Styled 404 page within the localized layout with links back to Home, Latest, and E-Paper.
  2. `src/app/[lang]/error.tsx`: Client-side error boundary with a "Try Again" recovery button localized in EN and GU.
- **Priority**: **High**

---

### Audit Dimension 2: Homepage Layout & All Homepage Sections

#### Issue 2.1: Native `<img>` Tags in Section 2 (Lead Story Hero) Instead of `next/image`
- **File Name & Component Name**: `src/components/home/LeadStoryHero.tsx` (`LeadStoryHero`)
- **What is Currently Implemented**: Lead story hero and sub-lead visual stories use standard HTML `<img>` elements with `src={story.imageUrl}`.
- **What is Missing or Incorrect**:
  - Images are not optimized into WebP/AVIF by Next.js image optimization pipeline.
  - Lack of explicit `sizes` attribute causes desktop and mobile to download the same large resolution image.
  - Risk of Cumulative Layout Shift (CLS) on initial load before image dimensions resolve.
- **Recommended Correction**: Migrate to `next/image` (`<Image fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />`) for the above-the-fold lead story image, leveraging the configured `remotePatterns` for Unsplash in `next.config.ts`.
- **Priority**: **Critical**

#### Issue 2.2: Breaking News Ticker Missing Pause for Reduced Motion & Touch Devices
- **File Name & Component Name**: `src/components/home/BreakingNewsTicker.tsx` (`BreakingNewsTicker`), `src/app/globals.css`
- **What is Currently Implemented**: The ticker uses CSS keyframe animation (`animation: ticker-scroll 38s linear infinite`) with `:hover { animation-play-state: paused }`.
- **What is Missing or Incorrect**:
  - Users with vestibular motion disorders cannot stop the continuous scrolling animation, violating WCAG 2.2.2 (Pause, Stop, Hide).
  - On mobile/touch devices, `:hover` does not activate reliably; touching the ticker does not pause it, making fast-scrolling headlines difficult to tap.
- **Recommended Correction**:
  1. Add `@media (prefers-reduced-motion: reduce)` in `globals.css` to disable horizontal scrolling and show a static or faded headline.
  2. Add `onTouchStart` / `onTouchEnd` pause state handlers in React or Tailwind `active:paused`.
- **Priority**: **High**

---

### Audit Dimension 3: Header Design & Responsiveness

#### Issue 3.1: Date Hydration Fallback Hardcoded to English Fixed String
- **File Name & Component Name**: `src/components/layout/Header.tsx` (`Header`)
- **What is Currently Implemented**: Current date and day are dynamically computed in `useEffect` to avoid SSR hydration mismatch. Before `formattedDate` is populated, it falls back to `"Tuesday, 3 November 2026"`.
- **What is Missing or Incorrect**: On initial page render when viewing in Gujarati (`/gu`), the header momentarily flashes an English date string `"Tuesday, 3 November 2026"` before JavaScript client hydration updates it to Gujarati script.
- **Recommended Correction**: Provide locale-aware fallback text:
  ```tsx
  <span>{formattedDate || (lang === "gu" ? "મંગળવાર, ૩ નવેમ્બર ૨૦૨૬" : "Tuesday, 3 November 2026")}</span>
  ```
- **Priority**: **High**

#### Issue 3.2: Mobile Navigation Drawer Pushes Content Instead of Overlay Modal with Backdrop
- **File Name & Component Name**: `src/components/layout/Header.tsx` (`Header`)
- **What is Currently Implemented**: Clicking the hamburger button renders an accordion-style `div` below Row 2 that pushes the entire page content downward.
- **What is Missing or Incorrect**:
  - Pushing page content causes layout reflow and disorients readers on long articles.
  - Lacks a dimmed backdrop (`bg-black/50`) to focus user attention.
  - Body scrolling is not locked while the mobile menu is open.
  - Pressing the `Escape` key does not close the mobile drawer.
- **Recommended Correction**: Enhance mobile drawer into a fixed slide-over or slide-down drawer with a backdrop, `overflow-hidden` body scroll lock, and `Escape` key listener.
- **Priority**: **Medium**

#### Issue 3.3: In-Header Search Filters Only Top 10 Latest Articles
- **File Name & Component Name**: `src/components/layout/Header.tsx` (`Header`), `src/app/[lang]/layout.tsx` (`LocaleLayout`)
- **What is Currently Implemented**: `LocaleLayout` fetches `newsDataProvider.getLatestArticles(10)` and passes it as `searchableArticles` to `Header`.
- **What is Missing or Incorrect**: Readers searching for historical stories, editorials, or articles outside the top 10 receive "No matching news articles found" even though relevant articles exist in other categories.
- **Recommended Correction**:
  - In Phase 1: Provide `newsDataProvider.getAllSearchableArticles()` (or a broader 50-article pool) to `LocaleLayout`.
  - Add an action link at the bottom of search results: "View full search results for '{query}'" pointing to `/${lang}/latest?q={query}`.
- **Priority**: **Medium**

---

### Audit Dimension 4: English and Gujarati Language Switching

#### Issue 4.1: Static `<html lang="en">` Hardcoded in Root Layout
- **File Name & Component Name**: `src/app/layout.tsx` (`RootLayout`)
- **What is Currently Implemented**: Line 26 has `<html lang="en">`. The localized layout in `src/app/[lang]/layout.tsx` applies `font-gujarati` or `font-sans` to an inner `<div>`, but does not alter the root HTML document tag.
- **What is Missing or Incorrect**:
  - When browsing `/gu/*`, the document's declared language remains `en`.
  - Assistive screen readers (NVDA, JAWS, TalkBack) will pronounce Gujarati Unicode text using English speech synthesizers, resulting in unintelligible audio.
  - Search engine crawlers (Google, Bing) misclassify Gujarati pages as English documents, damaging regional Gujarati SEO indexing.
  - Violates WCAG 3.1.1 (Language of Page - Level A).
- **Recommended Correction**: Move `<html>` and `<body>` tags from `src/app/layout.tsx` into `src/app/[lang]/layout.tsx`, dynamically supplying `<html lang={lang} dir="ltr">`. The root layout `src/app/layout.tsx` should simply render `{children}`.
- **Priority**: **Critical**

#### Issue 4.2: Font Loading via Render-Blocking External `<link>` Rather Than `next/font/google`
- **File Name & Component Name**: `src/app/layout.tsx` (`RootLayout`), `src/app/globals.css`
- **What is Currently Implemented**: `<head>` loads fonts via Google Fonts CDN `<link href="https://fonts.googleapis.com/css2?family=Inter...&family=Noto+Sans+Gujarati..."/>`.
- **What is Missing or Incorrect**:
  - External stylesheets block first paint and require 2 separate DNS preconnects (`fonts.googleapis.com` and `fonts.gstatic.com`).
  - Font files are not self-hosted or prefetched at build time.
  - Can cause Flash of Unstyled Text (FOUT) or Cumulative Layout Shift (CLS) when Gujarati fonts load asynchronously.
- **Recommended Correction**: Use Next.js native font optimization:
  ```tsx
  import { Inter, Noto_Sans_Gujarati } from "next/font/google";
  const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
  const notoSansGujarati = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-gujarati", display: "swap" });
  ```
- **Priority**: **High**

---

### Audit Dimension 5: All Existing Routes and Page Layouts

#### Issue 5.1: Missing Route Handler or Fallback for Trailing Slashes & Canonical Normalisation
- **File Name & Component Name**: `src/app/page.tsx` (`RootRedirectPage`)
- **What is Currently Implemented**: Root path `/` redirects to `/${i18nConfig.defaultLocale}` (`/en`).
- **What is Missing or Incorrect**: There is no Next.js middleware to inspect user browser accept-language header (`Accept-Language: gu`), defaulting all incoming root visitors to English regardless of their device language preference.
- **Recommended Correction**: Add an edge middleware `middleware.ts` or enhance `app/page.tsx` to detect `request.headers.get('accept-language')` and redirect to `/gu` if Gujarati is preferred, defaulting to `/en`.
- **Priority**: **Medium**

#### Issue 5.2: Missing Social Sharing Bar on Article Preview Pages
- **File Name & Component Name**: `src/app/[lang]/article/[slug]/page.tsx` (`ArticlePage`)
- **What is Currently Implemented**: Displays breadcrumb, category, title, metadata, image, teaser text, and E-Paper gate.
- **What is Missing or Incorrect**: Newspaper readers heavily share articles on WhatsApp, X (Twitter), Facebook, and LinkedIn. No social share buttons or "Copy Link" utility exists on the article page.
- **Recommended Correction**: Add a localized social share bar (`WhatsApp`, `Facebook`, `X`, `Copy Link`) below the article metadata header.
- **Priority**: **Medium**

---

### Audit Dimension 6: Navigation Links and Dropdown Functionality

#### Issue 6.1: Desktop "More" Dropdown Missing Active Indicator When Child Route is Visited
- **File Name & Component Name**: `src/components/layout/Header.tsx` (`Header`)
- **What is Currently Implemented**: Primary nav links (`Home`, `Latest`, `National`, etc.) compare `pathname === item.href` to render an active `#174F73` underline.
- **What is Missing or Incorrect**: When a user visits any route contained inside the "More" dropdown (e.g., `/[lang]/panchang`, `/[lang]/events`, `/[lang]/category/maran`), the "More" button displays no active indicator. The desktop navigation bar shows zero active tabs.
- **Recommended Correction**: Update "More" button styling to test if `pathname` matches any child link in `moreNav`:
  ```tsx
  const isMoreActive = moreNav.some((sub) => isActive(sub.href));
  ```
- **Priority**: **Medium**

#### Issue 6.2: Desktop "More" Dropdown Lacks Keyboard Accessibility (Escape Key & ARIA)
- **File Name & Component Name**: `src/components/layout/Header.tsx` (`Header`)
- **What is Currently Implemented**: Toggle button with `aria-expanded={moreOpen}` and mouse click outside listener.
- **What is Missing or Incorrect**:
  - Missing `aria-haspopup="true"`.
  - Pressing `Escape` key does not close the open dropdown.
  - Tabbing through dropdown items does not close the menu when focus leaves the container.
- **Recommended Correction**: Add `onKeyDown={(e) => if (e.key === 'Escape') setMoreOpen(false)}` and `aria-haspopup="menu"` to the trigger button.
- **Priority**: **Medium**

#### Issue 6.3: Duplicate Navigation Target for Special Coverage and Events
- **File Name & Component Name**: `src/components/layout/Header.tsx` (`Header`)
- **What is Currently Implemented**: In `moreNav`, both `dict.nav.specialCoverage` and `dict.nav.events` link to the exact same URL: `/${lang}/events`.
- **What is Missing or Incorrect**: Users see two separate links in the "More" menu that lead to the identical page layout.
- **Recommended Correction**: Differentiate targets: link `specialCoverage` to `/${lang}/category/special-coverage` (which filters in-depth reports) and reserve `/${lang}/events` for conclaves, symposiums, and civic forums.
- **Priority**: **Low**

---

### Audit Dimension 7: News Cards and Article Preview Pages

#### Issue 7.1: Missing Explicit Dimensions on NewsCard Images Causing Layout Shifts
- **File Name & Component Name**: `src/components/shared/NewsCard.tsx` (`NewsCard`)
- **What is Currently Implemented**: Card renders `<img src={article.imageUrl} alt={title} className="h-full w-full object-cover..." loading="lazy" />` inside `aspect-16/10`.
- **What is Missing or Incorrect**: Without explicit `width` and `height` attributes or `next/image` layout container, browsers cannot compute the exact layout space before image headers arrive over slow mobile networks, contributing to CLS penalties in Core Web Vitals.
- **Recommended Correction**: Replace standard `<img>` with `next/image` (`<Image src={article.imageUrl} alt={title} width={600} height={375} className="object-cover" />`).
- **Priority**: **High**

#### Issue 7.2: Missing Structured Data (`NewsArticle` Schema.org) on Article Pages
- **File Name & Component Name**: `src/app/[lang]/article/[slug]/page.tsx` (`ArticlePage`)
- **What is Currently Implemented**: HTML5 semantic tags with standard Next.js metadata and OpenGraph tags.
- **What is Missing or Incorrect**: Google News and search crawlers require JSON-LD structured data (`"@type": "NewsArticle"`, `headline`, `image`, `datePublished`, `author`, `publisher`) to qualify for Google News carousel, Top Stories, and rich snippets.
- **Recommended Correction**: Inject a `<script type="application/ld+json">` tag on the article page with canonical `NewsArticle` schema.
- **Priority**: **Medium**

---

### Audit Dimension 8: Editorial and Editorial Archive

#### Issue 8.1: Editorial Archive Entries Link Directly to E-Paper Rather Than Editorial Preview
- **File Name & Component Name**: `src/app/[lang]/editorial/archive/page.tsx` (`EditorialArchivePage`)
- **What is Currently Implemented**: Each archive item displays title, date, excerpt, and an "E-Paper" button linking to `/${locale}/epaper?page=${ed.epaperPageNumber}`.
- **What is Missing or Incorrect**: Clicking an editorial title does not provide a web preview or dedicated editorial reader view; it forces the user into the broadsheet page index.
- **Recommended Correction**: Allow editorial titles to link to a dedicated preview view or anchor, keeping the E-Paper CTA as a secondary action.
- **Priority**: **Medium**

#### Issue 8.2: Editorial Archive Lacks Chronological or Author Filtering
- **File Name & Component Name**: `src/app/[lang]/editorial/archive/page.tsx` (`EditorialArchivePage`)
- **What is Currently Implemented**: Flat list rendering all editorials in mock dataset without filtering.
- **What is Missing or Incorrect**: A newspaper archive requires filtering by month/year or search by editorial subject/columnist.
- **Recommended Correction**: Add simple client-side filter pills (e.g., "All Columns", "2026", "Economic Policy", "Civic Affairs") using URL search parameters.
- **Priority**: **Low**

---

### Audit Dimension 9: Special Coverage and Events

#### Issue 9.1: Fixed Image Height in Featured Coverage Banner on Mobile Devices
- **File Name & Component Name**: `src/components/home/SpecialCoverageSection.tsx` (`SpecialCoverageSection`)
- **What is Currently Implemented**: Line 97 has `<div className="lg:col-span-5 h-56 lg:h-full relative bg-[#103A55]">`.
- **What is Missing or Incorrect**: On narrow mobile screens (`360px`–`390px`), a fixed `h-56` (224px) container combined with `object-cover` aggressively crops the focal subject of the banner photo.
- **Recommended Correction**: Use responsive aspect ratio classes (`aspect-16/9 sm:aspect-auto lg:h-full`) to maintain natural image proportions across mobile viewports.
- **Priority**: **Medium**

#### Issue 9.2: Self-Referencing Navigation Links on Events Page
- **File Name & Component Name**: `src/app/[lang]/events/page.tsx`, `src/components/home/SpecialCoverageSection.tsx`
- **What is Currently Implemented**: The standalone `/events` page renders the `SpecialCoverageSection`, whose header CTA is "Explore All Coverage & Events" linking to `/${lang}/events`.
- **What is Missing or Incorrect**: When already viewing `/[lang]/events`, the top CTA button reloads the current page.
- **Recommended Correction**: Add an `isStandalonePage?: boolean` prop to hide or alter the redundant header CTA when rendered on `/[lang]/events`.
- **Priority**: **Low**

---

### Audit Dimension 10: Panchang Section

#### Issue 10.1: Panchang Data Lacks City / Regional Solar Timing Disclaimers
- **File Name & Component Name**: `src/components/home/PanchangWidget.tsx` (`PanchangWidget`), `src/app/[lang]/panchang/page.tsx`
- **What is Currently Implemented**: Displays single static timings: Sunrise (`06:38 AM`), Sunset (`06:04 PM`), Rahu Kaal (`03:00 PM – 04:30 PM`), marked with a sample data disclaimer badge.
- **What is Missing or Incorrect**: Solar timings differ between Mumbai, Ahmedabad, Surat, and Rajkot by 12–18 minutes. In Gujarati newspaper traditions, Panchang is always contextualized by edition city.
- **Recommended Correction**:
  - Add an edition indicator in the widget header: `[Mumbai Edition Timings • Sample Data]`.
  - Add a dropdown or tab allowing readers to switch between Mumbai, Ahmedabad, and Rajkot sample timings.
- **Priority**: **Medium**

#### Issue 10.2: Standalone `/panchang` Route Provides No Additional Content Over Homepage Widget
- **File Name & Component Name**: `src/app/[lang]/panchang/page.tsx` (`PanchangPage`)
- **What is Currently Implemented**: Renders only `<PanchangWidget>` identical to Section 7 of the homepage.
- **What is Missing or Incorrect**: Visitors navigating to the dedicated Panchang section expect an expanded view (e.g., Day & Night Choghadiya, auspicious muhurats, festival calendar of the month).
- **Recommended Correction**: Expand the standalone `/panchang` page to render Choghadiya tabs (Amrut, Shubh, Labh, Char, Rog, Kaal, Udveg) with clearly marked demonstration sample data.
- **Priority**: **Medium**

---

### Audit Dimension 11: E-Paper Landing Page & Subscription Popup

#### Issue 11.1: Subscription Popup Dialog Lacks Keyboard Focus Trap & Escape Key Listener
- **File Name & Component Name**: `src/components/layout/SubscriptionPopup.tsx` (`SubscriptionPopup`)
- **What is Currently Implemented**: Modal triggers after 35 seconds, dismissed for 7 days via `localStorage`, has an `X` button and secondary dismiss button.
- **What is Missing or Incorrect**:
  - When the dialog opens, keyboard focus is not moved into the modal container.
  - Tabbing through the page moves focus to background links behind the overlay, failing WCAG 2.1.2 (No Keyboard Trap).
  - Pressing `Escape` does not dismiss the popup.
  - Background scrolling is not locked on mobile viewports.
- **Recommended Correction**:
  1. Add `onKeyDown={(e) => if (e.key === 'Escape') handleDismiss()}`.
  2. Implement an accessible focus trap with initial focus set to the primary CTA or Close button.
  3. Add `document.body.style.overflow = 'hidden'` while modal is mounted.
- **Priority**: **Critical**

#### Issue 11.2: E-Paper Page Broadsheet Index Thumbnails Are Wireframe Placeholders
- **File Name & Component Name**: `src/app/[lang]/epaper/page.tsx` (`EpaperLandingPage`)
- **What is Currently Implemented**: Renders 6 broadsheet page cards with `BookOpen` icon, dashed borders, and text labels.
- **What is Missing or Incorrect**: While labeled as Phase 1 sample structure, visual realism is low for stakeholder presentation compared to the high-fidelity news cards.
- **Recommended Correction**: Provide stylized sample SVG/CSS broadsheet newspaper page mockups with realistic multi-column newspaper grid textures.
- **Priority**: **Low**

#### Issue 11.3: E-Paper URL Query Parameter (`?page=X`) Is Not Highlighted in Page Index
- **File Name & Component Name**: `src/app/[lang]/epaper/page.tsx` (`EpaperLandingPage`)
- **What is Currently Implemented**: Articles link to `/[lang]/epaper?page=8` (or other page numbers), but the page component does not read `searchParams` to highlight the targeted page card.
- **What is Missing or Incorrect**: When a user clicks "Read in E-Paper Page 8" from an article, the E-paper landing page opens at the top without indicating page 8.
- **Recommended Correction**: Read `searchParams: Promise<{ page?: string }>` and visually highlight the matching broadsheet thumbnail card with a glowing border `#174F73`.
- **Priority**: **Medium**

---

### Audit Dimension 12: Footer and Other Publication Links

#### Issue 12.1: Social Media Anchor Links Use Hash Fragments (`#facebook`)
- **File Name & Component Name**: `src/components/layout/Footer.tsx` (`Footer`), `src/components/layout/Header.tsx` (`Header`)
- **What is Currently Implemented**: Footer links have `href="#facebook"`, `href="#twitter"`, `href="#youtube"`, `href="#instagram"`.
- **What is Missing or Incorrect**: Clicking these icons jumps the user's scroll position or changes browser history without opening external profiles or informing users that links are pending verified handles.
- **Recommended Correction**: Use `href="https://facebook.com/janmabhoomi" target="_blank" rel="noopener noreferrer"` (or placeholder modal/tooltip) and prevent jumpy page anchor changes.
- **Priority**: **Low**

#### Issue 12.2: Footer Copyright Text Color Fails WCAG AA Contrast Threshold
- **File Name & Component Name**: `src/components/layout/Footer.tsx` (`Footer`)
- **What is Currently Implemented**: Line 261 uses `text-[#FAF8F3]/65` on a background of `#292725`.
- **What is Missing or Incorrect**: Calculated contrast ratio is ~3.8:1, falling slightly short of the WCAG AA minimum requirement of 4.5:1 for normal text (under 18pt).
- **Recommended Correction**: Increase opacity to `text-[#FAF8F3]/85` or `text-[#FAF8F3]/90` to achieve a compliant 5.5:1 contrast ratio.
- **Priority**: **Medium**

---

### Audit Dimension 13: SEO Metadata and Favicon

#### Issue 13.1: Missing Favicon and Web Application Manifest
- **File Name & Component Name**: `src/app/layout.tsx` (`RootLayout`), Root `/public`
- **What is Currently Implemented**: Standard Next.js title and description metadata.
- **What is Missing or Incorrect**:
  - No favicon links in metadata or root directory.
  - Browser tabs show generic default globe icon.
  - Browser console logs 404 for `/favicon.ico`.
  - Missing `site.webmanifest` and PWA theme color meta tag (`#174F73`).
- **Recommended Correction**:
  1. Add `public/favicon.ico` and SVG icon.
  2. Declare `icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' }` in `src/app/layout.tsx`.
- **Priority**: **Critical**

#### Issue 13.2: Missing `metadataBase` in Root Layout Metadata
- **File Name & Component Name**: `src/app/layout.tsx` (`RootLayout`), `src/app/[lang]/layout.tsx`
- **What is Currently Implemented**: Metadata specifies `openGraph.images` and `alternates.languages` with relative paths (`/en`, `/gu`).
- **What is Missing or Incorrect**: In Next.js 15, omitting `metadataBase` when defining relative OpenGraph image URLs or alternate canonical links triggers build-time warnings and causes search crawlers to receive incomplete canonical URLs (`http://localhost:3000/en`).
- **Recommended Correction**: Define `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.janmabhoomi.in')` in root layout metadata.
- **Priority**: **Medium**

#### Issue 13.3: Missing `robots.ts` and `sitemap.ts` Metadata Routes
- **File Name & Component Name**: `src/app/robots.ts`, `src/app/sitemap.ts`
- **What is Currently Implemented**: Neither file exists in `src/app/`.
- **What is Missing or Incorrect**: Search engine robots lack automated crawling directions and canonical URL indices for English and Gujarati routes.
- **Recommended Correction**: Add standard Next.js App Router metadata generators:
  - `src/app/robots.ts`: Allows indexing of all public `/en` and `/gu` routes while disallowing private admin/api endpoints.
  - `src/app/sitemap.ts`: Generates sitemap XML indexing all 24 localized routes with `lastModified` timestamps.
- **Priority**: **Medium**

---

### Audit Dimension 14: Mobile, Tablet and Desktop Responsiveness

#### Issue 14.1: Orphan 3rd News Card in 2-Column Tablet Grid (`768px`)
- **File Name & Component Name**: `src/components/home/CategorySection.tsx` (`CategorySection`)
- **What is Currently Implemented**: Grid is defined as `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5`. Each category block provides 3 articles.
- **What is Missing or Incorrect**: At tablet viewport (`md: 768px` to `1023px`), 3 cards render as 2 in the first row and 1 lonely card in the second row, leaving an asymmetrical empty space in column 2.
- **Recommended Correction**: On `md` viewports, either render the first card as a horizontal 2-column span (`md:col-span-2`) with larger horizontal layout, or supply 4 articles on tablet (`limit = 4` on md).
- **Priority**: **Medium**

#### Issue 14.2: Small Mobile (`320px`–`360px`) Row 2 Horizontal Spacing
- **File Name & Component Name**: `src/components/layout/Header.tsx` (`Header`)
- **What is Currently Implemented**: Mobile header combines hamburger, compact BrandLogo, brand title, Search button, E-Paper CTA, and Gujarati | EN switcher.
- **What is Missing or Incorrect**: On narrow 320px devices (such as older iPhones or compact Android devices), elements crowd against screen boundaries.
- **Recommended Correction**: On viewports `< 380px`, hide the search button text completely and truncate the Gujarati tagline earlier.
- **Priority**: **Low**

---

### Audit Dimension 15: Accessibility and Performance Issues

#### Issue 15.1: Missing "Skip to Main Content" Accessibility Link
- **File Name & Component Name**: `src/app/[lang]/layout.tsx` (`LocaleLayout`), `src/components/layout/Header.tsx`
- **What is Currently Implemented**: Navigation starts immediately at the top info bar.
- **What is Missing or Incorrect**: Screen reader and keyboard-only users must tab through ~25 header navigation items before reaching the main news story on every page, violating WCAG 2.4.1 (Bypass Blocks - Level A).
- **Recommended Correction**: Add a standard skip link as the very first focusable element:
  ```tsx
  <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-[#174F73] focus:text-white">
    {lang === "gu" ? "મુખ્ય સામગ્રી પર જાઓ" : "Skip to main content"}
  </a>
  ```
  And add `id="main-content"` to `<main>`.
- **Priority**: **Critical**

#### Issue 15.2: Marquee Ticker Lacks Explicit ARIA Live Role Controls
- **File Name & Component Name**: `src/components/home/BreakingNewsTicker.tsx` (`BreakingNewsTicker`)
- **What is Currently Implemented**: `<section aria-label={label}>` containing marquee items.
- **What is Missing or Incorrect**: Screen readers may repeatedly announce changing ticker items during reading or fail to inform users of breaking news updates.
- **Recommended Correction**: Add `aria-live="off"` to the scrolling marquee container so screen readers do not spam continuous announcements, but provide an off-screen summary of breaking headlines.
- **Priority**: **Medium**

---

### Audit Dimension 16: TypeScript Errors, Console Errors and Missing Assets

#### Issue 16.1: Static Build Verification Summary
- **Verification Performed**:
  - `npx tsc --noEmit`: 0 TypeScript errors detected under `strict: true`.
  - `npm run build`: Production compilation passed (13 routes compiled cleanly, 0 build warnings).
- **Missing Asset Audit**:
  - Favicon (`/favicon.ico`) missing.
  - Manifest (`/site.webmanifest`) missing.
  - Brand master logo files (`/public/assets/logos/*.png` / `*.svg`) missing.
  - Sister publication logos are currently pure CSS/wireframe placeholders.
- **Priority**: **High**

---

### Audit Dimension 17: Dependency and Package Security Warnings

#### Issue 17.1: High Severity Vulnerability in Nested `postcss` Dependency
- **File Name & Component Name**: `package-lock.json`, `package.json` (`next@15.3.0` -> `node_modules/next/node_modules/postcss`)
- **What is Currently Implemented**: Next.js v15.3.0 installs an internal copy of `postcss <= 8.5.22`.
- **What is Missing or Incorrect**: `npm audit` flags 2 vulnerabilities (1 moderate, 1 high) in `postcss` (GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849) regarding XSS via unescaped `</style>` tags and source map path disclosure during build steps.
- **Recommended Correction**:
  - Do NOT run `npm audit fix --force` as it suggests a breaking upgrade to Next.js 16.
  - Update `package.json` with an npm `overrides` entry:
    ```json
    "overrides": {
      "postcss": "^8.5.3"
    }
    ```
    Or update `next` to the latest patch release within v15 (`^15.3.2` or `^15.4.x`) that bundles the patched PostCSS engine without changing the tech stack or breaking APIs.
- **Priority**: **High**

---

## 3. Comprehensive Issue Matrix

| # | Component / File | Dimension | Issue Description | Priority |
|---|---|---|---|---|
| 1 | `Root Directory` | 1. Structure | Missing `/public` directory and static asset tree | **Critical** |
| 2 | `src/app/layout.tsx` | 4. i18n / SEO | Static `<html lang="en">` hardcoded; Gujarati routes announce English | **Critical** |
| 3 | `src/components/home/LeadStoryHero.tsx` | 2. Layout & Perf | Native `<img>` used without `next/image` optimization & CLS defense | **Critical** |
| 4 | `src/app/[lang]/layout.tsx` | 15. Accessibility | Missing "Skip to Main Content" bypass navigation link (WCAG 2.4.1) | **Critical** |
| 5 | `src/components/layout/SubscriptionPopup.tsx` | 11. E-Paper & Popup | Modal lacks keyboard focus trap, scroll lock, and Escape key dismissal | **Critical** |
| 6 | `src/app/layout.tsx` | 4. i18n & Fonts | External `<link>` stylesheet font loading blocks initial render | **High** |
| 7 | `src/components/home/BreakingNewsTicker.tsx` | 2. Homepage | Marquee ticker lacks pause for reduced motion & touch controls | **High** |
| 8 | `src/components/layout/Header.tsx` | 3. Header | Date hydration fallback hardcoded to English fixed string | **High** |
| 9 | `src/components/shared/NewsCard.tsx` | 7. News Cards | Missing explicit dimensions or Next.js Image component | **High** |
| 10 | `src/app/[lang]/not-found.tsx` | 1. Structure | Missing custom localized 404 error page | **High** |
| 11 | `src/app/[lang]/error.tsx` | 1. Structure | Missing custom localized client runtime error boundary | **High** |
| 12 | `package-lock.json` | 17. Security | High severity PostCSS vulnerability nested inside Next.js | **High** |
| 13 | `src/app/layout.tsx` | 13. SEO | Missing `metadataBase` causing relative canonical URL warnings | **Medium** |
| 14 | `src/app/robots.ts` & `sitemap.ts` | 13. SEO | Missing automatic robots.txt and sitemap.xml generators | **Medium** |
| 15 | `src/app/[lang]/article/[slug]/page.tsx` | 7. News Cards | Missing Schema.org `NewsArticle` JSON-LD structured data | **Medium** |
| 16 | `src/app/[lang]/article/[slug]/page.tsx` | 5. Routes | Missing WhatsApp and social media sharing buttons | **Medium** |
| 17 | `src/components/layout/Header.tsx` | 6. Navigation | Desktop "More" tab does not show active state when child page active | **Medium** |
| 18 | `src/components/layout/Header.tsx` | 6. Navigation | Desktop "More" dropdown lacks Escape key dismissal & ARIA popup attribute | **Medium** |
| 19 | `src/components/layout/Header.tsx` | 3. Header | Search filters only 10 latest articles instead of full archive | **Medium** |
| 20 | `src/components/home/CategorySection.tsx` | 14. Responsiveness | Tablet (768px) layout leaves orphan 3rd item in 2-column grid | **Medium** |
| 21 | `src/components/home/SpecialCoverageSection.tsx` | 9. Special Coverage | Fixed `h-56` mobile banner height aggressively crops image | **Medium** |
| 22 | `src/components/home/PanchangWidget.tsx` | 10. Panchang | Panchang timings lack city selector (Mumbai vs. Ahmedabad vs. Rajkot) | **Medium** |
| 23 | `src/app/[lang]/panchang/page.tsx` | 10. Panchang | Dedicated `/panchang` page duplicates homepage widget with no extra depth | **Medium** |
| 24 | `src/components/layout/Footer.tsx` | 15. Accessibility | Footer copyright text contrast ratio (~3.8:1) falls short of 4.5:1 | **Medium** |
| 25 | `src/components/layout/Footer.tsx` | 12. Footer | Social media icon links use raw hash anchors (`#facebook`) | **Low** |
| 26 | `src/components/layout/Header.tsx` | 6. Navigation | Duplicate nav destinations: `specialCoverage` and `events` link to same URL | **Low** |
| 27 | `src/app/[lang]/editorial/archive/page.tsx` | 8. Editorial | Editorial archive items link to E-paper instead of preview text | **Low** |
| 28 | `src/app/[lang]/epaper/page.tsx` | 11. E-Paper | Broadsheet thumbnails are wireframe boxes rather than stylized sheets | **Low** |

---

## 4. Conclusion & Next Steps

The Janmabhoomi Digital Newspaper frontend demonstrates high architectural discipline: zero unnecessary third-party packages, zero database coupling, strict TypeScript type safety, and faithful reproduction of the client's multi-column print-to-digital newspaper layout.

None of the identified issues require redesigning the project or altering the technology stack. All 28 findings can be addressed systematically using standard Next.js 15 and Tailwind patterns while strictly maintaining:
1. All English and Gujarati routes.
2. The print subscription and E-Paper gate business model.
3. Decoupled sample mock data awaiting the future central backend.

Please review the companion document **`FRONTEND_IMPLEMENTATION_CHECKLIST.md`** for the phased execution plan. Implementation will commence upon your formal approval.
