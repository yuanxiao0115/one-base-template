import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { mix } from '../utils/color';

const THEME_KEY = 'sb_theme';

export interface ThemeOptions {
  defaultTheme: string;
  themes: Record<string, { primary: string }>;
}

function setCssVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

function applyElementPlusPrimary(primary: string) {
  // Element Plus 主色及派生色（light-3/5/7/8/9 + dark-2）
  setCssVar('--el-color-primary', primary);

  const white = '#ffffff';
  const black = '#000000';

  const lights: Array<[string, number]> = [
    ['--el-color-primary-light-3', 0.3],
    ['--el-color-primary-light-5', 0.5],
    ['--el-color-primary-light-7', 0.7],
    ['--el-color-primary-light-8', 0.8],
    ['--el-color-primary-light-9', 0.9]
  ];
  for (const [name, ratio] of lights) {
    setCssVar(name, mix(primary, white, ratio));
  }

  setCssVar('--el-color-primary-dark-2', mix(primary, black, 0.2));
}

export const useThemeStore = defineStore('sb-theme', () => {
  const themes = ref<ThemeOptions['themes']>({});
  const themeKey = ref<string>('');

  const currentPrimary = computed(() => themes.value[themeKey.value]?.primary);

  function init(options: ThemeOptions) {
    themes.value = options.themes;

    const saved = localStorage.getItem(THEME_KEY);
    const initial = saved && themes.value[saved] ? saved : options.defaultTheme;
    setTheme(initial);
  }

  function setTheme(key: string) {
    if (!themes.value[key]) {
      // 脚手架阶段直接报错，避免静默失败
      throw new Error(`[theme] 未定义主题: ${key}`);
    }

    themeKey.value = key;
    localStorage.setItem(THEME_KEY, key);

    const primary = themes.value[key].primary;
    applyElementPlusPrimary(primary);
  }

  return {
    themes,
    themeKey,
    currentPrimary,
    init,
    setTheme
  };
});
