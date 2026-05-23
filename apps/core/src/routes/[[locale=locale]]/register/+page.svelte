<script lang="ts">
  import { defineMessages } from "@healthcheck/i18n";
  import { Alert, Input, NarrowContainer } from "@healthcheck/theme";

  const messages = defineMessages("register", {
    title: "Register",
    description: "Create a new account",
    registerFailedTitle: "Registration failed",
    registerButtonLabel: "Register",
  });

  let { form } = $props();
</script>

<NarrowContainer>
  <h1>{$messages.title}</h1>
  <p>{$messages.description}</p>

  <section>
    {#if form?.error}
      <Alert type="error" title={$messages.registerFailedTitle}>
        {form.error}
      </Alert>
    {/if}
    <form method="POST" action="?/signUp">
      <label>
        Name
        <Input type="text" name="name" autocomplete="name" required />
      </label>
      <label>
        Email
        <Input type="email" name="email" autocomplete="email" required />
      </label>
      <label>
        Password
        <Input
          type="password"
          name="password"
          autocomplete="new-password"
          required
        />
      </label>
      <button type="submit">{$messages.registerButtonLabel}</button>
    </form>
  </section>
</NarrowContainer>
