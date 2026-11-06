# Janmabhoomi Digital Newspaper – Phase 3A: Confirmed vs. Pending Decisions Matrix (Revised)

**Document Version:** 2.0.0  
**Phase:** 3A (Backend Foundation)  
**Target Stakeholders:** Saurashtra Trust Board of Management, IT Department, Editorial Board

---

## 1. Confirmed Technical Foundation (Proceeding in Phase 3A)

These decisions are finalized and implemented in the architecture:

| Decision Item | Confirmed Resolution | Architectural Location |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4 | `src/` |
| **Localization Model** | Dual-language routing (`/en` and `/gu`) with native Gujarati typography | `src/app/[lang]/` |
| **Data Abstraction Contract**| `INewsDataProvider` interface pattern; components never query databases directly | `src/lib/data/provider.ts` |
| **Publication Scope** | **8 Publications / Products** across 5 distinct publication types | `src/lib/data/config/publications.ts` |
| **Backend Architecture** | Modular Monolith (Fastify 5.x with Native TypeScript and Zod) | `backend/` |
| **Primary Relational DB** | PostgreSQL 16 with Prisma ORM for type safety and migrations | `backend/prisma/schema.prisma` |
| **Session Persistence** | Persistent sessions stored in PostgreSQL `staff_sessions` (no in-memory sessions) | `backend/src/modules/auth/` |
| **Initial Admin Security**| Zero hardcoded admin passwords in seed scripts; interactive CLI setup script | `backend/src/scripts/setup-admin.ts` |
| **File Storage** | Storage abstraction (`IStorageProvider`); local disk for dev/test (`backend/uploads/`) | `backend/src/common/storage/` |
| **Payment Gateway Mode** | PayU India strictly in **Sandbox Mode** with test keys and server SHA-512 hashes | `backend/src/modules/payments/` |
| **Development Boundary** | Strictly local development (`localhost`), zero modifications to production or DNS | Local machine only |

---

## 2. The 8 Confirmed Saurashtra Trust Publications / Products

| # | Product Name | Slug | Product Type | Frequency | Status |
| :-: | :--- | :--- | :--- | :--- | :---: |
| **1** | **Janmabhoomi** (જન્મભૂમિ) | `janmabhoomi` | `daily_newspaper` | Daily Broadsheet (Evening) | `active` |
| **2** | **Kutchmitra** (કચ્છમિત્ર) | `kutchmitra` | `daily_newspaper` | Daily Morning | `planned` |
| **3** | **Phulchhab** (ફૂલછાબ) | `phulchhab` | `daily_newspaper` | Daily Morning | `planned` |
| **4** | **Vyapar Gujarati** (વ્યાપાર) | `vyapar-gujarati` | `biweekly_newspaper` | Bi-Weekly (Wed & Sat) | `planned` |
| **5** | **Vyapar Hindi** (વ્યાપાર હિન્દી) | `vyapar-hindi` | `weekly_newspaper` | Weekly Financial | `planned` |
| **6** | **Janmabhoomi Pravasi** (પ્રવાસી) | `janmabhoomi-pravasi` | `weekly_newspaper` | Sunday Weekly Broadsheet | `planned` |
| **7** | **Panchang** (જન્મભૂમિ પંચાંગ) | `panchang` | `almanac` | Annual Almanac & Daily Astrological | `active` |
| **8** | **Kavita** (કવિતા) | `kavita` | `magazine` | Quarterly Magazine (Every 3 Months) | `planned` |

---

## 3. Pending Decisions Matrix & Configuration Strategies

These operational and business rules are awaiting management/IT confirmation. The architecture handles every single one by making it **dynamically configurable via database records or environment variables**, rather than hardcoded in application logic.

| # | Pending Operational Item | Awaiting From | Impact on System | Architecture Mitigation / Configuration Strategy |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Hosting Provider & Infrastructure Specifications** | Management / IT Department | Production hosting platform, compute sizing, and PostgreSQL version. | **Mitigation:** The architecture does not assume Hostinger VPS or any specific vendor. The backend is built as standard Node.js/Fastify, container-ready and configurable for any Linux server or managed PostgreSQL environment once decided. |
| **2** | **Production Storage Strategy & Migration** | Management / IT Department | Long-term asset storage (Local server disk vs Cloud S3/R2). | **Mitigation:** Built on `IStorageProvider` abstraction using local disk for dev/test. When cloud storage is evaluated, a full migration plan (credentials, bucket policies, asset sync, and streaming test) will be presented. |
| **3** | **Domain & DNS Management** | IT Department | SSL termination, subdomains (`api.`, `admin.`). | **Mitigation:** API base URLs and CORS origins are driven entirely by environment variables (`NEXT_PUBLIC_API_URL`, `CORS_ORIGIN`). Switching domains requires zero code changes. |
| **4** | **PayU Production Merchant Key & Salt** | Commercial Accounts | Live payment processing. | **Mitigation:** PayU credentials reside in backend `.env`. Phase 3A uses test sandbox keys exclusively. |
| **5** | **Subscription Pricing & Commercial Scope** (Individual vs Bundled vs Group-Wide) | Board of Trustees | Reader checkout amounts, plan durations, and multi-title bundling. | **Mitigation:** The schema supports single-title, multi-title, and group-wide plans, but group-wide subscriptions will remain inactive until formal board approval. All prices are stored in `subscription_plans`. |
| **6** | **E-Paper Free Teaser Page Count** | Editorial Board | Reader access gate in E-Paper viewer. | **Mitigation:** Stored as `epaper_free_preview_pages` column in the `publications` table. Default set to `0`, configurable per publication dynamically. |
| **7** | **Panchang Live Astronomical Source Feed** | Editorial Board | Daily tithi, nakshatra, and choghadiya updates. | **Mitigation:** `pub-panchang` is an official product; its daily astronomical feed is flagged with `is_demo_sample: true` until an approved Jyotish feed or CSV source is officially confirmed. |
| **8** | **Kavita Archival Metadata & Past Issues** | Editorial Department | Issue numbering, volume/year, and back-issue archive. | **Mitigation:** The `epaper_editions` schema supports `volume_year`, `issue_number`, `cover_image_url`, and quarterly release dates without assuming unconfirmed official issue numbers. |
| **9** | **Historical / Audit Figures Verification** | Management / Archives | Founding years, circulation claims, and legacy benchmark scores. | **Mitigation:** All historical dates and audit benchmark scores cited from internal audit reports are treated as unverified reference data until reconciled against official Trust records. |
