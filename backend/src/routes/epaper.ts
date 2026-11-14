import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import crypto from "node:crypto";
import { epaperStorage } from "../storage/storageProvider.js";
import { EpaperPdfProcessor } from "../services/epaperProcessor.js";
import { env } from "../config/env.js";
import { isPermittedPublicationId, PERMITTED_PUBLICATION_IDS } from "../services/staffAuthService.js";

// Zod schemas
const createEditionSchema = z.object({
  publicationId: z.string({ required_error: "Publication ID is required" }),
  editionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "editionDate must be in YYYY-MM-DD format"),
  editionCity: z.string().min(2, "Edition city is required"),
  editionNameEn: z.string().min(2, "English edition name is required"),
  editionNameGu: z.string().min(2, "Gujarati edition name is required"),
  volumeYear: z.number().int().optional(),
  issueNumber: z.number().int().optional(),
  quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]).optional(),
  freePreviewPageLimit: z.number().int().min(0).max(20).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "READY", "PUBLISHED", "ARCHIVED"]),
});

const createHotspotSchema = z.object({
  xPercent: z.number().min(0).max(100),
  yPercent: z.number().min(0).max(100),
  widthPercent: z.number().min(1).max(100),
  heightPercent: z.number().min(1).max(100),
  headlineText: z.string().max(300).optional(),
  articleId: z.string().uuid().optional(),
  externalUrl: z.string().url().max(1000).optional(),
  targetType: z.enum(["article", "external", "zoom"]).default("article"),
}).refine((data) => data.xPercent + data.widthPercent <= 100.5, {
  message: "Hotspot exceeds page horizontal bounds (xPercent + widthPercent > 100%)",
}).refine((data) => data.yPercent + data.heightPercent <= 100.5, {
  message: "Hotspot exceeds page vertical bounds (yPercent + heightPercent > 100%)",
});

const reorderPagesSchema = z.object({
  pageOrders: z.array(
    z.object({
      pageId: z.string().uuid(),
      pageNumber: z.number().int().positive(),
    })
  ).min(1),
});

export const epaperRoutes: FastifyPluginAsync = async (app) => {
  const processor = new EpaperPdfProcessor(app.prisma);

  // Helper to resolve subscriber authentication & active subscription
  async function resolveSubscriberAccess(authHeader?: string, tokenQuery?: string) {
    const rawToken = authHeader?.replace(/^Bearer\s+/i, "") || tokenQuery;
    if (!rawToken) {
      return { authenticated: false, hasActiveSubscription: false };
    }

    try {
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const session = await app.prisma.subscriberSession.findFirst({
        where: {
          tokenHash,
          expiresAt: { gt: new Date() },
        },
        include: {
          subscriber: {
            include: {
              subscriptions: {
                where: {
                  status: "ACTIVE",
                  expiresAt: { gt: new Date() },
                },
              },
            },
          },
        },
      });

      if (!session) {
        return { authenticated: false, hasActiveSubscription: false };
      }

      const hasActive = session.subscriber.subscriptions.length > 0;
      return {
        authenticated: true,
        hasActiveSubscription: hasActive,
        subscriberId: session.subscriberId,
      };
    } catch {
      // In offline/mock mode or database failure
      return { authenticated: false, hasActiveSubscription: false };
    }
  }

  // ==========================================================================
  // A. PUBLIC EPAPER READ APIS
  // ==========================================================================

  // 1. List Publications with published E-Paper Editions
  app.get("/publications", async (_req, reply) => {
    try {
      const publications = await app.prisma.publication.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true,
          code: true,
          slug: true,
          nameEn: true,
          nameGu: true,
          taglineEn: true,
          taglineGu: true,
          frequencyEn: true,
          frequencyGu: true,
          establishedYear: true,
          primaryCity: true,
          epaperFreePreviewPages: true,
          epaperEditions: {
            where: { status: "PUBLISHED" },
            orderBy: { editionDate: "desc" },
            take: 1,
            select: {
              id: true,
              editionDate: true,
              editionCity: true,
              totalPageCount: true,
              coverImageUrl: true,
            },
          },
        },
      });

      return { success: true, publications };
    } catch (err) {
      app.log.error(err, "Failed to load publications for E-Paper");
      reply.status(503);
      return { success: false, error: "Database offline. E-Paper publications list unavailable." };
    }
  });

  // 2. Query published editions by publication, date, or city
  app.get("/editions", async (req, reply) => {
    const query = req.query as {
      publication?: string;
      date?: string;
      city?: string;
      page?: string;
      limit?: string;
    };

    const pubId = query.publication;
    const date = query.date ? new Date(query.date) : undefined;
    const city = query.city;
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(20, Math.max(1, parseInt(query.limit || "10", 10)));

    try {
      const whereClause: any = {
        status: "PUBLISHED",
      };

      if (pubId) whereClause.publicationId = pubId;
      if (date && !isNaN(date.getTime())) whereClause.editionDate = date;
      if (city) whereClause.editionCity = city;

      const [total, editions] = await Promise.all([
        app.prisma.ePaperEdition.count({ where: whereClause }),
        app.prisma.ePaperEdition.findMany({
          where: whereClause,
          orderBy: { editionDate: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            publication: {
              select: { id: true, nameEn: true, nameGu: true, epaperFreePreviewPages: true },
            },
          },
        }),
      ]);

      return {
        success: true,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        editions: editions.map((ed) => ({
          ...ed,
          fileSizeBytes: ed.fileSizeBytes ? ed.fileSizeBytes.toString() : null,
        })),
      };
    } catch (err) {
      app.log.error(err, "Failed to query editions");
      reply.status(503);
      return { success: false, error: "Database unavailable." };
    }
  });

  // 3. Get single published edition details with full page index
  app.get("/editions/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    try {
      const edition = await app.prisma.ePaperEdition.findUnique({
        where: { id },
        include: {
          publication: true,
          pages: {
            orderBy: { pageNumber: "asc" },
            select: {
              id: true,
              pageNumber: true,
              labelEn: true,
              labelGu: true,
              widthPx: true,
              heightPx: true,
              isFreePreview: true,
              imageThumbnailKey: true,
            },
          },
        },
      });

      if (!edition || edition.status !== "PUBLISHED") {
        reply.status(404);
        return { success: false, error: "E-Paper edition not found or not yet published." };
      }

      return {
        success: true,
        edition: {
          ...edition,
          fileSizeBytes: edition.fileSizeBytes ? edition.fileSizeBytes.toString() : null,
        },
      };
    } catch (err) {
      app.log.error(err, "Failed to get edition details");
      reply.status(503);
      return { success: false, error: "Database unavailable." };
    }
  });

  // 4. Secure Page Image Stream (Server-Side Access Control)
  app.get("/pages/:pageId/image", async (req, reply) => {
    const { pageId } = req.params as { pageId: string };
    const query = req.query as { token?: string };

    try {
      const page = await app.prisma.ePaperPage.findUnique({
        where: { id: pageId },
        include: { edition: { include: { publication: true } } },
      });

      if (!page) {
        reply.status(404);
        return { success: false, error: "Page not found." };
      }

      // Determine free preview allowance
      const freeLimit =
        page.edition.freePreviewPageLimit ??
        page.edition.publication.epaperFreePreviewPages ??
        2;

      const isFree = page.isFreePreview || page.pageNumber <= freeLimit;

      if (!isFree) {
        // Enforce Server-Side Subscriber Verification
        const authHeader = req.headers.authorization;
        const sub = await resolveSubscriberAccess(authHeader, query.token);

        if (!sub.authenticated) {
          reply.status(401);
          return {
            success: false,
            code: "AUTH_REQUIRED",
            message: "Authentication required to read restricted broadsheet pages.",
            freePagesAllowed: freeLimit,
            targetPage: page.pageNumber,
          };
        }

        if (!sub.hasActiveSubscription) {
          reply.status(403);
          return {
            success: false,
            code: "SUBSCRIPTION_REQUIRED",
            message: "An active digital newspaper subscription is required to access full editions.",
            freePagesAllowed: freeLimit,
            targetPage: page.pageNumber,
          };
        }
      }

      // Stream high-resolution image directly from storage
      const stream = await epaperStorage.getFileStream(page.imageHighresKey);
      reply.header("Content-Type", page.imageHighresKey.endsWith(".svg") ? "image/svg+xml" : "image/png");
      reply.header("Cache-Control", isFree ? "public, max-age=86400" : "private, no-cache");
      return reply.send(stream);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Page image retrieval failed";
      reply.status(500);
      return { success: false, error: msg };
    }
  });

  // 5. Page Thumbnail Stream (Access-Controlled: Restricted pages require active subscription)
  app.get("/pages/:pageId/thumbnail", async (req, reply) => {
    const { pageId } = req.params as { pageId: string };
    const query = req.query as { token?: string };

    try {
      const page = await app.prisma.ePaperPage.findUnique({
        where: { id: pageId },
        include: { edition: { include: { publication: true } } },
      });

      if (!page) {
        reply.status(404);
        return { success: false, error: "Thumbnail not found." };
      }

      const freeLimit =
        page.edition.freePreviewPageLimit ??
        page.edition.publication.epaperFreePreviewPages ??
        2;

      const isFree = page.isFreePreview || page.pageNumber <= freeLimit;

      if (!isFree) {
        const authHeader = req.headers.authorization;
        const sub = await resolveSubscriberAccess(authHeader, query.token);

        if (!sub.authenticated || !sub.hasActiveSubscription) {
          reply.status(403);
          return {
            success: false,
            code: "SUBSCRIPTION_REQUIRED",
            message: "Restricted broadsheet page thumbnails require an active subscriber session.",
            freePagesAllowed: freeLimit,
            targetPage: page.pageNumber,
          };
        }
      }

      const stream = await epaperStorage.getFileStream(page.imageThumbnailKey);
      reply.header("Content-Type", page.imageThumbnailKey.endsWith(".svg") ? "image/svg+xml" : "image/png");
      reply.header("Cache-Control", isFree ? "public, max-age=86400" : "private, no-cache");
      return reply.send(stream);
    } catch (err: unknown) {
      reply.status(500);
      return { success: false, error: "Failed to stream thumbnail." };
    }
  });

  // 6. Public Page Hotspots
  app.get("/pages/:pageId/hotspots", async (req, reply) => {
    const { pageId } = req.params as { pageId: string };

    try {
      const hotspots = await app.prisma.ePaperHotspot.findMany({
        where: { pageId },
        include: {
          article: {
            select: {
              id: true,
              translations: {
                select: {
                  slug: true,
                  headline: true,
                  language: true,
                  summary: true,
                },
              },
            },
          },
        },
      });

      return { success: true, hotspots };
    } catch (err) {
      reply.status(503);
      return { success: false, error: "Database unavailable." };
    }
  });

  // ==========================================================================
  // B. ADMIN EPAPER MANAGEMENT APIS (Staff Only - Server-Side Auth Verification)
  // ==========================================================================

  // Genuine Server-Side Staff Authentication Hook
  const verifyStaffAuth = async (req: any, reply: any) => {
    const authHeader = req.headers.authorization;
    const rawToken = authHeader?.replace(/^Bearer\s+/i, "");

    if (!rawToken) {
      reply.status(401).send({
        success: false,
        code: "STAFF_AUTH_REQUIRED",
        error: "Staff authentication token is required.",
      });
      return;
    }

    try {
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const session = await app.prisma.staffSession.findFirst({
        where: {
          tokenHash,
          expiresAt: { gt: new Date() },
        },
        include: {
          user: {
            include: {
              roles: {
                include: { role: true },
              },
            },
          },
        },
      });

      if (!session || !session.user || !session.user.isStaff || session.user.status !== "ACTIVE") {
        reply.status(401).send({
          success: false,
          code: "INVALID_STAFF_SESSION",
          error: "Invalid, expired, or inactive staff session.",
        });
        return;
      }

      const roleIds = session.user.roles.map((r) => r.roleId.toLowerCase());
      const isEditorOrAdmin = roleIds.some((r) =>
        ["editor", "chief_editor", "epaper_manager", "super_admin", "administrator", "admin"].includes(r)
      );

      if (!isEditorOrAdmin) {
        reply.status(403).send({
          success: false,
          code: "FORBIDDEN_ROLE",
          error: "User lacks required editorial or administrative privileges.",
        });
        return;
      }

      req.staffUser = session.user;
    } catch {
      reply.status(503).send({
        success: false,
        error: "Database unavailable. Cannot verify staff session.",
      });
    }
  };

  // Genuine Administrator Authorization Hook (Required for Destructive Actions)
  const verifyAdminRole = async (req: any, reply: any) => {
    await verifyStaffAuth(req, reply);
    if (reply.sent) return;

    const roleIds = req.staffUser?.roles?.map((r: any) => r.roleId.toLowerCase()) || [];
    const isSuperAdmin = roleIds.some((r: string) => ["super_admin", "administrator", "admin"].includes(r));

    if (!isSuperAdmin) {
      reply.status(403).send({
        success: false,
        code: "ADMIN_ROLE_REQUIRED",
        error: "Permanent deletion requires administrator privileges.",
      });
    }
  };

  // 7. Admin: List all editions with status filters
  app.get("/admin/editions", { preHandler: verifyStaffAuth }, async (req, reply) => {
    const query = req.query as {
      publicationId?: string;
      status?: string;
      search?: string;
    };

    if (query.publicationId && !isPermittedPublicationId(query.publicationId)) {
      reply.status(403).send({
        success: false,
        code: "PUBLICATION_NOT_PERMITTED",
        error: `Publication ${query.publicationId} is outside the Janmabhoomi newspaper scope.`,
      });
      return;
    }

    try {
      const where: any = {};
      if (query.publicationId) {
        where.publicationId = query.publicationId;
      } else {
        where.publicationId = { in: [...PERMITTED_PUBLICATION_IDS] };
      }

      if (query.status) where.status = query.status;
      if (query.search) {
        where.OR = [
          { editionNameEn: { contains: query.search, mode: "insensitive" } },
          { editionNameGu: { contains: query.search, mode: "insensitive" } },
          { editionCity: { contains: query.search, mode: "insensitive" } },
        ];
      }

      const editions = await app.prisma.ePaperEdition.findMany({
        where,
        orderBy: { editionDate: "desc" },
        include: {
          publication: { select: { id: true, code: true, nameEn: true, nameGu: true } },
          _count: { select: { pages: true } },
        },
      });

      return {
        success: true,
        editions: editions.map((ed) => ({
          ...ed,
          fileSizeBytes: ed.fileSizeBytes ? ed.fileSizeBytes.toString() : null,
        })),
      };
    } catch (err) {
      reply.status(503);
      return { success: false, error: "Database unavailable." };
    }
  });

  // 8. Admin: Create new edition (Draft)
  app.post("/admin/editions", { preHandler: verifyStaffAuth }, async (req, reply) => {
    const parseResult = createEditionSchema.safeParse(req.body);
    if (!parseResult.success) {
      reply.status(400);
      return { success: false, errors: parseResult.error.errors };
    }

    const data = parseResult.data;

    if (!isPermittedPublicationId(data.publicationId)) {
      reply.status(403).send({
        success: false,
        code: "PUBLICATION_NOT_PERMITTED",
        error: `Publication ${data.publicationId} is outside the Janmabhoomi newspaper scope. Only 'pub-janmabhoomi' and 'pub-pravasi' are permitted.`,
      });
      return;
    }

    try {
      const edition = await app.prisma.ePaperEdition.create({
        data: {
          publicationId: data.publicationId,
          editionDate: new Date(data.editionDate),
          editionCity: data.editionCity,
          editionNameEn: data.editionNameEn,
          editionNameGu: data.editionNameGu,
          volumeYear: data.volumeYear,
          issueNumber: data.issueNumber,
          quarter: data.quarter,
          freePreviewPageLimit: data.freePreviewPageLimit,
          status: "DRAFT",
        },
      });

      reply.status(201);
      return {
        success: true,
        edition: {
          ...edition,
          fileSizeBytes: edition.fileSizeBytes ? edition.fileSizeBytes.toString() : null,
        },
      };
    } catch (err: unknown) {
      reply.status(500);
      return { success: false, error: err instanceof Error ? err.message : "Failed to create edition" };
    }
  });

  // 9. Admin: Upload PDF for Edition
  app.post("/admin/editions/:id/upload", { preHandler: verifyStaffAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const edition = await app.prisma.ePaperEdition.findUnique({ where: { id } });
    if (!edition) {
      reply.status(404);
      return { success: false, error: "Edition not found" };
    }

    if (!isPermittedPublicationId(edition.publicationId)) {
      reply.status(403).send({
        success: false,
        code: "PUBLICATION_NOT_PERMITTED",
        error: "Access forbidden: Edition belongs to an excluded publication.",
      });
      return;
    }

    const data = await req.file();
    if (!data) {
      reply.status(400);
      return { success: false, error: "No PDF file was uploaded" };
    }

    const buffer = await data.toBuffer();

    try {
      // Process PDF ingestion & page generation
      const result = await processor.processEditionPdf(id, buffer, data.filename);

      reply.status(200);
      return {
        success: true,
        message: "PDF successfully uploaded and processed into digital pages.",
        pageCount: result.pageCount,
        fileSizeBytes: result.fileSizeBytes,
      };
    } catch (err: unknown) {
      reply.status(400);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to process PDF",
      };
    }
  });

  // 10. Admin: Publish / Unpublish Edition
  app.patch("/admin/editions/:id/status", { preHandler: verifyStaffAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parseResult = updateStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      reply.status(400);
      return { success: false, errors: parseResult.error.errors };
    }

    const { status } = parseResult.data;

    const existingEdition = await app.prisma.ePaperEdition.findUnique({ where: { id } });
    if (!existingEdition) {
      reply.status(404);
      return { success: false, error: "Edition not found" };
    }

    if (!isPermittedPublicationId(existingEdition.publicationId)) {
      reply.status(403).send({
        success: false,
        code: "PUBLICATION_NOT_PERMITTED",
        error: "Access forbidden: Edition belongs to an excluded publication.",
      });
      return;
    }

    // Least privilege check: Archiving requires Administrator role
    if (status === "ARCHIVED") {
      const roleIds = (req as any).staffUser?.roles?.map((r: any) => r.roleId.toLowerCase()) || [];
      const isAdmin = roleIds.some((r: string) => ["super_admin", "administrator", "admin"].includes(r));
      if (!isAdmin) {
        reply.status(403).send({
          success: false,
          code: "ADMIN_ROLE_REQUIRED",
          error: "Archiving an edition requires administrator privileges.",
        });
        return;
      }
    }

    try {
      const edition = await app.prisma.ePaperEdition.update({
        where: { id },
        data: {
          status,
          publishedAt: status === "PUBLISHED" ? new Date() : undefined,
        },
      });

      return {
        success: true,
        edition: {
          ...edition,
          fileSizeBytes: edition.fileSizeBytes ? edition.fileSizeBytes.toString() : null,
        },
      };
    } catch (err) {
      reply.status(500);
      return { success: false, error: "Failed to update edition status." };
    }
  });

  // 11. Admin: Delete Edition with storage cleanup (Super Admin authorization enforced)
  app.delete("/admin/editions/:id", { preHandler: verifyAdminRole }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const edition = await app.prisma.ePaperEdition.findUnique({ where: { id } });
    if (!edition) {
      reply.status(404);
      return { success: false, error: "Edition not found" };
    }

    if (!isPermittedPublicationId(edition.publicationId)) {
      reply.status(403).send({
        success: false,
        code: "PUBLICATION_NOT_PERMITTED",
        error: "Access forbidden: Edition belongs to an excluded publication.",
      });
      return;
    }

    try {
      await epaperStorage.deleteEditionStorage(id);
      await app.prisma.ePaperEdition.delete({ where: { id } });

      return { success: true, message: `Edition ${id} and all page files deleted successfully.` };
    } catch (err) {
      reply.status(500);
      return { success: false, error: "Failed to delete edition." };
    }
  });

  // 12. Admin: Page Hotspot Editor Data
  app.get("/admin/editions/:id/editor", { preHandler: verifyStaffAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };

    try {
      const edition = await app.prisma.ePaperEdition.findUnique({
        where: { id },
        include: {
          publication: true,
          pages: {
            orderBy: { pageNumber: "asc" },
            include: {
              hotspots: {
                include: {
                  article: {
                    select: {
                      id: true,
                      translations: { select: { slug: true, headline: true, language: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!edition) {
        reply.status(404);
        return { success: false, error: "Edition not found" };
      }

      if (!isPermittedPublicationId(edition.publicationId)) {
        reply.status(403).send({
          success: false,
          code: "PUBLICATION_NOT_PERMITTED",
          error: "Access forbidden: Edition belongs to an excluded publication.",
        });
        return;
      }

      return {
        success: true,
        edition: {
          ...edition,
          fileSizeBytes: edition.fileSizeBytes ? edition.fileSizeBytes.toString() : null,
        },
      };
    } catch (err) {
      reply.status(503);
      return { success: false, error: "Database unavailable." };
    }
  });

  // 13. Admin: Create Hotspot
  app.post("/admin/pages/:pageId/hotspots", { preHandler: verifyStaffAuth }, async (req, reply) => {
    const { pageId } = req.params as { pageId: string };
    const parse = createHotspotSchema.safeParse(req.body);

    if (!parse.success) {
      reply.status(400);
      return { success: false, errors: parse.error.errors };
    }

    const d = parse.data;

    // Verify page and parent edition publication allowlist
    const page = await app.prisma.ePaperPage.findUnique({
      where: { id: pageId },
      include: { edition: { select: { publicationId: true } } },
    });

    if (!page) {
      reply.status(404);
      return { success: false, error: "Page not found" };
    }

    if (!isPermittedPublicationId(page.edition.publicationId)) {
      reply.status(403).send({
        success: false,
        code: "PUBLICATION_NOT_PERMITTED",
        error: "Access forbidden: Page belongs to an excluded publication.",
      });
      return;
    }

    // Explicit article linking authorization check
    if (d.articleId) {
      const article = await app.prisma.article.findUnique({
        where: { id: d.articleId },
        select: { id: true, publicationId: true },
      });

      if (!article) {
        reply.status(400);
        return { success: false, error: "Referenced article not found." };
      }

      if (!isPermittedPublicationId(article.publicationId)) {
        reply.status(403).send({
          success: false,
          code: "PUBLICATION_NOT_PERMITTED",
          error: "Access forbidden: Referenced article belongs to an excluded publication.",
        });
        return;
      }
    }

    try {
      const hotspot = await app.prisma.ePaperHotspot.create({
        data: {
          pageId,
          xPercent: d.xPercent,
          yPercent: d.yPercent,
          widthPercent: d.widthPercent,
          heightPercent: d.heightPercent,
          headlineText: d.headlineText,
          articleId: d.articleId,
          externalUrl: d.externalUrl,
          targetType: d.targetType,
        },
      });

      reply.status(201);
      return { success: true, hotspot };
    } catch (err: unknown) {
      reply.status(500);
      return { success: false, error: err instanceof Error ? err.message : "Failed to create hotspot" };
    }
  });

  // 14. Admin: Update Hotspot
  app.put("/admin/hotspots/:hotspotId", { preHandler: verifyStaffAuth }, async (req, reply) => {
    const { hotspotId } = req.params as { hotspotId: string };
    const parse = createHotspotSchema.safeParse(req.body);

    if (!parse.success) {
      reply.status(400);
      return { success: false, errors: parse.error.errors };
    }

    const d = parse.data;

    // Verify hotspot and parent edition publication allowlist
    const hotspot = await app.prisma.ePaperHotspot.findUnique({
      where: { id: hotspotId },
      include: { page: { include: { edition: { select: { publicationId: true } } } } },
    });

    if (!hotspot) {
      reply.status(404);
      return { success: false, error: "Hotspot not found" };
    }

    if (!isPermittedPublicationId(hotspot.page.edition.publicationId)) {
      reply.status(403).send({
        success: false,
        code: "PUBLICATION_NOT_PERMITTED",
        error: "Access forbidden: Hotspot belongs to an excluded publication.",
      });
      return;
    }

    // Explicit article linking authorization check
    if (d.articleId) {
      const article = await app.prisma.article.findUnique({
        where: { id: d.articleId },
        select: { id: true, publicationId: true },
      });

      if (!article) {
        reply.status(400);
        return { success: false, error: "Referenced article not found." };
      }

      if (!isPermittedPublicationId(article.publicationId)) {
        reply.status(403).send({
          success: false,
          code: "PUBLICATION_NOT_PERMITTED",
          error: "Access forbidden: Referenced article belongs to an excluded publication.",
        });
        return;
      }
    }

    try {
      const updated = await app.prisma.ePaperHotspot.update({
        where: { id: hotspotId },
        data: {
          xPercent: d.xPercent,
          yPercent: d.yPercent,
          widthPercent: d.widthPercent,
          heightPercent: d.heightPercent,
          headlineText: d.headlineText,
          articleId: d.articleId,
          externalUrl: d.externalUrl,
          targetType: d.targetType,
        },
      });

      return { success: true, hotspot: updated };
    } catch (err) {
      reply.status(500);
      return { success: false, error: "Failed to update hotspot." };
    }
  });

  // 15. Admin: Delete Hotspot
  app.delete("/admin/hotspots/:hotspotId", { preHandler: verifyStaffAuth }, async (req, reply) => {
    const { hotspotId } = req.params as { hotspotId: string };

    const hotspot = await app.prisma.ePaperHotspot.findUnique({
      where: { id: hotspotId },
      include: { page: { include: { edition: { select: { publicationId: true } } } } },
    });

    if (!hotspot) {
      reply.status(404);
      return { success: false, error: "Hotspot not found" };
    }

    if (!isPermittedPublicationId(hotspot.page.edition.publicationId)) {
      reply.status(403).send({
        success: false,
        code: "PUBLICATION_NOT_PERMITTED",
        error: "Access forbidden: Hotspot belongs to an excluded publication.",
      });
      return;
    }

    try {
      await app.prisma.ePaperHotspot.delete({ where: { id: hotspotId } });
      return { success: true, message: "Hotspot deleted." };
    } catch (err) {
      reply.status(500);
      return { success: false, error: "Failed to delete hotspot." };
    }
  });

  // 16. Admin: Reorder Pages
  app.put("/admin/editions/:id/pages/reorder", { preHandler: verifyStaffAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parse = reorderPagesSchema.safeParse(req.body);

    if (!parse.success) {
      reply.status(400);
      return { success: false, errors: parse.error.errors };
    }

    const edition = await app.prisma.ePaperEdition.findUnique({ where: { id } });
    if (!edition) {
      reply.status(404);
      return { success: false, error: "Edition not found" };
    }

    if (!isPermittedPublicationId(edition.publicationId)) {
      reply.status(403).send({
        success: false,
        code: "PUBLICATION_NOT_PERMITTED",
        error: "Access forbidden: Edition belongs to an excluded publication.",
      });
      return;
    }

    try {
      await app.prisma.$transaction(
        parse.data.pageOrders.map((po) =>
          app.prisma.ePaperPage.update({
            where: { id: po.pageId },
            data: { pageNumber: po.pageNumber },
          })
        )
      );

      return { success: true, message: "Pages reordered successfully." };
    } catch (err) {
      reply.status(500);
      return { success: false, error: "Failed to reorder pages." };
    }
  });
};
