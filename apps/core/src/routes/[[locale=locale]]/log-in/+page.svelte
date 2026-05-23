<script lang="ts">
  import { defineMessages } from "@healthcheck/i18n";
  import { Alert, Input, NarrowContainer } from "@healthcheck/theme";
  import { resolveWithCurrentLocale } from "$lib/routes-client";

  const messages = defineMessages("log-in", {
    title: "Log in",
    localProviderTitle: "Using a local account",
    externalProviderTitle: "Using an external identity provider",
    registerTitle: "Register a local account",
    description: "Log in to your account",
    loginFailedTitle: "Log in failed",
    registerButtonLabel: "Register",
    logInButtonLabel: "Log in",
    continueWithGoogleLabel: "Continue with Google",
  });

  let { form, data } = $props();

  async function signInWithGoogle() {
    const res = await fetch("/api/auth/sign-in/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "google",
        callbackURL: resolveWithCurrentLocale("/dashboard"),
        errorCallbackURL: resolveWithCurrentLocale("/log-in"),
      }),
    });
    const json = await res.json();
    if (json.url) {
      window.location.href = json.url;
    }
  }
</script>

<NarrowContainer>
  <h1>{$messages.title}</h1>
  <p>{$messages.description}</p>

  <section>
    <h2>{$messages.localProviderTitle}</h2>
    {#if form?.error}
      <Alert type="error" title={$messages.loginFailedTitle}>
        {form.error}
      </Alert>
    {/if}
    <form method="POST" action="?/signIn">
      <label>
        Email
        <Input type="email" name="email" autocomplete="email" required />
      </label>
      <label>
        Password
        <Input
          type="password"
          name="password"
          autocomplete="current-password"
          required
        />
      </label>
      <button type="submit">{$messages.logInButtonLabel}</button>
    </form>
  </section>

  <section>
    <h2>{$messages.externalProviderTitle}</h2>
    {#if data.googleEnabled}
      <button type="button" onclick={signInWithGoogle}>
        {$messages.continueWithGoogleLabel}
      </button>
    {/if}
  </section>

  <section>
    <h2>{$messages.registerTitle}</h2>
    <a href={resolveWithCurrentLocale("/register")} role="button">
      {$messages.registerButtonLabel}
    </a>
  </section>
</NarrowContainer>
