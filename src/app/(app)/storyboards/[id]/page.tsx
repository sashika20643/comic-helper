import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { getFolderPath } from "@/lib/folders";
import { BoardEditor } from "@/components/storyboards/board-editor";

export default async function Page({ params }: PageProps<"/storyboards/[id]">) {
  const { id } = await params;
  const [board] = await db.select().from(schema.boards).where(eq(schema.boards.id, Number(id) || 0));
  if (!board) notFound();

  const [blocks, path] = await Promise.all([
    db.select().from(schema.blocks).where(eq(schema.blocks.boardId, board.id)).orderBy(asc(schema.blocks.position), asc(schema.blocks.id)),
    getFolderPath(board.folderId), // breadcrumb: Season 1 › Episode 1
  ]);

  return <BoardEditor key={board.id} board={board} blocks={blocks} path={path} />;
}
