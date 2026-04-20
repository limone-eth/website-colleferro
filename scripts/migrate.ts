import "dotenv/config";
import { createClient } from "@libsql/client";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
if (!url) {
  console.error("✗ TURSO_DATABASE_URL is not set.");
  process.exit(1);
}

const db = createClient({ url, authToken });
const MIGRATIONS_DIR = new URL("./migrations/", import.meta.url);
const migrationsPath = MIGRATIONS_DIR.pathname;

async function ensureLog() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
}

async function appliedSet(): Promise<Set<string>> {
  const { rows } = await db.execute("SELECT name FROM schema_migrations");
  return new Set(rows.map((r) => r.name as string));
}

function listMigrationFiles(): string[] {
  return readdirSync(migrationsPath)
    .filter((f) => /^\d{4}_.*\.sql$/.test(f))
    .sort();
}

function splitSqlStatements(sql: string): string[] {
  // Naive splitter: remove block comments, line comments, split on semicolons
  const stripped = sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--[^\n]*\n/g, "\n");
  return stripped
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function applyMigration(name: string) {
  const full = join(migrationsPath, name);
  const sql = readFileSync(full, "utf8");
  const statements = splitSqlStatements(sql);
  console.log(`→ Applying ${name} (${statements.length} statements)`);
  for (const stmt of statements) {
    try {
      await db.execute(stmt);
    } catch (e) {
      const msg = (e as Error).message;
      // Tolerate "duplicate column" and "already exists" when a migration was
      // partially applied before being tracked.
      if (/duplicate column name|already exists/i.test(msg)) {
        console.log(`  · skip (already present): ${stmt.slice(0, 60).replace(/\n/g, " ")}…`);
        continue;
      }
      console.error(`  ✗ Failed on: ${stmt.slice(0, 200)}`);
      throw e;
    }
  }
  await db.execute({
    sql: "INSERT INTO schema_migrations (name) VALUES (?)",
    args: [name],
  });
  console.log(`  ✓ ${name} done`);
}

async function run() {
  await ensureLog();
  const applied = await appliedSet();
  const all = listMigrationFiles();
  const pending = all.filter((f) => !applied.has(f));

  console.log(`Found ${all.length} migration file(s), ${pending.length} pending.`);

  if (pending.length === 0) {
    console.log("✓ Database is up to date.");
    return;
  }

  for (const name of pending) {
    await applyMigration(name);
  }

  console.log(`✓ Applied ${pending.length} migration(s).`);
}

run().catch((e) => {
  console.error("✗ Migration failed:", (e as Error).message);
  process.exit(1);
});
