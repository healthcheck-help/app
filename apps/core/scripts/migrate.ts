import { resolve } from "node:path";
import { runAuthMigrations } from "@healthcheck/auth";
import { runMigrations } from "@healthcheck/db";

if (!import.meta.dirname) {
  throw new Error("migrate.ts must be run from a file URL");
}

const databaseUrl = Deno.env.get("DATABASE_URL") || undefined;
const migrationsPath =
  Deno.env.get("MIGRATIONS_PATH") ??
  resolve(import.meta.dirname, "./migrations");

console.log("Running database migrations...");

await runMigrations(databaseUrl, migrationsPath);
await runAuthMigrations({
  databaseUrl,
  baseURL: Deno.env.get("BETTER_AUTH_URL"),
  secret: Deno.env.get("BETTER_AUTH_SECRET"),
});

console.log("Migrations complete.");
