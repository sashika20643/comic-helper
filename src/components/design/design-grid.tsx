"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ImageIcon, Plus, Search } from "lucide-react";
import { createDesignItem } from "@/actions/design";
import { fileUrl } from "@/lib/utils";

type Item = { id: number; name: string; coverAssetId: number | null; subtitle: string };

export function DesignGrid({ kind, singular, items }: { kind: string; singular: string; items: Item[] }) {
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const shown = items.filter((i) => (i.name + " " + i.subtitle).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      {items.length > 6 && (
        <div className="relative mb-5 max-w-xs">
          <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
          <input className="input pl-9" placeholder={`Search ${kind}…`} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {/* Add new */}
        <div className="flex aspect-[3/4] flex-col rounded-xl border-2 border-dashed border-zinc-300 bg-white/50 transition-colors hover:border-indigo-400">
          {adding ? (
            <form
              className="m-auto flex w-full flex-col gap-2 p-3"
              action={(fd) => start(() => createDesignItem(kind, fd))}
            >
              <input name="name" className="input" placeholder={`${singular} name`} autoFocus required />
              <div className="flex gap-2">
                <button className="btn-primary flex-1" disabled={pending}>{pending ? "Creating…" : "Create"}</button>
                <button type="button" className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="m-auto flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-zinc-500 hover:text-indigo-600"
            >
              <Plus className="size-8" />
              <span className="text-sm font-medium">Add {singular.toLowerCase()}</span>
            </button>
          )}
        </div>

        {shown.map((i) => (
          <Link key={i.id} href={`/design/${kind}/${i.id}`} className="group">
            <div className="aspect-[3/4] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
              {i.coverAssetId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fileUrl(i.coverAssetId)!}
                  alt={i.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-zinc-300">
                  <ImageIcon className="size-10" />
                </div>
              )}
            </div>
            <div className="mt-2 px-0.5">
              <p className="truncate text-sm font-medium group-hover:text-indigo-700">{i.name}</p>
              {i.subtitle && <p className="truncate text-xs text-zinc-500">{i.subtitle}</p>}
            </div>
          </Link>
        ))}
      </div>
      {!items.length && (
        <p className="mt-6 text-sm text-zinc-500">No {kind} yet — click the card above to add your first one.</p>
      )}
    </div>
  );
}
