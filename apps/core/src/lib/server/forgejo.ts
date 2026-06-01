import { env } from "$env/dynamic/private";

export type CreatePullRequestInput = {
  head: string;
  base: string;
  title: string;
  body: string;
};

export type CreatePullRequestResult = {
  number: number;
  htmlUrl: string;
};

type ForgejoConfig = {
  baseUrl: string;
  owner: string;
  repo: string;
  token: string;
};

let defaultBranchCache: string | undefined;

function getConfig(): ForgejoConfig {
  const token = env.CODEBERG_TOKEN;
  if (!token) {
    throw new Error("CODEBERG_TOKEN is not configured");
  }
  return {
    baseUrl: (env.CODEBERG_BASE_URL ?? "https://codeberg.org").replace(
      /\/$/,
      "",
    ),
    owner: env.CODEBERG_OWNER ?? "healthcheck",
    repo: env.CODEBERG_REPO ?? "data",
    token,
  };
}

export function getRepoConfig(): {
  owner: string;
  repo: string;
  baseUrl: string;
} {
  const c = getConfig();
  return { owner: c.owner, repo: c.repo, baseUrl: c.baseUrl };
}

/** Public HTTPS push URL with the service-account token injected. */
export function getAuthenticatedPushUrl(): string {
  const c = getConfig();
  const u = new URL(`${c.baseUrl}/${c.owner}/${c.repo}.git`);
  return `${u.protocol}//oauth2:${encodeURIComponent(c.token)}@${u.host}${u.pathname}`;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const c = getConfig();
  const resp = await fetch(`${c.baseUrl}/api/v1${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `token ${c.token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new Error(
      `Forgejo API ${init?.method ?? "GET"} ${path} failed (${resp.status}): ${detail.slice(0, 500)}`,
    );
  }
  return (await resp.json()) as T;
}

export async function getDefaultBranch(): Promise<string> {
  if (defaultBranchCache) return defaultBranchCache;
  const c = getConfig();
  const repo = await api<{ default_branch: string }>(
    `/repos/${c.owner}/${c.repo}`,
  );
  defaultBranchCache = repo.default_branch || "main";
  return defaultBranchCache;
}

export async function createPullRequest(
  input: CreatePullRequestInput,
): Promise<CreatePullRequestResult> {
  const c = getConfig();
  const pr = await api<{ number: number; html_url: string }>(
    `/repos/${c.owner}/${c.repo}/pulls`,
    {
      method: "POST",
      body: JSON.stringify({
        head: input.head,
        base: input.base,
        title: input.title,
        body: input.body,
      }),
    },
  );
  return { number: pr.number, htmlUrl: pr.html_url };
}
