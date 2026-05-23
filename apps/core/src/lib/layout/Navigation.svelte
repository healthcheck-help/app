<script>
  import Pagebar from "./Pagebar.svelte";
  import Toolbar from "./Toolbar.svelte";
</script>

<style>
  nav {
    display: grid;
    grid-template-columns: subgrid;
    grid-template-rows: 100%;
    grid-column: span 2;

    & > :global(*:nth-child(1)) {
      justify-self: center;
    }

    & > :global(*:nth-child(2)) {
      justify-self: end;
    }
  }
</style>

<nav>
  <Pagebar />
  <Toolbar />
</nav>
