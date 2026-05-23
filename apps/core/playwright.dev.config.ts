import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "deno task dev -- --port 4174",
    port: 4174,
    reuseExistingServer: true,
    timeout: 120000,
  },
  testDir: "e2e",
});
