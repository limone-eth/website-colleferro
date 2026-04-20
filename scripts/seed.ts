import "dotenv/config";
import { createClient } from "@libsql/client";
import { matches } from "../src/data/matches";
import { standings } from "../src/data/standings";
import { news } from "../src/data/news";
import { squad } from "../src/data/squad";
import { staff } from "../src/data/staff";
import { sponsors } from "../src/data/sponsors";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) throw new Error("TURSO_DATABASE_URL missing");

const db = createClient({ url, authToken });

const ITALIAN_MONTHS: Record<string, number> = {
  gennaio: 0, febbraio: 1, marzo: 2, aprile: 3, maggio: 4, giugno: 5,
  luglio: 6, agosto: 7, settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
};

function parseKickoff(dateLong: string, time: string): number {
  // "Domenica 8 Settembre 2025" + "15:30"
  const m = dateLong.match(/(\d{1,2})\s+(\S+)\s+(\d{4})/i);
  if (!m) throw new Error(`Cannot parse dateLong: ${dateLong}`);
  const day = Number(m[1]);
  const month = ITALIAN_MONTHS[m[2].toLowerCase()];
  const year = Number(m[3]);
  if (month === undefined) throw new Error(`Unknown month: ${m[2]}`);
  const [hh, mm] = time.split(":").map(Number);
  return Math.floor(Date.UTC(year, month, day, hh - 2, mm) / 1000);
}

async function run() {
  console.log("Clearing existing rows...");
  await db.batch(
    [
      "DELETE FROM matches",
      "DELETE FROM standings",
      "DELETE FROM news",
      "DELETE FROM squad",
      "DELETE FROM staff",
      "DELETE FROM sponsors",
    ],
    "write",
  );

  console.log(`Seeding ${matches.length} matches...`);
  for (const m of matches) {
    await db.execute({
      sql: `INSERT INTO matches (id, matchday, competition, date, date_long, time, home_name, home_short, away_name, away_short, venue, status, score_home, score_away, ticket_url, kickoff_ts) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        m.id, m.matchday, m.competition, m.date, m.dateLong, m.time,
        m.home.name, m.home.short, m.away.name, m.away.short,
        m.venue, m.status,
        m.score?.home ?? null, m.score?.away ?? null,
        m.ticketUrl ?? null,
        parseKickoff(m.dateLong, m.time),
      ],
    });
  }

  console.log(`Seeding ${standings.length} standings rows...`);
  for (const s of standings) {
    await db.execute({
      sql: `INSERT INTO standings (pos, team, played, wins, draws, losses, goals_for, goals_against, points, highlight) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      args: [s.pos, s.team, s.p, s.w, s.d, s.l, s.gf, s.ga, s.pts, s.highlight ? 1 : 0],
    });
  }

  console.log(`Seeding ${news.length} news posts...`);
  for (const n of news) {
    await db.execute({
      sql: `INSERT INTO news (slug, title, excerpt, date, date_iso, category, author, body, featured) VALUES (?,?,?,?,?,?,?,?,?)`,
      args: [
        n.slug, n.title, n.excerpt, n.date, n.dateIso, n.category, n.author,
        JSON.stringify(n.body), n.featured ? 1 : 0,
      ],
    });
  }

  console.log(`Seeding ${squad.length} players...`);
  for (const p of squad) {
    await db.execute({
      sql: `INSERT INTO squad (number, name, role, dob, nationality) VALUES (?,?,?,?,?)`,
      args: [p.number, p.name, p.role, p.dob ?? null, p.nationality ?? null],
    });
  }

  console.log(`Seeding ${staff.length} staff members...`);
  for (let i = 0; i < staff.length; i++) {
    const s = staff[i];
    await db.execute({
      sql: `INSERT INTO staff (name, role, grp, ordering) VALUES (?,?,?,?)`,
      args: [s.name, s.role, s.group, i],
    });
  }

  console.log(`Seeding ${sponsors.length} sponsors...`);
  for (let i = 0; i < sponsors.length; i++) {
    const s = sponsors[i];
    await db.execute({
      sql: `INSERT INTO sponsors (name, tier, url, ordering) VALUES (?,?,?,?)`,
      args: [s.name, s.tier, s.url ?? null, i],
    });
  }

  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
