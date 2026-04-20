CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  matchday TEXT NOT NULL,
  competition TEXT NOT NULL,
  date TEXT NOT NULL,
  date_long TEXT NOT NULL,
  time TEXT NOT NULL,
  home_name TEXT NOT NULL,
  home_short TEXT NOT NULL,
  away_name TEXT NOT NULL,
  away_short TEXT NOT NULL,
  venue TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming','live','finished')),
  score_home INTEGER,
  score_away INTEGER,
  ticket_url TEXT,
  kickoff_ts INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff_ts);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

CREATE TABLE IF NOT EXISTS standings (
  pos INTEGER PRIMARY KEY,
  team TEXT NOT NULL,
  played INTEGER NOT NULL,
  wins INTEGER NOT NULL,
  draws INTEGER NOT NULL,
  losses INTEGER NOT NULL,
  goals_for INTEGER NOT NULL,
  goals_against INTEGER NOT NULL,
  points INTEGER NOT NULL,
  highlight INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS news (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  date TEXT NOT NULL,
  date_iso TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_news_date ON news(date_iso DESC);

CREATE TABLE IF NOT EXISTS squad (
  number INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Portiere','Difensore','Centrocampista','Attaccante')),
  dob TEXT,
  nationality TEXT
);

CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  grp TEXT NOT NULL CHECK (grp IN ('Tecnico','Medico','Dirigenza')),
  ordering INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sponsors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('Main','Technical','Official','Local')),
  url TEXT,
  ordering INTEGER NOT NULL DEFAULT 0
);
