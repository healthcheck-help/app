<script lang="ts">
  import { defineMessages } from "@healthcheck/i18n";
  import { onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { resolveExploreWithCurrentLocale } from "$lib/routes-client";

  type Result = {
    reference: string;
    registry: string;
    namespace: string;
    image: string;
  };

  let { ...rest }: Record<string, unknown> = $props();

  const messages = defineMessages("search", {
    placeholder: "Search for an image (e.g. nginx)…",
    noResults: "No matches found.",
    error: "Search is currently unavailable.",
  });

  let query = $state("");
  let results = $state<Result[]>([]);
  let selectedIndex = $state(-1);
  let isOpen = $state(false);
  let hasError = $state(false);
  let isLoading = $state(false);
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let activeController: AbortController | undefined;

  async function runSearch(q: string) {
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    isLoading = true;
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data: { results: Result[] } = await response.json();
      if (controller.signal.aborted) return;
      results = data.results ?? [];
      selectedIndex = results.length > 0 ? 0 : -1;
      hasError = false;
      isOpen = true;
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      hasError = true;
      results = [];
      selectedIndex = -1;
      isOpen = true;
    } finally {
      if (!controller.signal.aborted) isLoading = false;
    }
  }

  function onInput(event: Event) {
    query = (event.target as HTMLInputElement).value;
    clearTimeout(debounceTimer);
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      results = [];
      selectedIndex = -1;
      isOpen = false;
      hasError = false;
      return;
    }
    debounceTimer = setTimeout(() => runSearch(trimmed), 200);
  }

  function navigateTo(result: Result) {
    isOpen = false;
    goto(resolveExploreWithCurrentLocale(result));
  }

  function onKeydown(event: KeyboardEvent) {
    if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      if (results.length > 0) isOpen = true;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (results.length > 0) {
          selectedIndex = (selectedIndex + 1) % results.length;
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (results.length > 0) {
          selectedIndex =
            selectedIndex <= 0 ? results.length - 1 : selectedIndex - 1;
        }
        break;
      case "Enter":
        if (isOpen && selectedIndex >= 0 && results[selectedIndex]) {
          event.preventDefault();
          navigateTo(results[selectedIndex]);
        }
        break;
      case "Escape":
        isOpen = false;
        break;
    }
  }

  function onBlur() {
    setTimeout(() => {
      isOpen = false;
    }, 150);
  }

  function onFocus() {
    if (results.length > 0 || hasError) isOpen = true;
  }

  onDestroy(() => {
    clearTimeout(debounceTimer);
    activeController?.abort();
  });
</script>

<div class="search">
  <input
    type="search"
    role="combobox"
    aria-expanded={isOpen}
    aria-controls="search-results"
    aria-autocomplete="list"
    placeholder={$messages.placeholder}
    data-search
    value={query}
    oninput={onInput}
    onkeydown={onKeydown}
    onblur={onBlur}
    onfocus={onFocus}
    {...rest}
  />
  {#if isOpen}
    <ul id="search-results" role="listbox" class="results">
      {#if hasError}
        <li class="empty" role="option" aria-selected="false">
          {$messages.error}
        </li>
      {:else if results.length === 0 && !isLoading}
        <li class="empty" role="option" aria-selected="false">
          {$messages.noResults}
        </li>
      {:else}
        {#each results as result, index (result.reference)}
          <li
            role="option"
            aria-selected={index === selectedIndex}
            class:selected={index === selectedIndex}
          >
            <a
              href={resolveExploreWithCurrentLocale(result)}
              onmousedown={(event) => {
                event.preventDefault();
                navigateTo(result);
              }}
            >
              <span class="image">{result.image}</span>
              <span class="reference">{result.reference}</span>
            </a>
          </li>
        {/each}
      {/if}
    </ul>
  {/if}
</div>

<style>
  .search {
    position: relative;
    width: 100%;
    max-width: 32rem;
  }
  [data-search] {
    width: 100%;
    box-sizing: border-box;
  }
  .results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin: 0.25rem 0 0;
    padding: 0.25rem 0;
    list-style: none;
    background-color: var(--color-primary-180, #fff);
    border: 0.1em solid var(--color-primary-120, #ccc);
    border-radius: var(--size-border-radius, 0.25rem);
    box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.1);
    z-index: 10;
    max-height: 20rem;
    overflow-y: auto;
  }
  .results li {
    margin: 0;
  }
  .results li.empty {
    padding: 0.5rem 0.75rem;
    opacity: 0.7;
    text-align: center;
  }
  .results a {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5rem 0.75rem;
    text-decoration: none;
    color: inherit;
  }
  .results li.selected,
  .results a:hover {
    background-color: var(--color-primary-160, rgba(0, 0, 0, 0.05));
  }
  .results .image {
    font-weight: 600;
  }
  .results .reference {
    font-size: 0.85em;
    opacity: 0.75;
  }
</style>
