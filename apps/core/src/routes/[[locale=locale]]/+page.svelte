<script lang="ts">
  import { defineMessages } from "@healthcheck/i18n";
  import Logo from "$lib/assets/logo.webp";
  import Search from "$lib/components/Search.svelte";

  const messages = defineMessages("home", {
    title: 'How to ask your containers: "You good?"',
  });
</script>

<img src={Logo} alt="Logo" style="width: auto; height: 100%;" />
<h1>{$messages.title}</h1>
<Search />

<style>
  img {
    max-width: 10rem;
  }
</style>
