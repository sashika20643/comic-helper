import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { saveFile, deleteAsset, isAllowedImage, MAX_UPLOAD_BYTES } from "@/lib/storage";

// POST multipart form:
//   files[]        one or more images
//   designItemId   attach to a character / mechanic / environment gallery
//   tag            gallery tag (e.g. "Character sheet")
//   blockId        set as the image of a storyboard block (replaces the old one)
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const form = await request.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const designItemId = Number(form.get("designItemId")) || null;
  const blockId = Number(form.get("blockId")) || null;
  const tag = String(form.get("tag") ?? "");

  if (!files.length) return NextResponse.json({ error: "No file" }, { status: 400 });
  for (const f of files) {
    if (!isAllowedImage(f.type)) return NextResponse.json({ error: `${f.name}: not a supported image` }, { status: 400 });
    if (f.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: `${f.name}: larger than 30 MB` }, { status: 400 });
  }

  if (blockId) {
    const [block] = await db.select().from(schema.blocks).where(eq(schema.blocks.id, blockId));
    if (!block) return NextResponse.json({ error: "Block not found" }, { status: 404 });
    const asset = await saveFile(files[0], { user: user.username });
    await db.update(schema.blocks).set({ imageAssetId: asset.id }).where(eq(schema.blocks.id, blockId));
    if (block.imageAssetId) await deleteAsset(block.imageAssetId);
    return NextResponse.json({ assets: [asset] });
  }

  const saved = [];
  for (const f of files) saved.push(await saveFile(f, { user: user.username, designItemId, tag }));

  // First image of an item becomes its cover automatically.
  if (designItemId) {
    const [item] = await db.select().from(schema.designItems).where(eq(schema.designItems.id, designItemId));
    if (item && !item.coverAssetId) {
      await db.update(schema.designItems).set({ coverAssetId: saved[0].id }).where(eq(schema.designItems.id, designItemId));
    }
  }
  return NextResponse.json({ assets: saved });
}
