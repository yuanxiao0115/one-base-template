import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

const base = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: [
    // monorepo 下 Vite 的 cwd 可能不在 apps/admin，显式指定 base，保证能找到 tailwind.config.ts
    tailwindcss({ base }),
    autoprefixer()
  ]
};
