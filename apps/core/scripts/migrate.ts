import { resolve } from "node:path";
import { runAuthMigrations } from "@healthcheck/auth";
import { runMigrations } from "@healthcheck/db";

const databaseUrl = Deno.env.get("DATABASE_URL") || undefined;
const migrationsPath =
  Deno.env.get("NODE_ENV") === "production"
    ? resolve(process.cwd(), "./migrations")
    : undefined;

console.log("Running database migrations...");

await runMigrations(databaseUrl, migrationsPath);
await runAuthMigrations({
  databaseUrl,
  baseURL: Deno.env.get("BETTER_AUTH_URL"),
  secret: Deno.env.get("BETTER_AUTH_SECRET"),
});

console.log("Migrations complete.");
