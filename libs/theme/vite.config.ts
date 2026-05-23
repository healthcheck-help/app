import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { sharedPlugins } from "../../shared/vite.config.base";

export default defineConfig({
  clearScreen: false,
  plugins: [svelte(), ...sharedPlugins],
});
