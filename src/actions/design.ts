"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getKind } from "@/lib/design-config";
import { deleteAsset, removeFile } from "@/lib/storage";

export async function createDesignItem(kind: string, form: FormData) {
  const me = await requireUser();
  const cfg = getKind(kind);
  if (!cfg) throw new Error("Unknown design type");
  const name = String(form.get("name") ?? "").trim() || `New ${cfg.singular.toLowerCase()}`;
  const [item] = await db.insert(schema.designItems).values({ kind, name, updatedBy: me.username }).returning();
  revalidatePath("/design", "layout");
  redirect(`/design/${kind}/${item.id}`);
}

export async function updateDesignItem(
  id: number,
  patch: { name?: string; notes?: string; field?: { key: string; value: string } },
) {
  const me = await requireUser();
  const set: Record<string, unknown> = {
    updatedBy: me.username,
    updatedAt: sql`now()`,
  };
  if (patch.name !== undefined) set.name = patch.name.trim() || "Untitled";
  if (patch.notes !== undefined) set.notes = patch.notes;
  if (patch.field) {
    // Merge one key into the JSON fields without overwriting the others.
    set.fields = sql`${schema.designItems.fields} || ${JSON.stringify({ [patch.field.key]: patch.field.value })}::jsonb`;
  }
  await db
    .update(schema.designItems)
    .set(set as Partial<typeof schema.designItems.$inferInsert>)
    .where(eq(schema.designItems.id, id));
  if (patch.name !== undefined) revalidatePath("/design", "layout");
}

export async function deleteDesignItem(id: number) {
  await requireUser();
  const files = await db
    .select({ storedName: schema.assets.storedName })
    .from(schema.assets)
    .where(eq(schema.assets.designItemId, id));
  const [item] = await db.delete(schema.designItems).where(eq(schema.designItems.id, id)).returning();
  await Promise.all(files.map((f) => removeFile(f.storedName)));
  revalidatePath("/design", "layout");
  redirect(`/design/${item?.kind ?? "characters"}`);
}

export async function setCover(itemId: number, assetId: number) {
  await requireUser();
  await db.update(schema.designItems).set({ coverAssetId: assetId }).where(eq(schema.designItems.id, itemId));
  revalidatePath("/design", "layout");
}

export async function updateAsset(id: number, patch: { tag?: string; caption?: string }) {
  await requireUser();
  await db.update(schema.assets).set(patch).where(eq(schema.assets.id, id));
  revalidatePath("/design", "layout");
}

export async function removeDesignImage(itemId: number, assetId: number) {
  await requireUser();
  const [item] = await db.select().from(schema.designItems).where(eq(schema.designItems.id, itemId));
  await deleteAsset(assetId);
  if (item?.coverAssetId === assetId) {
    const [next] = await db
      .select({ id: schema.assets.id })
      .from(schema.assets)
      .where(eq(schema.assets.designItemId, itemId))
      .limit(1);
    await db.update(schema.designItems).set({ coverAssetId: next?.id ?? null }).where(eq(schema.designItems.id, itemId));
  }
  revalidatePath("/design", "layout");
}

/** Called after a client-side upload finishes so lists re-render. */
export async function refreshDesign() {
  await requireUser();
  revalidatePath("/design", "layout");
}
