"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ChevronRight, FilePlus2, FileText, Folder, FolderOpen, FolderPlus, LayoutPanelLeft, Pencil, Trash2 } from "lucide-react";
import { createBoard } from "@/actions/storyboards";
import { createDoc } from "@/actions/docs";
import { createFolder, deleteFolder, renameFolder, type FolderSection } from "@/actions/folders";
import { cn } from "@/lib/utils";

type F = { id: number; name: string; parentId: number | null };
type B = { id: number; name: string; folderId: number | null };
type Draft = { kind: "folder" | "item"; parentId: number | null; initial?: string } | { kind: "rename"; id: number } | null;

const SECTIONS = {
  storyboards: {
    title: "Storyboards",
    item: "board",
    Icon: LayoutPanelLeft,
    deleteWhat: "sub-folders, boards and blocks",
    create: (folderId: number | null, name: string) => createBoard(folderId, name),
  },
  screenplay: {
    title: "Scripts",
    item: "script",
    Icon: FileText,
    deleteWhat: "sub-folders and scripts",
    create: (folderId: number | null, name: string) => createDoc("screenplay", name, folderId),
  },
};

/** Folder tree used by Storyboards and Screenplay. `boards` = the items (boards or scripts). */
export function FolderTree({ section, folders, boards }: { section: FolderSection; folders: F[]; boards: B[] }) {
  const cfg = SECTIONS[section];
  const STORE = `${section}-collapsed-folders`;
  // Folders are open by default; we remember the ones you collapse (per browser).
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set());
  const [draft, setDraftState] = useState<Draft>(null);
  const [, start] = useTransition();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage once
      if (saved) setCollapsed(new Set(JSON.parse(saved) as number[]));
    } catch {}
  }, [STORE]);
  const toggle = (id: number, forceOpen?: boolean) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (forceOpen || next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORE, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  const setDraft = (d: Draft) => {
    if (d && d.kind !== "rename" && d.parentId) toggle(d.parentId, true);
    setDraftState(d);
  };

  function submit(name: string) {
    const d = draft;
    setDraft(null);
    if (!d || !name.trim()) return;
    if (d.kind === "folder") start(() => createFolder(section, d.parentId, name));
    else if (d.kind === "item") start(() => cfg.create(d.parentId, name));
    else if (d.kind === "rename") start(() => renameFolder(d.id, name));
  }

  const render = (parentId: number | null, depth: number): React.ReactNode => {
    const subFolders = folders.filter((f) => f.parentId === parentId);
    const subBoards = boards.filter((b) => b.folderId === parentId);
    const creating = draft && draft.kind !== "rename" && draft.parentId === parentId ? draft : null;
    return (
      <ul>
        {subFolders.map((f) => {
          const isOpen = !collapsed.has(f.id);
          const renaming = draft?.kind === "rename" && draft.id === f.id;
          return (
            <li key={`f${f.id}`}>
              <div
                className="group flex items-center gap-1 rounded-lg py-1 pr-1 hover:bg-zinc-100"
                style={{ paddingLeft: depth * 14 + 4 }}
              >
                <button className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left text-sm" onClick={() => toggle(f.id)}>
                  <ChevronRight className={cn("size-3.5 shrink-0 text-zinc-400 transition-transform", isOpen && "rotate-90")} />
                  {isOpen ? <FolderOpen className="size-4 shrink-0 text-amber-500" /> : <Folder className="size-4 shrink-0 text-amber-500" />}
                  {renaming ? null : <span className="truncate">{f.name}</span>}
                </button>
                {renaming && <NameInput initial={f.name} onDone={submit} />}
                {!renaming && (
                  <span className="flex opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <button className="icon-btn size-6" title={`New ${cfg.item} here`} onClick={() => setDraft({ kind: "item", parentId: f.id })}>
                      <FilePlus2 className="size-3.5" />
                    </button>
                    <button className="icon-btn size-6" title="New sub-folder" onClick={() => setDraft({ kind: "folder", parentId: f.id })}>
                      <FolderPlus className="size-3.5" />
                    </button>
                    <button className="icon-btn size-6" title="Rename" onClick={() => setDraft({ kind: "rename", id: f.id })}>
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      className="icon-btn size-6 hover:text-red-600"
                      title="Delete folder"
                      onClick={() =>
                        confirm(`Delete "${f.name}" with everything inside it (${cfg.deleteWhat})?`) &&
                        start(() => deleteFolder(f.id))
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </span>
                )}
              </div>
              {isOpen && render(f.id, depth + 1)}
            </li>
          );
        })}
        {subBoards.map((b) => (
          <ItemLink key={`b${b.id}`} item={b} depth={depth} href={`/${section}/${b.id}`} Icon={cfg.Icon} />
        ))}
        {creating && (
          <li className="flex items-center gap-1.5 py-1 pr-1" style={{ paddingLeft: depth * 14 + 22 }}>
            {creating.kind === "folder" ? <Folder className="size-4 text-amber-500" /> : <LayoutPanelLeft className="size-4 text-indigo-500" />}
            <NameInput initial={creating.initial ?? ""} placeholder={creating.kind === "folder" ? "Folder name" : "Board name"} onDone={submit} />
          </li>
        )}
      </ul>
    );
  };

  return (
    <div className="p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{cfg.title}</span>
        <span className="flex">
          <button className="icon-btn" title={`New ${cfg.item}`} onClick={() => setDraft({ kind: "item", parentId: null })}>
            <FilePlus2 className="size-4" />
          </button>
          <button className="icon-btn" title="New folder (e.g. Season 1)" onClick={() => setDraft({ kind: "folder", parentId: null })}>
            <FolderPlus className="size-4" />
          </button>
        </span>
      </div>
      {render(null, 0)}
      {!folders.length && !boards.length && !draft && (
        <button className="btn-secondary mt-2 w-full" onClick={() => setDraft({ kind: "folder", parentId: null, initial: "Season 1" })}>
          <FolderPlus className="size-4" /> Create “Season 1”
        </button>
      )}
    </div>
  );
}

function ItemLink({ item, depth, href, Icon }: { item: B; depth: number; href: string; Icon: typeof FileText }) {
  const pathname = usePathname();
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-1.5 rounded-lg py-1 pr-2 text-sm",
          pathname === href ? "bg-indigo-50 font-medium text-indigo-700" : "text-zinc-700 hover:bg-zinc-100",
        )}
        style={{ paddingLeft: depth * 14 + 22 }}
      >
        <Icon className="size-4 shrink-0 text-indigo-500" />
        <span className="truncate">{item.name}</span>
      </Link>
    </li>
  );
}

function NameInput({ initial, placeholder, onDone }: { initial: string; placeholder?: string; onDone: (v: string) => void }) {
  const [v, setV] = useState(initial);
  const [done, setDone] = useState(false);
  const finish = (value: string) => {
    if (done) return;
    setDone(true);
    onDone(value);
  };
  return (
    <input
      autoFocus
      value={v}
      placeholder={placeholder}
      onChange={(e) => setV(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={() => finish(v)}
      onKeyDown={(e) => {
        if (e.key === "Enter") finish(v);
        if (e.key === "Escape") finish("");
      }}
      className="input min-w-0 flex-1 px-2 py-0.5"
    />
  );
}
