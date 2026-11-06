# Janmabhoomi Digital Newspaper – Phase 3A: Step-by-Step Implementation Plan (Revised)

**Document Version:** 2.0.0  
**Phase:** 3A (Backend Foundation & Modular Core)  
**Execution Environment:** Strictly Local Development (`localhost`)  
**Framework:** Fastify 5.x + TypeScript + Prisma ORM + PostgreSQL  
**Deployment / Live Changes:** None permitted during this phase

---

## 1. Phased Implementation Roadmap for Phase 3A

In adherence to your instructions, Phase 3A is broken down into disciplined, verifiable tasks. We will execute **Task 1 first**, run tests, verify the health check, and stop for your review before proceeding.

```
┌────────────────────────────────────────────────────────────────────────┐
│ TASK 1: INITIAL BACKEND SETUP (EXECUTE FIRST & WAIT FOR APPROVAL)      │
│  - Create backend/ workspace, package.json, and tsconfig.json          │
│  - Install Fastify, Prisma, Zod, and core TypeScript dependencies      │
│  - Configure Zod environment variable validation                       │
│  - Implement Fastify server with /health diagnostic endpoint           │
│  - Configure Prisma client & PostgreSQL connection                     │
│  - Verify TypeScript compilation and local startup (npm run dev)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ (STOP & WAIT FOR APPROVAL)
┌────────────────────────────────────────────────────────────────────────┐
│ TASK 2: DATABASE MIGRATION & SEEDING (AFTER TASK 1 APPROVAL)           │
│  - Create Prisma schema covering all 8 publications & 20 entities      │
│  - Run initial migration (npx prisma migrate dev)                      │
│  - Implement seed.ts populating the 8 publications, 12 categories      │
│  - Verify zero hardcoded admin passwords (setup:admin CLI)             │
│  - Execute local database backup and restoration test                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ (STOP & WAIT FOR APPROVAL)
┌────────────────────────────────────────────────────────────────────────┐
│ TASK 3: STORAGE ABSTRACTION & MODULAR APIS                             │
│  - Implement IStorageProvider with LocalStorageProvider                │
│  - Implement public content endpoints (/publications, /articles)       │
│  - Implement staff authentication with persistent staff_sessions       │
│  - Implement PayU sandbox hash generator and webhook handler           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ (STOP & WAIT FOR APPROVAL)
┌────────────────────────────────────────────────────────────────────────┐
│ TASK 4: FRONTEND ADAPTER & REGRESSION TESTING                          │
│  - Implement ApiNewsDataProvider in Next.js frontend                   │
│  - Validate seamless switching via NEXT_PUBLIC_DATA_PROVIDER=api       │
│  - Verify zero visual or functional regressions in mock mode           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Task 1 Breakdown (Immediate Next Step)

1. **Workspace Creation:**
   - Create `backend/` directory in repository root.
   - Initialize `backend/package.json` with scripts:
     - `"dev": "tsx watch src/server.ts"`
     - `"build": "tsc"`
     - `"start": "node dist/server.js"`
     - `"lint": "eslint src --ext .ts"`
     - `"typecheck": "tsc --noEmit"`
     - `"prisma:generate": "prisma generate"`
     - `"prisma:migrate": "prisma migrate dev"`
     - `"setup:admin": "tsx src/scripts/setup-admin.ts"`
2. **TypeScript Configuration:**
   - Create `backend/tsconfig.json` with strict type checking, ES2022 target, and NodeNext module resolution.
3. **Core Dependencies:**
   - Production: `fastify`, `@fastify/cors`, `@fastify/helmet`, `@fastify/cookie`, `@prisma/client`, `zod`, `argon2`, `dotenv`
   - Development: `prisma`, `typescript`, `@types/node`, `tsx`
4. **Environment Configuration (`src/common/config/`):**
   - Create Zod schema validating: `PORT`, `NODE_ENV`, `DATABASE_URL`, `CORS_ORIGIN`, `PAYU_MERCHANT_KEY`, `PAYU_MERCHANT_SALT`.
   - Provide documented `backend/.env.example`.
5. **Fastify Server & Health Check:**
   - Implement `src/app.ts` initializing Fastify with CORS and Helmet.
   - Register `GET /health` endpoint reporting uptime, server status, and database connectivity.
   - Implement `src/server.ts` with graceful shutdown (`SIGTERM`, `SIGINT`).
6. **Prisma Connection:**
   - Initialize `backend/prisma/schema.prisma` with datasource pointing to PostgreSQL.
   - Verify Prisma client generation (`npx prisma generate`).

---

## 3. Strict Safety & Boundary Protocols

- **Work locally only:** All work occurs on `localhost` within the `backend/` folder.
- **Zero changes to production:** No server, DNS, or domain modifications.
- **No live payments:** PayU runs strictly in sandbox mode with test keys.
- **No Git pushes without approval:** Commits remain on local branches.
- **Frontend protection:** The existing Next.js frontend code is preserved intact.
