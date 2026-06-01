import type { HealthcheckDefinition } from "$lib/server/data-repository";

export type HealthcheckFormInput = {
  testMode: string;
  testCommand: string;
  interval: string;
  timeout: string;
  startPeriod: string;
  startInterval: string;
  retries: string;
  disable: string;
};

export type ValidationErrors = Partial<
  Record<keyof HealthcheckFormInput | "_form", string>
>;

export type ValidationResult =
  | { ok: true; value: HealthcheckDefinition }
  | { ok: false; errors: ValidationErrors };

const DURATION_RE = /^\d+(?:\.\d+)?(?:ns|us|µs|ms|s|m|h)$/;

export function isValidDuration(value: string): boolean {
  return DURATION_RE.test(value);
}

export function validateHealthcheck(
  input: HealthcheckFormInput,
): ValidationResult {
  const errors: ValidationErrors = {};
  const value: HealthcheckDefinition = {};

  const testMode = input.testMode;
  const testCommand = input.testCommand.trim();
  if (testMode === "none") {
    value.test = ["NONE"];
  } else if (testMode === "shell") {
    if (!testCommand) {
      errors.testCommand = "define.errors.testRequired";
    } else {
      value.test = ["CMD-SHELL", testCommand];
    }
  } else if (testMode === "cmd") {
    if (!testCommand) {
      errors.testCommand = "define.errors.testRequired";
    } else {
      const args = tokenizeCmd(testCommand);
      if (args.length === 0) {
        errors.testCommand = "define.errors.testRequired";
      } else {
        value.test = ["CMD", ...args];
      }
    }
  } else {
    errors.testMode = "define.errors.invalidTestMode";
  }

  for (const [field, key] of [
    ["interval", "interval"],
    ["timeout", "timeout"],
    ["startPeriod", "start_period"],
    ["startInterval", "start_interval"],
  ] as const) {
    const raw = input[field].trim();
    if (!raw) continue;
    if (!isValidDuration(raw)) {
      errors[field] = "define.errors.invalidDuration";
    } else {
      value[key] = raw;
    }
  }

  const retriesRaw = input.retries.trim();
  if (retriesRaw) {
    const n = Number(retriesRaw);
    if (!Number.isInteger(n) || n < 0) {
      errors.retries = "define.errors.invalidRetries";
    } else {
      value.retries = n;
    }
  }

  if (input.disable === "on" || input.disable === "true") {
    value.disable = true;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value };
}

/** Simple shell-style tokenizer supporting single and double quotes. */
function tokenizeCmd(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: '"' | "'" | undefined;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) {
        quote = undefined;
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === " " || ch === "\t") {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    current += ch;
  }
  if (current.length > 0) tokens.push(current);
  return tokens;
}

/** Convert an existing definition back to form input values for prefill. */
export function definitionToFormInput(
  def: HealthcheckDefinition | undefined,
): HealthcheckFormInput {
  const base: HealthcheckFormInput = {
    testMode: "shell",
    testCommand: "",
    interval: "",
    timeout: "",
    startPeriod: "",
    startInterval: "",
    retries: "",
    disable: "",
  };
  if (!def) return base;
  const t = def.test;
  if (Array.isArray(t) && t.length > 0) {
    if (t[0] === "NONE") {
      base.testMode = "none";
    } else if (t[0] === "CMD-SHELL") {
      base.testMode = "shell";
      base.testCommand = t.slice(1).join(" ");
    } else if (t[0] === "CMD") {
      base.testMode = "cmd";
      base.testCommand = t
        .slice(1)
        .map((a) => (/\s/.test(a) ? JSON.stringify(a) : a))
        .join(" ");
    } else {
      base.testMode = "cmd";
      base.testCommand = t
        .map((a) => (/\s/.test(a) ? JSON.stringify(a) : a))
        .join(" ");
    }
  } else if (typeof t === "string") {
    base.testMode = "shell";
    base.testCommand = t;
  }
  if (def.interval) base.interval = def.interval;
  if (def.timeout) base.timeout = def.timeout;
  if (def.start_period) base.startPeriod = def.start_period;
  if (def.start_interval) base.startInterval = def.start_interval;
  if (typeof def.retries === "number") base.retries = String(def.retries);
  if (def.disable) base.disable = "on";
  return base;
}
