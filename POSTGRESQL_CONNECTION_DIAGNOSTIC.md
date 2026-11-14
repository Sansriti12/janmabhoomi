# Janmabhoomi — Real PostgreSQL Database Connection Diagnostic Report

**Date:** November 11, 2026  
**Diagnostic Type:** Read-Only Physical & Application Layer Verification  
**Target Environment:** Local Development Environment (`DESKTOP-CR6065J`)  
**Backend Framework:** Fastify 5 + Prisma ORM 5.22 + TypeScript  

---

## Executive Summary Checklist

| # | Diagnostic Item | Status | Details / Finding |
|---|---|---|---|
| 1 | **DATABASE_URL configured** | **YES** | Configured in `backend/.env` with `postgresql://` scheme and `schema=public`. |
| 2 | **PostgreSQL connection successful** | **NO** | TCP connection to `localhost:5432` failed (`ECONNREFUSED`). |
| 3 | **Real PostgreSQL server responding** | **NO** | No service is currently listening on port `5432`. |
| 4 | **Prisma query successful** | **NO** | `prisma.$connect()` and `$queryRaw` timed out / failed with reachability error. |
| 5 | **Janmabhoomi tables accessible** | **NO** | Database server is offline; schema and tables cannot be queried. |
| 6 | **Existing data found** | **NO** | Zero records can be retrieved while the server is offline. |
| 7 | **Database location** | **LOCAL** | Configured for `localhost:5432/janmabhoomi_dev` (not Docker, Neon, or remote VPS). |

---

## 1. Database Configuration Inspection

- **Configuration File:** `backend/.env` (Confirmed present)
- **DATABASE_URL Status:** Present and syntactically valid
- **Configured Engine/Protocol:** `postgresql`
- **Configured Host:** `localhost` (`127.0.0.1` / `::1`)
- **Configured Port:** `5432` (Standard PostgreSQL port)
- **Configured Database Name:** `janmabhoomi_dev`
- **Search / Query Parameters:** `?schema=public`
- **Credentials:** Username and password are provided in `.env` (Redacted in accordance with security protocols).

---

## 2. Prisma Connection & Safe Query Test

A read-only connection test was executed using the existing `@prisma/client`:

1. **Connection Attempt (`prisma.$connect()`):**
   - Result: **FAILED**
   - Error: `Can't reach database server at localhost:5432`
2. **Query Attempt (`SELECT 1 as connected`):**
   - Result: **FAILED**
   - Error: `Invalid prisma.$queryRaw() invocation: Can't reach database server at localhost:5432`
3. **Safe Teardown (`prisma.$disconnect()`):**
   - Safely closed Prisma client instance with zero residual connections.

---

## 3. Fastify Health Endpoints Diagnostic

Tested using Fastify's native injection layer:

### A. Endpoint: `GET /health`
- **HTTP Status Code:** `200 OK`
- **Response Payload:**
  ```json
  {
    "status": "ok",
    "uptimeSeconds": 9,
    "timestamp": "2026-11-11T09:58:14.220Z",
    "service": "janmabhoomi-backend",
    "environment": "development",
    "version": "0.1.0",
    "database": {
      "status": "disconnected",
      "latencyMs": null
    }
  }
  ```
- **Finding:** The application server starts cleanly and operates in resilient fallback/standby mode, correctly detecting that the database is `disconnected`.

### B. Endpoint: `GET /health/db`
- **HTTP Status Code:** `503 Service Unavailable`
- **Response Payload:**
  ```json
  {
    "status": "degraded",
    "database": "PostgreSQL 16",
    "connected": false,
    "error": "Invalid `prisma.$queryRaw()` invocation:\n\nCan't reach database server at `localhost:5432`\n\nPlease make sure your database server is running at `localhost:5432`."
  }
  ```
- **Finding:** Correctly returns HTTP 503 indicating the physical database dependency is offline.

---

## 4. Real Database Access & Schema Verification

Because the physical database server is not running on port 5432:
- **PostgreSQL Version:** Could not be queried (Unreachable).
- **Janmabhoomi Tables (`publications`, `categories`, `epaper_editions`, `archive_enquiries`, etc.):** Could not be enumerated.
- **Existing Records:** Could not be counted.

*Note:* All SQL migrations (`20261111000000_phase_1_razorpay_and_enquiries` and `20261111140000_phase_3_epaper_pipeline`) and the Prisma schema (`backend/prisma/schema.prisma`) are fully staged, structurally verified, and ready to apply once the PostgreSQL service is active.

---

## 5. Database Environment & Host Determination

We inspected the local operating system to identify why port 5432 is not accepting connections:

1. **Network Port Probe:**
   - PowerShell `Test-NetConnection -ComputerName localhost -Port 5432` returned `TcpTestSucceeded: False`.
2. **Windows Services Check:**
   - `Get-Service -Name '*postgres*'` found **no native Windows PostgreSQL service** installed on this machine.
3. **Docker Engine Check:**
   - `docker ps` returned `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`. Docker Desktop is installed on the machine, but the daemon is currently not running.
4. **Cloud / Hosted Database Check:**
   - `backend/.env` does not contain connection parameters for Neon, Supabase, Railway, AWS RDS, or Hostinger VPS. It is explicitly configured for `localhost`.

**Conclusion:** The database is intended to be **LOCAL**, but neither a native Windows PostgreSQL daemon nor a Docker containerized PostgreSQL service is currently running.

---

## 6. Exact Error & Next Steps

### Exact Error
```
Can't reach database server at `localhost:5432`
Please make sure your database server is running at `localhost:5432`.
```

### Next Steps to Activate PostgreSQL Connection
Depending on how you wish to run PostgreSQL locally:

#### Option A: Run via Docker (Recommended if Docker Desktop is installed)
1. Start the Docker Desktop application on Windows.
2. Spin up a PostgreSQL 16 container:
   ```bash
   docker run --name janmabhoomi-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=<your_password> -e POSTGRES_DB=janmabhoomi_dev -p 5432:5432 -d postgres:16-alpine
   ```
3. Run the live verification suite:
   ```bash
   cd backend && npm run test:livedb
   ```

#### Option B: Connect to a Hosted PostgreSQL Database (Neon / Supabase / VPS)
1. Update `DATABASE_URL` in `backend/.env` with the hosted connection string (including `sslmode=require` if applicable).
2. Run the read-only health check `GET /health/db`.

#### Option C: Native Windows PostgreSQL Installation
1. Install PostgreSQL 16 via EDB installer or Chocolatey.
2. Start the Windows `postgresql-x64-16` service on port 5432.
3. Create the database `janmabhoomi_dev`.
