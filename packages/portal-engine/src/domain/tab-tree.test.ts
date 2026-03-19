import { describe, expect, it } from 'vite-plus/test';

import {
  calcPortalTabNextSort,
  containsPortalTabId,
  findFirstPortalPageTabId,
  findPortalTabById,
  isPortalTabEditable,
  normalizePortalTabId,
  normalizePortalTabName
} from './tab-tree';

interface MockPortalTab {
  id?: string | number;
  parentId?: string | number;
  tabType?: number;
  sort?: number;
  tabOrder?: number;
  order?: number;
  tabName?: string;
  children?: MockPortalTab[];
}

function createTabs(): MockPortalTab[] {
  return [
    {
      id: 'group-1',
      tabType: 1,
      children: [
        {
          id: 'page-1',
          parentId: 'group-1',
          tabType: 2,
          sort: 3,
          tabName: '首页'
        }
      ]
    },
    {
      id: 'link-1',
      tabType: 3,
      parentId: 0,
      sort: 1
    }
  ];
}

describe('portal tab tree domain', () => {
  it('应识别可编辑页面类型', () => {
    expect(isPortalTabEditable(2)).toBe(true);
    expect(isPortalTabEditable('2')).toBe(true);
    expect(isPortalTabEditable(1)).toBe(false);
  });

  it('应规范化 tabId 与 tabName', () => {
    expect(normalizePortalTabId(123)).toBe('123');
    expect(normalizePortalTabId('abc')).toBe('abc');
    expect(normalizePortalTabId(null)).toBe('');

    expect(normalizePortalTabName('  名称  ', '默认')).toBe('名称');
    expect(normalizePortalTabName('', '默认')).toBe('默认');
  });

  it('应查找首个可编辑页面和节点', () => {
    const tabs = createTabs();

    expect(findFirstPortalPageTabId(tabs)).toBe('page-1');
    expect(findPortalTabById(tabs, 'page-1')?.tabType).toBe(2);
    expect(findPortalTabById(tabs, 'missing')).toBeNull();
  });

  it('应判断树中是否包含目标 tabId', () => {
    const tabs = createTabs();

    expect(containsPortalTabId(tabs, 'page-1')).toBe(true);
    expect(containsPortalTabId(tabs, 'missing')).toBe(false);
  });

  it('应计算同父级下一个排序值', () => {
    const tabs = createTabs();

    expect(calcPortalTabNextSort(tabs, 'group-1')).toBe(4);
    expect(calcPortalTabNextSort(tabs, 0)).toBe(2);
  });
});
