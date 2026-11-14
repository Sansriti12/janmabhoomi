# JANMABHOOMI — PHASE 5.5 LOCAL TESTING READINESS REPORT

**Project:** Saurashtra Trust — Janmabhoomi Digital Newspaper Platform  
**Phase:** 5.5 Comprehensive Local End-to-End Testing Readiness  
**Date:** November 13, 2026  
**Auditor / Lead Engineer:** Antigravity AI  
**Scope:** Complete Local Inspection, Environment Verification, and Execution Roadmap  

---

## Executive Summary

Phases 1 through 5 of the Janmabhoomi application are frozen and fully implemented across both the Next.js frontend and Fastify backend.

Before executing the local testing suite or proceeding to Phase 6 production deployment, an inspection of the local development environment, dependencies, database schema, security mechanisms, and automated test coverage was conducted.

| Component | Status | Verification Summary |
|---|---|---|
| **Frontend TypeScript & Build** | **READY (100% PASSED)** | `tsc --noEmit` passed with 0 errors; `next build` compiled all 39 dynamic and static routes cleanly. |
| **Backend TypeScript & Build** | **READY (100% PASSED)** | `tsc --noEmit` and `tsc` compiled with 0 errors; Fastify server lifecycle and plugin structure verified. |
| **Backend Health & Standby** | **READY (100% PASSED)** | `test-health.ts` passed: HTTP 200 on `/`, `/health`, 404 routing, and graceful DB standby mode verified. |
| **Database Container (PostgreSQL)** | **ATTENTION REQUIRED** | Docker Desktop engine is currently stopped. Needs user to launch Docker Desktop to open port 5432. |
| **Storage Infrastructure** | **READY** | All required directories (`backend/storage/epaper`, `backend/storage/media`, `storage/epaper`) exist and are writable. |
| **PDF Processing Engine** | **READY** | `pdf-lib` (1.17.1) and `pdf-to-img` (7.0.2) installed; broadsheet rasterization pipeline ready. |
| **Translation Engine** | **READY (OFFLINE-SAFE)** | `MockTranslationProvider` active by default. High-quality rule-based engine runs with zero external API costs. |
| **Payment Gateway (Razorpay)** | **READY (TEST MODE)** | `RAZORPAY_MODE=test` configured with deterministic sandbox stub and timing-safe HMAC-SHA256 signature verification. |
| **Browser Testing Tools** | **READY (PUPPETEER)** | Playwright is **not installed**; browser automation uses installed `puppeteer-core` connected to local Google Chrome. |

---

## 1. Current Local Environment Status

### 1.1 Frontend (Next.js 15.3.0 + React 19 + Tailwind CSS 4)
- **Root Directory:** `C:\projects\Janmabhoomi\janmabhoomi`
- **TypeScript:** 5.8.2 — `npm.cmd run typecheck` returned exit code 0.
- **Production Build:** `npm.cmd run build` compiled all 39 routes cleanly.
- **Data Provider Architecture:** Unified singleton `newsDataProvider` (`src/lib/data/provider.ts`). When `NEXT_PUBLIC_USE_API=true`, connects to backend on `http://127.0.0.1:4000`; otherwise defaults to `MockNewsDataProvider` for offline development.

### 1.2 Backend (Fastify 5.2.1 + Prisma 6.4.1 + TypeScript)
- **Backend Directory:** `C:\projects\Janmabhoomi\janmabhoomi\backend`
- **TypeScript:** 5.8.2 — `npm.cmd run typecheck` and `npm.cmd run build` returned exit code 0.
- **Architecture:** Modular monolith with Fastify plugins, Zod request validation, Helmet security headers, CORS origin whitelist (`http://localhost:3000`), scrypt password hashing, and multipart PDF streaming.
- **In-Process Scheduler:** Background article publisher running every 30 seconds (`server.ts`) to release scheduled articles without manual intervention.

### 1.3 Database & Migrations (PostgreSQL 16.15 Alpine)
- **Container Name:** `janmabhoomi-postgres`
- **Configured Connection:** `postgresql://postgres:****@127.0.0.1:5432/janmabhoomi_dev?schema=public`
- **Migration History:** 6 completed migrations in `backend/prisma/migrations`:
  1. `20261105000000_init_phase_3a_foundation` (24 core tables)
  2. `20261110120000_add_payment_and_enquiry_enums` (Enums committed before table usage)
  3. `20261111000000_phase_1_razorpay_and_enquiries` (Razorpay tables, archive/contact enquiries)
  4. `20261111140000_phase_3_epaper_pipeline` (E-paper editions, pages, interactive hotspots)
  5. `20261111150000_add_failed_to_payment_status` (Payment status enum extension)
  6. `20261112160000_phase_5b_newsroom_cms` (Newsroom CMS, article scheduling, translations)
- **Current Operational State:** Port 5432 is currently closed because Docker Desktop Service is not running in Windows user space.

---

## 2. How to Start Each Service

### 2.1 Starting PostgreSQL Database Container
1. Open **Docker Desktop** from the Windows Start Menu or System Tray.
2. Wait until Docker Desktop reports "Engine running".
3. In PowerShell, start the Janmabhoomi database container:
   ```powershell
   docker start janmabhoomi-postgres
   ```
4. Verify port 5432 is open:
   ```powershell
   Test-NetConnection -ComputerName 127.0.0.1 -Port 5432
   ```

### 2.2 Starting the Fastify Backend Service
1. Open a PowerShell terminal and navigate to `backend`:
   ```powershell
   cd C:\projects\Janmabhoomi\janmabhoomi\backend
   npm.cmd run dev
   ```
2. The service starts on `http://127.0.0.1:4000`.
3. Verify backend health in a browser or terminal:
   ```powershell
   Invoke-RestMethod -Uri http://127.0.0.1:4000/health
   ```

### 2.3 Starting the Next.js Frontend Service
1. Open a separate PowerShell terminal in the project root:
   ```powershell
   cd C:\projects\Janmabhoomi\janmabhoomi
   $env:NEXT_PUBLIC_USE_API="true"
   npm.cmd run dev
   ```
2. The frontend starts on `http://localhost:3000`.
3. Open `http://localhost:3000/gu` or `http://localhost:3000/en`.

---

## 3. Existing Test Suites (Reused from Phases 1–5)

The repository contains automated test suites that cover the codebase:

### Backend Test Suites (`backend/src/`)
| Script | Command | Purpose / Scenarios Covered |
|---|---|---|
| `test-health.ts` | `npx.cmd tsx src/test-health.ts` | Server lifecycle, Fastify plugin decoration, health endpoints (`/health`, `/health/db`), 404 routing, port binding, graceful teardown. (Verified: **PASSED**) |
| `test-live-db.ts` | `npx.cmd tsx src/test-live-db.ts` | Live PostgreSQL connection, schema constraints, unique indices, transactional isolation, concurrency. |
| `test-phase2.ts` | `npx.cmd tsx src/test-phase2.ts` | Public content routes: home articles, categories, latest news, pagination, search. |
| `test-epaper-phase3.ts` | `npx.cmd tsx src/test-epaper-phase3.ts` | PDF upload validation, %PDF- magic bytes, broadsheet rasterization at 150 DPI, thumbnail generation, paywall enforcement, hotspot CRUD. |
| `test-phase4-payments.ts` | `npx.cmd tsx src/test-phase4-payments.ts` | 34+ security scenarios: subscriber auth, scrypt hashing, brute-force rate limiting, Razorpay order creation, timing-safe HMAC verification, webhook idempotency, subscription activation. |
| `test-phase5-permissions.ts` | `npx.cmd tsx src/test-phase5-permissions.ts` | RBAC matrix for all 8 roles, unified role resolution (Admin vs Editor), scheduled publishing engine, translation quality verification. |
| `test-phase5a-admin.ts` | `npx.cmd tsx src/test-phase5a-admin.ts` | Admin Panel foundation: staff management, publication scope restriction (Janmabhoomi & Pravasi only), system metrics, audit logs. |
| `test-phase5b-newsroom.ts` | `npx.cmd tsx src/test-phase5b-newsroom.ts` | Newsroom CMS editorial flow, Gujarati drafting, automated translation, sensitive taxonomy detection, scheduled release. |

### Browser Automation Suites (`scripts/` via Puppeteer)
| Script | Command | Purpose |
|---|---|---|
| `verify-full-suite.mjs` | `node scripts/verify-full-suite.mjs` | Brand blue `#016BB7` color parity, navigation tabs, typography, homepage layout, Panchang widget, sister publications. |
| `verify-phase5a-browser.mjs` | `node scripts/verify-phase5a-browser.mjs` | Admin login page, session persistence, admin dashboard metrics, staff table rendering, publication selector. |
| `verify-archive-enquiry.mjs` | `node scripts/verify-archive-enquiry.mjs` | Archive enquiry form submission, client-side validation, error handling. |

---

## 4. Missing Test Coverage & Gap Analysis

While backend unit and integration test coverage is high, the following areas require execution and verification in Phase 5.5:

1. **End-to-End Live Reader-to-Subscriber Journey**:
   - Connecting the Next.js frontend reader directly to the running Fastify backend in live mode (`NEXT_PUBLIC_USE_API=true`).
   - Testing: Free preview of Pages 1 & 2 -> Paywall popup on Page 3 -> Subscriber registration -> Razorpay test payment modal -> Instant high-res broadsheet image unlocking.
2. **Interactive E-Paper Hotspot Bounding Box Editor in Browser**:
   - Creating bounding boxes on the broadsheet canvas in the admin panel and verifying that the public reader correctly displays clickable popovers.
3. **Multi-Device Responsive Breakpoints**:
   - Systematic mobile viewport tests (375x667, 390x844, 412x915) verifying touch targets (>= 44px), mobile hamburger navigation, and epaper reader gestures.
4. **Scheduled Publishing Live Timing Verification**:
   - Scheduling an article in the CMS for 2 minutes in the future and observing the background timer automatically publish it without user interaction.
5. **Simulated Payment Webhook Edge Cases**:
   - Verifying duplicate webhook delivery (idempotency) and invalid signature rejection under live network conditions.

---

## 5. Test Data Requirements

To execute complete testing without corrupting existing records or resetting the database:

1. **Database Seed**:
   - Seed script: `cd backend; npm.cmd run prisma:seed`.
   - Seeded records:
     - 8 Publications: `pub-janmabhoomi` (Janmabhoomi Daily), `pub-pravasi` (Janmabhoomi Pravasi), and sister publications.
     - 12 Standard Categories: National, International, Gujarat, Mumbai, Business, Sports, Entertainment, Lifestyle, etc.
     - 8 Roles: Super Admin, Administrator, Chief Editor, Editor, Reporter, E-Paper Manager, Ad Manager, Support.
     - 2 Subscription Plans: 1-Month Digital Access (₹199 / 19900 paise), 1-Year Digital Access (₹1,499 / 149900 paise).
2. **Pre-Configured Test Accounts**:
   - **Administrator:** `admin@janmabhoomi.in` (Password: `AdminSuperSecret@2026!`)
   - **Editor:** `editor@janmabhoomi.in` (Password: `EditorSecret@2026!`)
   - **Test Subscriber:** Dynamically generated in test scripts (e.g. `test.sub.<timestamp>@janmabhoomi.in`).
3. **Sample Broadsheet Test PDF**:
   - Multi-page test PDF placed in `backend/storage/sample-edition.pdf` (valid `%PDF-` header, minimum 4 pages) for testing the rasterization pipeline and paywall barrier.

---

## 6. Blockers Preventing Complete Testing

1. **Docker Desktop Daemon Not Running**:
   - **Impact:** Port 5432 is closed; live PostgreSQL database tests and real API data persistence cannot run until Docker Desktop is started.
   - **Action Required:** Launch Docker Desktop from Windows Start Menu / System Tray, then execute `docker start janmabhoomi-postgres`.
2. **Playwright Status**:
   - Playwright is **not installed** in the repository.
   - **Resolution:** No action needed; `puppeteer-core` is already installed and fully configured to drive the local Google Chrome instance (`C:\Program Files\Google\Chrome\Application\chrome.exe`). All browser tests run via existing Puppeteer scripts.

---

## 7. Recommended Execution Order

To test the entire platform methodically without risking regressions or downtime:

```mermaid
flowchart TD
    Step1["Stage 1: Offline Verification<br>(tsc, next build, test-health)"] --> Step2["Stage 2: Start Services<br>(Docker Desktop, Fastify :4000, Next.js :3000)"]
    Step2 --> Step3["Stage 3: Database & Security Suites<br>(test-live-db, test-phase4, test-phase5)"]
    Step3 --> Step4["Stage 4: Headless Browser Suites<br>(verify-full-suite, verify-phase5a)"]
    Step4 --> Step5["Stage 5: End-to-End User Journeys<br>(Workflows 1-5 in PHASE_5_5_LOCAL_TESTING_PLAN.md)"]
    Step5 --> Step6["Stage 6: Sign-off & Production Readiness<br>(Phase 6 Handoff)"]
```

### Stage 1: Offline & Unit Verification (Status: 100% COMPLETE)
- Frontend TypeScript typecheck (`tsc --noEmit`): PASSED.
- Frontend Next.js production build (`next build`): PASSED (39 routes).
- Backend TypeScript compilation (`tsc`): PASSED.
- Backend service health and standby test (`test-health.ts`): PASSED.

### Stage 2: Environment Initialization
1. Launch Docker Desktop and start `janmabhoomi-postgres`.
2. Verify database connectivity: `npx.cmd tsx src/test-live-db.ts`.
3. Start backend: `npm.cmd run dev` in `backend` (Port 4000).
4. Start frontend: `$env:NEXT_PUBLIC_USE_API="true"; npm.cmd run dev` (Port 3000).

### Stage 3: Backend Security & Business Logic Verification
1. Run Razorpay & Subscriber Authentication test suite: `npx.cmd tsx src/test-phase4-payments.ts`.
2. Run Permissions & Scheduling test suite: `npx.cmd tsx src/test-phase5-permissions.ts`.
3. Run E-Paper ingestion & paywall test suite: `npx.cmd tsx src/test-epaper-phase3.ts`.
4. Run Newsroom CMS & translation test suite: `npx.cmd tsx src/test-phase5b-newsroom.ts`.

### Stage 4: Browser Automation Verification (Puppeteer)
1. Run public website parity verification: `node scripts/verify-full-suite.mjs`.
2. Run admin panel browser verification: `node scripts/verify-phase5a-browser.mjs`.
3. Run archive enquiry browser verification: `node scripts/verify-archive-enquiry.mjs`.

### Stage 5: Manual & Integrated End-to-End Workflows
- Execute the 5 end-to-end user workflows defined in Section J of `PHASE_5_5_LOCAL_TESTING_PLAN.md`.
- Record results and evidence directly in `PHASE_5_5_LOCAL_TESTING_PLAN.md`.

### Stage 6: Final Sign-off & Phase 6 Deployment Readiness
- Review test results with zero regressions.
- Freeze codebase for Phase 6 production deployment to Hostinger KVM VPS.

---
*Readiness report prepared and finalized for Janmabhoomi Phase 5.5 local end-to-end testing.*
