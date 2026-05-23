<script lang="ts">
  import Brand from "$lib/components/Brand.svelte";
  import Navigation from "./Navigation.svelte";
</script>

<style>
  header {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 100%;
    background-color: var(--color-primary-180);
    margin-block: 1rem;
    padding: 0.5rem;
    padding-inline-end: 1rem;
    border-radius: 900px;
    height: 3rem;
    container-type: size;
  }
</style>

<header class="page-margin">
  <Brand id="title" />
  <Navigation />
</header>
