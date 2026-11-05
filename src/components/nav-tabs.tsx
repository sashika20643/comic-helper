"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavTabs({ tabs, variant = "main" }: { tabs: { href: string; label: string }[]; variant?: "main" | "sub" }) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex gap-1 overflow-x-auto", variant === "sub" && "border-b border-zinc-200")}>
      {tabs.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "whitespace-nowrap text-sm font-medium transition-colors",
              variant === "main" &&
                cn("rounded-lg px-3 py-1.5", active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-200/70"),
              variant === "sub" &&
                cn(
                  "-mb-px border-b-2 px-3 py-2",
                  active ? "border-indigo-600 text-indigo-700" : "border-transparent text-zinc-500 hover:text-zinc-900",
                ),
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
