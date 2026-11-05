import { Clapperboard } from "lucide-react";

export default function Page() {
  return (
    <div className="m-auto max-w-sm p-8 text-center text-zinc-500">
      <Clapperboard className="mx-auto mb-3 size-10 text-zinc-300" />
      <p className="text-sm">
        Organise boards in folders like <b>Season 1 › Episode 1 › Board 1</b>. Use the
        <span className="mx-1 rounded bg-zinc-200 px-1.5 py-0.5 text-xs">+</span>
        buttons in the sidebar to create folders and boards.
      </p>
    </div>
  );
}
