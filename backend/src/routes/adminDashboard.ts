import { FastifyPluginAsync } from "fastify";
import {
  verifyStaffAuth,
  PERMITTED_PUBLICATION_IDS,
  isPermittedPublicationId,
} from "../services/staffAuthService.js";

export const adminDashboardRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", verifyStaffAuth);

  /**
   * GET /api/v1/admin/dashboard/stats
   * Unified dashboard stats scoped strictly to the TWO permitted newspaper publications:
   * 1. Janmabhoomi (pub-janmabhoomi)
   * 2. Janmabhoomi Pravasi (pub-pravasi)
   *
   * Note: Purti is not a separate publication; it represents supplements bundled with editions.
   *
   * Admin receives content, enquiries, AND financial/subscriber figures.
   * Editor receives editorial & e-paper figures only (financial & enquiry counts restricted).
   */
  app.get("/stats", getDashboardStats);
  app.get("/dashboard/stats", getDashboardStats);

  async function getDashboardStats(req: any, reply: any) {
    const role = req.unifiedRole!;
    const publicationIds = [...PERMITTED_PUBLICATION_IDS];

    // Editorial stats scoped strictly to the 2 permitted publications
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      scheduledArticles,
      totalEditions,
      archiveEnquiriesCount,
      contactEnquiriesCount,
      janmabhoomiCount,
      pravasiCount,
      transCompletedCount,
      transFailedCount,
      transAttentionCount,
      categoryCounts,
      recentArticles,
    ] = await Promise.all([
      app.prisma.article.count({
        where: { publicationId: { in: publicationIds } },
      }),
      app.prisma.article.count({
        where: {
          publicationId: { in: publicationIds },
          status: "PUBLISHED",
        },
      }),
      app.prisma.article.count({
        where: {
          publicationId: { in: publicationIds },
          status: "DRAFT",
        },
      }),
      app.prisma.article.count({
        where: {
          publicationId: { in: publicationIds },
          status: "SCHEDULED",
        },
      }),
      app.prisma.ePaperEdition.count({
        where: { publicationId: { in: publicationIds } },
      }),
      app.prisma.archiveEnquiry.count({
        where: { publicationId: { in: publicationIds } },
      }),
      app.prisma.contactEnquiry.count(),
      app.prisma.article.count({
        where: { publicationId: "pub-janmabhoomi" },
      }),
      app.prisma.article.count({
        where: { publicationId: "pub-pravasi" },
      }),
      app.prisma.articleTranslation.count({
        where: {
          language: "en",
          translationStatus: "COMPLETED",
          article: { publicationId: { in: publicationIds } },
        },
      }),
      app.prisma.articleTranslation.count({
        where: {
          language: "en",
          translationStatus: "FAILED",
          article: { publicationId: { in: publicationIds } },
        },
      }),
      app.prisma.articleTranslation.count({
        where: {
          language: "en",
          translationStatus: { in: ["NEEDS_ATTENTION", "OUTDATED"] },
          article: { publicationId: { in: publicationIds } },
        },
      }),
      app.prisma.article.groupBy({
        by: ["categoryId"],
        where: { publicationId: { in: publicationIds } },
        _count: { id: true },
      }),
      app.prisma.article.findMany({
        where: {
          publicationId: { in: publicationIds },
          status: "PUBLISHED",
        },
        include: {
          category: true,
          publication: true,
          translations: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
    ]);

    const formattedRecent = recentArticles.map((art) => {
      const guTrans = art.translations.find((t) => t.language === "gu");
      const enTrans = art.translations.find((t) => t.language === "en");
      return {
        id: art.id,
        publicationId: art.publicationId,
        publicationName: art.publication.nameGu,
        category: art.category.nameGu,
        headlineGu: guTrans?.headline || "Untitled",
        headlineEn: enTrans?.headline || null,
        publishedAt: art.publishedAt ? art.publishedAt.toISOString() : null,
      };
    });

    // Financial & subscriber stats (Admin only)
    let financialStats: {
      totalSubscribers: number;
      activeSubscriptions: number;
      totalRevenueInr: number;
      totalTransactions: number;
    } | null = null;

    // Enquiries stats (Admin only - Editors are not automatically granted enquiry access)
    let enquiriesStats: {
      archiveEnquiriesCount: number;
      contactEnquiriesCount: number;
    } | null = null;

    if (role === "Admin") {
      const [totalSubscribers, activeSubscriptions, paymentAggregate, totalTransactions] =
        await Promise.all([
          app.prisma.subscriber.count({ where: { status: "ACTIVE" } }),
          app.prisma.userSubscription.count({
            where: {
              status: "ACTIVE",
              plan: {
                publicationId: { in: publicationIds },
              },
            },
          }),
          app.prisma.paymentTransaction.aggregate({
            _sum: { amountPaise: true },
            where: { status: "CAPTURED" },
          }),
          app.prisma.paymentTransaction.count(),
        ]);

      financialStats = {
        totalSubscribers,
        activeSubscriptions,
        totalRevenueInr: Math.round((Number(paymentAggregate._sum.amountPaise || 0) / 100) * 100) / 100,
        totalTransactions,
      };

      enquiriesStats = {
        archiveEnquiriesCount,
        contactEnquiriesCount,
      };
    }

    return reply.status(200).send({
      success: true,
      data: {
        role,
        permittedPublications: PERMITTED_PUBLICATION_IDS,
        publicationsCount: PERMITTED_PUBLICATION_IDS.length,
        content: {
          totalArticles,
          publishedArticles,
          draftArticles,
          scheduledArticles,
          totalEditions,
          byPublication: {
            janmabhoomi: janmabhoomiCount,
            pravasi: pravasiCount,
          },
          byCategory: categoryCounts.map((c) => ({
            categoryId: c.categoryId,
            count: c._count.id,
          })),
          translation: {
            completed: transCompletedCount,
            failed: transFailedCount,
            needsAttention: transAttentionCount,
          },
          recentPublishedArticles: formattedRecent,
        },
        enquiries: enquiriesStats,
        financial: financialStats,
      },
    });
  }

  /**
   * GET /api/v1/admin/publications
   * Returns strictly the TWO permitted newspaper publications.
   */
  app.get("/publications", async (_req, reply) => {
    const publications = await app.prisma.publication.findMany({
      where: {
        id: { in: [...PERMITTED_PUBLICATION_IDS] },
      },
      select: {
        id: true,
        code: true,
        slug: true,
        publicationType: true,
        nameEn: true,
        nameGu: true,
        taglineEn: true,
        taglineGu: true,
        frequencyEn: true,
        frequencyGu: true,
        establishedYear: true,
        primaryCity: true,
        websiteUrl: true,
        epaperUrl: true,
        status: true,
        _count: {
          select: {
            articles: true,
            epaperEditions: true,
            archiveEnquiries: true,
          },
        },
      },
      orderBy: { establishedYear: "asc" },
    });

    return reply.status(200).send({
      success: true,
      data: publications,
    });
  });

  /**
   * GET /api/v1/admin/publications/:id
   * Rejects excluded publications with 403 Forbidden.
   */
  app.get("/publications/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    if (!isPermittedPublicationId(id)) {
      return reply.status(403).send({
        success: false,
        error: {
          code: "PUBLICATION_NOT_PERMITTED",
          message: `Publication '${id}' is outside the scope of the Janmabhoomi Admin Panel. Only Janmabhoomi (pub-janmabhoomi) and Janmabhoomi Pravasi (pub-pravasi) are managed here.`,
        },
      });
    }

    const publication = await app.prisma.publication.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
            epaperEditions: true,
            archiveEnquiries: true,
          },
        },
      },
    });

    if (!publication) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Publication not found." },
      });
    }

    return reply.status(200).send({
      success: true,
      data: publication,
    });
  });
};
