import { svelte } from "@sveltejs/vite-plugin-svelte";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";

export default defineConfig({
  clearScreen: false,
  plugins: [svelte(), Icons({ compiler: "svelte" })],
});
