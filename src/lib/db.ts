import { createClient } from "@libsql/client";

const url = import.meta.env.TURSO_DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
const authToken = import.meta.env.TURSO_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;

if (!url) throw new Error("TURSO_DATABASE_URL is not set");

export const db = createClient({ url, authToken });

export type Match = {
  id: string;
  matchday: string;
  competition: string;
  date: string;
  dateLong: string;
  time: string;
  home: { name: string; short: string };
  away: { name: string; short: string };
  venue: string;
  status: "upcoming" | "live" | "finished";
  score?: { home: number; away: number };
  ticketUrl?: string;
  kickoffTs: number;
};

export type StandingRow = {
  pos: number;
  team: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
  highlight?: boolean;
};

export type NewsPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateIso: string;
  category: string;
  author: string;
  body: string[];
  featured?: boolean;
};

export type Player = {
  number: number;
  name: string;
  role: "Portiere" | "Difensore" | "Centrocampista" | "Attaccante";
  dob?: string;
  nationality?: string;
};

export type StaffMember = {
  id: number;
  name: string;
  role: string;
  group: "Tecnico" | "Medico" | "Dirigenza";
};

export type Sponsor = {
  id: number;
  name: string;
  tier: "Main" | "Technical" | "Official" | "Local";
  url?: string;
};

const rowToMatch = (r: Record<string, unknown>): Match => ({
  id: r.id as string,
  matchday: r.matchday as string,
  competition: r.competition as string,
  date: r.date as string,
  dateLong: r.date_long as string,
  time: r.time as string,
  home: { name: r.home_name as string, short: r.home_short as string },
  away: { name: r.away_name as string, short: r.away_short as string },
  venue: r.venue as string,
  status: r.status as Match["status"],
  score: r.score_home != null && r.score_away != null
    ? { home: Number(r.score_home), away: Number(r.score_away) }
    : undefined,
  ticketUrl: (r.ticket_url as string | null) ?? undefined,
  kickoffTs: Number(r.kickoff_ts),
});

export async function getAllMatches(): Promise<Match[]> {
  const { rows } = await db.execute("SELECT * FROM matches ORDER BY kickoff_ts ASC");
  return rows.map(rowToMatch);
}

export async function getNextMatch(): Promise<Match | null> {
  const { rows } = await db.execute(
    "SELECT * FROM matches WHERE status = 'upcoming' ORDER BY kickoff_ts ASC LIMIT 1",
  );
  return rows[0] ? rowToMatch(rows[0]) : null;
}

export async function getLastResults(limit = 3): Promise<Match[]> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM matches WHERE status = 'finished' ORDER BY kickoff_ts DESC LIMIT ?",
    args: [limit],
  });
  return rows.map(rowToMatch);
}

export async function getStandings(): Promise<StandingRow[]> {
  const { rows } = await db.execute("SELECT * FROM standings ORDER BY pos ASC");
  return rows.map((r) => ({
    pos: Number(r.pos),
    team: r.team as string,
    p: Number(r.played),
    w: Number(r.wins),
    d: Number(r.draws),
    l: Number(r.losses),
    gf: Number(r.goals_for),
    ga: Number(r.goals_against),
    pts: Number(r.points),
    highlight: Number(r.highlight) === 1,
  }));
}

const rowToNews = (r: Record<string, unknown>): NewsPost => ({
  slug: r.slug as string,
  title: r.title as string,
  excerpt: r.excerpt as string,
  date: r.date as string,
  dateIso: r.date_iso as string,
  category: r.category as string,
  author: r.author as string,
  body: JSON.parse(r.body as string) as string[],
  featured: Number(r.featured) === 1,
});

export async function getAllNews(): Promise<NewsPost[]> {
  const { rows } = await db.execute("SELECT * FROM news ORDER BY date_iso DESC");
  return rows.map(rowToNews);
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM news WHERE slug = ? LIMIT 1",
    args: [slug],
  });
  return rows[0] ? rowToNews(rows[0]) : null;
}

export async function getFeaturedNews(): Promise<NewsPost | null> {
  const { rows } = await db.execute(
    "SELECT * FROM news WHERE featured = 1 ORDER BY date_iso DESC LIMIT 1",
  );
  if (rows[0]) return rowToNews(rows[0]);
  const { rows: fallback } = await db.execute("SELECT * FROM news ORDER BY date_iso DESC LIMIT 1");
  return fallback[0] ? rowToNews(fallback[0]) : null;
}

export async function getSquad(): Promise<Player[]> {
  const { rows } = await db.execute(
    "SELECT * FROM squad ORDER BY CASE role WHEN 'Portiere' THEN 1 WHEN 'Difensore' THEN 2 WHEN 'Centrocampista' THEN 3 WHEN 'Attaccante' THEN 4 END, number ASC",
  );
  return rows.map((r) => ({
    number: Number(r.number),
    name: r.name as string,
    role: r.role as Player["role"],
    dob: (r.dob as string | null) ?? undefined,
    nationality: (r.nationality as string | null) ?? undefined,
  }));
}

export async function getStaff(): Promise<StaffMember[]> {
  const { rows } = await db.execute(
    "SELECT * FROM staff ORDER BY CASE grp WHEN 'Tecnico' THEN 1 WHEN 'Medico' THEN 2 WHEN 'Dirigenza' THEN 3 END, ordering ASC, id ASC",
  );
  return rows.map((r) => ({
    id: Number(r.id),
    name: r.name as string,
    role: r.role as string,
    group: r.grp as StaffMember["group"],
  }));
}

export async function getSponsors(): Promise<Sponsor[]> {
  const { rows } = await db.execute(
    "SELECT * FROM sponsors ORDER BY CASE tier WHEN 'Main' THEN 1 WHEN 'Technical' THEN 2 WHEN 'Official' THEN 3 WHEN 'Local' THEN 4 END, ordering ASC, id ASC",
  );
  return rows.map((r) => ({
    id: Number(r.id),
    name: r.name as string,
    tier: r.tier as Sponsor["tier"],
    url: (r.url as string | null) ?? undefined,
  }));
}
