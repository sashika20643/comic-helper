"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Download, ExternalLink, FileText, Loader2, Paperclip, Trash2, Upload, X } from "lucide-react";
import { DropZone } from "@/components/upload";
import { Lightbox } from "@/components/lightbox";
import { deleteAttachment, refreshPlanning } from "@/actions/docs";
import type { Asset } from "@/lib/schema";
import { cn, fileUrl } from "@/lib/utils";

const isPdf = (a: Asset) => a.mime === "application/pdf";
const size = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);

export function Attachments({ docId, files }: { docId: number; files: Asset[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<Asset | null>(null);
  const [pending, start] = useTransition();

  return (
    <section className="mt-10">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700">
        <Paperclip className="size-4" /> Attachments
        {files.length > 0 && <span className="font-normal text-zinc-400">{files.length}</span>}
      </h2>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {files.map((a) => (
          <div key={a.id} className={cn("card group flex items-center gap-3 p-2 pr-3", pending && "opacity-60")}>
            <button
              onClick={() => setOpen(a)}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
              title="Open"
            >
              {isPdf(a) ? (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <FileText className="size-5" />
                </span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fileUrl(a.id)!} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium group-hover:text-indigo-700">{a.originalName}</span>
                <span className="block text-xs text-zinc-400">
                  {isPdf(a) ? "PDF" : "Image"} · {size(a.size)}
                  {a.uploadedBy ? ` · ${a.uploadedBy}` : ""}
                </span>
              </span>
            </button>
            <button
              className="icon-btn opacity-100 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
              title="Delete attachment"
              onClick={() => confirm(`Delete "${a.originalName}"?`) && start(() => deleteAttachment(a.id))}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}

        <DropZone
          extra={{ docId }}
          accept="application/pdf,image/*"
          onDone={async () => {
            await refreshPlanning();
            router.refresh();
          }}
        >
          {({ busy, over, error }) => (
            <div
              className={cn(
                "flex h-full min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-2 text-sm text-zinc-500 transition-colors hover:border-indigo-400 hover:text-indigo-600",
                over ? "border-indigo-500 bg-indigo-50" : "border-zinc-300",
              )}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {busy ? "Uploading…" : "Add PDF or image"}
              {error && <span className="text-xs text-red-600">{error}</span>}
            </div>
          )}
        </DropZone>
      </div>

      {open && isPdf(open) && <PdfViewer file={open} onClose={() => setOpen(null)} />}
      {open && !isPdf(open) && <Lightbox src={fileUrl(open.id)!} caption={open.originalName} onClose={() => setOpen(null)} />}
    </section>
  );
}

function PdfViewer({ file, onClose }: { file: Asset; onClose: () => void }) {
  const url = fileUrl(file.id)!;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-900/90 p-2 sm:p-6" onClick={onClose}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-2">
          <FileText className="size-4 shrink-0 text-red-600" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.originalName}</span>
          <a href={url} target="_blank" rel="noreferrer" className="btn-ghost" title="Open in new tab">
            <ExternalLink className="size-4" /> <span className="hidden sm:inline">New tab</span>
          </a>
          <a href={url} download={file.originalName} className="btn-ghost" title="Download">
            <Download className="size-4" /> <span className="hidden sm:inline">Download</span>
          </a>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        <iframe src={url} title={file.originalName} className="w-full flex-1 bg-zinc-100" />
      </div>
    </div>
  );
}
