# JANMABHOOMI DIGITAL NEWSPAPER
## BACKEND API INTEGRATION SPECIFICATION

**Document Version:** 1.0.0  
**Status:** Approved Architectural Specification  
**Target:** Company Server Backend & CMS Team  
**Standard:** RESTful JSON over HTTPS  

---

### 1. Architectural Strategy

The frontend application communicates with the data layer via the `INewsDataProvider` abstraction in `src/lib/data/provider.ts`. In Phase 2, this is backed by `MockNewsDataProvider`. In Phase 3, when the Saurashtra Trust server is commissioned, the team will implement `ApiNewsDataProvider` implementing the identical interface:

```typescript
// Future Phase 3 Adapter
export class ApiNewsDataProvider implements INewsDataProvider {
  private baseUrl = process.env.API_BASE_URL || 'https://api.janmabhoomi.in/v1';

  async getArticleBySlug(slug: string, publicationId?: string): Promise<NewsArticle | undefined> {
    const res = await fetch(`${this.baseUrl}/articles/${slug}?publicationId=${publicationId || 'pub-janmabhoomi'}`, {
      next: { revalidate: 60 }
    });
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  }
  // ...other methods
}
```

---

### 2. Standard Request & Response Envelopes

#### 2.1 Standard Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-03T10:30:00+05:30",
    "version": "1.0",
    "cached": true
  }
}
```

#### 2.2 Standard Paginated Envelope
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 420,
    "page": 1,
    "limit": 10,
    "totalPages": 42,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 2.3 Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "ARTICLE_NOT_FOUND",
    "message": "The requested article slug does not exist.",
    "details": { "slug": "invalid-slug-123" }
  }
}
```

---

### 3. API Endpoints Specification

#### 3.1 Articles Endpoints

##### `GET /api/v1/articles`
Fetches a paginated list of articles filtered by category, publication, or date.

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `publicationId` | `string` | No | Default: `pub-janmabhoomi`. |
| `category` | `string` | No | Category slug (`national`, `city`, `business`, etc.). |
| `isBreaking` | `boolean`| No | Filters breaking news articles. |
| `isLeadStory`| `boolean`| No | Filters lead story articles. |
| `search` | `string` | No | Full-text search keyword in English or Gujarati. |
| `page` | `number` | No | Page number (default: 1). |
| `limit` | `number` | No | Results per page (default: 10, max: 50). |

**Sample Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "jb-lead-01",
      "slug": "western-maritime-economic-corridor-gujarat-maharashtra-port-linkage",
      "publicationId": "pub-janmabhoomi",
      "category": "national",
      "categoryLabel": { "en": "National", "gu": "રાષ્ટ્રીય" },
      "title": {
        "en": "Western Maritime Economic Corridor: Unified Coastal Expressway to Link Ports Across Gujarat and Maharashtra",
        "gu": "વેસ્ટર્ન મેરિટાઇમ ઇકોનોમિક કોરિડોર: ગુજરાત અને મહારાષ્ટ્રના બંદરોને જોડતો ૬૦૦ કિ.મી. દરિયાઈ એક્સપ્રેસવે મંજૂર"
      },
      "summary": {
        "en": "Inter-state infrastructure council clears ₹42,000 crore project to boost container logistics.",
        "gu": "આંતરરાજ્ય ઇન્ફ્રાસ્ટ્રક્ચર કાઉન્સિલે ₹૪૨,૦૦૦ કરોડના બહુઆયામી લોજિસ્ટિક્સ પ્રોજેક્ટને આખરી મંજૂરી આપી."
      },
      "publishedAt": "2026-11-03T07:00:00+05:30",
      "imageUrl": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
      "readTimeMinutes": 4
    }
  ],
  "meta": { "total": 120, "page": 1, "limit": 10 }
}
```

---

##### `GET /api/v1/articles/:slug`
Fetches a single article by its unique URL slug.

**Path Parameters:**
- `slug`: Unique article slug.

**Response Status Codes:**
- `200 OK`: Article found.
- `404 Not Found`: Article does not exist.

---

#### 3.2 Homepage Hero Slot Endpoint

##### `GET /api/v1/homepage/hero`
Fetches curated stories structured specifically for Section 1 of the homepage.

**Sample Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leadStory": { "id": "jb-lead-01", "slug": "western-maritime-economic-corridor-..." },
    "subLeadStories": [
      { "id": "jb-sub-01", "slug": "bse-gujarat-business-conclave-msme-credit-fund" },
      { "id": "jb-sub-02", "slug": "mumbai-suburban-railway-air-conditioned-local-expansion" }
    ],
    "headlineBriefs": [
      { "id": "jb-brief-01", "slug": "saurashtra-groundwater-recharge-narmada-canal-network" },
      { "id": "jb-brief-02", "slug": "kandla-deendayal-port-cargo-handling-record" },
      { "id": "jb-brief-03", "slug": "rajkot-cricket-stadium-renovation-ranji-trophy" },
      { "id": "jb-brief-04", "slug": "gujarati-natak-centenary-archival-exhibition-mumbai" }
    ]
  }
}
```

---

#### 3.3 Editorial (*અગ્રલેખ*) Endpoints

##### `GET /api/v1/editorial/today`
Fetches today's institutional leading editorial.

##### `GET /api/v1/editorial/archive`
Fetches paginated list of archived editorials sorted by `editionDate` descending.

---

#### 3.4 Panchang & Choghadiya Endpoint

##### `GET /api/v1/panchang/:city`
Fetches astronomical calculations and day/night choghadiyas for a designated city.

**Path Parameters:**
- `city`: `mumbai` | `ahmedabad` | `rajkot`.

**Sample Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "editionCity": { "en": "Mumbai Edition", "gu": "મુંબઈ આવૃત્તિ" },
    "date": "2026-11-03",
    "vikramSamvat": { "en": "Vikram Samvat 2082 • Kartak Vad Nom", "gu": "વિ.સં. ૨૦૮૨ • કારતક વદ નોમ" },
    "tithi": { "en": "Vad Nom (09th Waxing Tithi)", "gu": "વદ નોમ (બપોરે ૦૨:૪૧ સુધી)" },
    "nakshatra": { "en": "Magha Nakshatra", "gu": "મઘા નક્ષત્ર (સાંજે ૦૬:૧૮ સુધી)" },
    "yoga": { "en": "Shukla Yoga • Gar Karana", "gu": "શુક્લ યોગ • ગર કરણ" },
    "sunrise": "06:38 AM",
    "sunset": "06:04 PM",
    "rahuKaal": "03:00 PM – 04:30 PM",
    "choghadiya": {
      "day": [
        { "name": { "en": "Rog", "gu": "રોગ" }, "quality": "bad", "timing": "06:38 – 08:04 AM" },
        { "name": { "en": "Udveg", "gu": "ઉદ્વેગ" }, "quality": "bad", "timing": "08:04 – 09:29 AM" },
        { "name": { "en": "Char", "gu": "ચલ" }, "quality": "neutral", "timing": "09:29 – 10:55 AM" },
        { "name": { "en": "Labh", "gu": "લાભ" }, "quality": "good", "timing": "10:55 – 12:21 PM" },
        { "name": { "en": "Amrut", "gu": "અમૃત" }, "quality": "good", "timing": "12:21 – 01:47 PM" },
        { "name": { "en": "Kaal", "gu": "કાળ" }, "quality": "bad", "timing": "01:47 – 03:12 PM" },
        { "name": { "en": "Shubh", "gu": "શુભ" }, "quality": "good", "timing": "03:12 – 04:38 PM" },
        { "name": { "en": "Rog", "gu": "રોગ" }, "quality": "bad", "timing": "04:38 – 06:04 PM" }
      ],
      "night": [ ... ]
    }
  }
}
```

---

#### 3.5 E-Paper Broadsheet Endpoints

##### `GET /api/v1/epaper/editions/latest`
Returns metadata of the latest printed replica edition and broadsheet page index.

##### `GET /api/v1/epaper/editions/:date`
Fetches a specific past broadsheet edition by `YYYY-MM-DD`.

---

### 4. Caching & Performance Headers

To ensure high-throughput low-latency delivery during major breaking news events, the server API must expose standard HTTP caching directives:

| Endpoint Type | Cache-Control Header | Revalidation Strategy |
| :--- | :--- | :--- |
| Breaking News | `public, max-age=15, stale-while-revalidate=45` | Short TTL for immediacy |
| Homepage Hero | `public, max-age=60, stale-while-revalidate=180` | ISR 1-minute caching |
| Category Feeds | `public, max-age=120, stale-while-revalidate=300` | 2-minute caching |
| Single Article | `public, max-age=300, stale-while-revalidate=600` | 5-minute caching |
| Panchang | `public, max-age=86400, s-maxage=86400` | Daily cache (midnight invalidation) |
| E-Paper Index | `public, max-age=3600, s-maxage=3600` | Hourly cache |

---

### 5. Security & Authentication Roadmap (Phase 3)

1. **Public Read-Only API:** No API keys or authorization headers required for public article teasers, category listings, and daily Panchang.
2. **Subscriber Entitlement API:** In Phase 3, broadsheet full-page PDF streams will require an `Authorization: Bearer <subscriber_jwt>` token verified against Saurashtra Trust's central subscriber registry.
3. **Admin CMS API:** Content ingestion and publishing will occur via internal endpoints secured by Role-Based Access Control (RBAC).
