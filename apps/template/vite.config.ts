import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';
import { createOneAppManualChunks } from '../../scripts/vite/manual-chunks';

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
    exclude: ['@one-base-template/ui']
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: createOneAppManualChunks({
          appName: 'template',
          featureChunks: [
            {
              name: 'template-home',
              patterns: ['/apps/template/src/modules/home/']
            },
            {
              name: 'template-demo',
              patterns: ['/apps/template/src/modules/demo/']
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
