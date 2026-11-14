import { FastifyInstance, FastifyPluginAsync } from "fastify";

export const contentRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  /**
   * GET /api/v1/publications
   * Returns all active and planned Saurashtra Trust publications.
   */
  app.get("/publications", async (request, reply) => {
    try {
      const publications = await app.prisma.publication.findMany({
        orderBy: { establishedYear: "asc" },
      });

      return {
        success: true,
        count: publications.length,
        data: publications,
      };
    } catch (err: unknown) {
      app.log.error(err, "Failed to fetch publications from database");
      reply.status(503);
      return {
        success: false,
        error: "Database is currently unavailable. Cannot fetch publications.",
      };
    }
  });

  /**
   * GET /api/v1/categories
   * Returns news taxonomy categories.
   */
  app.get("/categories", async (request, reply) => {
    try {
      const categories = await app.prisma.category.findMany({
        orderBy: { slug: "asc" },
      });

      return {
        success: true,
        count: categories.length,
        data: categories,
      };
    } catch (err: unknown) {
      app.log.error(err, "Failed to fetch categories");
      reply.status(503);
      return {
        success: false,
        error: "Database is currently unavailable. Cannot fetch categories.",
      };
    }
  });

  /**
   * GET /api/v1/articles/home
   * Returns aggregated homepage payload: breaking news, lead story, sub-leads, and category previews.
   */
  app.get("/articles/home", async (request, reply) => {
    const { lang = "gu", publication = "pub-janmabhoomi" } = request.query as {
      lang?: string;
      publication?: string;
    };
    const targetLang = lang === "en" ? "en" : "gu";

    try {
      // 1. Fetch breaking news
      const breakingArticles = await app.prisma.article.findMany({
        where: {
          publicationId: publication,
          status: "PUBLISHED",
          isBreaking: true,
        },
        include: {
          translations: { where: { language: targetLang } },
        },
        orderBy: { publishedAt: "desc" },
        take: 5,
      });

      // 2. Fetch lead story (include all translations for bilingual support)
      const leadStory = await app.prisma.article.findFirst({
        where: {
          publicationId: publication,
          status: "PUBLISHED",
          isLeadStory: true,
        },
        include: {
          translations: true,
          category: true,
          author: true,
        },
        orderBy: { publishedAt: "desc" },
      });

      const leadGu = leadStory?.translations.find((t) => t.language === "gu");
      const leadEn = leadStory?.translations.find((t) => t.language === "en");
      const targetLeadTrans = leadStory?.translations.find((t) => t.language === targetLang) || leadGu || leadEn;

      // 3. Fetch sub-leads
      const subLeads = await app.prisma.article.findMany({
        where: {
          publicationId: publication,
          status: "PUBLISHED",
          isSubLead: true,
        },
        include: {
          translations: { where: { language: targetLang } },
          category: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 4,
      });

      // 4. Fetch category sections
      const categories = await app.prisma.category.findMany({
        take: 6,
      });

      const categorySections = await Promise.all(
        categories.map(async (cat) => {
          const articles = await app.prisma.article.findMany({
            where: {
              publicationId: publication,
              categoryId: cat.id,
              status: "PUBLISHED",
            },
            include: {
              translations: { where: { language: targetLang } },
            },
            orderBy: { publishedAt: "desc" },
            take: 4,
          });

          return {
            category: {
              id: cat.id,
              slug: cat.slug,
              name: targetLang === "en" ? cat.nameEn : cat.nameGu,
            },
            articles: articles.map((art) => {
              const trans = art.translations[0];
              return {
                id: art.id,
                slug: trans?.slug || art.id,
                headline: trans?.headline || "Untitled",
                summary: trans?.summary || "",
                imageUrl: art.featuredImageUrl,
                publishedAt: art.publishedAt?.toISOString(),
                readTimeMinutes: trans?.readTimeMinutes || 3,
              };
            }),
          };
        })
      );

      return {
        success: true,
        language: targetLang,
        data: {
          breakingNews: breakingArticles.map((art) => ({
            id: art.id,
            slug: art.translations[0]?.slug || art.id,
            title: art.translations[0]?.headline || "",
          })),
          leadStory: leadStory
            ? {
                id: leadStory.id,
                slug: targetLeadTrans?.slug || leadStory.id,
                slugGu: leadGu?.slug || leadStory.id,
                slugEn: leadEn?.slug || leadStory.id,
                headline: targetLeadTrans?.headline || "",
                headlineGu: leadGu?.headline || "",
                headlineEn: leadEn?.headline || leadGu?.headline || "",
                summary: targetLeadTrans?.summary || "",
                summaryGu: leadGu?.summary || "",
                summaryEn: leadEn?.summary || leadGu?.summary || "",
                featuredImageUrl: leadStory.featuredImageUrl,
                publishedAt: leadStory.publishedAt?.toISOString(),
                category: {
                  id: leadStory.category.id,
                  slug: leadStory.category.slug,
                  name: targetLang === "en" ? leadStory.category.nameEn : leadStory.category.nameGu,
                  nameGu: leadStory.category.nameGu,
                  nameEn: leadStory.category.nameEn,
                },
              }
            : null,
          subLeads: subLeads.map((art) => ({
            id: art.id,
            slug: art.translations[0]?.slug || art.id,
            headline: art.translations[0]?.headline || "",
            summary: art.translations[0]?.summary || "",
            featuredImageUrl: art.featuredImageUrl,
            publishedAt: art.publishedAt?.toISOString(),
          })),
          categorySections,
        },
      };
    } catch (err: unknown) {
      app.log.error(err, "Failed to load homepage content from database");
      reply.status(503);
      return {
        success: false,
        error: "Database is currently unavailable. Cannot load homepage articles.",
      };
    }
  });

  /**
   * GET /api/v1/articles/latest
   * Paginated stream of latest published news articles.
   */
  app.get("/articles/latest", async (request, reply) => {
    const {
      page = "1",
      limit = "20",
      lang = "gu",
      publication = "pub-janmabhoomi",
      category,
    } = request.query as {
      page?: string;
      limit?: string;
      lang?: string;
      publication?: string;
      category?: string;
    };

    const targetLang = lang === "en" ? "en" : "gu";
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const takeCount = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skipCount = (pageNum - 1) * takeCount;

    const where: any = {
      publicationId: publication,
      status: "PUBLISHED",
    };

    if (category) {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    try {
      const [totalCount, articles] = await Promise.all([
        app.prisma.article.count({ where }),
        app.prisma.article.findMany({
          where,
          include: {
            translations: true,
            category: true,
            author: true,
          },
          orderBy: { publishedAt: "desc" },
          skip: skipCount,
          take: takeCount,
        }),
      ]);

      return {
        success: true,
        pagination: {
          page: pageNum,
          limit: takeCount,
          total: totalCount,
          totalPages: Math.ceil(totalCount / takeCount),
        },
        data: articles.map((art) => {
          const guTrans = art.translations.find((t) => t.language === "gu");
          const enTrans = art.translations.find((t) => t.language === "en");
          const targetTrans = art.translations.find((t) => t.language === targetLang) || guTrans || enTrans;

          return {
            id: art.id,
            slug: targetTrans?.slug || art.id,
            slugGu: guTrans?.slug || art.id,
            slugEn: enTrans?.slug || art.id,
            headline: targetTrans?.headline || "Untitled",
            headlineGu: guTrans?.headline || "",
            headlineEn: enTrans?.headline || guTrans?.headline || "",
            summary: targetTrans?.summary || "",
            summaryGu: guTrans?.summary || "",
            summaryEn: enTrans?.summary || guTrans?.summary || "",
            featuredImageUrl: art.featuredImageUrl,
            publishedAt: art.publishedAt?.toISOString(),
            isBreaking: art.isBreaking,
            isLeadStory: art.isLeadStory,
            category: {
              id: art.category.id,
              slug: art.category.slug,
              name: targetLang === "en" ? art.category.nameEn : art.category.nameGu,
              nameGu: art.category.nameGu,
              nameEn: art.category.nameEn,
            },
          };
        }),
      };
    } catch (err: unknown) {
      app.log.error(err, "Failed to load latest articles from database");
      reply.status(503);
      return {
        success: false,
        error: "Database is currently unavailable. Cannot load latest articles.",
      };
    }
  });

  /**
   * GET /api/v1/articles/:slug
   * Single article detail payload by URL slug.
   * Privacy Enforced:
   * - Only PUBLISHED articles or SCHEDULED articles whose scheduledFor time has elapsed are visible.
   * - DRAFTS, UNDER_REVIEW, and ARCHIVED articles remain private (return 404).
   * - Resolves alternate language slugs for seamless bilingual switching (/gu <-> /en).
   */
  app.get("/articles/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const { lang = "gu" } = request.query as { lang?: string };
    const targetLang = lang === "en" ? "en" : "gu";

    try {
      // 1. Find matching translation to resolve article ID across languages
      const matchedTranslation = await app.prisma.articleTranslation.findFirst({
        where: { slug },
        select: { articleId: true },
      });

      if (!matchedTranslation) {
        reply.status(404);
        return {
          success: false,
          error: "Article not found.",
        };
      }

      // 2. Fetch the article with publication status privacy enforcement
      const now = new Date();
      const article = await app.prisma.article.findFirst({
        where: {
          id: matchedTranslation.articleId,
          OR: [
            { status: "PUBLISHED" },
            {
              status: "SCHEDULED",
              scheduledFor: { lte: now },
            },
          ],
        },
        include: {
          category: true,
          author: true,
          tags: { include: { tag: true } },
          translations: true,
        },
      });

      if (!article) {
        reply.status(404);
        return {
          success: false,
          error: "Article not found or not published.",
        };
      }

      // 3. Select target translation or fallback to primary language
      let translation = article.translations.find((t) => t.language === targetLang);
      if (!translation) {
        translation =
          article.translations.find((t) => t.language === article.primaryLanguage) ||
          article.translations[0];
      }

      const guTrans = article.translations.find((t) => t.language === "gu");
      const enTrans = article.translations.find((t) => t.language === "en");

      return {
        success: true,
        data: {
          id: article.id,
          slug: translation.slug,
          alternateSlugs: {
            gu: guTrans?.slug || null,
            en: enTrans?.slug || null,
          },
          headline: translation.headline,
          headlineGu: guTrans?.headline || "",
          headlineEn: enTrans?.headline || guTrans?.headline || "",
          summary: translation.summary,
          summaryGu: guTrans?.summary || "",
          summaryEn: enTrans?.summary || guTrans?.summary || "",
          teaserParagraphs: translation.teaserParagraphs,
          contentHtml: translation.contentHtml,
          metaTitle: translation.metaTitle,
          metaDescription: translation.metaDescription,
          readTimeMinutes: translation.readTimeMinutes,
          featuredImageUrl: article.featuredImageUrl,
          imageCaption: targetLang === "en" ? article.imageCaptionEn : article.imageCaptionGu,
          publishedAt: article.publishedAt?.toISOString(),
          isPaywalled: article.isPaywalled,
          category: {
            id: article.category.id,
            slug: article.category.slug,
            name: targetLang === "en" ? article.category.nameEn : article.category.nameGu,
            nameGu: article.category.nameGu,
            nameEn: article.category.nameEn,
          },
          author: article.author
            ? {
                name: targetLang === "en" ? article.author.nameEn : article.author.nameGu,
                avatarUrl: article.author.avatarUrl,
              }
            : null,
          tags: article.tags.map((t) => (targetLang === "en" ? t.tag.nameEn : t.tag.nameGu)),
        },
      };
    } catch (err: unknown) {
      app.log.error(err, "Failed to load article detail from database");
      reply.status(503);
      return {
        success: false,
        error: "Database is currently unavailable. Cannot load article detail.",
      };
    }
  });

  /**
   * GET /api/v1/editorials/today
   * Returns today's lead editorial piece.
   */
  app.get("/editorials/today", async (request, reply) => {
    const { publication = "pub-janmabhoomi", lang = "gu" } = request.query as {
      publication?: string;
      lang?: string;
    };
    const targetLang = lang === "en" ? "en" : "gu";

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const editorial = await app.prisma.editorial.findFirst({
        where: {
          publicationId: publication,
          status: "PUBLISHED",
        },
        orderBy: { publicationDate: "desc" },
        include: { author: true },
      });

      if (!editorial) {
        reply.status(404);
        return {
          success: false,
          error: "No editorial published for today.",
        };
      }

      return {
        success: true,
        data: {
          id: editorial.id,
          publicationDate: editorial.publicationDate.toISOString().split("T")[0],
          slug: targetLang === "en" ? editorial.slugEn : editorial.slugGu,
          title: targetLang === "en" ? editorial.titleEn : editorial.titleGu,
          excerpt: targetLang === "en" ? editorial.excerptEn : editorial.excerptGu,
          teaserParagraphs:
            targetLang === "en" ? editorial.teaserParagraphsEn : editorial.teaserParagraphsGu,
          content: targetLang === "en" ? editorial.contentEn : editorial.contentGu,
          epaperPageNumber: editorial.epaperPageNumber,
          author: editorial.author
            ? {
                name: targetLang === "en" ? editorial.author.nameEn : editorial.author.nameGu,
              }
            : null,
        },
      };
    } catch (err: unknown) {
      app.log.error(err, "Failed to load editorial from database");
      reply.status(503);
      return {
        success: false,
        error: "Database is currently unavailable. Cannot load editorial.",
      };
    }
  });

  /**
   * GET /api/v1/editorials/archive
   * Historical editorial pieces by year and month.
   */
  app.get("/editorials/archive", async (request, reply) => {
    const {
      publication = "pub-janmabhoomi",
      year,
      month,
      lang = "gu",
    } = request.query as {
      publication?: string;
      year?: string;
      month?: string;
      lang?: string;
    };
    const targetLang = lang === "en" ? "en" : "gu";

    try {
      const editorials = await app.prisma.editorial.findMany({
        where: {
          publicationId: publication,
          status: "PUBLISHED",
        },
        orderBy: { publicationDate: "desc" },
        take: 30,
      });

      return {
        success: true,
        data: editorials.map((ed) => ({
          id: ed.id,
          publicationDate: ed.publicationDate.toISOString().split("T")[0],
          slug: targetLang === "en" ? ed.slugEn : ed.slugGu,
          title: targetLang === "en" ? ed.titleEn : ed.titleGu,
          excerpt: targetLang === "en" ? ed.excerptEn : ed.excerptGu,
          epaperPageNumber: ed.epaperPageNumber,
        })),
      };
    } catch (err: unknown) {
      app.log.error(err, "Failed to load editorial archive");
      reply.status(503);
      return {
        success: false,
        error: "Database is currently unavailable. Cannot load editorial archive.",
      };
    }
  });

  /**
   * GET /api/v1/panchang/:date
   * City-wise astronomical data for calendar date.
   */
  app.get("/panchang/:date", async (request, reply) => {
    const { date } = request.params as { date: string };
    const { city = "mumbai", lang = "gu" } = request.query as {
      city?: string;
      lang?: string;
    };
    const targetLang = lang === "en" ? "en" : "gu";

    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        reply.status(400);
        return { success: false, error: "Invalid date format. Expected YYYY-MM-DD" };
      }

      const panchang = await app.prisma.panchangDaily.findFirst({
        where: {
          calendarDate: parsedDate,
          city: city.toLowerCase(),
        },
      });

      if (!panchang) {
        // Return structured demo response or 404
        return {
          success: true,
          date,
          city,
          isSampleFallback: true,
          data: {
            tithi: targetLang === "en" ? "Kartik Sud Nom" : "કારતક સુદ નોમ",
            nakshatra: targetLang === "en" ? "Shatabhisha" : "શતભિષા",
            sunrise: "06:45 AM",
            sunset: "06:05 PM",
            rahuKaal: "10:30 AM - 12:00 PM",
            vikramSamvat: 2083,
          },
        };
      }

      return {
        success: true,
        date,
        city,
        isSampleFallback: panchang.isDemoSample,
        data: {
          tithi: targetLang === "en" ? panchang.tithiEn : panchang.tithiGu,
          nakshatra: targetLang === "en" ? panchang.nakshatraEn : panchang.nakshatraGu,
          sunrise: panchang.sunriseTime,
          sunset: panchang.sunsetTime,
          rahuKaal: panchang.rahuKaal,
          vikramSamvat: panchang.vikramSamvat,
          auspiciousNote:
            targetLang === "en" ? panchang.auspiciousNoteEn : panchang.auspiciousNoteGu,
        },
      };
    } catch (err: unknown) {
      app.log.error(err, "Failed to load Panchang from database");
      reply.status(503);
      return {
        success: false,
        error: "Database is currently unavailable. Cannot load Panchang.",
      };
    }
  });
};

export default contentRoutes;
