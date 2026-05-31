<script lang="ts">
  import { defineMessages } from "@healthcheck/i18n";

  let props: { version: string } = $props();

  const messages = defineMessages("footer", {
    version: "Version",
  });
</script>

<footer class="page-margin">
  <span>{$messages.version}: {props.version}</span>
</footer>

<style>
  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 0.8rem;
    margin-block-start: 1rem;
    padding-inline: 1rem;
    border-radius: 900px;
    height: 3rem;
    container-type: size;
  }
</style>
