# Janmabhoomi Digital Newspaper – Phase 3: RESTful API Design Specification

**Document Version:** 1.0.0  
**Base Protocol:** HTTPS / RESTful JSON  
**Base URL:** `https://api.janmabhoomi.in/v1` (Production) / `http://localhost:4000/v1` (Development)  
**Standard Response Envelope:** `{ success: boolean, data: T, meta?: object, error?: object }`

---

## 1. API Architecture & Design Principles

The API architecture directly implements the contracts defined in `src/lib/data/types.ts` (`INewsDataProvider`), ensuring that the Next.js frontend can seamlessly switch from `MockNewsDataProvider` to `ApiNewsDataProvider` simply by changing the environment variable `NEXT_PUBLIC_DATA_PROVIDER=api`.

### Standard Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_88f912cb8",
    "timestamp": "2026-11-05T06:30:00Z",
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 48,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "ARTICLE_NOT_FOUND",
    "message": "The requested article was not found or has been retracted.",
    "status": 404,
    "details": []
  }
}
```

---

## 2. Public Content API (Read-Only, Edge Cached)

These endpoints power the public Next.js frontend. They require no authentication and are cached aggressively at the Cloudflare edge.

### 2.1 Get Homepage Sections
- **Endpoint:** `GET /publications/:publicationId/homepage`
- **Headers:** `Accept-Language: gu` (or query param `?lang=gu`)
- **Query Params:**
  - `edition`: (optional) e.g., `mumbai`, `rajkot`
- **Response Data:**
  ```json
  {
    "leadStory": { ... },
    "breakingNews": [ ... ],
    "topStories": [ ... ],
    "categorySections": [
      { "category": { "id": "mumbai", "name": "મુંબઈ" }, "articles": [ ... ] },
      { "category": { "id": "vyapar-bazaar", "name": "વેપાર" }, "articles": [ ... ] }
    ],
    "panchang": { ... },
    "todaysEditorial": { ... }
  }
  ```

### 2.2 Get Article Feed / Category Feed
- **Endpoint:** `GET /publications/:publicationId/articles`
- **Query Params:**
  - `category`: (optional) e.g., `mumbai`, `gujarat`, `national`
  - `page`: default `1`
  - `limit`: default `10`, max `50`
  - `lang`: `gu` | `en` (default `gu`)
  - `sort`: `latest` | `popular`
- **Cache Policy:** `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`

### 2.3 Get Article by Slug or ID
- **Endpoint:** `GET /publications/:publicationId/articles/:slugOrId`
- **Query Params:**
  - `lang`: `gu` | `en`
- **Response Data:** Complete article entity including `contentHtml`, `author`, `tags`, `relatedArticles`, and `translations: [{ lang: 'en', slug: '...' }]`.

### 2.4 Search Articles
- **Endpoint:** `GET /publications/:publicationId/search`
- **Query Params:**
  - `q`: Search string (supports Gujarati Unicode and English queries)
  - `category`: (optional) filter by category
  - `from`: (optional) `YYYY-MM-DD`
  - `to`: (optional) `YYYY-MM-DD`
  - `page`: default `1`
  - `limit`: default `10`

### 2.5 Panchang Astronomical Feed
- **Endpoint:** `GET /panchang`
- **Query Params:**
  - `date`: `YYYY-MM-DD` (defaults to current date in IST)
  - `city`: `mumbai` | `rajkot` | `surat` | `ahmedabad`
  - `lang`: `gu` | `en`

### 2.6 Daily Editorial & Archive
- **Endpoint:** `GET /publications/:publicationId/editorials`
- **Query Params:**
  - `date`: (optional) `YYYY-MM-DD`
  - `page`: default `1`
  - `limit`: default `10`
  - `lang`: `gu` | `en`

---

## 3. E-Paper API Endpoints

### 3.1 Get Edition List & Metadata
- **Endpoint:** `GET /epaper/editions`
- **Query Params:**
  - `publicationId`: default `janmabhoomi`
  - `date`: (optional) `YYYY-MM-DD` (defaults to latest available)
  - `city`: (optional) `mumbai` | `rajkot` | `surat`
- **Response Data:** Edition summary, publication date, total pages, and array of page summaries.

### 3.2 Get Page Details with Hotspots
- **Endpoint:** `GET /epaper/editions/:editionId/pages/:pageNumber`
- **Headers:** (Optional) `Authorization: Bearer <subscriber_jwt>`
- **Behavior:**
  - Page 1 & 2: Returns public high-res WebP image URL and vector hotspot coordinates.
  - Page 3+: If valid subscriber token provided, returns authenticated signed image URL. If not provided, returns thumbnail only with `isPaywalled: true` and paywall trigger payload.

---

## 4. Subscriber Authentication & Billing API

### 4.1 Request OTP / Passwordless Login
- **Endpoint:** `POST /auth/request-otp`
- **Payload:** `{ "identifier": "reader@example.com" | "+919820012345", "type": "email" | "sms" }`

### 4.2 Verify OTP & Issue Tokens
- **Endpoint:** `POST /auth/verify-otp`
- **Payload:** `{ "identifier": "...", "otp": "489210", "deviceId": "client_uuid" }`
- **Response:** Sets HTTP-only `refreshToken` cookie and returns `{ accessToken: "jwt_...", user: { ... } }`.

### 4.3 Get Active Subscription Status
- **Endpoint:** `GET /subscriptions/me`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
  ```json
  {
    "hasActiveSubscription": true,
    "currentPlan": {
      "id": "JNB-EPAPER-A",
      "name": "Janmabhoomi E-Paper Annual",
      "expiresAt": "2027-11-05T00:00:00Z",
      "daysRemaining": 365
    },
    "entitlements": ["epaper:all_pages", "epaper:pdf_clip", "epaper:archive_30d"]
  }
  ```

### 4.4 Initiate PayU Subscription Checkout
- **Endpoint:** `POST /payments/payu/initiate`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Payload:** `{ "planId": "JNB-EPAPER-A", "publicationId": "janmabhoomi" }`
- **Response:** Returns signed PayU payment parameters (key, txnid, amount, hash, actionUrl).

### 4.5 PayU Server-to-Server Webhook
- **Endpoint:** `POST /payments/payu/webhook`
- **Headers:** `Content-Type: application/x-www-form-urlencoded`
- **Payload:** Standard PayU postback parameters.
- **Security:** Verifies reverse SHA-512 hash before updating database.

---

## 5. Editorial CMS Admin API (Protected by RBAC)

All `/v1/admin/*` endpoints require `Authorization: Bearer <staff_jwt>` and enforce role validation.

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/admin/articles` | Reporter, Editor, Admin | Create article draft |
| `PUT` | `/admin/articles/:id` | Reporter (own), Editor, Admin | Update article content/translations |
| `POST` | `/admin/articles/:id/publish` | Editor, Pub Admin, Super Admin | Publish draft immediately |
| `POST` | `/admin/articles/:id/schedule`| Editor, Pub Admin, Super Admin | Set scheduled publishing timestamp |
| `POST` | `/admin/epaper/upload` | E-Paper Mgr, Pub Admin | Upload multi-part master edition PDF |
| `POST` | `/admin/epaper/pages/:id/hotspots`| E-Paper Mgr, Editor | Save interactive hotspot polygons |
| `GET` | `/admin/audit-logs` | Pub Admin, Super Admin | Query administrative action logs |
| `GET` | `/admin/reports/traffic` | Editor, Pub Admin, Super Admin | View readership analytics & velocity |

---

## 6. Rate Limiting & API Gateway Throttling

| Zone | Limit | Window | Action on Violation |
| :--- | :--- | :--- | :--- |
| **Public Content API** | 120 requests | 1 minute | HTTP 429 Too Many Requests |
| **Article Search API** | 20 requests | 1 minute | HTTP 429 Too Many Requests |
| **Auth / OTP Endpoints** | 3 requests | 10 minutes | HTTP 429 + Temporary IP lock (15 min) |
| **PayU Webhook Endpoint** | 60 requests | 1 minute | IP allowlisted to PayU gateway subnets |
| **Admin CMS Endpoints** | 300 requests | 1 minute | HTTP 429 + Staff Session Flag |
