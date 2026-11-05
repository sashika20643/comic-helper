"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import type { Block } from "@/lib/schema";
import { fileUrl } from "@/lib/utils";

/** Simple animatic: shows each block for its duration. */
export function Player({ blocks, start, onClose }: { blocks: Block[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const [paused, setPaused] = useState(false);
  const block = blocks[i];

  useEffect(() => {
    if (paused || !block) return;
    const t = setTimeout(() => (i < blocks.length - 1 ? setI(i + 1) : setPaused(true)), Math.max(0.3, block.duration) * 1000);
    return () => clearTimeout(t);
  }, [i, paused, block, blocks.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((x) => Math.min(blocks.length - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [blocks.length, onClose]);

  if (!block) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="flex items-center gap-3 p-3 text-sm">
        <span className="font-semibold">#{i + 1}</span>
        <span className="text-white/60">/ {blocks.length} · {block.duration}s</span>
        <button className="ml-auto rounded-full p-2 hover:bg-white/10" onClick={onClose} aria-label="Close">
          <X className="size-5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center px-4">
        {block.imageAssetId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fileUrl(block.imageAssetId)!} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="text-white/40">No image</div>
        )}
      </div>
      <div className="mx-auto w-full max-w-3xl p-4 text-center">
        {block.action && <p className="text-lg">{block.action}</p>}
        {block.notes && <p className="mt-1 text-sm text-white/60">{block.notes}</p>}
      </div>
      {/* progress */}
      <div className="flex gap-1 px-4">
        {blocks.map((b, j) => (
          <button
            key={b.id}
            onClick={() => setI(j)}
            className={`h-1.5 cursor-pointer rounded-full ${j < i ? "bg-white" : j === i ? "bg-indigo-400" : "bg-white/25"}`}
            style={{ flexGrow: Math.max(0.3, b.duration) }}
            aria-label={`Go to block ${j + 1}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 p-4">
        <button className="rounded-full p-2 hover:bg-white/10" onClick={() => setI(Math.max(0, i - 1))} aria-label="Previous">
          <ChevronLeft />
        </button>
        <button
          className="rounded-full bg-white p-3 text-black hover:bg-white/90"
          onClick={() => {
            if (paused && i === blocks.length - 1) setI(0);
            setPaused(!paused);
          }}
          aria-label={paused ? "Play" : "Pause"}
        >
          {paused ? <Play className="size-5" /> : <Pause className="size-5" />}
        </button>
        <button className="rounded-full p-2 hover:bg-white/10" onClick={() => setI(Math.min(blocks.length - 1, i + 1))} aria-label="Next">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
