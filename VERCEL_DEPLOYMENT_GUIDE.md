# Janmabhoomi — GitHub & Vercel Deployment Guide

**Repository:** `https://github.com/Sansriti12/janmabhoomi`  
**Branch:** `main` (Successfully committed and pushed)  
**Date:** November 2026  

---

## 1. Architecture Overview for Production

The Janmabhoomi newspaper platform consists of two integrated components:

```
┌──────────────────────────────────────────────┐
│             VERCEL (Serverless)              │
│  Next.js 15 App Router Frontend              │
│  - Public bilingual news website (/en, /gu)  │
│  - Admin Newsroom CMS (/admin)               │
│  - E-paper reader & subscriber portals       │
│  - Static & SSR pages (39 routes)            │
└──────────────────────┬───────────────────────┘
                       │ HTTPS API Calls (NEXT_PUBLIC_API_BASE_URL)
                       ▼
┌──────────────────────────────────────────────┐
│         CLOUD BACKEND & DATABASE             │
│  (Render / Railway / Hostinger KVM VPS)      │
│  - Fastify REST API (Port 4000)              │
│  - Staff RBAC & JWT auth                     │
│  - PostgreSQL 16 DB (Prisma ORM)             │
│  - PDF processing (E-paper editions)         │
│  - Razorpay webhooks & subscriptions         │
└──────────────────────────────────────────────┘
```

---

## 2. Deploying the Frontend on Vercel

### Step 1: Log in to Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.

### Step 2: Import the GitHub Repository
1. Click **Add New...** &rarr; **Project**.
2. Select your repository: **`Sansriti12/janmabhoomi`**.
3. Click **Import**.

### Step 3: Configure Project Settings
Vercel will automatically detect **Next.js**:
- **Framework Preset:** `Next.js`
- **Root Directory:** `./` (Leave as default)
- **Build Command:** `npm run build` or `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Step 4: Add Environment Variables
In the **Environment Variables** section on Vercel, add the following:

| Variable Name | Example Production Value | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://janmabhoomi.vercel.app` (or your custom domain) | Canonical site URL for SEO & metadata |
| `NEXT_PUBLIC_USE_API` | `true` | Enables live backend API integration |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.yourdomain.com` (or Railway/Render URL) | Public HTTPS URL of the backend API |

> **Note on Standalone Mode:**  
> If your backend is not yet deployed, you can leave `NEXT_PUBLIC_USE_API=false` (or unset). The Next.js frontend will deploy immediately on Vercel using the built-in offline mock dataset with full bilingual article browsing, categories, and Panchang.

### Step 5: Click Deploy
1. Click **Deploy**.
2. Vercel will run `npm install`, compile all 39 routes, and provide your live `https://janmabhoomi-xxx.vercel.app` URL in under 2 minutes.

---

## 3. Hosting the Backend & PostgreSQL Database

Because the backend is a persistent Fastify service with PostgreSQL, PDF processing, and Razorpay webhooks, it requires a Node.js server environment:

### Recommended Options:

#### Option A: Railway (Fastest 1-Click Setup)
1. Go to [https://railway.app](https://railway.app) and link your GitHub repository.
2. Add a **PostgreSQL** database service (Railway provides a free/starter PostgreSQL connection string).
3. Add a service pointing to the `backend/` directory:
   - Root directory: `backend`
   - Build command: `npm install && npm run build && npx prisma migrate deploy`
   - Start command: `npm start`
4. Set Environment Variables in Railway:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `JWT_SECRET`: Generate a secure 32+ character secret
   - `NODE_ENV`: `production`
   - `PORT`: `4000`
   - `CORS_ORIGIN`: Your Vercel frontend URL (e.g., `https://janmabhoomi.vercel.app`)
5. Railway provides an HTTPS domain (e.g., `https://janmabhoomi-backend.up.railway.app`). Set this as `NEXT_PUBLIC_API_BASE_URL` on Vercel.

#### Option B: Render.com
1. Create a **PostgreSQL** database on Render.
2. Create a **Web Service** connected to `Sansriti12/janmabhoomi`:
   - Root directory: `backend`
   - Build command: `npm install && npm run build && npx prisma migrate deploy`
   - Start command: `npm start`
3. Add environment variables and set CORS to your Vercel domain.

#### Option C: Hostinger KVM VPS (Self-Hosted Production)
- Full step-by-step Nginx reverse proxy, PM2 cluster, and PostgreSQL 16 setup is documented in detail in [`HOSTINGER_KVM_DEPLOYMENT_ARCHITECTURE.md`](./HOSTINGER_KVM_DEPLOYMENT_ARCHITECTURE.md).

---

## 4. Current Status Checklist

- [x] Codebase committed to git (`main` branch)
- [x] Successfully pushed to `https://github.com/Sansriti12/janmabhoomi.git`
- [x] Next.js production build verified locally (`39 routes, 0 errors`)
- [x] Backend TypeScript compilation verified (`0 errors`)
- [x] Image remote patterns updated in `next.config.ts` to support external CDN/Vercel media
- [x] Environment variable template created at `.env.example`
- [x] Sensitive files (`.env`, `storage/`) excluded via `.gitignore`
