import { createSqliteClient } from "@healthcheck/db";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import {
  type BetterAuthOptions,
  type BetterAuthPlugin,
  betterAuth,
} from "better-auth";
import { getMigrations } from "better-auth/db/migration";

export type AuthConfig = {
  databaseUrl?: string;
  baseURL?: string;
  secret?: string;
  socialProviders?: BetterAuthOptions["socialProviders"];
  plugins?: BetterAuthPlugin[];
};

function buildAuthOptions(config: AuthConfig): BetterAuthOptions {
  // Pass a pre-built libsql client so LibsqlDialect doesn't fall back to its
  // bundled (web-only) @libsql/client, which can't open `file:` URLs.
  const client = createSqliteClient(config.databaseUrl);
  const dialect = new LibsqlDialect({ client });
  return {
    baseURL: config.baseURL,
    secret: config.secret,
    database: {
      dialect,
      type: "sqlite",
    },
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: config.socialProviders,
    plugins: config.plugins ?? [],
    user: {
      deleteUser: {
        enabled: true,
      },
      changeEmail: {
        enabled: true,
        updateEmailWithoutVerification: true,
      },
    },
  };
}

export function createAuth(config: AuthConfig = {}) {
  return betterAuth(buildAuthOptions(config));
}

export async function runAuthMigrations(config: AuthConfig = {}) {
  const options = buildAuthOptions(config);
  const { runMigrations } = await getMigrations(options);
  await runMigrations();
}

export { svelteKitHandler, sveltekitCookies } from "better-auth/svelte-kit";
