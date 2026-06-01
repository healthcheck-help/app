import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals }) => {
  locals.bodyClass = "centered";
  return { bodyClass: "centered" };
};
