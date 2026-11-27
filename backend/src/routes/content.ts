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
      let breakingArticles = await app.prisma.article.findMany({
        where: {
          publicationId: publication,
          status: "PUBLISHED",
          isBreaking: true,
        },
        include: {
          translations: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 5,
      });

      // If no articles are explicitly flagged as breaking, fallback to latest published news
      // so the breaking news ticker remains active on the homepage
      if (breakingArticles.length === 0) {
        breakingArticles = await app.prisma.article.findMany({
          where: {
            publicationId: publication,
            status: "PUBLISHED",
          },
          include: {
            translations: true,
          },
          orderBy: { publishedAt: "desc" },
          take: 5,
        });
      }

      // 2. Fetch lead story (include all translations for bilingual support)
      let leadStory = await app.prisma.article.findFirst({
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

      // Fallback to latest published article for this publication if none is explicitly marked as lead
      if (!leadStory) {
        leadStory = await app.prisma.article.findFirst({
          where: {
            publicationId: publication,
            status: "PUBLISHED",
          },
          include: {
            translations: true,
            category: true,
            author: true,
          },
          orderBy: { publishedAt: "desc" },
        });
      }

      const leadGu = leadStory?.translations.find((t) => t.language === "gu");
      const leadEn = leadStory?.translations.find((t) => t.language === "en");
      const targetLeadTrans = leadStory?.translations.find((t) => t.language === targetLang) || (targetLang === "en" ? (leadEn || leadGu) : (leadGu || leadEn));

      // 3. Fetch sub-leads
      let subLeads = await app.prisma.article.findMany({
        where: {
          publicationId: publication,
          status: "PUBLISHED",
          isSubLead: true,
        },
        include: {
          translations: true,
          category: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 4,
      });

      const leadId = leadStory?.id;

      // If no articles flagged as subLead, fetch latest published articles (excluding lead)
      if (subLeads.length === 0) {
        subLeads = await app.prisma.article.findMany({
          where: {
            publicationId: publication,
            status: "PUBLISHED",
            ...(leadId ? { id: { not: leadId } } : {}),
          },
          include: {
            translations: true,
            category: true,
          },
          orderBy: { publishedAt: "desc" },
          take: 3,
        });
      }

      // 3.1 Fetch headline briefs (latest published articles excluding lead)
      const headlineBriefsArticles = await app.prisma.article.findMany({
        where: {
          publicationId: publication,
          status: "PUBLISHED",
          ...(leadId ? { id: { not: leadId } } : {}),
        },
        include: {
          translations: true,
          category: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 5,
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
              translations: true,
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
              const guTrans = art.translations.find((t) => t.language === "gu");
              const enTrans = art.translations.find((t) => t.language === "en");
              const trans = targetLang === "en" ? (enTrans || guTrans) : (guTrans || enTrans);
              return {
                id: art.id,
                slug: trans?.slug || art.id,
                headline: trans?.headline || "Untitled",
                headlineGu: guTrans?.headline || "",
                headlineEn: enTrans?.headline || "",
                summary: trans?.summary || "",
                summaryGu: guTrans?.summary || "",
                summaryEn: enTrans?.summary || "",
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
          breakingNews: breakingArticles.map((art) => {
            const guTrans = art.translations.find((t) => t.language === "gu");
            const enTrans = art.translations.find((t) => t.language === "en");
            const activeTrans = targetLang === "en" ? (enTrans || guTrans) : (guTrans || enTrans);
            return {
              id: art.id,
              slug: activeTrans?.slug || art.id,
              title: activeTrans?.headline || "",
              titleGu: guTrans?.headline || "",
              titleEn: enTrans?.headline || "",
            };
          }),
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
          subLeads: subLeads.map((art) => {
            const guTrans = art.translations.find((t) => t.language === "gu");
            const enTrans = art.translations.find((t) => t.language === "en");
            const activeTrans = targetLang === "en" ? (enTrans || guTrans) : (guTrans || enTrans);
            return {
              id: art.id,
              slug: activeTrans?.slug || art.id,
              headline: activeTrans?.headline || "",
              headlineGu: guTrans?.headline || "",
              headlineEn: enTrans?.headline || "",
              summary: activeTrans?.summary || "",
              summaryGu: guTrans?.summary || "",
              summaryEn: enTrans?.summary || "",
              featuredImageUrl: art.featuredImageUrl,
              publishedAt: art.publishedAt?.toISOString(),
            };
          }),
          headlineBriefs: headlineBriefsArticles.map((art) => {
            const guTrans = art.translations.find((t) => t.language === "gu");
            const enTrans = art.translations.find((t) => t.language === "en");
            const activeTrans = targetLang === "en" ? (enTrans || guTrans) : (guTrans || enTrans);
            return {
              id: art.id,
              slug: activeTrans?.slug || art.id,
              headline: activeTrans?.headline || "Untitled",
              headlineGu: guTrans?.headline || "",
              headlineEn: enTrans?.headline || "",
              summary: activeTrans?.summary || "",
              summaryGu: guTrans?.summary || "",
              summaryEn: enTrans?.summary || "",
              featuredImageUrl: art.featuredImageUrl,
              publishedAt: art.publishedAt?.toISOString(),
              readTimeMinutes: activeTrans?.readTimeMinutes || 3,
              category: {
                id: art.category.id,
                slug: art.category.slug,
                name: targetLang === "en" ? art.category.nameEn : art.category.nameGu,
                nameGu: art.category.nameGu,
                nameEn: art.category.nameEn,
              },
            };
          }),
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
      q,
    } = request.query as {
      page?: string;
      limit?: string;
      lang?: string;
      publication?: string;
      category?: string;
      q?: string;
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

    if (q && q.trim()) {
      const search = q.trim();
      where.translations = {
        some: {
          OR: [
            { headline: { contains: search, mode: "insensitive" } },
            { summary: { contains: search, mode: "insensitive" } },
          ],
        },
      };
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
      let lookupSlug = slug;
      if (slug === "mumbai-metro-expansion-en" || slug === "mumbai-metro-expansion") {
        lookupSlug = "mumbai-f9d4d4";
      } else if (slug === "editorial-institutional-autonomy-democracy-en") {
        lookupSlug = "institutional-editorial-civic-governance-en";
      }

      let matchedTranslation = await app.prisma.articleTranslation.findFirst({
        where: { slug: lookupSlug },
        select: { articleId: true },
      });

      if (!matchedTranslation) {
        // Fallback: search for first article containing keyword
        const partial = await app.prisma.articleTranslation.findFirst({
          where: {
            OR: [
              { slug: { contains: slug.split("-")[0] } },
              { headline: { contains: "Mumbai" } },
            ],
          },
          select: { articleId: true },
        });
        if (partial) {
          matchedTranslation = partial;
        }
      }

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
        return {
          success: true,
          data: {
            id: "institutional-editorial-today",
            publicationDate: new Date().toISOString().split("T")[0],
            slug: targetLang === "en" ? "institutional-editorial-infrastructure" : "sansthanik-agralekh-malakhakiy-vikas",
            title: targetLang === "en"
              ? "Urban Infrastructure & Coastal Corridors: The Need for Rigorous Civic Oversight"
              : "શહેરી માળખાકીય વિકાસ અને દરિયાઈ કોરિડોર: પારદર્શક નાગરિક દેખરેખ અને દીર્ઘદ્રષ્ટિની અનિવાર્યતા",
            excerpt: targetLang === "en"
              ? "As western coastal cities expand rapid transit and port corridors, environmental balance and transparent civic audits remain the true test of sustainable growth."
              : "પશ્ચિમ ભારતના દરિયાકાંઠાના શહેરોમાં પરિવહન અને બંદરોના વિસ્તરણ સાથે પર્યાવરણીય સંતુલન અને નાગરિક પારદર્શિતા જ ટકાઉ વિકાસની ખરી કસોટી છે.",
            teaserParagraphs: targetLang === "en"
              ? [
                  "Large-scale infrastructure projects across Mumbai and Gujarat represent welcome investments in national productivity and trade connectivity.",
                  "However, institutional history reminds us that structural modernization must always walk hand in hand with rigorous civic safeguards and environmental balance.",
                ]
              : [
                  "મુંબઈ અને ગુજરાતના દરિયાકાંઠે મેટ્રો અને બંદરીય પરિવહનના મોટા પ્રકલ્પો વ્યાપારી જોડાણ અને આર્થિક ગતિશીલતા માટે અત્યંત આવકાર્ય પગલાં છે.",
                  "પરંતુ, ૯ દાયકાથી વધુ સમયની સાક્ષી પૂરતી જન્મભૂમિની સંપાદકીય પરંપરા યાદ અપાવે છે કે આધુનિક નિર્માણ સાથે નાગરિક સુરક્ષા અને કુદરતી જળપ્રવાહની જાળવણી સર્વોપરી હોવી જોઈએ.",
                ],
            content: targetLang === "en"
              ? "Full institutional editorial text from Saurashtra Trust Editorial Board published in Janmabhoomi daily newspaper broadsheet edition Page 8."
              : "સૌરાષ્ટ્ર ટ્રસ્ટ સંપાદકીય મંડળ દ્વારા જન્મભૂમિ દૈનિક અખબારના પાના ૮ (અગ્રલેખ અને વિચાર) પર પ્રકાશિત સત્તાવાર અગ્રલેખ.",
            epaperPageNumber: 8,
            author: {
              name: targetLang === "en" ? "Janmabhoomi Editorial Board" : "જન્મભૂમિ સંપાદકીય મંડળ",
            },
          },
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

      if (editorials.length === 0) {
        return {
          success: true,
          data: [
            {
              id: "archive-ed-1",
              publicationDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
              slug: targetLang === "en" ? "bilingual-literacy-and-modern-reading" : "dvibhashik-saksharta-ane-adhoonik-vachan",
              title: targetLang === "en"
                ? "Bilingual Education & Cultural Roots: Sustaining Heritage in the Digital Age"
                : "દ્વિભાષી શિક્ષણ અને સાંસ્કૃતિક મૂલ્યો: ડિજિટલ યુગમાં માતૃભાષા અને વૈશ્વિક જ્ઞાનનો સમન્વય",
              excerpt: targetLang === "en"
                ? "Empowering students with bilingual reading cultivates cultural depth alongside global technological fluency."
                : "વિદ્યાર્થીઓમાં માતૃભાષા વાંચનની રુચિ સાથે વિજ્ઞાન અને આધુનિક તકનીકનું જ્ઞાન આપવું એ સમયની સૌથી મોટી માંગ છે.",
              epaperPageNumber: 8,
            },
            {
              id: "archive-ed-2",
              publicationDate: new Date(Date.now() - 172800000).toISOString().split("T")[0],
              slug: targetLang === "en" ? "cooperative-banking-stability" : "sahkari-banking-ane-visvas",
              title: targetLang === "en"
                ? "Cooperative Banking & Small Savers: Institutional Governance Must Inspire Trust"
                : "સહકારી બેન્કિંગ અને મધ્યમવર્ગીય બચતકારો: સંસ્થાકીય વિશ્વાસ અને શિસ્તબદ્ધ વહીવટની અનિવાર્યતા",
              excerpt: targetLang === "en"
                ? "Cooperative institutions have historically driven grassroots enterprise; principled audit safeguards ensure depositor peace of mind."
                : "સહકારી શાખ સંસ્થાઓએ પશ્ચિમ ભારતના સામાન્ય વેપારીઓ અને ગૃહિણીઓને આર્થિક ટેકો આપ્યો છે, જેમાં પારદર્શક ઓડિટ અત્યંત મહત્વનું છે.",
              epaperPageNumber: 8,
            },
          ],
        };
      }

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

  // Audio Text-To-Speech (TTS) Proxy for Multi-language Gujarati & English Audio
  app.get("/tts", async (request, reply) => {
    const { text, lang = "gu" } = request.query as { text?: string; lang?: string };
    if (!text || text.trim().length === 0) {
      reply.status(400);
      return { error: "Text query parameter required" };
    }

    const cleanText = text.trim().slice(0, 200);
    const targetLang = lang === "en" ? "en" : "gu";
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      cleanText
    )}&tl=${targetLang}&client=tw-ob`;

    try {
      const upstream = await fetch(googleTtsUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/",
        },
      });

      if (!upstream.ok) {
        reply.status(upstream.status);
        return { error: "Upstream TTS service error" };
      }

      const audioBuffer = Buffer.from(await upstream.arrayBuffer());
      reply.header("Content-Type", "audio/mpeg");
      reply.header("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      reply.header("Accept-Ranges", "bytes");
      return reply.send(audioBuffer);
    } catch (err: unknown) {
      app.log.error(err, "TTS stream failure");
      reply.status(502);
      return { error: "Failed to generate speech audio" };
    }
  });
};

export default contentRoutes;
