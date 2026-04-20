import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    const env = {
      has_TURSO_DATABASE_URL: !!process.env.TURSO_DATABASE_URL,
      has_TURSO_AUTH_TOKEN: !!process.env.TURSO_AUTH_TOKEN,
      has_ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      has_SESSION_SECRET: !!process.env.SESSION_SECRET,
      url_prefix: process.env.TURSO_DATABASE_URL?.slice(0, 30),
      node: process.version,
    };
    const { db } = await import("@/lib/db");
    const r = await db.execute("SELECT COUNT(*) AS c FROM matches");
    return new Response(JSON.stringify({ env, matches: r.rows[0] }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const err = e as Error;
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
