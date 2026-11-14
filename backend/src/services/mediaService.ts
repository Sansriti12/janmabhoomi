import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

export interface MediaUploadInput {
  filename: string;
  buffer: Buffer;
  mimeType: string;
  captionEn?: string;
  captionGu?: string;
  altTextEn?: string;
  altTextGu?: string;
  photographer?: string;
  tags?: string[];
  uploadedBy?: string;
}

export class MediaService {
  private baseDir: string;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient, customDir?: string) {
    this.prisma = prisma;
    this.baseDir = customDir || path.resolve(process.cwd(), "storage", "media");
    if (!fsSync.existsSync(this.baseDir)) {
      fsSync.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Validates MIME type and extension. Allowed: image/jpeg, image/png, image/webp.
   */
  private validateImage(mimeType: string, filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const allowedMap: Record<string, string[]> = {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    };

    const validExtensions = allowedMap[mimeType.toLowerCase()];
    if (!validExtensions || !validExtensions.includes(ext)) {
      throw new Error(
        `Invalid file format. Allowed formats: JPEG, PNG, WebP. Received MIME '${mimeType}', extension '${ext}'.`
      );
    }

    return ext;
  }

  /**
   * Saves image to disk and creates a MediaAsset record in PostgreSQL.
   */
  async uploadMedia(input: MediaUploadInput) {
    const ext = this.validateImage(input.mimeType, input.filename);

    if (input.buffer.length > 10 * 1024 * 1024) {
      throw new Error("File size exceeds 10MB limit.");
    }

    const fileId = crypto.randomUUID();
    const safeKey = `${fileId}${ext}`;
    const filePath = path.join(this.baseDir, safeKey);

    // Save file
    await fs.writeFile(filePath, input.buffer);

    const publicUrl = `/api/v1/media/${safeKey}`;

    const mediaAsset = await this.prisma.mediaAsset.create({
      data: {
        id: fileId,
        originalFilename: path.basename(input.filename).slice(0, 255),
        storageKey: safeKey,
        publicUrl,
        mimeType: input.mimeType,
        fileSizeBytes: BigInt(input.buffer.length),
        captionEn: input.captionEn || null,
        captionGu: input.captionGu || null,
        altTextEn: input.altTextEn || null,
        altTextGu: input.altTextGu || null,
        photographer: input.photographer || null,
        tags: input.tags || [],
        uploadedBy: input.uploadedBy || null,
      },
    });

    return mediaAsset;
  }

  /**
   * Resolves physical disk path for a storage key. Prevents directory traversal.
   */
  getFilePath(storageKey: string): string {
    const safeKey = path.basename(storageKey);
    const resolved = path.join(this.baseDir, safeKey);
    if (!resolved.startsWith(this.baseDir)) {
      throw new Error("Access denied: invalid storage path.");
    }
    return resolved;
  }

  /**
   * Deletes a media asset from disk and database.
   * Protects against deleting assets currently referenced as featured image in articles.
   */
  async deleteMedia(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new Error("Media asset not found.");
    }

    // Comprehensive deletion protection: verify if asset is referenced anywhere
    // 1. Featured image in articles
    const inUseFeaturedCount = await this.prisma.article.count({
      where: {
        OR: [
          { featuredImageUrl: asset.publicUrl },
          { featuredImageUrl: { contains: asset.storageKey } },
        ],
      },
    });
    if (inUseFeaturedCount > 0) {
      throw new Error(
        `Cannot delete media asset: It is currently referenced as the featured image in ${inUseFeaturedCount} news article(s). Remove the image from those articles before deleting.`
      );
    }

    // 2. Embedded in article body content (Gujarati or English)
    const inUseContentCount = await this.prisma.articleTranslation.count({
      where: {
        OR: [
          { contentHtml: { contains: asset.publicUrl } },
          { contentHtml: { contains: asset.storageKey } },
        ],
      },
    });
    if (inUseContentCount > 0) {
      throw new Error(
        `Cannot delete media asset: It is embedded in the body content of ${inUseContentCount} article translation(s). Remove the image reference before deleting.`
      );
    }

    // 3. Referenced in E-Paper editions (cover images or pages)
    const inUseEpaperEditionCount = await this.prisma.ePaperEdition.count({
      where: {
        OR: [
          { coverImageUrl: asset.publicUrl },
          { coverImageUrl: { contains: asset.storageKey } },
        ],
      },
    });
    if (inUseEpaperEditionCount > 0) {
      throw new Error(
        `Cannot delete media asset: It is referenced as the cover image in ${inUseEpaperEditionCount} E-Paper edition(s).`
      );
    }

    const inUseEpaperPageCount = await this.prisma.ePaperPage.count({
      where: {
        OR: [
          { imageHighresKey: asset.storageKey },
          { imageThumbnailKey: asset.storageKey },
        ],
      },
    });
    if (inUseEpaperPageCount > 0) {
      throw new Error(
        `Cannot delete media asset: It is referenced in ${inUseEpaperPageCount} E-Paper page(s).`
      );
    }

    // 4. Referenced in Advertisements
    const inUseAdCount = await this.prisma.advertisement.count({
      where: {
        OR: [
          { imageStorageKey: asset.storageKey },
          { imageStorageKey: asset.publicUrl },
        ],
      },
    });
    if (inUseAdCount > 0) {
      throw new Error(
        `Cannot delete media asset: It is referenced in ${inUseAdCount} advertisement(s).`
      );
    }

    const filePath = this.getFilePath(asset.storageKey);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore if file was already removed
    }

    await this.prisma.mediaAsset.delete({ where: { id } });
    return true;
  }
}
