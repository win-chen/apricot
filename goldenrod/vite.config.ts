import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import { defineConfig } from "vite";
import vitePluginRaw from "vite-plugin-raw";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    // TODO: move into own plugin file
    vitePluginRaw({
      match: /\.sql$/,
      exclude: [new RegExp(path.resolve(__dirname, "./src/assets"))],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        "service-worker": "src/local-persist/service-worker.ts", // Service Worker entry point
      },
      output: {
        entryFileNames: ({ facadeModuleId }) => {
          if (
            facadeModuleId &&
            facadeModuleId?.indexOf("src/local-persist/service-worker.ts") > -1
          ) {
            return `[name].js`;
          }
          return "assets/[name].[hash].js";
        },
      },
    },
    manifest: true, // This will generate a manifest.json file
  },
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
