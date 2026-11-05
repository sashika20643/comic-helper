import { NavTabs } from "@/components/nav-tabs";
import { KINDS } from "@/lib/design-config";

export default function DesignLayout({ children }: LayoutProps<"/design">) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-4 sm:px-6">
      <NavTabs variant="sub" tabs={KINDS.map((k) => ({ href: `/design/${k.slug}`, label: k.label }))} />
      <div className="flex-1 py-6">{children}</div>
    </div>
  );
}
