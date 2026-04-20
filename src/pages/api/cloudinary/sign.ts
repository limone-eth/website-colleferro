import type { APIRoute } from "astro";
import crypto from "node:crypto";
import { isAuthenticated } from "@/lib/auth";

function signParams(paramsToSign: Record<string, unknown>, apiSecret: string): string {
  const normalized: Record<string, string> = {};
  for (const [k, v] of Object.entries(paramsToSign)) {
    if (v === undefined || v === null || v === "") continue;
    normalized[k] = String(v);
  }
  const str = Object.keys(normalized)
    .sort()
    .map((k) => `${k}=${normalized[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(str + apiSecret).digest("hex");
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!apiSecret) {
    return new Response(JSON.stringify({ error: "cloudinary not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const params = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const signature = signParams(params, apiSecret);

  return new Response(JSON.stringify({ signature }), {
    headers: { "Content-Type": "application/json" },
  });
};
