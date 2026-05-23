<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import { page } from "$app/state";

  type MatchMode = "exact" | "prefix";

  type Props = HTMLAnchorAttributes & {
    match?: MatchMode;
    ariaCurrent?: HTMLAnchorAttributes["aria-current"];
    children: Snippet;
  };

  let {
    href = "",
    match = "prefix",
    ariaCurrent = undefined,
    children,
    ...restProps
  }: Props = $props();

  const normalizedHref = $derived.by(() => {
    if (typeof href !== "string" || href.length === 0) {
      return "";
    }

    try {
      const base = "https://healthcheck.local";
      const path = new URL(href, base).pathname;

      return path.replace(/\/+$/, "") || "/";
    } catch {
      return "";
    }
  });

  const currentPath = $derived(page.url.pathname.replace(/\/+$/, "") || "/");

  const isCurrent = $derived(
    normalizedHref !== "" &&
      (match === "exact"
        ? currentPath === normalizedHref
        : currentPath === normalizedHref ||
          currentPath.startsWith(`${normalizedHref}/`)),
  );

  const resolvedAriaCurrent = $derived(
    ariaCurrent ?? (isCurrent ? "page" : undefined),
  );
</script>

<a {href} aria-current={resolvedAriaCurrent} {...restProps}>
  {@render children?.()}
</a>
