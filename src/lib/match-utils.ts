export const TEAM_SHORT: Record<string, string> = {
  "Colleferro": "CLF",
  "Città di Anagni": "ANA",
  "Arce": "ARC",
  "Casal Barriera": "CAS",
  "Ceccano": "CEC",
  "Certosa": "CER",
  "Città di Formia": "FOR",
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

export function shortFor(name: string): string {
  return TEAM_SHORT[name] ?? name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
}

const WEEKDAYS = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const ITALIAN_MONTHS = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
const SHORT_MONTHS = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];

export type DateFields = {
  date: string;        // "26 APR"
  dateLong: string;    // "Domenica 26 Aprile 2026"
  time: string;        // "15:00"
  kickoffTs: number;   // unix seconds (assumes Europe/Rome ≈ UTC+2 DST-agnostic for simplicity)
};

export function dateFieldsFromInput(ymd: string, hm: string): DateFields {
  const [y, m, d] = ymd.split("-").map(Number);
  const [hh, mm] = hm.split(":").map(Number);
  const date = `${String(d).padStart(2, "0")} ${SHORT_MONTHS[m - 1]}`;
  const jsDate = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const weekday = WEEKDAYS[jsDate.getUTCDay()];
  const dateLong = `${weekday} ${d} ${ITALIAN_MONTHS[m - 1]} ${y}`;
  const time = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  // Rough Rome offset: CEST (UTC+2) Mar-Oct, CET (UTC+1) Nov-Feb
  const offsetHours = m >= 4 && m <= 9 ? 2 : (m === 3 || m === 10 ? 2 : 1);
  const kickoffTs = Math.floor(Date.UTC(y, m - 1, d, hh - offsetHours, mm) / 1000);
  return { date, dateLong, time, kickoffTs };
}

export function matchdayLabel(n: number): string {
  return `${n}ª Giornata`;
}

export function parseMatchdayNumber(label: string): number | null {
  const m = label.match(/^(\d+)/);
  return m ? Number(m[1]) : null;
}

const SHORT_MONTHS_TITLE = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

// "2026-04-14" -> "14 Apr 2026"
export function newsDateFromIso(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${SHORT_MONTHS_TITLE[m - 1]} ${y}`;
}

// ISO "YYYY-MM-DD" from kickoff_ts (UTC) — for <input type="date"> pre-fill
export function ymdFromKickoff(ts: number): string {
  const d = new Date(ts * 1000);
  // Use Rome time for display. Add back the offset we subtracted.
  const month = d.getUTCMonth() + 1;
  const offsetHours = month >= 4 && month <= 10 ? 2 : 1;
  const local = new Date((ts + offsetHours * 3600) * 1000);
  const y = local.getUTCFullYear();
  const m = String(local.getUTCMonth() + 1).padStart(2, "0");
  const day = String(local.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
