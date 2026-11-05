"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, ImageIcon, Loader2, Star, Trash2, Upload } from "lucide-react";
import { AutoSaveField } from "@/components/autosave";
import { DropZone } from "@/components/upload";
import { Lightbox } from "@/components/lightbox";
import { deleteDesignItem, refreshDesign, removeDesignImage, setCover, updateAsset, updateDesignItem } from "@/actions/design";
import type { KindConfig } from "@/lib/design-config";
import type { Asset, DesignItem } from "@/lib/schema";
import { cn, fileUrl } from "@/lib/utils";

export function DesignDetail({ item, assets, kind }: { item: DesignItem; assets: Asset[]; kind: KindConfig }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [filter, setFilter] = useState<string>("All");
  const [view, setView] = useState<Asset | null>(null);

  const tags = ["All", ...kind.imageTags];
  const shown = filter === "All" ? assets : assets.filter((a) => a.tag === filter);
  const count = (t: string) => (t === "All" ? assets.length : assets.filter((a) => a.tag === t).length);
  const cover = assets.find((a) => a.id === item.coverAssetId);
  const short = kind.fields.filter((f) => f.type !== "textarea");
  const long = kind.fields.filter((f) => f.type === "textarea");

  const saveField = (key: string) => (value: string) => updateDesignItem(item.id, { field: { key, value } });
  const afterUpload = async () => {
    await refreshDesign();
    router.refresh();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/design/${kind.slug}`} className="icon-btn" title={`Back to ${kind.label}`}>
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <AutoSaveField
            value={item.name}
            onSave={(name) => updateDesignItem(item.id, { name })}
            className="unstyled w-full bg-transparent text-2xl font-semibold outline-none"
            placeholder={`${kind.singular} name`}
          />
        </div>
        <button
          className="btn-danger"
          disabled={pending}
          onClick={() =>
            confirm(`Delete ${item.name} and all ${assets.length} images? This cannot be undone.`) &&
            start(() => deleteDesignItem(item.id))
          }
        >
          <Trash2 className="size-4" /> Delete
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Cover */}
        <div>
          <DropZone extra={{ designItemId: item.id, tag: kind.imageTags[0] }} onDone={afterUpload}>
            {({ busy, over }) => (
              <div
                className={cn(
                  "group relative aspect-[3/4] overflow-hidden rounded-xl border bg-zinc-100",
                  over ? "border-indigo-500 ring-4 ring-indigo-100" : "border-zinc-200",
                )}
              >
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fileUrl(cover.id)!} alt={item.name} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center text-zinc-400">
                    <ImageIcon className="size-10" />
                    <span className="text-sm">Drop, paste or click to add the main image</span>
                  </div>
                )}
                {busy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                    <Loader2 className="size-6 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>
            )}
          </DropZone>
          {cover && (
            <button className="btn-ghost mt-2 w-full text-xs" onClick={() => setView(cover)}>
              View full size
            </button>
          )}
        </div>

        {/* Details */}
        <div className="card space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {short.map((f) => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <AutoSaveField
                  value={item.fields[f.key] ?? ""}
                  onSave={saveField(f.key)}
                  placeholder={f.placeholder}
                  list={f.options ? `opts-${f.key}` : undefined}
                />
                {f.options && (
                  <datalist id={`opts-${f.key}`}>
                    {f.options.map((o) => <option key={o} value={o} />)}
                  </datalist>
                )}
              </div>
            ))}
          </div>
          {long.map((f) => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <AutoSaveField multiline value={item.fields[f.key] ?? ""} onSave={saveField(f.key)} placeholder={f.placeholder} />
            </div>
          ))}
          <div>
            <label className="label">Other notes</label>
            <AutoSaveField
              multiline
              value={item.notes}
              onSave={(notes) => updateDesignItem(item.id, { notes })}
              placeholder="Anything else worth remembering…"
            />
          </div>
          <p className="text-xs text-zinc-400">
            Changes save automatically{item.updatedBy ? ` · last edited by ${item.updatedBy}` : ""}
          </p>
        </div>
      </div>

      {/* Reference library */}
      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="mr-2 text-lg font-semibold">Reference library</h2>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === t ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400",
              )}
            >
              {t} <span className="opacity-60">{count(t)}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <DropZone
            extra={{ designItemId: item.id, tag: filter === "All" ? kind.imageTags[0] : filter }}
            onDone={afterUpload}
          >
            {({ busy, over, error }) => (
              <div
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-3 text-center text-zinc-500 transition-colors hover:border-indigo-400 hover:text-indigo-600",
                  over ? "border-indigo-500 bg-indigo-50" : "border-zinc-300",
                )}
              >
                {busy ? <Loader2 className="size-6 animate-spin" /> : <Upload className="size-6" />}
                <span className="text-xs font-medium">{busy ? "Uploading…" : "Add images"}</span>
                <span className="text-[11px] text-zinc-400">
                  as “{filter === "All" ? kind.imageTags[0] : filter}”
                </span>
                {error && <span className="text-[11px] text-red-600">{error}</span>}
              </div>
            )}
          </DropZone>

          {shown.map((a) => (
            <figure key={a.id} className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl(a.id)!}
                alt={a.originalName}
                loading="lazy"
                onClick={() => setView(a)}
                className="size-full cursor-zoom-in object-cover"
              />
              {a.id === item.coverAssetId && (
                <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-amber-950">
                  Main
                </span>
              )}
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <select
                  value={a.tag}
                  onChange={(e) => start(() => updateAsset(a.id, { tag: e.target.value }))}
                  className="min-w-0 flex-1 cursor-pointer rounded bg-white/90 px-1 py-0.5 text-[11px] outline-none"
                  title="Image type"
                >
                  {!kind.imageTags.includes(a.tag) && <option value={a.tag}>{a.tag || "—"}</option>}
                  {kind.imageTags.map((t) => <option key={t}>{t}</option>)}
                </select>
                {a.id !== item.coverAssetId && (
                  <button
                    className="rounded p-1 text-white hover:bg-white/20"
                    title="Make main image"
                    onClick={() => start(() => setCover(item.id, a.id))}
                  >
                    <Star className="size-3.5" />
                  </button>
                )}
                <button
                  className="rounded p-1 text-white hover:bg-red-500/80"
                  title="Delete image"
                  onClick={() => confirm("Delete this image?") && start(() => removeDesignImage(item.id, a.id))}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {view && <Lightbox src={fileUrl(view.id)!} caption={view.tag || view.originalName} onClose={() => setView(null)} />}
    </div>
  );
}
