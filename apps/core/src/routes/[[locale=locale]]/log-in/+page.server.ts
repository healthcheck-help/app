import { type Actions, fail, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { resolveWithLocale } from "$lib/routes";
import { auth } from "$lib/server/auth";

export const load = async ({ locals, params }) => {
  if (locals.session) {
    throw redirect(303, resolveWithLocale("/dashboard", params));
  }

  return {
    googleEnabled:
      Boolean(env.GOOGLE_CLIENT_ID) && Boolean(env.GOOGLE_CLIENT_SECRET),
  };
};

function getField(data: FormData, key: string) {
  const value = data.get(key);
  if (!value) return "";
  return value.toString().trim();
}

export const actions: Actions = {
  signIn: async ({ request, params }) => {
    const data = await request.formData();
    const email = getField(data, "email");
    const password = getField(data, "password");

    if (!email || !password) {
      return fail(400, { error: "Email and password are required." });
    }

    try {
      await auth.api.signInEmail({
        body: { email, password },
      });
    } catch (error) {
      return fail(400, {
        error: error instanceof Error ? error.message : "Unable to sign in.",
      });
    }

    throw redirect(303, resolveWithLocale("/dashboard", params));
  },
};
