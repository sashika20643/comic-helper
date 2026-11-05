"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { AutoSaveField } from "@/components/autosave";
import { deleteDoc, updateDoc } from "@/actions/docs";
import type { Doc } from "@/lib/schema";

export function DocEditor({ doc, placeholder, mono, path = [] }: { doc: Doc; placeholder: string; mono?: boolean; path?: string[] }) {
  const [pending, start] = useTransition();
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col p-6">
      {path.length > 0 && <p className="mb-1 text-xs text-zinc-500">{path.join(" › ")}</p>}
      <div className="mb-1 flex items-start gap-3">
        <div className="flex-1">
          <AutoSaveField
            key={`t${doc.id}`}
            value={doc.title}
            onSave={(title) => updateDoc(doc.id, { title })}
            placeholder="Title"
            className="unstyled w-full bg-transparent text-2xl font-semibold outline-none"
          />
        </div>
        <button
          className="btn-danger"
          disabled={pending}
          onClick={() => confirm(`Delete "${doc.title}"?`) && start(() => deleteDoc(doc.id))}
        >
          <Trash2 className="size-4" /> Delete
        </button>
      </div>
      <p className="mb-4 text-xs text-zinc-400">
        Last edited {doc.updatedBy ? `by ${doc.updatedBy} ` : ""}· {new Date(doc.updatedAt).toLocaleString()}
      </p>
      <AutoSaveField
        key={`c${doc.id}`}
        multiline
        value={doc.content}
        onSave={(content) => updateDoc(doc.id, { content })}
        placeholder={placeholder}
        className={`min-h-[60vh] p-4 leading-relaxed ${mono ? "font-mono text-[13px]" : "text-[15px]"}`}
      />
    </div>
  );
}
