"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { FileText, Plus } from "lucide-react";
import { createDoc } from "@/actions/docs";
import { cn } from "@/lib/utils";

export function DocList({
  section,
  docs,
}: {
  section: "planning" | "screenplay";
  docs: { id: number; title: string }[];
}) {
  const pathname = usePathname();
  const [pending, start] = useTransition();
  return (
    <div className="p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {section === "planning" ? "Planning docs" : "Scripts"}
        </span>
        <button className="icon-btn" title="New document" disabled={pending} onClick={() => start(() => createDoc(section))}>
          <Plus className="size-4" />
        </button>
      </div>
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {docs.map((d) => {
          const href = `/${section}/${d.id}`;
          return (
            <li key={d.id}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-2 truncate whitespace-nowrap rounded-lg px-2 py-1.5 text-sm",
                  pathname === href ? "bg-indigo-50 font-medium text-indigo-700" : "text-zinc-700 hover:bg-zinc-100",
                )}
              >
                <FileText className="size-4 shrink-0 opacity-60" />
                <span className="truncate">{d.title || "Untitled"}</span>
              </Link>
            </li>
          );
        })}
        {!docs.length && <li className="px-2 py-1.5 text-sm text-zinc-400">No documents yet</li>}
      </ul>
    </div>
  );
}
