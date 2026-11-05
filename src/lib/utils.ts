export function fileUrl(assetId: number | null | undefined) {
  return assetId ? `/api/files/${assetId}` : null;
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDuration(seconds: number) {
  const s = Math.round(seconds * 10) / 10;
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rest = Math.round((s - m * 60) * 10) / 10;
  return `${m}m ${rest}s`;
}
