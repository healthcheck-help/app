import { json } from "@sveltejs/kit";
import {
  ensureCloned,
  type ImageRef,
  listImages,
} from "$lib/server/data-repository";
import type { RequestHandler } from "./$types";

const MAX_RESULTS = 10;
const DEFAULT_REGISTRY = "docker.io";
const DEFAULT_NAMESPACE = "library";

function score(query: string, ref: ImageRef): number {
  const q = query.toLowerCase();
  const reference = ref.reference.toLowerCase();
  const image = ref.image.toLowerCase();
  if (image === q || reference === q) return 100;
  if (image.startsWith(q)) return 80;
  if (reference.startsWith(q)) return 70;
  if (image.includes(q)) return 50;
  if (reference.includes(q)) return 40;
  return 0;
}

export const GET: RequestHandler = async ({ url }) => {
  const query = (url.searchParams.get("q") ?? "").trim();
  if (!query) {
    return json({ results: [] });
  }

  try {
    await ensureCloned();
  } catch (error) {
    return json(
      {
        results: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to access data repository",
      },
      { status: 503 },
    );
  }

  const images = await listImages();
  const segments = query.split("/").filter(Boolean);
  let candidates: ImageRef[] = images;

  if (segments.length >= 3) {
    candidates = images.filter(
      (i) =>
        i.registry === segments[0] &&
        i.namespace === segments[1] &&
        i.image.toLowerCase().includes(segments[2].toLowerCase()),
    );
  } else if (segments.length === 2) {
    candidates = images.filter(
      (i) =>
        (i.namespace === segments[0] || i.registry === segments[0]) &&
        i.image.toLowerCase().includes(segments[1].toLowerCase()),
    );
  }

  const scored = candidates
    .map((ref) => ({ ref, s: score(query, ref) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.ref.reference.localeCompare(b.ref.reference))
    .slice(0, MAX_RESULTS)
    .map((x) => x.ref);

  // For bare image-name queries, ensure the canonical docker.io/library/<name>
  // shows up even when the user has no fuzzy match yet.
  if (segments.length === 1) {
    const canonicalRef = `${DEFAULT_REGISTRY}/${DEFAULT_NAMESPACE}/${segments[0]}`;
    const exists = scored.some((r) => r.reference === canonicalRef);
    const known = images.find((r) => r.reference === canonicalRef);
    if (!exists && known) {
      scored.unshift(known);
    }
  }

  return json({ results: scored.slice(0, MAX_RESULTS) });
};
