import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    // TODO: move into own plugin file
    {
      name: "sql-files",
      transform(src, id) {
        // called when a file is transformed
        // `src` is the file content, `id` is the file path
        if (id.match(/\.sql$/)) {
          // Transform the file
          if (id.match(/\.sql$/)) {
            // Return the file content as a string
            return {
              code: `export default ${JSON.stringify(src)};`, // The content of the SQL file as a string
            };
          }
          return null; // return null if no transformation is applied
        }
      },
    },
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
