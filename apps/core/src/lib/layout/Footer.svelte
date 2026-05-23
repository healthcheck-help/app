<script lang="ts">
  import { defineMessages } from "@healthcheck/i18n";

  let props: { version: string } = $props();

  const messages = defineMessages("footer", {
    version: "Version",
  });
</script>

<style>
  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--color-primary-180);
    margin-block: 1rem;
    padding-inline: 1rem;
    border-radius: 900px;
    height: 3rem;
    container-type: size;
  }
</style>

<footer class="page-margin">
  <span>{$messages.version}: {props.version}</span>
</footer>
