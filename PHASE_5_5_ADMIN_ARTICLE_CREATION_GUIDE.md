# JANMABHOOMI — PHASE 5.5 ADMIN PANEL ARTICLE CREATION GUIDE

**Document Type:** Manual Testing Instructor Guide  
**Subsystem:** Newsroom CMS & Bilingual Editorial Workflow  
**Phase:** 5.5 Local End-to-End Testing  
**Date:** November 13, 2026  
**Auditor / Instructor:** Antigravity AI  

---

## PART 1 — ADMIN PANEL SPECIFICATION & WORKFLOW

### 1. Admin Login URL
- **English Interface:** `http://localhost:3000/en/admin/login`
- **Gujarati Interface:** `http://localhost:3000/gu/admin/login`

### 2. Login Procedure
1. Open Google Chrome or your preferred browser and navigate to `http://localhost:3000/en/admin/login`.
2. In the **Email Address** field, enter the administrator email:
   `admin@janmabhoomi.in`
3. In the **Password** field, enter your administrator master secret:
   *(Enter your local master password `AdminSuperSecret@2026!`)*
4. Click the blue **"Sign In"** button (or press `Enter`).
5. Upon successful authentication, the system sets an HTTP-only session cookie / bearer token in local storage and redirects you to the Admin Dashboard at `http://localhost:3000/en/admin`.

---

### 3. Navigation to News Article Creation Page
1. Look at the left navigation sidebar (**AdminSidebar**).
2. Under the **"Editorial & Content"** section, click on **"Articles"** (icon: `FileText`, route: `/en/admin/articles`).
3. On the Articles list page, look at the top right header.
4. Click the blue **"+ New Article"** button (in Gujarati: **"+ નવો લેખ"**).
5. The browser opens the Article Editor at `http://localhost:3000/en/admin/articles/new`.

---

### 4. Article Editor Field Reference

The Article Editor is divided into three key areas:
- **Top Metadata Bar:** Publication, Category, E-Paper Page, Schedule, and Priority toggles.
- **Featured Image Bar:** Image URL input and Media Library picker.
- **Dual-Pane Bilingual Editor:** Left pane for Gujarati authoritative source; Right pane for English translation.

| UI Field / Label | Source Code Identifier | Type | Required? | Purpose & Behavior |
|---|---|---|---|---|
| **Publication** (`પ્રકાશન (અખબાર)`) | `publicationId` | Select Dropdown | **Mandatory** | Scoped strictly to `Janmabhoomi — જન્મભૂમિ (દૈનિક સાંજ)` (`pub-janmabhoomi`) or `Janmabhoomi Pravasi — પ્રવાસી (રવિવારીય)` (`pub-pravasi`). |
| **Category** (`સમાચાર કેટેગરી`) | `categoryId` | Select Dropdown | **Mandatory** | Selects the news section (e.g. `National`, `International`, `Gujarat`, `Mumbai`, `Business`, `Sports`, etc.). |
| **E-Paper Page #** (`ઇ-પેપર પાનું ક્રમાંક`) | `epaperPageNumber` | Number Input | Optional | Broadsheet page reference (e.g. `1`, `3`, `5`). Leave blank for web-only stories. |
| **Schedule Publication** (`નિયત સમય પ્રકાશન`) | `scheduledFor` | DateTime Input | Optional | Pick future date and time for delayed publication via background scheduler. |
| **Breaking** (`બ્રેકિંગ ન્યૂઝ`) | `isBreaking` | Checkbox | Optional | When checked, displays article headline in the red homepage Breaking News ticker. |
| **Lead Story** (`મુખ્ય સમાચાર (Lead)`) | `isLeadStory` | Checkbox | Optional | When checked, pins the article into the primary hero slot on the homepage. |
| **Paywalled** (`પેવૉલ ટીઝર`) | `isPaywalled` | Checkbox | Optional | When checked, displays paywall badge and restricts full reading for non-subscribers. |
| **Featured Image URL** (`મુખ્ય છબી`) | `featuredImageUrl` | URL Text Input | Optional | Web image URL (`https://...`) or selected path from the Media Library. |
| **Browse Media** (`મીડિયા લાઇબ્રેરી`) | Button (`openMediaPicker`) | Modal Trigger | Optional | Opens thumbnail grid modal of uploaded news photos in `storage/media`. |
| **Gujarati Headline \*** (`સમાચાર શીર્ષક`) | `headlineGu` | Single-line Input | **Mandatory** | Authoritative Gujarati headline. Must be at least 5 characters. |
| **Gujarati Summary \*** (`સમાચાર સારાંશ`) | `summaryGu` | Textarea (3 rows) | **Mandatory** | Authoritative Gujarati deck/teaser. Must be at least 10 characters. |
| **Gujarati Article Body \*** (`સંપૂર્ણ સમાચાર વિષયવસ્તુ`) | `contentHtmlGu` | Textarea (12 rows) | **Mandatory** | Complete Gujarati article text. Must be at least 20 characters. Separate paragraphs with a blank line. |
| **English Headline** (`અંગ્રેજી શીર્ષક`) | `headlineEn` | Single-line Input | Editable | Populated by translation engine. Editable by editor. |
| **English Summary** (`અંગ્રેજી સારાંશ`) | `summaryEn` | Textarea (3 rows) | Editable | Populated by translation engine. Editable by editor. |
| **English Article Body** (`અંગ્રેજી વિષયવસ્તુ`) | `contentHtmlEn` | Textarea (12 rows) | Editable | Populated by translation engine. Editable by editor. Paragraphs preserved. |
| **Re-translate** (`ફરી અનુવાદ કરો`) | Button | Action | Trigger | Re-invokes translation engine on latest Gujarati text. |
| **Preview** (`પૂર્વાવલોકન`) | Button | Modal Trigger | Trigger | Opens split-screen side-by-side preview modal showing how cards look in both languages. |
| **Save Draft** (`ડ્રાફ્ટ સાચવો`) | Button | Primary Action | Trigger | Saves Gujarati source and auto-translates/updates English without publishing. |
| **Publish Now** (`હવે પ્રકાશિત કરો`) | Button (Emerald) | Direct Publish | Trigger | Sets status to `PUBLISHED` immediately and makes article live. |

---

### 5. Mandatory vs Optional Field Breakdown
- **Mandatory Fields:**
  1. `Publication` (default: Janmabhoomi)
  2. `Category` (default: National)
  3. `Gujarati Headline` (>= 5 chars)
  4. `Gujarati Summary` (>= 10 chars)
  5. `Gujarati Article Body` (>= 20 chars)
- **Optional Fields:**
  1. `Featured Image URL` (if left blank, safe category fallbacks apply)
  2. `E-Paper Page #`
  3. `Schedule Publication`
  4. Priority toggles (`Breaking`, `Lead Story`, `Paywalled`)

---

### 6. Selecting Publication and Category
- In the **Publication** dropdown, ensure **`Janmabhoomi — જન્મભૂમિ (દૈનિક સાંજ)`** is selected.
- In the **Category** dropdown, select **`National (national)`**.

---

### 7. Uploading or Selecting a Featured Image
You have two straightforward methods:
- **Method A (Direct Image URL - Recommended for this test):**  
  Copy and paste this high-resolution Unsplash solar energy test image directly into the **Featured Image URL** input:
  ```
  https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80
  ```
  *Notice that as soon as the URL is entered, a thumbnail preview appears immediately to the right of the input.*
- **Method B (Media Library):**  
  Click the **"Browse Media"** button to open the modal. If images exist, click any card to select.

---

### 8. Saving a Gujarati Draft
1. Enter the Gujarati Headline, Summary, and Article Body in the **Left Pane** (see sample content in Part 2).
2. Click the white **"Save Draft"** button with the disk icon in the top right action bar.
3. The button displays *"Saving..."* while communicating with `POST /api/v1/admin/articles`.
4. Upon save, the URL seamlessly updates from `/admin/articles/new` to `/admin/articles/[articleId]`.
5. The badge at the top confirms **`DRAFT`** (`ડ્રાફ્ટ`).
6. The backend simultaneously executes the automated translation engine and populates the **Right Pane** with English content.

---

### 9. Generating English Translation
- When you save a new draft, the translation engine executes automatically.
- If you edit the Gujarati text later, you can re-generate the English translation at any time by clicking the green **"Re-translate"** (`ફરી અનુવાદ કરો`) button with the sparkle icon at the top of the English pane.
- The button will display a spinning indicator (*"Translating..."*) and update the English fields while running automated fact and quality checks.

---

### 10. Editing and Saving the English Translation
1. In the **Right Pane** (English Translation), click directly into any of the three fields:
   - **English Headline**
   - **English Summary**
   - **English Article Body**
2. Modify or refine any wording.
3. Notice that as soon as you type in the English fields, an amber badge appears: **`Manually Edited`** (`સંપાદિત`).
4. Click **"Save Draft"** to persist your manual English edits.

---

### 11. Previewing the Article
1. In the top action bar, click the **"Preview"** (`પૂર્વાવલોકન`) button with the eye icon.
2. An elegant split-screen modal appears displaying:
   - Featured image banner at the top.
   - Left column: Gujarati source with rendered paragraphs.
   - Right column: English translated version with rendered paragraphs.
3. Click the **✕** button at top right to close the preview modal.

---

### 12. Publishing the Article Immediately
1. In the top action bar, click the green **"Publish Now"** (`હવે પ્રકાશિત કરો`) button.
2. The button displays *"Publishing..."*.
3. The article status badge turns blue: **`PUBLISHED`** (`પ્રકાશિત`).
4. A green notification appears: *"Article published successfully!"* (`લેખ સફળતાપૂર્વક પ્રકાશિત થયો!`).
5. You are redirected to the Articles List page (`/en/admin/articles`), where the new article appears with a green `Published` status pill.

---

### 13. Scheduling an Article (Alternative Workflow)
1. If you wish to test scheduling instead of immediate publication:
2. In the **Schedule Publication** input, click the calendar icon and select a time **2 to 3 minutes in the future**.
3. Click the purple **"Schedule"** (`શેડ્યૂલ`) button.
4. The article status badge displays **`SCHEDULED`**.
5. The Fastify backend background publisher checks scheduled articles every 30 seconds and automatically flips the status to **`PUBLISHED`** when the scheduled timestamp arrives.

---

### 14. Verifying on Public Websites
Once published, verify that the article renders cleanly on the public site:
1. **Public Gujarati Homepage:** Navigate to `http://localhost:3000/gu`. The article appears under the National category or Latest News.
2. **Public English Homepage:** Navigate to `http://localhost:3000/en`. The article appears with its English headline and teaser.
3. **National Category Page:** Visit `http://localhost:3000/gu/category/national` and `http://localhost:3000/en/category/national`.
4. **Article Detail Page:** Click the article card to open `http://localhost:3000/gu/article/[slug]`. Verify headline, published date, author badge, image, and body paragraphs. Switch language to English via the header button to verify the English translation.

---

## PART 2 — SAMPLE TEST CONTENT (FICTIONAL & HARMLESS)

> [!IMPORTANT]
> This content is strictly fictional, created exclusively for Phase 5.5 local verification. It contains test markers and verifiable numeric facts (e.g., *₹500 crore*, *750 megawatts*) to rigorously test the translation engine's fact-matching algorithm.

### Target Metadata
- **Publication:** Janmabhoomi (`pub-janmabhoomi`)
- **Category:** National (`national`)
- **E-Paper Page #:** `1`
- **Toggles:** Turn ON **`Lead Story`** (`મુખ્ય સમાચાર`), Leave OFF `Breaking`.
- **Featured Image URL:**
  ```
  https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80
  ```

---

### A. GUJARATI SOURCE (ENTER THIS INTO LEFT PANE FIRST)

#### Gujarati Headline:
```text
[ટેસ્ટ કન્ટેન્ટ] ગુજરાતમાં ૫૦૦ કરોડ રૂપિયાના ખર્ચે નવો સોલાર એનર્જી પાર્ક સ્થાપવાની જાહેરાત
```

#### Gujarati Summary:
```text
રાજ્ય સરકારે સ્વચ્છ ઊર્જા ક્ષેત્રે ૭૫૦ મેગાવોટ ક્ષમતા ધરાવતો વિશાળ સોલાર પ્રોજેક્ટ મંજૂર કર્યો છે, જેનાથી ૨૦૨૭ સુધીમાં હજારો નાગરિકોને પર્યાવરણને અનુકૂળ વીજળી મળશે.
```

#### Gujarati Article Body (Paste exactly with blank lines between paragraphs):
```text
ગાંધીનગર ખાતે યોજાયેલી ઉચ્ચ સ્તરીય બેઠકમાં નવીનીકરણીય ઊર્જાના વિકાસ માટે ૫૦૦ કરોડ રૂપિયાના રોકાણ સાથે અદ્યતન સોલાર પાર્કની યોજનાને સત્તાવાર મંજૂરી આપવામાં આવી છે. આ મહત્વાકાંક્ષી પરિયોજના હેઠળ ૭૫૦ મેગાવોટ વીજ ઉત્પાદન કરવાનો લક્ષ્યાંક રાખવામાં આવ્યો છે.

મુંબઈ અને અમદાવાદ વચ્ચેના ઔદ્યોગિક કોરિડોરને ધ્યાનમાં રાખીને આ પ્લાન્ટ સ્થાપવામાં આવશે. આ પ્રોજેક્ટના પ્રથમ તબક્કાનું નિર્માણ કાર્ય આગામી માર્ચ ૨૦૨૭ સુધીમાં પૂર્ણ કરવામાં આવશે. આ પ્રોજેક્ટથી સ્થાનિક સ્તરે અંદાજે ૧૨૦૦ જેટલી નવી રોજગારીની તકોનું સર્જન થશે.

નિષ્ણાતોના જણાવ્યા અનુસાર આ પહેલથી કાર્બન ઉત્સર્જનમાં વાર્ષિક ૧૫ ટકાનો ઘટાડો નોંધાશે. આ યોજના રાષ્ટ્રીય સ્વચ્છ ઊર્જા મિશન હેઠળ ૮૫ ટકા સબસિડી સહાય સાથે અમલમાં મૂકવામાં આવી રહી છે.

સૌરાષ્ટ્ર અને કચ્છના રણ વિસ્તારમાં પ્રાકૃતિક સૂર્યપ્રકાશનો મહત્તમ લાભ લઈને ઊર્જા ક્ષેત્રે આત્મનિર્ભરતા હાંસલ કરવા માટે આ પગલું ઐતિહાસિક સાબિત થશે તેવો વિશ્વાસ વ્યક્ત કરવામાં આવ્યો છે.
```

#### Gujarati Image Caption:
```text
ગુજરાતના સૂચિત સોલાર પાર્કની કલ્પનાશીલ ઝાંખી (પ્રતિકાત્મક તસવીર - ટેસ્ટ)
```

---

### B. SUGGESTED ENGLISH REFERENCE (FOR COMPARISON & EDITING)

*(Keep this ready to compare against the automated translation generated in the Right Pane, or to paste in during the translation editing step)*

#### Suggested English Headline:
```text
[TEST CONTENT] Gujarat Announces New Rs 500 Crore Solar Energy Park
```

#### Suggested English Summary:
```text
The state government has approved a massive 750 MW clean energy project to provide eco-friendly electricity to thousands of citizens by 2027.
```

#### Suggested English Article Body:
```text
In a high-level meeting held at Gandhinagar, official approval was granted for an advanced solar park with an investment of Rs 500 crore for renewable energy development. This ambitious project aims to generate 750 megawatts of electricity.

The plant will be established taking into account the industrial corridor between Mumbai and Ahmedabad. The first phase of construction is scheduled for completion by March 2027. The project will generate approximately 1,200 new employment opportunities locally.

According to experts, this initiative will register a 15 percent annual reduction in carbon emissions. The scheme is being implemented with 85 percent subsidy assistance under the National Clean Energy Mission.

Confidence was expressed that this step will prove historic in achieving energy self-reliance by harnessing natural sunlight across Saurashtra and Kutch.
```

#### English Image Caption:
```text
Conceptual view of the proposed solar park in Gujarat (Representative Image - Test)
```

#### Suggested SEO Metadata & Tags:
- **SEO Meta Title:** `Gujarat 500 Crore Solar Energy Park Project | Janmabhoomi Test`
- **SEO Meta Description:** `Gujarat announces 750 MW solar energy park with Rs 500 crore investment to boost green power by 2027.`
- **Tags:** `Solar Energy, Clean Energy, Gujarat, Renewable Power, National, Test Content`

---

## PART 3 — STEP-BY-STEP TESTING CHECKPOINTS

Follow each checkpoint sequentially during your manual browser testing.

### Checkpoint 1: Administrator Authentication
- **Action:** Open `http://localhost:3000/en/admin/login`, enter credentials, click **"Sign In"**.
- **Expected View:** Immediate redirect to `/en/admin` dashboard displaying platform summary cards.
- **Success Criteria:** HTTP 200, header shows administrator profile name and badge (`Admin`).
- **Failure Indicator:** Error banner *"Invalid email or password"*, or remaining stuck on `/login`.
- **Evidence to Capture:** Screenshot of `/en/admin` dashboard with sidebar navigation visible.

---

### Checkpoint 2: Opening Newsroom Article Editor
- **Action:** Click **"Articles"** in sidebar, then click **"+ New Article"** button.
- **Expected View:** Dual-pane editor at `/en/admin/articles/new`. Top badge reads **`DRAFT`** (`ડ્રાફ્ટ`).
- **Success Criteria:** Left pane titled *"Gujarati Original (Source)"* with version `v1`; Right pane titled *"English Translation (Bilingual)"*.
- **Failure Indicator:** Blank white page, or 404/500 error.
- **Evidence to Capture:** Screenshot of the empty Dual-Pane Editor.

---

### Checkpoint 3: Entering Gujarati Content & Saving Draft
- **Action:**
  1. Select Category: **`National`**.
  2. Toggle ON **`Lead Story`**.
  3. Paste the Featured Image URL.
  4. Paste the Sample Gujarati Headline, Summary, and Body into the left pane.
  5. Click **"Save Draft"** button.
- **Expected View:** Button briefly shows *"Saving..."*, URL changes to `/en/admin/articles/[articleId]`.
- **Success Criteria:**
  - Status remains **`DRAFT`**.
  - Left pane retains Gujarati text.
  - **Right pane automatically populates with English translation!**
  - Automated quality check badges evaluate fact-matching (500 crore, 750 MW, 2027, etc.).
- **Failure Indicator:** Red notification banner with validation errors (e.g. *"Headline must be at least 5 characters"*).
- **Evidence to Capture:** Screenshot showing the populated dual-pane with Gujarati on left and auto-generated English on right.

---

### Checkpoint 4: Reviewing Quality Checks & Editing English Translation
- **Action:**
  1. Inspect the Quality Alerts in the right pane (verifying numbers matched).
  2. Click into the **English Headline** field and refine the text (e.g. adjust to the Suggested English Headline from Part 2).
  3. Notice the amber badge **`Manually Edited`** appears.
  4. Click **"Save Draft"** to persist your manual English refinements.
- **Success Criteria:** Saved successfully; English manual edits remain intact.
- **Failure Indicator:** Changes revert back to original translation upon saving.
- **Evidence to Capture:** Screenshot of the right pane displaying the **`Manually Edited`** badge and updated text.

---

### Checkpoint 5: Split-Screen Article Preview Modal
- **Action:** Click the **"Preview"** (`પૂર્વાવલોકન`) button in the top action bar.
- **Expected View:** Dark overlay modal with full-width featured image and side-by-side Gujarati vs English rendering.
- **Success Criteria:** Both languages display properly formatted paragraphs, correct typography, and image preview.
- **Failure Indicator:** Modal doesn't open or displays empty text.
- **Evidence to Capture:** Screenshot of the active Split-Screen Preview Modal.

---

### Checkpoint 6: Publishing Article Live
- **Action:** Close preview modal and click the green **"Publish Now"** (`હવે પ્રકાશિત કરો`) button.
- **Expected View:** Green notification *"Article published successfully!"*; redirected to `/en/admin/articles`.
- **Success Criteria:** Article appears as the top row in the Articles table with blue/green status pill **`PUBLISHED`**.
- **Failure Indicator:** Status remains `DRAFT` or error toast appears.
- **Evidence to Capture:** Screenshot of the Articles management table showing the new published article row.

---

### Checkpoint 7: Public Website Verification
- **Action:**
  1. Open a new browser tab and navigate to `http://localhost:3000/gu`.
  2. Verify the article appears on the Gujarati homepage (as Lead Story or Latest News).
  3. Switch to English: navigate to `http://localhost:3000/en`.
  4. Verify the English headline and summary appear on the English homepage.
  5. Click into the article detail page (`/gu/article/[slug]`).
  6. Switch language to English while on the article page.
- **Success Criteria:**
  - Gujarati article page displays crisp Noto Sans Gujarati text, featured image, and author badge.
  - English article page displays clean English typography and matching layout.
- **Failure Indicator:** 404 Not Found, broken image, or English version missing.
- **Evidence to Capture:** Screenshots of the published article on `/gu` and `/en`.

---

## PART 4 — READY TO BEGIN TESTING

Follow Step 1 below to initiate your testing session in the browser.
