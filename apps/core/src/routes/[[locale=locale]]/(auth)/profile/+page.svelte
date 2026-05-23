<script lang="ts">
  import { defineMessages } from "@healthcheck/i18n";
  import { Alert, Input, NarrowContainer } from "@healthcheck/theme";
  import type { ActionData, PageData } from "./$types";

  const messages = defineMessages("profile", {
    title: "Profile",
    personalInfoTitle: "Personal Information",
    nameLabel: "Name",
    emailLabel: "Email",
    emailHint:
      "Email cannot be changed for accounts linked to an external provider.",
    saveButtonLabel: "Save Changes",
    updateSuccessTitle: "Profile updated",
    updateSuccessMessage: "Your profile has been updated successfully.",
    updateFailedTitle: "Update failed",
    dangerZoneTitle: "Danger Zone",
    terminateButtonLabel: "Terminate Account",
    terminateConfirmMessage:
      "Are you sure? This action is irreversible and will permanently delete your account and all associated data.",
    terminateConfirmButtonLabel: "Yes, permanently delete my account",
    cancelButtonLabel: "Cancel",
    deleteFailedTitle: "Delete failed",
  });

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let showDeleteConfirm = $state(false);
</script>

<NarrowContainer>
  <h1>{$messages.title}</h1>

  <section>
    <h2>{$messages.personalInfoTitle}</h2>

    {#if form?.updateSuccess}
      <Alert type="success" title={$messages.updateSuccessTitle}>
        {$messages.updateSuccessMessage}
      </Alert>
    {/if}

    {#if form?.updateError}
      <Alert type="error" title={$messages.updateFailedTitle}>
        {form.updateError}
      </Alert>
    {/if}

    <form method="POST" action="?/updateProfile">
      <label>
        {$messages.nameLabel}
        <Input
          type="text"
          name="name"
          autocomplete="name"
          value={data.user.name}
          required
        />
      </label>
      <label>
        {$messages.emailLabel}
        <Input
          type="email"
          name="email"
          autocomplete="email"
          value={data.user.email}
          disabled={!data.canChangeEmail}
        />
      </label>
      {#if !data.canChangeEmail}
        <p class="hint">{$messages.emailHint}</p>
      {/if}
      <button type="submit">{$messages.saveButtonLabel}</button>
    </form>
  </section>

  <section class="danger-zone">
    <h2>{$messages.dangerZoneTitle}</h2>

    {#if form?.deleteError}
      <Alert type="error" title={$messages.deleteFailedTitle}>
        {form.deleteError}
      </Alert>
    {/if}

    {#if !showDeleteConfirm}
      <button
        type="button"
        class="danger"
        onclick={() => (showDeleteConfirm = true)}
      >
        {$messages.terminateButtonLabel}
      </button>
    {:else}
      <p>{$messages.terminateConfirmMessage}</p>
      <div class="confirm-actions">
        <button type="button" onclick={() => (showDeleteConfirm = false)}>
          {$messages.cancelButtonLabel}
        </button>
        <form method="POST" action="?/deleteAccount">
          <button type="submit" class="danger">
            {$messages.terminateConfirmButtonLabel}
          </button>
        </form>
      </div>
    {/if}
  </section>
</NarrowContainer>

<style>
  section {
    margin-block-start: 2rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-block-start: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .hint {
    font-size: 0.875rem;
    color: var(--color-text-muted, #666);
    margin: 0;
  }

  .danger-zone {
    border-block-start: 2px solid var(--color-red, #c00);
    padding-block-start: 1rem;
  }

  .danger-zone h2 {
    color: var(--color-red, #c00);
  }

  button.danger {
    background-color: var(--color-red, #c00);
    color: var(--color-white, #fff);
    border: none;
    cursor: pointer;
  }

  .confirm-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
    margin-block-start: 0.75rem;
  }
</style>
