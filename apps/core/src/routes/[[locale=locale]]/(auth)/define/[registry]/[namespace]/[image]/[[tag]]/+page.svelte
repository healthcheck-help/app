<script lang="ts">
  import { defineMessages } from "@healthcheck/i18n";
  import { Alert, Input, NarrowContainer } from "@healthcheck/theme";

  let { data, form } = $props();

  const messages = defineMessages("define", {
    title: "Add HEALTHCHECK",
    editTitle: "Edit HEALTHCHECK",
    description:
      "Define the HEALTHCHECK for this image. Submitting opens a pull request against the data repository.",
    referenceLabel: "Image",
    tagLabel: "Tag",
    testModeLabel: "Test type",
    testModeShell: "Shell command (CMD-SHELL)",
    testModeCmd: "Exec arguments (CMD)",
    testModeNone: "Disable inherited HEALTHCHECK (NONE)",
    testCommandLabel: "Test command",
    testCommandShellHint:
      "Single shell command, e.g. curl --fail http://localhost/ || exit 1",
    testCommandCmdHint:
      'Space-separated arguments. Use quotes to group, e.g. /bin/sh -c "pgrep nginx"',
    intervalLabel: "Interval",
    timeoutLabel: "Timeout",
    startPeriodLabel: "Start period",
    startIntervalLabel: "Start interval",
    retriesLabel: "Retries",
    disableLabel: "Disable HEALTHCHECK entirely",
    durationHint: "Go duration, e.g. 30s, 5m, 1h",
    submitCreate: "Create HEALTHCHECK",
    submitUpdate: "Update HEALTHCHECK",
    submitFailedTitle: "Submission failed",
    fieldErrorTitle: "Please fix the form",
    "errors.testRequired": "Test command is required.",
    "errors.invalidTestMode": "Invalid test type.",
    "errors.invalidDuration": "Use a duration like 30s, 5m or 1h.",
    "errors.invalidRetries": "Retries must be a non-negative integer.",
    "errors.imageNotFound":
      "No such image was found in the registry. Check the namespace and image name.",
    "errors.registryUnavailable":
      "The image registry could not be reached. Please try again.",
    "errors.noChanges":
      "The submitted HEALTHCHECK is identical to the existing one. No pull request was opened.",
    "errors.commitFailed":
      "Failed to commit the change to the data repository.",
    "errors.prFailed":
      "The commit was pushed but creating the pull request failed.",
  });

  const v = $derived(form?.values ?? data.initialValues);
  const errors = $derived<Record<string, string>>(form?.errors ?? {});
  const formError = $derived(errors._form);

  function err(key: string): string | undefined {
    const code = errors[key];
    if (!code) return undefined;
    const localized = ($messages as Record<string, string>)[
      code.replace(/^define\./, "")
    ];
    return localized ?? code;
  }
</script>

<svelte:head>
  <title>
    {data.isEdit ? $messages.editTitle : $messages.title} – {data.ref.reference}
  </title>
</svelte:head>

<NarrowContainer>
  <h1>{data.isEdit ? $messages.editTitle : $messages.title}</h1>
  <p>{$messages.description}</p>

  <dl class="meta">
    <dt>{$messages.referenceLabel}</dt>
    <dd><code>{data.ref.reference}</code></dd>
    <dt>{$messages.tagLabel}</dt>
    <dd><code>{data.tag}</code></dd>
  </dl>

  {#if formError}
    <Alert type="error" title={$messages.submitFailedTitle}>
      {err("_form")}
    </Alert>
  {/if}

  <form method="POST">
    <fieldset>
      <legend>{$messages.testModeLabel}</legend>
      <label>
        <input
          type="radio"
          name="testMode"
          value="shell"
          checked={v.testMode === "shell"}
        />
        {$messages.testModeShell}
      </label>
      <label>
        <input
          type="radio"
          name="testMode"
          value="cmd"
          checked={v.testMode === "cmd"}
        />
        {$messages.testModeCmd}
      </label>
      <label>
        <input
          type="radio"
          name="testMode"
          value="none"
          checked={v.testMode === "none"}
        />
        {$messages.testModeNone}
      </label>
    </fieldset>

    <label>
      {$messages.testCommandLabel}
      <Input type="text" name="testCommand" value={v.testCommand} />
      <small>
        {v.testMode === "cmd"
          ? $messages.testCommandCmdHint
          : $messages.testCommandShellHint}
      </small>
      {#if err("testCommand")}
        <small class="error">{err("testCommand")}</small>
      {/if}
    </label>

    <label>
      {$messages.intervalLabel}
      <Input type="text" name="interval" value={v.interval} placeholder="30s" />
      <small>{$messages.durationHint}</small>
      {#if err("interval")}<small class="error">{err("interval")}</small>{/if}
    </label>

    <label>
      {$messages.timeoutLabel}
      <Input type="text" name="timeout" value={v.timeout} placeholder="5s" />
      <small>{$messages.durationHint}</small>
      {#if err("timeout")}<small class="error">{err("timeout")}</small>{/if}
    </label>

    <label>
      {$messages.startPeriodLabel}
      <Input
        type="text"
        name="startPeriod"
        value={v.startPeriod}
        placeholder="10s"
      />
      <small>{$messages.durationHint}</small>
      {#if err("startPeriod")}<small class="error">{err("startPeriod")}</small
        >{/if}
    </label>

    <label>
      {$messages.startIntervalLabel}
      <Input
        type="text"
        name="startInterval"
        value={v.startInterval}
        placeholder="5s"
      />
      <small>{$messages.durationHint}</small>
      {#if err("startInterval")}<small class="error"
          >{err("startInterval")}</small
        >{/if}
    </label>

    <label>
      {$messages.retriesLabel}
      <Input
        type="number"
        name="retries"
        value={v.retries}
        min="0"
        step="1"
        placeholder="3"
      />
      {#if err("retries")}<small class="error">{err("retries")}</small>{/if}
    </label>

    <label class="checkbox">
      <input
        type="checkbox"
        name="disable"
        value="on"
        checked={v.disable === "on"}
      />
      {$messages.disableLabel}
    </label>

    <button type="submit">
      {data.isEdit ? $messages.submitUpdate : $messages.submitCreate}
    </button>
  </form>
</NarrowContainer>

<style>
  .meta {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.25rem 1rem;
    margin: 0 0 1.25rem;
  }
  .meta dt {
    font-weight: 600;
  }
  .meta dd {
    margin: 0;
    word-break: break-all;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  fieldset {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border: 0.1em solid var(--color-primary-120, #ccc);
    border-radius: var(--size-border-radius, 0.25rem);
    padding: 0.75rem 1rem;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  label.checkbox {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
  small {
    opacity: 0.8;
  }
  small.error {
    color: var(--color-error, #c00);
    opacity: 1;
  }
</style>
