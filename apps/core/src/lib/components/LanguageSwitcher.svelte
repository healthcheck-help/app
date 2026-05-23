<script lang="ts">
  import {
    DEFAULT_LOCALE,
    type Locale,
    SUPPORTED_LOCALES,
  } from "@healthcheck/i18n";
  import { Select } from "@healthcheck/theme";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { getLocaleFromPathname, stripLocalePrefix } from "$lib/locale";
  import LanguageIcon from '~icons/tabler/language';

  const selectedLocale = $derived(getLocaleFromPathname(page.url.pathname));

  const localeItems = SUPPORTED_LOCALES.map((locale) => ({
    value: locale,
    label: new Intl.DisplayNames([locale], {
      type: "language",
      languageDisplay: "standard",
      style: "narrow",
    }).of(locale) || locale,
  }));

  function getLocalePath(locale: Locale): string {
    const pathWithoutLocale = stripLocalePrefix(page.url.pathname);

    // For default locale, no prefix
    if (locale === DEFAULT_LOCALE) {
      return pathWithoutLocale;
    }

    // For other locales, add prefix
    return `/${locale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
  }

  function handleLocaleChange(locale: string) {
    const nextLocale = locale as Locale;
    const nextPath = getLocalePath(nextLocale);

    if (page.url.pathname === nextPath) {
      return;
    }

    goto(nextPath, {
      invalidateAll: true,
      keepFocus: true,
      noScroll: true,
    });
  }
</script>

<nav aria-label="Language selection">
  <Select
    Trigger={LanguageIcon}
    items={localeItems}
    value={selectedLocale}
    onValueChange={handleLocaleChange}
    placeholder="Select language"
  />
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
  }
</style>
