import "server-only";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db, schema } from "./db";
import { removeFile } from "./storage";

/** Delete the image files of all blocks on these boards (DB rows cascade separately). */
export async function deleteBoardImages(boardIds: number[]) {
  if (!boardIds.length) return;
  const rows = await db
    .select({ id: schema.assets.id, storedName: schema.assets.storedName })
    .from(schema.blocks)
    .innerJoin(schema.assets, eq(schema.blocks.imageAssetId, schema.assets.id))
    .where(and(inArray(schema.blocks.boardId, boardIds), isNotNull(schema.blocks.imageAssetId)));
  if (!rows.length) return;
  await db.delete(schema.assets).where(inArray(schema.assets.id, rows.map((r) => r.id)));
  await Promise.all(rows.map((r) => removeFile(r.storedName)));
}
