"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export async function uploadFiles(files: File[], extra: Record<string, string | number>) {
  const form = new FormData();
  for (const f of files) form.append("files", f);
  for (const [k, v] of Object.entries(extra)) form.append(k, String(v));
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Upload failed");
  return res.json();
}

/**
 * Click, drag & drop, or paste (when focused/hovered) images to upload.
 */
export function DropZone({
  extra,
  multiple = true,
  accept = "image/*",
  onDone,
  className,
  children,
}: {
  extra: Record<string, string | number>;
  multiple?: boolean;
  accept?: string;
  onDone: () => void;
  className?: string;
  children: (state: { busy: boolean; over: boolean; error: string | null }) => ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(list: FileList | File[] | null) {
    const ok = (f: File) =>
      accept.split(",").some((a) => {
        a = a.trim();
        return a.endsWith("/*") ? f.type.startsWith(a.slice(0, -1)) : f.type === a;
      });
    const files = Array.from(list ?? []).filter(ok);
    if (list && list.length && !files.length) {
      setError("That file type isn't supported here");
      return;
    }
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      await uploadFiles(multiple ? files : files.slice(0, 1), extra);
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        e.stopPropagation();
        setOver(false);
        handle(e.dataTransfer.files);
      }}
      onPaste={(e) => handle(e.clipboardData.files)}
      className={cn("cursor-pointer outline-none", className)}
    >
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
      {children({ busy, over, error })}
    </div>
  );
}
