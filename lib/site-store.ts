import { env } from "cloudflare:workers";
import { DEFAULT_SITE, sanitizeSiteData, type SiteData } from "./site-content";

type SiteRow = { content: string; version: number; updated_at: string };

let schemaReady: Promise<void> | null = null;

function getD1(): D1Database {
  const runtime = env as unknown as { DB?: D1Database };
  if (!runtime.DB) throw new Error("D1 binding DB is unavailable");
  return runtime.DB;
}

export async function ensureSiteSchema() {
  if (!schemaReady) {
    const db = getD1();
    schemaReady = db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS site_state (
        id INTEGER PRIMARY KEY NOT NULL DEFAULT 1,
        content TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS site_owners (
        user_id TEXT PRIMARY KEY NOT NULL,
        email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
    ]).then(() => undefined).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

export async function readSite(): Promise<{ data: SiteData; version: number; updatedAt: string }> {
  await ensureSiteSchema();
  const row = await getD1().prepare("SELECT content, version, updated_at FROM site_state WHERE id = 1").first<SiteRow>();
  if (!row) return { data: DEFAULT_SITE, version: 0, updatedAt: "" };
  try {
    return { data: sanitizeSiteData(JSON.parse(row.content)), version: row.version, updatedAt: row.updated_at };
  } catch {
    return { data: DEFAULT_SITE, version: row.version, updatedAt: row.updated_at };
  }
}

export async function writeSite(value: unknown) {
  const data = sanitizeSiteData(value);
  const row = await getD1().prepare(`INSERT INTO site_state (id, content, version, updated_at)
    VALUES (1, ?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      content = excluded.content,
      version = site_state.version + 1,
      updated_at = CURRENT_TIMESTAMP
    RETURNING version, updated_at`).bind(JSON.stringify(data)).first<{ version: number; updated_at: string }>();
  return { data, version: row?.version ?? 1, updatedAt: row?.updated_at ?? "" };
}
