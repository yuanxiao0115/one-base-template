import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite-plus';
import { adminBuildConfig, adminFmtConfig, createAdminPlugins } from './build';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL;

  return {
    plugins: createAdminPlugins(),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // 子路径样式显式别名，避免某些环境下 package exports 子路径解析失败
        '@one-base-template/tag/style': fileURLToPath(
          new URL('../../packages/tag/src/styles/global.scss', import.meta.url)
        )
      }
    },
    optimizeDeps: {
      // workspace 包频繁迭代时，避免 Vite 预构建缓存导致导出项不一致（如新增组件导出后 dev 仍读旧缓存）
      exclude: ['@one-base-template/ui']
    },
    build: adminBuildConfig,
    fmt: adminFmtConfig,
    server: {
      // 允许访问 monorepo 根目录，便于直接引用 packages/* 源码
      fs: {
        allow: [fileURLToPath(new URL('../../', import.meta.url))]
      },
      // 当配置了真实后端地址时，使用同源代理，Cookie 模式更顺畅（避免跨域）
      ...(apiBaseUrl
        ? {
            proxy: {
              '/api': {
                target: apiBaseUrl,
                changeOrigin: true,
                secure: false
              },
              '/cmict': {
                target: apiBaseUrl,
                changeOrigin: true,
                secure: false
              }
            }
          }
        : {})
    }
  };
});
