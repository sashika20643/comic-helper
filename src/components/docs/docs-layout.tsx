import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { DocList } from "./doc-list";

export async function DocsLayout({ section, children }: { section: "planning" | "screenplay"; children: React.ReactNode }) {
  const docs = await db
    .select({ id: schema.docs.id, title: schema.docs.title, updatedAt: schema.docs.updatedAt })
    .from(schema.docs)
    .where(eq(schema.docs.section, section))
    .orderBy(desc(schema.docs.updatedAt));

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="border-b border-zinc-200 bg-white md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <DocList section={section} docs={docs} />
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
