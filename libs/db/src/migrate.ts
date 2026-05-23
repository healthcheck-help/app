import { resolve } from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createDb, type DB } from "./db/client.ts";

/**
 * Run database migrations.
 * @param dbOrUrl - Either a database instance or path/URL to the SQLite database.
 * @param migrationsPath - Path to the migrations folder. Defaults to the migrations in @healthcheck/db.
 */
export async function runMigrations(
  dbOrUrl?: DB | string,
  migrationsPath?: string,
): Promise<void> {
  const db =
    typeof dbOrUrl === "string" || dbOrUrl === undefined
      ? createDb(dbOrUrl)
      : dbOrUrl;

  // Default migrations folder path relative to this file
  const migrationsFolder =
    migrationsPath || resolve(import.meta.dirname, "./db/migrations");

  console.log(`Running migrations from ${migrationsFolder}...`);
  await migrate(db, { migrationsFolder });
  console.log("✓ Migrations completed successfully");
}

// Allow running directly: deno run --allow-all src/migrate.ts
if (import.meta.main) {
  await runMigrations(Deno.env.get("DATABASE_URL") || undefined);
}
