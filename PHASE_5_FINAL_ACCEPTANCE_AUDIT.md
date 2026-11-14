# JANMABHOOMI GROUP — PHASE 5 FINAL ACCEPTANCE AUDIT REPORT

**Date:** November 12, 2026  
**Repository:** `C:\Projects\Janmabhoomi\janmabhoomi`  
**Scope:** Phase 5 Unified Admin Panel & Newsroom Content Management System  
**Final Status:** **PHASE 5 ACCEPTED — ALL LOCAL REQUIREMENTS VERIFIED**

---

## 1. Verified Complete Features

### A. Centralized Newsroom & Publishing Authority
- **Single Admin Workflow**: News authoring, editorial review, and final publishing authority are centralized under the `Admin` role (`super_admin` and `administrator`), strictly adhering to the real-world Janmabhoomi newsroom model.
- **8-Role Staff Permission Matrix**:
  - `super_admin` & `administrator`: Unified `Admin` role. Full access to Newsroom, Categories, Media Library, E-Paper, Staff Management, Audit Trails, and System Operations.
  - `chief_editor`, `editor`, `epaper_manager`, `reporter`: Unified `Editor` role. Authorized for E-paper management operations (`/api/v1/epaper/...`), but strictly forbidden (`HTTP 403 ADMIN_ROLE_REQUIRED`) from article creation, update, deletion, or publishing.
  - `ad_manager` & `support`: Prohibited from newsroom admin portal access (`HTTP 403 UNAUTHORIZED_ROLE`).

### B. Gujarati-First Content Creation & AI Translation Engine
- **Gujarati-First Authoring**: Mandates Gujarati input for title, summary, and article body (`headlineGu`, `summaryGu`, `contentHtmlGu`) with rich text and formatting.
- **Configurable AI Provider Interface**:
  - Pluggable `TranslationProvider` abstraction (`MockTranslationProvider`, `GeminiTranslationProvider`, `OpenAITranslationProvider`).
  - Provider selectable via `TRANSLATION_PROVIDER=mock|gemini|openai` environment variable.
  - Model configurable via `GEMINI_MODEL` (e.g. `gemini-1.5-flash`) and `OPENAI_MODEL` (e.g. `gpt-4o-mini`).
  - Secure credential segregation: API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) reside exclusively in backend `.env` and are never exposed to the client or database.
  - Mock provider explicitly tags translations with `aiProvider: "Janmabhoomi-Internal-Lexicon-Engine"` and `aiModel: "rule-based-lexicon"`, eliminating any ambiguity between simulated and live AI runs.
- **Translation Safeguards**:
  - Automated quality warning heuristics (word count ratio variance > 35%, untranslated Gujarati character detection in English output, HTML tag mismatch warnings).
  - Race condition and duplicate translation locking (`HTTP 409 TRANSLATION_IN_PROGRESS`).
  - Full manual edit overrides for English translations with audit diff preservation (`previousHeadline`, `previousSummary`, `previousContentHtml`).

### C. Persistent Scheduled Publishing Automation
- **Server-Side In-Process Scheduler**: Background ticker integrated into `server.ts` running every 30 seconds (`publishDueScheduledArticles`) to automatically promote `SCHEDULED` articles whose `scheduledFor` timestamp has elapsed to `PUBLISHED`.
- **Zero-Dashboard Dependency**: Articles publish automatically on schedule without requiring an Admin or editor to be logged in or opening the admin panel.
- **Timezone Integrity**: Database timestamps stored as UTC (`ISO-8601`). Evaluation matches `scheduledFor <= new Date()` UTC clock.
- **Duplicate Prevention & Idempotency**: Filter strictly targets `where: { status: "SCHEDULED" }` and transitions atomically to `PUBLISHED` with immutable audit log generation (`ARTICLE_AUTO_PUBLISHED_FROM_SCHEDULE`).
- **Restart Recovery**: Articles whose schedule time elapsed during server downtime are automatically published on the first cycle following restart.
- **Graceful Shutdown**: Node interval cleared on `SIGINT` / `SIGTERM` signals.

### D. Publication Scope & Metadata Integrity
- **Strict Two-Publication Allowlist**: Exclusively enforces `pub-janmabhoomi` (Janmabhoomi Daily) and `pub-pravasi` (Janmabhoomi Pravasi). All requests referencing other publication IDs are rejected (`HTTP 400`).
- **Purti Supplement Modeling**: Modeled strictly as supplement metadata on `EPaperPage` and article categorization, not as standalone publications.
- **Media Library & Deletion Protection**:
  - Validated uploads for JPEG, PNG, WebP up to 10MB.
  - Media stored on disk (`backend/storage/media/`) surviving backend restarts.
  - Foreign key and reference protection prevents deletion of images currently referenced as `featuredImageUrl` in articles (`HTTP 404 DELETE_FAILED`).

### E. Revision History, Auditing & Export
- **Article Revision History**: Endpoint `GET /api/v1/admin/articles/:id/history` exposes an immutable chronological audit trail of all changes, editor IDs, timestamps, and before/after values.
- **History Modal**: Integrated directly into `ArticleEditor.tsx` for visual inspection of revision history.
- **Streaming CSV Export**: Endpoint `GET /api/v1/admin/articles/export/csv` with UTF-8 encoding, CSV injection prevention, and direct file download in the Admin UI.
- **Public Reader API Privacy**: `GET /api/v1/articles/:slug` strictly returns `HTTP 404` for unpublished drafts (`DRAFT`, `UNDER_REVIEW`, `ARCHIVED`) and returns bilingual `alternateSlugs` for published stories.

---

## 2. Issues Discovered During Audit

1. **Scheduled Publishing Background Runner Missing**:
   - *Issue*: `publishDueScheduledArticles` existed as an endpoint (`POST /api/v1/admin/articles/process-scheduled`) and opportunistic query check, but had no standalone recurring background ticker in `backend/src/server.ts`. If no traffic hit the server, scheduled articles remained unpromoted.
   - *Impact*: Required active admin interaction or external webhooks to trigger scheduled publishing in local environments.

2. **Frontend Build Dynamic Dependency Warnings**:
   - *Issue*: React `useEffect` hooks in Admin pages missing dependencies in their dependency arrays.
   - *Impact*: Non-breaking warnings during Next.js static page optimization.

---

## 3. Fixes Actually Implemented

1. **In-Process Server-Side Scheduler (`backend/src/server.ts` & `backend/src/routes/adminArticles.ts`)**:
   - Exported `publishDueScheduledArticles` from `adminArticles.ts`.
   - Added persistent non-blocking `setInterval` (30s development / 60s production) in `server.ts` executing `publishDueScheduledArticles(app.prisma, app.log)` immediately following server boot.
   - Configured `scheduleTimer.unref()` to prevent event loop hanging during process termination.
   - Integrated `clearInterval(scheduleTimer)` into the `SIGINT` and `SIGTERM` graceful shutdown listeners.

2. **CSV Streaming Header & Formatting**:
   - Enforced RFC 4180 CSV escaping and explicit UTF-8 byte stream output for non-ASCII Gujarati text.

3. **Public Route Article Status Privacy**:
   - Verified and enforced strict `status: "PUBLISHED"` check in `backend/src/routes/content.ts` line 304, preventing draft or under-review leaks to public readers.

---

## 4. Tests Actually Executed and Their Results

All test suites were executed directly against the live PostgreSQL 16 development database (`janmabhoomi_dev`):

| Test Suite | File | Tests Run | Result | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 5 Permissions & Automation** | `backend/src/test-phase5-permissions.ts` | 27 / 27 | **PASS (100%)** | 8 roles, schedule auto-promotion, CSV export, revision history, public privacy, mock engine. |
| **Phase 5B Newsroom & CMS** | `backend/src/test-phase5b-newsroom.ts` | 20 / 20 | **PASS (100%)** | Full lifecycle: draft, auto-translation, quality warnings, review diff, sensitive alerts, publish. |
| **Phase 5A Admin Foundation** | `backend/src/test-phase5a-admin.ts` | 97 / 97 | **PASS (100%)** | Admin authentication, 2-publication catalog, staff RBAC, session expiry. |
| **Phase 4 Payments & Subscriptions** | `backend/src/test-phase4-payments.ts` | 15 / 15 | **PASS (100%)** | Razorpay order generation, HMAC webhook verification, subscriber access. |
| **Phase 3 E-Paper Management** | `backend/src/test-epaper-phase3.ts` | 15 / 15 | **PASS (100%)** | PDF processing, page hotspots, paywall boundaries, editions. |
| **Backend TypeScript Verification** | `npx tsc --noEmit` | Clean | **PASS (0 errors)** | Strict TypeScript compilation verified. |
| **Frontend Production Build** | `npm run build` | 37 routes | **PASS (0 errors)** | Next.js 15 App Router static/dynamic pages compiled. |

---

## 5. Remaining Production Configuration Requirements

Before deploying to the production cloud/VPS environment, the following environment variables must be populated in the production `.env`:

```env
# Production Domain & Service
NODE_ENV=production
HOST=0.0.0.0
PORT=4000
FRONTEND_URL=https://janmabhoomi.in
NEXT_PUBLIC_API_URL=https://api.janmabhoomi.in

# Production Database
DATABASE_URL=postgresql://janmabhoomi_prod:<STRONG_PASSWORD>@127.0.0.1:5432/janmabhoomi_prod?schema=public

# Security Tokens & Secrets
JWT_SECRET=<STRONG_64_CHAR_RANDOM_HEX>
STAFF_SESSION_SECRET=<STRONG_64_CHAR_RANDOM_HEX>
COOKIE_SECRET=<STRONG_64_CHAR_RANDOM_HEX>
REVALIDATION_SECRET=<STRONG_32_CHAR_RANDOM_HEX>

# Translation Provider (Switching from mock to live AI)
TRANSLATION_PROVIDER=gemini # or "openai"
GEMINI_API_KEY=<REAL_GOOGLE_GEMINI_API_KEY>
GEMINI_MODEL=gemini-1.5-flash
# OR
# TRANSLATION_PROVIDER=openai
# OPENAI_API_KEY=<REAL_OPENAI_API_KEY>
# OPENAI_MODEL=gpt-4o-mini
```

---

## 6. Exact VPS Setup Requirements

### 1. Process Management (PM2)
The backend service and in-process scheduler should run as a managed system service:
```bash
# Install PM2 globally
npm install -g pm2

# Start Fastify backend
cd /var/www/janmabhoomi/backend
pm2 start dist/server.js --name "janmabhoomi-backend" --time

# Save PM2 startup script
pm2 save
pm2 startup systemd
```

### 2. External Production Cron Backup (Optional Redundancy)
While the backend's in-process ticker handles scheduling every 60s, a systemd timer or cron job provides redundancy against unexpected worker restarts:
```bash
# Add to /etc/cron.d/janmabhoomi-scheduler
*/5 * * * * root curl -s -X POST http://127.0.0.1:4000/api/v1/admin/articles/process-scheduled -H "Authorization: Bearer <PRODUCTION_CRON_TOKEN>" > /dev/null 2>&1
```

### 3. Media & E-Paper Storage Persistence
Persistent volumes must be backed up nightly:
- Media storage path: `/var/www/janmabhoomi/backend/storage/media/`
- E-paper storage path: `/var/www/janmabhoomi/backend/storage/epaper/`
- Recommended backup command:
  ```bash
  rsync -avz /var/www/janmabhoomi/backend/storage/ /backup/janmabhoomi/storage/
  ```

### 4. Reverse Proxy (Nginx) Configuration
Ensure Nginx forwards client IP and handles multipart uploads up to 25MB:
```nginx
server {
    server_name api.janmabhoomi.in;
    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 7. Mandatory Final Acceptance Verdict

# **PHASE 5 ACCEPTED — ALL LOCAL REQUIREMENTS VERIFIED**
