import "dotenv/config";
import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { shortFor } from "../src/lib/match-utils";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) throw new Error("TURSO_DATABASE_URL missing");
const db = createClient({ url, authToken });

type Raw = { home: string; away: string; hg: number; ag: number };
const raw: Raw[] = JSON.parse(readFileSync("/tmp/all_matches.json", "utf8"));

// Placeholder weekly dates starting 2025-09-07 (first Sunday), cycle through 30 matchdays
const seasonStart = Date.UTC(2025, 8, 7);
function dateFor(i: number) {
  const ts = seasonStart + i * 7 * 86400 * 1000;
  const d = new Date(ts);
  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  const year = d.getUTCFullYear();
  const SHORT = ["GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO","SET","OTT","NOV","DIC"];
  const LONG = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
  const WD = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
  return {
    date: `${String(day).padStart(2,"0")} ${SHORT[month-1]}`,
    dateLong: `${WD[d.getUTCDay()]} ${day} ${LONG[month-1]} ${year}`,
    time: "15:00",
    kickoffTs: Math.floor(Date.UTC(year, month-1, day, 13, 0) / 1000),
  };
}

async function run() {
  console.log("Clearing matches + standings tables...");
  await db.batch(["DELETE FROM matches", "DELETE FROM standings"], "write");

  console.log(`Inserting ${raw.length} matches...`);
  // Group by matchday approximately: 8 matches per matchday (17 teams → 8 games with 1 bye each Sunday)
  // But this is a rough approximation; matchday label left as "—" since we don't know the real scheduling.
  for (let i = 0; i < raw.length; i++) {
    const m = raw[i];
    const weekIndex = Math.floor(i / 8);
    const d = dateFor(weekIndex);
    const id = `m-${String(i + 1).padStart(3, "0")}`;
    const venue = m.home === "Colleferro" ? 'Stadio Comunale "Andrea Caslini"' : `Stadio ${m.home}`;
    await db.execute({
      sql: `INSERT INTO matches (id, matchday, competition, date, date_long, time, home_name, home_short, away_name, away_short, venue, status, score_home, score_away, ticket_url, kickoff_ts) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        id, "—", "Eccellenza Lazio — Girone B",
        d.date, d.dateLong, d.time,
        m.home, shortFor(m.home),
        m.away, shortFor(m.away),
        venue, "finished",
        m.hg, m.ag, null, d.kickoffTs,
      ],
    });
  }
  console.log("Done. Standings will now be derived from matches.");
}

run().catch((e) => { console.error(e); process.exit(1); });
