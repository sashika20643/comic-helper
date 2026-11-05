"use client";

import { useTransition } from "react";
import { Plus } from "lucide-react";
import { createDoc } from "@/actions/docs";

export function EmptyDocs({
  section,
  intro,
  suggestions,
}: {
  section: "planning" | "screenplay";
  intro: string;
  suggestions: string[];
}) {
  const [pending, start] = useTransition();
  return (
    <div className="m-auto max-w-md p-8 text-center">
      <p className="mb-4 text-sm text-zinc-500">{intro}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button key={s} className="btn-secondary" disabled={pending} onClick={() => start(() => createDoc(section, s))}>
            <Plus className="size-3.5" /> {s}
          </button>
        ))}
      </div>
    </div>
  );
}
