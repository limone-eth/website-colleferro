import "dotenv/config";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) throw new Error("TURSO_DATABASE_URL missing");
const db = createClient({ url, authToken });

// Fonte: Wikipedia it, "Eccellenza Lazio 2025-2026" (CC BY-SA 4.0)
// https://it.wikipedia.org/wiki/Eccellenza_Lazio_2025-2026
// Aggiornata all'8 aprile 2026 (come da Wikipedia).

const standings = [
  { pos: 1,  team: "Città di Anagni",    pts: 63, g: 29, v: 19, n: 6,  p: 4,  gf: 54, gs: 17, highlight: false },
  { pos: 2,  team: "Certosa",             pts: 59, g: 29, v: 17, n: 8,  p: 4,  gf: 45, gs: 23, highlight: false },
  { pos: 3,  team: "Tivoli",              pts: 57, g: 30, v: 16, n: 9,  p: 5,  gf: 54, gs: 33, highlight: false },
  { pos: 4,  team: "Arce",                pts: 55, g: 29, v: 16, n: 7,  p: 6,  gf: 41, gs: 18, highlight: false },
  { pos: 5,  team: "Lodigiani",           pts: 46, g: 29, v: 11, n: 13, p: 5,  gf: 42, gs: 36, highlight: false },
  { pos: 6,  team: "Città di Formia",     pts: 45, g: 29, v: 12, n: 9,  p: 8,  gf: 43, gs: 30, highlight: false },
  { pos: 7,  team: "Vis Sezze",           pts: 42, g: 29, v: 9,  n: 15, p: 5,  gf: 26, gs: 23, highlight: false },
  { pos: 8,  team: "Ferentino",           pts: 40, g: 30, v: 9,  n: 13, p: 8,  gf: 32, gs: 34, highlight: false },
  { pos: 9,  team: "Terracina",           pts: 36, g: 29, v: 10, n: 6,  p: 13, gf: 36, gs: 43, highlight: false },
  { pos: 10, team: "Sterparo",            pts: 35, g: 29, v: 9,  n: 8,  p: 12, gf: 35, gs: 43, highlight: false },
  { pos: 11, team: "Ceccano",             pts: 29, g: 29, v: 7,  n: 8,  p: 14, gf: 28, gs: 34, highlight: false },
  { pos: 12, team: "Colleferro",          pts: 29, g: 29, v: 6,  n: 11, p: 12, gf: 27, gs: 40, highlight: true  },
  { pos: 13, team: "Ottavia",             pts: 29, g: 29, v: 7,  n: 8,  p: 14, gf: 33, gs: 47, highlight: false },
  { pos: 14, team: "Gaeta",               pts: 28, g: 29, v: 4,  n: 16, p: 9,  gf: 18, gs: 25, highlight: false },
  { pos: 15, team: "Casal Barriera",      pts: 27, g: 29, v: 5,  n: 12, p: 12, gf: 25, gs: 40, highlight: false },
  { pos: 16, team: "Roccasecca T.S.T.",   pts: 23, g: 29, v: 5,  n: 8,  p: 16, gf: 37, gs: 56, highlight: false },
  { pos: 17, team: "Paliano",             pts: 18, g: 30, v: 3,  n: 9,  p: 18, gf: 25, gs: 60, highlight: false },
];

// Sigla 3 lettere per le card partita
const SHORT: Record<string, string> = {
  "Città di Anagni": "ANA",
  "Arce": "ARC",
  "Casal Barriera": "CAS",
  "Ceccano": "CEC",
  "Certosa": "CER",
  "Città di Formia": "FOR",
  "Colleferro": "CLF",
  "Ferentino": "FER",
  "Gaeta": "GAE",
  "Lodigiani": "LOD",
  "Ottavia": "OTT",
  "Paliano": "PAL",
  "Roccasecca T.S.T.": "ROC",
  "Sterparo": "STE",
  "Terracina": "TER",
  "Tivoli": "TIV",
  "Vis Sezze": "VIS",
};

// Risultati Colleferro, ricavati dal "Tabellone" di Wikipedia.
// NOTE: date e giornata sono APPROSSIMATE — Wikipedia fornisce solo il punteggio,
// non la data precisa della partita. Sono distribuite in modo uniforme nella
// stagione come placeholder. Da verificare/aggiornare dall'admin.
type WikiMatch = { home: string; away: string; homeGoals: number; awayGoals: number };

const colleferroMatches: WikiMatch[] = [
  // Home matches
  { home: "Colleferro", away: "Città di Anagni",   homeGoals: 1, awayGoals: 1 },
  { home: "Colleferro", away: "Arce",              homeGoals: 1, awayGoals: 1 },
  { home: "Colleferro", away: "Casal Barriera",    homeGoals: 1, awayGoals: 0 },
  { home: "Colleferro", away: "Ceccano",           homeGoals: 0, awayGoals: 3 },
  { home: "Colleferro", away: "Certosa",           homeGoals: 3, awayGoals: 4 },
  { home: "Colleferro", away: "Città di Formia",   homeGoals: 1, awayGoals: 3 },
  { home: "Colleferro", away: "Ferentino",         homeGoals: 1, awayGoals: 1 },
  { home: "Colleferro", away: "Gaeta",             homeGoals: 1, awayGoals: 0 },
  { home: "Colleferro", away: "Ottavia",           homeGoals: 2, awayGoals: 2 },
  { home: "Colleferro", away: "Paliano",           homeGoals: 3, awayGoals: 0 },
  { home: "Colleferro", away: "Roccasecca T.S.T.", homeGoals: 2, awayGoals: 1 },
  { home: "Colleferro", away: "Sterparo",          homeGoals: 0, awayGoals: 2 },
  { home: "Colleferro", away: "Terracina",         homeGoals: 1, awayGoals: 2 },
  { home: "Colleferro", away: "Tivoli",            homeGoals: 1, awayGoals: 1 },
  { home: "Colleferro", away: "Vis Sezze",         homeGoals: 1, awayGoals: 1 },
  // Away matches
  { home: "Città di Anagni",   away: "Colleferro", homeGoals: 4, awayGoals: 0 },
  { home: "Arce",              away: "Colleferro", homeGoals: 2, awayGoals: 1 },
  { home: "Ceccano",           away: "Colleferro", homeGoals: 1, awayGoals: 1 },
  { home: "Città di Formia",   away: "Colleferro", homeGoals: 4, awayGoals: 2 },
  { home: "Ferentino",         away: "Colleferro", homeGoals: 0, awayGoals: 0 },
  { home: "Gaeta",             away: "Colleferro", homeGoals: 0, awayGoals: 1 },
  { home: "Lodigiani",         away: "Colleferro", homeGoals: 2, awayGoals: 0 },
  { home: "Ottavia",           away: "Colleferro", homeGoals: 1, awayGoals: 1 },
  { home: "Paliano",           away: "Colleferro", homeGoals: 0, awayGoals: 0 },
  { home: "Roccasecca T.S.T.", away: "Colleferro", homeGoals: 2, awayGoals: 2 },
  { home: "Sterparo",          away: "Colleferro", homeGoals: 1, awayGoals: 0 },
  { home: "Terracina",         away: "Colleferro", homeGoals: 0, awayGoals: 1 },
  { home: "Tivoli",            away: "Colleferro", homeGoals: 1, awayGoals: 0 },
  { home: "Vis Sezze",         away: "Colleferro", homeGoals: 1, awayGoals: 0 },
];

const ITALIAN_MONTHS = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const SHORT_MONTHS = ["GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO","SET","OTT","NOV","DIC"];
const WEEKDAYS = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];

function formatMatchDates(d: Date) {
  return {
    date: `${String(d.getUTCDate()).padStart(2,"0")} ${SHORT_MONTHS[d.getUTCMonth()]}`,
    dateLong: `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${ITALIAN_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
    time: "15:00",
    kickoffTs: Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 13, 0) / 1000),
  };
}

async function run() {
  console.log("Clearing matches + standings...");
  await db.batch(["DELETE FROM matches", "DELETE FROM standings"], "write");

  console.log(`Inserting ${standings.length} standings rows...`);
  for (const s of standings) {
    await db.execute({
      sql: "INSERT INTO standings (pos, team, played, wins, draws, losses, goals_for, goals_against, points, highlight) VALUES (?,?,?,?,?,?,?,?,?,?)",
      args: [s.pos, s.team, s.g, s.v, s.n, s.p, s.gf, s.gs, s.pts, s.highlight ? 1 : 0],
    });
  }

  console.log(`Inserting ${colleferroMatches.length} matches (placeholder dates)...`);
  // Start 2025-09-07 (first Sunday), one per week
  const start = new Date(Date.UTC(2025, 8, 7));
  for (let i = 0; i < colleferroMatches.length; i++) {
    const m = colleferroMatches[i];
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i * 7);
    const { date, dateLong, time, kickoffTs } = formatMatchDates(d);
    const id = `m-${String(i + 1).padStart(2, "0")}`;
    const venue = m.home === "Colleferro" ? 'Stadio Comunale "Andrea Caslini"' : `Stadio ${m.home}`;
    await db.execute({
      sql: `INSERT INTO matches (id, matchday, competition, date, date_long, time, home_name, home_short, away_name, away_short, venue, status, score_home, score_away, kickoff_ts) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        id,
        `${i + 1}ª Giornata (*)`,
        "Eccellenza Lazio — Girone B",
        date, dateLong, time,
        m.home, SHORT[m.home] ?? m.home.slice(0, 3).toUpperCase(),
        m.away, SHORT[m.away] ?? m.away.slice(0, 3).toUpperCase(),
        venue,
        "finished",
        m.homeGoals, m.awayGoals,
        kickoffTs,
      ],
    });
  }

  console.log("Done.");
  console.log("\nNOTE: date e ordine giornate sono placeholder — da verificare via /admin.");
}

run().catch((e) => { console.error(e); process.exit(1); });
