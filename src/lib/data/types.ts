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

export type PublicationStatus = "active" | "planned" | "archived";
export type ContentStatus = "published" | "draft" | "archived";
export type PublicationType =
  | "daily_newspaper"
  | "biweekly_newspaper"
  | "weekly_newspaper"
  | "magazine"
  | "almanac";

/**
 * Publication Entity Contract
 * Represents a newspaper, magazine, or almanac product within the Saurashtra Trust centralized platform.
 */
export interface Publication {
  id: string;
  name: BilingualText;
  slug?: string;
  publicationType?: PublicationType;
  tagline: BilingualText;
  logo?: string;
  logoPlaceholderCode: string;
  websiteUrl: string;
  epaperUrl: string;
  defaultLanguage?: Locale;
  supportedLanguages?: Locale[];
  language?: BilingualText; // Retained for display in sister publication cards
  frequency: BilingualText;
  establishedYear: string;
  region: BilingualText;
  status?: PublicationStatus;
  isPlaceholderAsset?: boolean;
}

// Alias for backward compatibility
export type SisterPublication = Publication;

/**
 * Category Entity Contract
 */
export interface Category {
  id: string;
  publicationId?: string;
  name: BilingualText;
  slug: CategorySlug;
  description: BilingualText;
  language?: Locale;
  displayOrder?: number;
  status?: "active" | "inactive";
}

/**
 * Article Translation Contract
 */
export interface ArticleTranslation {
  id: string;
  articleId: string;
  language: Locale;
  headline: string;
  summary: string;
  contentPreview: string[];
  slug: string;
}

/**
 * News Article Entity Contract
 * Enforces the Janmabhoomi digital business model:
 * - Public teaser preview paragraphs on the open web
 * - Full broadsheet reading gated behind the paid E-Paper subscription
 */
export interface NewsArticle {
  id: string;
  publicationId?: string;
  categoryId?: string;
  category: CategorySlug;
  categoryLabel: BilingualText;
  slug: string;
  title: BilingualText; // Primary headline contract
  headline?: BilingualText; // Central content model synonym
  subtitle?: BilingualText;
  summary: BilingualText;
  /**
   * Public teaser paragraphs displayed before the E-Paper gate.
   * Full newspaper content is never freely accessible on the public web.
   */
  teaserParagraphs: {
    en: string[];
    gu: string[];
  };
  contentPreview?: BilingualText[];
  imageUrl: string;
  featuredImage?: string; // Central content model synonym
  imageCaption: BilingualText;
  author: BilingualText;
  location: BilingualText;
  publishedAt: string;
  updatedAt?: string;
  readTimeMinutes: number;
  status?: ContentStatus;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isLeadStory?: boolean;
  isSubLead?: boolean;
  isHeadlineBrief?: boolean;
  displayOrder?: number;
  seoTitle?: BilingualText;
  seoDescription?: BilingualText;
  epaperPageNumber: number;
  epaperEdition: BilingualText;
  isDemonstrationData: true;
}

/**
 * Editorial Article Contract
 * Retains the iconic Gujarati institutional editorial identity: અગ્રલેખ.
 */
export interface EditorialArticle {
  id: string;
  publicationId?: string;
  slug: string;
  tag: string; // Institutional tag, e.g. "અગ્રલેખ"
  title: BilingualText;
  headline?: BilingualText;
  excerpt: BilingualText;
  summary?: BilingualText;
  teaserParagraphs: {
    en: string[];
    gu: string[];
  };
  author: BilingualText;
  authorRole: BilingualText;
  publishedDate: string;
  publishedAt?: string;
  featuredImage?: string;
  status?: ContentStatus;
  isTodaysEditorial?: boolean;
  epaperPageNumber: number;
  isDemonstrationData: true;
}

/**
 * Special Coverage and Event Item Contract
 */
export interface SpecialEventItem {
  id: string;
  publicationId?: string;
  slug: string;
  type: "special-coverage" | "event";
  badge: BilingualText;
  title: BilingualText;
  description: BilingualText;
  dateLabel: BilingualText;
  startDate?: string;
  endDate?: string;
  location: BilingualText;
  venue?: BilingualText;
  imageUrl: string;
  bannerImage?: string;
  ctaLabel: BilingualText;
  status?: "active" | "completed" | "upcoming";
  displayOnHomepage?: boolean;
  isDemonstrationData: true;
}

/**
 * Panchang Solar & Astronomical Data Contract
 */
export interface PanchangData {
  id?: string;
  publicationId?: string;
  editionCity: BilingualText;
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
  choghadiya?: {
    day: Array<{ name: BilingualText; quality: "good" | "neutral" | "bad"; timing: string }>;
    night: Array<{ name: BilingualText; quality: "good" | "neutral" | "bad"; timing: string }>;
  };
  isDemonstrationSample: true;
}

/**
 * Advertisement Slot Contract
 */
export interface AdvertisementSlot {
  id: string;
  publicationId?: string;
  placementName: string;
  placement?: string;
  dimensionsLabel: string;
  sponsorHeadline: BilingualText;
  sponsorSubtext: BilingualText;
  ctaText: BilingualText;
  ctaHref: string;
  destinationUrl?: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  status?: "active" | "inactive";
  isDemoSlot: true;
}

/**
 * E-Paper Broadsheet Edition Contract (Preparation for future E-Paper reader)
 */
export interface EPaperEdition {
  id: string;
  publicationId: string;
  editionDate: string;
  editionName: BilingualText;
  language: Locale;
  thumbnail: string;
  pageCount: number;
  pages: Array<{
    pageNumber: number;
    label: BilingualText;
    previewDescription: BilingualText;
  }>;
  status: "available" | "archived" | "processing";
  isDemonstrationEdition: true;
}

/**
 * Query and Pagination Contracts
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ArticleFilterParams extends PaginationParams {
  category?: CategorySlug;
  publicationId?: string;
  language?: Locale;
  searchQuery?: string;
  sortBy?: "publishedAt" | "relevance";
  sortOrder?: "asc" | "desc";
  isBreaking?: boolean;
  isFeatured?: boolean;
}

/**
 * Helper to safely extract bilingual text
 */
export function getLocalizedText(text: BilingualText, lang: Locale): string {
  if (!text) return "";
  return text[lang] || text.en || text.gu || "";
}
