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
  status: "upcoming" | "finished" | "live";
  score?: { home: number; away: number };
  ticketUrl?: string;
};

export const matches: Match[] = [
  {
    id: "m-01",
    matchday: "1ª Giornata",
    competition: "Eccellenza Lazio — Girone B",
    date: "08 SET",
    dateLong: "Domenica 8 Settembre 2025",
    time: "15:30",
    home: { name: "Colleferro", short: "CLF" },
    away: { name: "Anzio", short: "ANZ" },
    venue: 'Stadio Comunale "Caslini"',
    status: "finished",
    score: { home: 2, away: 0 },
  },
  {
    id: "m-02",
    matchday: "2ª Giornata",
    competition: "Eccellenza Lazio — Girone B",
    date: "15 SET",
    dateLong: "Domenica 15 Settembre 2025",
    time: "15:30",
    home: { name: "Pomezia", short: "POM" },
    away: { name: "Colleferro", short: "CLF" },
    venue: "Stadio Comunale Pomezia",
    status: "finished",
    score: { home: 1, away: 1 },
  },
  {
    id: "m-03",
    matchday: "3ª Giornata",
    competition: "Eccellenza Lazio — Girone B",
    date: "22 SET",
    dateLong: "Domenica 22 Settembre 2025",
    time: "15:30",
    home: { name: "Colleferro", short: "CLF" },
    away: { name: "Valmontone", short: "VAL" },
    venue: 'Stadio Comunale "Caslini"',
    status: "finished",
    score: { home: 3, away: 1 },
  },
  {
    id: "m-04",
    matchday: "25ª Giornata",
    competition: "Eccellenza Lazio — Girone B",
    date: "13 APR",
    dateLong: "Domenica 13 Aprile 2026",
    time: "15:00",
    home: { name: "Colleferro", short: "CLF" },
    away: { name: "Aranova", short: "ARN" },
    venue: 'Stadio Comunale "Caslini"',
    status: "finished",
    score: { home: 1, away: 0 },
  },
  {
    id: "m-05",
    matchday: "26ª Giornata",
    competition: "Eccellenza Lazio — Girone B",
    date: "26 APR",
    dateLong: "Domenica 26 Aprile 2026",
    time: "15:00",
    home: { name: "Colleferro", short: "CLF" },
    away: { name: "Montespaccato", short: "MNT" },
    venue: 'Stadio Comunale "Caslini"',
    status: "upcoming",
    ticketUrl: "/biglietteria",
  },
  {
    id: "m-06",
    matchday: "27ª Giornata",
    competition: "Eccellenza Lazio — Girone B",
    date: "03 MAG",
    dateLong: "Domenica 3 Maggio 2026",
    time: "15:00",
    home: { name: "Cassino", short: "CSS" },
    away: { name: "Colleferro", short: "CLF" },
    venue: 'Stadio "Gino Salveti"',
    status: "upcoming",
  },
  {
    id: "m-07",
    matchday: "28ª Giornata",
    competition: "Eccellenza Lazio — Girone B",
    date: "10 MAG",
    dateLong: "Domenica 10 Maggio 2026",
    time: "15:00",
    home: { name: "Colleferro", short: "CLF" },
    away: { name: "Cynthialbalonga", short: "CYN" },
    venue: 'Stadio Comunale "Caslini"',
    status: "upcoming",
    ticketUrl: "/biglietteria",
  },
];

export const nextMatch = matches.find((m) => m.status === "upcoming")!;
export const lastResults = matches
  .filter((m) => m.status === "finished")
  .slice(-3)
  .reverse();
