# Janmabhoomi Digital Newspaper – Phase 3A: Backend Architecture Design (Revised)

**Document Version:** 2.0.0  
**Phase:** 3A (Backend Foundation & Modular Core)  
**Target Organization:** Saurashtra Trust  
**System Type:** Modular Monolith Headless Publishing & Subscription Platform  
**Framework:** Fastify 5.x with Native TypeScript & Zod Schema Validation

---

## 1. Architectural Philosophy: The Modular Monolith

The backend is architected as an efficient, modular monolith built on Node.js 20+ LTS and Fastify, designed specifically for long-term maintainability by Saurashtra Trust's technical team without the cost and operational overhead of microservices.

### 1.1 Core Architecture Principles

1. **Framework Choice: Fastify with TypeScript & Zod**
   - **Performance:** Low memory footprint (~30MB base RSS), 2–3x throughput compared to classical frameworks, ideal for affordable VPS hardware (Hostinger KVM 4/8).
   - **Unified Validation:** Zod schemas are used directly with Fastify route definitions, avoiding duplicate or out-of-sync validation schemas.
   - **Native Plugins:** Encapsulates business domains (Publications, Articles, E-Paper, Auth) into isolated modules via `fastify.register()`.

2. **Full Multi-Product Tenancy: All 8 Publications / Products**
   The architecture natively supports the full Saurashtra Trust portfolio of 8 products across diverse publication types and publishing schedules:
   - Daily Broadsheet Newspapers (*Janmabhoomi, Kutchmitra, Phulchhab*)
   - Bi-Weekly Financial Newspaper (*Vyapar Gujarati*)
   - Weekly Financial Newspaper (*Vyapar Hindi*)
   - Sunday Weekly Broadsheet (*Janmabhoomi Pravasi*)
   - Annual Astronomical Almanac & Calendar (*Panchang*)
   - Quarterly Literary & Poetry Magazine (*Kavita*)

3. **Persistent Session Strategy (No In-Memory Sessions)**
   - Authentication does **not** rely on volatile in-memory session arrays.
   - Sessions are persisted in the PostgreSQL database (`staff_sessions` table) storing hashed session tokens, user IDs, device user-agents, IP addresses, and explicit expiry timestamps.
   - Revocation on logout or administrative termination is immediate and persistent across server restarts.

4. **Staff Authentication First**
   - Phase 3A/3B prioritizes internal newsroom staff authentication (Editor, Reporter, Admin) with Argon2id password hashing and role-based permissions.
   - Public subscriber registration and OTP flows remain decoupled and will be introduced in Phase 3D alongside payment integration.

5. **Storage Abstraction Layer (`IStorageProvider`) & Transition Requirements**
   - All file handling (PDFs, images, page thumbnails) interacts strictly through an `IStorageProvider` interface.
   - Phase 3A provides `LocalStorageProvider` writing to secure local directories (`backend/uploads/`).
   - A transition to cloud object storage (e.g., AWS S3, Cloudflare R2, or a dedicated private storage server) will be evaluated during the infrastructure review phase.
   - **Transition Requirements (Not a trivial one-line switch):** Moving to cloud storage requires formal provider selection, credential and access policy configuration, establishing CORS and pre-signed URL expiry policies, performing batch asset migration of existing files, and comprehensive regression testing of PDF streaming and watermarking before cutover.

6. **Hosting & Production Infrastructure Neutrality**
   - The platform architecture does **not** assume Hostinger KVM VPS or any specific hosting vendor, PostgreSQL minor version, or cloud service has been finalized.
   - The Node.js Fastify backend and PostgreSQL database are packaged as standard, vendor-neutral workloads that can run on any Linux environment, private server, or managed cloud instance once management confirms the hosting strategy.

7. **Flexible Subscription Models (Single, Bundled, and Future Group-Wide)**
   - The database schema is designed with flexibility to support individual publication subscriptions (e.g. *Janmabhoomi* only, *Vyapar* only), multi-title bundles (e.g. *Janmabhoomi* + *Pravasi*), and future Group-wide access passes.
   - However, **no Group-wide subscription model will be activated or implemented** until the Board of Trustees explicitly approves the commercial terms.

8. **File Upload Security & Validation**
   - Multi-tier validation: File extension check, MIME type verification (magic bytes inspection), strict size ceilings (e.g., max 10MB for article images, max 300MB for pre-press PDFs), and path traversal prevention.
   - Protected PDFs are stored outside the public HTTP root; access requires authorized token verification.

7. **Non-Blocking Background Processing for Large PDFs**
   - Ingestion of 150MB–300MB pre-press PDFs involves CPU-intensive rasterization.
   - PDF processing must **never** block the Fastify event loop.
   - In Phase 3A/3C development, PDF slicing is executed in an isolated Node.js worker thread / child process. In production, this can seamlessly transition to a dedicated background worker.

8. **PayU Sandbox Isolation**
   - PayU payment integration runs strictly in sandbox mode with test merchant keys.
   - Zero real money transactions, zero card details stored.

---

## 2. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  +-------------------------------------+  +------------------------------------+  |
|  | Next.js 15 Public Web (EN/GU)       |  | Future Staff Newsroom Admin CMS    |  |
|  | - App Router (SSR / ISR)            |  | - Role-based Editorial Desks       |  |
|  | - Consumes INewsDataProvider        |  | - Gujarati Transliteration Editor  |  |
|  +-------------------------------------+  +------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                                    HTTPS / REST JSON
                                          v
+-----------------------------------------------------------------------------------+
|                        FASTIFY MODULAR MONOLITH (NODE.JS)                         |
|                                                                                   |
|  [ Fastify Core, CORS, Helmet, Rate Limiter, Centralized Error Handler ]          |
|                                                                                   |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|  | Staff Auth Module     | | RBAC Guard Module     | | Publications Registry   |  |
|  | - Argon2id Hashing    | | - 8 Granular Roles    | | - 8 Products & Frequenc.|  |
|  | - Persistent DB Sess. | | - Publication Scopes  | | - Independent Taxonomy  |  |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|  | Article & News Module | | Editorial Approval    | | E-Paper Ingestion       |  |
|  | - Bilingual Content   | | - Draft -> Published  | | - Multi-format Upload   |  |
|  | - Trigram Search      | | - Audit Trail Log     | | - Non-blocking Slicing  |  |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|  | Subscriptions Module  | | PayU Gateway (Sandbox)| | Storage Service         |  |
|  | - Configurable Plans  | | - Server SHA-512      | | - IStorageProvider      |  |
|  | - Dynamic Access Rules| | - Idempotent Webhook  | | - Local Storage Adapter |  |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
+-----------------------------------------------------------------------------------+
                         |                                |
                         v                                v
+--------------------------------------+   +----------------------------------------+
|       PERSISTENCE (POSTGRESQL 16)    |   |          LOCAL STORAGE (DEV / TEST)    |
|  - Relational Schema (Prisma ORM)    |   |  - backend/uploads/epaper/             |
|  - Persistent Staff Sessions         |   |  - backend/uploads/articles/           |
|  - Strict Foreign Keys & Indexes     |   |  - backend/uploads/ads/                |
|  - Configurable Pricing & Policies   |   |  - Segregated & Access-Controlled      |
+--------------------------------------+   +----------------------------------------+
```

---

## 3. Storage Abstraction Contract (`IStorageProvider`)

To ensure that switching to cloud storage in production requires zero business code refactoring:

```typescript
export interface StorageUploadResult {
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl?: string; // Present only for public assets
}

export interface IStorageProvider {
  uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    destinationFolder: "epaper" | "articles" | "ads" | "general",
    isPublic: boolean
  ): Promise<StorageUploadResult>;

  getFileStream(fileKey: string): Promise<NodeJS.ReadableStream>;
  deleteFile(fileKey: string): Promise<boolean>;
  getSignedDownloadUrl(fileKey: string, expiresInSeconds: number): Promise<string>;
}
```

---

## 4. Non-Blocking Large PDF Processing Architecture

Pre-press broadsheet PDFs (150MB–300MB) require significant CPU and memory for rasterization.
- **Problem:** Running rasterization synchronously inside the main HTTP server process blocks the Fastify event loop, causing timeouts for readers fetching news feeds.
- **Phase 3A/3C Solution:**
  1. The API endpoint receives the PDF upload, validates file type and size, writes the master file to `backend/uploads/epaper/`, and returns `202 Accepted` with `status: "processing"`.
  2. The slicing job is dispatched to a **Node.js Worker Thread** (`worker_threads`) or decoupled child process.
  3. The worker processes the pages, extracts thumbnails, writes the resulting WebP files to disk, and updates the database record to `status: "ready"`.
  4. The main Fastify event loop remains 100% responsive throughout the process.
