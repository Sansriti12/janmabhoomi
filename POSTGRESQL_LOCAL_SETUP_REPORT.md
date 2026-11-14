# Janmabhoomi — Local Docker PostgreSQL Setup & Migration Diagnostic Report

**Date:** November 11, 2026  
**Auditor / Lead Engineer:** Antigravity AI  
**Container:** `janmabhoomi-postgres` (PostgreSQL 16.15 Alpine)  
**Database:** `janmabhoomi_dev`  
**Host & Port:** `127.0.0.1:5432`  
**Volume:** `janmabhoomi_pgdata`  

---

## Executive Summary & Status

| Step | Task | Status | Details |
|---|---|---|---|
| 1 | **Inspect `backend/.env` Configuration** | **DONE** | Existing config inspected; other environment variables preserved. |
| 2 | **Update local development `DATABASE_URL`** | **DONE** | Pointed to `127.0.0.1:5432/janmabhoomi_dev` using Docker container credentials. |
| 3 | **Prisma Connection Verification (`SELECT 1`)** | **PASSED** | Returned `[ { connected: 1 } ]`. |
| 4 | **PostgreSQL Version & DB Name** | **VERIFIED** | PostgreSQL 16.15 (Alpine Linux 64-bit), DB: `janmabhoomi_dev`. |
| 5 | **Migration 1: `init_phase_3a_foundation`** | **APPLIED** | Successfully created 24 core foundation tables and indexes. |
| 6 | **Migration 2: `phase_1_razorpay_and_enquiries`** | **STOPPED / FAILED** | Failed with PostgreSQL error `55P04` (`unsafe use of new value "CAPTURED" of enum type "PaymentStatus"`). |
| 7 | **Migration 3: `phase_3_epaper_pipeline`** | **PENDING** | Blocked pending resolution of Migration 2. |
| 8 | **Seed Status** | **STOPPED** | Seed was not executed per instruction: stop when a migration fails. |
| 9 | **Database Reset / Table Dropping** | **AVOIDED** | No database reset, `db push`, or destructive table drops were executed. |

---

## 1. Environment & Physical Connectivity

- **Physical Host Binding:** `127.0.0.1:5432` on Docker container `janmabhoomi-postgres`.
- **Credential Handling:** The password was read securely and applied to `backend/.env` without exposing plaintext credentials in logs or git. All other variables (`JWT_SECRET`, `PORT`, `CORS_ORIGIN`, `COOKIE_SECRET`, etc.) remain intact.
- **Physical Handshake:**
  - `prisma.$connect()` established successfully.
  - Query: `SELECT 1 as connected;` -> Result: `1`
  - Query: `SELECT version();` -> Result: `PostgreSQL 16.15 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit`
  - Query: `SELECT current_database();` -> Result: `janmabhoomi_dev`

---

## 2. Migration Execution & Exact Error Analysis

Command executed: `npx prisma migrate deploy` (`node node_modules/prisma/build/index.js migrate deploy`)

### Result:
- **Migration 1 (`20261105000000_init_phase_3a_foundation`):**  
  **SUCCESS** — Applied at `2026-11-11T10:26:33.678Z`.

- **Migration 2 (`20261111000000_phase_1_razorpay_and_enquiries`):**  
  **FAILED WITH DATABASE ERROR 55P04**

### Exact Error Output:
```
Error: P3018

A migration failed to apply. New migrations cannot be applied before the error is recovered from.
Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 20261111000000_phase_1_razorpay_and_enquiries

Database error code: 55P04

Database error:
ERROR: unsafe use of new value "CAPTURED" of enum type "PaymentStatus"
HINT: New enum values must be committed before they can be used.

Position:
107     "razorpay_order_id" VARCHAR(100) NOT NULL,
108     "razorpay_payment_id" VARCHAR(100) NOT NULL,
109     "razorpay_signature" VARCHAR(255),
110     "amount_paise" INTEGER NOT NULL,
111     "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
112     "status" "PaymentStatus" NOT NULL DEFAULT 'CAPTURED',

DbError { 
  severity: "ERROR", 
  parsed_severity: Some(Error), 
  code: SqlState(E55P04), 
  message: "unsafe use of new value \"CAPTURED\" of enum type \"PaymentStatus\"", 
  detail: None, 
  hint: Some("New enum values must be committed before they can be used."), 
  position: Some(Original(5050)), 
  file: Some("enum.c"), 
  line: Some(97), 
  routine: Some("check_safe_enum_use") 
}
```

### Root Cause:
In PostgreSQL 12 and later, `ALTER TYPE ... ADD VALUE` can be executed inside a transaction block, but PostgreSQL's catalog forbids using the newly added enum value (`'CAPTURED'`) as a default value or inserting it **within the exact same transaction block**.
Because Prisma executes every individual migration file inside a single transaction (`BEGIN ... COMMIT`), the statement:
```sql
-- Line 16 of migration.sql:
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'CAPTURED';
...
-- Line 112 of migration.sql:
"status" "PaymentStatus" NOT NULL DEFAULT 'CAPTURED',
```
fails with PostgreSQL error `55P04`.

---

## 3. Database State & Existing Tables

Because Migration 1 succeeded and Migration 2 failed within its transaction (atomically rolled back by PostgreSQL), the database contains all baseline tables from Migration 1, while `_prisma_migrations` tracks the failure:

### Table `_prisma_migrations`:
| id | migration_name | finished_at | rolled_back_at | applied_steps_count |
|---|---|---|---|---|
| `6beec59a-...` | `20261105000000_init_phase_3a_foundation` | `2026-11-11T10:26:33.678Z` | `null` | 1 |
| `d4e77213-...` | `20261111000000_phase_1_razorpay_and_enquiries` | `null` | `null` | 0 |

### Existing Public Tables Present in `janmabhoomi_dev`:
1. `_prisma_migrations`
2. `advertisements`
3. `article_tags`
4. `article_translations`
5. `articles`
6. `audit_logs`
7. `authors`
8. `categories`
9. `editorials`
10. `epaper_editions`
11. `epaper_hotspots`
12. `epaper_pages`
13. `panchang_daily`
14. `payment_transactions`
15. `permissions`
16. `publication_categories`
17. `publications`
18. `role_permissions`
19. `roles`
20. `staff_sessions`
21. `subscription_plans`
22. `tags`
23. `user_roles`
24. `user_subscriptions`
25. `users`

---

## 4. Work Completed vs. Stopped (Strict Compliance)

Per prompt instruction:
> *"If a migration fails, STOP and report the exact error. Do not manually delete tables or modify migration history to force success."*

1. **Stopped Action:** Did not force migration, did not manually delete tables, did not run `prisma migrate reset`, did not run `db push`.
2. **Stopped Action:** Did not execute `prisma db seed` or tests that require tables from Migration 2 (`subscribers`, `razorpay_orders`, `archive_enquiries`, `contact_enquiries`).

---

## 5. Recommended Solution to Proceed

To resolve PostgreSQL error `55P04` cleanly without any data loss or destructive changes:

1. **Split the Enum Value Addition**:
   Separate `ALTER TYPE "PaymentStatus" ADD VALUE ...` into its own dedicated migration step (e.g. `20261111000000_add_payment_status_enums/migration.sql`), so PostgreSQL commits the new enum values first.
2. **Mark Failed Migration as Rolled Back**:
   Run `npx prisma migrate resolve --rolled-back "20261111000000_phase_1_razorpay_and_enquiries"` so Prisma knows Migration 2 was safely rolled back by PostgreSQL.
3. **Re-run `npx prisma migrate deploy`**:
   The split migrations and Phase 3 migration will deploy cleanly.
4. **Run Seed & Integration Tests**:
   Execute `npm run seed` followed by `npm run test:livedb` and Phase 3 e-paper tests against the live database.

Awaiting your direction on approving the migration split.
