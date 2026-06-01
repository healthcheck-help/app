import { svelteKitHandler } from "@healthcheck/auth";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@healthcheck/i18n";
import { type Handle, redirect } from "@sveltejs/kit";
import { building } from "$app/environment";
import { resolveWithLocale } from "$lib/routes";
import { auth } from "$lib/server/auth";
import { ensureCloned } from "$lib/server/data-repository";

if (!building) {
  ensureCloned().catch((error) => {
    console.error(
      "[hooks.server] failed to prepare data repository:",
      error instanceof Error ? error.message : error,
    );
  });
}

function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.length > 0 &&
    SUPPORTED_LOCALES.includes(
      segments[0] as (typeof SUPPORTED_LOCALES)[number],
    )
  ) {
    return `/${segments.slice(1).join("/")}` || "/";
  }
  return pathname;
}

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.length > 0 &&
    SUPPORTED_LOCALES.includes(
      segments[0] as (typeof SUPPORTED_LOCALES)[number],
    )
  ) {
    return segments[0];
  }
  return DEFAULT_LOCALE;
}

export const handle: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const locale = getLocaleFromPath(pathname);
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });
  event.locals.session = session;

  if (pathWithoutLocale === "/log-in" && session) {
    throw redirect(303, resolveWithLocale("/dashboard", { locale }));
  }

  const resolveWithLang: typeof resolve = (event, opts) => {
    return resolve(event, {
      ...opts,
      transformPageChunk: ({ html }) =>
        html
          .replace("%sveltekit.html_attributes%", `lang="${locale}"`)
          .replace("%bodyclass%", event.locals.bodyClass ?? ""),
    });
  };

  return svelteKitHandler({ auth, event, resolve: resolveWithLang, building });
};
