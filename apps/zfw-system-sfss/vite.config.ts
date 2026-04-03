import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite-plus';
import {
  ZfwSystemSfssBuildConfig,
  ZfwSystemSfssFmtConfig,
  createZfwSystemSfssPlugins
} from './build';
import { normalizeAppBase } from '../../scripts/vite/app-base';

const INTERNAL_WORKSPACE_PACKAGES = [
  '@one-base-template/core',
  '@one-base-template/ui',
  '@one-base-template/tag',
  '@one-base-template/adapters',
  '@one-base-template/app-starter'
] as const;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL;
  const zbBaseUrl = env.VITE_ZB_BASE_URL;
  const lmApiBaseUrl = env.VITE_API_LM_URL;
  const appBase = normalizeAppBase(env.VITE_APP_BASE);

  return {
    base: appBase,
    plugins: createZfwSystemSfssPlugins(),
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
      // workspace 源码包频繁迭代时，不走预构建缓存，避免新增导出后 dev 仍命中旧导出表。
      exclude: [...INTERNAL_WORKSPACE_PACKAGES]
    },
    build: ZfwSystemSfssBuildConfig,
    fmt: ZfwSystemSfssFmtConfig,
    server: {
      // 允许访问 monorepo 根目录，便于直接引用 packages/* 源码
      fs: {
        allow: [fileURLToPath(new URL('../../', import.meta.url))]
      },
      // 当配置了真实后端地址时，使用同源代理，Cookie 模式更顺畅（避免跨域）
      ...(apiBaseUrl || zbBaseUrl || lmApiBaseUrl
        ? {
            proxy: {
              ...(apiBaseUrl
                ? {
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
                : {}),
              ...(zbBaseUrl || apiBaseUrl
                ? {
                    '/zb': {
                      target: zbBaseUrl || apiBaseUrl,
                      changeOrigin: true,
                      secure: false,
                      rewrite: (path) => path.replace(/^\/zb/, '')
                    }
                  }
                : {}),
              ...(lmApiBaseUrl || apiBaseUrl
                ? {
                    '/zfw': {
                      target: lmApiBaseUrl || apiBaseUrl,
                      changeOrigin: true,
                      secure: false
                    }
                  }
                : {})
            }
          }
        : {})
    }
  };
});
