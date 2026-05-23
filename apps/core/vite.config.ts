import { resolve } from "node:path";
import svg from "@poppanator/sveltekit-svg";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { sharedPlugins } from "../../shared/vite.config.base";

export default defineConfig({
  server: { port: 5001 },
  clearScreen: false,
  ssr: {
    // bits-ui and its rune-based deps (svelte-toolbelt, runed, ...) ship
    // uncompiled `.svelte` and `.svelte.js` files. Force Vite to process
    // anything matching `*.svelte` / `*.svelte.js|ts` with the Svelte plugin
    // instead of letting Node load them as plain JS during SSR.
    noExternal: [
      "bits-ui",
      "svelte-toolbelt",
      "runed",
      /\.svelte(?:\.[jt]s)?$/,
    ],
  },
  resolve: {
    alias: [
      {
        find: "@healthcheck/theme/index.css",
        replacement: resolve("../../libs/theme/dist/index.css"),
      },
      {
        find: "@healthcheck/theme",
        replacement: resolve("../../libs/theme/dist/index.js"),
      },
      {
        find: "@healthcheck/i18n",
        replacement: resolve("../../libs/i18n/src/index.ts"),
      },
      {
        find: "@healthcheck/auth",
        replacement: resolve("../../libs/auth/src/index.ts"),
      },
      {
        find: "@healthcheck/db",
        replacement: resolve("../../libs/db/src/index.ts"),
      },
    ],
  },
  plugins: [sveltekit(), devtoolsJson(), svg(), ...sharedPlugins],
});
