import { FastifyPluginAsync } from "fastify";
import fs from "node:fs/promises";
import { z } from "zod";
import { requireAdminRole, verifyStaffAuth } from "../services/staffAuthService.js";
import { MediaService } from "../services/mediaService.js";

const updateMediaSchema = z.object({
  captionEn: z.string().max(500).nullable().optional(),
  captionGu: z.string().max(500).nullable().optional(),
  altTextEn: z.string().max(255).nullable().optional(),
  altTextGu: z.string().max(255).nullable().optional(),
  photographer: z.string().max(150).nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const adminMediaRoutes: FastifyPluginAsync = async (app) => {
  const mediaService = new MediaService(app.prisma);

  // ==========================================================================
  // PUBLIC IMAGE SERVING ENDPOINT
  // ==========================================================================
  app.get("/serve/:storageKey", async (req, reply) => {
    const { storageKey } = req.params as { storageKey: string };

    try {
      const asset = await app.prisma.mediaAsset.findUnique({
        where: { storageKey },
      });

      if (!asset) {
        return reply.status(404).send({ success: false, error: "Image not found" });
      }

      const filePath = mediaService.getFilePath(storageKey);
      const fileBuffer = await fs.readFile(filePath);

      reply.header("Content-Type", asset.mimeType);
      reply.header("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      return reply.send(fileBuffer);
    } catch {
      return reply.status(404).send({ success: false, error: "File not accessible" });
    }
  });

  // ==========================================================================
  // ADMIN AUTHENTICATED MEDIA MANAGEMENT ENDPOINTS
  // ==========================================================================
  app.register(async (adminScope) => {
    adminScope.addHook("preHandler", requireAdminRole);

    /**
     * GET /api/v1/admin/media
     * Paginated list of uploaded media assets.
     */
    adminScope.get("/", async (req, reply) => {
      const query = req.query as {
        search?: string;
        mimeType?: string;
        page?: string;
        limit?: string;
      };

      const page = Math.max(1, parseInt(query.page || "1", 10));
      const limit = Math.min(100, Math.max(1, parseInt(query.limit || "24", 10)));
      const skip = (page - 1) * limit;

      const where: any = {};
      if (query.mimeType) where.mimeType = query.mimeType;
      if (query.search) {
        where.OR = [
          { originalFilename: { contains: query.search, mode: "insensitive" } },
          { captionEn: { contains: query.search, mode: "insensitive" } },
          { captionGu: { contains: query.search, mode: "insensitive" } },
          { photographer: { contains: query.search, mode: "insensitive" } },
        ];
      }

      const [total, assets] = await Promise.all([
        app.prisma.mediaAsset.count({ where }),
        app.prisma.mediaAsset.findMany({
          where,
          include: { uploader: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
      ]);

      const formatted = assets.map((a) => ({
        id: a.id,
        filename: a.originalFilename,
        storageKey: a.storageKey,
        publicUrl: a.publicUrl,
        mimeType: a.mimeType,
        fileSizeBytes: Number(a.fileSizeBytes),
        widthPx: a.widthPx,
        heightPx: a.heightPx,
        captionEn: a.captionEn,
        captionGu: a.captionGu,
        altTextEn: a.altTextEn,
        altTextGu: a.altTextGu,
        photographer: a.photographer,
        tags: a.tags,
        uploadedBy: a.uploader?.fullName || "Admin",
        createdAt: a.createdAt.toISOString(),
      }));

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
     * POST /api/v1/admin/media/upload
     * Multipart file upload.
     */
    adminScope.post("/upload", async (req, reply) => {
      const data = await req.file();
      if (!data) {
        return reply.status(400).send({
          success: false,
          error: { code: "NO_FILE", message: "Please provide an image file to upload." },
        });
      }

      const buffer = await data.toBuffer();
      const filename = data.filename || "upload.jpg";
      const mimeType = data.mimetype;
      const fields = data.fields as any;

      const captionEn = typeof fields?.captionEn?.value === "string" ? fields.captionEn.value : undefined;
      const captionGu = typeof fields?.captionGu?.value === "string" ? fields.captionGu.value : undefined;
      const altTextEn = typeof fields?.altTextEn?.value === "string" ? fields.altTextEn.value : undefined;
      const altTextGu = typeof fields?.altTextGu?.value === "string" ? fields.altTextGu.value : undefined;
      const photographer = typeof fields?.photographer?.value === "string" ? fields.photographer.value : undefined;

      try {
        const asset = await mediaService.uploadMedia({
          filename,
          buffer,
          mimeType,
          captionEn,
          captionGu,
          altTextEn,
          altTextGu,
          photographer,
          uploadedBy: req.staffUser!.id,
        });

        return reply.status(201).send({
          success: true,
          message: "Media asset uploaded successfully.",
          data: {
            id: asset.id,
            filename: asset.originalFilename,
            storageKey: asset.storageKey,
            publicUrl: asset.publicUrl,
            mimeType: asset.mimeType,
            fileSizeBytes: Number(asset.fileSizeBytes),
            captionEn: asset.captionEn,
            captionGu: asset.captionGu,
          },
        });
      } catch (err: any) {
        return reply.status(400).send({
          success: false,
          error: { code: "UPLOAD_FAILED", message: err.message || "Failed to process image upload." },
        });
      }
    });

    /**
     * PUT /api/v1/admin/media/:id
     * Updates media asset metadata.
     */
    adminScope.put("/:id", async (req, reply) => {
      const { id } = req.params as { id: string };
      const parseResult = updateMediaSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parseResult.error.errors[0]?.message || "Invalid input",
          },
        });
      }

      const updated = await app.prisma.mediaAsset.update({
        where: { id },
        data: parseResult.data,
      });

      return reply.status(200).send({
        success: true,
        data: {
          ...updated,
          fileSizeBytes: Number(updated.fileSizeBytes),
        },
      });
    });

    /**
     * DELETE /api/v1/admin/media/:id
     * Deletes media asset from disk and database.
     */
    adminScope.delete("/:id", async (req, reply) => {
      const { id } = req.params as { id: string };

      try {
        await mediaService.deleteMedia(id);
        return reply.status(200).send({
          success: true,
          message: "Media asset deleted successfully.",
        });
      } catch (err: any) {
        return reply.status(404).send({
          success: false,
          error: { code: "DELETE_FAILED", message: err.message },
        });
      }
    });
  });
};
