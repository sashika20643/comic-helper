"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function RichEditor({
  initialHtml,
  placeholder,
  onChange,
}: {
  initialHtml: string;
  placeholder?: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing…" }),
    ],
    content: initialHtml,
    autofocus: "end",
    editorProps: {
      attributes: { class: "rich-content prose prose-zinc max-w-none min-h-[50vh] px-5 py-4 focus:outline-none" },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className="card overflow-clip focus-within:border-indigo-400 focus-within:ring-3 focus-within:ring-indigo-100">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      task: e.isActive("taskList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const c = () => editor.chain().focus();

  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", prev ?? "https://");
    if (url === null) return;
    if (!url.trim()) c().extendMarkRange("link").unsetLink().run();
    else c().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  return (
    <div className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-white/95 p-1.5 backdrop-blur">
      <Btn on={s.h1} title="Heading 1" onClick={() => c().toggleHeading({ level: 1 }).run()} icon={Heading1} />
      <Btn on={s.h2} title="Heading 2" onClick={() => c().toggleHeading({ level: 2 }).run()} icon={Heading2} />
      <Btn on={s.h3} title="Heading 3" onClick={() => c().toggleHeading({ level: 3 }).run()} icon={Heading3} />
      <Sep />
      <Btn on={s.bold} title="Bold (Ctrl/⌘ B)" onClick={() => c().toggleBold().run()} icon={Bold} />
      <Btn on={s.italic} title="Italic (Ctrl/⌘ I)" onClick={() => c().toggleItalic().run()} icon={Italic} />
      <Btn on={s.underline} title="Underline (Ctrl/⌘ U)" onClick={() => c().toggleUnderline().run()} icon={Underline} />
      <Btn on={s.strike} title="Strikethrough" onClick={() => c().toggleStrike().run()} icon={Strikethrough} />
      <Btn on={s.link} title="Link" onClick={setLink} icon={Link2} />
      <Sep />
      <Btn on={s.bullet} title="Bullet list" onClick={() => c().toggleBulletList().run()} icon={List} />
      <Btn on={s.ordered} title="Numbered list" onClick={() => c().toggleOrderedList().run()} icon={ListOrdered} />
      <Btn on={s.task} title="Checklist" onClick={() => c().toggleTaskList().run()} icon={ListChecks} />
      <Btn on={s.quote} title="Quote" onClick={() => c().toggleBlockquote().run()} icon={Quote} />
      <Btn title="Divider" onClick={() => c().setHorizontalRule().run()} icon={Minus} />
      <Sep />
      <Btn title="Undo (Ctrl/⌘ Z)" disabled={!s.canUndo} onClick={() => c().undo().run()} icon={Undo2} />
      <Btn title="Redo" disabled={!s.canRedo} onClick={() => c().redo().run()} icon={Redo2} />
    </div>
  );
}

function Btn({
  on,
  title,
  onClick,
  icon: Icon,
  disabled,
}: {
  on?: boolean;
  title: string;
  onClick: () => void;
  icon: typeof Bold;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={on}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection
      onClick={onClick}
      className={cn(
        "inline-flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors disabled:cursor-default disabled:opacity-30",
        on ? "bg-indigo-100 text-indigo-700" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-zinc-200" />;
