import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  corePlugins: {
    preflight: false
  },
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}',
    '../../packages/ui/src/**/*.{vue,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg_color: 'var(--el-bg-color)',
        primary: 'var(--el-color-primary)',
        text_color_primary: 'var(--el-text-color-primary)',
        text_color_regular: 'var(--el-text-color-regular)'
      }
    }
  }
} satisfies Config;
