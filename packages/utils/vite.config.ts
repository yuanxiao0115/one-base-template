import { resolve } from 'node:path';
import { defineConfig } from 'vite-plus';

const externalPackages = ['crypto-js', 'dayjs', 'gm-crypto', 'js-cookie', 'sm-crypto', 'vue'];
const isExternal = (id: string) =>
  externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js'
    },
    rollupOptions: {
      external: isExternal,
      output: {
        exports: 'named'
      },
      treeshake: true
    },
    emptyOutDir: true,
    sourcemap: false
  }
});
