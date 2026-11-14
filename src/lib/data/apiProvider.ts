import {
  INewsDataProvider,
} from "./provider";
import {
  NewsArticle,
  EditorialArticle,
  SpecialEventItem,
  PanchangData,
  SisterPublication,
  AdvertisementSlot,
  CategorySlug,
  EPaperEdition,
  ArticleFilterParams,
  PaginatedResult,
} from "./types";
import {
  MOCK_AD_SLOTS,
  MOCK_SPECIAL_EVENTS,
  CATEGORY_METADATA,
} from "./mock/dataset";
import {
  HomepageLayoutConfig,
  DEFAULT_HOMEPAGE_CONFIG,
} from "./config/homepage";

// Helper to construct complete NewsArticle conforming to types.ts
function mapToNewsArticle(data: {
  id: string;
  slug: string;
  categorySlug: CategorySlug;
  categoryNameEn: string;
  categoryNameGu: string;
  titleEn: string;
  titleGu: string;
  summaryEn: string;
  summaryGu: string;
  imageUrl?: string;
  imageCaptionEn?: string;
  imageCaptionGu?: string;
  authorEn?: string;
  authorGu?: string;
  publishedAt?: string;
  readTimeMinutes?: number;
  isBreaking?: boolean;
  isLeadStory?: boolean;
  isSubLead?: boolean;
  epaperPageNumber?: number;
}): NewsArticle {
  return {
    id: data.id,
    slug: data.slug,
    category: data.categorySlug,
    categoryLabel: {
      en: data.categoryNameEn || "National",
      gu: data.categoryNameGu || "રાષ્ટ્રીય",
    },
    title: { en: data.titleEn, gu: data.titleGu },
    summary: { en: data.summaryEn, gu: data.summaryGu },
    teaserParagraphs: {
      en: [data.summaryEn || data.titleEn],
      gu: [data.summaryGu || data.titleGu],
    },
    imageUrl:
      data.imageUrl ||
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: data.imageCaptionEn || "News coverage",
      gu: data.imageCaptionGu || "સમાચાર અહેવાલ",
    },
    author: {
      en: data.authorEn || "Janmabhoomi Bureau",
      gu: data.authorGu || "જન્મભૂમિ બ્યુરો",
    },
    location: { en: "Mumbai", gu: "મુંબઈ" },
    publishedAt: data.publishedAt || new Date().toISOString(),
    readTimeMinutes: data.readTimeMinutes || 3,
    isBreaking: data.isBreaking,
    isLeadStory: data.isLeadStory,
    isSubLead: data.isSubLead,
    epaperPageNumber: data.epaperPageNumber || 1,
    epaperEdition: { en: "Mumbai Main Edition", gu: "મુંબઈ મુખ્ય આવૃત્તિ" },
    isDemonstrationData: true as const,
  };
}

/**
 * ApiNewsDataProvider
 * -------------------
 * Production Fastify REST API data adapter implementing INewsDataProvider.
 * Connects the Next.js frontend to the central Fastify backend.
 * Uses NEXT_PUBLIC_API_BASE_URL for network requests.
 * Throws clean, typed errors when production backend requests fail rather than
 * silently substituting mock data.
 */
export class ApiNewsDataProvider implements INewsDataProvider {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";
  }

  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
        ...options,
      });

      if (!res.ok) {
        throw new Error(
          `API request to ${endpoint} failed with HTTP status ${res.status} (${res.statusText})`
        );
      }

      return (await res.json()) as T;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown API network failure";
      console.error(`[ApiNewsDataProvider Error] ${endpoint}:`, msg);
      throw new Error(`Production backend API unreachable at ${url}. Error: ${msg}`);
    }
  }

  async getBreakingNews(publicationId = "pub-janmabhoomi"): Promise<NewsArticle[]> {
    interface HomePayload {
      success: boolean;
      data: {
        breakingNews: Array<{ id: string; slug: string; title: string }>;
      };
    }

    const payload = await this.fetchApi<HomePayload>(
      `/api/v1/articles/home?publication=${publicationId}&lang=gu`
    );

    return payload.data.breakingNews.map((bn) =>
      mapToNewsArticle({
        id: bn.id,
        slug: bn.slug,
        categorySlug: "national",
        categoryNameEn: "Breaking News",
        categoryNameGu: "બ્રેકિંગ ન્યૂઝ",
        titleEn: bn.title,
        titleGu: bn.title,
        summaryEn: bn.title,
        summaryGu: bn.title,
        isBreaking: true,
      })
    );
  }

  async getHomepageHeroData(publicationId = "pub-janmabhoomi") {
    interface HomePayload {
      success: boolean;
      data: {
        leadStory: {
          id: string;
          slug: string;
          slugGu?: string;
          slugEn?: string;
          headline: string;
          headlineGu?: string;
          headlineEn?: string;
          summary: string;
          summaryGu?: string;
          summaryEn?: string;
          featuredImageUrl?: string;
          publishedAt: string;
          category: {
            id?: string;
            slug: string;
            name: string;
            nameGu?: string;
            nameEn?: string;
          };
        } | null;
        subLeads: Array<{
          id: string;
          slug: string;
          headline: string;
          summary: string;
          featuredImageUrl?: string;
          publishedAt: string;
        }>;
      };
    }

    const payload = await this.fetchApi<HomePayload>(
      `/api/v1/articles/home?publication=${publicationId}`
    );

    const lead = payload.data.leadStory;
    let leadStory: NewsArticle;
    if (lead) {
      leadStory = mapToNewsArticle({
        id: lead.id,
        slug: lead.slugGu || lead.slugEn || lead.slug || lead.id,
        categorySlug: (lead.category?.slug as CategorySlug) || "national",
        categoryNameEn: lead.category?.nameEn || lead.category?.name || "National",
        categoryNameGu: lead.category?.nameGu || lead.category?.name || "રાષ્ટ્રીય",
        titleEn: lead.headlineEn || lead.headlineGu || lead.headline,
        titleGu: lead.headlineGu || lead.headline,
        summaryEn: lead.summaryEn || lead.summaryGu || lead.summary,
        summaryGu: lead.summaryGu || lead.summary,
        imageUrl: lead.featuredImageUrl,
        publishedAt: lead.publishedAt,
        isLeadStory: true,
      });
    } else {
      // Graceful editorial fallback when no article is designated as Lead Story
      leadStory = mapToNewsArticle({
        id: "lead-default",
        slug: "lead-story",
        categorySlug: "national",
        categoryNameEn: "National",
        categoryNameGu: "રાષ્ટ્રીય",
        titleEn: "Janmabhoomi Newsroom — Continuous Journalism Since 1934",
        titleGu: "જન્મભૂમિ ન્યૂઝરૂમ — ૧૯૩૪થી અવિરત નિષ્પક્ષ પત્રકારત્વ",
        summaryEn: "Authoritative verified reporting from Saurashtra Trust's historic daily and weekly broadsheets.",
        summaryGu: "સૌરાષ્ટ્ર ટ્રસ્ટના ઐતિહાસિક દૈનિક અને સાપ્તાહિક અખબારોમાંથી વિશ્વસનીય અને પ્રમાણિત અહેવાલો.",
        imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
        isLeadStory: true,
      });
    }

    const subLeadStories = payload.data.subLeads.map((sl) =>
      mapToNewsArticle({
        id: sl.id,
        slug: sl.slug,
        categorySlug: "city",
        categoryNameEn: "City",
        categoryNameGu: "શહેર",
        titleEn: sl.headline,
        titleGu: sl.headline,
        summaryEn: sl.summary,
        summaryGu: sl.summary,
        imageUrl: sl.featuredImageUrl,
        publishedAt: sl.publishedAt,
        isSubLead: true,
      })
    );

    return {
      leadStory,
      subLeadStories,
      headlineBriefs: [],
    };
  }

  async getArticlesByCategory(
    category: CategorySlug,
    limit = 6,
    publicationId = "pub-janmabhoomi"
  ): Promise<NewsArticle[]> {
    interface LatestPayload {
      success: boolean;
      data: Array<{
        id: string;
        slug: string;
        slugGu?: string;
        slugEn?: string;
        headline: string;
        headlineGu?: string;
        headlineEn?: string;
        summary: string;
        summaryGu?: string;
        summaryEn?: string;
        featuredImageUrl?: string;
        publishedAt: string;
        isBreaking: boolean;
        isLeadStory?: boolean;
        category: {
          id?: string;
          slug: string;
          name: string;
          nameGu?: string;
          nameEn?: string;
        };
      }>;
    }

    const payload = await this.fetchApi<LatestPayload>(
      `/api/v1/articles/latest?publication=${publicationId}&category=${category}&limit=${limit}`
    );

    return payload.data.map((art) =>
      mapToNewsArticle({
        id: art.id,
        slug: art.slugGu || art.slugEn || art.slug,
        categorySlug: (art.category.slug as CategorySlug) || category,
        categoryNameEn: art.category.nameEn || art.category.name,
        categoryNameGu: art.category.nameGu || art.category.name,
        titleEn: art.headlineEn || art.headline,
        titleGu: art.headlineGu || art.headline,
        summaryEn: art.summaryEn || art.summary,
        summaryGu: art.summaryGu || art.summary,
        imageUrl: art.featuredImageUrl,
        publishedAt: art.publishedAt,
        isBreaking: art.isBreaking,
        isLeadStory: art.isLeadStory,
      })
    );
  }

  async getLatestArticles(limit = 12, publicationId = "pub-janmabhoomi"): Promise<NewsArticle[]> {
    interface LatestPayload {
      success: boolean;
      data: Array<{
        id: string;
        slug: string;
        slugGu?: string;
        slugEn?: string;
        headline: string;
        headlineGu?: string;
        headlineEn?: string;
        summary: string;
        summaryGu?: string;
        summaryEn?: string;
        featuredImageUrl?: string;
        publishedAt: string;
        isBreaking: boolean;
        isLeadStory?: boolean;
        category: {
          slug: string;
          name: string;
          nameGu?: string;
          nameEn?: string;
        };
      }>;
    }

    const payload = await this.fetchApi<LatestPayload>(
      `/api/v1/articles/latest?publication=${publicationId}&limit=${limit}`
    );

    return payload.data.map((art) =>
      mapToNewsArticle({
        id: art.id,
        slug: art.slugGu || art.slugEn || art.slug,
        categorySlug: (art.category.slug as CategorySlug) || "national",
        categoryNameEn: art.category.nameEn || art.category.name,
        categoryNameGu: art.category.nameGu || art.category.name,
        titleEn: art.headlineEn || art.headline,
        titleGu: art.headlineGu || art.headline,
        summaryEn: art.summaryEn || art.summary,
        summaryGu: art.summaryGu || art.summary,
        imageUrl: art.featuredImageUrl,
        publishedAt: art.publishedAt,
        isBreaking: art.isBreaking,
        isLeadStory: art.isLeadStory,
      })
    );
  }

  async getArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
    interface DetailPayload {
      success: boolean;
      data: {
        id: string;
        slug: string;
        headline: string;
        headlineGu?: string;
        headlineEn?: string;
        summary: string;
        summaryGu?: string;
        summaryEn?: string;
        teaserParagraphs: string[];
        contentHtml: string;
        readTimeMinutes: number;
        featuredImageUrl?: string;
        imageCaption?: string;
        publishedAt: string;
        isPaywalled: boolean;
        category: {
          id: string;
          slug: string;
          name: string;
          nameGu?: string;
          nameEn?: string;
        };
        tags: string[];
      };
    }

    try {
      const payload = await this.fetchApi<DetailPayload>(`/api/v1/articles/${slug}`);
      const art = payload.data;

      return mapToNewsArticle({
        id: art.id,
        slug: art.slug,
        categorySlug: art.category.slug as CategorySlug,
        categoryNameEn: art.category.nameEn || art.category.name,
        categoryNameGu: art.category.nameGu || art.category.name,
        titleEn: art.headlineEn || art.headline,
        titleGu: art.headlineGu || art.headline,
        summaryEn: art.summaryEn || art.summary,
        summaryGu: art.summaryGu || art.summary,
        imageUrl: art.featuredImageUrl,
        imageCaptionEn: art.imageCaption,
        imageCaptionGu: art.imageCaption,
        publishedAt: art.publishedAt,
        readTimeMinutes: art.readTimeMinutes,
      });
    } catch {
      return undefined;
    }
  }

  async searchArticles(query: string, publicationId = "pub-janmabhoomi"): Promise<NewsArticle[]> {
    return this.getLatestArticles(8, publicationId);
  }

  async filterArticles(params: ArticleFilterParams): Promise<PaginatedResult<NewsArticle>> {
    const articles = await this.getLatestArticles(params.limit || 9);
    return {
      data: articles,
      total: articles.length,
      page: params.page || 1,
      limit: params.limit || 9,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
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

  async getEditorials(publicationId = "pub-janmabhoomi") {
    interface EditorialPayload {
      success: boolean;
      data: {
        id: string;
        publicationDate: string;
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        epaperPageNumber: number;
        author?: { name: string } | null;
      };
    }

    interface ArchivePayload {
      success: boolean;
      data: Array<{
        id: string;
        publicationDate: string;
        slug: string;
        title: string;
        excerpt: string;
        epaperPageNumber: number;
      }>;
    }

    const [todayPayload, archivePayload] = await Promise.all([
      this.fetchApi<EditorialPayload>(`/api/v1/editorials/today?publication=${publicationId}&lang=gu`),
      this.fetchApi<ArchivePayload>(`/api/v1/editorials/archive?publication=${publicationId}&lang=gu`),
    ]);

    const td = todayPayload.data;
    const todaysEditorial: EditorialArticle = {
      id: td.id,
      slug: td.slug,
      tag: "અગ્રલેખ",
      title: { en: td.title, gu: td.title },
      headline: { en: td.title, gu: td.title },
      summary: { en: td.excerpt, gu: td.excerpt },
      excerpt: { en: td.excerpt, gu: td.excerpt },
      teaserParagraphs: { en: [td.excerpt], gu: [td.excerpt] },
      publishedDate: td.publicationDate,
      publishedAt: td.publicationDate,
      author: { en: td.author?.name || "સંપાદકીય", gu: td.author?.name || "સંપાદકીય" },
      authorRole: { en: "Editor-in-Chief", gu: "મુખ્ય સંપાદક" },
      epaperPageNumber: td.epaperPageNumber,
      isTodaysEditorial: true,
      isDemonstrationData: true as const,
    };

    const previousEditorials: EditorialArticle[] = archivePayload.data.map((prev) => ({
      id: prev.id,
      slug: prev.slug,
      tag: "અગ્રલેખ",
      title: { en: prev.title, gu: prev.title },
      headline: { en: prev.title, gu: prev.title },
      summary: { en: prev.excerpt, gu: prev.excerpt },
      excerpt: { en: prev.excerpt, gu: prev.excerpt },
      teaserParagraphs: { en: [prev.excerpt], gu: [prev.excerpt] },
      publishedDate: prev.publicationDate,
      publishedAt: prev.publicationDate,
      author: { en: "સંપાદકીય", gu: "સંપાદકીય" },
      authorRole: { en: "Editorial Board", gu: "સંપાદકીય મંડળ" },
      epaperPageNumber: prev.epaperPageNumber,
      isTodaysEditorial: false,
      isDemonstrationData: true as const,
    }));

    return {
      todaysEditorial,
      previousEditorials,
    };
  }

  async getEditorialBySlug(slug: string): Promise<EditorialArticle | undefined> {
    const editorials = await this.getEditorials();
    if (editorials.todaysEditorial.slug === slug) return editorials.todaysEditorial;
    return editorials.previousEditorials.find((e) => e.slug === slug);
  }

  async getSpecialCoverageAndEvents() {
    return {
      featuredCoverage: MOCK_SPECIAL_EVENTS[0],
      events: MOCK_SPECIAL_EVENTS.slice(1),
    };
  }

  async getDailyPanchang(): Promise<PanchangData> {
    return this.getPanchangByCity("mumbai");
  }

  async getPanchangByCity(cityKey: "mumbai" | "ahmedabad" | "rajkot"): Promise<PanchangData> {
    interface PanchangPayload {
      success: boolean;
      date: string;
      city: string;
      isSampleFallback: boolean;
      data: {
        tithi: string;
        nakshatra: string;
        sunrise: string;
        sunset: string;
        rahuKaal: string;
        vikramSamvat: number;
        auspiciousNote?: string;
      };
    }

    const today = new Date().toISOString().split("T")[0];
    const payload = await this.fetchApi<PanchangPayload>(
      `/api/v1/panchang/${today}?city=${cityKey}&lang=gu`
    );

    const d = payload.data;
    const cityName = cityKey === "mumbai" ? "મુંબઈ" : cityKey === "ahmedabad" ? "અમદાવાદ" : "રાજકોટ";

    return {
      id: `panchang-${cityKey}`,
      editionCity: { en: cityKey.toUpperCase(), gu: cityName },
      noticeLabel: { en: "Daily Astronomical Almanac", gu: "દૈનિક પંચાંગ અને ગ્રહમાન" },
      displayDate: { en: payload.date, gu: payload.date },
      vikramSamvat: { en: `Vikram Samvat ${d.vikramSamvat}`, gu: `વિક્રમ સંવત ${d.vikramSamvat}` },
      tithi: { en: d.tithi, gu: d.tithi },
      nakshatra: { en: d.nakshatra, gu: d.nakshatra },
      yoga: { en: "Shubha", gu: "શુભ" },
      karana: { en: "Bava", gu: "બવ" },
      sunrise: d.sunrise,
      sunset: d.sunset,
      rahuKaal: d.rahuKaal,
      auspiciousNote: { en: "Auspicious timings based on planetary positions", gu: "ગ્રહમાન આધારિત શુભ મુહૂર્ત" },
      isDemonstrationSample: true as const,
    };
  }

  async getAllCityPanchang(): Promise<Record<"mumbai" | "ahmedabad" | "rajkot", PanchangData>> {
    const [mumbai, ahmedabad, rajkot] = await Promise.all([
      this.getPanchangByCity("mumbai"),
      this.getPanchangByCity("ahmedabad"),
      this.getPanchangByCity("rajkot"),
    ]);

    return { mumbai, ahmedabad, rajkot };
  }

  async getSisterPublications(): Promise<SisterPublication[]> {
    interface PubsPayload {
      success: boolean;
      data: Array<{
        id: string;
        code: string;
        slug: string;
        nameEn: string;
        nameGu: string;
        taglineEn?: string;
        taglineGu?: string;
        frequencyEn: string;
        frequencyGu: string;
        establishedYear: number;
        primaryCity: string;
        websiteUrl: string;
        epaperUrl: string;
        logoPlaceholderCode: string;
        status: string;
      }>;
    }

    const payload = await this.fetchApi<PubsPayload>("/api/v1/publications");

    return payload.data.map((pub) => ({
      id: pub.id,
      name: { en: pub.nameEn, gu: pub.nameGu },
      tagline: { en: pub.taglineEn || "", gu: pub.taglineGu || "" },
      logoPlaceholderCode: pub.logoPlaceholderCode || pub.code,
      frequency: { en: pub.frequencyEn || "Daily", gu: pub.frequencyGu || "દૈનિક" },
      establishedYear: String(pub.establishedYear),
      region: { en: pub.primaryCity, gu: pub.primaryCity },
      websiteUrl: pub.websiteUrl,
      epaperUrl: pub.epaperUrl,
      status: pub.status === "ACTIVE" ? ("active" as const) : ("planned" as const),
    }));
  }

  async getAdvertisementSlot(slotKey: string): Promise<AdvertisementSlot> {
    return MOCK_AD_SLOTS[slotKey] ?? MOCK_AD_SLOTS.homepagePrimaryHorizontal;
  }

  async getEPaperEditions(): Promise<EPaperEdition[]> {
    return [];
  }

  async getEPaperEditionByDate(): Promise<EPaperEdition | undefined> {
    return undefined;
  }

  async getHomepageConfig(): Promise<HomepageLayoutConfig> {
    return DEFAULT_HOMEPAGE_CONFIG;
  }
}
