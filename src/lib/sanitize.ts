import sanitizeHtml from "sanitize-html";

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "em", "s", "u",
      "h2", "h3", "h4",
      "ul", "ol", "li",
      "blockquote",
      "a",
      "hr",
      "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tag, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
    },
  });
}
