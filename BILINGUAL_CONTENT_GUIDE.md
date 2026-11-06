# JANMABHOOMI DIGITAL NEWSPAPER
## BILINGUAL CONTENT AND LOCALIZATION ARCHITECTURE GUIDE

**Document Version:** 1.0.0  
**Status:** Approved Reference Guide  
**Applicability:** Editorial Team, Translators, Frontend Engineers  
**Locales Supported:** Gujarati (`gu`) and English (`en`)  

---

### 1. Architectural Strategy

The Janmabhoomi platform serves a diverse readership:
- Traditional readers in Gujarat, Mumbai, and worldwide diaspora seeking authoritative Gujarati journalism.
- Modern bilingual readers, researchers, corporate partners, and youth seeking news in English.

Rather than treating one language as a secondary translation, the platform treats **Gujarati (`gu`) and English (`en`) as equal first-class citizens** across routing, layout, typography, and metadata.

---

### 2. URL Routing & Locale Handling

#### 2.1 Route Structure
All user-facing URLs strictly begin with the locale code:
- `/[lang]/` — Homepage (`/en` or `/gu`)
- `/[lang]/category/[slug]` — Category feed (`/gu/category/national`)
- `/[lang]/article/[slug]` — Single article preview
- `/[lang]/editorial` — Editorial and Agralekh
- `/[lang]/epaper` — E-Paper broadsheet portal
- `/[lang]/panchang` — Daily Panchang and Choghadiya

#### 2.2 Preserving Page on Language Switch
The language switcher in the Header and Mobile Navigation preserves the user's active sub-route:
- Switching from `/en/category/business` navigates to `/gu/category/business`.
- Switching from `/gu/panchang` navigates to `/en/panchang`.
- Implementation: Handled dynamically via `getSwitchedLocaleHref()` in `src/components/layout/Header.tsx`.

#### 2.3 HTML `lang` Attribute Standards
- English routes must expose `<html lang="en">`.
- Gujarati routes must expose `<html lang="gu">`.
- Implementation: Managed synchronously via `src/components/shared/HtmlLangSetter.tsx` and Next.js App Router root layout architecture, ensuring screen readers and SEO crawlers instantly recognize the document language without hydration mismatch.

---

### 3. Typography and Font Hierarchy

#### 3.1 Font Stack Configuration
In `src/app/globals.css`:
```css
@theme {
  --font-sans: "Inter", "Noto Sans Gujarati", ui-sans-serif, system-ui, sans-serif;
  --font-gujarati: "Noto Sans Gujarati", "Inter", sans-serif;
}
```

#### 3.2 Typography Rules
1. **Headlines:** Gujarati headlines use `font-gujarati font-extrabold tracking-tight leading-snug`.
2. **Body Text:** Gujarati paragraphs require generous line-height (`leading-relaxed` or `leading-7`) to accommodate Gujarati matras and conjuncts (જ્ઞ, ક્ષ, ત્ર) without vertical clipping.
3. **Numerics:**
   - On Gujarati pages, traditional Gujarati numerals (૧, ૨, ૩, ૧૬) may be used for page indices and edition numbers, while standard Arabic numerals (1, 2, 3) are acceptable for financial figures (₹42,000 કરોડ) to ensure clarity.

---

### 4. Bilingual Data Model (`BilingualText`)

All text entities in the data layer use the `BilingualText` interface:

```typescript
export interface BilingualText {
  en: string;
  gu: string;
}

export function getLocalizedText(text: BilingualText, lang: Locale): string {
  if (!text) return "";
  return text[lang] || text.en || text.gu || "";
}
```

#### Fallback Priority Order:
1. Exact requested locale (`text[lang]`).
2. If blank or undefined, fallback to English (`text.en`).
3. If English is undefined, fallback to Gujarati (`text.gu`).
4. Never display `[object Object]` or throw an unhandled exception.

---

### 5. Culturally Specific Terms & Transliteration Standards

Certain iconic Gujarati newspaper terms possess deep cultural resonance and must retain their identity even on English pages:

| Gujarati Term | English Representation | Editorial Context |
| :--- | :--- | :--- |
| **અગ્રલેખ** | *Agralekh (Leading Editorial)* | The flagship daily opinion column of the editor. |
| **પંચાંગ** | *Panchang (Almanac)* | Daily astronomical and astrological calendar. |
| **ચોઘડિયા** | *Choghadiya Timings* | 8 diurnal and 8 nocturnal astrological intervals. |
| **મરણ નોંધ** | *Maran Notices & Besanu* | Obituary notices, memorial tributes, and condolence announcements. |
| **વ્યાપાર** | *Vyapar (Business & Markets)* | Commodity, stock market, and commercial reportage. |
| **પ્રવાસી** | *Pravasi (Diaspora & Sunday)* | Cultural features for Gujaratis living outside Gujarat. |

---

### 6. Editorial Guidelines for Content Authors

1. **Title Length:** Gujarati headlines often occupy slightly more vertical height due to vowel diacritics. Avoid exceeding 120 characters in headlines.
2. **Summaries:** Keep lead summaries between 140 and 180 characters to optimize both OpenGraph previews and mobile cards.
3. **Punctuation:** Use standard Gujarati punctuation marks: commas (,), full stops (.), and hyphens (-). Do not use archaic danda (।) unless quoting classical religious verses.
4. **Demonstration Tags:** When authoring mock or testing articles, always prefix the summary with `[DEMO DATA]` or `[ડેમો ડેટા]` to prevent accidental publication of placeholder content.
