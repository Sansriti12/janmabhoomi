# Janmabhoomi Digital Newspaper – Phase 3: E-Paper System Design

**Document Version:** 1.0.0  
**Target Capabilities:** Multi-Edition Pre-Press Ingestion, Rasterization, Hotspot Mapping, Secure Viewer

---

## 1. End-to-End PDF Ingestion & Processing Pipeline

The E-Paper system transforms high-resolution pre-press editorial PDFs (exported nightly from InDesign/QuarkXPress at Saurashtra Trust's printing presses) into optimized, interactive, paywall-protected web experiences.

```
+-----------------------------------------------------------------------------------+
|                        PRE-PRESS PRODUCTION DESK (NIGHTLY)                        |
|   Uploads Master Edition PDF (e.g. JANMABHOOMI_MUMBAI_20261105.PDF - 120-250MB)   |
+-----------------------------------------------------------------------------------+
                                          |
                        Chunked Multi-part Upload via S3
                                          v
+-----------------------------------------------------------------------------------+
|                           BACKGROUND ASYNC QUEUE (BULLMQ)                         |
|                                                                                   |
|  Step 1: PDF Integrity Check & Color Space Normalization                          |
|          - Validate PDF/X standards, convert CMYK -> sRGB (Ghostscript / poppler) |
|                                                                                   |
|  Step 2: Page-by-Page Slicing                                                     |
|          - Decompose master PDF into isolated single-page vector PDFs             |
|                                                                                   |
|  Step 3: Multi-Resolution High-Fidelity Rasterization (Sharp / Libvips)           |
|          - High-Res Display: 300 DPI WebP (Lossy 85%, ~1.2MB per page)            |
|          - Thumbnail Strip: 150 DPI WebP (Lossy 75%, ~180KB per page)             |
|                                                                                   |
|  Step 4: Vector Text & Column Bounding Box Extraction                             |
|          - Extract embedded PDF text coordinates for search indexing              |
|                                                                                   |
|  Step 5: Cloud Storage & CDN Distribution                                         |
|          - Upload assets to private S3 bucket with strict ACLs                    |
|          - Write page metadata records to PostgreSQL `epaper_pages` table         |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                      HOTSPOT CURATION CANVAS (ADMIN CMS)                          |
|  - Desk editor verifies page order and draws interactive clickable article boxes  |
|  - One-click "Publish Edition" activates edition for web readers                 |
+-----------------------------------------------------------------------------------+
```

### Technical Processing Command Specifications:
- **CMYK to RGB Rasterization (Ghostscript):**
  ```bash
  gs -dNOPAUSE -dBATCH -sDEVICE=png16m -r300 \
     -dTextAlphaBits=4 -dGraphicsAlphaBits=4 \
     -sOutputFile=page_%03d_raw.png input_master.pdf
  ```
- **WebP Optimization (Sharp Node.js worker):**
  - High-res reader view: Max width 2800px, WebP quality 82, effort 4.
  - Thumbnails: Max width 400px, WebP quality 70.

---

## 2. Interactive Hotspot Coordinate Architecture

To provide readers with a digital-first experience on scanned newspaper pages, editors map article bounding boxes using percentage coordinates:

```json
{
  "id": "c1f73b9e-6481-4e78-9f12-098867a12b9a",
  "page_id": "8b320d77-1049-43c2-bf72-468e2195dfb4",
  "coordinates": {
    "x_percent": 12.50,
    "y_percent": 34.20,
    "width_percent": 24.80,
    "height_percent": 18.60
  },
  "headline_text": "મુંબઈ મહાપાલિકાનું નવું અંદાજપત્ર રજૂ",
  "article_id": "90e21a8b-6211-44aa-9c24-5d9f041280ab"
}
```

### Frontend Hotspot Rendering:
- Rendered as absolutely positioned SVG overlay polygons on top of the responsive page image.
- **Hover/Touch State:** Semi-transparent blue highlight (`rgba(37, 99, 235, 0.25)`) with dashed border.
- **Click/Tap Action:** 
  - If linked to `article_id`: Smoothly opens a floating modal showing the cleanly formatted digital text with social sharing options.
  - If standalone hotspot: Opens an isolated high-resolution clipped zoom modal of that specific clipping for easy WhatsApp reading and sharing.

---

## 3. Reader UI & Interaction Specifications

The Next.js E-Paper viewer (`/epaper`) is built to deliver smooth 60fps performance on both desktop 4K monitors and budget Android mobile devices.

### 3.1 Core Viewer Features:
1. **Pinch-to-Zoom & Pan:** Native pointer-event handling allowing smooth zoom from 100% to 400% without image pixelation.
2. **Horizontal Thumbnail Carousel:** Bottom slider displaying all pages with fast thumbnail previews and page jump navigation.
3. **Double-Page Spread on Desktop:** Dual-page side-by-side mode on screens wider than 1440px; single-page continuous scroll on mobile devices.
4. **Calendar & City Edition Switcher:** Quick access to past 30 days of archived editions and switching between Mumbai, Rajkot, Surat, and Bhuj editions.
5. **Full-Screen Immersion:** Native HTML5 Fullscreen API toggle with distraction-free reading controls.

---

## 4. Teaser Policy & Paywall Enforcement Gate

Saurashtra Trust enforces a strict commercial paywall to protect traditional print subscription revenues while onboarding digital readers:

```
+-----------------------------------------------------------------------------------+
|                        JANMABHOOMI E-PAPER ACCESS RULES                           |
+-----------------------------------------------------------------------------------+
| Page 1 (Front Page)     | UNLOCKED (Public Teaser / Lead Stories Accessible)      |
| Page 2 (City / Regional)| UNLOCKED (Sample Preview & Local Community Content)     |
| Page 3 to Last Page     | LOCKED (Requires Verified Subscriber JWT Session)       |
+-----------------------------------------------------------------------------------+
```

### Client-Side Paywall Gate:
- If an unauthenticated user or an expired subscriber attempts to navigate beyond Page 2:
  - Page navigation stops immediately.
  - High-resolution asset fetching is prevented.
  - The paywall gate modal (`id="epaper-subscription-gate"`) smoothly slides up with blurred background styling, presenting the localized subscription options (`/epaper#subscribe`).

### Server-Side Asset Protection:
- High-resolution page images for Pages 3+ are never served from public S3 URLs.
- Image requests pass through a secured API endpoint `/api/v1/epaper/page-asset/:pageId`.
- The endpoint verifies the incoming session JWT and checks `user_subscriptions.status == 'active'` in Redis cache before generating a temporary 60-second pre-signed S3 URL or piping the encrypted image stream.

---

## 5. Digital Rights Management (DRM) & Anti-Scraping Protection

To prevent wholesale scraping or unauthorized redistribution of Saurashtra Trust's intellectual property:
1. **Dynamic Invisible & Visible Watermarking:**
   - Every protected page served to a subscriber dynamically overlays a faint, semi-transparent canvas watermark displaying:
     `Subscriber ID: JNB-78219 | IP: 103.21.xx.xx | 2026-11-05 06:14 AM IST`
   - Deters users from taking full-page screenshots and uploading them to unauthorized WhatsApp or Telegram channels.
2. **Asset Obfuscation:** Page tiles are sliced or served with disabled right-click context menus (`onContextMenu={(e) => e.preventDefault()}`) and CSS user-select restrictions.
3. **Aggressive Token Expiry:** Pre-signed asset URLs expire after 60 seconds and are bound to the originating user's IP address.
