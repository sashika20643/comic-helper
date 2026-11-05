import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { getKind } from "@/lib/design-config";
import { DesignDetail } from "@/components/design/design-detail";

export default async function Page({ params }: PageProps<"/design/[kind]/[id]">) {
  const { kind, id } = await params;
  const cfg = getKind(kind);
  if (!cfg) notFound();

  const [item] = await db
    .select()
    .from(schema.designItems)
    .where(and(eq(schema.designItems.id, Number(id) || 0), eq(schema.designItems.kind, kind)));
  if (!item) notFound();

  const assets = await db
    .select()
    .from(schema.assets)
    .where(eq(schema.assets.designItemId, item.id))
    .orderBy(desc(schema.assets.createdAt));

  return <DesignDetail key={item.id} item={item} assets={assets} kind={cfg} />;
}
