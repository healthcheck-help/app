<script lang="ts">
  import { currentLocale } from "@healthcheck/i18n";
  import { untrack } from "svelte";
  import { page } from "$app/state";
  import { getLocaleFromPathname } from "$lib/locale";

  let { children, data } = $props();

  // Set immediately for SSR/initial render (prevents flash)
  // untrack tells Svelte we intentionally only want the initial value here
  untrack(() => currentLocale.set(data.locale));

  // Derive from pathname to avoid optional-param timing issues where
  // page.params.locale may briefly be undefined during client transitions.
  $effect(() => {
    currentLocale.set(getLocaleFromPathname(page.url.pathname));
  });
</script>

{@render children?.()}
