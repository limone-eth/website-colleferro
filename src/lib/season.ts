import type { AstroCookies } from "astro";
import { db } from "./db";

export type Season = { year: number; label: string; isCurrent: boolean };

const COOKIE = "admin_season";

export async function getAllSeasons(): Promise<Season[]> {
  const { rows } = await db.execute("SELECT year, label, is_current FROM seasons ORDER BY year DESC");
  return rows.map((r) => ({
    year: Number(r.year),
    label: r.label as string,
    isCurrent: Number(r.is_current) === 1,
  }));
}

export async function getCurrentSeasonYear(): Promise<number> {
  const { rows } = await db.execute("SELECT year FROM seasons WHERE is_current = 1 LIMIT 1");
  if (rows[0]) return Number(rows[0].year);
  const { rows: any2 } = await db.execute("SELECT year FROM seasons ORDER BY year DESC LIMIT 1");
  if (any2[0]) return Number(any2[0].year);
  return new Date().getFullYear();
}

export async function setCurrentSeason(year: number): Promise<void> {
  await db.batch(
    [
      { sql: "UPDATE seasons SET is_current = 0", args: [] },
      { sql: "UPDATE seasons SET is_current = 1 WHERE year = ?", args: [year] },
    ],
    "write",
  );
}

export async function createSeason(year: number, label?: string): Promise<void> {
  const computedLabel = label ?? `${year}/${String((year + 1) % 100).padStart(2, "0")}`;
  await db.execute({
    sql: "INSERT OR IGNORE INTO seasons (year, label, is_current) VALUES (?, ?, 0)",
    args: [year, computedLabel],
  });
}

export function formatSeason(year: number): string {
  return `${year}/${String((year + 1) % 100).padStart(2, "0")}`;
}

/** Admin: resolve active season from cookie, falling back to current. */
export async function resolveAdminSeason(cookies: AstroCookies): Promise<number> {
  const raw = cookies.get(COOKIE)?.value;
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    const { rows } = await db.execute({ sql: "SELECT year FROM seasons WHERE year = ?", args: [parsed] });
    if (rows[0]) return parsed;
  }
  return getCurrentSeasonYear();
}

export function setAdminSeasonCookie(cookies: AstroCookies, year: number): void {
  cookies.set(COOKIE, String(year), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  });
}
