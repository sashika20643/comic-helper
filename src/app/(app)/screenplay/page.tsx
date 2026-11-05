import { ScrollText } from "lucide-react";

export default function Page() {
  return (
    <div className="m-auto max-w-sm p-8 text-center text-zinc-500">
      <ScrollText className="mx-auto mb-3 size-10 text-zinc-300" />
      <p className="text-sm">
        Organise scripts in folders like <b>Season 1 › Episode 1 › Scene 1</b>. Use the buttons in the sidebar to
        create folders and scripts.
      </p>
    </div>
  );
}
