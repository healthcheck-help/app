import { DEFAULT_LOCALE, type Locale } from "@healthcheck/i18n";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ params, url }) => {
  const localeParam = params.locale;

  // Redirect default locale URLs to non-prefixed versions
  if (localeParam === DEFAULT_LOCALE) {
    const pathWithoutLocale =
      url.pathname.replace(`/${DEFAULT_LOCALE}`, "") || "/";
    throw redirect(308, pathWithoutLocale + url.search);
  }

  // Determine the current locale - use localeParam if present, otherwise default
  // The param matcher ensures localeParam is always a valid Locale if present
  const locale = (localeParam ?? DEFAULT_LOCALE) as Locale;

  return {
    locale,
    localePrefix: localeParam ? `/${localeParam}` : "",
  };
};
