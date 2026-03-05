import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

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
  server: {
    fs: {
      allow: [fileURLToPath(new URL("../../", import.meta.url))],
    },
  },
});
