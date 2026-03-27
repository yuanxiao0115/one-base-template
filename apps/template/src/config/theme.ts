import { type CoreOptions, ONE_BUILTIN_THEMES } from '@one-base-template/core';

/**
 * template 主题配置。
 */
export const appThemeOptions: CoreOptions['theme'] = {
  defaultTheme: 'blue',
  allowCustomPrimary: true,
  themes: {
    ...ONE_BUILTIN_THEMES
  }
};
