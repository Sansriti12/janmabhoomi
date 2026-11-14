# JANMABHOOMI GROUP DIGITAL NEWSPAPER
## Security Audit, Threat Modeling & Production Readiness Review

**Document ID:** DOC-SEC-PROD-001  
**Date:** 11 November 2026  
**Auditor / Security Architect:** Lead Full-Stack Software Engineer  
**Classification:** Confidential & Internal  
**Target Environment:** Hostinger KVM VPS (Production)  

---

## 1. Security Architecture Review & Controls Matrix

This security evaluation reviews the backend infrastructure, API endpoints, authentication flows, and data storage against OWASP Top 10 and newspaper publishing threat models.

| Security Control | Existing Status in Codebase | Required Production Implementation | Risk Level if Unresolved |
| :--- | :--- | :--- | :---: |
| **Password Hashing** | ⚠️ Schema defines `password_hash VARCHAR(255)`, but hashing library not installed. | Implement **Argon2id** (`@node-rs/argon2`) with memory cost = 64 MB, time cost = 3 iterations, parallelism = 1. Zero MD5, SHA1, or plain bcrypt. | **CRITICAL** |
| **Session Management** | ⚠️ `staff_sessions` table exists; session issuance not implemented. | Cryptographically secure random tokens (64-byte `crypto.randomBytes(64).toString('hex')`). Only the SHA-256 hash of the token is stored in the database. Delivered via `httpOnly`, `secure`, `sameSite: 'lax'` cookies. | **CRITICAL** |
| **Authentication & Brute Force** | ⚠️ No rate limiter installed. | Install `@fastify/rate-limit`. Cap login attempts to **5 failures per 15 minutes per IP**. Temporary account lockouts after 5 consecutive failed attempts. | **HIGH** |
| **Role-Based Access Control (RBAC)**| ⚠️ Roles & permissions modeled in schema; middleware missing. | Fastify pre-handler hook enforcing granular permissions (e.g. `articles:publish`, `epaper:upload`). Requests lacking required permission return HTTP 403 Forbidden. | **CRITICAL** |
| **API Request Validation** | ✅ Zod v3.24.2 installed; used in `env.ts`. | Enforce strict Zod schema validation on every Fastify route payload and query param. Strip unexpected input fields (`strip()`). | **HIGH** |
| **SQL Injection Prevention** | ✅ 100% Parameterized queries via Prisma. | Never interpolate untrusted user strings into `$queryRawUnsafe`. All dynamic queries must use Prisma tagged templates: `prisma.$queryRaw\`SELECT ... WHERE id = ${id}\``. | **LOW (Managed)** |
| **CORS (Cross-Origin Resource Sharing)**| ✅ `@fastify/cors` active in `app.ts`. | Whitelist only approved production domains (`https://janmabhoomi.in`, `https://epaper.janmabhoomi.in`). Never set `origin: "*"` when `credentials: true`. | **MEDIUM** |
| **File Upload Validation** | ⚠️ Not yet installed. | Enforce 3-tier validation: 1) File extension check, 2) MIME-type inspection, 3) Magic byte inspection (`file-type` binary header verification). Cap PDFs at 60 MB and images at 10 MB. Generate UUID filenames to prevent path traversal (`../../etc/passwd`). | **CRITICAL** |
| **Payment Verification & Webhooks** | ⚠️ Models exist; PayU handler pending. | Validate PayU SHA-512 response hashes on every return. Idempotency guard: Verify `PaymentTransaction.status === 'INITIATED'` before updating to `SUCCESS`. Reject duplicate webhook deliveries. | **CRITICAL** |
| **Secret Management** | ✅ `.env` excluded in `.gitignore`. | All production secrets (`DATABASE_URL`, `PAYU_MERCHANT_KEY`, `PAYU_MERCHANT_SALT`, `COOKIE_SECRET`, `SESSION_SECRET`) loaded exclusively via environment variables. Zero hardcoded secrets in repository. | **CRITICAL** |
| **Database Permissions** | ⚠️ Root `postgres` user currently in local tests. | Create dedicated unprivileged PostgreSQL user: `jb_app_user`. Grant `SELECT, INSERT, UPDATE, DELETE` only on `janmabhoomi_prod` schema. Revoke `SUPERUSER` and `CREATEDB` privileges. | **HIGH** |
| **HTTPS & Transport Security** | ⚠️ Dev currently runs HTTP. | Terminate TLS 1.3 via Nginx using Let's Encrypt Certbot. Enforce HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`). Redirect all port 80 traffic to HTTPS. | **CRITICAL** |
| **Server Firewall (UFW)** | ⚠️ Not configured yet on Hostinger. | Configure Ubuntu UFW: Open ports `22` (SSH), `80` (HTTP), `443` (HTTPS). Block all external access to `5432` (PostgreSQL), `3000` (Next.js), and `4000` (Fastify). | **CRITICAL** |
| **Error Handling & Leaks** | ✅ Centralized error handler in `app.ts`. | In production (`NODE_ENV === "production"`), return generic `"Internal Server Error"` messages with HTTP 500 status. Never expose database errors, SQL queries, or stack traces to clients. | **MEDIUM** |
| **Audit Logging** | ⚠️ `audit_logs` model exists; logger pending. | Automatically capture all editorial updates, article publishing, subscription alterations, and user deletions in `audit_logs` with `userId`, `ipAddress`, and JSON diffs of changes. | **MEDIUM** |

---

## 2. Launch Blocker Checklist (Must be Resolved Before Production Launch)

The following items are **non-negotiable security requirements** prior to pointing live DNS to the Hostinger KVM VPS:

- [ ] **BLOCKER 1: Zero Default Passwords & Interactive Admin Setup**  
  Seed scripts must NEVER seed a default password like `Admin@123`. A dedicated CLI initialization script (`scripts/setup-admin.ts`) must be executed via SSH on the server to prompt the lead engineer to enter a high-entropy password for the root super-administrator.
- [ ] **BLOCKER 2: Argon2id Password Hashing**  
  Install `@node-rs/argon2` and ensure all user authentication passes through it.
- [ ] **BLOCKER 3: PayU Webhook Cryptographic Verification**  
  Implement strict reverse SHA-512 hash calculation before triggering subscriber entitlement grants.
- [ ] **BLOCKER 4: Strict UFW Firewall & Loopback Binding**  
  Verify with `nmap` that port 5432 and port 4000 are not reachable from external IP addresses.
- [ ] **BLOCKER 5: Let's Encrypt SSL Certificates with Auto-Renewal**  
  Verify SSL certificates on all public domain names with an A+ rating on SSL Labs.
- [ ] **BLOCKER 6: Public Upload Magic Byte Sanitization**  
  Uploaded files must be stripped of EXIF data, renamed with random UUIDs, and served with `Content-Disposition: inline` and strict MIME headers.

---

## 3. Incident Response & Emergency Procedures

1. **Compromised Staff Account:**
   - Super-admin can execute: `DELETE FROM staff_sessions WHERE user_id = 'compromised-uuid';`
   - Immediately invalidates all active cookies and forces logout across all devices.
   - Admin sets `status = 'SUSPENDED'` on the `users` table.
2. **Payment Webhook Failure / Replay Attack:**
   - Webhooks are stored as raw JSON in `payment_transactions.raw_webhook_payload`.
   - If a duplicate webhook is received for an already processed `transaction_reference`, the server returns HTTP 200 without re-extending the subscription duration.
3. **Database Restoration Drill:**
   - Regular verification that the nightly `pg_dump` backup file can be restored into an isolated sandbox database in under 5 minutes.
