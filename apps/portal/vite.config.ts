import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';
import { createOneAppManualChunks } from '../../scripts/vite/manual-chunks';

const INTERNAL_WORKSPACE_PACKAGES = [
  '@one-base-template/core',
  '@one-base-template/ui',
  '@one-base-template/tag',
  '@one-base-template/adapters',
  '@one-base-template/portal-engine',
  '@one-base-template/app-starter'
] as const;

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@one-base-template/tag/style': fileURLToPath(
        new URL('../../packages/tag/src/styles/global.scss', import.meta.url)
      )
    }
  },
  optimizeDeps: {
    // workspace 源码包不走预构建缓存，避免导出项变更后仍命中旧依赖快照。
    exclude: [...INTERNAL_WORKSPACE_PACKAGES]
  },
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: createOneAppManualChunks({
          appName: 'portal',
          featureChunks: [
            {
              name: 'portal-module',
              patterns: ['/apps/portal/src/modules/portal/']
            }
          ]
        })
      }
    }
  },
  server: {
    fs: {
      allow: [fileURLToPath(new URL('../../', import.meta.url))]
    }
  }
});
