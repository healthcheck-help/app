<script lang="ts">
  export let value: string | number = "";
</script>

<input bind:value data-input {...$$restProps} />

<style>
  [data-input] {
    background-color: var(--color-primary-180);
    border-radius: var(--size-border-radius);
    padding: 0.25em 0.61em;
    border: 0.1em solid var(--color-primary-120);
    font-size: 1em;
  }
</style>
