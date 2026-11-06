import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { getFolderPath } from "@/lib/folders";
import { cleanHtml } from "@/lib/sanitize";
import { DocEditor } from "./doc-editor";
import { PlanningDoc } from "./planning-doc";
import { EmptyDocs } from "./empty-docs";

const COPY = {
  planning: {
    placeholder: "Write freely — background, world, themes, characters' arcs, episode outlines…",
    suggestions: ["Story overview", "World & background", "Themes & tone", "Season plan", "Ideas inbox"],
    intro: "Keep the background and planning for your comic here. Start with one of these:",
  },
  screenplay: {
    placeholder: "EP 1 — SCENE 1\nINT. ROOFTOP – NIGHT\n\nKAI\n(whispering)\nThey're here.\n",
    suggestions: [],
    intro: "",
  },
};

export function DocsIndex({ section }: { section: "planning" }) {
  return <EmptyDocs section={section} intro={COPY[section].intro} suggestions={COPY[section].suggestions} />;
}

export async function DocPage({
  section,
  id,
  edit = false,
}: {
  section: "planning" | "screenplay";
  id: string;
  edit?: boolean;
}) {
  const [doc] = await db
    .select()
    .from(schema.docs)
    .where(and(eq(schema.docs.id, Number(id) || 0), eq(schema.docs.section, section)));
  if (!doc) notFound();
  const path = await getFolderPath(doc.folderId);

  if (section === "planning") {
    const attachments = await db
      .select()
      .from(schema.assets)
      .where(eq(schema.assets.docId, doc.id))
      .orderBy(asc(schema.assets.createdAt));
    return (
      <PlanningDoc
        key={doc.id}
        doc={doc}
        html={cleanHtml(doc.content)}
        attachments={attachments}
        path={path}
        startEditing={edit}
      />
    );
  }
  return <DocEditor key={doc.id} doc={doc} path={path} placeholder={COPY[section].placeholder} mono={section === "screenplay"} />;
}
