import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { env } from "$env/dynamic/private";

export type HealthcheckDefinition = {
  test?: string[] | string;
  interval?: string;
  timeout?: string;
  retries?: number;
  start_period?: string;
  start_interval?: string;
  disable?: boolean;
};

export type ImageRef = {
  registry: string;
  namespace: string;
  image: string;
  reference: string;
};

export type HealthcheckEntry = {
  tag: string;
  healthcheck: HealthcheckDefinition;
};

const DEFAULT_REMOTE = "https://codeberg.org/healthcheck/data.git";

function getRepoPath(): string {
  return env.DATA_REPO_PATH || join(tmpdir(), "healthcheck-data");
}

function getRepoUrl(): string {
  return env.DATA_REPO_URL || DEFAULT_REMOTE;
}

async function runGit(args: string[], cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `git ${args.join(" ")} failed (exit ${code}): ${stderr.trim() || "(no stderr)"}`,
          ),
        );
      }
    });
  });
}

let cloneOnce: Promise<void> | undefined;
let imageCache: ImageRef[] | undefined;

export function ensureCloned(): Promise<void> {
  if (!cloneOnce) {
    cloneOnce = doEnsureCloned().catch((error) => {
      cloneOnce = undefined;
      throw error;
    });
  }
  return cloneOnce;
}

async function doEnsureCloned(): Promise<void> {
  const path = getRepoPath();
  const gitDir = join(path, ".git");
  if (existsSync(gitDir)) {
    try {
      await runGit(["-C", path, "pull", "--ff-only"]);
    } catch (error) {
      console.warn(
        `[data-repository] pull failed for ${path}, continuing with local copy:`,
        error instanceof Error ? error.message : error,
      );
    }
    return;
  }
  await mkdir(dirname(path), { recursive: true });
  await runGit(["clone", "--depth=1", getRepoUrl(), path]);
}

/** Invalidate the in-memory image listing cache. */
export function invalidateCache(): void {
  imageCache = undefined;
}

async function safeReadDir(path: string): Promise<string[]> {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function listImages(): Promise<ImageRef[]> {
  if (imageCache) return imageCache;
  const root = getRepoPath();
  const results: ImageRef[] = [];
  const registries = await safeReadDir(root);
  for (const registry of registries) {
    if (registry.startsWith(".")) continue;
    const namespaces = await safeReadDir(join(root, registry));
    for (const namespace of namespaces) {
      const images = await safeReadDir(join(root, registry, namespace));
      for (const image of images) {
        results.push({
          registry,
          namespace,
          image,
          reference: `${registry}/${namespace}/${image}`,
        });
      }
    }
  }
  imageCache = results;
  return results;
}

export async function loadHealthchecks(
  registry: string,
  namespace: string,
  image: string,
): Promise<HealthcheckEntry[]> {
  const dir = join(getRepoPath(), registry, namespace, image);
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }
  const jsonFiles = entries.filter((f) => f.endsWith(".json"));
  const result: HealthcheckEntry[] = [];
  for (const file of jsonFiles) {
    const filePath = join(dir, file);
    try {
      const info = await stat(filePath);
      if (!info.isFile()) continue;
      const raw = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw) as HealthcheckDefinition;
      const tag = file.replace(/\.json$/, "");
      result.push({ tag, healthcheck: parsed });
    } catch (error) {
      console.warn(
        `[data-repository] skipping ${filePath}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
  // Put "default" first, others alphabetically.
  result.sort((a, b) => {
    if (a.tag === "default") return -1;
    if (b.tag === "default") return 1;
    return a.tag.localeCompare(b.tag);
  });
  return result;
}
