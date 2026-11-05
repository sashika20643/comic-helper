import { DocPage } from "@/components/docs/doc-pages";

export default async function Page({ params }: PageProps<"/screenplay/[id]">) {
  const { id } = await params;
  return <DocPage section="screenplay" id={id} />;
}
