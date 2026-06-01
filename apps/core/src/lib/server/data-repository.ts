import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import {
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { env } from "$env/dynamic/private";
import { getAuthenticatedPushUrl, getDefaultBranch } from "$lib/server/forgejo";

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

async function runGit(
  args: string[],
  cwd?: string,
): Promise<{ stdout: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    let stdout = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout });
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

export async function loadHealthcheckByTag(
  ref: ImageRef,
  tag: string,
): Promise<HealthcheckEntry | null> {
  const entries = await loadHealthchecks(
    ref.registry,
    ref.namespace,
    ref.image,
  );
  return entries.find((e) => e.tag === tag) ?? null;
}

export type CommitAuthor = { name: string; email: string };

export type CommitHealthcheckInput = {
  ref: ImageRef;
  tag: string;
  healthcheck: HealthcheckDefinition;
  user: CommitAuthor;
  intent: "create" | "update";
};

export type CommitHealthcheckResult = {
  branch: string;
  filePath: string;
  changed: boolean;
};

function sanitizeBranchSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function stableStringify(value: HealthcheckDefinition): string {
  // Preserve compose-spec field ordering for readable diffs.
  const order: (keyof HealthcheckDefinition)[] = [
    "test",
    "interval",
    "timeout",
    "retries",
    "start_period",
    "start_interval",
    "disable",
  ];
  const out: Record<string, unknown> = {};
  for (const key of order) {
    if (value[key] !== undefined) out[key] = value[key];
  }
  return `${JSON.stringify(out, null, 2)}\n`;
}

/**
 * Create a branch in a temporary worktree, write the healthcheck file, commit,
 * and push to the configured Forgejo remote. The caller is expected to open a
 * pull request via the forgejo module afterwards.
 */
export async function commitHealthcheckToBranch(
  input: CommitHealthcheckInput,
): Promise<CommitHealthcheckResult> {
  await ensureCloned();
  const repoPath = getRepoPath();
  const base = await getDefaultBranch();

  // Refresh local default branch so the new branch is based on latest main.
  await runGit(["-C", repoPath, "fetch", "origin", base], repoPath);

  const segments = [
    sanitizeBranchSegment(input.ref.registry),
    sanitizeBranchSegment(input.ref.namespace),
    sanitizeBranchSegment(input.ref.image),
    sanitizeBranchSegment(input.tag),
  ].join("/");
  const suffix = randomBytes(4).toString("hex");
  const branch = `healthcheck/${segments}/${suffix}`;

  const worktreePath = join(
    `${repoPath}-wt`,
    `${sanitizeBranchSegment(segments)}-${suffix}`,
  );
  await mkdir(dirname(worktreePath), { recursive: true });

  const relPath = join(
    input.ref.registry,
    input.ref.namespace,
    input.ref.image,
    `${input.tag}.json`,
  );

  try {
    await runGit(
      [
        "-C",
        repoPath,
        "worktree",
        "add",
        "-b",
        branch,
        worktreePath,
        `origin/${base}`,
      ],
      repoPath,
    );

    const absPath = join(worktreePath, relPath);
    await mkdir(dirname(absPath), { recursive: true });
    await writeFile(absPath, stableStringify(input.healthcheck), "utf-8");

    await runGit(["-C", worktreePath, "add", relPath], worktreePath);

    // Detect whether anything actually changed vs the base branch.
    let changed = false;
    try {
      await runGit(["-C", worktreePath, "diff", "--cached", "--quiet"]);
      changed = false;
    } catch {
      changed = true;
    }

    if (!changed) {
      return { branch, filePath: relPath, changed: false };
    }

    const verb = input.intent === "create" ? "Add" : "Update";
    const subject = `${verb} HEALTHCHECK for ${input.ref.reference}:${input.tag}`;
    const body = `Co-authored-by: ${input.user.name} <${input.user.email}>`;

    await runGit(
      [
        "-C",
        worktreePath,
        "-c",
        "user.name=Healthcheck Bot",
        "-c",
        "user.email=bot@healthcheck.help",
        "-c",
        "commit.gpgsign=false",
        "commit",
        "-m",
        subject,
        "-m",
        body,
      ],
      worktreePath,
    );

    const pushUrl = getAuthenticatedPushUrl();
    await runGit(
      ["-C", worktreePath, "push", pushUrl, `${branch}:${branch}`],
      worktreePath,
    );

    return { branch, filePath: relPath, changed: true };
  } finally {
    // Always remove the worktree and its branch reference on cleanup; if the
    // commit succeeded, the branch lives on the remote anyway.
    try {
      await runGit(
        ["-C", repoPath, "worktree", "remove", "--force", worktreePath],
        repoPath,
      );
    } catch (error) {
      console.warn(
        `[data-repository] failed to remove worktree ${worktreePath}:`,
        error instanceof Error ? error.message : error,
      );
      await rm(worktreePath, { recursive: true, force: true }).catch(() => {});
    }
    try {
      await runGit(["-C", repoPath, "branch", "-D", branch], repoPath);
    } catch {
      /* branch may not exist if worktree add failed early */
    }
  }
}
