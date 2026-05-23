<script lang="ts">
  import { DropdownMenu, type WithoutChild } from "bits-ui";
  import type { Snippet } from "svelte";

  type Props = DropdownMenu.RootProps & {
    triggerText: string;
    trigger?: Snippet;
    children: Snippet;
    contentProps?: WithoutChild<DropdownMenu.ContentProps>;
  };

  let {
    open = $bindable(false),
    children,
    trigger,
    triggerText,
    contentProps,
    ...restProps
  }: Props = $props();
</script>

<DropdownMenu.Root bind:open {...restProps}>
  <DropdownMenu.Trigger class="fa-dropdown-trigger rounded">
    {#if trigger}
      {@render trigger()}
    {:else}
      {triggerText}
    {/if}
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content class="fa-dropdown-content" {...contentProps}>
      {@render children?.()}
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
  :global(.fa-dropdown-trigger) {
    font-weight: 500;
  }

  :global(.fa-dropdown-content) {
    background-color: var(--color-primary-180);
    border-radius: 0.3em;
    margin-block-start: 0.3em;
    border: 0.1em solid var(--color-primary-120);
    overflow: hidden;

    & [role="menuitem"] {
      display: flex;
      padding: 0.25em 0.61em;
      cursor: pointer;
    }

    & [role="menuitem"][data-selected] {
      background-color: var(--color-primary-160);
    }

    & [role="menuitem"]:has(a[aria-current="page"]) {
      background-color: var(--color-primary-160);
    }

    & [role="menuitem"]:hover,
    & [role="menuitem"][data-highlighted],
    & [role="menuitem"]:focus-within {
      background-color: var(--color-primary-140);
      color: var(--color-white);
    }

    & a,
    & button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      background: transparent;
      border: 0;
      border-radius: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      transition: none;
    }

    & button:hover,
    & button:focus-visible,
    & a:hover,
    & a:focus-visible {
      background: transparent;
      color: inherit;
    }

    & form {
      width: 100%;
      margin: 0;
    }
  }
</style>
