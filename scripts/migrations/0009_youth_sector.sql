-- Settore giovanile: categorie, organigramma, classifica manuale per categoria.
-- Le partite e lo staff continuano a vivere nelle tabelle esistenti `matches` e
-- `staff` ma vengono "scoped" a una categoria tramite `youth_category_id` (NULL
-- = prima squadra, comportamento esistente preservato). Lo staff che fa parte
-- dell'organigramma di settore (responsabile, coordinatore, segretario, ...)
-- non è legato a una singola categoria: viene marcato con `is_youth_management`.

-- Categorie del settore giovanile (per stagione)
CREATE TABLE IF NOT EXISTS youth_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season INTEGER NOT NULL REFERENCES seasons(year),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  ordering INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(season, slug)
);

CREATE INDEX IF NOT EXISTS idx_youth_categories_season ON youth_categories(season);

-- Classifica manuale per categoria (l'admin la inserisce a mano)
CREATE TABLE IF NOT EXISTS youth_standings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  youth_category_id INTEGER NOT NULL REFERENCES youth_categories(id) ON DELETE CASCADE,
  pos INTEGER NOT NULL,
  team TEXT NOT NULL,
  played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  highlight INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_youth_standings_category ON youth_standings(youth_category_id, pos);

-- Estendi staff e matches
ALTER TABLE staff ADD COLUMN youth_category_id INTEGER REFERENCES youth_categories(id);
ALTER TABLE staff ADD COLUMN is_youth_management INTEGER NOT NULL DEFAULT 0;
ALTER TABLE matches ADD COLUMN youth_category_id INTEGER REFERENCES youth_categories(id);

CREATE INDEX IF NOT EXISTS idx_staff_youth_category ON staff(youth_category_id);
CREATE INDEX IF NOT EXISTS idx_staff_youth_mgmt ON staff(is_youth_management);
CREATE INDEX IF NOT EXISTS idx_matches_youth_category ON matches(youth_category_id);
