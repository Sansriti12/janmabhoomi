# JANMABHOOMI GROUP DIGITAL NEWSPAPER
## Frontend-Backend Integration Specification & Systematic Checklist

**Document ID:** DOC-INT-SPEC-001  
**Date:** 11 November 2026  
**Auditor / Integration Engineer:** Lead Full-Stack Software Engineer  
**Frontend Architecture:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4  
**Backend Architecture:** Fastify 5.2.1, Prisma 6.4.1, PostgreSQL 16  
**Integration Contract:** `INewsDataProvider` in [`src/lib/data/provider.ts`](file:///c:/projects/Janmabhoomi/janmabhoomi/src/lib/data/provider.ts)  

---

## 1. Executive Summary & Integration Strategy

The frontend website is currently powered by a mock data adapter (`MockNewsDataProvider` in `src/lib/data/mock/dataset.ts`). The architecture was deliberately structured using the **Provider Pattern** so that swapping sample data for live backend API calls requires **zero changes to UI presentation components**.

To connect the frontend to the backend:
1. Implement `ApiNewsDataProvider` in `src/lib/data/apiProvider.ts` implementing the existing `INewsDataProvider` interface.
2. Configure `NEXT_PUBLIC_API_BASE_URL` in root `.env` (e.g. `http://localhost:4000` in development, `https://api.janmabhoomi.in` in production).
3. Toggle the singleton export in `src/lib/data/provider.ts` from `MockNewsDataProvider` to `ApiNewsDataProvider`.

---

## 2. Page-by-Page Integration Matrix

| # | Route / Page | Current Data Source | Required Backend Endpoint(s) | Auth Required? | Loading / Error / Empty States | Integration Status |
| :-: | :--- | :--- | :--- | :---: | :--- | :---: |
| **1** | `/[lang]` (Homepage) | Mock Data (`provider.ts`) | `GET /api/v1/articles/home?lang={lang}` | Public | Skeleton cards, Retry button, Empty ticker fallback | ⏳ Ready for API |
| **2** | `/[lang]/latest` | Mock Data (`provider.ts`) | `GET /api/v1/articles/latest?page=1&limit=20` | Public | Paginated list, shimmer loader | ⏳ Ready for API |
| **3** | `/[lang]/category/[slug]` | Mock Data (`provider.ts`) | `GET /api/v1/categories/:slug/articles` | Public | "No articles in this category" empty state | ⏳ Ready for API |
| **4** | `/[lang]/article/[slug]` | Mock Data (`provider.ts`) | `GET /api/v1/articles/:slug?lang={lang}` | Public / Entitlement | Paywall blur card if subscriber-only | ⏳ Ready for API |
| **5** | `/[lang]/editorial` | Mock Data (`provider.ts`) | `GET /api/v1/editorials/today?lang={lang}` | Public | "Editorial in preparation" fallback | ⏳ Ready for API |
| **6** | `/[lang]/editorial/archive`| Mock Data (`provider.ts`) | `GET /api/v1/editorials/archive?year={year}&month={month}`| Public | Date picker, monthly archive accordion | ⏳ Ready for API |
| **7** | `/[lang]/epaper` | Mock Data (`provider.ts`) | `GET /api/v1/epaper/editions/latest`<br>`GET /api/v1/epaper/editions/:id/pages` | Gated (Subscriber Session) | High-res viewer canvas, zoom controls, paywall overlay | ⏳ Ready for API |
| **8** | `/[lang]/panchang` | Mock Data (`is_demo_sample: true`) | `GET /api/v1/panchang/:date?city={city}` | Public | Daily tithi, nakshatra, rahu kaal widgets | ⏳ Ready for API |
| **9** | `/[lang]/events` | Mock Data (`provider.ts`) | `GET /api/v1/events` | Public | Event cards, past archive | ⏳ Ready for API |
| **10**| `/[lang]/about` | Static Dictionary (`en.json`, `gu.json`) | None (Static) | Public | N/A | ✅ Fully Static |
| **11**| `/[lang]/contact` | Static Dictionary + Enquiry Links | None for page display; `POST /api/v1/enquiries/contact` for form | Public | Feedback toast on submit | ⏳ Form Pending |
| **12**| `/[lang]/archive-enquiry` | **Live Service Layer Ready** (`archiveEnquiryService.ts`) | `POST /api/v1/enquiries/archive` | Public (Staff auth for admin management) | Dynamic backend pending notice, inline validation, reference code copy badge | ⚠️ Backend Endpoint Pending |

---

## 3. Detailed API Contract Specification

### 3.1 Archived Information Enquiry APIs

#### Endpoint 1: Public Enquiry Submission
- **Method & URL:** `POST /api/v1/enquiries/archive`
- **Access:** Public (Rate limited: 10 requests / hour / IP)
- **Request Headers:** `Content-Type: application/json`
- **Request Body Schema (Zod Validated):**
  ```json
  {
    "fullName": "Kiritbhai Parekh",
    "contactNumber": "9820012345",
    "email": "kirit.parekh@example.com",
    "publication": "pub-janmabhoomi",
    "year": 1947,
    "infoType": "historical_event",
    "additionalDetails": "Looking for the front-page coverage of Independence Day on August 15, 1947.",
    "preferredContact": "phone",
    "consent": true
  }
  ```
- **Response Format (HTTP 201 Created):**
  ```json
  {
    "success": true,
    "referenceNumber": "AR-2026-8492",
    "message": "Enquiry received successfully. Our archive desk will contact you.",
    "createdAt": "2026-11-11T11:00:00.000Z"
  }
  ```
- **Error Response (HTTP 400 Bad Request):**
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_FAILED",
      "message": "Please enter a valid 10-digit Indian mobile number."
    }
  }
  ```

#### Endpoint 2: Staff Archive Enquiry Management
- **Method & URL:** `GET /api/v1/admin/enquiries/archive?status=PENDING&page=1&limit=20`
- **Access:** Protected (Requires `staff_sessions` cookie + permission `archives:read`)
- **Response Format (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid-1234",
        "referenceNumber": "AR-2026-8492",
        "fullName": "Kiritbhai Parekh",
        "contactNumber": "9820012345",
        "email": "kirit.parekh@example.com",
        "publicationId": "pub-janmabhoomi",
        "publicationName": "Janmabhoomi",
        "year": 1947,
        "infoType": "historical_event",
        "status": "PENDING",
        "assignedStaffName": null,
        "createdAt": "2026-11-11T11:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 14 }
  }
  ```

---

### 3.2 Core News & Headline APIs

#### Endpoint: Get Homepage Aggregated Feed
- **Method & URL:** `GET /api/v1/articles/home?lang=gu`
- **Access:** Public (Cached in Nginx for 60 seconds)
- **Response Format (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "breakingNews": [
        { "id": "uuid-1", "title": "મુંબઈ શેરબજારમાં ઐતિહાસિક ઉછાળો...", "slug": "bse-record-high" }
      ],
      "leadStory": {
        "id": "uuid-2",
        "slug": "lead-story-slug",
        "headline": "સૌરાષ્ટ્ર ટ્રસ્ટ ડિજિટલ મિશન...",
        "summary": "ગુજરાતી વાચકો માટે વિશ્વસનીય પત્રકારિતા...",
        "featuredImageUrl": "/uploads/articles/lead-image.jpg",
        "publishedAt": "2026-11-11T09:30:00.000Z"
      },
      "subLeads": [ ... ],
      "categoryPreviews": [ ... ]
    }
  }
  ```

---

### 3.3 E-Paper Entitlement Check API

#### Endpoint: Verify Reader Entitlement & Fetch Pages
- **Method & URL:** `GET /api/v1/epaper/editions/:id/pages`
- **Access:** Public for preview pages (e.g. Page 1); Gated for remaining pages
- **Request Headers:** `Cookie: reader_session=...` (optional for public preview)
- **Response Format (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "editionId": "uuid-edition",
    "publicationId": "pub-janmabhoomi",
    "editionDate": "2026-11-11",
    "totalPageCount": 16,
    "userHasFullAccess": true,
    "pages": [
      {
        "pageNumber": 1,
        "thumbnailUrl": "/uploads/epaper/20261111/page1-thumb.jpg",
        "highresUrl": "/uploads/epaper/20261111/page1-high.jpg",
        "widthPx": 2400,
        "heightPx": 3600,
        "isLocked": false
      },
      {
        "pageNumber": 2,
        "thumbnailUrl": "/uploads/epaper/20261111/page2-thumb.jpg",
        "highresUrl": "/uploads/epaper/20261111/page2-high.jpg",
        "widthPx": 2400,
        "heightPx": 3600,
        "isLocked": false
      }
    ]
  }
  ```
  *(If reader is not subscribed, pages beyond preview have `highresUrl: null` and `isLocked: true`).*

---

## 4. Systematic Integration Step-by-Step Plan

```
STEP 1: Backend Routes Implementation
   │── Module 8: Articles & Categories endpoints
   │── Module 18: Archive Enquiry submission endpoint
   │── Module 6: Staff authentication & cookie issuance
   ▼
STEP 2: Network & CORS Verification
   │── Set CORS_ORIGIN="http://localhost:3000,https://janmabhoomi-newspaper.vercel.app"
   │── Test OPTIONS preflight requests
   ▼
STEP 3: Author ApiNewsDataProvider
   │── Create src/lib/data/apiProvider.ts implementing INewsDataProvider
   │── Replace mock dataset calls with typed native fetch() requests
   ▼
STEP 4: Switch Singleton Provider
   │── In src/lib/data/provider.ts:
   │   export const newsDataProvider: INewsDataProvider = 
   │     process.env.NEXT_PUBLIC_USE_API === "true" 
   │       ? new ApiNewsDataProvider() 
   │       : new MockNewsDataProvider();
   ▼
STEP 5: End-to-End Regression Verification
   │── Test homepage rendering with zero mock data
   │── Submit test archive enquiry and verify reference code generation
   │── Verify Gujarati and English locale switching
```
