import {
  NewsArticle,
  EditorialArticle,
  SpecialEventItem,
  PanchangData,
  SisterPublication,
  AdvertisementSlot,
  CategorySlug,
  BilingualText,
} from "./types";
import {
  MOCK_ARTICLES,
  MOCK_EDITORIALS,
  MOCK_SPECIAL_EVENTS,
  MOCK_PANCHANG,
  MOCK_SISTER_PUBLICATIONS,
  MOCK_AD_SLOTS,
  CATEGORY_METADATA,
} from "./mock/dataset";

/**
 * Data Provider Interface
 * -----------------------
 * All pages and components consume data exclusively through this interface.
 * When the company server and database (e.g., PostgreSQL / Central Multi-Publication CMS)
 * are connected in Phase 2, only this provider implementation needs to be swapped.
 */
export interface INewsDataProvider {
  getBreakingNews(): Promise<NewsArticle[]>;
  getHomepageHeroData(): Promise<{
    leadStory: NewsArticle;
    subLeadStories: NewsArticle[];
    headlineBriefs: NewsArticle[];
  }>;
  getArticlesByCategory(category: CategorySlug, limit?: number): Promise<NewsArticle[]>;
  getLatestArticles(limit?: number): Promise<NewsArticle[]>;
  getArticleBySlug(slug: string): Promise<NewsArticle | undefined>;
  searchArticles(query: string): Promise<NewsArticle[]>;
  getCategoryMetadata(
    category: string
  ): Promise<{ slug: CategorySlug; title: BilingualText; description: BilingualText } | undefined>;
  getEditorials(): Promise<{
    todaysEditorial: EditorialArticle;
    previousEditorials: EditorialArticle[];
  }>;
  getEditorialBySlug(slug: string): Promise<EditorialArticle | undefined>;
  getSpecialCoverageAndEvents(): Promise<{
    featuredCoverage: SpecialEventItem;
    events: SpecialEventItem[];
  }>;
  getDailyPanchang(): Promise<PanchangData>;
  getSisterPublications(): Promise<SisterPublication[]>;
  getAdvertisementSlot(slotKey: string): Promise<AdvertisementSlot>;
}

class MockNewsDataProvider implements INewsDataProvider {
  async getBreakingNews(): Promise<NewsArticle[]> {
    return MOCK_ARTICLES.filter((article) => article.isBreaking);
  }

  async getHomepageHeroData() {
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
    limit = 6
  ): Promise<NewsArticle[]> {
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

  async getLatestArticles(limit = 12): Promise<NewsArticle[]> {
    return [...MOCK_ARTICLES]
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, limit);
  }

  async getArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
    return MOCK_ARTICLES.find((article) => article.slug === slug);
  }

  async searchArticles(query: string): Promise<NewsArticle[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return MOCK_ARTICLES.slice(0, 5);
    return MOCK_ARTICLES.filter(
      (article) =>
        article.title.en.toLowerCase().includes(normalized) ||
        article.title.gu.toLowerCase().includes(normalized) ||
        article.summary.en.toLowerCase().includes(normalized) ||
        article.summary.gu.toLowerCase().includes(normalized) ||
        article.categoryLabel.en.toLowerCase().includes(normalized)
    );
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

  async getEditorials() {
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

  async getSpecialCoverageAndEvents() {
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

  async getSisterPublications(): Promise<SisterPublication[]> {
    return MOCK_SISTER_PUBLICATIONS;
  }

  async getAdvertisementSlot(slotKey: string): Promise<AdvertisementSlot> {
    return MOCK_AD_SLOTS[slotKey] ?? MOCK_AD_SLOTS.homepagePrimaryHorizontal;
  }
}

export const newsDataProvider: INewsDataProvider = new MockNewsDataProvider();
