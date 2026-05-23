import { createDb } from "@healthcheck/db";
import { env } from "$env/dynamic/private";

// Uses the centralized shared database from libs/db
// DATABASE_URL can override the default path if needed
export const db = createDb(env.DATABASE_URL || undefined);
