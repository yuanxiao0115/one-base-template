import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { dirname, resolve as pathResolve } from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import {
  createOneAppCodeSplitting,
  createOneAppPreloadDependenciesResolver,
  pruneBuiltChunkPreloadMaps,
  stripIndexHtmlUnusedStylesheets,
} from "../../scripts/vite/manual-chunks";
import { createAdminMockMiddleware } from "./build/mock/mock-middleware";

function pruneLoginHtmlAssets(): Plugin {
  return {
    name: "admin-prune-login-html-assets",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const indexHtml = bundle["index.html"];
      if (!indexHtml || indexHtml.type !== "asset" || typeof indexHtml.source !== "string") {
        return;
      }

      indexHtml.source = stripIndexHtmlUnusedStylesheets(indexHtml.source, {
        appName: "admin",
      });
    },
    writeBundle(outputOptions, bundle) {
      const outputDir =
        typeof outputOptions.dir === "string"
          ? outputOptions.dir
          : outputOptions.file
            ? dirname(outputOptions.file)
            : fileURLToPath(new URL("./dist", import.meta.url));

      Object.values(bundle).forEach((output) => {
        if (output.type !== "chunk") {
          return;
        }

        const chunkFile = pathResolve(outputDir, output.fileName);
        if (!existsSync(chunkFile)) {
          return;
        }

        const source = readFileSync(chunkFile, "utf8");
        const nextSource = pruneBuiltChunkPreloadMaps(source, output.fileName, {
          appName: "admin",
        });

        if (nextSource !== source) {
          writeFileSync(chunkFile, nextSource);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = env.VITE_API_BASE_URL;
  const useMock = env.VITE_USE_MOCK ? env.VITE_USE_MOCK === "true" : !apiBaseUrl;
  const sczfwSystemPermissionCode = env.VITE_SCZFW_SYSTEM_PERMISSION_CODE || "admin_server";

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: [
          "vue",
          "vue-router",
          "pinia",
          {
            "@one-base-template/core": ["useTable", "useCrudPage"],
          },
          {
            "@/infra/confirm": ["obConfirm"],
          },
          {
            "@/utils/message": ["message", "closeAllMessage"],
          },
          {
            "@one-base-template/ui": ["useEntityEditor"],
          },
          {
            from: "@one-base-template/core",
            imports: ["CrudErrorContext", "CrudFormLike"],
            type: true,
          },
          {
            from: "@one-base-template/ui",
            imports: ["TablePagination"],
            type: true,
          },
        ],
        dts: "src/auto-imports.d.ts",
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        dts: "src/components.d.ts",
        resolvers: [ElementPlusResolver({ importStyle: "css" })],
      }),
      pruneLoginHtmlAssets(),
      ...(useMock ? [createAdminMockMiddleware({ sczfwSystemPermissionCode })] : []),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        // 子路径样式显式别名，避免某些环境下 package exports 子路径解析失败
        "@one-base-template/tag/style": fileURLToPath(
          new URL("../../packages/tag/src/styles/global.scss", import.meta.url)
        ),
      },
    },
    optimizeDeps: {
      // workspace 包频繁迭代时，避免 Vite 预构建缓存导致导出项不一致（如新增组件导出后 dev 仍读旧缓存）
      exclude: ["@one-base-template/ui"],
    },
    build: {
      chunkSizeWarningLimit: 3000,
      modulePreload: {
        resolveDependencies: createOneAppPreloadDependenciesResolver({
          appName: "admin",
        }),
      },
      rollupOptions: {
        output: {
          codeSplitting: createOneAppCodeSplitting({
            appName: "admin",
            featureChunks: [
              {
                name: "admin-home",
                patterns: ["/apps/admin/src/modules/home/"],
              },
              {
                name: "admin-log-management",
                patterns: ["/apps/admin/src/modules/LogManagement/"],
              },
              {
                name: "admin-system-management",
                patterns: ["/apps/admin/src/modules/SystemManagement/"],
              },
              {
                name: "admin-user-management",
                patterns: ["/apps/admin/src/modules/UserManagement/", "/apps/admin/src/components/PersonnelSelector/"],
              },
              {
                name: "admin-portal",
                patterns: ["/apps/admin/src/modules/portal/"],
              },
            ],
          }),
        },
      },
    },
    server: {
      // 允许访问 monorepo 根目录，便于直接引用 packages/* 源码
      fs: {
        allow: [fileURLToPath(new URL("../../", import.meta.url))],
      },
      // 当配置了真实后端地址时，使用同源代理，Cookie 模式更顺畅（避免跨域）
      ...(apiBaseUrl
        ? {
            proxy: {
              "/api": {
                target: apiBaseUrl,
                changeOrigin: true,
                secure: false,
              },
              "/cmict": {
                target: apiBaseUrl,
                changeOrigin: true,
                secure: false,
              },
            },
          }
        : {}),
    },
  };
});
