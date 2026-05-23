<script lang="ts">
  let { children } = $props();
</script>

<main class="page-margin">
  {@render children?.()}
</main>

<style>
  main {
    padding: 1rem;
  }
</style>
