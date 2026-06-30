import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { defineConfig } from 'vite-plus';

const externalPackages = [
  '@iconify-json/ep',
  '@iconify-json/ri',
  '@iconify/vue',
  '@one-base-template/core',
  '@one-base-template/tag',
  '@wangeditor/editor',
  '@wangeditor/editor-for-vue',
  '@vue-office/docx',
  '@vue-office/excel',
  '@vue-office/pdf',
  '@vue-office/pptx',
  'element-plus',
  'gm-crypto',
  'ofdview-vue3',
  'parser_x.js',
  'pinia',
  'sortablejs',
  'vue',
  'vue-router',
  'vxe-pc-ui',
  'vxe-table'
];
const isExternal = (id: string) =>
  externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        obtable: resolve(import.meta.dirname, 'src/obtable.ts'),
        vxe: resolve(import.meta.dirname, 'src/vxe.ts'),
        lite: resolve(import.meta.dirname, 'src/lite.ts'),
        'lite-auth': resolve(import.meta.dirname, 'src/lite-auth.ts'),
        shell: resolve(import.meta.dirname, 'src/shell.ts')
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: isExternal,
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css') ? 'style.css' : 'assets/[name][extname]',
        exports: 'named'
      },
      treeshake: true
    },
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src')
    }
  }
});
