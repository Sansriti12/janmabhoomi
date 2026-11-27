import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { env } from "../config/env.js";

/**
 * Interface contract for E-Paper storage providers.
 * Allows transparent swapping between Local Filesystem and Cloud Object Storage (S3, Cloudflare R2, etc.)
 */
export interface IEpaperStorageProvider {
  savePdf(
    editionId: string,
    filename: string,
    buffer: Buffer
  ): Promise<{ storageKey: string; fullPath: string; sizeBytes: number }>;

  savePageImage(
    editionId: string,
    pageNumber: number,
    buffer: Buffer,
    isThumb?: boolean
  ): Promise<{ storageKey: string; fullPath: string }>;

  getFileStream(storageKey: string): Promise<Readable>;

  deleteEditionStorage(editionId: string): Promise<void>;

  fileExists(storageKey: string): Promise<boolean>;

  getAbsolutePath(storageKey: string): string;
}

/**
 * Local Filesystem implementation of IEpaperStorageProvider.
 * Stores files outside the public web root in a secure directory structure.
 */
export class LocalStorageProvider implements IEpaperStorageProvider {
  private readonly baseDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir = path.resolve(process.cwd(), customBaseDir || env.EPAPER_STORAGE_DIR);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Validates that the storage key does not escape the base directory (path traversal defense)
   */
  public getAbsolutePath(storageKey: string): string {
    const normalizedKey = path.normalize(storageKey).replace(/^(\.\.[\/\\])+/, "");
    const resolvedPath = path.resolve(this.baseDir, normalizedKey);

    if (!resolvedPath.startsWith(this.baseDir)) {
      throw new Error("Security violation: Path traversal detected outside storage root.");
    }
    return resolvedPath;
  }

  public async savePdf(
    editionId: string,
    filename: string,
    buffer: Buffer
  ): Promise<{ storageKey: string; fullPath: string; sizeBytes: number }> {
    const editionDir = path.join(this.baseDir, "editions", editionId);
    await fs.promises.mkdir(editionDir, { recursive: true });

    // Sanitize filename to avoid weird characters
    const safeFilename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageKey = path.join("editions", editionId, safeFilename).replace(/\\/g, "/");
    const fullPath = this.getAbsolutePath(storageKey);

    await fs.promises.writeFile(fullPath, buffer);
    return {
      storageKey,
      fullPath,
      sizeBytes: buffer.length,
    };
  }

  public async savePageImage(
    editionId: string,
    pageNumber: number,
    buffer: Buffer,
    isThumb = false
  ): Promise<{ storageKey: string; fullPath: string }> {
    const pagesDir = path.join(this.baseDir, "editions", editionId, "pages");
    await fs.promises.mkdir(pagesDir, { recursive: true });

    const prefix = isThumb ? "thumb_" : "page_";
    const filename = `${prefix}${String(pageNumber).padStart(3, "0")}.png`;
    const storageKey = path.join("editions", editionId, "pages", filename).replace(/\\/g, "/");
    const fullPath = this.getAbsolutePath(storageKey);

    await fs.promises.writeFile(fullPath, buffer);
    return { storageKey, fullPath };
  }

  public async getFileStream(storageKey: string): Promise<Readable> {
    const fullPath = this.getAbsolutePath(storageKey);
    const exists = await this.fileExists(storageKey);
    if (!exists) {
      throw new Error(`Requested file does not exist in storage: ${storageKey}`);
    }
    return fs.createReadStream(fullPath);
  }

  public async fileExists(storageKey: string): Promise<boolean> {
    try {
      const fullPath = this.getAbsolutePath(storageKey);
      await fs.promises.access(fullPath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  public async deleteEditionStorage(editionId: string): Promise<void> {
    const editionDir = path.join(this.baseDir, "editions", editionId);
    if (fs.existsSync(editionDir)) {
      await fs.promises.rm(editionDir, { recursive: true, force: true });
    }
  }
}

// Singleton storage provider export
export const epaperStorage: IEpaperStorageProvider = new LocalStorageProvider();
