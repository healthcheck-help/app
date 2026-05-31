<script lang="ts">
  import { resolveWithCurrentLocale } from "$lib/routes-client";

  let { id = undefined } = $props();
</script>

<a href={resolveWithCurrentLocale("/")} {id}>
  healthcheck.help
</a>

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
