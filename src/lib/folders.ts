import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "./db";

export function getFolders(section: "storyboards" | "screenplay") {
  return db
    .select({ id: schema.folders.id, name: schema.folders.name, parentId: schema.folders.parentId })
    .from(schema.folders)
    .where(eq(schema.folders.section, section))
    .orderBy(asc(schema.folders.name));
}

/** Breadcrumb names from the root down to `folderId`, e.g. ["Season 1", "Episode 1"]. */
export async function getFolderPath(folderId: number | null) {
  if (!folderId) return [];
  const all = await db
    .select({ id: schema.folders.id, name: schema.folders.name, parentId: schema.folders.parentId })
    .from(schema.folders);
  const path: string[] = [];
  let fid: number | null = folderId;
  while (fid) {
    const f = all.find((x) => x.id === fid);
    if (!f) break;
    path.unshift(f.name);
    fid = f.parentId;
  }
  return path;
}
