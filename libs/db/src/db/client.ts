import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { type Client, createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.ts";

/**
 * Returns the default path to the shared database file.
 * The database is stored in the data directory at the workspace root.
 */
export function getDefaultDbPath(): string {
  return resolve(import.meta.dirname, "../../../../data/healthcheck.db");
}

/**
 * Normalizes a database URL or filesystem path into a libSQL-compatible URL.
 * Existing libSQL/HTTP/file URLs pass through; bare paths get a `file:` prefix.
 */
export function toLibsqlUrl(databaseUrl?: string): string {
  const value = databaseUrl || getDefaultDbPath();
  if (/^(file|libsql|https?|wss?):/i.test(value)) {
    return value;
  }
  return `file:${value}`;
}

/**
 * Creates a raw libSQL client with standard pragmas applied.
 * @param databaseUrl - Path or URL to the SQLite/libSQL database.
 */
export function createSqliteClient(databaseUrl?: string): Client {
  const url = toLibsqlUrl(databaseUrl);

  if (url.startsWith("file:")) {
    const dbDir = dirname(url.slice("file:".length));
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }
  }

  try {
    const client = createClient({ url });
    void client.execute("PRAGMA journal_mode = WAL");
    void client.execute("PRAGMA synchronous = NORMAL");
    void client.execute("PRAGMA busy_timeout = 5000");
    return client;
  } catch (error) {
    if (url.startsWith("file:")) {
      const dbPath = url.slice("file:".length);
      const dbDir = dirname(dbPath);
      console.error(`❌ Failed to open database: ${dbPath}`);
      console.error(`Directory: ${dbDir}`);
      console.error(`Directory exists: ${existsSync(dbDir)}`);
    }
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

/**
 * Creates a Drizzle database connection backed by libSQL.
 * @param databaseUrl - Path or URL to the SQLite/libSQL database.
 */
export function createDb(databaseUrl?: string): DB {
  const client = createSqliteClient(databaseUrl);
  return drizzle(client, { schema });
}

export type DB = ReturnType<typeof createDb>;
