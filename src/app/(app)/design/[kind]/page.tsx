import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { getKind } from "@/lib/design-config";
import { DesignGrid } from "@/components/design/design-grid";

export default async function Page({ params }: PageProps<"/design/[kind]">) {
  const { kind } = await params;
  const cfg = getKind(kind);
  if (!cfg) notFound();

  const items = await db
    .select({
      id: schema.designItems.id,
      name: schema.designItems.name,
      fields: schema.designItems.fields,
      coverAssetId: schema.designItems.coverAssetId,
    })
    .from(schema.designItems)
    .where(eq(schema.designItems.kind, kind))
    .orderBy(asc(schema.designItems.name));

  // Subtitle on each card = first short field (e.g. category).
  const subKey = cfg.fields.find((f) => f.options)?.key;
  return (
    <DesignGrid
      kind={cfg.slug}
      singular={cfg.singular}
      items={items.map((i) => ({ id: i.id, name: i.name, coverAssetId: i.coverAssetId, subtitle: subKey ? i.fields[subKey] ?? "" : "" }))}
    />
  );
}
