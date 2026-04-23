import type { APIRoute } from "astro";
import { getAllNews } from "@/lib/db";

const STATIC_PATHS: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/news", changefreq: "daily", priority: "0.8" },
  { path: "/stagione", changefreq: "weekly", priority: "0.8" },
  { path: "/squadra/prima-squadra", changefreq: "weekly", priority: "0.7" },
  { path: "/squadra/staff", changefreq: "monthly", priority: "0.5" },
  { path: "/stadio", changefreq: "yearly", priority: "0.5" },
  { path: "/storia", changefreq: "yearly", priority: "0.5" },
  { path: "/sponsor", changefreq: "monthly", priority: "0.5" },
  { path: "/media", changefreq: "weekly", priority: "0.5" },
  { path: "/contatti", changefreq: "yearly", priority: "0.4" },
];

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? "https://www.colleferrocalcio.it").replace(/\/$/, "");
  const news = await getAllNews();

  const entries: Array<{ loc: string; lastmod?: string; changefreq: string; priority: string }> = [
    ...STATIC_PATHS.map((s) => ({ loc: `${base}${s.path}`, changefreq: s.changefreq, priority: s.priority })),
    ...news.map((n) => ({
      loc: `${base}/news/${n.slug}`,
      lastmod: n.dateIso || undefined,
      changefreq: "monthly",
      priority: "0.6",
    })),
  ];

  const body = entries
    .map((e) => {
      const parts = [`    <loc>${xmlEscape(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`    <lastmod>${xmlEscape(e.lastmod)}</lastmod>`);
      parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      parts.push(`    <priority>${e.priority}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
