<script lang="ts">
  import { defineMessages } from "@healthcheck/i18n";
  import type { HealthcheckDefinition } from "$lib/server/data-repository";

  let { data } = $props();

  const messages = defineMessages("explore", {
    tagLabel: "Tag",
    testLabel: "Test",
    intervalLabel: "Interval",
    timeoutLabel: "Timeout",
    retriesLabel: "Retries",
    startPeriodLabel: "Start period",
    startIntervalLabel: "Start interval",
    dockerfileLabel: "Dockerfile",
    composeLabel: "docker-compose",
    copyLabel: "Copy",
    copiedLabel: "Copied!",
  });

  function formatTest(test: HealthcheckDefinition["test"]): string {
    if (!test) return "";
    if (typeof test === "string") return test;
    if (test[0] === "CMD-SHELL") return test.slice(1).join(" ");
    if (test[0] === "CMD") return test.slice(1).join(" ");
    if (test[0] === "NONE") return "NONE";
    return test.join(" ");
  }

  function toDockerfile(hc: HealthcheckDefinition): string {
    const parts: string[] = [];
    if (hc.interval) parts.push(`--interval=${hc.interval}`);
    if (hc.timeout) parts.push(`--timeout=${hc.timeout}`);
    if (hc.start_period) parts.push(`--start-period=${hc.start_period}`);
    if (hc.start_interval) parts.push(`--start-interval=${hc.start_interval}`);
    if (typeof hc.retries === "number") parts.push(`--retries=${hc.retries}`);
    const flags = parts.length > 0 ? ` ${parts.join(" ")}` : "";
    const test = hc.test;
    let cmd = "CMD";
    let args = "";
    if (Array.isArray(test) && test.length > 0) {
      if (test[0] === "CMD-SHELL") {
        cmd = "CMD-SHELL";
        args = test.slice(1).join(" ");
      } else if (test[0] === "CMD") {
        cmd = "CMD";
        args = test
          .slice(1)
          .map((s) => JSON.stringify(s))
          .join(", ");
        args = `[${args}]`;
      } else if (test[0] === "NONE") {
        return `HEALTHCHECK NONE`;
      } else {
        args = test.map((s) => JSON.stringify(s)).join(", ");
        args = `[${args}]`;
      }
    } else if (typeof test === "string") {
      cmd = "CMD-SHELL";
      args = test;
    }
    return `HEALTHCHECK${flags} ${cmd} ${args}`.trim();
  }

  function toCompose(hc: HealthcheckDefinition): string {
    const lines = ["healthcheck:"];
    const test = hc.test;
    if (Array.isArray(test)) {
      const items = test.map((s) => JSON.stringify(s)).join(", ");
      lines.push(`  test: [${items}]`);
    } else if (typeof test === "string") {
      lines.push(`  test: ${JSON.stringify(test)}`);
    }
    if (hc.interval) lines.push(`  interval: ${hc.interval}`);
    if (hc.timeout) lines.push(`  timeout: ${hc.timeout}`);
    if (typeof hc.retries === "number") lines.push(`  retries: ${hc.retries}`);
    if (hc.start_period) lines.push(`  start_period: ${hc.start_period}`);
    if (hc.start_interval) lines.push(`  start_interval: ${hc.start_interval}`);
    if (hc.disable) lines.push(`  disable: true`);
    return lines.join("\n");
  }

  let copiedKey = $state<string | undefined>(undefined);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      copiedKey = key;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        copiedKey = undefined;
      }, 1500);
    } catch (error) {
      console.error("clipboard write failed", error);
    }
  }
</script>

<svelte:head>
  <title>{data.reference} – healthcheck.help</title>
</svelte:head>

<h1><code>{data.reference}</code></h1>

{#each data.healthchecks as entry (entry.tag)}
  {@const dockerfile = toDockerfile(entry.healthcheck)}
  {@const compose = toCompose(entry.healthcheck)}
  {@const dfKey = `${entry.tag}-df`}
  {@const cKey = `${entry.tag}-compose`}
  <section class="healthcheck">
    <header>
      <span class="tag">{$messages.tagLabel}: <code>{entry.tag}</code></span>
    </header>

    <dl>
      <dt>{$messages.testLabel}</dt>
      <dd><code>{formatTest(entry.healthcheck.test)}</code></dd>
      {#if entry.healthcheck.interval}
        <dt>{$messages.intervalLabel}</dt>
        <dd>{entry.healthcheck.interval}</dd>
      {/if}
      {#if entry.healthcheck.timeout}
        <dt>{$messages.timeoutLabel}</dt>
        <dd>{entry.healthcheck.timeout}</dd>
      {/if}
      {#if typeof entry.healthcheck.retries === "number"}
        <dt>{$messages.retriesLabel}</dt>
        <dd>{entry.healthcheck.retries}</dd>
      {/if}
      {#if entry.healthcheck.start_period}
        <dt>{$messages.startPeriodLabel}</dt>
        <dd>{entry.healthcheck.start_period}</dd>
      {/if}
      {#if entry.healthcheck.start_interval}
        <dt>{$messages.startIntervalLabel}</dt>
        <dd>{entry.healthcheck.start_interval}</dd>
      {/if}
    </dl>

    <div class="snippet">
      <div class="snippet-head">
        <strong>{$messages.dockerfileLabel}</strong>
        <button type="button" onclick={() => copy(dfKey, dockerfile)}>
          {copiedKey === dfKey ? $messages.copiedLabel : $messages.copyLabel}
        </button>
      </div>
      <pre><code>{dockerfile}</code></pre>
    </div>

    <div class="snippet">
      <div class="snippet-head">
        <strong>{$messages.composeLabel}</strong>
        <button type="button" onclick={() => copy(cKey, compose)}>
          {copiedKey === cKey ? $messages.copiedLabel : $messages.copyLabel}
        </button>
      </div>
      <pre><code>{compose}</code></pre>
    </div>
  </section>
{/each}

<style>
  h1 {
    word-break: break-all;
  }
  .healthcheck {
    border: 0.1em solid var(--color-primary-120, #ccc);
    border-radius: var(--size-border-radius, 0.25rem);
    padding: 1rem;
    margin: 1rem 0;
  }
  .healthcheck header {
    margin-bottom: 0.75rem;
  }
  .tag {
    font-size: 0.9em;
    opacity: 0.85;
  }
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.25rem 1rem;
    margin: 0 0 1rem;
  }
  dt {
    font-weight: 600;
  }
  dd {
    margin: 0;
    word-break: break-word;
  }
  .snippet {
    margin-top: 0.75rem;
  }
  .snippet-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }
  pre {
    background-color: var(--color-primary-180, #f5f5f5);
    border: 0.1em solid var(--color-primary-120, #ccc);
    border-radius: var(--size-border-radius, 0.25rem);
    padding: 0.5rem 0.75rem;
    overflow-x: auto;
    margin: 0;
  }
</style>
