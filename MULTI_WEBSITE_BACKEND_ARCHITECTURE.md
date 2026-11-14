# JANMABHOOMI GROUP DIGITAL NEWSPAPER
## Multi-Website Backend Architecture & Multi-Tenancy Strategy (~21 Websites)

**Document ID:** DOC-ARCH-MULTI-001  
**Date:** 11 November 2026  
**Auditor / Architect:** Lead Full-Stack Software Engineer  
**Organization:** Saurashtra Trust (Janmabhoomi, Phulchhab, Kutchmitra, Vyapar, Pravasi, Kavita, Panchang, and Sister Trust Portals)  

---

## 1. Context & Architectural Challenge

Saurashtra Trust manages an expansive group of newspapers, periodicals, literary journals, astronomical almanacs, and institutional websites. While the project begins with the Janmabhoomi digital newspaper, the overarching vision spans **approximately 21 websites** across the group.

As a solo developer responsible for both frontend and backend maintenance, the architecture must balance **tenant autonomy** with **operational maintainability**. Creating 21 distinct server stacks would result in operational collapse; conversely, an overly rigid monolith could compromise data security between distinct organizations.

---

## 2. Comparative Analysis of the 3 Architectural Models

```
OPTION A: Single Unified Modular Backend + Multi-Tenant PostgreSQL
[ Web 1 ] [ Web 2 ] ... [ Web 21 ]
    │         │             │
    └─────────┼─────────────┘
              ▼
   [ Fastify Unified Backend ]  <── Single Admin Portal / Universal Subscriber SSO
              │
              ▼
   [ PostgreSQL Multi-Tenant DB ] (Tenant partitioning via publication_id)

──────────────────────────────────────────────────────────────────────────────

OPTION B: Shared Backend + Isolated PostgreSQL Schemas / Databases
[ Web 1 ] [ Web 2 ] ... [ Web 21 ]
    │         │             │
    └─────────┼─────────────┘
              ▼
   [ Fastify Unified Backend ]
        │              │             │
        ▼              ▼             ▼
   [ Schema 1 ]   [ Schema 2 ]  [ Schema 21 ]

──────────────────────────────────────────────────────────────────────────────

OPTION C: 21 Separate Independent Backends & Databases
[ Web 1 ] ──► [ Fastify 1 ] ──► [ DB 1 ]
[ Web 2 ] ──► [ Fastify 2 ] ──► [ DB 2 ]
...
[ Web 21] ──► [ Fastify 21] ──► [ DB 21]
```

---

### Detailed Comparison Matrix

| Evaluation Dimension | Option A: One Shared Backend & Single Multi-Tenant DB (Recommended) | Option B: Shared Backend with Separate DB Schemas | Option C: 21 Separate Backends & Separate Databases |
| :--- | :--- | :--- | :--- |
| **Maintainability (1 Developer)** | **Exceptional (1× Effort):** 1 codebase, 1 migration pipeline, 1 server process to monitor. | **Moderate (5× Effort):** 1 codebase, but migrations must be looped over 21 schemas. | **Catastrophic (21× Effort):** Updating a security patch requires 21 Git repos, 21 deploys, 21 migrations. |
| **Shared Staff & Admin Management** | **Seamless:** Single unified login for journalists, editors, and trustees with role-scoped permissions. | **Complex:** Requires cross-schema user authentication mapping. | **Impossible without SSO:** Staff must remember 21 different logins. |
| **Shared Subscriber SSO ("Trust Pass")** | **Native:** A reader subscribing to Janmabhoomi can access Vyapar or Pravasi via a single universal login. | **Difficult:** Requires centralized auth schema with cross-tenant session grants. | **Impossible without OAuth:** Requires building an external Auth0/Keycloak service. |
| **Publication Autonomy** | **High:** Each publication has its own categories, editions, and editors via `publication_id`. | **Very High:** Complete table segregation per product. | **Total:** Completely decoupled applications. |
| **Hostinger VPS RAM Usage** | **Ultra-Low (~768 MB):** Single Fastify process + single PostgreSQL connection pool. | **Moderate (~1.5 GB):** Single Fastify, but multiple schema connection pools. | **Disastrous (~10+ GB):** 21 Node.js processes would instantly crash a standard VPS. |
| **Risk of Cross-Tenant Data Leaks** | **Low if guarded:** Requires strict query filtering (`where: { publicationId }`). | **Very Low:** Schema-level isolation. | **Zero:** Complete physical separation. |
| **Handling Diverse Website Features** | **Very Flexible:** Handled via JSONB settings columns and feature flags in the `publications` table. | **Flexible:** Schemas can diverge over time. | **Infinite:** Each codebase can be completely different. |

---

## 3. Recommended Approach: Hybrid Multi-Tenant Modular Monolith

### Recommendation: **Option A as Primary Hub, with Selective Option B for Outliers**

For the 21 websites, we categorize them into **Two Architectural Tiers**:

```
                                  SAURASHTRA TRUST ECOSYSTEM
                                              │
                 ┌────────────────────────────┴────────────────────────────┐
                 ▼                                                         ▼
       TIER 1: PUBLISHING HUB (15–18 Sites)                     TIER 2: SPECIALIZED SERVICES (3–6 Sites)
       - Janmabhoomi Daily (Evening)                            - Janmabhoomi Medical Trust Portal
       - Phulchhab Daily (Rajkot)                               - Printing Press & Commercial Operations
       - Kutchmitra Daily (Bhuj)                                - Saurashtra Trust Corporate Archive & Museum
       - Vyapar Gujarati (Bi-Weekly)
       - Vyapar Hindi (Weekly)
       - Janmabhoomi Pravasi (Sunday Weekly)
       - Janmabhoomi Panchang (Annual Almanac)
       - Kavita Quarterly (Literary Journal)
       - Regional Edition Sub-Portals (Surat, Jamnagar, etc.)
                 │                                                         │
                 ▼                                                         ▼
       Option A: Single Multi-Tenant Schema                     Option B: Isolated Database Schema
       (Shared Articles, E-Paper, PayU, SSO)                    (Custom Schemas, Specialized Data)
```

### 3.1 Tier 1: The Saurashtra Trust Publishing Hub (Core 8+ Publications)
All standard publishing portals (newspapers, periodicals, almanacs, regional digital portals) share:
- The existing [`backend/prisma/schema.prisma`](file:///c:/projects/Janmabhoomi/janmabhoomi/backend/prisma/schema.prisma).
- **Tenant Key:** `publication_id` on all operational tables (`articles`, `epaper_editions`, `subscription_plans`, `advertisements`).
- **Unified Staff Management:** A Chief Editor can supervise multiple publications, while a local bureau reporter is restricted to their specific `publication_id` via `UserRole`.
- **"Saurashtra Trust Pass" (Subscriber SSO):** A single reader account grants access across titles based on their purchased subscription tiers.

### 3.2 Tier 2: Specialized & Non-Publishing Portals
If the group later adds specialized non-publishing websites (such as a medical trust charitable dispensary portal, a commercial printing press booking site, or an internal trust accounting system):
- These should **NOT** be crammed into the newspaper article schema.
- Instead, use **PostgreSQL Schemas** (`CREATE SCHEMA medical_trust;`) within the same PostgreSQL instance, or a lightweight dedicated micro-service sharing the same server.

---

## 4. Multi-Tenant Request Routing in Fastify

In the unified Fastify backend, each incoming request is automatically scoped to the correct publication via a Fastify request hook:

```typescript
// Architectural Pattern: Multi-Tenant Publication Resolution Hook
app.addHook("onRequest", async (request, reply) => {
  // 1. Resolve publication from Custom Header or Subdomain
  const publicationSlug = 
    request.headers["x-publication-id"] || 
    extractSubdomain(request.hostname); // e.g., 'phulchhab.janmabhoomi.in' -> 'pub-phulchhab'

  // 2. Attach resolved publication context to request
  if (publicationSlug) {
    request.publicationId = String(publicationSlug);
  }
});
```

---

## 5. Security & Isolation Safeguards

To ensure that editors of Publication A cannot inadvertently modify or view embargoed articles from Publication B:

1. **Prisma Middleware / Client Extensions:**
   Enforce automatic tenant filtering on all administrative queries:
   ```typescript
   // Enforces that non-super-admin queries always scope by user's assigned publicationId
   prisma.$use(async (params, next) => {
     if (userRole !== "super_admin" && params.model === "Article" && params.action.startsWith("find")) {
       params.args.where = { ...params.args.where, publicationId: currentStaffUser.publicationId };
     }
     return next(params);
   });
   ```
2. **Audit Logging Isolation:**
   All administrative updates automatically write to `audit_logs` capturing `userId`, `publicationId`, `entityName`, `oldValues`, and `newValues`.
3. **Database Backup Isolation:**
   Because all publishing titles reside in one database, a single automated backup captures the entire group's data atomically, eliminating synchronization discrepancies.
