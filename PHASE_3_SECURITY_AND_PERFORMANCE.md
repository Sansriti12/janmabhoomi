# Janmabhoomi Digital Newspaper – Phase 3: Security & Performance Architecture

**Document Version:** 1.0.0  
**Compliance Standard:** OWASP Top 10 (2021+), PCI-DSS (SAQ A for Hosted Checkout), Indian IT Act 2000

---

## 1. Threat Modeling & Security Posture

As a prominent century-old Gujarati digital newspaper, Janmabhoomi faces potential threats including DDoS attacks during breaking political elections, content scraping/piracy of paid E-Paper editions, and financial tampering.

```
+-----------------------------------------------------------------------------------+
|                            EXTERNAL ATTACK SURFACE                                |
|  - DDoS & HTTP Floods during Election Spikes                                      |
|  - E-Paper High-Res PDF Scraping / Warehousing                                     |
|  - Credential Stuffing & Subscriber Account Sharing                               |
|  - SQL Injection & Cross-Site Scripting (XSS)                                     |
|  - Payment Callback Tampering / Man-in-the-Middle                                  |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                            DEFENSE-IN-DEPTH LAYERS                                |
|                                                                                   |
|  Layer 1: Edge Perimeter (Cloudflare Enterprise / WAF)                            |
|           - Automated DDoS mitigation, managed OWASP core ruleset                 |
|           - Geo-blocking suspicious ASN proxies and automated bot scrapers        |
|                                                                                   |
|  Layer 2: Transport & Header Security                                             |
|           - Strict TLS 1.3 only, HSTS (2-year preload), rigid CSP                 |
|                                                                                   |
|  Layer 3: Authentication & Token Security                                         |
|           - Short-lived JWTs (15 min) + HttpOnly SameSite=Strict refresh cookies  |
|           - Cryptographic Argon2id password hashing with custom salt              |
|                                                                                   |
|  Layer 4: Application & Data Protection                                           |
|           - Parameterized queries via Prisma/Drizzle (100% SQLi immunity)         |
|           - Dynamic SVG/Canvas subscriber watermarking on E-Paper views           |
|           - Time-limited Pre-Signed S3 URLs (60-sec TTL) for high-res assets      |
|                                                                                   |
|  Layer 5: Network & Infrastructure Isolation                                      |
|           - Database & Redis accessible only via internal private VPC loopback    |
|           - Mandatory SSH key-pair authentication (passwords disabled)            |
+-----------------------------------------------------------------------------------+
```

---

## 2. Authentication & Authorization Security Standards

### 2.1 Password Hashing Specification
Staff and registered user passwords must never be stored in plaintext or weak hashes (MD5, SHA1, SHA256).
- **Algorithm:** Argon2id
- **Memory Cost:** 64 MB (`m=65536`)
- **Time Cost:** 3 iterations (`t=3`)
- **Parallelism:** 4 threads (`p=4`)
- **Salt:** 16 cryptographically random bytes generated via CSPRNG

### 2.2 Token Lifecycle & Session Security
- **Access Tokens:** Signed with RS256 (asymmetric 4096-bit private key). Valid for **15 minutes**.
- **Refresh Tokens:** Opaque 256-bit random tokens stored in Redis with SHA-256 hash. Stored in browser strictly as an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
- **Revocation:** Admin password changes or "Log out from all devices" requests immediately delete the user's refresh tokens in Redis, revoking access in under 15 minutes.

### 2.3 Strict HTTP Security Headers
The following headers are enforced across Next.js and the Node.js API Gateway:
```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://secure.payu.in; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.janmabhoomi.in https://secure.payu.in; frame-src https://secure.payu.in;
```

---

## 3. High-Performance Caching Architecture

To achieve sub-100ms response times for high-volume readers while reducing database load by over 92%:

```
[ Browser / Reader ]
        |
        v (1. HTTP Cache-Control: max-age=60)
[ Cloudflare Edge CDN ]
        |
        v (Cache Miss: Forward to Origin)
[ Next.js ISR (Incremental Static Regeneration) ]
        |
        v (ISR Regeneration Hook)
[ Backend Fastify / NestJS API ]
        |
        v (Check Memory / In-Memory Cache)
[ Redis Cluster (JSON Strings / Hashes) ]
        |
        v (Cache Miss: Sub-millisecond indexed query)
[ PostgreSQL Primary Database ]
```

### Caching TTL Policies:
| Content Type | Edge TTL | Redis TTL | Invalidation Trigger |
| :--- | :--- | :--- | :--- |
| **Homepage Layout** | 60 seconds | 120 seconds | Article published or lead story changed |
| **Breaking News Ticker** | 15 seconds | 30 seconds | Breaking news toggle in CMS |
| **Category Feeds** | 120 seconds | 300 seconds | New article published in category |
| **Single Article Page** | 300 seconds | 600 seconds | Article edit or retraction |
| **Panchang Feed** | 12 hours | 24 hours | Daily midnight transition |
| **E-Paper Edition Index**| 1 hour | 2 hours | Pre-press edition published |

---

## 4. Database Connection Pooling & Query Optimization

- **Connection Pooler:** Deploy **PgBouncer** in transaction pooling mode in front of PostgreSQL.
- **Max Connections:** Configured to 25 server-side pooled connections to PostgreSQL, serving up to 5,000 concurrent client requests without memory starvation.
- **Slow Query Logging:** All SQL queries executing above 100ms are automatically flagged in server logs for index tuning.
- **Read Replicas:** When concurrent traffic exceeds 10,000 readers, configure an asynchronous read replica in PostgreSQL for read-heavy feed queries.
