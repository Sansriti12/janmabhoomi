# Janmabhoomi Digital Newspaper – Phase 3: Backend Architecture Design

**Document Version:** 1.0.0  
**Status:** Approved Architecture Specification  
**Scope:** Saurashtra Trust Digital Ecosystem (Janmabhoomi, Vyapar, Phulchhab, Kutchmitra, Janmabhoomi Pravasi, Kavita)  
**Target Architecture:** Decoupled Headless Content Platform & Subscriptions Backend

---

## 1. Executive Summary & Architecture Principles

The Janmabhoomi digital newspaper platform requires a resilient, multi-tenant digital publishing and subscriber management architecture capable of supporting:
1. High-concurrency read traffic across Gujarati and English digital portals.
2. Multi-publication editorial workflows across 6 historic mastheads.
3. High-resolution E-Paper ingestion, vector hotspot mapping, and secured rendering.
4. Tiered subscription billing and real-time PayU merchant integration.
5. Strict separation between public presentation, editorial management, and data persistence.

```
+-----------------------------------------------------------------------------------+
|                                  PUBLIC CLIENTS                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  | Next.js Frontend (Web & Mobile Web) |  | Future Mobile Apps (iOS / Android) |  |
|  | Deployed on Vercel / Edge Network   |  | React Native / Flutter             |  |
|  +-------------------------------------+  +------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                      HTTPS / JSON REST / CDN Edge Caching
                                          v
+-----------------------------------------------------------------------------------+
|                             API GATEWAY & EDGE LAYER                              |
|  +-----------------------------------------------------------------------------+  |
|  | Cloudflare CDN / WAF / Reverse Proxy (DDoS, Rate Limiting, SSL Termination) |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                           CORE BACKEND SERVICES (NODE.JS)                         |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|  | Public Content API    | | Admin CMS API         | | E-Paper Ingestion & Srv |  |
|  | - News, Categories    | | - Editorial Workflow  | | - PDF Slicing / WebP    |  |
|  | - Panchang, Editorials| | - Multi-tenant RBAC   | | - Hotspot Mapping Coord |  |
|  | - Search & Archives   | | - Translation Linker  | | - Secure Token Viewer   |  |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|  +-------------------------------------------------+ +-------------------------+  |
|  | Auth & Subscription Engine                      | | Worker Queue (BullMQ)   |  |
|  | - JWT Session / Refresh Tokens                  | | - PDF Rasterization     |  |
|  | - PayU Hash Gen & Webhook Idempotency           | | - Panchang Ingestion    |  |
|  | - Entitlement & Session Guard                   | | - Push Notifications    |  |
|  +-------------------------------------------------+ +-------------------------+  |
+-----------------------------------------------------------------------------------+
                         |                                |
                         v                                v
+--------------------------------------+   +----------------------------------------+
|       PERSISTENCE LAYER (POSTGRES)   |   |        STORAGE & CACHE LAYER           |
|  - Relational Multi-Publication DB   |   |  - Redis (Session Store, Rate Limits,  |
|  - ACID Compliant Transactions       |   |    Response Cache, Queue Broker)       |
|  - Full Text & Bilingual Trigrams    |   |  - S3-Compatible Object Store (PDFs,   |
|  - Strict Foreign Keys & Audit Logs  |   |    WebP Editions, Media Uploads)       |
+--------------------------------------+   +----------------------------------------+
```

### Key Architectural Tenets
1. **Zero Downtime Publishing:** News creation, article publishing, and E-Paper ingestion occur without invalidating active reader sessions or locking relational tables.
2. **Strict Multi-Publication Multi-Tenancy:** All content, categories, staff permissions, and editions are partitioned by `publication_id`, supporting Saurashtra Trust's portfolio under unified governance.
3. **Decoupled Frontend:** The Next.js frontend interacts strictly via the established `INewsDataProvider` contract over RESTful endpoints. The Next.js frontend has zero direct database credentials.
4. **Resilient Idempotent Payments:** Subscriptions are activated solely via signed, server-to-server PayU webhooks with cryptographic hash verification and strict deduplication.
5. **Asset Offloading:** Heavy static assets (PDFs, multi-resolution page images, article hero banners) never hit application memory directly; they are ingested by asynchronous worker queues, stored in S3-compatible object storage, and delivered via CDN edge nodes.

---

## 2. Technology Stack Evaluation & Recommendations

| Architectural Tier | Selected Technology | Alternative Evaluated | Selection Rationale |
| :--- | :--- | :--- | :--- |
| **API Runtime** | **Node.js 20+ LTS (Fastify / NestJS)** | Next.js API Routes / Go | Dedicated API layer avoids tying backend processing (PDF slicing, payment webhooks, queue workers) to serverless cold starts and memory limits. |
| **Database** | **PostgreSQL 16+** | MySQL 8.0 / MongoDB | Superior JSONB indexing, robust transactional integrity for subscriptions, native UTF-8 collation for Gujarati script, and advanced trigram indexing (`pg_trgm`) for bilingual search. |
| **ORM / Query Layer**| **Prisma or Drizzle ORM** | TypeORM / Raw SQL | Complete type safety matching TypeScript frontend contracts, automated migrations, connection pooling support, and minimal runtime overhead. |
| **Cache & Queue Broker** | **Redis 7.2+ (Dragonfly / Redis)** | RabbitMQ / Memcached | Dual-purpose: ultra-low latency response caching and BullMQ distributed queue backing for asynchronous PDF rendering and scheduled publication. |
| **Object Storage** | **S3-Compatible (MinIO / Cloudflare R2 / AWS S3)** | Local Disk Storage | Cloud-agnostic, infinitely scalable, supports time-limited pre-signed URLs for authenticated subscriber PDF viewing, and protects Hostinger VPS storage from filling up. |
| **PDF Processing** | **Ghostscript + pdf-lib + Sharp** | Third-party SaaS | Zero recurring per-page API costs; self-hosted high-resolution rasterization to WebP and vector bounding box extraction. |

---

## 3. Multi-Publication Architecture (Tenant Isolation)

The Saurashtra Trust operates multiple distinct publications:
1. `janmabhoomi` (Mumbai, Gujarati)
2. `vyapar` (Mumbai / Gujarat, Financial Gujarati)
3. `phulchhab` (Rajkot / Saurashtra, Gujarati)
4. `kutchmitra` (Bhuj / Kutch, Gujarati)
5. `janmabhoomi-pravasi` (Weekly Gujarati)
6. `kavita` (Bimonthly Literary Periodical)

### Tenancy Isolation Model: Shared Database, Scoped Tables
- Rather than maintaining separate databases (which creates high administrative and backup overhead), a **shared PostgreSQL schema with mandatory `publication_id` tenant scoping** is adopted.
- Every content query (`articles`, `epaper_editions`, `categories`, `advertisements`) is filtered by `publication_id`.
- Foreign key constraints ensure strict integrity, while composite indexes `(publication_id, status, published_at DESC)` guarantee sub-millisecond query execution.
- Cross-publication syndicated content (e.g., State/National breaking news published in both Janmabhoomi and Phulchhab) is handled cleanly via a join table `article_syndications`.

---

## 4. End-to-End Request Lifecycles

### 4.1 Public News Consumption Flow
```
User Browser ---> Cloudflare CDN (Edge Cache: 60s TTL)
                    |
              (Cache Hit: <15ms response)
                    |
              (Cache Miss)
                    v
Next.js SSR/ISR Server (Vercel)
                    v
Backend REST API Gateway (Node.js)
                    v
Redis Response Cache (JSON)
                    v (Miss)
PostgreSQL Read Replica ---> Return Entity ---> Cache in Redis ---> Stream to Client
```

### 4.2 Editorial Publishing Flow
```
Reporter/Editor (Admin CMS)
     |
     v (Submits Draft or Schedule)
Node.js Admin API ---> Validate Schema & Bilingual Integrity
     |
     v (Write to DB)
PostgreSQL (Transaction: article + translations + tags)
     |
     v (If status == 'published')
Trigger Invalidation Webhook ---> Flush Redis Keys & Trigger Next.js On-Demand ISR
```

---

## 5. Security Perimeter & Boundary Protection

1. **Network Isolation:** The PostgreSQL database and Redis instance listen only on internal private network interfaces (loopback / VPC) and reject all direct public internet connections.
2. **API Authentication:** 
   - Public APIs: Protected by Cloudflare WAF, CORS whitelisting, and IP-based rate limiting.
   - Subscriber APIs: Authenticated via short-lived JWTs (15 min) with HTTP-only, SameSite Secure refresh cookies.
   - Admin APIs: Mandatory multi-factor authentication (TOTP), role-based permissions matrix, and IP allowlisting for sensitive actions.
3. **Encrypted Secrets:** All environment secrets (database credentials, PayU salt keys, JWT private keys, S3 credentials) are injected at runtime via Docker secrets or secure environment variables, never committed to version control.

---

## 6. High Availability, Failover & Disaster Recovery

- **Database Backups:** Automated daily full dumps (`pg_dump`) with point-in-time recovery (WAL archiving) stored in an off-site secondary object storage bucket with 30-day retention.
- **Circuit Breaker Pattern:** If Redis or primary database experiences temporary latency spikes, the Next.js frontend falls back gracefully to stale ISR cache without throwing 500 errors to end users.
- **Graceful Degradation:** During breaking news spikes, non-critical features (Panchang calculation, related article cross-referencing, live view counters) yield priority to news article rendering.
