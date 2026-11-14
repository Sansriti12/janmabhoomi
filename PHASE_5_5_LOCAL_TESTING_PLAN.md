# JANMABHOOMI — PHASE 5.5 COMPLETE LOCAL TESTING PLAN

**Project:** Saurashtra Trust — Janmabhoomi Digital Newspaper Platform  
**Phase:** 5.5 Comprehensive Local End-to-End Testing  
**Created:** November 13, 2026  
**Status:** READY FOR EXECUTION  
**Environment:** Local Development (Frontend: Next.js :3000, Backend: Fastify :4000, Database: PostgreSQL 16 Alpine :5432)

---

## 1. Testing Framework & Methodology

This plan defines the end-to-end verification protocol for the Janmabhoomi digital newspaper platform before Phase 6 production deployment.

### Test Record Structure
Each test case contains:
1. **Test ID:** Unique alphanumeric code (e.g., `TC-PUB-01`).
2. **Feature:** Targeted component or subsystem function.
3. **Preconditions:** Required initial state, services, or credentials.
4. **Steps:** Numbered, reproducible execution steps.
5. **Expected Result:** Clear, unambiguous pass criterion.
6. **Actual Result:** Outcome recorded during test execution.
7. **Status:** `Pending`, `Pass`, `Fail`, or `Blocked`.
8. **Evidence / Error Details:** Log entries, HTTP status codes, or screenshot references.

---

## SECTION A: Public Website Testing (Bilingual Gujarati & English)

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Evidence / Error Details |
|---|---|---|---|---|---|---|---|
| **TC-PUB-01** | Gujarati Homepage Rendering (`/gu`) | Frontend running on port 3000 | 1. Navigate to `http://localhost:3000/gu`<br>2. Inspect title, masthead, language indicator, and navigation bar. | Page loads with HTTP 200. Gujarati masthead displayed, brand blue banner `#016BB7` active, Gujarati font rendered cleanly. | Pending | | |
| **TC-PUB-02** | English Homepage Rendering (`/en`) | Frontend running on port 3000 | 1. Navigate to `http://localhost:3000/en`<br>2. Inspect masthead and category labels. | Page loads with HTTP 200. English labels rendered, typography switches cleanly to English Latin script. | Pending | | |
| **TC-PUB-03** | Language Switcher Parity | Homepage loaded | 1. On `/gu`, click English switcher in header.<br>2. On `/en`, click ગુજરાતી switcher in header. | Seamless client-side route transition between `/gu` and `/en` without full page refresh error. | Pending | | |
| **TC-PUB-04** | Breaking News Ticker | Homepage loaded | 1. Inspect top breaking news ticker banner.<br>2. Verify headline animation and click action. | Breaking news headline ticker scrolls smoothly with latest alerts. Clicking navigates to relevant article. | Pending | | |
| **TC-PUB-05** | Lead Story Hero Section | Homepage loaded | 1. Inspect main hero lead story and 2 sub-lead stories.<br>2. Verify headline, teaser, author badge, and timestamp. | Lead story prominently rendered with high-res image, clear Gujarati/English typography, and clickable link. | Pending | | |
| **TC-PUB-06** | Category Section Grid | Homepage loaded | 1. Scroll through homepage sections (National, International, Gujarat, Mumbai, Business, Sports, Entertainment, Lifestyle).<br>2. Check card layout. | News cards render clean 3-4 column grid with images, bilingual category badges, and publication timestamps. | Pending | | |
| **TC-PUB-07** | Category Detail Page (`/[lang]/category/[slug]`) | Homepage loaded | 1. Click category link `/gu/category/national`.<br>2. Verify article list and breadcrumb navigation. | Returns HTTP 200. Displays paginated list of articles filtered strictly by the chosen category. | Pending | | |
| **TC-PUB-08** | Article Detail Page (`/[lang]/article/[slug]`) | Homepage loaded | 1. Click any news card to open detail view.<br>2. Check headline, byline, date, main image, caption, body paragraphs, and social share bar. | Returns HTTP 200. Clean editorial layout, Noto Sans Gujarati font, legible font size (18-20px), working social share buttons. | Pending | | |
| **TC-PUB-09** | Daily Panchang Widget | Homepage loaded | 1. Inspect homepage Panchang widget.<br>2. Click city selector (Mumbai, Ahmedabad, Rajkot).<br>3. Navigate to `/gu/panchang`. | Displays Tithi, Nakshatra, Sunrise, Sunset, Rahukaal, Shubh Muhurat. Multi-city selector updates values reactively. | Pending | | |
| **TC-PUB-10** | Editorial Section & Archive | Homepage loaded | 1. Visit `/gu/editorial`.<br>2. Check today's editorial by Chief Editor.<br>3. Navigate to `/gu/editorial/archive`. | Today's editorial rendered prominently. Archive lists historical editorials sorted in reverse chronological order. | Pending | | |
| **TC-PUB-11** | Sister Publications Showcase | Homepage loaded | 1. Scroll to Sister Publications carousel/section on homepage.<br>2. Verify links to Janmabhoomi Pravasi, Vyapar, Phulchhab, Kutchmitra. | All 8 sister publications displayed with authentic logos, founded years, and external or internal routing links. | Pending | | |
| **TC-PUB-12** | Archive Enquiry Submission Form | Frontend running | 1. Navigate to `/gu/archive-enquiry`.<br>2. Fill full name, email, phone, requested year (e.g. 1947), publication name, and purpose.<br>3. Submit form. | Validates required inputs. Submits via POST API or service, displays clear success confirmation modal/banner. | Pending | | |
| **TC-PUB-13** | Static Information Pages | Frontend running | 1. Visit `/en/about`, `/en/contact`, `/en/events`, `/en/privacy-policy`, `/en/terms-conditions`. | All informational pages load cleanly with HTTP 200, proper metadata, and consistent header/footer layout. | Pending | | |
| **TC-PUB-14** | SEO Meta Tags & Sitemap/Robots | Frontend running | 1. Inspect `<head>` tags of `/gu` and `/en`.<br>2. Fetch `http://localhost:3000/robots.txt` and `http://localhost:3000/sitemap.xml`. | Canonical URLs, OpenGraph tags, JSON-LD NewsArticle structured data, robots.txt, and valid XML sitemap returned. | Pending | | |

---

## SECTION B: E-Paper Testing (Management & Public Reader)

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Evidence / Error Details |
|---|---|---|---|---|---|---|---|
| **TC-EPA-01** | Public E-Paper Landing Page | Frontend running | 1. Navigate to `http://localhost:3000/gu/epaper`.<br>2. Check edition date, publication selector, and broadsheet preview. | Page renders HTTP 200. Default edition loaded, broadsheet front page thumbnail visible. | Pending | | |
| **TC-EPA-02** | Publication Edition Switcher | E-paper page loaded | 1. Switch between Janmabhoomi (Daily) and Janmabhoomi Pravasi (Sunday Weekly).<br>2. Check date picker. | Editions reload cleanly with publication-specific issue number, quarter, and city edition name. | Pending | | |
| **TC-EPA-03** | Broadsheet Reader Navigation | E-paper page loaded | 1. Click Next Page arrow (`>`).<br>2. Click Previous Page arrow (`<`).<br>3. Click page thumbnail in bottom rail.<br>4. Enter page number in quick jump input. | Active page transitions instantly. Thumbnail rail highlights current page index. Page counter updates (e.g. "Page 2 of 12"). | Pending | | |
| **TC-EPA-04** | Reader Zoom & Pan Controls | E-paper page loaded | 1. Click Zoom In (`+`).<br>2. Click Zoom Out (`-`).<br>3. Click Fit to Screen.<br>4. Drag zoomed canvas to pan across columns. | Canvas scales smoothly from 100% to 300%. Pan dragging responds smoothly without image distortion. | Pending | | |
| **TC-EPA-05** | Free Preview Boundary (Pages 1 & 2) | Unauthenticated user | 1. View Page 1 (Front Page).<br>2. Navigate to Page 2. | Pages 1 and 2 load in full high resolution without paywall barrier or login prompt. | Pending | | |
| **TC-EPA-06** | Paywall Barrier on Page 3+ | Unauthenticated user | 1. Attempt to navigate to Page 3 of the broadsheet edition. | High-res image is blocked. Modal or paywall card triggers: "Subscribe or Sign In to Read Full Edition". Page 3+ restricted. | Pending | | |
| **TC-EPA-07** | Interactive Hotspots Display | E-paper page loaded | 1. Enable hotspot overlay toggle in reader toolbar.<br>2. Hover over defined article clipping area. | Interactive bounding boxes highlight editorial areas. Tooltip displays headline. Clicking opens article preview modal. | Pending | | |
| **TC-EPA-08** | Admin E-Paper PDF Upload Pipeline | Backend running, Admin logged in | 1. In Admin Panel, navigate to `/en/admin/epaper`.<br>2. Select Publication, Edition Date, City.<br>3. Upload broadsheet PDF file.<br>4. Submit upload form. | Backend validates `%PDF-` magic bytes, extracts page count via `pdf-lib`, rasterizes broadsheet pages at 150 DPI into PNGs, generates thumbnails, saves to `storage/epaper`, and marks edition `READY`. | Pending | | |
| **TC-EPA-09** | Admin Hotspot Creation & Bounding Box Editor | Edition created in Admin | 1. In Admin Panel, open Hotspot Editor for Page 1.<br>2. Drag mouse to draw rectangular bounding box.<br>3. Attach article link or headline.<br>4. Click Save. | Hotspot coordinates (`xPercent`, `yPercent`, `widthPercent`, `heightPercent`) saved to database with FK link to `e_paper_pages`. Boundary check (<= 100%) enforced. | Pending | | |
| **TC-EPA-10** | E-Paper Edition Publishing Workflow | Edition in READY status | 1. Click "Publish Edition" in Admin Panel.<br>2. Check status change from `READY` to `PUBLISHED`.<br>3. Check public reader. | Status updates to `PUBLISHED`. Newly published edition appears immediately on public `/epaper` route. | Pending | | |

---

## SECTION C: Admin Panel & Staff Management Testing

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Evidence / Error Details |
|---|---|---|---|---|---|---|---|
| **TC-ADM-01** | Staff Login Authentication | Backend running | 1. Navigate to `/en/admin/login`.<br>2. Enter invalid credentials.<br>3. Enter valid administrator credentials. | Invalid credentials return HTTP 401 with error message. Valid credentials authenticate, issue bearer token, store session in `staff_sessions`, and redirect to `/en/admin`. | Pending | | |
| **TC-ADM-02** | Admin Dashboard Metrics | Admin logged in | 1. Visit `/en/admin`.<br>2. Inspect dashboard cards: Total Articles, Published Today, E-Paper Editions, Active Subscribers, Revenue. | Dashboard loads with HTTP 200. Real metrics aggregate correctly from database models via `GET /api/v1/admin/dashboard`. | Pending | | |
| **TC-ADM-03** | Publication Scope Restriction | Admin logged in | 1. Navigate to `/en/admin/publications`.<br>2. Verify available publications list. | Only `pub-janmabhoomi` (Janmabhoomi Daily) and `pub-pravasi` (Janmabhoomi Pravasi Sunday) are listed and manageable. Purti is correctly treated as a supplement, and sister portals are excluded. | Pending | | |
| **TC-ADM-04** | Staff Member Listing & Roles | Admin logged in | 1. Navigate to `/en/admin/staff`.<br>2. Inspect staff table columns: Name, Email, Role, Status, Last Login, Actions. | Displays all staff users. Unified roles ("Admin" vs "Editor") displayed clearly alongside underlying database role IDs. | Pending | | |
| **TC-ADM-05** | Create New Staff Member | Admin logged in | 1. In Staff Management, click "Add Staff Member".<br>2. Enter Name, Email, Password, select Role (Administrator or Editor).<br>3. Submit form. | Backend hashes password via scrypt, creates user record in `users` with `isStaff=true`, associates `user_roles`, and logs creation in `audit_logs`. | Pending | | |
| **TC-ADM-06** | Deactivate / Suspend Staff Member | Admin logged in | 1. Select a test staff member.<br>2. Click Deactivate.<br>3. Confirm modal. | Staff status changes to `SUSPENDED` or `INACTIVE`. Existing sessions invalidated. Staff member blocked from subsequent login. | Pending | | |
| **TC-ADM-07** | Category Management | Admin logged in | 1. Navigate to `/en/admin/categories`.<br>2. View category list, edit display order, update Gujarati title. | Categories update successfully via `PUT /api/v1/admin/categories/:id`. Display order reflected on public navigation. | Pending | | |
| **TC-ADM-08** | Media Library Upload & Browsing | Staff logged in | 1. Navigate to `/en/admin/media`.<br>2. Upload JPEG/PNG news photo.<br>3. Inspect media grid, copy image URL. | Image uploads to `storage/media`, metadata recorded in `media_assets` table, thumbnail rendered in grid, URL accessible. | Pending | | |
| **TC-ADM-09** | Contact & Archive Enquiry Management | Admin logged in | 1. Navigate to `/en/admin/enquiries/archive` and `/en/admin/enquiries/contact`.<br>2. Change enquiry status to `IN_REVIEW` or `COMPLETED`. | Enquiries displayed with customer details. Status transitions persist in database with timestamp. | Pending | | |
| **TC-ADM-10** | System Audit Log Inspection | Admin logged in | 1. Navigate to `/en/admin/audit`.<br>2. Inspect audit events (Logins, Article Edits, E-Paper Uploads, Role Updates). | Immutable audit log displays timestamp, user email, IP address, action type, and JSON change diff. | Pending | | |

---

## SECTION D: Newsroom CMS & Translation Engine Testing

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Evidence / Error Details |
|---|---|---|---|---|---|---|---|
| **TC-CMS-01** | Article Management Dashboard | Editor/Admin logged in | 1. Navigate to `/en/admin/articles`.<br>2. Filter by publication (Janmabhoomi vs Pravasi), status (Draft, Published, Scheduled), category. | Paginated article table loads with status badges, Gujarati/English titles, author byline, and creation date. | Pending | | |
| **TC-CMS-02** | Gujarati Article Drafting | Editor logged in | 1. Click "New Article" (`/en/admin/articles/new`).<br>2. Select Publication, Category, Author.<br>3. Enter Gujarati Headline, Gujarati Summary, Gujarati Rich Text Content.<br>4. Click "Save Draft". | Article created in `articles` table with status `DRAFT`. Slugs generated cleanly from headline or timestamp. | Pending | | |
| **TC-CMS-03** | Automatic Gujarati-to-English Translation | Draft article opened | 1. In Article Editor, click "Translate to English" button.<br>2. Observe translation progress and populated English fields. | Translation engine executes, populates English Headline, English Summary, and English HTML content while preserving paragraph breaks and structure. | Pending | | |
| **TC-CMS-04** | Lexicon & Entity Preservation in Translation | Article Editor | 1. Draft Gujarati text containing key regional entities ("મુંબઈ", "રાજકોટ", "રૂપિયા", "કરોડ", "મુખ્યમંત્રી").<br>2. Click Translate. | Transliteration engine maps entities accurately to "Mumbai", "Rajkot", "Rupees", "Crore", "Chief Minister". Numbers preserved. | Pending | | |
| **TC-CMS-05** | Translation Quality & Fact Check Engine | Article Editor | 1. Run translation on article containing numeric facts (e.g., "૨૫૦ કરોડ", "૧૫ ટકા").<br>2. Review Quality Check panel. | Automated quality check compares source numbers vs translated numbers, flags missing paragraphs, and reports `COMPLETED` or `NEEDS_ATTENTION`. | Pending | | |
| **TC-CMS-06** | Sensitive Taxonomy Detection | Article Editor | 1. Draft article containing sensitive keywords (Crime, Court/Legal, Political Allegations, Financial Markets, Disaster).<br>2. Click Translate. | Quality check flags `sensitiveContentDetected: true`, identifies category (e.g. `Crime`, `Court_Legal`), and prompts editor for manual sign-off. | Pending | | |
| **TC-CMS-07** | Immediate Article Publishing | Editor logged in | 1. With complete Gujarati and English content, click "Publish Now".<br>2. Verify article status. | Status updates to `PUBLISHED`, `publishedAt` timestamp recorded, article appears immediately on public `/gu` and `/en` homepages. | Pending | | |
| **TC-CMS-08** | Scheduled News Publishing | Editor logged in | 1. Set publication time 3 minutes in the future.<br>2. Click "Schedule Article".<br>3. Wait 3 minutes for background timer. | Article saved with status `SCHEDULED`. Background persistent publisher in `server.ts` evaluates backlog every 30s and transitions article to `PUBLISHED` when due. | Pending | | |
| **TC-CMS-09** | Breaking News Flag & Homepage Pinning | Editor logged in | 1. Check "Breaking News" and "Lead Story" toggles on article.<br>2. Save and publish. | Article immediately takes precedence in homepage hero slot and breaking news banner. | Pending | | |

---

## SECTION E: Subscriber Authentication & Profile Testing

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Evidence / Error Details |
|---|---|---|---|---|---|---|---|
| **TC-SUB-01** | Subscriber Registration (Email & Mobile) | Backend running | 1. In Subscriber Modal, enter Full Name, Email, 10-digit Indian Mobile, and Password (min 8 chars).<br>2. Submit form. | Account created in `subscribers` table. Password hashed via scrypt with unique salt. Plaintext password never stored. Session token issued. | Pending | | |
| **TC-SUB-02** | Subscriber Registration Validation | Backend running | 1. Attempt registration with duplicate email or invalid phone.<br>2. Attempt registration with weak password (< 8 chars). | Returns HTTP 400 with specific field validation errors. Duplicate accounts rejected. | Pending | | |
| **TC-SUB-03** | Subscriber Login (Email Identifier) | Existing subscriber | 1. Enter subscriber email and correct password.<br>2. Submit login form. | Returns HTTP 200 with session token and profile data. Session stored in `subscriber_sessions` (30-day expiry). | Pending | | |
| **TC-SUB-04** | Subscriber Login (Mobile Identifier) | Existing subscriber | 1. Enter subscriber 10-digit mobile number and correct password.<br>2. Submit login form. | Dual identifier supported: mobile login succeeds identically to email login. | Pending | | |
| **TC-SUB-05** | Brute-Force Rate Limiting & Lockout | Existing subscriber | 1. Enter incorrect password 5 consecutive times for test subscriber account.<br>2. Attempt 6th login with correct password. | After 5 failed attempts within 15 minutes, account is locked out. HTTP 429 / Lockout returned with remaining wait minutes. | Pending | | |
| **TC-SUB-06** | Subscriber Profile & Subscription Query (`GET /me`) | Authenticated subscriber | 1. Send `GET /api/v1/subscriber/auth/me` with Bearer token. | Returns subscriber profile, name, email, mobile, and active subscription details. | Pending | | |
| **TC-SUB-07** | Subscriber Logout & Session Revocation | Authenticated subscriber | 1. Click "Sign Out" in subscriber menu.<br>2. Send subsequent request with previous token. | Session record deleted/invalidated from `subscriber_sessions`. Token immediately rejected with HTTP 401. | Pending | | |

---

## SECTION F: Payment Gateway & Subscription Testing (Razorpay Test Mode)

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Evidence / Error Details |
|---|---|---|---|---|---|---|---|
| **TC-PAY-01** | Subscription Plans Listing | Backend running | 1. Navigate to `/en/subscribe`.<br>2. Verify plans (e.g. 1 Month, 1 Year Digital Access). | Returns HTTP 200. Plans display authentic INR pricing (paise conversion), publication access, and duration in days. | Pending | | |
| **TC-PAY-02** | Razorpay Order Creation | Authenticated subscriber | 1. Select 1-Year Plan.<br>2. Click "Subscribe Now".<br>3. Inspect API call `POST /api/v1/payments/create-order`. | Backend generates Razorpay Order ID (or deterministic sandbox stub order `order_test_...`), stores record in `razorpay_orders` with status `CREATED`. | Pending | | |
| **TC-PAY-03** | Razorpay Checkout Modal Invocation | Frontend running | 1. Click proceed to payment.<br>2. Verify Razorpay checkout modal opens with correct amount and currency. | Modal opens with brand logo, correct plan name, amount in INR, subscriber prefilled email/mobile, and Test Mode banner. | Pending | | |
| **TC-PAY-04** | Successful Payment Signature Verification | Order created | 1. Submit simulated successful payment payload (`orderId`, `paymentId`, `signature`).<br>2. Call `POST /api/v1/payments/verify`. | Backend computes HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`, validates with timing-safe comparison, activates subscription in atomic transaction. | Pending | | |
| **TC-PAY-05** | Payment Tampering & Signature Forgery Defense | Order created | 1. Send verification request with modified `amountPaise` or forged signature. | Backend rejects request with HTTP 400/401 `INVALID_SIGNATURE`. No subscription activated. Attempt logged. | Pending | | |
| **TC-PAY-06** | Razorpay Webhook Event Processing | Backend running | 1. POST simulated `payment.captured` webhook payload to `/api/v1/payments/webhook` with `x-razorpay-signature`. | Backend verifies raw body HMAC signature against `RAZORPAY_WEBHOOK_SECRET`. Idempotently records transaction and activates subscription. | Pending | | |
| **TC-PAY-07** | Subscription Idempotency & Extension | Active subscriber | 1. Capture payment for subscriber who already has active subscription expiring on Date X.<br>2. Send duplicate webhook. | Duplicate webhook is harmless (idempotent, returns `isAlreadyActivated: true`). Subsequent renewal extends `expiresAt` by plan duration from current expiry, not now. | Pending | | |
| **TC-PAY-08** | Paywall Unlock Verification | Payment completed | 1. Return to restricted E-paper Page 3+ as newly subscribed user. | Subscriber token recognized. Server-side check passes. High-resolution broadsheet page streams immediately without paywall barrier. | Pending | | |
| **TC-PAY-09** | Admin Payment Transactions Ledger | Admin logged in | 1. In Admin Panel, navigate to `/en/admin/payments`.<br>2. Inspect transactions list. | Displays transaction ID, Razorpay payment ID, subscriber name, amount (₹), payment method (UPI, Card, Netbanking), and status (`CAPTURED`). | Pending | | |

---

## SECTION G: Security, RBAC & Permissions Testing

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Evidence / Error Details |
|---|---|---|---|---|---|---|---|
| **TC-SEC-01** | Super Admin & Administrator Role Access | Admin token | 1. Access all Admin endpoints (`/staff`, `/publications`, `/categories`, `/settings`, `/audit`, `/articles`, `/epaper`). | Full HTTP 200 access granted for all administrative and newsroom endpoints. | Pending | | |
| **TC-SEC-02** | Editor Role Boundary Enforcement | Editor token | 1. Access Newsroom Articles and E-paper (`/articles`, `/epaper`).<br>2. Attempt access to Staff Management (`/staff`), Settings (`/settings`), or Audit (`/audit`). | Articles and E-paper return HTTP 200. Staff, Settings, and Audit strictly return HTTP 403 `ADMIN_ROLE_REQUIRED`. | Pending | | |
| **TC-SEC-03** | Non-Editorial Staff Role Restriction | Ad Manager / Support token | 1. Attempt login to Admin CMS with Ad Manager or Support role credentials. | Login rejected or restricted: access to Newsroom and Staff management blocked with HTTP 403. | Pending | | |
| **TC-SEC-04** | Unauthenticated Admin API Access | No token / Invalid token | 1. Attempt `GET /api/v1/admin/staff` or `POST /api/v1/admin/articles` without Bearer token. | Request rejected immediately with HTTP 401 `STAFF_AUTH_REQUIRED`. | Pending | | |
| **TC-SEC-05** | Path Traversal Defense in Storage Provider | Backend running | 1. Attempt file request with keys containing `../../` or `..\..\`. | Storage provider's `getAbsolutePath` detects directory traversal escape and throws security violation error. | Pending | | |
| **TC-SEC-06** | Scrypt Password Hashing Quality | Backend test script | 1. Verify password hashing implementation in `passwordService.ts`. | Uses `crypto.scrypt` with random 16-byte salt, PHC string format `$scrypt$N=16384,r=8,p=1$...`, and timing-safe verification. Plaintext passwords never logged. | Pending | | |
| **TC-SEC-07** | CORS Policy Enforcement | Backend running | 1. Send preflight `OPTIONS` request with origin `http://evil-attacker.com`.<br>2. Send request with origin `http://localhost:3000`. | Unauthorized origin rejected by CORS handler. Configured `http://localhost:3000` permitted with credentials. | Pending | | |
| **TC-SEC-08** | Helmet Security Headers | Backend running | 1. Inspect HTTP response headers of `/health`. | Security headers present: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security`. | Pending | | |

---

## SECTION H: Database & API Integration Testing

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Evidence / Error Details |
|---|---|---|---|---|---|---|---|
| **TC-DAT-01** | PostgreSQL Health Check Endpoints | Backend running | 1. Send `GET /health`.<br>2. Send `GET /health/db`. | `/health` returns `{ status: "ok", service: "janmabhoomi-backend", database: { status: "connected", latencyMs: <50 } }`. `/health/db` returns HTTP 200. | Pending | | |
| **TC-DAT-02** | Schema Integrity & Table Verification | PostgreSQL running | 1. Inspect PostgreSQL catalog for 31 platform tables. | All 31 tables present: `publications`, `categories`, `articles`, `article_translations`, `editorials`, `panchang_dailies`, `e_paper_editions`, `e_paper_pages`, `e_paper_hotspots`, `users`, `roles`, `staff_sessions`, `subscribers`, `subscriber_sessions`, `subscription_plans`, `user_subscriptions`, `razorpay_orders`, `payment_transactions`, `audit_logs`, `media_assets`, etc. | Pending | | |
| **TC-DAT-03** | Public Content API Contract | Backend running | 1. Fetch `GET /api/v1/articles/home?publication=pub-janmabhoomi&lang=gu`.<br>2. Fetch `GET /api/v1/articles/latest`.<br>3. Fetch `GET /api/v1/panchang/today`. | Returns HTTP 200 with structured JSON matching `ApiNewsDataProvider` contract. Breaking news, lead story, categories properly formatted. | Pending | | |
| **TC-DAT-04** | Seed Data Idempotency | PostgreSQL running | 1. Run database seed script `npm run prisma:seed`. | Seeds 8 Publications, 12 Categories, 8 Roles, 2 Subscription Plans idempotently without duplicate key errors. | Pending | | |
| **TC-DAT-05** | Transactional Concurrency & Rollback | Backend running | 1. Trigger concurrent subscription activation or simulate order failure. | Database `$transaction` ensures all-or-nothing execution; no orphaned payment transaction or subscription records. | Pending | | |

---

## SECTION I: Responsive Design, Cross-Browser & Performance Testing

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Evidence / Error Details |
|---|---|---|---|---|---|---|---|
| **TC-RES-01** | Desktop High-Resolution Viewport (1440x900) | Frontend running | 1. Test public homepage, epaper, and admin panel on 1440x900 desktop viewport. | Full broadsheet layout, multi-column news grid, sidebar navigation visible, no horizontal scrollbars. | Pending | | |
| **TC-RES-02** | Tablet Viewport (768x1024) | Frontend running | 1. Test responsive layout on 768px tablet portrait viewport. | Category navigation switches to compact/horizontal scroll, epaper zoom adapts, admin sidebar collapses gracefully. | Pending | | |
| **TC-RES-03** | Mobile Viewport (375x667 / 390x844) | Frontend running | 1. Test mobile layout on standard 375px and 390px mobile screens.<br>2. Test hamburger navigation menu. | Hamburger menu opens smoothly, news cards stack into clean single column, touch targets >= 44px, bottom action bar visible. | Pending | | |
| **TC-RES-04** | Gujarati Typography & Font Rendering | Frontend running | 1. Inspect Gujarati text across Chrome, Edge, and Firefox.<br>2. Check conjuncts (જોડાક્ષર), matras, and numbers. | Noto Sans Gujarati renders crisply without clipped diacritics or fallback boxes across all browsers. | Pending | | |
| **TC-RES-05** | Dark Header & Footer Contrast Parity | Frontend running | 1. Inspect computed CSS color values of header date strip and footer. | Exact brand blue `#016BB7` (`rgb(1, 107, 183)`) maintained across header active states and footer border. Contrast ratio >= 4.5:1 (WCAG AA). | Pending | | |
| **TC-RES-06** | Print Stylesheet & Clean Article Print | Frontend running | 1. Open article page `/gu/article/[slug]`.<br>2. Trigger Print Preview (`Ctrl+P`). | Print view hides ads, navigation bar, footer, and social share buttons. Renders clean article headline, image, author, and text. | Pending | | |

---

## SECTION J: Complete End-to-End User Workflows

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Evidence / Error Details |
|---|---|---|---|---|---|---|---|
| **TC-E2E-01** | Workflow 1: Public Bilingual Reader Experience | All services running | 1. User visits `http://localhost:3000/gu`.<br>2. Reads breaking news ticker and lead story.<br>3. Switches language to English `/en`.<br>4. Browses Business category articles.<br>5. Opens article detail view.<br>6. Checks Mumbai Panchang widget.<br>7. Returns to homepage. | Entire bilingual browsing journey executes smoothly with zero console errors or broken images. | Pending | | |
| **TC-E2E-02** | Workflow 2: E-Paper Paywall & Subscription Conversion | All services running | 1. User visits `/gu/epaper`.<br>2. Reads Page 1 (Front Page) and Page 2 freely.<br>3. Clicks Page 3 -> Paywall modal appears.<br>4. User clicks "Sign Up / Register".<br>5. Completes registration.<br>6. Selects 1-Year Digital Plan.<br>7. Completes Razorpay sandbox payment.<br>8. Subscription activated.<br>9. User returns to E-paper reader -> Page 3 unlocks and renders in full resolution. | Complete monetization funnel verifies end-to-end: browsing -> paywall trigger -> registration -> payment -> instant content unlocking. | Pending | | |
| **TC-E2E-03** | Workflow 3: Newsroom Draft, Auto-Translate & Scheduled Publish | All services running | 1. Editor logs into Admin Panel.<br>2. Uploads news photo to Media Library.<br>3. Creates Gujarati article with headline, summary, body, and image.<br>4. Clicks "Translate to English" -> Translation engine translates text.<br>5. Quality check flags verified.<br>6. Editor schedules publication 2 minutes in future.<br>7. Background scheduler in Fastify runs.<br>8. After 2 minutes, article status automatically flips to `PUBLISHED`.<br>9. Article appears on public site in both Gujarati and English. | Full editorial and translation lifecycle functions seamlessly with automated background publishing. | Pending | | |
| **TC-E2E-04** | Workflow 4: E-Paper Multi-Page PDF Ingestion & Hotspot Linking | All services running | 1. E-paper Manager uploads multi-page newspaper PDF.<br>2. Backend processor renders PNG pages and thumbnails.<br>3. Manager opens Hotspot Editor for Page 1.<br>4. Draws rectangular bounding box over lead article.<br>5. Links hotspot to published article slug.<br>6. Publishes edition.<br>7. Public reader opens `/gu/epaper`, hovers over the article on Page 1, clicks the hotspot, and article preview modal opens. | Authentic broadsheet digital newspaper workflow operates end-to-end. | Pending | | |
| **TC-E2E-05** | Workflow 5: Historical Archive Enquiry Management | All services running | 1. Researcher visits `/en/archive-enquiry`.<br>2. Requests 15 August 1947 Janmabhoomi Independence Day edition.<br>3. Submits enquiry.<br>4. Admin logs into Admin Panel.<br>5. Opens Archive Enquiries table.<br>6. Finds the new request, reviews contact details, and marks status as `RESEARCHING`. | Citizen/Researcher enquiry submission successfully integrates with Admin review workflow. | Pending | | |

---

## 2. Test Execution Tracking Summary

| Section | Total Tests | Pending | Pass | Fail | Blocked |
|---|---|---|---|---|---|
| **A. Public Website Testing** | 14 | 14 | 0 | 0 | 0 |
| **B. E-Paper Testing** | 10 | 10 | 0 | 0 | 0 |
| **C. Admin Panel Testing** | 10 | 10 | 0 | 0 | 0 |
| **D. Newsroom & Translation** | 9 | 9 | 0 | 0 | 0 |
| **E. Subscriber Authentication** | 7 | 7 | 0 | 0 | 0 |
| **F. Payment & Subscription** | 9 | 9 | 0 | 0 | 0 |
| **G. Security & Permissions** | 8 | 8 | 0 | 0 | 0 |
| **H. Database & API Integration** | 5 | 5 | 0 | 0 | 0 |
| **I. Responsive & Browser Testing** | 6 | 6 | 0 | 0 | 0 |
| **J. Complete E2E Workflows** | 5 | 5 | 0 | 0 | 0 |
| **TOTAL** | **83** | **83** | **0** | **0** | **0** |

---
*Testing plan prepared and frozen for Phase 5.5 local execution.*
