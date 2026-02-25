import { ONE_BUILTIN_THEMES, type CoreOptions, type ThemePrimaryScale } from '@one-base-template/core';

const ADMIN_PURPLE_SCALE: ThemePrimaryScale = {
  light1: '#F3EBFF',
  light2: '#E1CCFF',
  light3: '#CFAAFF',
  light4: '#B887FF',
  light5: '#9F65FF',
  light6: '#8745F2',
  light7: '#7A3EE0',
  light8: '#6933C7',
  light9: '#592AAE'
};

/**
 * 应用主题配置。
 *
 * 说明：
 * - 主题能力下沉到 core：这里仅做项目注册
 * - 支持“内置主题 + 自定义主色（互斥）”
 * - 自定义主色仅影响 primary 色阶，状态色保持固定
 */
export const appThemeOptions: CoreOptions['theme'] = {
  defaultTheme: 'blue',
  allowCustomPrimary: true,
  themes: {
    ...ONE_BUILTIN_THEMES,
    // 管理橙（admin 项目自定义主题）
    adminOrange: {
      name: '管理橙',
      primary: '#FF7D00'
    },
    // 管理紫（admin 自定义固定色阶，不走预设和动态主色计算）
    adminPurple: {
      name: '管理紫',
      primary: '#7A3EE0',
      primaryScale: { ...ADMIN_PURPLE_SCALE }
    }
  }
};
