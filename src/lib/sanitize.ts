import sanitizeHtml from "sanitize-html";

const ALLOWED_IMG_HOSTS = ["res.cloudinary.com"];

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
      "img", "figure", "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      figure: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    exclusiveFilter: (frame) => {
      if (frame.tag === "img") {
        const src = frame.attribs.src ?? "";
        try {
          const u = new URL(src);
          if (!ALLOWED_IMG_HOSTS.includes(u.hostname)) return true;
        } catch {
          return true;
        }
      }
      return false;
    },
    transformTags: {
      a: (_tag, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
      img: (_tag, attribs) => ({
        tagName: "img",
        attribs: {
          ...attribs,
          loading: attribs.loading ?? "lazy",
        },
      }),
    },
  });
}
