import { db } from "./db";

export async function getSetting(key: string): Promise<string | null> {
  const { rows } = await db.execute({
    sql: "SELECT value FROM settings WHERE key = ? LIMIT 1",
    args: [key],
  });
  const r = rows[0];
  return r ? (r.value as string) : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.execute({
    sql: `INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()`,
    args: [key, value],
  });
}

const MAINTENANCE_KEY = "maintenance_mode";

export async function isMaintenanceMode(): Promise<boolean> {
  const v = await getSetting(MAINTENANCE_KEY);
  return v === "1";
}

export async function setMaintenanceMode(enabled: boolean): Promise<void> {
  await setSetting(MAINTENANCE_KEY, enabled ? "1" : "0");
}
