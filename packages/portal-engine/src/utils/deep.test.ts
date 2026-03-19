import { describe, expect, it } from 'vite-plus/test';

import { deepClone } from './deep';

describe('portal-engine deepClone', () => {
  it('应在存在不可结构化克隆值时降级克隆而不抛错', () => {
    const source = {
      index: {
        name: 'cms-notice'
      },
      content: {
        // 模拟物料配置里混入的不可克隆字段
        transform: () => 'noop'
      },
      style: {
        color: '#333333'
      }
    };

    expect(() => deepClone(source)).not.toThrow();

    const cloned = deepClone(source) as {
      index?: { name?: string };
      content?: { transform?: unknown };
      style?: { color?: string };
    };

    expect(cloned.index?.name).toBe('cms-notice');
    expect(cloned.style?.color).toBe('#333333');
    // 不可克隆字段会被剔除，避免 structuredClone 在运行时抛错
    expect(cloned.content?.transform).toBeUndefined();
  });
});
