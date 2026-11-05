"use server";

import { and, eq, max, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { deleteAsset } from "@/lib/storage";
import { deleteBoardImages } from "@/lib/cleanup";

const refresh = () => revalidatePath("/storyboards", "layout");

// ---------- boards ----------

export async function createBoard(folderId: number | null, name: string) {
  await requireUser();
  const [board] = await db.insert(schema.boards).values({ name: name.trim() || "New board", folderId }).returning();
  refresh();
  redirect(`/storyboards/${board.id}`);
}

export async function renameBoard(id: number, name: string) {
  await requireUser();
  await db
    .update(schema.boards)
    .set({ name: name.trim() || "Untitled", updatedAt: sql`now()` })
    .where(eq(schema.boards.id, id));
  refresh();
}

export async function deleteBoard(id: number) {
  await requireUser();
  await deleteBoardImages([id]);
  await db.delete(schema.boards).where(eq(schema.boards.id, id));
  refresh();
  redirect("/storyboards");
}

// ---------- blocks ----------

export async function addBlock(boardId: number) {
  await requireUser();
  const [{ last }] = await db
    .select({ last: max(schema.blocks.position) })
    .from(schema.blocks)
    .where(eq(schema.blocks.boardId, boardId));
  await db.insert(schema.blocks).values({ boardId, position: (last ?? -1) + 1 });
  revalidatePath(`/storyboards/${boardId}`);
}

export async function updateBlock(id: number, patch: { action?: string; notes?: string; duration?: number }) {
  await requireUser();
  if (patch.duration !== undefined && !(patch.duration >= 0)) delete patch.duration;
  await db.update(schema.blocks).set(patch).where(eq(schema.blocks.id, id));
  const [b] = await db.select({ boardId: schema.blocks.boardId }).from(schema.blocks).where(eq(schema.blocks.id, id));
  if (b && patch.duration !== undefined) revalidatePath(`/storyboards/${b.boardId}`);
}

export async function deleteBlock(id: number) {
  await requireUser();
  const [b] = await db.delete(schema.blocks).where(eq(schema.blocks.id, id)).returning();
  if (b?.imageAssetId) await deleteAsset(b.imageAssetId);
  if (b) revalidatePath(`/storyboards/${b.boardId}`);
}

export async function removeBlockImage(id: number) {
  await requireUser();
  const [b] = await db.select().from(schema.blocks).where(eq(schema.blocks.id, id));
  if (!b?.imageAssetId) return;
  await db.update(schema.blocks).set({ imageAssetId: null }).where(eq(schema.blocks.id, id));
  await deleteAsset(b.imageAssetId);
  revalidatePath(`/storyboards/${b.boardId}`);
}

/** Save a new order after drag & drop. */
export async function reorderBlocks(boardId: number, orderedIds: number[]) {
  await requireUser();
  await db.transaction(async (tx) => {
    for (const [i, id] of orderedIds.entries()) {
      await tx
        .update(schema.blocks)
        .set({ position: i })
        .where(and(eq(schema.blocks.id, id), eq(schema.blocks.boardId, boardId)));
    }
  });
  revalidatePath(`/storyboards/${boardId}`);
}

export async function duplicateBlock(id: number) {
  await requireUser();
  const [b] = await db.select().from(schema.blocks).where(eq(schema.blocks.id, id));
  if (!b) return;
  // Shift following blocks, then insert the copy right after (image is not copied).
  await db
    .update(schema.blocks)
    .set({ position: sql`${schema.blocks.position} + 1` })
    .where(and(eq(schema.blocks.boardId, b.boardId), sql`${schema.blocks.position} > ${b.position}`));
  await db.insert(schema.blocks).values({
    boardId: b.boardId,
    position: b.position + 1,
    action: b.action,
    duration: b.duration,
    notes: b.notes,
  });
  revalidatePath(`/storyboards/${b.boardId}`);
}

export async function refreshBoard(boardId: number) {
  await requireUser();
  revalidatePath(`/storyboards/${boardId}`);
}
