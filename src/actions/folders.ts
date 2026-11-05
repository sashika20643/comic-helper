"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { deleteBoardImages } from "@/lib/cleanup";

export type FolderSection = "storyboards" | "screenplay";

const refresh = (section: FolderSection) => revalidatePath(`/${section}`, "layout");

export async function createFolder(section: FolderSection, parentId: number | null, name: string) {
  await requireUser();
  await db.insert(schema.folders).values({ section, name: name.trim() || "New folder", parentId });
  refresh(section);
}

export async function renameFolder(id: number, name: string) {
  await requireUser();
  const [f] = await db
    .update(schema.folders)
    .set({ name: name.trim() || "Untitled" })
    .where(eq(schema.folders.id, id))
    .returning();
  if (f) refresh(f.section as FolderSection);
}

export async function deleteFolder(id: number) {
  await requireUser();
  const [folder] = await db.select().from(schema.folders).where(eq(schema.folders.id, id));
  if (!folder) return;

  if (folder.section === "storyboards") {
    // Collect every folder below this one so block images get removed from disk too.
    const all = await db.select({ id: schema.folders.id, parentId: schema.folders.parentId }).from(schema.folders);
    const ids = new Set([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const f of all) {
        if (f.parentId && ids.has(f.parentId) && !ids.has(f.id)) {
          ids.add(f.id);
          grew = true;
        }
      }
    }
    const boardIds = (
      await db.select({ id: schema.boards.id }).from(schema.boards).where(inArray(schema.boards.folderId, [...ids]))
    ).map((b) => b.id);
    await deleteBoardImages(boardIds);
  }
  // Sub-folders, boards/blocks and scripts are removed by ON DELETE CASCADE.
  await db.delete(schema.folders).where(eq(schema.folders.id, id));
  refresh(folder.section as FolderSection);
}
