import type { users } from "@healthcheck/db";
import type { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
