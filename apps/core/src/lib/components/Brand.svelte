<script lang="ts">
  import Logo from "$lib/assets/logo.svg?component";
  import { resolveWithCurrentLocale } from "$lib/routes-client";

  let { id = undefined } = $props();
</script>

<style>
  a {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 100%;
    font-size: 61.8cqh;
    line-height: 1;

    :global(svg) {
      min-height: 100%;
      width: auto;
    }
  }
</style>

<a href={resolveWithCurrentLocale("/")} {id}>
  <Logo width="auto" height="100%" />
  healthcheck.help
</a>
