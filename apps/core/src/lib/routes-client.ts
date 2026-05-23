import { page } from "$app/state";
import { getLocaleFromPathname } from "$lib/locale";
import { type LocalizedPath, resolveWithLocale } from "$lib/routes";

export function resolveWithCurrentLocale(path: LocalizedPath): string {
  const locale = getLocaleFromPathname(page.url.pathname);
  return resolveWithLocale(path, { locale });
}
