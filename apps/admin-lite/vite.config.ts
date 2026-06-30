import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite-plus';
import { adminLiteBuildConfig, adminLiteFmtConfig, createAdminLitePlugins } from './build';
import { normalizeAppBase } from '../../scripts/vite/app-base';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL;
  const appBase = normalizeAppBase(env.VITE_APP_BASE);

  return {
    base: appBase,
    plugins: createAdminLitePlugins(),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: adminLiteBuildConfig,
    fmt: adminLiteFmtConfig,
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
