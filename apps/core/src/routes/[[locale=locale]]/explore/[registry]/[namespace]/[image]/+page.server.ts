import { loadHealthchecks } from "$lib/server/data-repository";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { registry, namespace, image } = params;
  const healthchecks = await loadHealthchecks(registry, namespace, image);
  return {
    registry,
    namespace,
    image,
    reference: `${registry}/${namespace}/${image}`,
    healthchecks,
  };
};
