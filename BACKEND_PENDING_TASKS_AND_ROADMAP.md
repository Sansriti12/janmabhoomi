# JANMABHOOMI GROUP DIGITAL NEWSPAPER
## Backend Pending Tasks, Work Breakdown Structure (WBS) & Implementation Roadmap

**Document ID:** DOC-ROADMAP-BE-001  
**Date:** 11 November 2026  
**Auditor / Engineering Lead:** Lead Full-Stack Software Engineer  
**Scope:** Complete Backend Development, Security Hardening, and Production VPS Rollout  

---

## 1. Prioritization Hierarchy Definition

- **P0 (Critical Launch Blockers):** Tasks strictly required before public DNS cutover. Without these, the site cannot authenticate staff, store real articles, accept archive enquiries, or run securely.
- **P1 (First Production Release):** Important tasks required for full operational newsroom workflows (E-Paper PDF ingestion, automated backups, PayU checkout, subscriber logins).
- **P2 (Post-Launch Enhancements):** Advanced features that can be added incrementally without blocking the live launch (trigram search, OCR clipping, ad impression analytics).

---

## 2. Comprehensive Task Breakdown Matrix

| Task ID | Task Name | Priority | Complexity | Dependencies | Relevant Files / Modules | Can Be Developed Independently? |
| :---: | :--- | :---: | :---: | :--- | :--- | :---: |
| **T-P0-01** | **Hostinger PostgreSQL Setup & Prisma Migration Deploy** | **P0** | Low | Hostinger VPS | `backend/prisma/migrations/`, `backend/.env` | ❌ Server dependent |
| **T-P0-02** | **Prisma Fastify Lifecycle Plugin** | **P0** | Low | None | `backend/src/plugins/prisma.ts` | ✅ **Yes (Standalone)** |
| **T-P0-03** | **Staff Authentication & Session Engine (Argon2id)** | **P0** | Medium | T-P0-02 | `backend/src/modules/auth/`, `@node-rs/argon2` | ✅ **Yes (Standalone)** |
| **T-P0-04** | **Interactive CLI Super-Admin Provisioning Script** | **P0** | Low | T-P0-03 | `backend/src/scripts/setup-admin.ts` | ✅ **Yes (Standalone)** |
| **T-P0-05** | **Archived Information Enquiry Schema & Public API** | **P0** | Medium | T-P0-02 | `backend/prisma/schema.prisma`, `backend/src/modules/enquiries/` | ✅ **Yes (Standalone)** |
| **T-P0-06** | **Core Public Articles & Categories Read APIs** | **P0** | Medium | T-P0-02 | `backend/src/modules/articles/`, `backend/src/modules/categories/` | ✅ **Yes (Standalone)** |
| **T-P0-07** | **Frontend ApiNewsDataProvider Implementation** | **P0** | Medium | T-P0-06 | `src/lib/data/apiProvider.ts`, `src/lib/data/provider.ts` | ❌ Needs T-P0-06 |
| **T-P0-08** | **Nginx Reverse Proxy, SSL (Certbot) & UFW Firewall Setup** | **P0** | Medium | Hostinger VPS | `/etc/nginx/sites-available/janmabhoomi` | ❌ Server dependent |
| **T-P0-09** | **PM2 Process Orchestration Configuration** | **P0** | Low | Node.js | `backend/ecosystem.config.cjs` | ✅ **Yes (Standalone)** |
| **T-P1-01** | **E-Paper Metadata & Public Editions Listing APIs** | **P1** | Medium | T-P0-02 | `backend/src/modules/epaper/` | ✅ **Yes (Standalone)** |
| **T-P1-02** | **Pre-Press PDF Upload & Poppler Rasterizer Pipeline** | **P1** | High | T-P1-01, `@fastify/multipart` | `backend/src/modules/epaper/pdfProcessor.ts` | ❌ Needs poppler-utils |
| **T-P1-03** | **Editorial CMS Publishing & Review Desk APIs** | **P1** | High | T-P0-03 | `backend/src/modules/articles/adminArticles.ts` | ❌ Needs T-P0-03 |
| **T-P1-04** | **PayU India Sandbox Gateway Integration & SHA-512** | **P1** | High | Management test keys | `backend/src/modules/payments/payuService.ts` | ✅ **Yes (With test keys)** |
| **T-P1-05** | **PayU Webhook Receiver with Idempotent Subscription Grant**| **P1** | High | T-P1-04 | `backend/src/modules/payments/webhookController.ts` | ❌ Needs T-P1-04 |
| **T-P1-06** | **Subscriber Registration & Protected E-Paper Gating** | **P1** | Medium | T-P1-05 | `backend/src/modules/subscribers/` | ❌ Needs T-P1-05 |
| **T-P1-07** | **Automated Nightly Database Backup & Rotation Script** | **P1** | Low | Linux cron | `scripts/backup-db.sh` | ✅ **Yes (Standalone)** |
| **T-P1-08** | **Rate Limiting & Brute-Force IP Throttling** | **P1** | Low | Fastify | `backend/src/plugins/rateLimit.ts` | ✅ **Yes (Standalone)** |
| **T-P1-09** | **Contact Us Form Ingestion & Staff Email Notification** | **P1** | Medium | SMTP credentials | `backend/src/modules/contact/`, `nodemailer` | ❌ Needs SMTP |
| **T-P2-01** | **Trigram Full-Text Search API (`pg_trgm`)** | **P2** | Medium | PostgreSQL | `backend/src/modules/search/` | ✅ **Yes (Standalone)** |
| **T-P2-02** | **Interactive E-Paper Hotspot Vector Coordinate Editor** | **P2** | High | T-P1-01 | `src/components/admin/epaper/HotspotEditor.tsx` | ❌ Needs E-Paper viewer |
| **T-P2-03** | **Commercial Banner Advertisement Delivery & Click Tracker**| **P2** | Medium | T-P0-02 | `backend/src/modules/ads/` | ✅ **Yes (Standalone)** |
| **T-P2-04** | **Multi-Publication Onboarding (Kutchmitra, Phulchhab, Vyapar)**| **P2** | Medium | All P0/P1 modules | `backend/prisma/seed.ts`, DNS routing | ❌ Needs launch |

---

## 3. High-Priority Task Specifications (P0 Deep Dive)

### Task T-P0-01: Hostinger PostgreSQL Setup & Migration Deployment
- **Objective:** Provision PostgreSQL 16 on Hostinger KVM VPS, create `janmabhoomi_prod` database and unprivileged user `jb_app_user`, and run `npx prisma migrate deploy`.
- **Pre-requisites:** Root SSH access to Hostinger VPS.
- **Estimated Complexity:** Low (1 hour).
- **Verification:** Execute `npx prisma migrate status` confirming 0 pending migrations.

### Task T-P0-02: Prisma Fastify Lifecycle Plugin
- **Objective:** Wrap `PrismaClient` in a Fastify plugin (`fastify-plugin`) decorating `fastify.prisma`, ensuring graceful connection disconnect on server shutdown.
- **Estimated Complexity:** Low (30 minutes).
- **Independent Development:** Yes, can be built and tested locally in `backend/src/plugins/prisma.ts`.

### Task T-P0-03: Staff Authentication & Session Engine (Argon2id)
- **Objective:** Install `@node-rs/argon2` and `@fastify/cookie`. Implement `POST /api/v1/auth/login` validating email/password, issuing a cryptographically random 64-byte session token, saving its SHA-256 hash in `staff_sessions`, and setting an `httpOnly`, `secure`, `sameSite: 'lax'` cookie.
- **Estimated Complexity:** Medium (4 hours).
- **Independent Development:** Yes, testable locally via curl / Postman.

### Task T-P0-04: Interactive CLI Super-Admin Setup Script
- **Objective:** Author `backend/src/scripts/setup-admin.ts`. Prompts administrator via CLI for: Full Name, Email, and Password. Hashes password with Argon2id, creates user in `users` table, and assigns `super_admin` role.
- **Estimated Complexity:** Low (1 hour).
- **Safety:** Zero hardcoded passwords in version control.

### Task T-P0-05: Archived Information Enquiry Backend API
- **Objective:**
  1. Add `ArchiveEnquiry` model to `backend/prisma/schema.prisma` with fields: `id`, `referenceNumber` (unique), `fullName`, `contactNumber`, `email`, `publicationId`, `year`, `infoType`, `additionalDetails`, `preferredContact`, `status` (`PENDING`, `IN_REVIEW`, `COMPLETED`, `REJECTED`), `assignedStaffId`, `createdAt`, `updatedAt`.
  2. Implement `POST /api/v1/enquiries/archive` with Zod validation. Generate sequence reference code (`AR-2026-XXXX`).
  3. Implement protected `GET /api/v1/admin/enquiries/archive` for staff review.
- **Estimated Complexity:** Medium (3 hours).
- **Independent Development:** Yes, connects directly to the existing frontend service [`archiveEnquiryService.ts`](file:///c:/projects/Janmabhoomi/janmabhoomi/src/lib/services/archiveEnquiryService.ts).

### Task T-P0-06: Core Public Articles & Categories Read APIs
- **Objective:** Build Fastify controllers for:
  - `GET /api/v1/articles/home?lang={lang}` (Aggregated lead, breaking, and category previews).
  - `GET /api/v1/articles/latest?page=1&limit=20`.
  - `GET /api/v1/articles/:slug?lang={lang}`.
  - `GET /api/v1/categories`.
  - `GET /api/v1/editorials/today?lang={lang}`.
  - `GET /api/v1/panchang/:date?city={city}`.
- **Estimated Complexity:** Medium (5 hours).
- **Independent Development:** Yes, uses seeded data.

### Task T-P0-07: Frontend ApiNewsDataProvider Implementation
- **Objective:** Create `src/lib/data/apiProvider.ts` satisfying `INewsDataProvider`. Swap frontend provider to consume live Fastify backend endpoints.
- **Estimated Complexity:** Medium (3 hours).
- **Verification:** Run `npm run build` and verify all 24 Next.js routes render with live data.

---

## 4. Phase 3 Execution Timeline & Milestones

```
+─────────────────────────────────────────────────────────────────────────────+
| MILESTONE 1: Local Backend Completion (Days 1–3)                             |
| - Tasks T-P0-02, T-P0-03, T-P0-04, T-P0-05, T-P0-06                         |
| - Complete Fastify routes, auth, and enquiry API running on localhost:4000  |
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
| MILESTONE 2: Frontend-Backend Local Integration (Days 4–5)                  |
| - Task T-P0-07                                                              |
| - Switch Next.js to ApiNewsDataProvider                                     |
| - End-to-end verification of homepage, news reading, and enquiry form       |
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
| MILESTONE 3: Hostinger VPS Provisioning & Hardening (Days 6–7)              |
| - Tasks T-P0-01, T-P0-08, T-P0-09                                           |
| - Ubuntu hardening, PostgreSQL tuning, Nginx TLS 1.3, UFW, PM2 daemon      |
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
| MILESTONE 4: Newsroom Operations & Payments (Days 8–12)                     |
| - Tasks T-P1-01 to T-P1-09                                                  |
| - Pre-press PDF ingestion, PayU checkout & webhooks, subscriber gating      |
+─────────────────────────────────────────────────────────────────────────────+
```
