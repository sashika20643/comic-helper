"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Lightbox({ src, caption, onClose }: { src: string; caption?: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-6" onClick={onClose}>
      <button className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10" aria-label="Close">
        <X />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={caption ?? ""} className="max-h-[85vh] max-w-full rounded-lg object-contain" />
      {caption && <p className="mt-3 text-sm text-white/80">{caption}</p>}
    </div>
  );
}
