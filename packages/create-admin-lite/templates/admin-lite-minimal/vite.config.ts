import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite-plus';
import { adminLiteBuildConfig, adminLiteFmtConfig, createAdminLitePlugins } from './build';

function normalizeAppBase(input: string | undefined) {
  if (!input || input === '/') {
    return '/';
  }
  const prefixed = input.startsWith('/') ? input : `/${input}`;
  return prefixed.endsWith('/') ? prefixed : `${prefixed}/`;
}

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
    server: apiBaseUrl
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
      : {}
  };
});
