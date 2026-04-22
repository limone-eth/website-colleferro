import { db } from "./db";

export type MatchInput = {
  id: string;
  season: number;
  matchday: string;
  competition: string;
  date: string;
  dateLong: string;
  time: string;
  homeName: string;
  homeShort: string;
  awayName: string;
  awayShort: string;
  venue: string;
  status: "upcoming" | "live" | "finished";
  scoreHome?: number | null;
  scoreAway?: number | null;
  kickoffTs: number;
};

export async function upsertMatch(m: MatchInput, existingId?: string) {
  if (existingId) {
    await db.execute({
      sql: `UPDATE matches SET season=?, matchday=?, competition=?, date=?, date_long=?, time=?, home_name=?, home_short=?, away_name=?, away_short=?, venue=?, status=?, score_home=?, score_away=?, kickoff_ts=?, updated_at=unixepoch() WHERE id=?`,
      args: [
        m.season, m.matchday, m.competition, m.date, m.dateLong, m.time,
        m.homeName, m.homeShort, m.awayName, m.awayShort,
        m.venue, m.status,
        m.scoreHome ?? null, m.scoreAway ?? null,
        m.kickoffTs,
        existingId,
      ],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO matches (id, season, matchday, competition, date, date_long, time, home_name, home_short, away_name, away_short, venue, status, score_home, score_away, kickoff_ts) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        m.id, m.season, m.matchday, m.competition, m.date, m.dateLong, m.time,
        m.homeName, m.homeShort, m.awayName, m.awayShort,
        m.venue, m.status,
        m.scoreHome ?? null, m.scoreAway ?? null,
        m.kickoffTs,
      ],
    });
  }
}

export async function deleteMatch(id: string) {
  await db.execute({ sql: "DELETE FROM matches WHERE id = ?", args: [id] });
}

export type NewsInput = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateIso: string;
  category: string;
  author: string;
  body: string;
  featured: boolean;
};

export async function upsertNews(n: NewsInput, existingSlug?: string) {
  if (existingSlug) {
    await db.execute({
      sql: `UPDATE news SET slug=?, title=?, excerpt=?, date=?, date_iso=?, category=?, author=?, body=?, featured=?, updated_at=unixepoch() WHERE slug=?`,
      args: [n.slug, n.title, n.excerpt, n.date, n.dateIso, n.category, n.author, n.body, n.featured ? 1 : 0, existingSlug],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO news (slug, title, excerpt, date, date_iso, category, author, body, featured) VALUES (?,?,?,?,?,?,?,?,?)`,
      args: [n.slug, n.title, n.excerpt, n.date, n.dateIso, n.category, n.author, n.body, n.featured ? 1 : 0],
    });
  }
}

export async function deleteNews(slug: string) {
  await db.execute({ sql: "DELETE FROM news WHERE slug = ?", args: [slug] });
}

export type PlayerInput = {
  season: number;
  number: number;
  name: string;
  role: "Portiere" | "Difensore" | "Centrocampista" | "Attaccante";
  dob?: string | null;
  nationality?: string | null;
  photoUrl?: string | null;
};

export async function upsertPlayer(p: PlayerInput, existingId?: number) {
  if (existingId != null) {
    await db.execute({
      sql: `UPDATE squad SET season=?, number=?, name=?, role=?, dob=?, nationality=?, photo_url=? WHERE id=?`,
      args: [p.season, p.number, p.name, p.role, p.dob ?? null, p.nationality ?? null, p.photoUrl ?? null, existingId],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO squad (season, number, name, role, dob, nationality, photo_url) VALUES (?,?,?,?,?,?,?)`,
      args: [p.season, p.number, p.name, p.role, p.dob ?? null, p.nationality ?? null, p.photoUrl ?? null],
    });
  }
}

export async function deletePlayer(id: number) {
  await db.execute({ sql: "DELETE FROM squad WHERE id = ?", args: [id] });
}

export type StaffInput = {
  season: number;
  name: string;
  role: string;
  group: "Tecnico" | "Medico" | "Dirigenza";
  ordering: number;
};

export async function upsertStaff(s: StaffInput, id?: number) {
  if (id != null) {
    await db.execute({
      sql: `UPDATE staff SET season=?, name=?, role=?, grp=?, ordering=? WHERE id=?`,
      args: [s.season, s.name, s.role, s.group, s.ordering, id],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO staff (season, name, role, grp, ordering) VALUES (?,?,?,?,?)`,
      args: [s.season, s.name, s.role, s.group, s.ordering],
    });
  }
}

export async function deleteStaff(id: number) {
  await db.execute({ sql: "DELETE FROM staff WHERE id = ?", args: [id] });
}

export type SponsorInput = {
  season: number;
  name: string;
  tier: "Main" | "Technical" | "Official" | "Local";
  url?: string | null;
  ordering: number;
  logoUrl?: string | null;
};

export async function upsertSponsor(s: SponsorInput, id?: number) {
  if (id != null) {
    await db.execute({
      sql: `UPDATE sponsors SET season=?, name=?, tier=?, url=?, ordering=?, logo_url=? WHERE id=?`,
      args: [s.season, s.name, s.tier, s.url ?? null, s.ordering, s.logoUrl ?? null, id],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO sponsors (season, name, tier, url, ordering, logo_url) VALUES (?,?,?,?,?,?)`,
      args: [s.season, s.name, s.tier, s.url ?? null, s.ordering, s.logoUrl ?? null],
    });
  }
}

export async function deleteSponsor(id: number) {
  await db.execute({ sql: "DELETE FROM sponsors WHERE id = ?", args: [id] });
}

export type TeamInput = {
  season: number;
  name: string;
  short: string;
};

export async function upsertTeam(t: TeamInput, id?: number) {
  if (id != null) {
    await db.execute({
      sql: `UPDATE teams SET season=?, name=?, short=? WHERE id=?`,
      args: [t.season, t.name, t.short, id],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO teams (season, name, short) VALUES (?,?,?) ON CONFLICT(season, name) DO UPDATE SET short=excluded.short`,
      args: [t.season, t.name, t.short],
    });
  }
}

export async function deleteTeam(id: number) {
  await db.execute({ sql: "DELETE FROM teams WHERE id = ?", args: [id] });
}
