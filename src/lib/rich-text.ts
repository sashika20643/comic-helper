// Shared by server and client. Older planning docs were saved as plain text;
// this turns them into simple HTML paragraphs so the rich editor can open them.
export function toHtml(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("<")) return content;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return trimmed
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function isEmptyHtml(html: string) {
  return !html.replace(/<[^>]*>/g, "").trim() && !/<(hr|img|input)/.test(html);
}
