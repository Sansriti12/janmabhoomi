import {
  NewsArticle,
  EditorialArticle,
  SpecialEventItem,
  PanchangData,
  SisterPublication,
  AdvertisementSlot,
  CategorySlug,
  BilingualText,
  EPaperEdition,
  ArticleFilterParams,
  PaginatedResult,
} from "./types";
import {
  MOCK_ARTICLES,
  MOCK_EDITORIALS,
  MOCK_SPECIAL_EVENTS,
  MOCK_PANCHANG,
  MOCK_PANCHANG_CITIES,
  MOCK_SISTER_PUBLICATIONS,
  MOCK_AD_SLOTS,
  MOCK_EPAPER_EDITIONS,
  CATEGORY_METADATA,
} from "./mock/dataset";
import {
  HomepageLayoutConfig,
  DEFAULT_HOMEPAGE_CONFIG,
} from "./config/homepage";
import {
  getAllPublications,
  getPublicationBySlug,
} from "./config/publications";

/**
 * Data Provider Interface
 * -----------------------
 * All pages and components consume content exclusively through this contract.
 * When the company server and production CMS are connected, this provider
 * implementation will be swapped with an API or Database adapter without
 * altering frontend component code.
 */
export interface INewsDataProvider {
  getBreakingNews(publicationId?: string): Promise<NewsArticle[]>;
  getHomepageHeroData(publicationId?: string): Promise<{
    leadStory: NewsArticle;
    subLeadStories: NewsArticle[];
    headlineBriefs: NewsArticle[];
  }>;
  getArticlesByCategory(
    category: CategorySlug,
    limit?: number,
    publicationId?: string
  ): Promise<NewsArticle[]>;
  getLatestArticles(limit?: number, publicationId?: string): Promise<NewsArticle[]>;
  getArticleBySlug(
    slug: string,
    publicationId?: string
  ): Promise<NewsArticle | undefined>;
  searchArticles(query: string, publicationId?: string): Promise<NewsArticle[]>;
  filterArticles(
    params: ArticleFilterParams
  ): Promise<PaginatedResult<NewsArticle>>;
  getCategoryMetadata(
    category: string
  ): Promise<{ slug: CategorySlug; title: BilingualText; description: BilingualText } | undefined>;
  getEditorials(publicationId?: string): Promise<{
    todaysEditorial: EditorialArticle;
    previousEditorials: EditorialArticle[];
  }>;
  getEditorialBySlug(slug: string): Promise<EditorialArticle | undefined>;
  getSpecialCoverageAndEvents(publicationId?: string): Promise<{
    featuredCoverage: SpecialEventItem;
    events: SpecialEventItem[];
  }>;
  getDailyPanchang(): Promise<PanchangData>;
  getPanchangByCity(
    cityKey: "mumbai" | "ahmedabad" | "rajkot"
  ): Promise<PanchangData>;
  getAllCityPanchang(): Promise<Record<"mumbai" | "ahmedabad" | "rajkot", PanchangData>>;
  getSisterPublications(): Promise<SisterPublication[]>;
  getAdvertisementSlot(
    slotKey: string,
    publicationId?: string
  ): Promise<AdvertisementSlot>;
  getEPaperEditions(publicationId?: string): Promise<EPaperEdition[]>;
  getEPaperEditionByDate(
    dateStr: string,
    publicationId?: string
  ): Promise<EPaperEdition | undefined>;
  getHomepageConfig(): Promise<HomepageLayoutConfig>;
}

class MockNewsDataProvider implements INewsDataProvider {
  async getBreakingNews(_publicationId?: string): Promise<NewsArticle[]> {
    return MOCK_ARTICLES.filter((article) => article.isBreaking);
  }

  async getHomepageHeroData(_publicationId?: string) {
    const leadStory =
      MOCK_ARTICLES.find((article) => article.isLeadStory) ?? MOCK_ARTICLES[0];
    const subLeadStories = MOCK_ARTICLES.filter((article) => article.isSubLead).slice(0, 2);
    const headlineBriefs = MOCK_ARTICLES.filter(
      (article) => article.isHeadlineBrief
    ).slice(0, 4);

    return {
      leadStory,
      subLeadStories,
      headlineBriefs,
    };
  }

  async getArticlesByCategory(
    category: CategorySlug,
    limit = 6,
    _publicationId?: string
  ): Promise<NewsArticle[]> {
    if (category === "editorial") {
      return MOCK_EDITORIALS.map((ed) => ({
        id: ed.id,
        slug: ed.slug,
        category: "editorial" as CategorySlug,
        categoryLabel: { en: "Editorial", gu: "અગ્રલેખ" },
        title: ed.title,
        summary: ed.summary || ed.excerpt,
        teaserParagraphs: ed.teaserParagraphs,
        author: ed.author,
        location: { en: "Mumbai", gu: "મુંબઈ" },
        publishedAt: ed.publishedAt || ed.publishedDate,
        readTimeMinutes: 4,
        imageUrl: ed.featuredImage || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
        imageCaption: { en: "Editorial archive", gu: "સંપાદકીય અગ્રલેખ" },
        epaperPageNumber: ed.epaperPageNumber,
        epaperEdition: { en: "Mumbai Main Edition", gu: "મુંબઈ મુખ્ય આવૃત્તિ" },
        isDemonstrationData: true as const,
      })).slice(0, limit);
    }
    const matching = MOCK_ARTICLES.filter((article) => article.category === category);
    if (matching.length >= 2) {
      return matching.slice(0, limit);
    }
    // Provide supplementary clearly-marked demo items if a secondary category has fewer entries
    return [...matching, ...MOCK_ARTICLES.slice(0, Math.max(0, 3 - matching.length))].slice(
      0,
      limit
    );
  }

  async getLatestArticles(limit = 12, _publicationId?: string): Promise<NewsArticle[]> {
    return [...MOCK_ARTICLES]
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, limit);
  }

  async getArticleBySlug(
    slug: string,
    _publicationId?: string
  ): Promise<NewsArticle | undefined> {
    const found = MOCK_ARTICLES.find((article) => article.slug === slug);
    if (found) return found;
    const ed = MOCK_EDITORIALS.find((e) => e.slug === slug);
    if (ed) {
      return {
        id: ed.id,
        slug: ed.slug,
        category: "editorial",
        categoryLabel: { en: "Editorial", gu: "અગ્રલેખ" },
        title: ed.title,
        summary: ed.summary || ed.excerpt,
        teaserParagraphs: ed.teaserParagraphs,
        author: ed.author,
        location: { en: "Mumbai", gu: "મુંબઈ" },
        publishedAt: ed.publishedAt || ed.publishedDate,
        readTimeMinutes: 4,
        imageUrl: ed.featuredImage || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
        imageCaption: { en: "Editorial archive", gu: "સંપાદકીય અગ્રલેખ" },
        epaperPageNumber: ed.epaperPageNumber,
        epaperEdition: { en: "Mumbai Main Edition", gu: "મુંબઈ મુખ્ય આવૃત્તિ" },
        isDemonstrationData: true,
      };
    }
    return undefined;
  }

  async searchArticles(query: string, _publicationId?: string): Promise<NewsArticle[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return MOCK_ARTICLES.slice(0, 8);
    return MOCK_ARTICLES.filter(
      (article) =>
        article.title.en.toLowerCase().includes(normalized) ||
        article.title.gu.toLowerCase().includes(normalized) ||
        article.summary.en.toLowerCase().includes(normalized) ||
        article.summary.gu.toLowerCase().includes(normalized) ||
        article.categoryLabel.en.toLowerCase().includes(normalized) ||
        article.categoryLabel.gu.toLowerCase().includes(normalized)
    );
  }

  /**
   * Advanced Filtering, Searching & Pagination
   * Prepares the frontend for server-side query parameters.
   */
  async filterArticles(
    params: ArticleFilterParams
  ): Promise<PaginatedResult<NewsArticle>> {
    let result = [...MOCK_ARTICLES];

    if (params.category) {
      result = result.filter((a) => a.category === params.category);
    }

    if (params.searchQuery) {
      const q = params.searchQuery.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.title.en.toLowerCase().includes(q) ||
          a.title.gu.toLowerCase().includes(q) ||
          a.summary.en.toLowerCase().includes(q) ||
          a.summary.gu.toLowerCase().includes(q)
      );
    }

    if (params.isBreaking) {
      result = result.filter((a) => a.isBreaking);
    }

    if (params.isFeatured) {
      result = result.filter((a) => a.isFeatured || a.isLeadStory || a.isSubLead);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return params.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 9);
    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedData = result.slice(offset, offset + limit);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async getCategoryMetadata(category: string) {
    if (category in CATEGORY_METADATA) {
      const slug = category as CategorySlug;
      return {
        slug,
        ...CATEGORY_METADATA[slug],
      };
    }
    return undefined;
  }

  async getEditorials(_publicationId?: string) {
    const todaysEditorial =
      MOCK_EDITORIALS.find((ed) => ed.isTodaysEditorial) ?? MOCK_EDITORIALS[0];
    const previousEditorials = MOCK_EDITORIALS.filter(
      (ed) => ed.id !== todaysEditorial.id
    );
    return {
      todaysEditorial,
      previousEditorials,
    };
  }

  async getEditorialBySlug(slug: string): Promise<EditorialArticle | undefined> {
    return MOCK_EDITORIALS.find((ed) => ed.slug === slug);
  }

  async getSpecialCoverageAndEvents(_publicationId?: string) {
    const featuredCoverage =
      MOCK_SPECIAL_EVENTS.find((item) => item.type === "special-coverage") ??
      MOCK_SPECIAL_EVENTS[0];
    const events = MOCK_SPECIAL_EVENTS.filter((item) => item.id !== featuredCoverage.id);
    return {
      featuredCoverage,
      events,
    };
  }

  async getDailyPanchang(): Promise<PanchangData> {
    return MOCK_PANCHANG;
  }

  async getPanchangByCity(
    cityKey: "mumbai" | "ahmedabad" | "rajkot"
  ): Promise<PanchangData> {
    return MOCK_PANCHANG_CITIES[cityKey] ?? MOCK_PANCHANG;
  }

  async getAllCityPanchang(): Promise<Record<"mumbai" | "ahmedabad" | "rajkot", PanchangData>> {
    return MOCK_PANCHANG_CITIES;
  }

  async getSisterPublications(): Promise<SisterPublication[]> {
    return MOCK_SISTER_PUBLICATIONS;
  }

  async getAdvertisementSlot(
    slotKey: string,
    _publicationId?: string
  ): Promise<AdvertisementSlot> {
    return MOCK_AD_SLOTS[slotKey] ?? MOCK_AD_SLOTS.homepagePrimaryHorizontal;
  }

  async getEPaperEditions(_publicationId?: string): Promise<EPaperEdition[]> {
    return MOCK_EPAPER_EDITIONS;
  }

  async getEPaperEditionByDate(
    dateStr: string,
    _publicationId?: string
  ): Promise<EPaperEdition | undefined> {
    return MOCK_EPAPER_EDITIONS.find((ed) => ed.editionDate === dateStr) ?? MOCK_EPAPER_EDITIONS[0];
  }

  async getHomepageConfig(): Promise<HomepageLayoutConfig> {
    return DEFAULT_HOMEPAGE_CONFIG;
  }
}

import { ApiNewsDataProvider } from "./apiProvider";

/**
 * Singleton News Data Provider
 * When NEXT_PUBLIC_USE_API === "true", routes to the Fastify production backend.
 * Falls back to MockNewsDataProvider explicitly for offline development.
 */
export const newsDataProvider: INewsDataProvider =
  process.env.NEXT_PUBLIC_USE_API === "true"
    ? new ApiNewsDataProvider()
    : new MockNewsDataProvider();

export { getAllPublications, getPublicationBySlug };
