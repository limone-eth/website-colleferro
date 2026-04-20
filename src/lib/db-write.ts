import { db } from "./db";

const ITALIAN_MONTHS: Record<string, number> = {
  gennaio: 0, febbraio: 1, marzo: 2, aprile: 3, maggio: 4, giugno: 5,
  luglio: 6, agosto: 7, settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
};

export function parseKickoff(dateLong: string, time: string): number {
  const m = dateLong.match(/(\d{1,2})\s+(\S+)\s+(\d{4})/i);
  if (!m) throw new Error(`Formato data non valido: "${dateLong}" (atteso: "Domenica 8 Settembre 2025")`);
  const day = Number(m[1]);
  const month = ITALIAN_MONTHS[m[2].toLowerCase()];
  const year = Number(m[3]);
  if (month === undefined) throw new Error(`Mese sconosciuto: ${m[2]}`);
  const [hh, mm] = time.split(":").map(Number);
  return Math.floor(Date.UTC(year, month, day, hh - 2, mm) / 1000);
}

export type MatchInput = {
  id: string;
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
  ticketUrl?: string | null;
};

export async function upsertMatch(m: MatchInput, existingId?: string) {
  const kickoff = parseKickoff(m.dateLong, m.time);
  if (existingId) {
    await db.execute({
      sql: `UPDATE matches SET id=?, matchday=?, competition=?, date=?, date_long=?, time=?, home_name=?, home_short=?, away_name=?, away_short=?, venue=?, status=?, score_home=?, score_away=?, ticket_url=?, kickoff_ts=?, updated_at=unixepoch() WHERE id=?`,
      args: [
        m.id, m.matchday, m.competition, m.date, m.dateLong, m.time,
        m.homeName, m.homeShort, m.awayName, m.awayShort,
        m.venue, m.status,
        m.scoreHome ?? null, m.scoreAway ?? null,
        m.ticketUrl ?? null, kickoff,
        existingId,
      ],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO matches (id, matchday, competition, date, date_long, time, home_name, home_short, away_name, away_short, venue, status, score_home, score_away, ticket_url, kickoff_ts) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        m.id, m.matchday, m.competition, m.date, m.dateLong, m.time,
        m.homeName, m.homeShort, m.awayName, m.awayShort,
        m.venue, m.status,
        m.scoreHome ?? null, m.scoreAway ?? null,
        m.ticketUrl ?? null, kickoff,
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
  number: number;
  name: string;
  role: "Portiere" | "Difensore" | "Centrocampista" | "Attaccante";
  dob?: string | null;
  nationality?: string | null;
};

export async function upsertPlayer(p: PlayerInput, existingNumber?: number) {
  if (existingNumber != null) {
    await db.execute({
      sql: `UPDATE squad SET number=?, name=?, role=?, dob=?, nationality=? WHERE number=?`,
      args: [p.number, p.name, p.role, p.dob ?? null, p.nationality ?? null, existingNumber],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO squad (number, name, role, dob, nationality) VALUES (?,?,?,?,?)`,
      args: [p.number, p.name, p.role, p.dob ?? null, p.nationality ?? null],
    });
  }
}

export async function deletePlayer(number: number) {
  await db.execute({ sql: "DELETE FROM squad WHERE number = ?", args: [number] });
}

export type StaffInput = {
  name: string;
  role: string;
  group: "Tecnico" | "Medico" | "Dirigenza";
  ordering: number;
};

export async function upsertStaff(s: StaffInput, id?: number) {
  if (id != null) {
    await db.execute({
      sql: `UPDATE staff SET name=?, role=?, grp=?, ordering=? WHERE id=?`,
      args: [s.name, s.role, s.group, s.ordering, id],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO staff (name, role, grp, ordering) VALUES (?,?,?,?)`,
      args: [s.name, s.role, s.group, s.ordering],
    });
  }
}

export async function deleteStaff(id: number) {
  await db.execute({ sql: "DELETE FROM staff WHERE id = ?", args: [id] });
}

export type SponsorInput = {
  name: string;
  tier: "Main" | "Technical" | "Official" | "Local";
  url?: string | null;
  ordering: number;
};

export async function upsertSponsor(s: SponsorInput, id?: number) {
  if (id != null) {
    await db.execute({
      sql: `UPDATE sponsors SET name=?, tier=?, url=?, ordering=? WHERE id=?`,
      args: [s.name, s.tier, s.url ?? null, s.ordering, id],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO sponsors (name, tier, url, ordering) VALUES (?,?,?,?)`,
      args: [s.name, s.tier, s.url ?? null, s.ordering],
    });
  }
}

export async function deleteSponsor(id: number) {
  await db.execute({ sql: "DELETE FROM sponsors WHERE id = ?", args: [id] });
}
