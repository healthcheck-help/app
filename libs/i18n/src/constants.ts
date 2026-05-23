// Using a hardcoded default since env vars may not be available during SSR build
// The actual locale detection happens at runtime in the hooks
export const DEFAULT_LOCALE = "en-CH";
export const SUPPORTED_LOCALES = ["en-CH", "de-CH", "fr-CH", "it-CH"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
