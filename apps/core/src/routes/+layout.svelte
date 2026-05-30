<script lang="ts">
  import "@healthcheck/theme/index.css";
  import "./+layout.css";
  import {
    DEFAULT_LOCALE,
    defineMessages,
    SUPPORTED_LOCALES,
  } from "@healthcheck/i18n";
  import Footer from "$lib/layout/Footer.svelte";
  import Header from "$lib/layout/Header.svelte";
  import Main from "$lib/layout/Main.svelte";

  const { children, data } = $props();

  const messages = defineMessages("layout", {
    title: "healthcheck.help",
    pageTitle: 'healthcheck.help - How to ask your containers: "You good?"',
    description:
      'How to ask your containers: "You good?" — monitor and manage your container health checks with ease.',
    keywords:
      "healthcheck, containers, docker, monitoring, devops, health check",
    author: "Robin Bühler (openscript GmbH)",
  });

  function getHrefLang(locale: string, path: string): string {
    // Remove locale prefix from current path if it exists
    const localePattern = SUPPORTED_LOCALES.join("|");
    const pathWithoutLocale =
      path.replace(new RegExp(`^/(${localePattern})`), "") || "/";

    // For default locale, don't add prefix
    if (locale === DEFAULT_LOCALE) {
      return pathWithoutLocale;
    }

    return `/${locale}${pathWithoutLocale}`;
  }
</script>

<svelte:head>
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="shortcut icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-title" content={$messages.title} />
  <link rel="manifest" href="/site.webmanifest" />
  <title>{$messages.pageTitle}</title>
  <meta name="description" content={$messages.description} />
  <meta name="keywords" content={$messages.keywords} />
  <meta name="author" content={$messages.author} />
  {#each SUPPORTED_LOCALES as locale (locale)}
    <link
      rel="alternate"
      hreflang={locale}
      href={`https://healthcheck.help${getHrefLang(locale, data.path)}`}
    />
  {/each}
  <link
    rel="alternate"
    hreflang="x-default"
    href="https://healthcheck.help{data.path}"
  />
</svelte:head>

<Header />

<Main>
  {@render children?.()}
</Main>

<Footer version={data.version} />
