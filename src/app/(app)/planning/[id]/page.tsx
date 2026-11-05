import { DocPage } from "@/components/docs/doc-pages";

export default async function Page({ params }: PageProps<"/planning/[id]">) {
  const { id } = await params;
  return <DocPage section="planning" id={id} />;
}
