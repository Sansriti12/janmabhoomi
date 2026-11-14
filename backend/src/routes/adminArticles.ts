import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import crypto from "node:crypto";
import {
  requireAdminRole,
  isPermittedPublicationId,
  PERMITTED_PUBLICATION_IDS,
} from "../services/staffAuthService.js";
import {
  getTranslationProvider,
  runAutomatedQualityChecks,
  computeSourceHash,
} from "../services/translationService.js";

// Helper to generate a clean URL-friendly slug
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const safeBase = base.length > 0 ? base.slice(0, 100) : "article";
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${safeBase}-${suffix}`;
}

const createArticleSchema = z.object({
  publicationId: z.string().refine((id) => isPermittedPublicationId(id), {
    message: "Invalid publication. Only Janmabhoomi (pub-janmabhoomi) and Janmabhoomi Pravasi (pub-pravasi) are permitted.",
  }),
  categoryId: z.string().min(1, "Category is required"),
  authorId: z.string().uuid().optional(),
  headlineGu: z.string().min(5, "Gujarati headline must be at least 5 characters"),
  summaryGu: z.string().min(10, "Gujarati summary must be at least 10 characters"),
  contentHtmlGu: z.string().min(20, "Gujarati content body must be at least 20 characters"),
  isBreaking: z.boolean().default(false),
  isLeadStory: z.boolean().default(false),
  isSubLead: z.boolean().default(false),
  isHeadlineBrief: z.boolean().default(false),
  isPaywalled: z.boolean().default(false),
  featuredImageUrl: z.string().url().max(500).optional().or(z.literal("")),
  imageCaptionGu: z.string().max(500).optional(),
  imageCaptionEn: z.string().max(500).optional(),
  epaperPageNumber: z.number().int().min(1).max(100).optional(),
  publishImmediately: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

const updateArticleSchema = z.object({
  publicationId: z.string().refine((id) => isPermittedPublicationId(id)).optional(),
  categoryId: z.string().min(1).optional(),
  authorId: z.string().uuid().nullable().optional(),
  headlineGu: z.string().min(5).optional(),
  summaryGu: z.string().min(10).optional(),
  contentHtmlGu: z.string().min(20).optional(),
  isBreaking: z.boolean().optional(),
  isLeadStory: z.boolean().optional(),
  isSubLead: z.boolean().optional(),
  isHeadlineBrief: z.boolean().optional(),
  isPaywalled: z.boolean().optional(),
  featuredImageUrl: z.string().url().max(500).nullable().optional().or(z.literal("")),
  imageCaptionGu: z.string().max(500).nullable().optional(),
  imageCaptionEn: z.string().max(500).nullable().optional(),
  epaperPageNumber: z.number().int().min(1).max(100).nullable().optional(),
  retranslate: z.boolean().default(true),
});

const editEnglishTranslationSchema = z.object({
  headlineEn: z.string().min(5, "English headline must be at least 5 characters"),
  summaryEn: z.string().min(10, "English summary must be at least 10 characters"),
  contentHtmlEn: z.string().min(20, "English content body must be at least 20 characters"),
  metaTitleEn: z.string().max(200).optional(),
  metaDescriptionEn: z.string().max(300).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"], {
    errorMap: () => ({ message: "Status must be DRAFT, SCHEDULED, PUBLISHED, or ARCHIVED" }),
  }),
  scheduledFor: z.string().datetime().optional(),
});

/**
 * Helper: Dispatches on-demand ISR revalidation to the Next.js frontend if configured.
 */
export async function triggerFrontendRevalidation(slugGu: string, slugEn?: string, log?: any) {
  const revalidateUrl = process.env.FRONTEND_REVALIDATE_URL;
  const revalidateSecret = process.env.REVALIDATION_SECRET || "jb_secret_revalidate_token_2026";

  if (!revalidateUrl) return;

  try {
    await fetch(revalidateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: revalidateSecret,
        paths: [
          `/gu/article/${slugGu}`,
          slugEn ? `/en/article/${slugEn}` : null,
          `/gu`,
          `/en`,
        ].filter(Boolean),
      }),
    });
  } catch (err) {
    if (log && typeof log.warn === "function") {
      log.warn({ err }, "Frontend cache revalidation notification failed");
    } else {
      console.warn("Frontend cache revalidation notification failed", err);
    }
  }
}

// Helper to escape CSV cell fields
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""').replace(/\r?\n/g, " ");
  return `"${str}"`;
}

/**
 * Promotes SCHEDULED articles whose scheduledFor time has elapsed to PUBLISHED.
 * Uses atomic compare-and-swap (status: "SCHEDULED") to safely handle multi-instance execution.
 * Records audit logs and triggers ISR cache revalidation.
 */
export async function publishDueScheduledArticles(prisma: any, log?: any): Promise<number> {
  const now = new Date();
  const dueArticles = await prisma.article.findMany({
    where: {
      status: "SCHEDULED",
      scheduledFor: { lte: now },
    },
    include: {
      translations: true,
    },
  });

  if (dueArticles.length === 0) return 0;

  let publishedCount = 0;

  for (const article of dueArticles) {
    try {
      const guTrans = article.translations.find((t: any) => t.language === "gu");
      const enTrans = article.translations.find((t: any) => t.language === "en");

      // Concurrency guard: update atomically only if status is still SCHEDULED
      const updateResult = await prisma.article.updateMany({
        where: {
          id: article.id,
          status: "SCHEDULED",
        },
        data: {
          status: "PUBLISHED",
          publishedAt: article.scheduledFor || now,
        },
      });

      // If another backend instance or concurrent call already updated this article, skip duplicate processing
      if (updateResult.count === 0) {
        continue;
      }

      publishedCount++;

      await prisma.auditLog.create({
        data: {
          userId: article.updatedBy || article.createdBy,
          action: "ARTICLE_AUTO_PUBLISHED_FROM_SCHEDULE",
          entityName: "Article",
          entityId: article.id,
          newValues: {
            status: "PUBLISHED",
            publishedAt: (article.scheduledFor || now).toISOString(),
          },
        },
      });

      if (guTrans) {
        triggerFrontendRevalidation(guTrans.slug, enTrans?.slug, log).catch(() => {});
      }
    } catch (articleErr) {
      if (log && typeof log.error === "function") {
        log.error({ err: articleErr, articleId: article.id }, "Failed to auto-publish scheduled article; will retry on next tick");
      }
    }
  }

  if (log && publishedCount > 0) {
    log.info({ count: publishedCount }, "Auto-published due scheduled articles");
  }
  return publishedCount;
}

export const adminArticlesRoutes: FastifyPluginAsync = async (app) => {
  // All article operations in the Newsroom Desk require Admin role
  app.addHook("preHandler", requireAdminRole);

  /**
   * POST /api/v1/admin/articles/process-scheduled
   * Triggers evaluation and publication of all due scheduled articles.
   */
  app.post("/process-scheduled", async (req, reply) => {
    const count = await publishDueScheduledArticles(app.prisma, app.log);
    return reply.status(200).send({
      success: true,
      message: `Processed scheduled articles: ${count} published.`,
      publishedCount: count,
    });
  });

  /**
   * GET /api/v1/admin/articles/export/csv
   * Exports filtered article dataset as standard CSV.
   */
  app.get("/export/csv", async (req, reply) => {
    const query = req.query as {
      publicationId?: string;
      categoryId?: string;
      status?: string;
      translationStatus?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    };

    if (query.publicationId && !isPermittedPublicationId(query.publicationId)) {
      return reply.status(403).send({
        success: false,
        error: {
          code: "PUBLICATION_NOT_PERMITTED",
          message: `Publication '${query.publicationId}' is not managed in this Admin Panel.`,
        },
      });
    }

    const where: any = {
      publicationId: query.publicationId
        ? query.publicationId
        : { in: [...PERMITTED_PUBLICATION_IDS] },
    };

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { translations: { some: { headline: { contains: query.search, mode: "insensitive" } } } },
        { translations: { some: { summary: { contains: query.search, mode: "insensitive" } } } },
      ];
    }

    if (query.translationStatus) {
      where.translations = {
        some: {
          language: "en",
          translationStatus: query.translationStatus,
        },
      };
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const articles = await app.prisma.article.findMany({
      where,
      include: {
        category: true,
        publication: true,
        creator: { select: { fullName: true } },
        publisher: { select: { fullName: true } },
        translations: true,
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const headers = [
      "Article ID",
      "Publication",
      "Category",
      "Status",
      "Translation Status",
      "Source Version",
      "Gujarati Headline",
      "English Headline",
      "Created By",
      "Published At",
      "Scheduled For",
      "Created At",
    ];

    const rows = articles.map((art) => {
      const gu = art.translations.find((t) => t.language === "gu");
      const en = art.translations.find((t) => t.language === "en");
      return [
        escapeCsv(art.id),
        escapeCsv(art.publication.nameEn),
        escapeCsv(art.category.nameEn),
        escapeCsv(art.status),
        escapeCsv(en?.translationStatus || "NOT_GENERATED"),
        escapeCsv(art.sourceVersion),
        escapeCsv(gu?.headline || ""),
        escapeCsv(en?.headline || ""),
        escapeCsv(art.creator?.fullName || "Admin"),
        escapeCsv(art.publishedAt ? art.publishedAt.toISOString() : ""),
        escapeCsv(art.scheduledFor ? art.scheduledFor.toISOString() : ""),
        escapeCsv(art.createdAt.toISOString()),
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.map(escapeCsv).join(","), ...rows].join("\r\n");

    reply.header("Content-Type", "text/csv; charset=utf-8");
    reply.header("Content-Disposition", 'attachment; filename="janmabhoomi-articles-export.csv"');
    return reply.status(200).send(csvContent);
  });

  /**
   * GET /api/v1/admin/articles
   * Paginated list of articles with multi-criteria filters.
   */
  app.get("/", async (req, reply) => {
    // Automatically promote due scheduled articles on list query
    await publishDueScheduledArticles(app.prisma, app.log);
    const query = req.query as {
      publicationId?: string;
      categoryId?: string;
      status?: string;
      translationStatus?: string;
      search?: string;
      page?: string;
      limit?: string;
      startDate?: string;
      endDate?: string;
    };

    if (query.publicationId && !isPermittedPublicationId(query.publicationId)) {
      return reply.status(403).send({
        success: false,
        error: {
          code: "PUBLICATION_NOT_PERMITTED",
          message: `Publication '${query.publicationId}' is not managed in this Admin Panel.`,
        },
      });
    }

    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      publicationId: query.publicationId
        ? query.publicationId
        : { in: [...PERMITTED_PUBLICATION_IDS] },
    };

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { translations: { some: { headline: { contains: query.search, mode: "insensitive" } } } },
        { translations: { some: { summary: { contains: query.search, mode: "insensitive" } } } },
      ];
    }

    if (query.translationStatus) {
      where.translations = {
        some: {
          language: "en",
          translationStatus: query.translationStatus,
        },
      };
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [total, articles] = await Promise.all([
      app.prisma.article.count({ where }),
      app.prisma.article.findMany({
        where,
        include: {
          category: true,
          publication: true,
          translations: true,
          creator: { select: { id: true, fullName: true, email: true } },
          publisher: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const formatted = articles.map((art) => {
      const guTrans = art.translations.find((t) => t.language === "gu");
      const enTrans = art.translations.find((t) => t.language === "en");

      return {
        id: art.id,
        publicationId: art.publicationId,
        publicationName: art.publication.nameGu,
        category: {
          id: art.category.id,
          nameGu: art.category.nameGu,
          nameEn: art.category.nameEn,
          slug: art.category.slug,
        },
        status: art.status,
        headlineGu: guTrans?.headline || "Untitled",
        headlineEn: enTrans?.headline || null,
        slugGu: guTrans?.slug || null,
        slugEn: enTrans?.slug || null,
        translationStatus: enTrans?.translationStatus || "NOT_GENERATED",
        qualityWarnings: (enTrans?.translationQualityWarnings as string[]) || [],
        isBreaking: art.isBreaking,
        isLeadStory: art.isLeadStory,
        isPaywalled: art.isPaywalled,
        featuredImageUrl: art.featuredImageUrl,
        publishedAt: art.publishedAt ? art.publishedAt.toISOString() : null,
        scheduledFor: art.scheduledFor ? art.scheduledFor.toISOString() : null,
        createdBy: art.creator?.fullName || "Admin",
        createdAt: art.createdAt.toISOString(),
      };
    });

    return reply.status(200).send({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: formatted,
    });
  });

  /**
   * POST /api/v1/admin/articles
   * Central Newsroom Article Creation:
   * 1. Saves Gujarati original.
   * 2. Automatically generates English translation via Translation Engine.
   * 3. Runs automated quality checks and detects sensitive content.
   * 4. Saves bilingual database records.
   */
  app.post("/", async (req, reply) => {
    const parseResult = createArticleSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid article input",
        },
      });
    }

    const data = parseResult.data;
    const staffId = req.staffUser!.id;
    const staffIp = req.ip || "127.0.0.1";

    const sourceHash = computeSourceHash(data.headlineGu, data.summaryGu, data.contentHtmlGu);
    const slugGu = generateSlug(data.headlineGu);

    // 1. Create Article & Gujarati Translation
    const article = await app.prisma.article.create({
      data: {
        publicationId: data.publicationId,
        categoryId: data.categoryId,
        authorId: data.authorId || null,
        status: "DRAFT",
        primaryLanguage: "gu",
        sourceVersion: 1,
        sourceHash,
        isBreaking: data.isBreaking,
        isLeadStory: data.isLeadStory,
        isSubLead: data.isSubLead,
        isHeadlineBrief: data.isHeadlineBrief,
        isPaywalled: data.isPaywalled,
        featuredImageUrl: data.featuredImageUrl || null,
        imageCaptionGu: data.imageCaptionGu || null,
        imageCaptionEn: data.imageCaptionEn || null,
        epaperPageNumber: data.epaperPageNumber || null,
        createdBy: staffId,
      },
    });

    // Enforce single lead story per publication if marked as lead
    if (data.isLeadStory) {
      await app.prisma.article.updateMany({
        where: {
          publicationId: data.publicationId,
          id: { not: article.id },
          isLeadStory: true,
        },
        data: { isLeadStory: false },
      });
    }

    // Save Gujarati Translation
    await app.prisma.articleTranslation.create({
      data: {
        articleId: article.id,
        language: "gu",
        slug: slugGu,
        headline: data.headlineGu,
        summary: data.summaryGu,
        teaserParagraphs: [data.summaryGu],
        contentHtml: data.contentHtmlGu,
        metaTitle: `${data.headlineGu} | જન્મભૂમિ`,
        metaDescription: data.summaryGu.slice(0, 160),
        translationStatus: "COMPLETED",
        sourceVersionAtTranslation: 1,
        sourceHashAtTranslation: sourceHash,
      },
    });

    // 2. Automatically generate English translation via active Translation Provider
    const provider = getTranslationProvider();
    let enTranslation: any = null;
    let qualityResult: any = null;

    try {
      const translationResult = await provider.translate({
        headlineGu: data.headlineGu,
        summaryGu: data.summaryGu,
        contentHtmlGu: data.contentHtmlGu,
      });

      qualityResult = runAutomatedQualityChecks(
        {
          headlineGu: data.headlineGu,
          summaryGu: data.summaryGu,
          contentHtmlGu: data.contentHtmlGu,
        },
        translationResult
      );

      const slugEn = generateSlug(translationResult.headlineEn);

      enTranslation = await app.prisma.articleTranslation.create({
        data: {
          articleId: article.id,
          language: "en",
          slug: slugEn,
          headline: translationResult.headlineEn,
          summary: translationResult.summaryEn,
          teaserParagraphs: [translationResult.summaryEn],
          contentHtml: translationResult.contentHtmlEn,
          metaTitle: translationResult.metaTitleEn,
          metaDescription: translationResult.metaDescriptionEn,
          translationStatus: qualityResult.status,
          translationQualityWarnings: qualityResult.warnings,
          sourceVersionAtTranslation: 1,
          sourceHashAtTranslation: sourceHash,
          aiProvider: translationResult.provider,
          aiModel: translationResult.model,
          tokensUsed: translationResult.tokensUsed,
          estimatedCostUsd: translationResult.estimatedCostUsd,
          translatedAt: new Date(),
        },
      });
    } catch (transErr: any) {
      app.log.error(transErr, "Auto-translation failed during article creation");

      // Save placeholder failed translation record so Admin can retry
      enTranslation = await app.prisma.articleTranslation.create({
        data: {
          articleId: article.id,
          language: "en",
          slug: `en-${slugGu}`,
          headline: `[Translation Pending] ${data.headlineGu}`,
          summary: data.summaryGu,
          teaserParagraphs: [data.summaryGu],
          contentHtml: `<p>${data.contentHtmlGu}</p>`,
          translationStatus: "FAILED",
          translationError: transErr.message || "Translation provider failure",
          sourceVersionAtTranslation: 1,
          sourceHashAtTranslation: sourceHash,
        },
      });
    }

    // 3. Handle immediate publication if requested and translation was successful
    let finalStatus = "DRAFT";
    let publishedAt: Date | null = null;

    if (data.publishImmediately) {
      if (enTranslation && enTranslation.translationStatus !== "FAILED") {
        finalStatus = "PUBLISHED";
        publishedAt = new Date();
        await app.prisma.article.update({
          where: { id: article.id },
          data: {
            status: "PUBLISHED",
            publishedAt,
            publishedBy: staffId,
          },
        });
        await triggerFrontendRevalidation(slugGu, enTranslation.slug);
      }
    }

    // 4. Record audit log
    await app.prisma.auditLog.create({
      data: {
        userId: staffId,
        action: data.publishImmediately ? "ARTICLE_CREATED_AND_PUBLISHED" : "ARTICLE_CREATED_DRAFT",
        entityName: "Article",
        entityId: article.id,
        newValues: {
          headlineGu: data.headlineGu,
          status: finalStatus,
          publicationId: data.publicationId,
          translationStatus: enTranslation?.translationStatus,
        },
        ipAddress: staffIp,
      },
    });

    return reply.status(201).send({
      success: true,
      message: data.publishImmediately && finalStatus === "PUBLISHED"
        ? "Article created and published successfully."
        : "Gujarati article saved as draft. English translation generated.",
      data: {
        id: article.id,
        status: finalStatus,
        publishedAt: publishedAt ? publishedAt.toISOString() : null,
        gujarati: {
          headline: data.headlineGu,
          slug: slugGu,
        },
        english: enTranslation
          ? {
              headline: enTranslation.headline,
              slug: enTranslation.slug,
              translationStatus: enTranslation.translationStatus,
              qualityWarnings: enTranslation.translationQualityWarnings || [],
            }
          : null,
      },
    });
  });

  /**
   * GET /api/v1/admin/articles/:id
   * Complete bilingual article detail payload for the side-by-side newsroom editor.
   */
  app.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const article = await app.prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        publication: true,
        translations: true,
        creator: { select: { id: true, fullName: true, email: true } },
        publisher: { select: { id: true, fullName: true } },
      },
    });

    if (!article) {
      return reply.status(404).send({
        success: false,
        error: { code: "ARTICLE_NOT_FOUND", message: "Article not found." },
      });
    }

    const guTrans = article.translations.find((t) => t.language === "gu");
    const enTrans = article.translations.find((t) => t.language === "en");

    return reply.status(200).send({
      success: true,
      data: {
        id: article.id,
        publicationId: article.publicationId,
        publicationNameGu: article.publication.nameGu,
        publicationNameEn: article.publication.nameEn,
        categoryId: article.categoryId,
        category: {
          id: article.category.id,
          nameGu: article.category.nameGu,
          nameEn: article.category.nameEn,
          slug: article.category.slug,
        },
        status: article.status,
        sourceVersion: article.sourceVersion,
        isBreaking: article.isBreaking,
        isLeadStory: article.isLeadStory,
        isSubLead: article.isSubLead,
        isHeadlineBrief: article.isHeadlineBrief,
        isPaywalled: article.isPaywalled,
        featuredImageUrl: article.featuredImageUrl,
        imageCaptionGu: article.imageCaptionGu,
        imageCaptionEn: article.imageCaptionEn,
        epaperPageNumber: article.epaperPageNumber,
        publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
        scheduledFor: article.scheduledFor ? article.scheduledFor.toISOString() : null,
        createdBy: article.creator?.fullName || "Admin",
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),

        gujarati: guTrans
          ? {
              id: guTrans.id,
              slug: guTrans.slug,
              headline: guTrans.headline,
              summary: guTrans.summary,
              contentHtml: guTrans.contentHtml,
              metaTitle: guTrans.metaTitle,
              metaDescription: guTrans.metaDescription,
            }
          : null,

        english: enTrans
          ? {
              id: enTrans.id,
              slug: enTrans.slug,
              headline: enTrans.headline,
              summary: enTrans.summary,
              contentHtml: enTrans.contentHtml,
              metaTitle: enTrans.metaTitle,
              metaDescription: enTrans.metaDescription,
              translationStatus: enTrans.translationStatus,
              qualityWarnings: (enTrans.translationQualityWarnings as string[]) || [],
              isManuallyEdited: enTrans.isManuallyEdited,
              aiProvider: enTrans.aiProvider,
              aiModel: enTrans.aiModel,
              translatedAt: enTrans.translatedAt ? enTrans.translatedAt.toISOString() : null,
              previousHeadline: enTrans.previousHeadline,
              previousSummary: enTrans.previousSummary,
              previousContentHtml: enTrans.previousContentHtml,
            }
          : null,
      },
    });
  });

  /**
   * GET /api/v1/admin/articles/:id/history
   * Complete audit trail and revision history for an article.
   */
  app.get("/:id/history", async (req, reply) => {
    const { id } = req.params as { id: string };

    const article = await app.prisma.article.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, fullName: true, email: true } },
        publisher: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!article) {
      return reply.status(404).send({
        success: false,
        error: { code: "ARTICLE_NOT_FOUND", message: "Article not found." },
      });
    }

    const auditLogs = await app.prisma.auditLog.findMany({
      where: {
        entityName: "Article",
        entityId: id,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return reply.status(200).send({
      success: true,
      data: {
        articleId: article.id,
        sourceVersion: article.sourceVersion,
        status: article.status,
        createdBy: article.creator?.fullName || "Admin",
        createdAt: article.createdAt.toISOString(),
        publishedBy: article.publisher?.fullName || null,
        publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
        scheduledFor: article.scheduledFor ? article.scheduledFor.toISOString() : null,
        updatedAt: article.updatedAt.toISOString(),
        history: auditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          actor: log.user?.fullName || "Admin",
          actorEmail: log.user?.email || null,
          oldValues: log.oldValues,
          newValues: log.newValues,
          ipAddress: log.ipAddress,
          timestamp: log.createdAt.toISOString(),
        })),
      },
    });
  });

  /**
   * PUT /api/v1/admin/articles/:id
   * Updates Gujarati source or article metadata.
   * Auto-detects changes to Gujarati source:
   * - Increments sourceVersion.
   * - Preserves previous English translation into previous* fields.
   * - Marks English translation OUTDATED or regenerates translation.
   */
  app.put("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parseResult = updateArticleSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid update input",
        },
      });
    }

    const data = parseResult.data;
    const staffId = req.staffUser!.id;
    const staffIp = req.ip || "127.0.0.1";

    const article = await app.prisma.article.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!article) {
      return reply.status(404).send({
        success: false,
        error: { code: "ARTICLE_NOT_FOUND", message: "Article not found." },
      });
    }

    const guTrans = article.translations.find((t) => t.language === "gu");
    const enTrans = article.translations.find((t) => t.language === "en");

    const newHeadlineGu = data.headlineGu ?? guTrans?.headline ?? "";
    const newSummaryGu = data.summaryGu ?? guTrans?.summary ?? "";
    const newContentGu = data.contentHtmlGu ?? guTrans?.contentHtml ?? "";

    const newSourceHash = computeSourceHash(newHeadlineGu, newSummaryGu, newContentGu);
    const sourceChanged = newSourceHash !== article.sourceHash;

    const newSourceVersion = sourceChanged ? article.sourceVersion + 1 : article.sourceVersion;

    // 1. Update Article record
    const updatedArticle = await app.prisma.article.update({
      where: { id },
      data: {
        publicationId: data.publicationId ?? article.publicationId,
        categoryId: data.categoryId ?? article.categoryId,
        authorId: data.authorId !== undefined ? data.authorId : article.authorId,
        isBreaking: data.isBreaking !== undefined ? data.isBreaking : article.isBreaking,
        isLeadStory: data.isLeadStory !== undefined ? data.isLeadStory : article.isLeadStory,
        isSubLead: data.isSubLead !== undefined ? data.isSubLead : article.isSubLead,
        isHeadlineBrief: data.isHeadlineBrief !== undefined ? data.isHeadlineBrief : article.isHeadlineBrief,
        isPaywalled: data.isPaywalled !== undefined ? data.isPaywalled : article.isPaywalled,
        featuredImageUrl: data.featuredImageUrl !== undefined ? data.featuredImageUrl || null : article.featuredImageUrl,
        imageCaptionGu: data.imageCaptionGu !== undefined ? data.imageCaptionGu : article.imageCaptionGu,
        imageCaptionEn: data.imageCaptionEn !== undefined ? data.imageCaptionEn : article.imageCaptionEn,
        epaperPageNumber: data.epaperPageNumber !== undefined ? data.epaperPageNumber : article.epaperPageNumber,
        sourceVersion: newSourceVersion,
        sourceHash: newSourceHash,
        updatedBy: staffId,
      },
    });

    // Enforce single lead story per publication if marked as lead
    if (data.isLeadStory) {
      await app.prisma.article.updateMany({
        where: {
          publicationId: updatedArticle.publicationId,
          id: { not: id },
          isLeadStory: true,
        },
        data: { isLeadStory: false },
      });
    }

    // 2. Update Gujarati Translation record if text changed
    if (guTrans) {
      await app.prisma.articleTranslation.update({
        where: { id: guTrans.id },
        data: {
          headline: newHeadlineGu,
          summary: newSummaryGu,
          teaserParagraphs: [newSummaryGu],
          contentHtml: newContentGu,
          metaTitle: `${newHeadlineGu} | જન્મભૂમિ`,
          metaDescription: newSummaryGu.slice(0, 160),
          sourceVersionAtTranslation: newSourceVersion,
          sourceHashAtTranslation: newSourceHash,
        },
      });
    }

    // 3. Handle English translation sync when Gujarati source changed
    let enUpdated = enTrans;
    if (sourceChanged && enTrans) {
      if (data.retranslate) {
        // Run Translation Provider
        const provider = getTranslationProvider();
        try {
          const transResult = await provider.translate({
            headlineGu: newHeadlineGu,
            summaryGu: newSummaryGu,
            contentHtmlGu: newContentGu,
          });

          const qualityResult = runAutomatedQualityChecks(
            { headlineGu: newHeadlineGu, summaryGu: newSummaryGu, contentHtmlGu: newContentGu },
            transResult
          );

          enUpdated = await app.prisma.articleTranslation.update({
            where: { id: enTrans.id },
            data: {
              previousHeadline: enTrans.headline,
              previousSummary: enTrans.summary,
              previousContentHtml: enTrans.contentHtml,
              headline: transResult.headlineEn,
              summary: transResult.summaryEn,
              teaserParagraphs: [transResult.summaryEn],
              contentHtml: transResult.contentHtmlEn,
              metaTitle: transResult.metaTitleEn,
              metaDescription: transResult.metaDescriptionEn,
              translationStatus: qualityResult.status,
              translationQualityWarnings: qualityResult.warnings,
              sourceVersionAtTranslation: newSourceVersion,
              sourceHashAtTranslation: newSourceHash,
              translatedAt: new Date(),
            },
          });
        } catch {
          // If auto retranslation failed, preserve content and mark OUTDATED
          enUpdated = await app.prisma.articleTranslation.update({
            where: { id: enTrans.id },
            data: {
              translationStatus: "OUTDATED",
              translationQualityWarnings: [
                "Gujarati source updated. Auto-translation failed; please retry or edit manually.",
              ],
            },
          });
        }
      } else {
        // Retranslation not requested: Mark OUTDATED
        enUpdated = await app.prisma.articleTranslation.update({
          where: { id: enTrans.id },
          data: {
            translationStatus: "OUTDATED",
            translationQualityWarnings: [
              "Gujarati source was updated. English translation is outdated.",
            ],
          },
        });
      }
    }

    // If published, trigger cache revalidation
    if (article.status === "PUBLISHED" && guTrans) {
      await triggerFrontendRevalidation(guTrans.slug, enUpdated?.slug);
    }

    // Audit log
    await app.prisma.auditLog.create({
      data: {
        userId: staffId,
        action: "ARTICLE_UPDATED",
        entityName: "Article",
        entityId: id,
        newValues: {
          headlineGu: newHeadlineGu,
          sourceChanged,
          newSourceVersion,
        },
        ipAddress: staffIp,
      },
    });

    return reply.status(200).send({
      success: true,
      message: sourceChanged
        ? "Article updated and English translation synchronized."
        : "Article updated successfully.",
      data: {
        id: updatedArticle.id,
        sourceVersion: newSourceVersion,
        sourceChanged,
        translationStatus: enUpdated?.translationStatus,
      },
    });
  });

  /**
   * POST /api/v1/admin/articles/:id/translate
   * Manually triggers or retries English translation.
   */
  app.post("/:id/translate", async (req, reply) => {
    const { id } = req.params as { id: string };
    const staffId = req.staffUser!.id;

    const article = await app.prisma.article.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!article) {
      return reply.status(404).send({
        success: false,
        error: { code: "ARTICLE_NOT_FOUND", message: "Article not found." },
      });
    }

    const guTrans = article.translations.find((t) => t.language === "gu");
    const enTrans = article.translations.find((t) => t.language === "en");

    if (!guTrans) {
      return reply.status(400).send({
        success: false,
        error: { code: "NO_GUJARATI_SOURCE", message: "Gujarati source article is missing." },
      });
    }

    // Duplicate concurrent translation request prevention
    if (
      enTrans &&
      enTrans.translationStatus === "PROCESSING" &&
      enTrans.updatedAt &&
      Date.now() - enTrans.updatedAt.getTime() < 30000
    ) {
      return reply.status(409).send({
        success: false,
        error: {
          code: "TRANSLATION_IN_PROGRESS",
          message: "A translation request for this article is already in progress. Please wait a few moments.",
        },
      });
    }

    if (enTrans) {
      await app.prisma.articleTranslation.update({
        where: { id: enTrans.id },
        data: { translationStatus: "PROCESSING" },
      });
    }

    const provider = getTranslationProvider();

    try {
      const transResult = await provider.translate({
        headlineGu: guTrans.headline,
        summaryGu: guTrans.summary,
        contentHtmlGu: guTrans.contentHtml,
      });

      const qualityResult = runAutomatedQualityChecks(
        {
          headlineGu: guTrans.headline,
          summaryGu: guTrans.summary,
          contentHtmlGu: guTrans.contentHtml,
        },
        transResult
      );

      const sourceHash = article.sourceHash || computeSourceHash(guTrans.headline, guTrans.summary, guTrans.contentHtml);

      let savedEn;
      if (enTrans) {
        savedEn = await app.prisma.articleTranslation.update({
          where: { id: enTrans.id },
          data: {
            previousHeadline: enTrans.headline,
            previousSummary: enTrans.summary,
            previousContentHtml: enTrans.contentHtml,
            headline: transResult.headlineEn,
            summary: transResult.summaryEn,
            teaserParagraphs: [transResult.summaryEn],
            contentHtml: transResult.contentHtmlEn,
            metaTitle: transResult.metaTitleEn,
            metaDescription: transResult.metaDescriptionEn,
            translationStatus: qualityResult.status,
            translationQualityWarnings: qualityResult.warnings,
            sourceVersionAtTranslation: article.sourceVersion,
            sourceHashAtTranslation: sourceHash,
            aiProvider: transResult.provider,
            aiModel: transResult.model,
            tokensUsed: transResult.tokensUsed,
            estimatedCostUsd: transResult.estimatedCostUsd,
            translatedAt: new Date(),
            retryCount: enTrans.retryCount + 1,
            translationError: null,
          },
        });
      } else {
        const slugEn = generateSlug(transResult.headlineEn);
        savedEn = await app.prisma.articleTranslation.create({
          data: {
            articleId: article.id,
            language: "en",
            slug: slugEn,
            headline: transResult.headlineEn,
            summary: transResult.summaryEn,
            teaserParagraphs: [transResult.summaryEn],
            contentHtml: transResult.contentHtmlEn,
            metaTitle: transResult.metaTitleEn,
            metaDescription: transResult.metaDescriptionEn,
            translationStatus: qualityResult.status,
            translationQualityWarnings: qualityResult.warnings,
            sourceVersionAtTranslation: article.sourceVersion,
            sourceHashAtTranslation: sourceHash,
            aiProvider: transResult.provider,
            aiModel: transResult.model,
            tokensUsed: transResult.tokensUsed,
            estimatedCostUsd: transResult.estimatedCostUsd,
            translatedAt: new Date(),
          },
        });
      }

      await app.prisma.auditLog.create({
        data: {
          userId: staffId,
          action: "ARTICLE_TRANSLATION_TRIGGERED",
          entityName: "Article",
          entityId: id,
          newValues: { translationStatus: qualityResult.status },
          ipAddress: req.ip || "127.0.0.1",
        },
      });

      return reply.status(200).send({
        success: true,
        message: "English translation generated successfully.",
        data: {
          headlineEn: savedEn.headline,
          summaryEn: savedEn.summary,
          contentHtmlEn: savedEn.contentHtml,
          translationStatus: savedEn.translationStatus,
          qualityWarnings: savedEn.translationQualityWarnings,
        },
      });
    } catch (err: any) {
      if (enTrans) {
        await app.prisma.articleTranslation.update({
          where: { id: enTrans.id },
          data: {
            translationStatus: "FAILED",
            translationError: err.message || "Translation error",
            retryCount: enTrans.retryCount + 1,
          },
        });
      }

      return reply.status(500).send({
        success: false,
        error: {
          code: "TRANSLATION_FAILED",
          message: err.message || "Failed to generate English translation.",
        },
      });
    }
  });

  /**
   * PUT /api/v1/admin/articles/:id/translation/en
   * Admin manually edits the English translation.
   * Marks isManuallyEdited: true, translationStatus: COMPLETED.
   */
  app.put("/:id/translation/en", async (req, reply) => {
    const { id } = req.params as { id: string };
    const staffId = req.staffUser!.id;

    const parseResult = editEnglishTranslationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid input data",
        },
      });
    }

    const { headlineEn, summaryEn, contentHtmlEn, metaTitleEn, metaDescriptionEn } = parseResult.data;

    const enTrans = await app.prisma.articleTranslation.findFirst({
      where: { articleId: id, language: "en" },
    });

    if (!enTrans) {
      return reply.status(404).send({
        success: false,
        error: { code: "TRANSLATION_NOT_FOUND", message: "English translation not found." },
      });
    }

    const updated = await app.prisma.articleTranslation.update({
      where: { id: enTrans.id },
      data: {
        headline: headlineEn,
        summary: summaryEn,
        teaserParagraphs: [summaryEn],
        contentHtml: contentHtmlEn,
        metaTitle: metaTitleEn || `${headlineEn} | Janmabhoomi`,
        metaDescription: metaDescriptionEn || summaryEn.slice(0, 160),
        isManuallyEdited: true,
        lastEditedBy: staffId,
        translationStatus: "COMPLETED",
        translationQualityWarnings: [], // Cleared on manual editorial approval
      },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: staffId,
        action: "ENGLISH_TRANSLATION_MANUALLY_EDITED",
        entityName: "ArticleTranslation",
        entityId: enTrans.id,
        newValues: { headlineEn },
        ipAddress: req.ip || "127.0.0.1",
      },
    });

    return reply.status(200).send({
      success: true,
      message: "English translation updated successfully.",
      data: updated,
    });
  });

  /**
   * PATCH /api/v1/admin/articles/:id/status
   * Central Admin Publishing & Scheduling Endpoint:
   * Rules:
   * - Only Admin can publish or schedule news.
   * - Gujarati article must have completed English translation before publishing.
   * - Cannot publish if English translation status is 'FAILED'.
   */
  app.patch("/:id/status", async (req, reply) => {
    const { id } = req.params as { id: string };
    const staffId = req.staffUser!.id;

    const parseResult = updateStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid status transition",
        },
      });
    }

    const { status, scheduledFor } = parseResult.data;

    const article = await app.prisma.article.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!article) {
      return reply.status(404).send({
        success: false,
        error: { code: "ARTICLE_NOT_FOUND", message: "Article not found." },
      });
    }

    const guTrans = article.translations.find((t) => t.language === "gu");
    const enTrans = article.translations.find((t) => t.language === "en");

    // Publishing validation
    if (status === "PUBLISHED" || status === "SCHEDULED") {
      if (!guTrans) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "MISSING_GUJARATI_SOURCE",
            message: "Cannot publish: Gujarati article source is missing.",
          },
        });
      }

      if (!enTrans || enTrans.translationStatus === "FAILED") {
        return reply.status(400).send({
          success: false,
          error: {
            code: "TRANSLATION_REQUIRED",
            message: "Cannot publish: Valid English translation is required before publication.",
          },
        });
      }

      if (status === "SCHEDULED" && !scheduledFor) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "SCHEDULE_DATE_REQUIRED",
            message: "scheduledFor ISO timestamp is required when scheduling publication.",
          },
        });
      }
    }

    const now = new Date();
    const updateData: any = {
      status,
      updatedBy: staffId,
    };

    if (status === "PUBLISHED") {
      updateData.publishedAt = article.publishedAt || now;
      updateData.publishedBy = staffId;
    } else if (status === "SCHEDULED") {
      updateData.scheduledFor = new Date(scheduledFor!);
    }

    const updated = await app.prisma.article.update({
      where: { id },
      data: updateData,
    });

    if (status === "PUBLISHED" && guTrans) {
      await triggerFrontendRevalidation(guTrans.slug, enTrans?.slug);
    }

    await app.prisma.auditLog.create({
      data: {
        userId: staffId,
        action: `ARTICLE_STATUS_${status}`,
        entityName: "Article",
        entityId: id,
        oldValues: { status: article.status },
        newValues: { status },
        ipAddress: req.ip || "127.0.0.1",
      },
    });

    return reply.status(200).send({
      success: true,
      message: `Article status successfully updated to ${status}.`,
      data: {
        id: updated.id,
        status: updated.status,
        publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
        scheduledFor: updated.scheduledFor ? updated.scheduledFor.toISOString() : null,
      },
    });
  });

  /**
   * DELETE /api/v1/admin/articles/:id
   * Admin archives or unpublishes an article.
   */
  app.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const staffId = req.staffUser!.id;

    const article = await app.prisma.article.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!article) {
      return reply.status(404).send({
        success: false,
        error: { code: "ARTICLE_NOT_FOUND", message: "Article not found." },
      });
    }

    // Soft archive
    await app.prisma.article.update({
      where: { id },
      data: { status: "ARCHIVED", updatedBy: staffId },
    });

    const guTrans = article.translations.find((t) => t.language === "gu");
    const enTrans = article.translations.find((t) => t.language === "en");
    if (guTrans) {
      await triggerFrontendRevalidation(guTrans.slug, enTrans?.slug);
    }

    await app.prisma.auditLog.create({
      data: {
        userId: staffId,
        action: "ARTICLE_ARCHIVED",
        entityName: "Article",
        entityId: id,
        ipAddress: req.ip || "127.0.0.1",
      },
    });

    return reply.status(200).send({
      success: true,
      message: "Article archived successfully.",
    });
  });
};
