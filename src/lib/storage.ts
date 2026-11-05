import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";

export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./uploads");
export const MAX_UPLOAD_BYTES = 30 * 1024 * 1024;

const EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
};

export function isAllowedImage(mime: string) {
  return mime in EXT;
}

export async function saveFile(file: File, opts: { tag?: string; designItemId?: number | null; user: string }) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const storedName = crypto.randomUUID() + EXT[file.type];
  await fs.writeFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, storedName), Buffer.from(await file.arrayBuffer()));
  const [asset] = await db
    .insert(schema.assets)
    .values({
      storedName,
      originalName: file.name.slice(0, 200),
      mime: file.type,
      size: file.size,
      tag: opts.tag ?? "",
      designItemId: opts.designItemId ?? null,
      uploadedBy: opts.user,
    })
    .returning();
  return asset;
}

export async function deleteAsset(id: number) {
  const [asset] = await db.delete(schema.assets).where(eq(schema.assets.id, id)).returning();
  if (asset) await removeFile(asset.storedName);
}

export async function removeFile(storedName: string) {
  await fs.rm(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, path.basename(storedName)), { force: true });
}
