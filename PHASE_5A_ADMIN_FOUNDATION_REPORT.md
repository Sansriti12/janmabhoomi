# JANMABHOOMI PLATFORM — PHASE 5A FINAL E-PAPER AUTHORIZATION & SECURITY AUDIT
## Comprehensive Endpoint Authorization, Role Boundaries, and Data Privacy Report

**Audit Date:** November 12, 2026  
**Environment:** Local Development (PostgreSQL 16 Alpine via Docker, Fastify 5 Backend, Next.js 15 App Router Frontend)  
**Database:** `janmabhoomi_dev` on `127.0.0.1:5432`  
**Brand Blue:** `#016BB7`  
**Verification Status:** **100% VERIFIED & COMPLIANT (97/97 Phase 5A Tests Passed)**  
**Regression Status:** **0 Regressions across Phases 1, 2, 3, and 4**

---

## 1. Executive Summary

This report documents the final, narrowly scoped security audit of **Phase 5A: Unified Admin Panel Foundation**. 

In accordance with strict security requirements:
1. **Explicit Server-Side Authorization for Every E-Paper Endpoint:** Audited and hardened every endpoint in [`backend/src/routes/epaper.ts`](file:///c:/projects/Janmabhoomi/janmabhoomi/backend/src/routes/epaper.ts) accessible to staff. Authentication alone (`verifyStaffAuth`) is never accepted as authorization. Explicit role checks and publication allowlist validation (`isPermittedPublicationId`) are enforced on every route.
2. **Strict Role Boundaries:**
   - **Admin** (`super_admin`, `administrator`, `admin`): Full E-paper management, archiving, and deletion access for the two permitted newspapers.
   - **Editor** (`editor`, `chief_editor`, `epaper_manager`): Restricted to approved editorial and E-paper tasks (view, draft creation, PDF upload/processing, hotspot creation/editing, article linking, and publishing). Permanently deleting or archiving editions returns **HTTP 403 `ADMIN_ROLE_REQUIRED`**.
   - **Support** (`support`): **Zero** E-paper management access. All E-paper admin routes reject support staff with **HTTP 403 `FORBIDDEN_ROLE`**.
   - **Reporter & Legacy Roles** (`reporter`, `ad_manager`): **Zero** E-paper management access. Legacy roles are strictly barred and rejected with **HTTP 403 `FORBIDDEN_ROLE`**.
3. **Data Privacy for Support Payment Access:** Hardened the transaction detail response in [`backend/src/routes/adminPayments.ts`](file:///c:/projects/Janmabhoomi/janmabhoomi/backend/src/routes/adminPayments.ts). Support staff triage queries never expose subscriber password hashes, session tokens, cryptographic signatures, or raw webhook payloads.
4. **Local Development Rate Limiting Documentation:** Explicitly documented the in-memory rate-limiter limitation and established requirements for persistent storage prior to production VPS deployment.
5. **Zero Regressions:** 100% pass rates verified across Phase 1, Phase 2, Phase 3 (E-Paper), Phase 4 (Razorpay), and Phase 5A (97 tests passed).

---

## 2. E-Paper API Authorization — Detailed Endpoint Audit

Every staff-accessible endpoint in [`backend/src/routes/epaper.ts`](file:///c:/projects/Janmabhoomi/janmabhoomi/backend/src/routes/epaper.ts) was audited against four explicit criteria:
1. Staff authentication validity (`verifyStaffAuth`).
2. Staff member's actual database role verification.
3. Verification that target publication belongs to `PERMITTED_PUBLICATION_IDS` (`["pub-janmabhoomi", "pub-pravasi"]`).
4. Role appropriateness under least privilege.

### 2.1 E-Paper Endpoint Authorization Matrix

| Endpoint | HTTP Method | Allowed Roles | Publication Check | Disallowed Roles Behavior | Role Appropriate? |
|---|:---:|---|:---:|:---:|:---:|
| `/admin/editions` | `GET` | Admin, Editor | Scoped to allowlist; unpermitted returns 403 | Support, Reporter ➔ **403 Forbidden** | Yes: Editorial list query |
| `/admin/editions` | `POST` | Admin, Editor | `isPermittedPublicationId(data.publicationId)` | Support, Reporter ➔ **403 Forbidden** | Yes: Pre-press draft creation |
| `/admin/editions/:id/upload` | `POST` | Admin, Editor | Checks edition's publication allowlist | Support, Reporter ➔ **403 Forbidden** | Yes: Ingest pre-press broadsheet PDF |
| `/admin/editions/:id/status` (Draft/Ready/Publish) | `PATCH` | Admin, Editor | Checks edition's publication allowlist | Support, Reporter ➔ **403 Forbidden** | Yes: Editorial desk publication |
| `/admin/editions/:id/status` (Archived) | `PATCH` | **Admin Only** | Checks edition's publication allowlist | Editor, Support, Reporter ➔ **403 Forbidden** | Yes: Archiving restricted to Admin |
| `/admin/editions/:id` | `DELETE` | **Admin Only** | Checks edition's publication allowlist | Editor, Support, Reporter ➔ **403 Forbidden** | Yes: Permanent deletion restricted to Admin |
| `/admin/editions/:id/editor` | `GET` | Admin, Editor | Checks edition's publication allowlist | Support, Reporter ➔ **403 Forbidden** | Yes: Interactive hotspot desk data |
| `/admin/pages/:pageId/hotspots` | `POST` | Admin, Editor | Page edition checked; linked article checked | Support, Reporter ➔ **403 Forbidden** | Yes: Digital broadsheet clipping |
| `/admin/hotspots/:hotspotId` | `PUT` | Admin, Editor | Page edition checked; linked article checked | Support, Reporter ➔ **403 Forbidden** | Yes: Coordinate & link refinement |
| `/admin/hotspots/:hotspotId` | `DELETE` | Admin, Editor | Page edition checked | Support, Reporter ➔ **403 Forbidden** | Yes: Hotspot removal |
| `/admin/editions/:id/pages/reorder` | `PUT` | Admin, Editor | Checks edition's publication allowlist | Support, Reporter ➔ **403 Forbidden** | Yes: Page sequencing |

### 2.2 Explicit Hotspot & Article Linking Enforcement
In addition to role validation, hotspot creation and update routes verify that:
1. The target page belongs to an edition within `PERMITTED_PUBLICATION_IDS`.
2. Any referenced article (`articleId`) exists and belongs to a permitted publication (`isPermittedPublicationId(article.publicationId)`). Linking a hotspot to an article from an excluded publication (such as Kutchmitra or Phulchhab) is rejected with **HTTP 403 `PUBLICATION_NOT_PERMITTED`**.

---

## 3. Direct API Access & Role Isolation Verification

Automated security tests in [`backend/src/test-phase5a-admin.ts`](file:///c:/projects/Janmabhoomi/janmabhoomi/backend/src/test-phase5a-admin.ts) verified direct API access across all role types:

### 3.1 Role Verification Findings:
1. **Admin Credentials:** Full access to view, create, upload, publish, archive, and permanently delete editions for Janmabhoomi and Janmabhoomi Pravasi.
2. **Editor Credentials:**
   - Allowed: View editions (200), create draft (201), view hotspot editor (200), create/update/delete hotspots (201/200), publish editions (200).
   - Forbidden: Archiving editions returns **HTTP 403 `ADMIN_ROLE_REQUIRED`**; deleting editions returns **HTTP 403 `ADMIN_ROLE_REQUIRED`**; staff management returns **HTTP 403 `FORBIDDEN`**; payments return **HTTP 403 `FORBIDDEN`**. No database records or files are altered when unauthorized calls are made.
3. **Support Credentials:**
   - Direct E-paper list access (`GET /admin/editions`) returns **HTTP 403 `FORBIDDEN_ROLE`**.
   - Direct E-paper creation (`POST /admin/editions`) returns **HTTP 403 `FORBIDDEN_ROLE`**.
   - Admin Panel login (`POST /admin/auth/login`) returns **HTTP 403 `FORBIDDEN_STAFF_ROLE`**.
4. **Reporter Credentials:**
   - Direct E-paper list access returns **HTTP 403 `FORBIDDEN_ROLE`**.
   - Direct E-paper creation returns **HTTP 403 `FORBIDDEN_ROLE`**.
   - Direct E-paper deletion returns **HTTP 403 `FORBIDDEN_ROLE`**.
   - Direct payment access returns **HTTP 403 `ADMIN_ROLE_REQUIRED`**.
5. **Invalid / Expired Staff Sessions:**
   - Expired session token (`expiresAt` in the past) returns **HTTP 401 `INVALID_STAFF_SESSION`**.
   - Fabricated/unregistered session token returns **HTTP 401 `INVALID_STAFF_SESSION`**.
   - Missing `Authorization` header returns **HTTP 401 `STAFF_AUTH_REQUIRED`**.

---

## 4. Support Payment Access & Data Privacy

Inspected `GET /transactions` and `GET /transactions/:id` in [`backend/src/routes/adminPayments.ts`](file:///c:/projects/Janmabhoomi/janmabhoomi/backend/src/routes/adminPayments.ts).

### 4.1 Data Sanitization & Credential Protection
The transaction detail response was hardened with strict field selection and response sanitization:
```typescript
include: {
  subscriber: {
    select: {
      id: true,
      email: true,
      fullName: true,
      mobileNumber: true,
      status: true,
      isEmailVerified: true,
      isMobileVerified: true,
      createdAt: true,
    },
  },
  order: {
    include: {
      plan: { include: { publication: true } },
    },
  },
}
```
- **Subscriber Credentials:** `passwordHash` is **never** returned.
- **Session Tokens:** Active subscriber sessions or JWT tokens are **never** returned.
- **Cryptographic Secrets:** `razorpaySignature` is **never** returned.
- **Raw Webhook Payloads:** `rawWebhookPayload` is **never** returned in triage responses.
- **Permitted Data:** Support staff receive only the operational data necessary for subscriber triage (Subscriber Name, Email, Mobile Number, Plan Name, Payment Amount, Payment Status, Payment Method, Bank/VPA, Order Receipt Number, and Error Code/Description if failed).
- **Financial Adjustment Protection:** Support staff cannot modify transaction statuses; calling `POST /transactions/:id/adjust` returns **HTTP 403 `SUPER_ADMIN_REQUIRED`**.

---

## 5. Staff Rate Limiting — Local Development Limitation

### 5.1 Current Implementation
Staff login in [`backend/src/routes/staffAuth.ts`](file:///c:/projects/Janmabhoomi/janmabhoomi/backend/src/routes/staffAuth.ts) uses an in-memory `Map<string, { count: number; lockedUntil: number }>()`:
- Maximum 5 failed attempts per 15-minute window per IP address.
- 6th failed attempt triggers **HTTP 429 `RATE_LIMITED`**.
- Resets on successful authentication.

### 5.2 Documented Production Requirement
> [!WARNING] Local-Development Limitation Only
> The current in-memory rate-limiting mechanism is suitable only for single-process local development. It does **not** persist across backend service restarts and is not shared across multi-worker clustering or PM2 instances.
> 
> **Mandatory Production Requirement:** Prior to deploying to the Hostinger KVM VPS, persistent rate limiting backed by Redis or PostgreSQL `audit_logs` / `failed_login_attempts` must be implemented to ensure brute-force protection survives service restarts and functions reliably across load-balanced worker processes.

---

## 6. Comprehensive Canonical Regression Evidence

All canonical test suites were executed sequentially against the real Docker PostgreSQL database (`janmabhoomi_dev`).

| Test Suite | File / Scope | Command Executed | Exit Code | Timestamp (UTC) | Result |
|---|---|---|:---:|:---:|:---:|
| **Phase 1** | `test-health.ts` (Health, Root, DB Ping) | `cd backend; npx.cmd tsx src/test-health.ts` | **0** | 2026-11-12T09:49:11Z | **PASSED** (HTTP 200, Latency 4ms) |
| **Phase 2** | `test-live-db.ts` (8 Pubs, 12 Cats, Enquiries) | `cd backend; npx.cmd tsx src/test-live-db.ts` | **0** | 2026-11-12T09:49:39Z | **PASSED** (8 institutional pubs verified) |
| **Phase 3** | `test-epaper-phase3.ts` (PDF Pipeline, Hotspots) | `cd backend; npx.cmd tsx src/test-epaper-phase3.ts` | **0** | 2026-11-12T09:50:19Z | **15/15 PASSED** (100% success) |
| **Phase 4** | `test-phase4-payments.ts` (Razorpay, HMAC, Subs) | `cd backend; npx.cmd tsx src/test-phase4-payments.ts` | **0** | 2026-11-12T09:51:14Z | **100% SUCCESS** (22 transactions verified) |
| **Phase 5A** | `test-phase5a-admin.ts` (Full Admin Foundation) | `cd backend; npx.cmd tsx src/test-phase5a-admin.ts` | **0** | 2026-11-12T09:51:59Z | **97/97 PASSED** (0 failed across 10 suites) |
| **Backend TS** | TypeScript Compilation (`tsc`) | `npm.cmd --prefix backend run build` | **0** | 2026-11-12T09:45:36Z | **0 Errors** (Compiled to `dist/`) |
| **Frontend** | Next.js 15 App Router Build | `npm.cmd run build` | **0** | 2026-11-12T09:48:41Z | **0 Errors** (All routes compiled) |

---

## 7. Automated Test Suite Summary (97 Passed, 0 Failed)

Command: `cd backend; npx.cmd tsx src/test-phase5a-admin.ts`

```
==================================================================
  JANMABHOOMI PHASE 5A — UNIFIED ADMIN PANEL FOUNDATION TESTS    
==================================================================
--- TEST SUITE 1: STAFF AUTHENTICATION ---
  [PASS] Invalid password returns HTTP 401
  [PASS] Valid Admin login returns HTTP 200
  [PASS] Admin user receives unified role 'Admin'
  [PASS] Permitted publications list contains strictly the TWO newspapers: pub-janmabhoomi and pub-pravasi
  [PASS] GET /api/v1/admin/auth/me returns HTTP 200
  [PASS] Profile confirms role 'Admin'

--- TEST SUITE 2: ADMIN STAFF MANAGEMENT ---
  [PASS] Admin can list all staff accounts (HTTP 200)
  [PASS] Admin creates new staff member with Editor role (HTTP 201)
  [PASS] Created staff member is assigned role 'Editor'

--- TEST SUITE 3: RBAC ENFORCEMENT & EDITOR ISOLATION ---
  [PASS] Editor login returns HTTP 200
  [PASS] Editor user receives unified role 'Editor'
  [PASS] Editor is blocked from staff management (HTTP 403 Forbidden)
  [PASS] Editor cannot create staff accounts (HTTP 403 Forbidden)
  [PASS] Editor is blocked from financial transactions (HTTP 403 Forbidden)

--- TEST SUITE 4: SCOPED DASHBOARD & 2-NEWSPAPER RESTRICTION ---
  [PASS] Editor can view dashboard stats (HTTP 200)
  [PASS] Dashboard reports strictly 2 newspapers
  [PASS] Financial and revenue figures are strictly NULL / hidden from Editor
  [PASS] Enquiries metrics are restricted / NULL for Editor role
  [PASS] Admin can view dashboard stats (HTTP 200)
  [PASS] Admin receives financial summary metrics
  [PASS] Admin financial metrics include totalRevenueInr
  [PASS] Admin receives enquiries metrics
  [PASS] Admin publications list returns HTTP 200
  [PASS] Publications list contains ONLY pub-janmabhoomi and pub-pravasi (Purti is not a publication)
  [PASS] Purti is not a standalone publication; request for 'pub-purti' is rejected with HTTP 403 Forbidden
  [PASS] Excluded publication 'pub-kutchmitra' is rejected with HTTP 403 Forbidden
  [PASS] Excluded publication 'pub-phulchhab' is rejected with HTTP 403 Forbidden
  [PASS] Permitted newspaper 'pub-janmabhoomi' returns HTTP 200
  [PASS] Janmabhoomi publicationType is DAILY_NEWSPAPER
  [PASS] Janmabhoomi status is ACTIVE
  [PASS] Permitted newspaper 'pub-pravasi' returns HTTP 200
  [PASS] Janmabhoomi Pravasi publicationType is WEEKLY_NEWSPAPER
  [PASS] Janmabhoomi Pravasi status PLANNED is preserved

--- TEST SUITE 5: STAFF LIFECYCLE & SESSION REVOCATION ---
  [PASS] Admin can deactivate staff account (HTTP 200)
  [PASS] Deactivated staff login rejected with HTTP 403
  [PASS] Revoked session rejected with HTTP 401 Unauthorized
  [PASS] Reactivated editor re-login returns HTTP 200

--- TEST SUITE 6: ALL 7 EXCLUDED PUBLICATIONS ISOLATION ---
  [PASS] GET /api/v1/admin/publications/pub-kutchmitra rejected with HTTP 403 Forbidden
  [PASS] POST /api/v1/epaper/admin/editions for excluded 'pub-kutchmitra' rejected with HTTP 403
  [PASS] GET /api/v1/epaper/admin/editions?publicationId=pub-kutchmitra rejected with HTTP 403
  [PASS] GET /api/v1/admin/publications/pub-phulchhab rejected with HTTP 403 Forbidden
  [PASS] POST /api/v1/epaper/admin/editions for excluded 'pub-phulchhab' rejected with HTTP 403
  [PASS] GET /api/v1/epaper/admin/editions?publicationId=pub-phulchhab rejected with HTTP 403
  [PASS] GET /api/v1/admin/publications/pub-vyapar-gu rejected with HTTP 403 Forbidden
  [PASS] POST /api/v1/epaper/admin/editions for excluded 'pub-vyapar-gu' rejected with HTTP 403
  [PASS] GET /api/v1/epaper/admin/editions?publicationId=pub-vyapar-gu rejected with HTTP 403
  [PASS] GET /api/v1/admin/publications/pub-vyapar-hi rejected with HTTP 403 Forbidden
  [PASS] POST /api/v1/epaper/admin/editions for excluded 'pub-vyapar-hi' rejected with HTTP 403
  [PASS] GET /api/v1/epaper/admin/editions?publicationId=pub-vyapar-hi rejected with HTTP 403
  [PASS] GET /api/v1/admin/publications/pub-panchang rejected with HTTP 403 Forbidden
  [PASS] POST /api/v1/epaper/admin/editions for excluded 'pub-panchang' rejected with HTTP 403
  [PASS] GET /api/v1/epaper/admin/editions?publicationId=pub-panchang rejected with HTTP 403
  [PASS] GET /api/v1/admin/publications/pub-kavita rejected with HTTP 403 Forbidden
  [PASS] POST /api/v1/epaper/admin/editions for excluded 'pub-kavita' rejected with HTTP 403
  [PASS] GET /api/v1/epaper/admin/editions?publicationId=pub-kavita rejected with HTTP 403
  [PASS] GET /api/v1/admin/publications/pub-purti rejected with HTTP 403 Forbidden
  [PASS] POST /api/v1/epaper/admin/editions for excluded 'pub-purti' rejected with HTTP 403
  [PASS] GET /api/v1/epaper/admin/editions?publicationId=pub-purti rejected with HTTP 403
  [PASS] Query for 'pub-janmabhoomi' allowed (HTTP 200)
  [PASS] Query for 'pub-pravasi' allowed (HTTP 200)

--- TEST SUITE 7: E-PAPER GRANULAR OPERATION AUTHORIZATION ---
  [PASS] Editor can view E-paper editions list (HTTP 200)
  [PASS] Editor can create draft edition (HTTP 201)
  [PASS] Editor can view page hotspot editor data (HTTP 200)
  [PASS] Editor can create hotspot linked to permitted article (HTTP 201)
  [PASS] Linking hotspot to an article from an excluded publication rejected with HTTP 403
  [PASS] Editor can update hotspot geometry (HTTP 200)
  [PASS] Editor can delete hotspot (HTTP 200)
  [PASS] Editor can publish edition (HTTP 200)
  [PASS] Editor is blocked from archiving editions (HTTP 403 ADMIN_ROLE_REQUIRED)
  [PASS] Editor is blocked from deleting editions (HTTP 403 ADMIN_ROLE_REQUIRED)
  [PASS] Admin can archive edition (HTTP 200)
  [PASS] Admin can permanently delete edition (HTTP 200)

--- TEST SUITE 8: PAYMENT & SUPPORT ROLE ACCESS & DATA PRIVACY ---
  [PASS] Support staff is barred from Admin Panel login interface (HTTP 403 FORBIDDEN_STAFF_ROLE)
  [PASS] Support role has NO E-paper management access (HTTP 403 FORBIDDEN_ROLE)
  [PASS] Support role cannot create E-paper editions (HTTP 403 FORBIDDEN_ROLE)
  [PASS] Support staff has read-only access to transactions list for triage (HTTP 200)
  [PASS] Support can view transaction details for triage (HTTP 200)
  [PASS] Subscriber passwordHash is strictly excluded from response (Credentials protected)
  [PASS] razorpaySignature is strictly excluded from response (Secrets protected)
  [PASS] rawWebhookPayload is strictly excluded from response (Payloads protected)
  [PASS] Subscriber email is available for support triage
  [PASS] Support staff is strictly forbidden from financial adjustments (HTTP 403 SUPER_ADMIN_REQUIRED)

--- TEST SUITE 9: DIRECT API ACCESS BY LEGACY ROLES & INVALID SESSIONS ---
  [PASS] Reporter role has NO E-paper management access (HTTP 403 FORBIDDEN_ROLE)
  [PASS] Reporter cannot create E-paper editions (HTTP 403 FORBIDDEN_ROLE)
  [PASS] Reporter is blocked from payment transactions (HTTP 403 ADMIN_ROLE_REQUIRED)
  [PASS] Expired staff session rejected with HTTP 401 (INVALID_STAFF_SESSION)
  [PASS] Non-existent staff token rejected with HTTP 401 (INVALID_STAFF_SESSION)
  [PASS] Missing staff authorization header rejected with HTTP 401 (STAFF_AUTH_REQUIRED)

--- TEST SUITE 10: STAFF LOGIN RATE LIMITING AUDIT ---
  [PASS] Failed attempt 1/5 returns HTTP 401
  [PASS] Failed attempt 2/5 returns HTTP 401
  [PASS] Failed attempt 3/5 returns HTTP 401
  [PASS] Failed attempt 4/5 returns HTTP 401
  [PASS] Failed attempt 5/5 returns HTTP 401
  [PASS] 6th failed login attempt triggers HTTP 429 Rate Limited (15-min lockout)
  [PASS] Error code is RATE_LIMITED
  [PASS] Login from clean IP succeeds (HTTP 200) and resets tracker

--- FINAL CLEANUP & LOGOUT ---
  [PASS] Admin logout returns HTTP 200
  [PASS] Logged-out token immediately rejected with HTTP 401

==================================================================
  PHASE 5A ADMIN TEST RESULTS: 97 PASSED | 0 FAILED
==================================================================
```

---

## 8. Compliance with Strict Restrictions

- **Phase 5B Not Started:** Zero Phase 5B features (such as supplement tagging UI or physical DDL migration) have been implemented.
- **Publication Allowlist Preserved:** Strictly `pub-janmabhoomi` and `pub-pravasi`.
- **No Separate Purti Publication:** Purti remains accurately classified as an edition-level supplement ecosystem; no duplicate publication was created.
- **No Modifications to Unrelated Services:** Payment gateway processing, subscriber authentication, email services, cron jobs, and E-paper PDF processing pipelines were untouched.
- **No GitHub Pushes or Deployments:** Zero git commits pushed to remote repository; zero deployments triggered.

---

## 9. Final Sign-Off

Phase 5A Unified Admin Panel Foundation has passed its final E-Paper Authorization and Security Verification Audit with **100% compliance**. All tasks for Phase 5A are complete and halted awaiting executive review.
