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

export const standings: StandingRow[] = [
  { pos: 1, team: "Cynthialbalonga", p: 25, w: 17, d: 5, l: 3, gf: 48, ga: 19, pts: 56 },
  { pos: 2, team: "Cassino", p: 25, w: 15, d: 6, l: 4, gf: 42, ga: 22, pts: 51 },
  { pos: 3, team: "Anzio", p: 25, w: 14, d: 5, l: 6, gf: 40, ga: 25, pts: 47 },
  { pos: 4, team: "Colleferro", p: 25, w: 13, d: 6, l: 6, gf: 36, ga: 24, pts: 45, highlight: true },
  { pos: 5, team: "Montespaccato", p: 25, w: 12, d: 7, l: 6, gf: 34, ga: 26, pts: 43 },
  { pos: 6, team: "Pomezia", p: 25, w: 11, d: 7, l: 7, gf: 32, ga: 27, pts: 40 },
  { pos: 7, team: "Aranova", p: 25, w: 11, d: 5, l: 9, gf: 30, ga: 30, pts: 38 },
  { pos: 8, team: "Valmontone", p: 25, w: 9, d: 8, l: 8, gf: 28, ga: 29, pts: 35 },
  { pos: 9, team: "Boreale", p: 25, w: 9, d: 5, l: 11, gf: 27, ga: 32, pts: 32 },
  { pos: 10, team: "Tivoli", p: 25, w: 8, d: 7, l: 10, gf: 25, ga: 31, pts: 31 },
  { pos: 11, team: "Atletico Lodigiani", p: 25, w: 7, d: 9, l: 9, gf: 24, ga: 30, pts: 30 },
  { pos: 12, team: "Rieti", p: 25, w: 7, d: 8, l: 10, gf: 22, ga: 31, pts: 29 },
  { pos: 13, team: "Campus Eur", p: 25, w: 7, d: 6, l: 12, gf: 25, ga: 34, pts: 27 },
  { pos: 14, team: "Unipomezia", p: 25, w: 6, d: 7, l: 12, gf: 20, ga: 33, pts: 25 },
  { pos: 15, team: "Audace", p: 25, w: 5, d: 8, l: 12, gf: 21, ga: 36, pts: 23 },
  { pos: 16, team: "Sabaudia", p: 25, w: 4, d: 6, l: 15, gf: 18, ga: 42, pts: 18 },
];
