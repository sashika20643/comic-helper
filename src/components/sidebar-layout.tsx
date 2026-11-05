export function SidebarLayout({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="max-h-72 overflow-y-auto border-b border-zinc-200 bg-white md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:max-h-none md:w-72 md:shrink-0 md:border-b-0 md:border-r">
        {sidebar}
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
