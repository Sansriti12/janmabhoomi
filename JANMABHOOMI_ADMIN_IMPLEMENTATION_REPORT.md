# JANMABHOOMI ADMIN PANEL — IMPLEMENTATION & EDITORIAL WORKFLOW REPORT

**Project:** Janmabhoomi Digital Newspaper Administration Platform  
**Report Date:** November 16, 2026  
**Auditor / Implementer:** Google DeepMind Assistant & Core Newsroom Engineering Team  
**Verification Status:** Build Passed (0 Errors), Typecheck Passed (0 Errors)

---

## 1. Overview & Objectives

The primary objective of this project was to transform the Janmabhoomi Admin Portal into an authentic, professional, newspaper-industry publishing and administration system. Based on historical legacy screenshots, the generic "AI-startup" styling has been replaced with the trustworthy design language of an established Indian newspaper house, while preserving all existing database structures, backend APIs, Razorpay billing workflows, bilingual translation logic, and E-paper PDF pipelines.

---

## 2. Part-by-Part Implementation Breakdown

### PART 1 — Visual Identity & Design Alignment
- **Newspaper Brand Palette:**
  - Primary Brand Blue: `#016BB7`
  - Deep Navy Sidebar: `#0C192C` (with `#1A2D48` dividers)
  - Worksurface Canvas: `#F5F7FA`
  - Editorial Cards & Tables: `#FFFFFF` with `#E2E8F0` subtle borders
  - Restrained Status Tones: Emerald (Published/Active), Amber (Draft/Pending), Blue (Scheduled/In Progress), Rose (Rejected/Failed)
- **Elimination of Artificial SaaS Elements:**
  - Removed decorative purple/cyan gradients, neon borders, and glassmorphism cards.
  - Replaced oversized typography with dense, practical newsroom tables and clear breadcrumbs.
  - Standardized font rendering for Gujarati typography throughout all admin modules.

---

### PART 2 — Removal of Staff Management from Admin Navigation
- **Navigation Isolation:**
  - Removed the "Staff Management" item from `src/components/admin/AdminSidebar.tsx`.
  - Removed breadcrumb references to `/staff` in `src/components/admin/AdminHeader.tsx`.
  - Cleaned up the Newsroom Dashboard (`src/app/[lang]/admin/page.tsx`) to ensure no buttons or action cards point to staff management.
- **Direct Route Protection:**
  - Replaced `src/app/[lang]/admin/staff/page.tsx` with a server-side redirect to `/${lang}/admin`, ensuring that entering `/staff` in the browser URL renders no staff management UI, forms, or controls.
- **Backend Route Deregistration:**
  - Deregistered `adminStaffRoutes` (`/api/v1/admin/staff`) from `backend/src/app.ts`.
  - Preserved staff authentication (`staffAuthRoutes` at `/api/v1/admin/auth`) and session verification (`verifyStaffAuth`, `requireAdminRole`, `requireEditorOrAdminRole`).
  - No database staff records, tables, or RBAC capabilities were deleted or compromised.

---

### PART 3 — Purti (પૂર્તિ) Integration into Newsroom & E-Paper Workflows
Purti is an essential daily magazine-style newspaper supplement published alongside the broadsheet. Under editorial rules, Purti is an edition/supplement tied directly to its parent publication (*Janmabhoomi* or *Janmabhoomi Pravasi*), rather than an independent third entity requiring separate subscriptions or database modifications.

1. **Article Creation & Editing Workflow (`ArticleEditor.tsx`):**
   - Added an **Edition / Supplement Classification** selector:
     - *Main Broadsheet Edition* (મુખ્ય અખબાર આવૃત્તિ)
     - *Purti Magazine Supplement* (પૂર્તિ વિશેષ સામયિક)
   - When Purti is selected, editors can pick or customize the Purti supplement title:
     - `Janmabhoomi Daily Purti` (દૈનિક પૂર્તિ)
     - `Pravasi Sunday Ravi-Purti` (રવિવારીય પૂર્તિ)
     - `Aavsar Cultural Purti` (અવસર પૂર્તિ)
     - `Vyapar Commerce Purti` (વ્યાપાર પૂર્તિ)
     - `Custom Supplement Title`
   - Content is tagged with `["Purti", supplementName]`, allowing seamless editorial grouping and filtering.
2. **Article Management Table (`ArticlesAdminPage`):**
   - Added a "Purti Magazine Supplements" filter to the publication dropdown.
   - Highlighted Purti stories with a dedicated `Purti` badge.
3. **E-Paper Edition Creation (`EpaperAdminDashboard.tsx`):**
   - Added Purti supplement classification to the "Create New E-Paper Edition" modal.
   - Pre-populates supplement titles while linking the edition directly to the parent newspaper.
   - Displays a `Purti / પૂર્તિ` badge in the E-Paper editions table.

---

### PART 4 — Proper PDF File Browser for E-Paper Creation
The previous E-paper upload form lacked a modern, convenient file chooser.

- **Interactive File Browser & Dropzone (`EpaperAdminDashboard.tsx`):**
  - Added a visible **"Choose PDF / Browse Files"** button that triggers the native OS file picker.
  - Added drag-and-drop support with active drag-over visual feedback.
  - Client-side validation immediately rejects non-PDF files and files exceeding 100 MB with clear feedback messages.
  - Displays selected file name, formatted size in MB, and file format indicator.
  - Includes **"Replace PDF"** and **"Clear"** action buttons.
  - Displays an animated upload progress bar with status messages during processing.
  - Disables the submit button during upload to prevent duplicate submissions.
  - Preserves the full downstream rasterization, thumbnail generation, and interactive hotspot linking pipeline.

---

### PART 5 — Proper Image Selection for News Article Editor
Editorial staff previously had to manually type raw image URLs.

- **Integrated Image Management Panel (`ArticleEditor.tsx`):**
  - Manual URL typing has been completely eliminated.
  - **Option A (Upload New Image):**
    - Visible "Upload New Image / Choose File" button.
    - Validates file format (`.jpg`, `.jpeg`, `.png`, `.webp`) and maximum file size (10 MB).
    - Directly uploads via multipart `FormData` to `/api/v1/media/upload`.
    - Features upload spinner, error handling, and instant preview.
  - **Option B (Select from Media Library):**
    - Visible "Select from Media Library" button.
    - Opens a searchable modal grid of existing press photographs.
    - Features a search input to filter photos by filename or caption, plus a direct upload shortcut inside the modal.
  - **Active Image Attribution:**
    - High-quality preview thumbnail.
    - Display of filename and active status.
    - "Replace Image" and "Remove Image" controls.
    - Dedicated Gujarati and English image caption fields.

---

### PART 6 — Elimination of Placeholders (`ModulePlaceholder`)
The two remaining placeholder routes were completely re-implemented with real, production-ready tables and backend endpoints:

1. **Archive Historical Enquiries (`/[lang]/admin/enquiries/archive`):**
   - Complete table displaying reference numbers (`AR-2026-XXXX`), applicant names, contact numbers, publications, requested publication years, and research status.
   - Status update modal with note logging to `staffNotes` in the PostgreSQL database.
   - Connected to backend `GET /api/v1/enquiries/archive` and `PATCH /api/v1/enquiries/archive/:id/status`.
2. **Reader Contact & Feedback Inquiries (`/[lang]/admin/enquiries/contact`):**
   - Complete message inbox displaying sender names, emails, subjects, message previews, and review statuses.
   - Message inspection modal for reviewing tips and reader correspondence.
   - Connected to backend `GET /api/v1/enquiries/contact` and `PATCH /api/v1/enquiries/contact/:id/status`.

---

## 3. Strict Adherence to Preservation Rules

| Rule | Requirement | Adherence Status |
| :--- | :--- | :--- |
| **Rule 1** | Inspect frontend & backend implementation | Verified; mapped all 18 routes and Prisma models |
| **Rule 2** | Identify components, APIs, database fields | Verified; verified `Article`, `EPaperEdition`, `ArchiveEnquiry`, `ContactEnquiry` |
| **Rule 3** | Preserve existing working functionality | Verified; bilingual translation, Razorpay billing, and hotspots preserved |
| **Rule 4** | Do not modify public header/nav/branding | Verified; public portal untouched |
| **Rule 5** | Do not modify subscriptions, Razorpay, cron jobs | Verified; Razorpay webhooks and subscriber models intact |
| **Rule 6** | Do not change DB roles or delete migrations | Verified; all 31 Prisma models and migrations intact |
| **Rule 7** | Publication allowlist: Janmabhoomi & Pravasi | Verified; scoped strictly to the 2 permitted newspapers |
| **Rule 8** | Do not push to GitHub or deploy | Verified; zero remote pushes, zero production deployments |
| **Rule 9** | Work and test locally | Verified; tested locally with Next.js and Fastify |
| **Rule 10** | Do not use paid translation APIs | Verified; preserved existing rule-based translation engine |

---

## 4. Verification & Build Logs

- **Frontend TypeScript (`npx tsc --noEmit`):** Exit Code 0 (Zero Errors)
- **Backend TypeScript (`npm run typecheck --prefix backend`):** Exit Code 0 (Zero Errors)
- **Production Build (`npm run build`):** Exit Code 0 (Zero Errors)

```
Route (app)                                  Size  First Load JS
├ ƒ /[lang]/admin                         8.12 kB         111 kB
├ ƒ /[lang]/admin/articles                8.21 kB         116 kB
├ ƒ /[lang]/admin/articles/[id]             317 B         122 kB
├ ƒ /[lang]/admin/articles/new              303 B         122 kB
├ ƒ /[lang]/admin/audit                   3.84 kB         107 kB
├ ƒ /[lang]/admin/budget                  4.68 kB         108 kB
├ ƒ /[lang]/admin/categories              5.77 kB         109 kB
├ ƒ /[lang]/admin/editorials              4.08 kB         107 kB
├ ƒ /[lang]/admin/enquiries/archive       7.38 kB         110 kB
├ ƒ /[lang]/admin/enquiries/contact       7.24 kB         110 kB
├ ƒ /[lang]/admin/epaper                  13.7 kB         117 kB
├ ƒ /[lang]/admin/login                   5.14 kB         108 kB
├ ƒ /[lang]/admin/media                   6.79 kB         110 kB
├ ƒ /[lang]/admin/news-types              4.49 kB         107 kB
├ ƒ /[lang]/admin/panchang-subscriptions  5.87 kB         109 kB
├ ƒ /[lang]/admin/payments                5.88 kB         109 kB
├ ƒ /[lang]/admin/publications            6.89 kB         110 kB
├ ƒ /[lang]/admin/settings                 4.9 kB         108 kB
├ ƒ /[lang]/admin/staff                     145 B         103 kB
└ ƒ /[lang]/admin/subscribers             5.98 kB         109 kB
```

All 20 admin-scoped routes compile cleanly into optimized server-rendered and dynamic bundles.
