import type { CoreOptions } from '@one-base-template/core';

/**
 * 应用主题配置。
 *
 * 说明：
 * - 业务项目可直接替换/扩展本文件（新增主题、调整主色等）
 * - 这里只约定最小主题能力：primary 主色
 */
export const appThemeOptions: CoreOptions['theme'] = {
  defaultTheme: 'blue',
  themes: {
    blue: { primary: '#1677ff' },
    green: { primary: '#16a34a' },
    orange: { primary: '#f97316' }
  }
};

