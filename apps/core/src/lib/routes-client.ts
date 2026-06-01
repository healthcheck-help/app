import { page } from "$app/state";
import { getLocaleFromPathname } from "$lib/locale";
import {
  type DefineRef,
  type ExploreRef,
  type LocalizedPath,
  resolveDefine,
  resolveExplore,
  resolveWithLocale,
} from "$lib/routes";

export function resolveWithCurrentLocale(path: LocalizedPath): string {
  const locale = getLocaleFromPathname(page.url.pathname);
  return resolveWithLocale(path, { locale });
}

export function resolveExploreWithCurrentLocale(ref: ExploreRef): string {
  const locale = getLocaleFromPathname(page.url.pathname);
  return resolveExplore(ref, { locale });
}

export function resolveDefineWithCurrentLocale(ref: DefineRef): string {
  const locale = getLocaleFromPathname(page.url.pathname);
  return resolveDefine(ref, { locale });
}
