# JANMABHOOMI DIGITAL NEWSPAPER
## CENTRALIZED PUBLICATION & PRODUCT CONFIGURATION REGISTRY

**Document Version:** 2.1.0  
**Status:** Approved Architectural Reference  
**Organization:** Saurashtra Trust  
**Scope:** Flagship Newspaper, Sister Titles, Periodicals, Almanac & Literary Magazines  
**Registry Source File:** `src/lib/data/config/publications.ts`

---

### 1. Executive Summary

Saurashtra Trust oversees a portfolio of **8 publications and products**, spanning daily broadsheet journalism, financial newspapers, a Sunday family broadsheet, an authentic astronomical almanac, and a quarterly literary magazine.

All 8 publications are registered in the centralized multi-tenant registry (`PUBLICATIONS_CONFIG`). Each maintains distinct metadata, publishing frequencies, supported languages, and editorial branding.

> **Note on Historical & Benchmark Data:** Founding years, historical circulation areas, and digital maturity benchmark figures referenced in documentation are drawn from historical records and internal audit reports; they remain subject to final verification against official Trust archives.

---

### 2. Complete 8-Publication Registry Specification

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               SAURASHTRA TRUST 8-PRODUCT MULTI-TENANT REGISTRY                                  │
├─────────────────────┬──────────────────────────┬──────────────────────┬───────────────────────┬─────────────────┤
│ Publication Key     │ Masthead (EN / GU)       │ Product Type         │ Frequency (EN / GU)   │ Status          │
├─────────────────────┼──────────────────────────┼──────────────────────┼───────────────────────┼─────────────────┤
│ janmabhoomi         │ Janmabhoomi (જન્મભૂમિ)    │ daily_newspaper      │ Daily Evening         │ active (Live)   │
│                     │                          │                      │ દૈનિક સાંધ્ય સમાચારપત્ર│                 │
├─────────────────────┼──────────────────────────┼──────────────────────┼───────────────────────┼─────────────────┤
│ kutchmitra          │ Kutchmitra (કચ્છમિત્ર)    │ daily_newspaper      │ Daily Morning         │ planned         │
│                     │                          │                      │ દૈનિક પ્રભાત          │                 │
├─────────────────────┼──────────────────────────┼──────────────────────┼───────────────────────┼─────────────────┤
│ phulchhab           │ Phulchhab (ફૂલછાબ)        │ daily_newspaper      │ Daily Morning         │ planned         │
│                     │                          │                      │ દૈનિક પ્રભાત          │                 │
├─────────────────────┼──────────────────────────┼──────────────────────┼───────────────────────┼─────────────────┤
│ vyapar-gujarati     │ Vyapar (વ્યાપાર)          │ biweekly_newspaper   │ Bi-Weekly (Wed & Sat) │ planned         │
│                     │                          │                      │ દ્વિ-સાપ્તાહિક (બુધ/શનિ)│               │
├─────────────────────┼──────────────────────────┼──────────────────────┼───────────────────────┼─────────────────┤
│ vyapar-hindi        │ Vyapar (વ્યાપાર હિન્દી)    │ weekly_newspaper     │ Weekly Financial      │ planned         │
│                     │                          │                      │ સાપ્તાહિક આર્થિક      │                 │
├─────────────────────┼──────────────────────────┼──────────────────────┼───────────────────────┼─────────────────┤
│ janmabhoomi-pravasi │ Pravasi (જન્મભૂમિ પ્રવાસી)│ weekly_newspaper     │ Sunday Weekly         │ planned         │
│                     │                          │                      │ રવિવારીય સાપ્તાહિક    │                 │
├─────────────────────┼──────────────────────────┼──────────────────────┼───────────────────────┼─────────────────┤
│ panchang            │ Panchang (જન્મભૂમિ પંચાંગ)│ almanac              │ Annual / Daily Astro  │ active (Portal) │
│                     │                          │                      │ વાર્ષિક પંચાંગ / ગ્રહમાન│ (Feed pending)│
├─────────────────────┼──────────────────────────┼──────────────────────┼───────────────────────┼─────────────────┤
│ kavita              │ Kavita (કવિતા સામાયિક)   │ magazine             │ Quarterly Magazine    │ planned         │
│                     │                          │                      │ ત્રિમાસિક (દર ત્રણ મહિને)│               │
└─────────────────────┴──────────────────────────┴──────────────────────┴───────────────────────┴─────────────────┘
```

---

### 3. Detailed Publication Profiles

#### 1. Janmabhoomi (જન્મભૂમિ)
- **ID:** `pub-janmabhoomi` | **Slug:** `janmabhoomi`
- **Product Type:** `daily_newspaper`
- **Publishing Schedule:** Daily Broadsheet (Evening) / દૈનિક સાંધ્ય સમાચારપત્ર
- **Founding Year:** 1934 (Audit-reported)
- **Primary Circulation:** Mumbai & Maharashtra
- **Default Language:** Gujarati (`gu`) | **Supported Languages:** `gu`, `en`
- **Status:** `active` (Flagship digital implementation)

#### 2. Kutchmitra (કચ્છમિત્ર)
- **ID:** `pub-kutchmitra` | **Slug:** `kutchmitra`
- **Product Type:** `daily_newspaper`
- **Publishing Schedule:** Daily Morning / દૈનિક પ્રભાત
- **Founding Year:** 1947 (Audit-reported)
- **Primary Circulation:** Bhuj, Kutch District & Saurashtra
- **Default Language:** Gujarati (`gu`) | **Supported Languages:** `gu`, `en`
- **Status:** `planned`

#### 3. Phulchhab (ફૂલછાબ)
- **ID:** `pub-phulchhab` | **Slug:** `phulchhab`
- **Product Type:** `daily_newspaper`
- **Publishing Schedule:** Daily Morning / દૈનિક પ્રભાત
- **Founding Year:** 1921 (Audit-reported)
- **Primary Circulation:** Rajkot & Entire Saurashtra Peninsula
- **Default Language:** Gujarati (`gu`) | **Supported Languages:** `gu`, `en`
- **Status:** `planned`

#### 4. Vyapar Gujarati (વ્યાપાર - ગુજરાતી)
- **ID:** `pub-vyapar-gu` | **Slug:** `vyapar-gujarati`
- **Product Type:** `biweekly_newspaper`
- **Publishing Schedule:** Bi-Weekly (Wednesday & Saturday) / દ્વિ-સાપ્તાહિક (બુધ અને શનિ)
- **Founding Year:** 1949 (Audit-reported)
- **Primary Circulation:** Pan-India Commercial Centers & Trade Hubs
- **Default Language:** Gujarati (`gu`) | **Supported Languages:** `gu`, `en`
- **Status:** `planned`

#### 5. Vyapar Hindi (વ્યાપાર - હિન્દી)
- **ID:** `pub-vyapar-hi` | **Slug:** `vyapar-hindi`
- **Product Type:** `weekly_newspaper`
- **Publishing Schedule:** Weekly Financial / સાપ્તાહિક આર્થિક સમાચારપત્ર
- **Founding Year:** 1987 (Audit-reported)
- **Primary Circulation:** National Commodity & Commercial Markets
- **Default Language:** English/Hindi (`en`) | **Supported Languages:** `en`, `gu`
- **Status:** `planned`

#### 6. Janmabhoomi Pravasi (જન્મભૂમિ પ્રવાસી)
- **ID:** `pub-pravasi` | **Slug:** `janmabhoomi-pravasi`
- **Product Type:** `weekly_newspaper`
- **Publishing Schedule:** Sunday Weekly / સાપ્તાહિક રવિવારીય પૂર્તિ અને સમાચાર
- **Founding Year:** 1939 (Audit-reported)
- **Primary Circulation:** Mumbai Metropolitan Region & Global Diaspora
- **Default Language:** Gujarati (`gu`) | **Supported Languages:** `gu`, `en`
- **Status:** `planned`

#### 7. Janmabhoomi Panchang (જન્મભૂમિ પંચાંગ)
- **ID:** `pub-panchang` | **Slug:** `panchang`
- **Product Type:** `almanac` (Authentic Publication / Product)
- **Publishing Schedule:** Annual Almanac Edition with Daily Astrological Transit Data
- **Founding Year:** 1934 (Audit-reported)
- **Primary Scope:** Authentic Jyotish almanac, tithi, nakshatra, choghadiya, and Hindu calendar dates
- **Default Language:** Gujarati (`gu`) | **Supported Languages:** `gu`, `en`
- **Product Status:** `active` (Genuine product within the Trust portfolio).
- **Data Feed Status:** The daily astronomical feed component is maintained as pending/sample data until an authorized Jyotish data source is officially confirmed by management. The product itself is not classified as demo data.

#### 8. Kavita (કવિતા)
- **ID:** `pub-kavita` | **Slug:** `kavita`
- **Product Type:** `magazine` (Quarterly Literary & Poetry Journal)
- **Publishing Schedule:** Quarterly Magazine (Published once every three months) / ત્રિમાસિક સામાયિક
- **Founding Year:** 1968 (Audit-reported)
- **Primary Scope:** Gujarati poetry, literary critique, translations, and archival issues
- **Default Language:** Gujarati (`gu`) | **Supported Languages:** `gu`, `en`
- **Metadata Support:** Supports volume/year, issue number, publication date, cover image, PDF edition, and historical archive of past issues. (Example volume or issue numbers in documentation are illustrative placeholders, not confirmed official values).
- **Status:** `planned`

---

### 4. Architectural Rules for Publication Governance

1. **Independent Publishing Frequencies:** Regular newspapers, weekly editions, quarterly magazines, and annual almanacs follow their respective publishing workflows without artificial uniform deadlines.
2. **Multi-Tenant Data Scoping:** Every content entity (`articles`, `epaper_editions`, `subscription_plans`) is scoped by `publication_id`.
3. **Configurable Subscription Scopes:** The schema supports single-title subscriptions, bundled packages, and future group-wide access, without activating unapproved group-wide plans prematurely.
