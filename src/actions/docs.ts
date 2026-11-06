"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { deleteAsset, removeFile } from "@/lib/storage";

type Section = "planning" | "screenplay";

export async function createDoc(section: Section, title = "Untitled", folderId: number | null = null) {
  const me = await requireUser();
  const [doc] = await db
    .insert(schema.docs)
    .values({ section, title, folderId, updatedBy: me.username })
    .returning();
  revalidatePath(`/${section}`, "layout");
  // New planning docs open straight in edit mode.
  redirect(section === "planning" ? `/planning/${doc.id}?edit=1` : `/${section}/${doc.id}`);
}

export async function updateDoc(id: number, patch: { title?: string; content?: string }) {
  const me = await requireUser();
  if (patch.title !== undefined) patch.title = patch.title.trim() || "Untitled";
  const [doc] = await db
    .update(schema.docs)
    .set({ ...patch, updatedBy: me.username, updatedAt: sql`now()` })
    .where(eq(schema.docs.id, id))
    .returning();
  if (doc) revalidatePath(`/${doc.section}`, "layout");
}

export async function deleteDoc(id: number) {
  await requireUser();
  const files = await db
    .select({ storedName: schema.assets.storedName })
    .from(schema.assets)
    .where(eq(schema.assets.docId, id));
  const [doc] = await db.delete(schema.docs).where(eq(schema.docs.id, id)).returning();
  await Promise.all(files.map((f) => removeFile(f.storedName)));
  revalidatePath(`/${doc.section}`, "layout");
  redirect(`/${doc.section}`);
}

export async function deleteAttachment(assetId: number) {
  await requireUser();
  await deleteAsset(assetId);
  revalidatePath("/planning", "layout");
}

/** Called after a client-side upload so the attachment list re-renders. */
export async function refreshPlanning() {
  await requireUser();
  revalidatePath("/planning", "layout");
}
