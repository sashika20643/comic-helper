"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/auth";

type Section = "planning" | "screenplay";

export async function createDoc(section: Section, title = "Untitled", folderId: number | null = null) {
  const me = await requireUser();
  const [doc] = await db
    .insert(schema.docs)
    .values({ section, title, folderId, updatedBy: me.username })
    .returning();
  revalidatePath(`/${section}`, "layout");
  redirect(`/${section}/${doc.id}`);
}

export async function updateDoc(id: number, patch: { title?: string; content?: string }) {
  const me = await requireUser();
  const [doc] = await db
    .update(schema.docs)
    .set({ ...patch, updatedBy: me.username, updatedAt: sql`now()` })
    .where(eq(schema.docs.id, id))
    .returning();
  if (patch.title !== undefined) revalidatePath(`/${doc.section}`, "layout");
}

export async function deleteDoc(id: number) {
  await requireUser();
  const [doc] = await db.delete(schema.docs).where(eq(schema.docs.id, id)).returning();
  revalidatePath(`/${doc.section}`, "layout");
  redirect(`/${doc.section}`);
}
