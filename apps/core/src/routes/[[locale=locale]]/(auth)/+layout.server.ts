import { redirect } from "@sveltejs/kit";
import { resolveWithLocale } from "$lib/routes";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, parent }) => {
  const { locale } = await parent();

  if (!locals.session) {
    throw redirect(303, resolveWithLocale("/log-in", { locale }));
  }

  return {};
};
