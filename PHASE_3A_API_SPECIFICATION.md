# Janmabhoomi Digital Newspaper – Phase 3A: RESTful API Specification (Revised)

**Document Version:** 2.0.0  
**Phase:** 3A (Backend Foundation)  
**Protocol:** RESTful JSON over Fastify 5.x  
**Validation:** Unified Zod Schema Validation  
**Base Path:** `/api/v1`

---

## 1. Uniform Response & Error Envelope Contract

Every Fastify endpoint strictly adheres to the standard response and error envelope:

### 1.1 Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_01hgb89z1a",
    "timestamp": "2026-11-05T09:00:00.000Z"
  }
}
```

### 1.2 Paginated Success Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 128,
    "page": 1,
    "limit": 10,
    "totalPages": 13,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 1.3 Error Response (`400`, `401`, `403`, `404`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Input validation error occurred.",
    "details": [
      {
        "field": "headline",
        "message": "Headline is required in Gujarati"
      }
    ]
  }
}
```

---

## 2. Staff Authentication Endpoints (Phase 3A / 3B)

### 2.1 Staff Login
- **Endpoint:** `POST /api/v1/auth/staff/login`
- **Rate Limit:** 5 requests per 15 minutes per IP
- **Zod Request Schema:**
  ```typescript
  export const StaffLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
  });
  ```
- **Behavior:**
  - Validates password hash via Argon2id.
  - Generates a 256-bit session token, records session in `staff_sessions` table.
  - Sets `janmabhoomi_staff_session` as an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "u-8891-231a",
        "fullName": "Senior Newsroom Editor",
        "email": "editor@janmabhoomi.in",
        "roles": ["editor"],
        "publicationScope": "pub-janmabhoomi"
      }
    }
  }
  ```

### 2.2 Staff Logout
- **Endpoint:** `POST /api/v1/auth/staff/logout`
- **Behavior:** Deletes the active session from `staff_sessions` and clears the cookie.
- **Response:** `{ "success": true, "data": { "message": "Logged out successfully" } }`

### 2.3 Current Staff Profile
- **Endpoint:** `GET /api/v1/auth/staff/me`
- **Behavior:** Reads session cookie, queries `staff_sessions` joined with `users` and `user_roles`.

---

## 3. Publication & Category Management Endpoints (All 8 Products)

### 3.1 List All Publications
- **Endpoint:** `GET /api/v1/publications`
- **Response Data:** Returns array of all 8 publications (*Janmabhoomi, Kutchmitra, Phulchhab, Vyapar Gujarati, Vyapar Hindi, Janmabhoomi Pravasi, Panchang, Kavita*) with their respective product types (`daily_newspaper`, `biweekly_newspaper`, `weekly_newspaper`, `magazine`, `almanac`), frequencies, and languages.

### 3.2 Get Single Publication Config
- **Endpoint:** `GET /api/v1/publications/:id`
- **Response Data:** Full publication details, including configurable `epaperFreePreviewPages` limit and publication-specific settings.

### 3.3 List Publication Categories
- **Endpoint:** `GET /api/v1/publications/:id/categories`
- **Response Data:** Ordered category taxonomy for that publication.

---

## 4. Public Content API (Powers `INewsDataProvider`)

### 4.1 Article Feed
- **Endpoint:** `GET /api/v1/articles`
- **Query Parameters:**
  - `publicationId` (string, default: `pub-janmabhoomi`)
  - `category` (string, optional: `national`, `city`, `business`, `maran`, etc.)
  - `lang` (`gu` | `en`, default: `gu`)
  - `page` (number, default: `1`)
  - `limit` (number, default: `10`)
  - `q` (string, full-text search)

### 4.2 Article by Slug
- **Endpoint:** `GET /api/v1/articles/:slug`
- **Query Parameters:** `publicationId`, `lang`
- **Response Data:** Matches `NewsArticle` contract with public `teaserParagraphs`.

### 4.3 Editorial Articles
- **Endpoint:** `GET /api/v1/editorials`
- **Query Parameters:** `publicationId`, `page`, `limit`
- **Response Data:** Daily institutional editorials (અગ્રલેખ).

### 4.4 Panchang Feed
- **Endpoint:** `GET /api/v1/panchang`
- **Query Parameters:** `city` (`mumbai`, `rajkot`, `ahmedabad`, `surat`), `date` (`YYYY-MM-DD`)
- **Note:** Returns astronomical data with `isDemoSample: true` until approved Jyotish feed is connected.

---

## 5. File Upload API & Non-Blocking Processing

### 5.1 Upload Article Image
- **Endpoint:** `POST /api/v1/admin/uploads/image`
- **Restrictions:** Staff session required. Max 10MB. Allowed types: `image/jpeg`, `image/png`, `image/webp`.

### 5.2 Upload Pre-Press Broadsheet PDF (Non-Blocking)
- **Endpoint:** `POST /api/v1/admin/epaper/upload`
- **Restrictions:** `epaper_manager` or `super_admin` role. Max 300MB. Allowed type: `application/pdf`.
- **Response (202 Accepted):**
  ```json
  {
    "success": true,
    "data": {
      "editionId": "ed-9912a-331b",
      "status": "PROCESSING",
      "message": "PDF uploaded successfully. Page extraction in progress in background."
    }
  }
  ```
- **Processing Architecture:** The file is written to local storage via `IStorageProvider`, and an asynchronous worker is dispatched. The HTTP request terminates immediately, keeping the Fastify server responsive to public news traffic.

---

## 6. Health & Diagnostic Endpoints

### 6.1 Server & Database Health Check
- **Endpoint:** `GET /health`
- **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "uptimeSeconds": 1420,
    "timestamp": "2026-11-05T09:15:00.000Z",
    "database": "connected",
    "version": "1.0.0"
  }
  ```
