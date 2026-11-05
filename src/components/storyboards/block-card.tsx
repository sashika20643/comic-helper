"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { Copy, GripVertical, ImagePlus, Loader2, Play, Trash2, X } from "lucide-react";
import { AutoSaveField } from "@/components/autosave";
import { DropZone } from "@/components/upload";
import { deleteBlock, duplicateBlock, refreshBoard, removeBlockImage, updateBlock } from "@/actions/storyboards";
import type { Block } from "@/lib/schema";
import { cn, fileUrl } from "@/lib/utils";

export function BlockCard({
  block,
  index,
  dragging,
  onDragStart,
  onDragOver,
  onDragEnd,
  onPlay,
}: {
  block: Block;
  index: number;
  dragging: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  onPlay: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      onDrop={(e) => e.preventDefault()}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        onDragOver();
      }}
      className={cn("card flex flex-col overflow-hidden shadow-sm transition-opacity", dragging && "opacity-40", pending && "opacity-60")}
    >
      {/* Top bar */}
      <div className="flex items-center gap-1 border-b border-zinc-100 px-2 py-1.5">
        <span
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(block.id));
            if (cardRef.current) e.dataTransfer.setDragImage(cardRef.current, 20, 20);
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          className="cursor-grab rounded p-1 text-zinc-400 hover:bg-zinc-100 active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </span>
        <span className="text-sm font-semibold">#{index + 1}</span>
        <span className="ml-auto flex">
          <button className="icon-btn" title="Play from here" onClick={onPlay}>
            <Play className="size-3.5" />
          </button>
          <button className="icon-btn" title="Duplicate" onClick={() => start(() => duplicateBlock(block.id))}>
            <Copy className="size-3.5" />
          </button>
          <button
            className="icon-btn hover:text-red-600"
            title="Delete block"
            onClick={() => confirm(`Delete block #${index + 1}?`) && start(() => deleteBlock(block.id))}
          >
            <Trash2 className="size-3.5" />
          </button>
        </span>
      </div>

      {/* Image */}
      <DropZone
        extra={{ blockId: block.id }}
        multiple={false}
        onDone={async () => {
          await refreshBoard(block.boardId);
          router.refresh();
        }}
      >
        {({ busy, over, error }) => (
          <div className={cn("group relative aspect-video bg-zinc-100", over && "ring-4 ring-inset ring-indigo-300")}>
            {block.imageAssetId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl(block.imageAssetId)!} alt="" className="size-full object-contain" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1 text-zinc-400 hover:text-indigo-600">
                <ImagePlus className="size-7" />
                <span className="text-xs">Click, drop or paste an image</span>
              </div>
            )}
            {block.imageAssetId && (
              <button
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                title="Remove image"
                onClick={(e) => {
                  e.stopPropagation();
                  start(() => removeBlockImage(block.id));
                }}
              >
                <X className="size-3.5" />
              </button>
            )}
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <Loader2 className="size-6 animate-spin text-indigo-600" />
              </div>
            )}
            {error && <p className="absolute inset-x-0 bottom-0 bg-red-600 px-2 py-1 text-xs text-white">{error}</p>}
          </div>
        )}
      </DropZone>

      {/* Fields */}
      <div className="space-y-3 p-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label">Action</label>
            <AutoSaveField
              multiline
              value={block.action}
              onSave={(action) => updateBlock(block.id, { action })}
              placeholder="What happens in this shot?"
            />
          </div>
          <div className="w-20">
            <label className="label">Seconds</label>
            <AutoSaveField
              type="number"
              min={0}
              step={0.5}
              showStatus={false}
              value={String(block.duration)}
              onSave={(v) => updateBlock(block.id, { duration: parseFloat(v) || 0 })}
            />
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <AutoSaveField
            multiline
            value={block.notes}
            onSave={(notes) => updateBlock(block.id, { notes })}
            placeholder="Camera, dialogue, SFX…"
            className="text-zinc-600"
          />
        </div>
      </div>
    </div>
  );
}
