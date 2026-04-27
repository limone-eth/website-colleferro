/**
 * Inject Cloudinary transformations into an existing upload URL.
 * URLs look like:
 *   https://res.cloudinary.com/<cloud>/image/upload/v123456/folder/file.jpg
 * We insert the transformation string right after `/upload/`:
 *   https://res.cloudinary.com/<cloud>/image/upload/<params>/v123456/folder/file.jpg
 * If the URL already has transformations, they are replaced.
 */
export function cldTransform(url: string | undefined, params: string): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname !== "res.cloudinary.com") return url;
  } catch {
    return url;
  }
  const marker = "/upload/";
  const i = url.indexOf(marker);
  if (i < 0) return url;
  const before = url.slice(0, i + marker.length);
  let after = url.slice(i + marker.length);
  // strip existing transformations (segment before the version or file name that contains _)
  const firstSlash = after.indexOf("/");
  if (firstSlash > 0) {
    const firstSeg = after.slice(0, firstSlash);
    if (/(^|,)[a-z]_/.test(firstSeg)) {
      after = after.slice(firstSlash + 1);
    }
  }
  return `${before}${params}/${after}`;
}

export const CLD = {
  playerCard: (url?: string) => cldTransform(url, "w_480,h_600,c_fill,g_face,q_auto,f_auto"),
  sponsorLogo: (url?: string) => cldTransform(url, "w_320,h_160,c_fit,q_auto,f_auto"),
  articleInline: (url?: string) => cldTransform(url, "w_1200,c_limit,q_auto,f_auto"),
  teamCrest: (url?: string) => cldTransform(url, "w_120,h_120,c_fit,q_auto,f_auto"),
};

/**
 * Rewrite <img src=".../upload/..."> inside an HTML string to add article-friendly
 * transformations (limit width, auto format/quality).
 */
export function rewriteArticleImages(html: string): string {
  return html.replace(/<img\b([^>]*?)\ssrc="(https:\/\/res\.cloudinary\.com\/[^"]+)"/gi, (_m, attrs, src) => {
    const transformed = CLD.articleInline(src) ?? src;
    return `<img${attrs} src="${transformed}"`;
  });
}
