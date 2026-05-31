<script lang="ts">
  type Props = {
    value?: string | number;
    [key: string]: unknown;
  };
  let { value = $bindable(""), ...rest }: Props = $props();
</script>

<input bind:value data-input {...rest} />

<style>
  [data-input] {
    background-color: var(--color-primary-180);
    border-radius: var(--size-border-radius);
    padding: 0.25em 0.61em;
    border: 0.1em solid var(--color-primary-120);
    font-size: 1em;
  }
</style>
