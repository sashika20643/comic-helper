"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Status = "idle" | "saving" | "saved" | "error";

/**
 * Text input / textarea that saves itself: 700ms after you stop typing, and on blur.
 * Shows a tiny status so people trust it saved.
 */
export function AutoSaveField({
  value: initial,
  onSave,
  multiline,
  className,
  showStatus = true,
  autoGrow = true,
  ...rest
}: {
  value: string;
  onSave: (value: string) => Promise<unknown>;
  multiline?: boolean;
  showStatus?: boolean;
  autoGrow?: boolean;
} & Omit<ComponentProps<"input"> & ComponentProps<"textarea">, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<Status>("idle");
  const saved = useRef(initial);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ref = useRef<HTMLTextAreaElement>(null);

  async function save(v: string) {
    clearTimeout(timer.current);
    if (v === saved.current) return;
    setStatus("saving");
    try {
      await onSave(v);
      saved.current = v;
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  function onChange(v: string) {
    setValue(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(v), 700);
  }

  // Grow textarea with its content.
  useEffect(() => {
    if (multiline && autoGrow && ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + 2 + "px";
    }
  }, [value, multiline, autoGrow]);

  // Flush pending save when leaving the page.
  useEffect(() => () => clearTimeout(timer.current), []);

  const common = {
    value,
    onBlur: () => save(value),
    className: cn(!className?.includes("unstyled") && "input", className, multiline && autoGrow && "resize-none overflow-hidden"),
  };

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          ref={ref}
          rows={2}
          {...(rest as ComponentProps<"textarea">)}
          {...common}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input {...(rest as ComponentProps<"input">)} {...common} onChange={(e) => onChange(e.target.value)} />
      )}
      {showStatus && status !== "idle" && (
        <span
          className={cn(
            "pointer-events-none absolute right-2 top-2 text-[10px] font-medium transition-opacity",
            status === "saving" && "text-zinc-400",
            status === "saved" && "text-emerald-600",
            status === "error" && "text-red-600",
          )}
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Not saved!"}
        </span>
      )}
    </div>
  );
}
