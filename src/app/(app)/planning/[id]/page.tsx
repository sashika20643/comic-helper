import { DocPage } from "@/components/docs/doc-pages";

export default async function Page({ params, searchParams }: PageProps<"/planning/[id]">) {
  const { id } = await params;
  const { edit } = await searchParams;
  return <DocPage section="planning" id={id} edit={edit === "1"} />;
}
