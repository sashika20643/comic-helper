"use client";

/** Formats a date in the viewer's own locale/time zone (server and browser may differ). */
export function LocalTime({ date }: { date: Date | string }) {
  return (
    <time dateTime={new Date(date).toISOString()} suppressHydrationWarning>
      {new Date(date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
    </time>
  );
}
