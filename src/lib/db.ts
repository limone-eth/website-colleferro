import { createClient } from "@libsql/client";

const url = (import.meta.env.TURSO_DATABASE_URL ?? process.env.TURSO_DATABASE_URL)?.trim();
const authToken = (import.meta.env.TURSO_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN)?.trim();

if (!url) throw new Error("TURSO_DATABASE_URL is not set");

export const db = createClient({ url, authToken });

export type Match = {
  id: string;
  season: number;
  matchday: string;
  competition: string;
  date: string;
  dateLong: string;
  time: string;
  home: { name: string; short: string; crestUrl?: string };
  away: { name: string; short: string; crestUrl?: string };
  venue: string;
  status: "upcoming" | "live" | "finished";
  score?: { home: number; away: number };
  kickoffTs: number;
};

export type StandingRow = {
  pos: number;
  team: string;
  short?: string;
  crestUrl?: string;
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
  body: string;
  featured?: boolean;
};

export type Player = {
  id: number;
  season: number;
  number: number;
  name: string;
  role: "Portiere" | "Difensore" | "Centrocampista" | "Attaccante";
  dob?: string;
  nationality?: string;
  photoUrl?: string;
};

export type StaffMember = {
  id: number;
  season: number;
  name: string;
  role: string;
  group: "Tecnico" | "Medico" | "Dirigenza";
};

export type Sponsor = {
  id: number;
  season: number;
  name: string;
  tier: "Main" | "Technical" | "Official" | "Local";
  url?: string;
  logoUrl?: string;
};

export type Team = {
  id: number;
  season: number;
  name: string;
  short: string;
  crestUrl?: string;
};

const rowToMatch = (r: Record<string, unknown>): Match => ({
  id: r.id as string,
  season: Number(r.season),
  matchday: r.matchday as string,
  competition: r.competition as string,
  date: r.date as string,
  dateLong: r.date_long as string,
  time: r.time as string,
  home: {
    name: r.home_name as string,
    short: r.home_short as string,
    crestUrl: (r.home_crest as string | null) ?? undefined,
  },
  away: {
    name: r.away_name as string,
    short: r.away_short as string,
    crestUrl: (r.away_crest as string | null) ?? undefined,
  },
  venue: r.venue as string,
  status: r.status as Match["status"],
  score: r.score_home != null && r.score_away != null
    ? { home: Number(r.score_home), away: Number(r.score_away) }
    : undefined,
  kickoffTs: Number(r.kickoff_ts),
});

const MATCH_SELECT_WITH_CRESTS = `
  SELECT m.*,
         ht.crest_url AS home_crest,
         awt.crest_url AS away_crest
  FROM matches m
  LEFT JOIN teams ht  ON ht.season  = m.season AND ht.name  = m.home_name
  LEFT JOIN teams awt ON awt.season = m.season AND awt.name = m.away_name
`;

export async function getAllMatches(season: number): Promise<Match[]> {
  const { rows } = await db.execute({
    sql: `${MATCH_SELECT_WITH_CRESTS} WHERE m.season = ? ORDER BY m.kickoff_ts ASC`,
    args: [season],
  });
  return rows.map(rowToMatch);
}

export async function getColleferroMatches(season: number): Promise<Match[]> {
  const { rows } = await db.execute({
    sql: `${MATCH_SELECT_WITH_CRESTS} WHERE m.season = ? AND (m.home_name = ? OR m.away_name = ?) ORDER BY m.kickoff_ts ASC`,
    args: [season, "Colleferro", "Colleferro"],
  });
  return rows.map(rowToMatch);
}

export async function getNextMatch(season: number): Promise<Match | null> {
  const { rows } = await db.execute({
    sql: `${MATCH_SELECT_WITH_CRESTS} WHERE m.season = ? AND m.status = 'upcoming' AND (m.home_name = ? OR m.away_name = ?) ORDER BY m.kickoff_ts ASC LIMIT 1`,
    args: [season, "Colleferro", "Colleferro"],
  });
  return rows[0] ? rowToMatch(rows[0]) : null;
}

export async function getLastResults(season: number, limit = 3): Promise<Match[]> {
  const { rows } = await db.execute({
    sql: `${MATCH_SELECT_WITH_CRESTS} WHERE m.season = ? AND m.status = 'finished' AND (m.home_name = ? OR m.away_name = ?) ORDER BY m.kickoff_ts DESC LIMIT ?`,
    args: [season, "Colleferro", "Colleferro", limit],
  });
  return rows.map(rowToMatch);
}

export async function getStandings(season: number): Promise<StandingRow[]> {
  const { rows } = await db.execute({
    sql: `SELECT home_name, away_name, score_home, score_away FROM matches
          WHERE season = ? AND status = 'finished' AND score_home IS NOT NULL AND score_away IS NOT NULL`,
    args: [season],
  });
  type Stats = { team: string; p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number };
  const table = new Map<string, Stats>();
  const touch = (name: string): Stats => {
    let s = table.get(name);
    if (!s) {
      s = { team: name, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
      table.set(name, s);
    }
    return s;
  };

  // ensure every registered team shows up even with 0 matches, and capture crest/short for the row
  const { rows: teamsRows } = await db.execute({
    sql: "SELECT name, short, crest_url FROM teams WHERE season = ?",
    args: [season],
  });
  const meta = new Map<string, { short?: string; crestUrl?: string }>();
  for (const t of teamsRows) {
    const name = t.name as string;
    touch(name);
    meta.set(name, {
      short: (t.short as string | null) ?? undefined,
      crestUrl: (t.crest_url as string | null) ?? undefined,
    });
  }

  for (const r of rows) {
    const home = r.home_name as string;
    const away = r.away_name as string;
    const hg = Number(r.score_home);
    const ag = Number(r.score_away);
    const H = touch(home);
    const A = touch(away);
    H.p++; A.p++;
    H.gf += hg; H.ga += ag;
    A.gf += ag; A.ga += hg;
    if (hg > ag) { H.w++; H.pts += 3; A.l++; }
    else if (hg < ag) { A.w++; A.pts += 3; H.l++; }
    else { H.d++; A.d++; H.pts++; A.pts++; }
  }
  const sorted = [...table.values()].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.localeCompare(b.team);
  });
  return sorted.map((s, i) => ({
    pos: i + 1,
    team: s.team,
    short: meta.get(s.team)?.short,
    crestUrl: meta.get(s.team)?.crestUrl,
    p: s.p, w: s.w, d: s.d, l: s.l, gf: s.gf, ga: s.ga, pts: s.pts,
    highlight: s.team === "Colleferro",
  }));
}

export async function getTeams(season: number): Promise<Team[]> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM teams WHERE season = ? ORDER BY name ASC",
    args: [season],
  });
  return rows.map((r) => ({
    id: Number(r.id),
    season: Number(r.season),
    name: r.name as string,
    short: r.short as string,
    crestUrl: (r.crest_url as string | null) ?? undefined,
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
  body: bodyToHtml(r.body as string),
  featured: Number(r.featured) === 1,
});

// Body is HTML. Legacy rows stored it as JSON array of plain-text paragraphs —
// convert on read for backward compatibility.
function bodyToHtml(raw: string): string {
  if (!raw) return "";
  if (raw.trimStart().startsWith("[")) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return arr.map((p) => `<p>${escapeHtml(String(p))}</p>`).join("");
      }
    } catch { /* fall through */ }
  }
  return raw;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

export async function getSquad(season: number): Promise<Player[]> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM squad WHERE season = ? ORDER BY CASE role WHEN 'Portiere' THEN 1 WHEN 'Difensore' THEN 2 WHEN 'Centrocampista' THEN 3 WHEN 'Attaccante' THEN 4 END, number ASC",
    args: [season],
  });
  return rows.map((r) => ({
    id: Number(r.id),
    season: Number(r.season),
    number: Number(r.number),
    name: r.name as string,
    role: r.role as Player["role"],
    dob: (r.dob as string | null) ?? undefined,
    nationality: (r.nationality as string | null) ?? undefined,
    photoUrl: (r.photo_url as string | null) ?? undefined,
  }));
}

export async function getStaff(season: number): Promise<StaffMember[]> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM staff WHERE season = ? ORDER BY CASE grp WHEN 'Tecnico' THEN 1 WHEN 'Medico' THEN 2 WHEN 'Dirigenza' THEN 3 END, ordering ASC, id ASC",
    args: [season],
  });
  return rows.map((r) => ({
    id: Number(r.id),
    season: Number(r.season),
    name: r.name as string,
    role: r.role as string,
    group: r.grp as StaffMember["group"],
  }));
}

export async function getSponsors(season: number): Promise<Sponsor[]> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM sponsors WHERE season = ? ORDER BY CASE tier WHEN 'Main' THEN 1 WHEN 'Technical' THEN 2 WHEN 'Official' THEN 3 WHEN 'Local' THEN 4 END, ordering ASC, id ASC",
    args: [season],
  });
  return rows.map((r) => ({
    id: Number(r.id),
    season: Number(r.season),
    name: r.name as string,
    tier: r.tier as Sponsor["tier"],
    url: (r.url as string | null) ?? undefined,
    logoUrl: (r.logo_url as string | null) ?? undefined,
  }));
}
