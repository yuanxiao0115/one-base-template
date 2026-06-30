import { resolve } from 'node:path';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js'
    },
    rollupOptions: {
      output: {
        exports: 'named'
      },
      treeshake: true
    },
    emptyOutDir: true,
    sourcemap: false
  }
});
