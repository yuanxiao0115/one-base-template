import { describe, expect, it } from 'vite-plus/test';
import {
  MENU_ICONFONT_SOURCE_MAP,
  MENU_ICONFONT_SOURCES,
  buildMenuIconfontValue,
  normalizeIconfontClass
} from './menu-iconfont-sources';

describe('menu-iconfont-sources', () => {
  it('应保持图标源顺序稳定，避免下拉配置顺序漂移', () => {
    expect(MENU_ICONFONT_SOURCES.map((item) => item.key)).toEqual(['cp', 'dj', 'om', 'od']);
  });

  it('应在缺失前缀时自动补齐 classPrefix', () => {
    expect(normalizeIconfontClass(MENU_ICONFONT_SOURCE_MAP.cp, 'menu-home')).toBe('icon-menu-home');
    expect(normalizeIconfontClass(MENU_ICONFONT_SOURCE_MAP.dj, 'dj-icon-user')).toBe(
      'dj-icon-user'
    );
  });

  it('应在空值场景返回空字符串，避免拼接脏 class', () => {
    expect(normalizeIconfontClass(MENU_ICONFONT_SOURCE_MAP.om, '   ')).toBe('');
    expect(buildMenuIconfontValue(MENU_ICONFONT_SOURCE_MAP.om, '   ')).toBe('');
  });

  it('应按“基础类 + 业务类”拼装菜单 iconfont 值', () => {
    expect(buildMenuIconfontValue(MENU_ICONFONT_SOURCE_MAP.od, 'setting')).toBe(
      'iconfont-od icon-setting'
    );
  });
});
