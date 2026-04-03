import { ONE_BUILTIN_THEMES, type ThemeConfig, type ThemePrimaryScale } from '@one-base-template/core';

const ADMIN_PURPLE_SCALE: ThemePrimaryScale = {
  /** 一级浅色 */
  light1: '#F3EBFF',
  /** 二级浅色 */
  light2: '#E1CCFF',
  /** 三级浅色 */
  light3: '#CFAAFF',
  /** 四级浅色 */
  light4: '#B887FF',
  /** 五级浅色 */
  light5: '#9F65FF',
  /** 六级浅色 */
  light6: '#8745F2',
  /** 七级浅色 */
  light7: '#7A3EE0',
  /** 八级浅色 */
  light8: '#6933C7',
  /** 九级浅色 */
  light9: '#592AAE'
};

/** 主题配置 */
export const theme: ThemeConfig = {
  /** 默认主题 */
  defaultTheme: 'blue',
  /** 是否允许自定义主色 */
  allowCustomPrimary: true,
  /** 主题列表 */
  themes: {
    ...ONE_BUILTIN_THEMES,
    /** 管理橙主题 */
    adminOrange: {
      name: '管理橙',
      primary: '#FF7D00'
    },
    /** 管理紫主题 */
    adminPurple: {
      name: '管理紫',
      primary: '#7A3EE0',
      primaryScale: { ...ADMIN_PURPLE_SCALE }
    }
  }
};
