import type { ImageRef } from "$lib/server/data-repository";

type TokenCache = Map<string, { token: string; expiresAt: number }>;
const tokenCache: TokenCache = new Map();

const MANIFEST_ACCEPT = [
  "application/vnd.oci.image.manifest.v1+json",
  "application/vnd.oci.image.index.v1+json",
  "application/vnd.docker.distribution.manifest.v2+json",
  "application/vnd.docker.distribution.manifest.list.v2+json",
  "application/vnd.docker.distribution.manifest.v1+json",
].join(", ");

function registryHost(registry: string): string {
  if (registry === "docker.io") return "registry-1.docker.io";
  return registry;
}

/** Verify that an image (optionally a specific tag) exists in its registry. */
export async function imageExists(
  ref: ImageRef,
  tag = "latest",
): Promise<boolean> {
  const host = registryHost(ref.registry);
  const repo = `${ref.namespace}/${ref.image}`;
  const url = `https://${host}/v2/${repo}/manifests/${encodeURIComponent(tag)}`;

  let response = await fetch(url, {
    method: "HEAD",
    headers: { Accept: MANIFEST_ACCEPT, ...authHeader(repo) },
  });

  if (response.status === 401) {
    const challenge = response.headers.get("www-authenticate");
    const token = await acquireToken(repo, challenge);
    if (token) {
      response = await fetch(url, {
        method: "HEAD",
        headers: {
          Accept: MANIFEST_ACCEPT,
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  if (response.ok) return true;
  if (response.status === 404) return false;
  // Some registries refuse HEAD; retry with GET.
  if (response.status === 405) {
    const getResp = await fetch(url, {
      method: "GET",
      headers: { Accept: MANIFEST_ACCEPT, ...authHeader(repo) },
    });
    if (getResp.ok) return true;
    if (getResp.status === 404) return false;
  }
  throw new Error(
    `Registry returned ${response.status} for ${ref.registry}/${repo}:${tag}`,
  );
}

function authHeader(repo: string): Record<string, string> {
  const cached = tokenCache.get(repo);
  if (cached && cached.expiresAt > Date.now()) {
    return { Authorization: `Bearer ${cached.token}` };
  }
  return {};
}

async function acquireToken(
  repo: string,
  challenge: string | null,
): Promise<string | undefined> {
  if (!challenge) return undefined;
  const params = parseChallenge(challenge);
  const realm = params.realm;
  if (!realm) return undefined;
  const url = new URL(realm);
  if (params.service) url.searchParams.set("service", params.service);
  url.searchParams.set("scope", params.scope ?? `repository:${repo}:pull`);

  const resp = await fetch(url.toString());
  if (!resp.ok) return undefined;
  const json = (await resp.json()) as {
    token?: string;
    access_token?: string;
    expires_in?: number;
  };
  const token = json.token ?? json.access_token;
  if (!token) return undefined;
  const ttlSec = json.expires_in ?? 60;
  tokenCache.set(repo, {
    token,
    expiresAt: Date.now() + Math.max(0, ttlSec - 5) * 1000,
  });
  return token;
}

function parseChallenge(header: string): Record<string, string> {
  // e.g. Bearer realm="https://auth.docker.io/token",service="registry.docker.io",scope="repository:library/nginx:pull"
  const idx = header.indexOf(" ");
  const tail = idx >= 0 ? header.slice(idx + 1) : header;
  const result: Record<string, string> = {};
  const re = /(\w+)="([^"]*)"/g;
  for (;;) {
    const match = re.exec(tail);
    if (match === null) break;
    result[match[1]] = match[2];
  }
  return result;
}
