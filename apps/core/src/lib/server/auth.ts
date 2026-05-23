import { createAuth, sveltekitCookies } from "@healthcheck/auth";
import { getRequestEvent } from "$app/server";
import { env } from "$env/dynamic/private";

const googleClientId = env.GOOGLE_CLIENT_ID;
const googleClientSecret = env.GOOGLE_CLIENT_SECRET;
const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          prompt: "select_account" as const,
        },
      }
    : undefined;

export const auth = createAuth({
  databaseUrl: env.DATABASE_URL || undefined,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  socialProviders,
  plugins: [sveltekitCookies(getRequestEvent)],
});
