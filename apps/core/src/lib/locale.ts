import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from "@healthcheck/i18n";

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return SUPPORTED_LOCALES.includes(segment as (typeof SUPPORTED_LOCALES)[number])
    ? (segment as Locale)
    : DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string): string {
  const localePattern = SUPPORTED_LOCALES.join("|");
  return pathname.replace(new RegExp(`^/(${localePattern})`), "") || "/";
}
