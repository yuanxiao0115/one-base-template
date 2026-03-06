import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { createOneAppManualChunks } from "../../scripts/vite/manual-chunks";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@one-base-template/tag/style": fileURLToPath(
        new URL("../../packages/tag/src/styles/global.scss", import.meta.url)
      ),
    },
  },
  optimizeDeps: {
    exclude: ["@one-base-template/ui"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: createOneAppManualChunks({
          appName: "portal",
          featureChunks: [
            {
              name: "portal-module",
              patterns: ["/apps/portal/src/modules/portal/"],
            },
          ],
        }),
      },
    },
  },
  server: {
    fs: {
      allow: [fileURLToPath(new URL("../../", import.meta.url))],
    },
  },
});
