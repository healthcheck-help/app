import { type Actions, fail, redirect } from "@sveltejs/kit";
import { resolveWithLocale } from "$lib/routes";
import { auth } from "$lib/server/auth";

export const load = async ({ locals, params }) => {
  if (locals.session) {
    throw redirect(303, resolveWithLocale("/dashboard", params));
  }

  return {};
};

function getField(data: FormData, key: string) {
  const value = data.get(key);
  if (!value) return "";
  return value.toString().trim();
}

export const actions: Actions = {
  signUp: async ({ request, params }) => {
    const data = await request.formData();
    const name = getField(data, "name");
    const email = getField(data, "email");
    const password = getField(data, "password");

    if (!name || !email || !password) {
      return fail(400, { error: "Name, email, and password are required." });
    }

    try {
      await auth.api.signUpEmail({
        body: { name, email, password },
      });
    } catch (error) {
      return fail(400, {
        error: error instanceof Error ? error.message : "Unable to sign up.",
      });
    }

    throw redirect(303, resolveWithLocale("/dashboard", params));
  },
};
