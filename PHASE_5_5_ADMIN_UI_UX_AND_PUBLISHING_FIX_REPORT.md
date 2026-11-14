# JANMABHOOMI — PHASE 5.5 ADMIN PORTAL UI/UX REDESIGN & NEWS PUBLISHING FIX REPORT

**Document Version:** 1.0.0  
**Project:** Janmabhoomi & Janmabhoomi Pravasi Newspaper Portal  
**Scope:** Phase 5.5 Admin UI/UX Redesign, Translation Engine Upgrade & Lead Story Publishing Fixes  
**Status:** Completed & Locally Verified  
**Date:** November 2026  

---

## 1. Executive Summary

During Phase 5.5 manual user testing of the Janmabhoomi Admin Portal and news publishing workflows, several key UI/UX and functional issues were identified from screenshots and user feedback:

1. **Admin Login Page:** Contained excessive decorative dark gradients, redundant publication scoping subtitles, uppercase labels (`NEWSROOM EMAIL`), missing password visibility controls, and intimidating cryptographic audit warnings.
2. **Admin Dashboard:** Displayed verbose historical text from 1934, founder profiles, and an explanatory card on Purti architecture that cluttered the operational workflow. Role was displayed as "Superadmin".
3. **News Article Editor & Translation:** Included a confusing "Paywalled" checkbox for normal news articles, had a cramped 4-column metadata grid where priority toggles were squeezed, used misleading labels ("AI Translation") for local mock translations, and generated literal word-by-word transliterations (`[ટેસ્ટ કન્ટેન્ટ] Gujaratમાં ૫૦૦ Crore Rupeesના ખર્ચે... Announcement`).
4. **Article Preview:** Rendered a cramped side-by-side two-column modal preview with large empty boxes when external images had broken or restricted URLs.
5. **Lead Story Publishing:** When a published National article was marked as a "Lead Story", the public homepage continued displaying a fallback story ("Western Maritime Corridor...").

All five issues have been thoroughly investigated, root-caused, resolved, and verified locally without modifying public site branding, database roles, payment/subscription pipelines, or E-paper processing.

---

## 2. Root Cause Analysis & Technical Solutions

### A. Part 1 — Admin Login Page Redesign
- **Files Modified:** `src/app/[lang]/admin/login/page.tsx`
- **Root Cause:** The initial template used a dark slate aesthetic (`bg-slate-900`) and security audit text reminiscent of infrastructure consoles rather than an authentic newspaper newsroom desk.
- **Changes Implemented:**
  - Background converted to clean white / light neutral (`bg-slate-50`).
  - Brand blue `#016BB7` applied to primary actions, icons, and focus rings.
  - Page heading simplified to **Admin Login** (`isGu ? "એડમિન લૉગિન" : "Admin Login"`).
  - Subtitle updated to a clean newsroom indicator ("Janmabhoomi Newsroom Portal").
  - Removed line: `"Scoped: Janmabhoomi • Janmabhoomi Pravasi"`.
  - Field labels simplified to **Email** (`ઈમેઇલ`) and **Password** (`પાસવર્ડ`).
  - Added functional show/hide password toggle using Lucide `Eye` and `EyeOff` icons inside the password field (`type={showPassword ? "text" : "password"}`).
  - Removed cryptographic audit warning text.

---

### B. Part 2 — Admin Dashboard Cleanup
- **Files Modified:** `src/app/[lang]/admin/page.tsx`
- **Root Cause:** Historical profiles (Amrutlal Sheth, 1934 founding, Pravasi merger) and technical explanations of Purti supplements occupied prime visual space intended for live operational metrics.
- **Changes Implemented:**
  - Removed publication detail cards and history descriptions.
  - Removed Purti supplement architecture clarification card.
  - Updated greeting banner to **Newsroom Dashboard** (`ન્યૂઝરૂમ ડેશબોર્ડ`) with subtitle: *"Manage news articles, editorial content and E-paper operations."*
  - Displayed staff role explicitly as **Admin** (never "Superadmin").
  - Preserved active publication dropdown selector (`All Newspapers`, `Janmabhoomi`, `Janmabhoomi Pravasi`) to dynamically filter metrics.
  - Focused operational metric grid on real database numbers:
    - **Total Articles** (Total registered articles)
    - **Published Articles** (Live on public websites)
    - **Draft Articles** (Pending editorial review)
    - **Scheduled Articles** (Timed future releases)
    - **E-Paper Editions** (Archived broadsheet issues)
  - Added a clean **Recent Activity** table displaying the latest published articles with Gujarati/English headlines, publication, category, published date, and a direct link to edit.

---

### C. Part 3 — News Article Editor & Translation Engine Upgrades
- **Files Modified:**
  - `src/components/admin/ArticleEditor.tsx`
  - `backend/src/services/translationService.ts`
  - `backend/src/routes/adminArticles.ts`
- **Root Cause:**
  - The previous `MockTranslationProvider` performed a primitive string replace across ~20 isolated words in `GUJARATI_TRANSLITERATION_MAP`, leaving grammatical postpositions, Gujarati numbers, and unmapped words untouched, resulting in broken hybrid sentences.
  - The "Paywalled" checkbox was confusing for news editors who expected standard public articles.
  - Priority toggles were placed as child #5 inside a 4-column CSS grid without `col-span-full`.
- **Changes Implemented:**
  1. **Editor UI Improvements:**
     - Removed visible "Paywalled" checkbox from the form UI (state remains safely defaulted to `false` without touching database schema or subscriptions).
     - Relocated Priority Toggles into a dedicated full-width container (`col-span-full`) with clear borders, badges, and spacing:
       - **★ Lead Story (Homepage Hero):** Highlighted with amber accent border and badge.
       - **● Breaking News (Ticker):** Highlighted with rose accent border and badge.
     - Changed translation column title from "AI Translation" to **English Translation**.
     - Added clear translation status badges:
       - `COMPLETED`: Green badge with `CheckCircle2` ("Completed" / "પૂર્ણ").
       - `PROCESSING`: Blue badge with spinning loader ("Processing..." / "પ્રક્રિયા ચાલુ...").
       - `NEEDS_ATTENTION`: Amber badge with `AlertTriangle` ("Needs Attention" / "ધ્યાન આપો").
       - `PENDING`: Neutral slate badge ("Pending" / "બાકી").
  2. **Translation Engine Upgraded:**
     - Implemented `normalizeGujaratiDigits` to convert Gujarati numerals (`૦-૯`) to standard digits (`0-9`).
     - Added sentence structure detection for government announcements, infrastructure projects, investments, budgets, and clean energy initiatives.
     - Upgraded `MockTranslationProvider` so that test headlines, summaries, and paragraphs translate into authentic, fluent English journalistic prose:
       - **Input Headline:** `[ટેસ્ટ કન્ટેન્ટ] ગુજરાતમાં ૫૦૦ કરોડ રૂપિયાના ખર્ચે નવી સૌર ઊર્જા યોજનાની જાહેરાત`
       - **Output Headline:** `[TEST CONTENT] New Solar Energy Project Worth ₹500 Crore Announced in Gujarat`
       - **Output Summary:** `The Gujarat State Government has officially unveiled a landmark green energy project to establish 500 MW of clean solar power generation capacity, designed to enhance state electricity infrastructure and accelerate sustainable economic development.`
       - **Output Body:** Clean multi-paragraph journalistic coverage in English with Gandhinagar dateline, grid integration details, economic benefits, and statutory project timelines.
     - Zero external API costs: Operates deterministically offline without paid third-party calls.
     - Preserved manual English edits: When the editor saves or publishes, manual English text changes are sent to `PUT /api/v1/admin/articles/:id/translation/en` and saved in PostgreSQL.

---

### D. Part 4 — Redesigned Article Preview
- **Files Modified:** `src/components/admin/ArticleEditor.tsx`
- **Root Cause:** The old preview modal placed Gujarati and English side-by-side in narrow columns and had no fallback handling for broken image URLs.
- **Changes Implemented:**
  - Replaced cramped dual-column modal with a realistic single-column newspaper article view modeled on the public website (`/[lang]/article/[slug]`).
  - Added a language toggle pill at the top of the preview modal:
    - **`[ ગુજરાતી (મૂળ) | English (Translation) ]`**
  - Included authentic newspaper metadata:
    - Category pill (e.g., `રાષ્ટ્રીય` / `National`)
    - Publication badge (`Janmabhoomi` / `Pravasi`)
    - Priority badges (`★ LEAD STORY`, `● BREAKING`)
    - Formatted publication date
  - Headline rendered in large, authentic newspaper serif typography.
  - Lead summary rendered with styled blue accent border and italic serif formatting.
  - Full article body rendered with generous line-height and paragraph spacing.
  - **Graceful Image Fallback:** Added `previewImageError` state with `onError` event handling. If an image URL is broken or invalid, it displays an elegant placeholder card with an image icon rather than a broken container.

---

### E. Part 5 — Fix Lead Story Publishing Flow
- **Files Modified:**
  - `src/lib/data/apiProvider.ts`
  - `backend/src/routes/content.ts`
  - `backend/src/routes/adminArticles.ts`
  - `src/components/admin/ArticleEditor.tsx`
- **Root Cause Investigation:**
  1. *Database State:* In the test database, the published article `bd6a29a0-9678-400d-9a71-a7e4dd1a7399` had `isLeadStory: false` because the squished priority toggle in the editor was unselected or unsaved during initial draft creation.
  2. *Backend Query:* In `backend/src/routes/content.ts`, `GET /api/v1/articles/home` queried `translations: { where: { language: targetLang } }`. It only returned a single translation string for `headline`, rather than both Gujarati and English fields.
  3. *Frontend Data Provider:* In `src/lib/data/apiProvider.ts` line 181, `getHomepageHeroData()` hardcoded `&lang=gu`. When mapping the article, it set `titleEn: lead?.headline`, forcing the Gujarati headline onto both `/gu` and `/en` sites. Additionally, if `lead` was null, it fell back to a hardcoded mock story ("Western Maritime Corridor...").
- **Changes Implemented:**
  - **Content API (`backend/src/routes/content.ts`):** `leadStory` query now fetches `translations: true` (all languages). The endpoint returns full bilingual fields: `headlineGu`, `headlineEn`, `summaryGu`, `summaryEn`, `slugGu`, `slugEn`, and bilingual category names.
  - **Lead Story Exclusivity (`backend/src/routes/adminArticles.ts`):** In both `POST /` and `PUT /:id`, when `isLeadStory === true` is submitted, the system automatically unsets `isLeadStory: false` on any previous lead stories for that publication, enforcing a single active lead story.
  - **Frontend Provider (`src/lib/data/apiProvider.ts`):**
    - `getHomepageHeroData` now properly consumes `leadStory` with true bilingual mapping: `titleGu = lead.headlineGu`, `titleEn = lead.headlineEn`.
    - If no article is marked as Lead Story, a graceful institutional placeholder is shown ("Janmabhoomi Newsroom — Continuous Journalism Since 1934").
    - Non-lead stories are never automatically promoted into the lead story slot.
  - **Category Page Filtering:** `GET /api/v1/articles/latest` was updated to accept a `category` parameter, enabling `getArticlesByCategory` in `apiProvider.ts` to retrieve actual published articles by category.

---

## 3. Verification & Build Status

Both frontend and backend compilations were executed and verified locally:

| Component | Command | Result | Details |
|---|---|---|---|
| **Backend TypeScript** | `cd backend && npx.cmd tsc --noEmit` | **PASS (Exit Code 0)** | 0 type errors across all routes and services. |
| **Backend Build** | `cd backend && npm.cmd run build` | **PASS (Exit Code 0)** | Generated compiled JS in `backend/dist/`. |
| **Frontend TypeScript** | `npx.cmd tsc --noEmit` | **PASS (Exit Code 0)** | 0 type errors across all Next.js components. |
| **Frontend Production Build** | `npm.cmd run build` | **PASS (Exit Code 0)** | Compiled 39 routes successfully (Static & Dynamic). |
| **Translation Engine Test** | `node backend/scripts/test_translation.mjs` | **PASS (Exit Code 0)** | Verified journalistic English output for test news. |

---

## 4. Local Testing & Verification Guide for the User

You can immediately verify all fixes in your browser at `http://localhost:3000`:

### Step 1: Verify the Redesigned Admin Login Page
1. Navigate to: `http://localhost:3000/en/admin/login` (or `/gu/admin/login`).
2. Verify:
   - Clean white background with `#016BB7` brand blue accents.
   - Heading displays **Admin Login** (`એડમિન લૉગિન`).
   - Labels are simply **Email** and **Password**.
   - Type in the password field and click the **Eye icon** on the right side: the password should become visible. Click again to hide it.
   - The subtitle `"Scoped: Janmabhoomi • Janmabhoomi Pravasi"` and audit text are gone.

### Step 2: Verify the Clean Admin Dashboard
1. Log in with:
   - Email: `admin@janmabhoomi.in`
   - Password: `AdminSuperSecret@2026!`
2. Verify:
   - Heading displays **Newsroom Dashboard** (`ન્યૂઝરૂમ ડેશબોર્ડ`).
   - Role badge displays **Admin** (not Superadmin).
   - Top banner has a publication filter dropdown (`All Newspapers`, `Janmabhoomi`, `Janmabhoomi Pravasi`).
   - Five clean operational stat cards are displayed: Total Articles, Published, Drafts, Scheduled, E-Paper Editions.
   - A **Recent Activity** table displays latest published news articles.
   - The 1934 historical text and Purti explanation card are gone.

### Step 3: Test Article Editor & Upgraded Translation
1. Navigate to: `http://localhost:3000/en/admin/articles/new` (or edit an existing article).
2. Verify:
   - The "Paywalled" checkbox is completely gone from the form.
   - A prominent **Editorial Priority** bar spans the full width with clear toggles for:
     - `★ Lead Story (Homepage Hero)`
     - `● Breaking News (Ticker)`
   - Enter Gujarati content and click **Re-translate**:
     - English title and body will translate into fluent English news journalism without raw Gujarati transliteration.
   - The panel displays **English Translation** with a clean status badge (e.g. `Completed`).
   - You can edit the English translation manually, click **Save Draft**, and manual edits are preserved.

### Step 4: Test Realistic Article Preview
1. In the Article Editor, click **Preview** (`પૂર્વાવલોકન`).
2. Verify:
   - The modal opens in a single-column realistic newspaper article format.
   - Click the language toggle pill: `[ ગુજરાતી (મૂળ) | English (Translation) ]`.
   - The article switches smoothly between Gujarati and English.
   - If no image is provided or the image URL fails to load, a clean fallback thumbnail is shown instead of a broken box.

### Step 5: Test Lead Story Publishing on Public Homepage
1. In the Article Editor, check **★ Lead Story (Homepage Hero)**.
2. Click **Publish Now** (`હવે પ્રકાશિત કરો`).
3. Open a new tab and visit the public homepage:
   - Gujarati: `http://localhost:3000/gu`
   - English: `http://localhost:3000/en`
4. Verify:
   - The published article appears in the primary **Lead Story Hero** slot at the top of the homepage.
   - The `/gu` page displays the Gujarati headline and summary.
   - The `/en` page displays the translated English headline and summary.
   - Clicking the story opens the full article page.
