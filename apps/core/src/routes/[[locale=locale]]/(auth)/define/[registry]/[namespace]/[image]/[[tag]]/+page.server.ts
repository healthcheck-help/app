import { type Actions, error, fail, redirect } from "@sveltejs/kit";
import {
  commitHealthcheckToBranch,
  type ImageRef,
  loadHealthcheckByTag,
} from "$lib/server/data-repository";
import {
  createPullRequest,
  getDefaultBranch,
  getRepoConfig,
} from "$lib/server/forgejo";
import {
  definitionToFormInput,
  type HealthcheckFormInput,
  validateHealthcheck,
} from "$lib/server/healthcheck-schema";
import { imageExists } from "$lib/server/registry";
import type { PageServerLoad } from "./$types";

function makeRef(params: {
  registry: string;
  namespace: string;
  image: string;
}): ImageRef {
  return {
    registry: params.registry,
    namespace: params.namespace,
    image: params.image,
    reference: `${params.registry}/${params.namespace}/${params.image}`,
  };
}

export const load: PageServerLoad = async ({ params }) => {
  const ref = makeRef(params);
  const tag = params.tag ?? "default";
  const existing = await loadHealthcheckByTag(ref, tag);
  const initialValues = definitionToFormInput(existing?.healthcheck);

  return {
    ref,
    tag,
    isEdit: existing !== null,
    initialValues,
  };
};

function getField(data: FormData, key: string): string {
  const value = data.get(key);
  return value ? value.toString() : "";
}

function readFormInput(data: FormData): HealthcheckFormInput {
  return {
    testMode: getField(data, "testMode") || "shell",
    testCommand: getField(data, "testCommand"),
    interval: getField(data, "interval"),
    timeout: getField(data, "timeout"),
    startPeriod: getField(data, "startPeriod"),
    startInterval: getField(data, "startInterval"),
    retries: getField(data, "retries"),
    disable: getField(data, "disable"),
  };
}

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    if (!locals.session?.user) {
      throw error(401, "Authentication required");
    }
    const ref = makeRef(
      params as { registry: string; namespace: string; image: string },
    );
    const tag = params.tag ?? "default";

    const data = await request.formData();
    const values = readFormInput(data);
    const result = validateHealthcheck(values);
    if (!result.ok) {
      return fail(400, { values, errors: result.errors });
    }

    const existing = await loadHealthcheckByTag(ref, tag);
    if (!existing) {
      let exists = false;
      try {
        // "default" is an app-level concept, not a real registry tag.
        // Fall back to "latest" to verify the image itself exists.
        exists = await imageExists(ref, tag === "default" ? "latest" : tag);
      } catch (err) {
        console.warn("[define] registry check failed:", err);
        return fail(502, {
          values,
          errors: { _form: "define.errors.registryUnavailable" },
        });
      }
      if (!exists) {
        return fail(404, {
          values,
          errors: { _form: "define.errors.imageNotFound" },
        });
      }
    }

    let commit: Awaited<ReturnType<typeof commitHealthcheckToBranch>>;
    try {
      commit = await commitHealthcheckToBranch({
        ref,
        tag,
        healthcheck: result.value,
        user: {
          name: locals.session.user.name,
          email: locals.session.user.email,
        },
        intent: existing ? "update" : "create",
      });
    } catch (err) {
      console.error("[define] git workflow failed:", err);
      return fail(500, {
        values,
        errors: { _form: "define.errors.commitFailed" },
      });
    }

    if (!commit.changed) {
      return fail(409, {
        values,
        errors: { _form: "define.errors.noChanges" },
      });
    }

    try {
      const base = await getDefaultBranch();
      const repoCfg = getRepoConfig();
      const intentVerb = existing ? "Update" : "Add";
      const pr = await createPullRequest({
        head: commit.branch,
        base,
        title: `${intentVerb} HEALTHCHECK for ${ref.reference}:${tag}`,
        body: [
          `Submitted via healthcheck.help by ${locals.session.user.name} (${locals.session.user.email}).`,
          "",
          `File: \`${commit.filePath}\``,
          `Repository: ${repoCfg.baseUrl}/${repoCfg.owner}/${repoCfg.repo}`,
        ].join("\n"),
      });
      throw redirect(303, pr.htmlUrl);
    } catch (err) {
      if (err instanceof Response) throw err;
      // SvelteKit redirects are thrown as plain objects; let them bubble up.
      if (
        err &&
        typeof err === "object" &&
        "status" in err &&
        "location" in err
      ) {
        throw err;
      }
      console.error("[define] PR creation failed:", err);
      return fail(500, {
        values,
        errors: { _form: "define.errors.prFailed" },
      });
    }
  },
};
