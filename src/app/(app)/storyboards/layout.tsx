import { asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getFolders } from "@/lib/folders";
import { FolderTree } from "@/components/folder-tree";
import { SidebarLayout } from "@/components/sidebar-layout";

export default async function Layout({ children }: LayoutProps<"/storyboards">) {
  const [folders, boards] = await Promise.all([
    getFolders("storyboards"),
    db.select({ id: schema.boards.id, name: schema.boards.name, folderId: schema.boards.folderId }).from(schema.boards).orderBy(asc(schema.boards.name)),
  ]);
  return <SidebarLayout sidebar={<FolderTree section="storyboards" folders={folders} boards={boards} />}>{children}</SidebarLayout>;
}
