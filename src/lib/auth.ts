import type { APIContext, AstroCookies } from "astro";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { db } from "./db";

const scryptAsync = promisify(crypto.scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const COOKIE_NAME = "cc_admin";
const MAX_AGE = 60 * 60 * 24 * 30;
const SCRYPT_KEYLEN = 64;

export type UserRole = "admin" | "member";

export type User = {
  id: number;
  email: string;
  role: UserRole;
};

export type Session = { userId: number; role: UserRole };

function secret(): string {
  const s = import.meta.env.SESSION_SECRET ?? process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function bootstrapEmail(): string | null {
  const e = import.meta.env.ADMIN_EMAIL ?? process.env.ADMIN_EMAIL;
  return e ? String(e).toLowerCase().trim() : null;
}

function bootstrapPassword(): string | null {
  const p = import.meta.env.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;
  return p ? String(p) : null;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, SCRYPT_KEYLEN);
  return `${salt}.${hash.toString("hex")}`;
}

export async function verifyPasswordHash(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(".");
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, salt, SCRYPT_KEYLEN);
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export async function getUserByEmail(
  email: string,
): Promise<(User & { passwordHash: string }) | null> {
  const { rows } = await db.execute({
    sql: "SELECT id, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
    args: [normalizeEmail(email)],
  });
  const r = rows[0];
  if (!r) return null;
  return {
    id: Number(r.id),
    email: r.email as string,
    role: r.role as UserRole,
    passwordHash: r.password_hash as string,
  };
}

export async function getUserById(id: number): Promise<User | null> {
  const { rows } = await db.execute({
    sql: "SELECT id, email, role FROM users WHERE id = ? LIMIT 1",
    args: [id],
  });
  const r = rows[0];
  if (!r) return null;
  return { id: Number(r.id), email: r.email as string, role: r.role as UserRole };
}

export async function listUsers(): Promise<User[]> {
  const { rows } = await db.execute(
    "SELECT id, email, role FROM users ORDER BY role ASC, email ASC",
  );
  return rows.map((r) => ({
    id: Number(r.id),
    email: r.email as string,
    role: r.role as UserRole,
  }));
}

export async function countUsers(): Promise<number> {
  const { rows } = await db.execute("SELECT COUNT(*) AS c FROM users");
  return Number(rows[0]?.c ?? 0);
}

export async function createUser(
  email: string,
  password: string,
  role: UserRole,
): Promise<number> {
  const hash = await hashPassword(password);
  const { rows } = await db.execute({
    sql: "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?) RETURNING id",
    args: [normalizeEmail(email), hash, role],
  });
  return Number(rows[0]?.id);
}

export async function deleteUser(id: number): Promise<void> {
  await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [id] });
}

export async function updateUserPassword(id: number, password: string): Promise<void> {
  const hash = await hashPassword(password);
  await db.execute({
    sql: "UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ?",
    args: [hash, id],
  });
}

export function issueSession(cookies: AstroCookies, userId: number, role: UserRole): void {
  const issued = Date.now().toString();
  const payload = `${userId}.${role}.${issued}`;
  const sig = sign(payload);
  cookies.set(COOKIE_NAME, `v2.${payload}.${sig}`, {
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

export function readSession(cookies: AstroCookies): Session | null {
  const raw = cookies.get(COOKIE_NAME)?.value;
  if (!raw || !raw.startsWith("v2.")) return null;
  const parts = raw.slice(3).split(".");
  if (parts.length !== 4) return null;
  const [userIdStr, role, issued, sig] = parts;
  if (role !== "admin" && role !== "member") return null;
  const payload = `${userIdStr}.${role}.${issued}`;
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const age = (Date.now() - Number(issued)) / 1000;
  if (!Number.isFinite(age) || age < 0 || age >= MAX_AGE) return null;
  const userId = Number(userIdStr);
  if (!Number.isFinite(userId)) return null;
  return { userId, role };
}

export function isAuthenticated(cookies: AstroCookies): boolean {
  return readSession(cookies) !== null;
}

export function requireAdmin(ctx: APIContext): Response | null {
  if (isAuthenticated(ctx.cookies)) return null;
  return ctx.redirect("/admin/login");
}

export function requireRole(ctx: APIContext, role: UserRole): Response | null {
  const s = readSession(ctx.cookies);
  if (!s) return ctx.redirect("/admin/login");
  if (s.role !== role) return ctx.redirect("/admin");
  return null;
}

/**
 * Seed the first admin from ADMIN_EMAIL/ADMIN_PASSWORD when the users table is
 * empty. Once any user exists, env credentials are inert.
 */
export async function tryBootstrapAdmin(
  email: string,
  password: string,
): Promise<User | null> {
  const bEmail = bootstrapEmail();
  const bPassword = bootstrapPassword();
  if (!bEmail || !bPassword) return null;
  if ((await countUsers()) > 0) return null;
  if (normalizeEmail(email) !== bEmail) return null;
  const a = Buffer.from(password);
  const b = Buffer.from(bPassword);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  const id = await createUser(bEmail, bPassword, "admin");
  return { id, email: bEmail, role: "admin" };
}
