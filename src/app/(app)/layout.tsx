import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { NavTabs } from "@/components/nav-tabs";

const TABS = [
  { href: "/planning", label: "Planning" },
  { href: "/design", label: "Design" },
  { href: "/screenplay", label: "Screenplay" },
  { href: "/storyboards", label: "Storyboards" },
];

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-sm">💥</span>
            <span className="hidden sm:inline">Comic Helper</span>
          </Link>
          <NavTabs tabs={TABS} />
          <div className="ml-auto flex items-center gap-1">
            <Link href="/account" className="btn-ghost" title="Account">
              <UserRound className="size-4" />
              <span className="hidden sm:inline">{user.username}</span>
            </Link>
            <form action={logout}>
              <button className="icon-btn" title="Log out" aria-label="Log out">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
