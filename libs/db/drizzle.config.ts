import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";

// Use a centralized database path at the workspace root
const here = dirname(fileURLToPath(import.meta.url));
const defaultDbPath = resolve(here, "../../data/healthcheck.db");

const rawUrl = process.env.DATABASE_URL || defaultDbPath;
const url = /^(file|libsql|https?|wss?):/i.test(rawUrl)
  ? rawUrl
  : `file:${rawUrl}`;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "turso",
  dbCredentials: {
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
