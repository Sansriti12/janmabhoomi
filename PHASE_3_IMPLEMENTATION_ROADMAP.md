# Janmabhoomi Digital Newspaper – Phase 3: Implementation Roadmap

**Document Version:** 1.0.0  
**Methodology:** 4-Stage Coordinated Sprint Rollout  
**Total Estimated Timeline:** 8 to 10 Weeks  
**Primary Objective:** Deliver a fully operational, multi-tenant digital news platform and E-Paper subscription engine for Saurashtra Trust without operational disruption.

---

## 1. Roadmap Overview & Timeline Gantt

```
+-----------------------------------------------------------------------------------+
| SPRINT PHASES                          | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 |
+-----------------------------------------------------------------------------------+
| 3A: Core Database & API Engine         | ===|====|    |    |    |    |    |    |
| 3B: Editorial Admin CMS & Newsroom Desk|    |    |====|====|    |    |    |    |
| 3C: E-Paper Pipeline & Hotspot Studio  |    |    |    |    |====|====|    |    |
| 3D: PayU Subscriptions & Launch Cutover|    |    |    |    |    |    |====|====|
+-----------------------------------------------------------------------------------+
```

---

## 2. Phase 3A: Core Backend & Persistence Engine (Weeks 1 – 2)

### Focus: Database schema migration, REST API framework, authentication, and frontend data-provider wiring.

- **Milestone 3A.1:** Setup PostgreSQL 16 database, execute DDL schema migrations, and generate Prisma/Drizzle type-safe models.
- **Milestone 3A.2:** Seed master database with Saurashtra Trust publications (`janmabhoomi`, `vyapar`, `phulchhab`, `kutchmitra`, `pravasi`, `kavita`), initial categories, and bilingual sample content.
- **Milestone 3A.3:** Initialize Node.js REST API service (Fastify / NestJS) with CORS, rate limiting, and standard response envelopes.
- **Milestone 3A.4:** Implement public content endpoints: `/publications/:id/homepage`, `/articles`, `/articles/:slug`, `/panchang`, and `/search`.
- **Milestone 3A.5:** Implement `ApiNewsDataProvider` in Next.js frontend, switch `NEXT_PUBLIC_DATA_PROVIDER=api`, and verify seamless parity with the current `MockNewsDataProvider`.

### Exit Criteria for 3A:
- All Next.js frontend pages render live dynamic data from the PostgreSQL database via REST API.
- Zero breaking changes to existing UI layouts or bilingual Gujarati/English routes.

---

## 3. Phase 3B: Admin CMS & Editorial Newsroom Desk (Weeks 3 – 4)

### Focus: Role-based administrative dashboard, Gujarati typing support, and publication workflow.

- **Milestone 3B.1:** Scaffold Admin CMS portal with modern UI (Tailwind CSS, responsive layout, sidebar navigation).
- **Milestone 3B.2:** Implement JWT + HttpOnly cookie authentication and RBAC guards across 8 roles (Super Admin down to Reporter).
- **Milestone 3B.3:** Develop Dual-Pane Article Editor with side-by-side Gujarati and English editing, integrated phonetic Gujarati transliteration, and SEO preview cards.
- **Milestone 3B.4:** Implement Editorial Review Lifecycle state machine: `Draft` -> `Pending Review` -> `Approved` -> `Scheduled` -> `Published`.
- **Milestone 3B.5:** Implement Category Manager, Author Directory, and Daily Panchang data input modules.
- **Milestone 3B.6:** Wire on-demand cache revalidation webhooks from CMS to Cloudflare CDN and Next.js frontend.

### Exit Criteria for 3B:
- Journalists and editors can draft, review, transliterate Gujarati text, and publish articles with automated cache invalidation.

---

## 4. Phase 3C: Pre-Press E-Paper Pipeline & Hotspot Studio (Weeks 5 – 6)

### Focus: Automated PDF ingestion, 300 DPI WebP rendering, interactive hotspot mapping, and DRM viewer.

- **Milestone 3C.1:** Configure asynchronous worker queue (BullMQ + Redis) for background PDF processing.
- **Milestone 3C.2:** Implement server-side PDF splitting, CMYK-to-sRGB color correction, and dual-resolution WebP rendering (300 DPI reader view, 150 DPI thumbnail) using Ghostscript and Sharp.
- **Milestone 3C.3:** Integrate Cloudflare R2 / S3 object storage for secure asset hosting.
- **Milestone 3C.4:** Develop Visual Hotspot Drawing Studio in CMS, allowing editors to draw clickable bounding boxes over newspaper clippings.
- **Milestone 3C.5:** Enhance Next.js `/epaper` viewer with smooth pinch-to-zoom, pan, thumbnail strip, and interactive hotspot popup cards.
- **Milestone 3C.6:** Implement Page 1 & 2 public teaser access and Page 3+ paywall gating.

### Exit Criteria for 3C:
- Editorial desk can upload a master pre-press print PDF; the system automatically processes and publishes an interactive digital E-Paper edition within 5 minutes.

---

## 5. Phase 3D: PayU Subscriptions, Security Hardening & Launch (Weeks 7 – 8)

### Focus: PayU checkout, server-to-server webhook verification, anti-account sharing, and production cutover.

- **Milestone 3D.1:** Configure PayU sandbox environment, implement server-side SHA-512 request and response hash calculations.
- **Milestone 3D.2:** Implement idempotent server-to-server webhook handler (`/payments/payu/webhook`) with Redis transaction locks and automatic subscriber entitlement updates.
- **Milestone 3D.3:** Develop subscriber account portal (`/account/subscription`), showing active plan, expiry date, invoice history, and device management.
- **Milestone 3D.4:** Implement anti-sharing protection: 2-device concurrency limit with automated session eviction.
- **Milestone 3D.5:** Conduct end-to-end sandbox payment testing across UPI, NetBanking, and Credit Cards; verify failure, retry, and cancellation paths.
- **Milestone 3D.6:** Deploy to production VPS environment, configure Cloudflare DNS and SSL, run security vulnerability scan, and execute production cutover.

### Exit Criteria for 3D:
- End-to-end subscriber journey is verified: reader browses Page 1 -> hits paywall on Page 3 -> completes PayU transaction -> instant access unlocked across desktop and mobile devices.
