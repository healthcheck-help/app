<script lang="ts">
  import { Select, type WithoutChildren } from "bits-ui";
  import type { Component } from "svelte";
  import TablerSelector from "~icons/tabler/selector";

  type Props = Omit<
    WithoutChildren<Select.RootProps>,
    "type" | "onValueChange"
  > & {
    placeholder?: string;
    Trigger?: Component;
    items: { value: string; label: string; disabled?: boolean }[];
    contentProps?: WithoutChildren<Select.ContentProps>;
    type?: "single";
    onValueChange?: (value: string) => void;
  };

  let {
    value = $bindable(),
    items,
    contentProps,
    placeholder,
    Trigger,
    type = "single",
    ...restProps
  }: Props = $props();

  const selectedLabel = $derived(
    items.find((item) => item.value === value)?.label,
  );

  const triggerClass = $derived(Trigger ? "rounded" : "");
</script>

<Select.Root bind:value={value as never} {type} {...restProps}>
  <Select.Trigger
    class={triggerClass}
    title={selectedLabel ? selectedLabel : placeholder}
  >
    {#if Trigger}
      <Trigger />
    {:else}
      {selectedLabel ? selectedLabel : placeholder}
      <TablerSelector />
    {/if}
  </Select.Trigger>
  <Select.Portal>
    <Select.Content {...contentProps}>
      <Select.ScrollUpButton>up</Select.ScrollUpButton>
      <Select.Viewport>
        {#each items as { value, label, disabled } (value)}
          <Select.Item {value} {label} {disabled}>
            {label}
          </Select.Item>
        {/each}
      </Select.Viewport>
      <Select.ScrollDownButton>down</Select.ScrollDownButton>
    </Select.Content>
  </Select.Portal>
</Select.Root>

<style>
  :global {
    [data-select-content] {
      background-color: var(--color-primary-180);
      border-radius: 0.3em;
      margin-block-start: 0.3em;
      border: 0.1em solid var(--color-primary-120);
    }

    [data-select-item] {
      display: flex;
      padding: 0.25em 0.61em;
      cursor: pointer;

      &[data-selected] {
        background-color: var(--color-primary-160);
      }

      &:hover,
      &[data-highlighted] {
        background-color: var(--color-primary-140);
        color: var(--color-white);
      }
    }
  }
</style>
