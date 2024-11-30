import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import { defineConfig } from "vite";
import * as rawFile from "vite-raw-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), rawFile.default({ fileRegex: /\.sql$/ })],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
  // Vite optimization interferes with wasm modules
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
