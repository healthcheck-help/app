import { runAuthMigrations } from "@healthcheck/auth";
import { runMigrations } from "@healthcheck/db";

const databaseUrl = Deno.env.get("DATABASE_URL") || undefined;
const migrationsPath = Deno.env.get("MIGRATIONS_PATH") || undefined;

await runMigrations(databaseUrl, migrationsPath);
await runAuthMigrations({
  databaseUrl,
  baseURL: Deno.env.get("BETTER_AUTH_URL"),
  secret: Deno.env.get("BETTER_AUTH_SECRET"),
});

console.log("Migrations complete.");
