import { assert, assertFalse } from "@std/assert";

import { HealthcheckVector } from "./healthcheck.ts";

Deno.test("accepts empty healthcheck object", () => {
  assert(HealthcheckVector.Check({}));
});

Deno.test("accepts valid duration and retries values", () => {
  assert(
    HealthcheckVector.Check({
      interval: "1m30s",
      timeout: "30s",
      start_period: "5s",
      start_interval: "1s",
      retries: 3,
    }),
  );

  assert(
    HealthcheckVector.Check({
      retries: "5",
    }),
  );
});

Deno.test("accepts valid test forms", () => {
  assert(HealthcheckVector.Check({ test: "curl -f http://localhost/health" }));
  assert(HealthcheckVector.Check({ test: ["NONE"] }));
  assert(
    HealthcheckVector.Check({
      test: ["CMD", "curl", "-f", "http://localhost"],
    }),
  );
  assert(
    HealthcheckVector.Check({
      test: ["CMD-SHELL", "curl -f http://localhost || exit 1"],
    }),
  );
});

Deno.test("rejects invalid duration values", () => {
  assertFalse(HealthcheckVector.Check({ interval: "30" }));
  assertFalse(HealthcheckVector.Check({ timeout: "1x" }));
});

Deno.test("rejects invalid retries values", () => {
  assertFalse(HealthcheckVector.Check({ retries: 0 }));
  assertFalse(HealthcheckVector.Check({ retries: 1.5 }));
  assertFalse(HealthcheckVector.Check({ retries: "0" }));
});

Deno.test("rejects invalid test array values", () => {
  assertFalse(HealthcheckVector.Check({ test: [] }));
  assertFalse(HealthcheckVector.Check({ test: ["CMD"] }));
  assertFalse(HealthcheckVector.Check({ test: ["CMD-SHELL"] }));
  assertFalse(HealthcheckVector.Check({ test: ["NONE", "echo", "nope"] }));
  assertFalse(HealthcheckVector.Check({ test: ["BAD", "echo"] }));
});

Deno.test("rejects unknown keys except x- prefixed extensions", () => {
  assertFalse(HealthcheckVector.Check({ unsupported: true }));
  assert(HealthcheckVector.Check({ "x-foo": "bar" }));
});
