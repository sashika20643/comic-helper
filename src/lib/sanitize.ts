import "server-only";
import sanitizeHtml from "sanitize-html";
import { toHtml } from "./rich-text";

/** Only allow what the rich text editor produces. Everything else is stripped. */
export function cleanHtml(content: string): string {
  return sanitizeHtml(toHtml(content), {
    allowedTags: [
      "h1", "h2", "h3", "p", "br", "strong", "em", "u", "s", "code", "pre", "blockquote",
      "ul", "ol", "li", "a", "hr", "label", "input", "div", "span", "mark",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      ul: ["data-type"],
      ol: ["start"],
      li: ["data-type", "data-checked"],
      input: ["type", "checked", "disabled"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
      input: (tagName, attribs) =>
        attribs.type === "checkbox"
          ? { tagName, attribs: { type: "checkbox", ...(attribs.checked !== undefined ? { checked: "" } : {}), disabled: "" } }
          : { tagName: "span", attribs: {} },
    },
  });
}
