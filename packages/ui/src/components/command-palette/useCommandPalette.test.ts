import type { AppMenuItem } from '@one-base-template/core';
import { describe, expect, it, beforeEach } from 'vite-plus/test';
import {
  buildCommandPaletteItemsFromMenus,
  filterCommandPaletteItems,
  useCommandPalette
} from './useCommandPalette';

const DEMO_MENUS: AppMenuItem[] = [
  {
    path: '/home/index',
    title: '首页',
    children: []
  },
  {
    path: '/system',
    title: '系统管理',
    children: [
      {
        path: '/system/user',
        title: '用户管理',
        children: []
      },
      {
        path: '/system/role',
        title: '角色管理',
        children: []
      },
      {
        path: 'https://docs.example.com',
        title: '外部文档',
        external: true,
        children: []
      }
    ]
  }
];

describe('command-palette helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('应将菜单树转换为可搜索条目，默认不包含 external 菜单', () => {
    const items = buildCommandPaletteItemsFromMenus(DEMO_MENUS);
    expect(items.map((item) => item.path)).toEqual([
      '/home/index',
      '/system',
      '/system/user',
      '/system/role'
    ]);

    const userMenu = items.find((item) => item.path === '/system/user');
    expect(userMenu?.parentTitles).toEqual(['系统管理']);
  });

  it('includeExternal=true 时应包含外链菜单', () => {
    const items = buildCommandPaletteItemsFromMenus(DEMO_MENUS, {
      includeExternal: true
    });
    expect(items.some((item) => item.path === 'https://docs.example.com')).toBe(true);
  });

  it('应支持按标题和路径过滤', () => {
    const items = buildCommandPaletteItemsFromMenus(DEMO_MENUS);
    expect(filterCommandPaletteItems(items, '用户').map((item) => item.path)).toEqual([
      '/system/user'
    ]);
    expect(filterCommandPaletteItems(items, '/system/role').map((item) => item.path)).toEqual([
      '/system/role'
    ]);
  });
});

describe('useCommandPalette', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('应维护历史记录并支持清空', () => {
    const items = buildCommandPaletteItemsFromMenus(DEMO_MENUS);
    const palette = useCommandPalette(() => items, {
      historyKeyBase: 'ob_command_palette_history_unit',
      maxHistory: 2
    });

    const home = items.find((item) => item.path === '/home/index');
    const user = items.find((item) => item.path === '/system/user');
    if (!(home && user)) {
      throw new Error('missing demo items');
    }

    palette.recordHistory(home);
    palette.recordHistory(user);
    palette.recordHistory(home);

    expect(palette.historyItems.value.map((item) => item.path)).toEqual([
      '/home/index',
      '/system/user'
    ]);

    palette.clearHistory();
    expect(palette.historyItems.value).toEqual([]);
  });

  it('应支持关键字过滤和激活项切换', () => {
    const items = buildCommandPaletteItemsFromMenus(DEMO_MENUS);
    const palette = useCommandPalette(() => items);

    palette.open();
    palette.setKeyword('管理');

    expect(palette.activeItems.value.length).toBeGreaterThan(0);
    const firstItemPath = palette.getActiveItem()?.path;
    palette.moveActive(1);
    const secondItemPath = palette.getActiveItem()?.path;

    expect(firstItemPath).not.toBe(secondItemPath);
  });
});
