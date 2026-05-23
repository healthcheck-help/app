import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals }) => {
  return {
    userName: locals.session?.user.name,
  };
};
