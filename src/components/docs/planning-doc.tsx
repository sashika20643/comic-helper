"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { LocalTime } from "@/components/local-time";
import { RichEditor } from "@/components/rich-text/rich-editor";
import { deleteDoc, updateDoc } from "@/actions/docs";
import { isEmptyHtml } from "@/lib/rich-text";
import type { Asset, Doc } from "@/lib/schema";
import { Attachments } from "./attachments";

/**
 * A planning document. Opens in read-only viewer mode; "Edit" switches to the rich text editor
 * with an explicit Save button (Ctrl/⌘+S also saves).
 */
export function PlanningDoc({
  doc,
  html,
  attachments,
  path,
  startEditing,
}: {
  doc: Doc;
  html: string; // sanitized HTML from the server
  attachments: Asset[];
  path: string[];
  startEditing: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(startEditing);
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(html);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();
  const dirty = editing && (title !== doc.title || content !== html);

  const enterEdit = () => {
    setTitle(doc.title);
    setContent(html);
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    if (dirty && !confirm("Discard your unsaved changes?")) return;
    setEditing(false);
    router.replace(`/planning/${doc.id}`, { scroll: false });
  };

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await updateDoc(doc.id, { title, content });
      setEditing(false);
      router.replace(`/planning/${doc.id}`, { scroll: false });
      router.refresh();
    } catch {
      setError("Couldn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }, [doc.id, title, content, router]);

  // Ctrl/⌘+S to save, and warn before leaving with unsaved changes.
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [editing, dirty, saving, save]);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">
      {path.length > 0 && <p className="mb-1 text-xs text-zinc-500">{path.join(" › ")}</p>}

      {/* Header */}
      <div className="mb-1 flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded-lg bg-transparent text-2xl font-semibold outline-none placeholder:text-zinc-300 focus:bg-white focus:ring-3 focus:ring-indigo-100"
            />
          ) : (
            <h1 className="text-2xl font-semibold">{doc.title}</h1>
          )}
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            {dirty && !saving && <span className="text-xs text-amber-600">Unsaved changes</span>}
            <button className="btn-secondary" onClick={cancel} disabled={saving}>
              <X className="size-4" /> Cancel
            </button>
            <button className="btn-primary" onClick={save} disabled={saving} title="Save (Ctrl/⌘ S)">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={enterEdit}>
            <Pencil className="size-4" /> Edit
          </button>
        )}
      </div>
      <p className="mb-5 text-xs text-zinc-400">
        Last edited {doc.updatedBy ? `by ${doc.updatedBy} ` : ""}· <LocalTime date={doc.updatedAt} />
      </p>
      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {/* Body */}
      {editing ? (
        <RichEditor
          initialHtml={html}
          onChange={setContent}
          placeholder="Write freely: background, world, themes, character arcs, episode outlines…"
        />
      ) : isEmptyHtml(html) ? (
        <button
          onClick={enterEdit}
          className="w-full cursor-pointer rounded-xl border-2 border-dashed border-zinc-200 p-10 text-sm text-zinc-400 hover:border-indigo-300 hover:text-indigo-600"
        >
          This document is empty. Click to start writing.
        </button>
      ) : (
        <article
          className="rich-content prose prose-zinc max-w-none"
          // Sanitized on the server (src/lib/sanitize.ts)
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

      <Attachments docId={doc.id} files={attachments} />

      {editing && (
        <div className="mt-10 border-t border-zinc-200 pt-4">
          <button
            className="btn-danger"
            disabled={deleting}
            onClick={() =>
              confirm(`Delete "${doc.title}" and its ${attachments.length} attachment(s)? This cannot be undone.`) &&
              startDelete(() => deleteDoc(doc.id))
            }
          >
            <Trash2 className="size-4" /> Delete document
          </button>
        </div>
      )}
    </div>
  );
}
