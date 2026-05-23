<script lang="ts">
  import { DropdownMenu } from "@healthcheck/theme";
  import { page } from "$app/state";
  import ActiveLink from "$lib/components/ActiveLink.svelte";
  import { resolveWithCurrentLocale } from "$lib/routes-client";
  import UserIcon from "~icons/tabler/user";

  const session = $derived(page.data.session);
  const userName = $derived(session?.user?.name ?? "");
</script>

{#if session}
  <DropdownMenu triggerText={userName}>
    {#snippet trigger()}
      <UserIcon />{userName}
    {/snippet}
    <DropdownMenu.Group aria-label={userName}>
      <DropdownMenu.Item>
        <ActiveLink href={resolveWithCurrentLocale("/dashboard")}>
          Dashboard
        </ActiveLink>
      </DropdownMenu.Item>
      <DropdownMenu.Item>
        <ActiveLink href={resolveWithCurrentLocale("/profile")}>
          Profile
        </ActiveLink>
      </DropdownMenu.Item>
      <DropdownMenu.Item>
        <form
          method="POST"
          action="{resolveWithCurrentLocale('/log-out')}?/signOut"
        >
          <button type="submit">Log out</button>
        </form>
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu>
{:else}
  <a href={resolveWithCurrentLocale("/log-in")} role="button" class="rounded">
    <UserIcon /><span>Log in</span>
  </a>
{/if}
