# Janmabhoomi Digital Newspaper – Phase 3A: Authentication & Security Architecture (Revised)

**Document Version:** 2.0.0  
**Phase:** 3A (Backend Foundation)  
**Security Standard:** OWASP Top 10 (2021+), PCI-DSS SAQ A (Hosted Checkout), IT Act 2000

---

## 1. Authentication Strategy: Staff Authentication First

In strict accordance with Phase 3A requirements:
- **Scope:** Phase 3A/3B focuses solely on **internal newsroom staff authentication** (Super Administrator, Administrator, Chief Editor, Editor, Journalist/Reporter, E-Paper Manager, Ad Manager).
- **Public Readers:** Public subscriber registration, OTP login, and subscriber account portals are kept separate and deferred to Phase 3D alongside payment checkout.

---

## 2. Persistent Session Management (No In-Memory Storage)

Authentication does **not** rely on in-memory arrays or volatile process memory.
1. When a staff user logs in successfully via `POST /api/v1/auth/staff/login`:
   - A cryptographically random 256-bit session token is generated (`crypto.randomBytes(32)`).
   - The SHA-256 hash of the token is persisted to the PostgreSQL `staff_sessions` table with `userId`, `ipAddress`, `userAgent`, and `expiresAt` (default 24 hours).
   - The raw token is returned to the client and stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (`janmabhoomi_staff_session`).
2. On every protected administrative request:
   - The session token from the cookie is hashed and queried against `staff_sessions`.
   - If the session does not exist, has expired, or the user is marked `SUSPENDED`, the request is immediately rejected (`401 Unauthorized`).
3. On Logout (`POST /api/v1/auth/staff/logout`):
   - The session record is immediately deleted from PostgreSQL, guaranteeing instant revocation across any server restarts.

---

## 3. Secure Initial Administrator Setup (No Hardcoded Credentials in Seed)

To protect production security and eliminate default credential vulnerabilities:
- **Zero Hardcoded Admin Passwords:** Seed scripts (`prisma/seed.ts`) will **never** insert an administrator account with default passwords (e.g. `admin / admin123` is strictly prohibited).
- **Initial Setup Command:** A dedicated secure bootstrapping script is provided:
  ```bash
  npm run setup:admin
  ```
- **How It Works:**
  1. The script verifies whether any `super_admin` account exists in the database.
  2. If an admin already exists, the script halts immediately with an error.
  3. If no admin exists, the script prompts for the administrator's email, full name, and a strong password (enforcing minimum 12 characters, uppercase, lowercase, numbers, and symbols).
  4. The password is hashed using **Argon2id** and stored in the `users` table, linked to the `super_admin` role in `user_roles`.
  5. The creation event is recorded in `audit_logs` with the action `INITIAL_SUPER_ADMIN_CREATED`.

---

## 4. Password Security Specification (Argon2id)

Staff passwords use Argon2id with memory-hard parameters:
- **Algorithm:** `Argon2id`
- **Time Cost:** `3` iterations
- **Memory Cost:** `65,536 KB` (64 MB)
- **Parallelism:** `4` threads
- **Salt:** 16 cryptographically random bytes via CSPRNG

---

## 5. File Upload Security & Validation Architecture

To protect the server from malicious file uploads, denial of service, and directory traversal:

| Check Layer | Rule & Enforcement Mechanism |
| :--- | :--- |
| **1. File Type & Magic Bytes** | Do not trust `Content-Type` header from browser. Validate file signature magic bytes (e.g., `%PDF-` for PDFs, `RIFF...WEBP` for WebP, `\xFF\xD8\xFF` for JPEG). |
| **2. Size Ceilings** | Strict upload size limits: <br>• Article Images: **10 MB max**<br>• Advertisements: **5 MB max**<br>• Pre-Press Master Broadsheet PDFs: **300 MB max** |
| **3. Path Traversal Defense** | Sanitize all filenames with random UUIDs. Never use client-supplied filenames on disk (`uuidv4() + safe_extension`). |
| **4. Storage Segregation** | Pre-press PDFs and high-resolution clippings are stored in `backend/uploads/epaper/` outside the web root. They cannot be executed as scripts. |
| **5. Access Control** | Protected broadsheet PDF downloads require an active subscriber session or staff token. |

---

## 6. PayU Payment Sandbox Isolation

- The payment integration module is strictly isolated to **PayU Sandbox test mode** during Phase 3A.
- All request hashes (`sha512(key|txnid|amount|productinfo|firstname|email|||||||||||salt)`) and reverse webhook response hashes are computed on the backend using test sandbox keys stored in `backend/.env`.
- Live credentials, real credit card numbers, or real bank payments are strictly disabled.
