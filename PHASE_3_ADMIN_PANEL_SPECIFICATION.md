# Janmabhoomi Digital Newspaper – Phase 3: Admin Panel (CMS) Specification

**Document Version:** 1.0.0  
**Target Audience:** Editorial Staff, Newspaper Administrators, Executive Management  
**Architecture:** Modern Headless CMS Interface (Next.js / React Admin + Tailwind CSS + Node.js API)

---

## 1. CMS Architecture & Role-Based Access Control (RBAC)

The Janmabhoomi Content Management System (CMS) is the operational hub for Saurashtra Trust's daily newsroom operations. It enforces strict editorial separation of duties across 8 administrative roles.

### 1.1 Role Definitions & Hierarchy

```
                                  [ SUPER ADMIN ]
                           (Trust Management & CTO)
                                      |
                           [ PUBLICATION ADMIN ]
                        (Resident Editor / GM per paper)
                                      |
              +-----------------------+-----------------------+
              |                                               |
          [ EDITOR ]                                   [ AD MANAGER ]
       (Department Chief)                            (Commercial & Banners)
              |                                               |
        [ SUB-EDITOR ]                                 [ SUPPORT REP ]
   (Copy Desk & Gatekeeper)                         (Subscriber Assistance)
              |
        [ REPORTER ]
    (Field / Bureau Staff)
              |
     [ E-PAPER MANAGER ]
    (Pre-Press PDF Ingest)
```

### 1.2 Permissions Matrix

| CMS Capability | Super Admin | Pub Admin | Editor | Sub-Editor | Reporter | E-Paper Mgr | Ad Mgr | Support |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **All Publications Access** | **YES** | Scoped | Scoped | Scoped | Scoped | Scoped | Scoped | Scoped |
| **Create Article Drafts** | **YES** | **YES** | **YES** | **YES** | **YES** | NO | NO | NO |
| **Edit Any Article** | **YES** | **YES** | **YES** | **YES** | Own Only | NO | NO | NO |
| **Direct Publish to Live** | **YES** | **YES** | **YES** | NO | NO | NO | NO | NO |
| **Schedule Articles** | **YES** | **YES** | **YES** | **YES** | NO | NO | NO | NO |
| **Retract / Delete Article**| **YES** | **YES** | **YES** | NO | NO | NO | NO | NO |
| **Publish Editorial Opinion**| **YES** | **YES** | **YES** | NO | NO | NO | NO | NO |
| **Upload & Splice E-Paper**| **YES** | **YES** | NO | NO | NO | **YES** | NO | NO |
| **Draw E-Paper Hotspots** | **YES** | **YES** | NO | NO | NO | **YES** | NO | NO |
| **Manage Display Ads** | **YES** | **YES** | NO | NO | NO | NO | **YES** | NO |
| **View Financial / PayU** | **YES** | **YES** | NO | NO | NO | NO | NO | Read-Only |
| **Grant Subscriber Refunds**| **YES** | **YES** | NO | NO | NO | NO | NO | Ticketed |
| **Manage Staff Accounts** | **YES** | Pub Only| NO | NO | NO | NO | NO | NO |
| **View Audit Trail Logs** | **YES** | **YES** | Read-Only| NO | NO | NO | NO | NO |

---

## 2. The 15 Core CMS Administrative Modules

### Module 1: Executive Dashboard
- **Real-Time Traffic:** Active concurrent readers by publication (Janmabhoomi vs Vyapar vs Phulchhab).
- **Breaking News Alerts:** Banner ticker showing active breaking alerts across mastheads.
- **Publishing Velocity:** Total articles published today vs editorial daily targets.
- **E-Paper Status:** Visual green/amber/red indicators showing whether today's print editions (Mumbai, Rajkot, Bhuj, Surat) have been uploaded, sliced, and verified.
- **Commercial Performance:** Daily PayU digital subscription renewals, net revenue, and active subscriber churn.

### Module 2: Newsroom Article Management
- Filterable news desk queue (`Draft`, `Under Review`, `Approved`, `Scheduled`, `Published`).
- Quick actions: One-click "Make Lead Story", "Mark as Breaking News", "Make Paywalled".
- Publication switcher dropdown (dynamically scoped to staff member's credentials).
- Bulk actions: Category reassignment, batch publish, archive.

### Module 3: Dual-Pane Bilingual Article Editor
- **Side-by-Side Drafting:** Left pane for Gujarati content; right pane for English translation.
- **Gujarati Typing Support:** Built-in phonetic Gujarati transliteration (e.g., typing `janmabhoomi` automatically converts to `જન્મભૂમિ` with standard key combo toggle `Ctrl+G`).
- **Rich Text Controls:** Clean semantic HTML (H2, H3, bold, italic, quotes, embeds for YouTube/X, image captions).
- **SEO & Social Preview Card:** Real-time visual mockup of Google search result snippet and WhatsApp/Facebook Open Graph card in both Gujarati and English.
- **Character & Word Counter:** Localized word count with reading-time estimation.

### Module 4: Category & Taxonomy Manager
- Visual hierarchy tree allowing drag-and-drop reordering of navigation categories.
- Bilingual naming (`name_gu`, `name_en`) and slug management.
- Visibility toggles per publication (e.g., show "Bazaar & Stock" on *Vyapar*, hide on *Kavita*).

### Module 5: Masthead Editorial & Archive
- Daily opinion column management directly linked to Saurashtra Trust's Editor-in-Chief.
- Calendar date picker for backdated historical editorial entry and archival indexing.
- Author attribution with portrait photography and biographic byline.

### Module 6: Special Events & Election Hub
- Create high-impact event hubs (e.g., "Gujarat Assembly Elections", "Diwali Special", "Union Budget").
- Custom banner graphics, landing page intro text, and manual article pinning order.

### Module 7: Multi-Publication Administration
- Configure masthead metadata, historical founding year, official trust contact addresses, and primary editorial bureaus.

### Module 8: E-Paper Ingestion & Production Studio
- **Print PDF Upload Portal:** Drag-and-drop high-resolution print PDF (300 DPI pre-press export).
- **Automated Processing Pipeline:** Status bar monitoring Ghostscript slicing, page-level WebP generation, and thumbnail creation.
- **Interactive Hotspot Drawing Canvas:** Visual zoomable canvas allowing desk operators to draw bounding boxes over newspaper columns, linking them to published digital articles or standalone zoom modal cards.

### Module 9: Advertising & Banner Campaigns
- Schedule desktop and mobile promotional banners across 5 display zones (`header_banner`, `article_sidebar`, `article_in_feed`, `epaper_interstitial`, `footer_banner`).
- Real-time impression and click-through rate (CTR) analytics.
- Date/time scheduling with automatic expiration.

### Module 10: Panchang & Astrological Data Hub
- City-specific daily astronomical data input (Mumbai, Rajkot, Surat, Ahmedabad).
- Bulk CSV/JSON upload for annual calendar schedules (Tithi, Nakshatra, Sunrise, Sunset, Rahukal, Vikram Samvat).
- Festival and public holiday tagging.

### Module 11: Subscriber & User Directory
- Searchable directory of registered readers and paid subscribers by email, mobile number, or name.
- View active devices, current subscription plan, validity expiry date, and login history.
- Manual device session reset (to clear lost or stolen device logins).

### Module 12: Subscription Plan Configurator
- Create and edit commercial offerings (e.g., Janmabhoomi All-Access Annual, Vyapar Digital Monthly).
- Pricing configuration in INR (`₹`), duration in days, and localized bullet points for checkout display.

### Module 13: Payment & Transaction Ledger
- Real-time audit log of all PayU transaction attempts.
- Search by internal reference (`JNB-PAY-...`) or PayU `mihpayid`.
- Color-coded status badges: `SUCCESS` (Green), `INITIATED` (Yellow), `FAILED` (Red), `REFUNDED` (Gray).
- Direct access to raw gateway payload data for discrepancy investigation.

### Module 14: Editorial Reports & Content Performance
- Top performing articles by view count and social shares.
- Journalist productivity tracking (articles written per bureau/reporter per month).
- Popular search queries and zero-result search term logs (identifying content gaps).

### Module 15: Audit Trail & Compliance Log
- Immutable, tamper-evident log capturing all administrative actions.
- Captures timestamp, acting user, IP address, target entity, and before/after JSON diffs.

---

## 3. Editorial Review & Publishing Lifecycle

```
[ REPORTER ]
     |
     v (Draft Created)
+--------------+
|    DRAFT     | <----+ (Changes Requested)
+--------------+      |
     |                |
     v (Submit)       |
+--------------+      |
| UNDER REVIEW | -----+
+--------------+
     |
     v (Sub-Editor Checks Copy & SEO)
+--------------+
|   APPROVED   |
+--------------+
     |
     +----------------------------------+
     |                                  |
     v (Immediate Publish)              v (Scheduled Time)
+--------------+                  +--------------+
|  PUBLISHED   |                  |  SCHEDULED   |
+--------------+                  +--------------+
     |                                  |
     |                                  v (Cron triggers)
     |                            [ PUBLISHED ]
     v (Breaking update / Correction)
+--------------+
|   RETRACTED  |
| / ARCHIVED   |
+--------------+
```

### Publishing Gate Rules:
1. Reporters cannot directly publish to the public website under any circumstance.
2. An article must have a valid Gujarati headline and excerpt before approval can be granted.
3. If an article is flagged as `is_lead_story`, the system automatically prompts whether the previous lead story should be demoted to standard feed priority.
4. When published, an automated edge-cache invalidation hook is dispatched to Cloudflare and Next.js ISR.
