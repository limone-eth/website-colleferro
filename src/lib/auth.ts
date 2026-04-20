import type { APIContext, AstroCookies } from "astro";
import crypto from "node:crypto";

const COOKIE_NAME = "cc_admin";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret(): string {
  const s = import.meta.env.SESSION_SECRET ?? process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function adminPassword(): string {
  const p = import.meta.env.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;
  if (!p) throw new Error("ADMIN_PASSWORD is not set");
  return p;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function verifyPassword(input: string): boolean {
  const expected = adminPassword();
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function issueSession(cookies: AstroCookies): void {
  const issued = Date.now().toString();
  const sig = sign(issued);
  cookies.set(COOKIE_NAME, `${issued}.${sig}`, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: MAX_AGE,
  });
}

export function clearSession(cookies: AstroCookies): void {
  cookies.delete(COOKIE_NAME, { path: "/" });
}

export function isAuthenticated(cookies: AstroCookies): boolean {
  const raw = cookies.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const [issued, sig] = raw.split(".");
  if (!issued || !sig) return false;
  const expected = sign(issued);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  const age = (Date.now() - Number(issued)) / 1000;
  return age < MAX_AGE;
}

export function requireAdmin(ctx: APIContext): Response | null {
  if (isAuthenticated(ctx.cookies)) return null;
  return ctx.redirect("/admin/login");
}
