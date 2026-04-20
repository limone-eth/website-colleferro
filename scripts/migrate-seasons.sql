-- Seasons table
CREATE TABLE IF NOT EXISTS seasons (
  year INTEGER PRIMARY KEY,
  label TEXT NOT NULL,
  is_current INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO seasons (year, label, is_current) VALUES (2025, '2025/26', 1);

-- Teams per season
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season INTEGER NOT NULL REFERENCES seasons(year),
  name TEXT NOT NULL,
  short TEXT NOT NULL,
  UNIQUE(season, name)
);

CREATE INDEX IF NOT EXISTS idx_teams_season ON teams(season);

-- Add season to existing tables
ALTER TABLE matches ADD COLUMN season INTEGER NOT NULL DEFAULT 2025;
ALTER TABLE staff ADD COLUMN season INTEGER NOT NULL DEFAULT 2025;
ALTER TABLE sponsors ADD COLUMN season INTEGER NOT NULL DEFAULT 2025;

CREATE INDEX IF NOT EXISTS idx_matches_season ON matches(season);
CREATE INDEX IF NOT EXISTS idx_staff_season ON staff(season);
CREATE INDEX IF NOT EXISTS idx_sponsors_season ON sponsors(season);

-- Recreate squad with composite uniqueness (season, number)
CREATE TABLE squad_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season INTEGER NOT NULL,
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Portiere','Difensore','Centrocampista','Attaccante')),
  dob TEXT,
  nationality TEXT,
  UNIQUE(season, number)
);

INSERT INTO squad_new (season, number, name, role, dob, nationality)
  SELECT 2025, number, name, role, dob, nationality FROM squad;

DROP TABLE squad;
ALTER TABLE squad_new RENAME TO squad;

CREATE INDEX IF NOT EXISTS idx_squad_season ON squad(season);

-- Drop deprecated standings table (derived)
DROP TABLE IF EXISTS standings;

-- Seed teams for 2025 from existing matches
INSERT OR IGNORE INTO teams (season, name, short)
SELECT DISTINCT 2025, home_name,
  CASE home_name
    WHEN 'Colleferro' THEN 'CLF'
    WHEN 'Città di Anagni' THEN 'ANA'
    WHEN 'Arce' THEN 'ARC'
    WHEN 'Casal Barriera' THEN 'CAS'
    WHEN 'Ceccano' THEN 'CEC'
    WHEN 'Certosa' THEN 'CER'
    WHEN 'Città di Formia' THEN 'FOR'
    WHEN 'Ferentino' THEN 'FER'
    WHEN 'Gaeta' THEN 'GAE'
    WHEN 'Lodigiani' THEN 'LOD'
    WHEN 'Ottavia' THEN 'OTT'
    WHEN 'Paliano' THEN 'PAL'
    WHEN 'Roccasecca T.S.T.' THEN 'ROC'
    WHEN 'Sterparo' THEN 'STE'
    WHEN 'Terracina' THEN 'TER'
    WHEN 'Tivoli' THEN 'TIV'
    WHEN 'Vis Sezze' THEN 'VIS'
    ELSE UPPER(SUBSTR(home_name, 1, 3))
  END
FROM matches;
