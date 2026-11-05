"use client";

import { useState, useTransition } from "react";
import { ChevronRight, Clock, Play, Plus, Trash2 } from "lucide-react";
import { AutoSaveField } from "@/components/autosave";
import { addBlock, deleteBoard, renameBoard, reorderBlocks } from "@/actions/storyboards";
import type { Block, Board } from "@/lib/schema";
import { formatDuration } from "@/lib/utils";
import { BlockCard } from "./block-card";
import { Player } from "./player";

export function BoardEditor({ board, blocks, path }: { board: Board; blocks: Block[]; path: string[] }) {
  const [pending, start] = useTransition();
  const [playing, setPlaying] = useState<number | null>(null);

  // Local order so drag & drop feels instant; re-sync when the server sends new blocks.
  const serverKey = blocks.map((b) => b.id).join(",");
  const [order, setOrder] = useState(() => blocks.map((b) => b.id));
  const [lastKey, setLastKey] = useState(serverKey);
  if (lastKey !== serverKey) {
    setLastKey(serverKey);
    setOrder(blocks.map((b) => b.id));
  }
  const [dragId, setDragId] = useState<number | null>(null);

  const byId = new Map(blocks.map((b) => [b.id, b]));
  const ordered = order.map((id) => byId.get(id)).filter((b): b is Block => !!b);
  const total = blocks.reduce((s, b) => s + (b.duration || 0), 0);

  function dragOver(targetId: number) {
    if (dragId === null || dragId === targetId) return;
    setOrder((prev) => {
      const next = prev.filter((id) => id !== dragId);
      next.splice(prev.indexOf(targetId), 0, dragId);
      return next;
    });
  }
  function dragEnd() {
    if (dragId === null) return;
    setDragId(null);
    if (order.join(",") !== serverKey) start(() => reorderBlocks(board.id, order));
  }

  return (
    <div className="flex-1 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        {path.length > 0 && (
          <div className="mb-1 flex items-center gap-1 text-xs text-zinc-500">
            {path.map((p, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3" />}
                {p}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-48 flex-1">
            <AutoSaveField
              value={board.name}
              onSave={(name) => renameBoard(board.id, name)}
              className="unstyled w-full bg-transparent text-2xl font-semibold outline-none"
            />
          </div>
          <span className="flex items-center gap-1.5 text-sm text-zinc-500">
            {blocks.length} block{blocks.length === 1 ? "" : "s"} ·
            <Clock className="size-4" /> {formatDuration(total)}
          </span>
          <button className="btn-secondary" disabled={!blocks.length} onClick={() => setPlaying(0)}>
            <Play className="size-4" /> Play
          </button>
          <button
            className="btn-danger"
            disabled={pending}
            onClick={() => confirm(`Delete board "${board.name}" and its ${blocks.length} blocks?`) && start(() => deleteBoard(board.id))}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Blocks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {ordered.map((b, i) => (
          <BlockCard
            key={b.id}
            block={b}
            index={i}
            dragging={dragId === b.id}
            onDragStart={() => setDragId(b.id)}
            onDragOver={() => dragOver(b.id)}
            onDragEnd={dragEnd}
            onPlay={() => setPlaying(i)}
          />
        ))}
        <button
          onClick={() => start(() => addBlock(board.id))}
          disabled={pending}
          className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 text-zinc-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50"
        >
          <Plus className="size-7" />
          <span className="text-sm font-medium">Add block</span>
        </button>
      </div>

      {playing !== null && <Player blocks={ordered} start={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
