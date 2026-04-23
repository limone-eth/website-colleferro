export const SITE = {
  name: "A.S.D. Colleferro Calcio",
  shortName: "Colleferro Calcio",
  legalName: "A.S.D. Colleferro Calcio",
  locale: "it_IT",
  foundingYear: "1925",
  logoPath: "/logo.png",
  defaultOgImagePath: "/logo.png",
  stadium: {
    name: "Stadio Comunale Caslini",
    addressLocality: "Colleferro",
    addressRegion: "RM",
    addressCountry: "IT",
  },
} as const;

export function absoluteUrl(pathOrUrl: string, base: URL | string): string {
  try {
    return new URL(pathOrUrl, base).toString();
  } catch {
    return pathOrUrl;
  }
}

const IMG_SRC_RE = /<img\b[^>]*?\ssrc="([^"]+)"/i;
export function firstImageFromHtml(html: string): string | undefined {
  return html.match(IMG_SRC_RE)?.[1];
}

export function toIsoDate(input: string | undefined): string | undefined {
  if (!input) return undefined;
  const d = new Date(input);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

// JSON.stringify hardened for safe embedding inside <script type="application/ld+json">.
// Escapes </ and U+2028 / U+2029 so the payload can't close the script tag or break JS parsers.
export function jsonLdString(value: unknown): string {
  return JSON.stringify(value)
    .replace(/<\//g, "<\\/")
    .split(LS).join("\\u2028")
    .split(PS).join("\\u2029");
}
