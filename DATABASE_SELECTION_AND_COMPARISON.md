# JANMABHOOMI GROUP DIGITAL NEWSPAPER
## Database Selection, Comparison & Architectural Strategy for Hostinger KVM VPS

**Document ID:** DOC-DB-STRATEGY-001  
**Date:** 11 November 2026  
**Auditor / Architect:** Lead Full-Stack Software Engineer  
**Target Infrastructure:** Hostinger KVM VPS (Ubuntu 22.04 / 24.04 LTS)  
**ORM:** Prisma 6.4.1  

---

## 1. Executive Summary & Final Recommendation

### Final Recommendation: **PostgreSQL 16 LTS**
After conducting an exhaustive architectural, operational, and performance evaluation against MySQL, MariaDB, MongoDB, and SQLite, **PostgreSQL 16 LTS is definitively recommended as the single primary database** for the Janmabhoomi Group digital newspaper platform and its multi-publication ecosystem.

### Key Justifications:
1. **Existing Source Code Alignment:** The backend foundation, Prisma schema ([`schema.prisma`](file:///c:/projects/Janmabhoomi/janmabhoomi/backend/prisma/schema.prisma)), and version-controlled migration SQL ([`migration.sql`](file:///c:/projects/Janmabhoomi/janmabhoomi/backend/prisma/migrations/20261105000000_init_phase_3a_foundation/migration.sql)) are already 100% authored in PostgreSQL DDL (native enums, UUID primary keys, JSONB columns, case-insensitive collation). Switching would require throwing away verified migration assets and rewriting queries with zero tangible benefit.
2. **First-Class JSONB for Dynamic Publishing:** Storing bilingual teaser paragraphs, PayU raw webhook payloads, audit diffs, and publication configurations in PostgreSQL's binary JSON (`JSONB`) gives the schemaless flexibility of MongoDB while retaining full ACID relational integrity across financial and subscription ledgers.
3. **Native Gujarati & English Text Search (`pg_trgm`):** PostgreSQL natively supports trigram indexes (`pg_trgm`) and full-text search dictionaries. This allows fuzzy and substring search across Gujarati headlines (`જન્મભૂમિ`, `અગ્રલેખ`) and English text without needing to operate a memory-hungry Elasticsearch or Meilisearch cluster on a single KVM VPS.
4. **Superior Single-Developer Maintainability:** Standardized backup tooling (`pg_dump`), transaction-safe DDL migrations (if a Prisma migration fails midway, PostgreSQL rolls back the entire schema change cleanly), and predictable resource usage make PostgreSQL the safest database for a solo engineer to maintain.

---

## 2. In-Depth Comparative Matrix (5 Database Systems)

| Evaluation Criteria | 1. PostgreSQL 16 (Recommended) | 2. MySQL 8.x | 3. MariaDB 10.11 / 11.x | 4. MongoDB 7.x | 5. SQLite 3 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Compatibility with Hostinger KVM VPS** | **Exceptional:** Available via standard Ubuntu APT repo; minimal overhead. | **High:** Standard APT package, though memory footprint is slightly higher. | **High:** Good drop-in MySQL replacement. | **Moderate:** High baseline RAM (~1.5GB wired memory); heavy for small VPS. | **Exceptional:** Zero daemon process, embedded file. |
| **Existing Codebase Compatibility** | **100% Drop-In:** Schema, migrations, enums, UUIDs already written for PostgreSQL. | **Poor (~40% rewrite):** Enums must be redefined, UUIDs stored as `CHAR(36)` or `BINARY(16)`. | **Poor (~40% rewrite):** Same structural rewrites as MySQL. | **Incompatible (0%):** Requires complete redesign of relational data model. | **Poor (~35% rewrite):** No native enums, no concurrent network write access. |
| **Prisma ORM Support** | **Tier 1 (Best in Class):** Full support for native enums, JSON filters, UUID, and schema diffing. | **Tier 1:** Broad support, but lacks PostgreSQL-specific features. | **Tier 2:** Treated similarly to MySQL, minor edge-case discrepancies. | **Tier 2:** Prisma MongoDB connector has significant relational limitations. | **Tier 1:** Full support, but single-writer locking causes Prisma concurrency errors. |
| **Query Performance** | **High:** Excellent cost-based query optimizer; excels at complex JOINs and JSONB queries. | **High:** Very fast on simple indexed lookups; slower on complex analytical JOINs. | **High:** Highly optimized Aria/InnoDB engines. | **High:** Fast for document key-value reads; poor for multi-table JOINs. | **Very High (Reads):** In-process memory reads; slow for high-concurrency writes. |
| **Concurrent Users & Locking** | **MVCC (Multi-Version Concurrency Control):** Reads never block writes, writes never block reads. | **Row-Level (InnoDB):** Very capable, but gap-locking can produce deadlocks under load. | **Row-Level:** Similar to MySQL InnoDB. | **Document-Level:** Good for writes, but lacks multi-document ACID without replica sets. | **Database-Level Write Lock:** `SQLITE_BUSY` errors occur under concurrent API writes. |
| **Data Consistency & Transactions** | **Full ACID:** Strict integrity, transactional DDL (migrations can rollback cleanly). | **ACID (InnoDB):** Non-transactional DDL (failed migrations leave partial tables). | **ACID:** Non-transactional DDL. | **Configurable:** Multi-document transactions require replica set deployment. | **ACID:** Strict, but strictly serialized. |
| **Security & RBAC** | **Enterprise Grade:** Role-level permissions, SSL client certs, Row-Level Security (RLS). | **High:** Strong user privilege matrix. | **High:** Strong user privilege matrix. | **Good:** Role-based access, but default setups often left insecure. | **None:** Relies entirely on Linux file system permissions. |
| **Backup and Restore** | **Flawless:** `pg_dump` runs live with zero read locking; `pg_restore` is fast and reliable. | **Good:** `mysqldump` requires locks unless using Percona XtraBackup. | **Good:** MariaDB Backup tools available. | **Moderate:** `mongodump` requires significant RAM and creates large uncompressed archives. | **Trivial:** Copying single `.db` file, but risks corruption if copied during write. |
| **Ease of Maintenance (1 Developer)** | **Very High:** Single configuration file (`postgresql.conf`), predictable memory caps, rock solid. | **Moderate:** Multiple buffer pools and binlog maintenance required. | **Moderate:** Similar to MySQL maintenance. | **Poor:** Sharding, replica sets, memory tuning, and BSON indexing require specialist ops. | **High for local dev, Fatal for production API:** No client-server architecture. |
| **Resource Usage on VPS** | **Light to Moderate:** Runs stably on 256MB–512MB RAM when tuned with `shared_buffers = 256MB`. | **Moderate:** InnoDB buffer pool baseline ~512MB–1GB RAM. | **Moderate:** Similar to MySQL. | **Heavy:** WiredTiger engine typically reserves 50% of available system RAM. | **Ultra-Low:** < 10MB RAM. |
| **Long-Term Scalability** | **Massive:** Scales to tens of millions of records, read replicas, connection pooling. | **High:** Widely proven at web scale. | **High:** Good scale characteristics. | **High for unstructured data:** Poor for relational financial audit trails. | **Low:** Cannot scale beyond a single application process write thread. |
| **Operational Complexity** | **Low:** Standard systemd service, single port (5432), simple tuning. | **Moderate:** Replication and binlog rotation require monitoring. | **Moderate:** Similar to MySQL. | **High:** Requires replica set even for basic multi-document transactions. | **Zero:** But completely inappropriate for multi-user production publishing. |

---

## 3. Disqualification of Alternatives

1. **Why NOT MongoDB?**
   - The Janmabhoomi platform is fundamentally relational: an Article belongs to a Publication and a Category; an E-Paper Edition belongs to a Publication and contains Pages, which contain Hotspots linked to Articles; Subscriptions link Users to Plans and Payment Transactions.
   - Forcing this relational structure into MongoDB creates data duplication, lacks foreign key constraints, and requires complex application-level joining.
   - MongoDB consumes excessive RAM (1.5GB+ baseline), which would starve Next.js and Fastify on a 4GB or 8GB KVM VPS.
2. **Why NOT SQLite?**
   - SQLite uses file-level locking for writes. When multiple background pre-press PDF ingestion workers, PayU webhooks, staff article edits, and reader logins occur concurrently, SQLite throws `SQLITE_BUSY: database is locked` errors.
   - SQLite cannot run on a separate private database network or serve multiple standalone Node processes without lock contention.
3. **Why NOT MySQL / MariaDB?**
   - Switching to MySQL would require discarding the existing `backend/prisma/migrations/` SQL script and rewriting the schema (UUID handling, JSON array searching, custom ENUM types).
   - MySQL does not support transactional DDL. If a Prisma migration fails halfway during a deployment, the database is left in a corrupted, half-migrated state requiring manual table drops. In PostgreSQL, schema migrations run inside an atomic transaction that rolls back automatically on error.

---

## 4. Production Database Specification: PostgreSQL 16 LTS

### 4.1 Recommended Version
- **PostgreSQL 16.x LTS** (installed via official PostgreSQL PGDG Ubuntu repository).
- Long-Term Support guaranteed until November 2028.

### 4.2 Required Database Extensions
Run the following initialization SQL upon database creation:
```sql
-- Core extensions for Janmabhoomi backend
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- UUID generation functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram fuzzy matching for bilingual search
CREATE EXTENSION IF NOT EXISTS "unaccent";      -- Accent-insensitive text filtering
```

### 4.3 Connection Pooling Strategy
- **Prisma Client Built-in Pool:** Prisma manages an internal connection pool via the `DATABASE_URL` query parameters:
  ```env
  DATABASE_URL="postgresql://jb_app_user:SECURE_PASSWORD@127.0.0.1:5432/janmabhoomi_prod?schema=public&connection_limit=15&pool_timeout=20"
  ```
- **Connection Limit Sizing:**
  - Fastify Backend: `connection_limit = 15` (Fastify uses asynchronous non-blocking event loops; 15 persistent database connections easily handle 500+ requests/sec).
  - Background PDF Worker / Cron: `connection_limit = 5`.
  - Reserved for Super-Admin / CLI: `connection_limit = 3`.
  - Total allocated PostgreSQL connections: **23 to 30**.
  - `max_connections` in `postgresql.conf` set to `50` (preventing connection exhaustion while avoiding the overhead of external PgBouncer on small-to-medium VPS plans).

### 4.4 PostgreSQL Performance Tuning for Hostinger KVM VPS

Depending on the VPS RAM allocated, configure `/etc/postgresql/16/main/postgresql.conf`:

```ini
# Baseline Tuning for Hostinger KVM VPS (Configured for 8 GB RAM Server)
shared_buffers = 1GB                  # 25% of dedicated DB RAM
effective_cache_size = 3GB            # Estimated OS filesystem cache
work_mem = 16MB                       # Per-query sort buffer (prevents disk swaps)
maintenance_work_mem = 256MB          # For VACUUM, CREATE INDEX
min_wal_size = 1GB
max_wal_size = 4GB
checkpoint_completion_target = 0.9    # Smooths disk I/O over time
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1                # Optimized for Hostinger NVMe SSD storage
effective_io_concurrency = 200        # NVMe concurrent I/O capability
```

### 4.5 Indexing Strategy
The schema in [`schema.prisma`](file:///c:/projects/Janmabhoomi/janmabhoomi/backend/prisma/schema.prisma) includes targeted indexes that must be maintained:
1. **Tenancy & Publishing compound index:**
   `@@index([publication_id, status, published_at(sort: Desc)])` — enables sub-millisecond retrieval of the latest published stories for any publication.
2. **Category listing index:**
   `@@index([category_id, status, published_at(sort: Desc)])` — powers category pages with zero sequential table scans.
3. **Bilingual slug unique lookup:**
   `@@unique([slug, language])` — powers instant article page resolution by URL slug.
4. **Trigram Index for Gujarati & English Search (To be added for Module 22):**
   ```sql
   CREATE INDEX idx_article_translations_headline_trgm 
   ON article_translations USING gin (headline gin_trgm_ops);
   ```

---

## 5. Backup & Disaster Recovery Strategy

### 5.1 Automated Daily Backup Architecture
- Backup tool: Native `pg_dump` with custom directory format and gzip compression.
- Schedule: Every night at 02:30 IST via Linux cron.
- Backup script: `/opt/janmabhoomi/scripts/backup-db.sh`.
- Encryption: GPG symmetric encryption (`gpg --symmetric --cipher-algo AES256`).
- Retention Policy:
  - Daily backups: Retained locally for 7 days.
  - Weekly backups: Retained for 4 weeks.
  - Monthly archives: Retained for 12 months.
- Offsite Sync: Nightly synchronization to secondary storage (Cloudflare R2, AWS S3, or remote SFTP) using `rclone`.

### 5.2 Step-by-Step Recovery Procedure (Drill Plan)

In the event of server failure, data corruption, or disaster recovery:

1. **Stop the Fastify application:**
   ```bash
   pm2 stop janmabhoomi-backend
   ```
2. **Verify target database readiness:**
   ```bash
   sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'janmabhoomi_prod';"
   sudo -u postgres dropdb janmabhoomi_prod
   sudo -u postgres createdb -O jb_app_user janmabhoomi_prod
   ```
3. **Restore from verified compressed backup:**
   ```bash
   gunzip -c /var/backups/janmabhoomi/db_janmabhoomi_prod_20261111_023001.sql.gz | sudo -u postgres psql -d janmabhoomi_prod
   ```
4. **Run Prisma Migration Integrity Check:**
   ```bash
   cd /opt/janmabhoomi/backend && npx prisma migrate status
   ```
5. **Restart services & verify health:**
   ```bash
   pm2 restart janmabhoomi-backend
   curl -s http://127.0.0.1:4000/health | jq
   ```
   *Expected response: `{"status":"ok","service":"janmabhoomi-backend",...}`*
