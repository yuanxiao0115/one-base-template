import { describe, expect, it } from 'vite-plus/test';
import {
  hasLayoutGeometryChanged,
  mergeLayoutItems,
  type LayoutUpdateItem,
  type PortalLayoutItem
} from '@one-base-template/portal-engine';

describe('GridLayout 同步守卫', () => {
  it('相同几何布局不应判定为变更，且应保留旧 component 配置', () => {
    const prev: PortalLayoutItem[] = [
      {
        i: 'a',
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        component: {
          cmptConfig: {
            index: { name: 'cms-rich-text' }
          }
        }
      }
    ];

    const next: LayoutUpdateItem[] = [
      {
        i: 'a',
        x: 0,
        y: 0,
        w: 6,
        h: 4
      }
    ];

    const merged = mergeLayoutItems(prev, next);
    expect(merged[0]?.component).toEqual(prev[0]?.component);
    expect(hasLayoutGeometryChanged(prev, merged)).toBe(false);
  });

  it('布局坐标变化时应判定为变更', () => {
    const prev: PortalLayoutItem[] = [
      { i: 'a', x: 0, y: 0, w: 6, h: 4 },
      { i: 'b', x: 6, y: 0, w: 6, h: 4 }
    ];
    const next: LayoutUpdateItem[] = [
      { i: 'a', x: 0, y: 0, w: 6, h: 4 },
      { i: 'b', x: 4, y: 0, w: 6, h: 4 }
    ];

    const merged = mergeLayoutItems(prev, next);
    expect(hasLayoutGeometryChanged(prev, merged)).toBe(true);
  });
});
