import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getFolders } from "@/lib/folders";
import { FolderTree } from "@/components/folder-tree";
import { SidebarLayout } from "@/components/sidebar-layout";

export default async function Layout({ children }: LayoutProps<"/screenplay">) {
  const [folders, scripts] = await Promise.all([
    getFolders("screenplay"),
    db
      .select({ id: schema.docs.id, name: schema.docs.title, folderId: schema.docs.folderId })
      .from(schema.docs)
      .where(eq(schema.docs.section, "screenplay"))
      .orderBy(asc(schema.docs.title)),
  ]);
  return <SidebarLayout sidebar={<FolderTree section="screenplay" folders={folders} boards={scripts} />}>{children}</SidebarLayout>;
}
