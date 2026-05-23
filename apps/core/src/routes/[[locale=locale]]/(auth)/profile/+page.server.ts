import { type Actions, fail, redirect } from "@sveltejs/kit";
import { resolveWithLocale } from "$lib/routes";
import { auth } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, request }) => {
  const accounts = await auth.api.listUserAccounts({
    headers: request.headers,
  });
  const hasCredentialAccount = accounts.some(
    (a) => a.providerId === "credential",
  );

  return {
    user: {
      name: locals.session?.user.name ?? "",
      email: locals.session?.user.email ?? "",
    },
    canChangeEmail: hasCredentialAccount,
  };
};

function getField(data: FormData, key: string) {
  const value = data.get(key);
  if (!value) return "";
  return value.toString().trim();
}

export const actions: Actions = {
  updateProfile: async ({ request, locals }) => {
    const currentEmail = locals.session?.user.email ?? "";
    const data = await request.formData();
    const name = getField(data, "name");
    const email = getField(data, "email");

    if (!name) {
      return fail(400, { updateError: "Name is required." });
    }

    try {
      await auth.api.updateUser({
        body: { name },
        headers: request.headers,
      });

      if (email && email !== currentEmail) {
        const accounts = await auth.api.listUserAccounts({
          headers: request.headers,
        });
        const hasCredentialAccount = accounts.some(
          (a) => a.providerId === "credential",
        );

        if (!hasCredentialAccount) {
          return fail(400, {
            updateError:
              "Email cannot be changed for accounts linked to an external provider.",
          });
        }

        await auth.api.changeEmail({
          body: { newEmail: email },
          headers: request.headers,
        });
      }
    } catch (error) {
      return fail(400, {
        updateError:
          error instanceof Error ? error.message : "Unable to update profile.",
      });
    }

    return { updateSuccess: true };
  },

  deleteAccount: async ({ request, params }) => {
    try {
      await auth.api.deleteUser({
        body: {},
        headers: request.headers,
      });
    } catch (error) {
      return fail(400, {
        deleteError:
          error instanceof Error ? error.message : "Unable to delete account.",
      });
    }

    throw redirect(303, resolveWithLocale("/log-in", params));
  },
};
