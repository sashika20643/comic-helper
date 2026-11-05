import path from "node:path";
import fs from "node:fs/promises";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { UPLOAD_DIR } from "@/lib/storage";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getUser())) return new Response("Not logged in", { status: 401 });

  const { id } = await ctx.params;
  const [asset] = await db.select().from(schema.assets).where(eq(schema.assets.id, Number(id)));
  if (!asset) return new Response("Not found", { status: 404 });

  try {
    const data = await fs.readFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, path.basename(asset.storedName)));
    return new Response(data, {
      headers: {
        "Content-Type": asset.mime,
        "Content-Disposition": `inline; filename="${encodeURIComponent(asset.originalName)}"`,
        // Files never change once uploaded (a replacement gets a new id).
        "Cache-Control": "private, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        ...(asset.mime === "image/svg+xml" ? { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'" } : {}),
      },
    });
  } catch {
    return new Response("File missing", { status: 404 });
  }
}
