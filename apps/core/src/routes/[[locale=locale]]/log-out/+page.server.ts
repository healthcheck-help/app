import { type Actions, redirect } from "@sveltejs/kit";
import { resolveWithLocale } from "$lib/routes";
import { auth } from "$lib/server/auth";

export const actions: Actions = {
  signOut: async ({ request, params }) => {
    await auth.api.signOut({ headers: request.headers });
    throw redirect(303, resolveWithLocale("/log-in", params));
  },
};
