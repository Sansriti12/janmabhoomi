import { Locale } from "../i18n/config";

export type CategorySlug =
  | "national"
  | "city"
  | "business"
  | "sports"
  | "entertainment"
  | "editorial"
  | "maran"
  | "international"
  | "education"
  | "religion-culture"
  | "special-coverage"
  | "events";

export interface BilingualText {
  en: string;
  gu: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  category: CategorySlug;
  categoryLabel: BilingualText;
  title: BilingualText;
  subtitle?: BilingualText;
  summary: BilingualText;
  /**
   * Public teaser paragraphs shown on the article page before the E-Paper subscription gate.
   * Full newspaper content is never exposed freely on the public web.
   */
  teaserParagraphs: {
    en: string[];
    gu: string[];
  };
  author: BilingualText;
  location: BilingualText;
  publishedAt: string;
  readTimeMinutes: number;
  imageUrl: string;
  imageCaption: BilingualText;
  isBreaking?: boolean;
  isLeadStory?: boolean;
  isSubLead?: boolean;
  isHeadlineBrief?: boolean;
  epaperPageNumber: number;
  epaperEdition: BilingualText;
  isDemonstrationData: true;
}

export interface EditorialArticle {
  id: string;
  slug: string;
  tag: string; // Always retains 'અગ્રલેખ' identity
  title: BilingualText;
  excerpt: BilingualText;
  teaserParagraphs: {
    en: string[];
    gu: string[];
  };
  author: BilingualText;
  authorRole: BilingualText;
  publishedDate: string;
  isTodaysEditorial?: boolean;
  epaperPageNumber: number;
  isDemonstrationData: true;
}

export interface SpecialEventItem {
  id: string;
  slug: string;
  type: "special-coverage" | "event";
  badge: BilingualText;
  title: BilingualText;
  description: BilingualText;
  dateLabel: BilingualText;
  location: BilingualText;
  imageUrl: string;
  ctaLabel: BilingualText;
  isDemonstrationData: true;
}

export interface PanchangData {
  noticeLabel: BilingualText;
  displayDate: BilingualText;
  vikramSamvat: BilingualText;
  tithi: BilingualText;
  nakshatra: BilingualText;
  yoga: BilingualText;
  karana: BilingualText;
  sunrise: string;
  sunset: string;
  rahuKaal: string;
  auspiciousNote: BilingualText;
  isDemonstrationSample: true;
}

export interface SisterPublication {
  id: string;
  name: BilingualText;
  tagline: BilingualText;
  language: BilingualText;
  frequency: BilingualText;
  establishedYear: string;
  region: BilingualText;
  websiteUrl: string;
  epaperUrl: string;
  logoPlaceholderCode: string;
  isPlaceholderAsset: true;
}

export interface AdvertisementSlot {
  id: string;
  placementName: string;
  dimensionsLabel: string;
  sponsorHeadline: BilingualText;
  sponsorSubtext: BilingualText;
  ctaText: BilingualText;
  ctaHref: string;
  isDemoSlot: true;
}

export function getLocalizedText(text: BilingualText, lang: Locale): string {
  return text[lang] || text.en || text.gu;
}
