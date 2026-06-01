import { DEFAULT_LOCALE } from "@healthcheck/i18n";
import { resolve } from "$app/paths";
import type { RouteId, RouteParams } from "$app/types";

type LocaleParams = { locale?: string };
type LocaleOptionalOnlyRouteId = {
  [R in RouteId]: Exclude<keyof RouteParams<R>, "locale"> extends never
    ? R
    : never;
}[RouteId];
type LocalizedRouteId = Extract<
  LocaleOptionalOnlyRouteId,
  `/[[locale=locale]]${string}`
>;
type LocalizedSuffix<T extends string> = T extends "/[[locale=locale]]"
  ? ""
  : T extends `/[[locale=locale]]${infer Suffix}`
    ? Suffix
    : never;
type StripGroups<T extends string> =
  T extends `${infer A}(${string})/${infer B}`
    ? StripGroups<`${A}${B}`>
    : T extends `${string}(${string})${string}`
      ? never
      : T;

export type LocalizedPath =
  | "/"
  | Exclude<StripGroups<LocalizedSuffix<LocalizedRouteId>>, "">;

export function resolveWithLocale(
  path: LocalizedPath,
  params?: LocaleParams,
): string {
  const locale = params?.locale;
  const suffix = path === "/" ? "" : path;
  if (!locale || locale === DEFAULT_LOCALE) {
    return resolve(suffix || "/");
  }
  return resolve(`/${locale}${suffix}`);
}

export type ExploreRef = {
  registry: string;
  namespace: string;
  image: string;
};

export function resolveExplore(ref: ExploreRef, params?: LocaleParams): string {
  const segment = `/explore/${encodeURIComponent(ref.registry)}/${encodeURIComponent(ref.namespace)}/${encodeURIComponent(ref.image)}`;
  const locale = params?.locale;
  if (!locale || locale === DEFAULT_LOCALE) {
    return resolve(segment);
  }
  return resolve(`/${locale}${segment}`);
}

export type DefineRef = ExploreRef & { tag?: string };

export function resolveDefine(ref: DefineRef, params?: LocaleParams): string {
  const base = `/define/${encodeURIComponent(ref.registry)}/${encodeURIComponent(ref.namespace)}/${encodeURIComponent(ref.image)}`;
  const segment = ref.tag ? `${base}/${encodeURIComponent(ref.tag)}` : base;
  const locale = params?.locale;
  if (!locale || locale === DEFAULT_LOCALE) {
    return resolve(segment);
  }
  return resolve(`/${locale}${segment}`);
}
