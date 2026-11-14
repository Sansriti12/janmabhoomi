# JANMABHOOMI GROUP DIGITAL NEWSPAPER
## Hostinger KVM VPS Deployment Architecture, Resource Planning & Sizing Analysis

**Document ID:** DOC-DEPL-HOSTINGER-001  
**Date:** 11 November 2026  
**Target Infrastructure:** Hostinger KVM VPS (Kernel-based Virtual Machine)  
**Operating System Target:** Ubuntu 22.04 LTS / 24.04 LTS x86_64  
**Primary Architect:** Lead Full-Stack Software Engineer (Frontend & Backend Custodian)  

---

## 1. Information Required from Client Management Before Server Provisioning

Because the exact Hostinger KVM plan has not yet been confirmed, management and the IT department must provide the following server parameters:

| # | Parameter | What We Need to Know | Why It Is Essential |
| :-: | :--- | :--- | :--- |
| **1** | **KVM Plan Name & Tier** | Exact purchased plan (e.g. Hostinger KVM 1, KVM 2, KVM 4, or KVM 8). | Determines total memory ceiling and concurrency bounds. |
| **2** | **CPU Cores (vCPUs)** | Dedicated or shared vCPUs (1, 2, 4, or 8 cores). | Dictates Node.js PM2 cluster worker count and PDF rendering throughput. |
| **3** | **RAM Capacity** | Physical memory allocated (4 GB, 8 GB, 16 GB, or 32 GB). | Guides PostgreSQL `shared_buffers` sizing and Next.js instance counts. |
| **4** | **NVMe SSD Storage** | Total disk space (50 GB, 100 GB, 200 GB, or 400 GB). | Dictates how many years of high-resolution pre-press E-Paper PDFs can be stored locally before cloud offloading. |
| **5** | **Monthly Bandwidth** | Bandwidth cap (typically 4 TB to 32 TB on Hostinger). | Prevents surprise bandwidth throttles during major breaking news events. |
| **6** | **Operating System** | Preferred Linux distribution (Ubuntu 22.04 LTS strongly recommended). | Determines system package repositories and security patch lifecycle. |
| **7** | **Root SSH Access** | Dedicated SSH key or root password with port 22/custom port. | Required for software installation, UFW firewall, and service configuration. |
| **8** | **Existing Applications** | Are other client websites, PHP scripts, or WordPress sites running on this VPS? | Prevents memory starvation and port collisions (80, 443, 3000, 4000, 5432). |
| **9** | **Existing Databases** | Is MySQL, MariaDB, or another database daemon already active on the server? | Avoids double-database RAM waste if MySQL is idling alongside PostgreSQL. |
| **10**| **Domain & DNS Access** | DNS control provider (Cloudflare, Hostinger DNS, or external registrar). | Required for SSL certificate generation (Let's Encrypt) and subdomains (`api.`, `admin.`). |

---

## 2. Resource Allocation Models by RAM Tier

Hostinger provides standard KVM VPS plans. Below is the technical feasibility evaluation for running the complete newspaper stack together:

```
+------------------------------------------------------------------------+
|                          HOSTINGER KVM VPS                             |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |             Nginx Reverse Proxy & SSL Termination (Port 80/443)  |  |
|  +-----------------+-------------------------------+----------------+  |
|                    |                               |                   |
|                    v                               v                   |
|  +-------------------------------+   +-------------------------------+ |
|  | Next.js Frontend (Port 3000)  |   | Fastify Backend (Port 4000)   | |
|  | - React 19 Broadsheet UI      |   | - REST API & Zod Validation   | |
|  | - Server-Side Rendering (SSR) |   | - Staff Auth & RBAC           | |
|  | - Bilingual Routes (/en, /gu) |   | - PayU Payments & Webhooks    | |
|  +-------------------------------+   +---------------+---------------+ |
|                                                      |                 |
|                                                      v                 |
|  +------------------------------------------------------------------+  |
|  | PostgreSQL 16 LTS (Port 5432 - Loopback only, not public)        |  |
|  | - 8 Publications / 11 Relational Models / JSONB Bilingual Store   |  |
|  | - Connection Pool capped at 25                                   |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +-------------------------------+   +-------------------------------+ |
|  | Local NVMe File Storage       |   | Linux Cron Scheduled Jobs     | |
|  | - /var/www/uploads/epaper/    |   | - Nightly pg_dump (02:30 IST) | |
|  | - Page Images & Thumbnails    |   | - Session Cleanup             | |
|  +-------------------------------+   +-------------------------------+ |
+------------------------------------------------------------------------+
```

---

### Scenario A: 4 GB RAM Plan (Hostinger KVM 1 / KVM 2 Baseline)
- **Feasibility:** **Feasible for Initial Single-Publication Launch (Janmabhoomi + Panchang). Constrained for 21 sites.**
- **Memory Allocation Budget:**
  - PostgreSQL 16: **512 MB** (`shared_buffers = 128MB`, `work_mem = 4MB`)
  - Fastify Backend (Single Node.js process): **256 MB**
  - Next.js SSR Frontend (Single process, `max-old-space-size=768`): **768 MB**
  - Nginx (Static caching, gzip, SSL termination): **64 MB**
  - OS Kernel, Systemd, UFW, SSH, and buffer cache: **1,200 MB**
  - Remaining safety headroom: **~1,200 MB**
- **Bottlenecks:**
  - High-resolution PDF rasterization (converting 16-page broadsheet PDF into 300 DPI web images) causes temporary memory spikes of 500MB+. On a 4 GB VPS, this could trigger the Linux OOM (Out Of Memory) killer if concurrent readers spike.
  - **Verdict:** Acceptable for staging, development, or initial single-site launch. Unsuitable for 21 concurrent websites.

---

### Scenario B: 8 GB RAM Plan (Hostinger KVM 2 / KVM 4 — Recommended Sweet Spot)
- **Feasibility:** **Highly Recommended for Phase 3 Production Launch.**
- **Memory Allocation Budget:**
  - PostgreSQL 16: **1.5 GB** (`shared_buffers = 512MB`, `work_mem = 16MB`, `effective_cache_size = 4GB`)
  - Fastify Backend (PM2 cluster with 2 workers): **512 MB** (256 MB × 2)
  - Next.js SSR Frontend (PM2 cluster with 2 workers): **1.5 GB** (768 MB × 2)
  - PDF Ingestion & Sharp/Poppler worker: **768 MB** (active during pre-press upload)
  - Nginx & Static file caching: **128 MB**
  - Linux OS & NVMe page cache: **2.0 GB**
  - Remaining safety buffer: **~1.6 GB**
- **Bottlenecks:**
  - Zero memory contention during daily operations.
  - NVMe storage capacity (typically 100 GB) can store ~1,000 complete 16-page editions (~70MB per issue of images/PDFs) locally before requiring offload to Cloudflare R2 / S3.
  - **Verdict:** **Optimal balance of price, performance, and stability for a solo developer.**

---

### Scenario C: 16 GB RAM Plan (Hostinger KVM 4 / KVM 8 — Future-Proof Scale)
- **Feasibility:** **Ideal for Multi-Publication Hub (All 8 Saurashtra Trust Publications + Sister Portals).**
- **Memory Allocation Budget:**
  - PostgreSQL 16: **4.0 GB** (`shared_buffers = 2GB`, extensive in-memory query caching)
  - Fastify Backend (PM2 cluster, 4 workers): **1.0 GB**
  - Next.js Multi-Tenant Frontends: **4.0 GB**
  - Background Workers (E-Paper OCR, PDF splitting, thumbnailing): **1.5 GB**
  - Nginx (Large fast-memory static buffers): **256 MB**
  - OS & Disk Buffers: **3.5 GB**
  - Free Headroom: **~1.75 GB**
- **Verdict:** Recommended when onboarding Phulchhab, Kutchmitra, Vyapar, and high-traffic regional editions simultaneously.

---

## 3. Recommended Architectural Stack (Evaluations & Decisions)

### 3.1 Fastify vs. Express
- **Decision:** **Fastify 5.2.1 (Confirmed)**
- **Reasons:**
  - **3× to 4× Throughput:** Fastify handles over 30,000 req/sec with minimal overhead vs ~8,000 req/sec in Express.
  - **Built-in Schema Compilation:** Fastify compiles JSON schemas via fast-json-stringify, delivering 2× faster serialization than `JSON.stringify()`.
  - **Native TypeScript & Async/Await:** Modern, cleaner architecture with native promise handling and zero callback hell.
  - **First-Class Plugins:** Clean encapsulation of DB, auth, and route plugins.

### 3.2 Prisma vs. TypeORM / Drizzle / Raw SQL
- **Decision:** **Prisma 6.4.1 (Confirmed)**
- **Reasons:**
  - Full schema already authored and verified.
  - End-to-end type safety eliminates runtime data mapping bugs.
  - Predictable, version-controlled migrations prevent production schema drift.

### 3.3 Docker vs. Direct Installation on Hostinger VPS
- **Decision:** **Direct Installation on Ubuntu (No Docker overhead on single VPS)**
- **Reasons:**
  - **Resource Conservation:** Docker engine, containerd, and overlayfs storage drivers consume 400MB–800MB RAM and add virtualization I/O layers. On a 4GB or 8GB VPS managed by a single developer, running native systemd services provides lower latency, direct NVMe disk speed, and easier log inspection via standard Ubuntu tools (`journalctl`, `systemctl`).
  - **Operational Simplicity:** No Docker network routing, bridge network latency, or container volume permission issues with PostgreSQL.

### 3.4 Nginx Reverse Proxy & SSL Termination
- **Decision:** **Nginx 1.24+ (Standard Ubuntu PPA)**
- **Roles:**
  - Listens on public ports 80 (HTTP -> redirect to HTTPS) and 443 (HTTPS with TLS 1.3).
  - Reverse proxies `https://janmabhoomi.in/` to Next.js on `http://127.0.0.1:3000`.
  - Reverse proxies `https://api.janmabhoomi.in/` (or `/api/`) to Fastify on `http://127.0.0.1:4000`.
  - Serves static media assets directly from `/var/www/uploads/` with `Cache-Control: public, max-age=31536000, immutable`, completely bypassing Node.js for high-speed image delivery.
  - Free automated SSL renewal via Let's Encrypt Certbot (`certbot --nginx`).

### 3.5 Process Management: PM2 vs. Systemd
- **Decision:** **PM2 for Node.js Applications + Systemd for System Daemons**
- **Roles:**
  - **Systemd:** Manages PostgreSQL (`postgresql.service`) and Nginx (`nginx.service`).
  - **PM2:** Manages Next.js and Fastify (`ecosystem.config.cjs`). Provides automatic crash recovery, zero-downtime reloads (`pm2 reload all`), memory threshold restarts (`max_memory_restart: '800M'`), and centralized stdout/stderr logs.

### 3.6 Background Job Processing
- **Decision:** **Lightweight In-Process Event Queue / Node Cron (No Redis / No BullMQ)**
- **Reasons:**
  - Redis adds an additional daemon consuming 100MB–300MB RAM.
  - For newspaper operations, background tasks consist primarily of:
    1. Pre-press PDF page extraction (triggered upon editor upload).
    2. Nightly database backup (handled via Linux cron).
    3. Session cleanup (handled via Fastify scheduled interval or daily cron).
  - Adding Redis and BullMQ at this stage introduces unnecessary operational complexity for a single developer without functional necessity.

### 3.7 Local NVMe File Storage vs. External Object Storage
- **Decision:** **Hybrid Strategy: Local NVMe Storage for Phase 3 -> Cloudflare R2 for Long-Term Scale**
- **Phase 3 Launch:** Store pre-press PDFs and rendered web images in `/var/www/uploads/` on the Hostinger NVMe disk. It is fast, free with the VPS, requires zero external accounts, and is served directly by Nginx.
- **Migration Plan:** The code utilizes an `IStorageProvider` abstraction. When local disk capacity reaches 70%, asset storage can be mirrored to Cloudflare R2 (S3-compatible, zero egress fees) with zero code rewrites.

---

## 4. Production Hostinger KVM Port & Firewall Configuration

| Port | Protocol | Binding | Purpose | Firewall Policy (UFW) |
| :-: | :-: | :-: | :--- | :--- |
| **22** | TCP | `0.0.0.0` | Secure Shell (SSH) Access | **ALLOW** (Rate limited via UFW) |
| **80** | TCP | `0.0.0.0` | HTTP (Redirects to HTTPS) | **ALLOW** |
| **443**| TCP | `0.0.0.0` | HTTPS (Nginx SSL Termination) | **ALLOW** |
| **3000**| TCP| `127.0.0.1` | Next.js Frontend (Internal) | **BLOCK PUBLIC** (Loopback only) |
| **4000**| TCP| `127.0.0.1` | Fastify Backend (Internal) | **BLOCK PUBLIC** (Loopback only) |
| **5432**| TCP| `127.0.0.1` | PostgreSQL 16 (Internal) | **STRICTLY BLOCK PUBLIC** (Loopback only) |

All internal application and database ports (`3000`, `4000`, `5432`) are bound strictly to `127.0.0.1`. They are completely inaccessible from the public Internet, eliminating external attack vectors.
