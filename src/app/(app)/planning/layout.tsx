import { DocsLayout } from "@/components/docs/docs-layout";

export default function Layout({ children }: LayoutProps<"/planning">) {
  return <DocsLayout section="planning">{children}</DocsLayout>;
}
