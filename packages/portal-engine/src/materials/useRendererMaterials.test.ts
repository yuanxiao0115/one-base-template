import { describe, expect, it } from 'vitest';

import { useMaterials } from './useMaterials';
import { useEditorMaterials } from './useEditorMaterials';
import { useRendererMaterials } from './useRendererMaterials';

describe('portal material loaders', () => {
  it('renderer 只加载运行态 index 组件', () => {
    const { materialsMap } = useRendererMaterials();

    expect(materialsMap['base-notice-index']).toBeDefined();
    expect(materialsMap['base-notice-content']).toBeUndefined();
    expect(materialsMap['base-notice-style']).toBeUndefined();
    expect(Object.keys(materialsMap).some((name) => /-(content|style)$/.test(name))).toBe(false);
  });

  it('editor 加载 index/content/style 全量组件', () => {
    const { materialsMap } = useEditorMaterials();

    expect(materialsMap['base-notice-index']).toBeDefined();
    expect(materialsMap['base-notice-content']).toBeDefined();
    expect(materialsMap['base-notice-style']).toBeDefined();
  });

  it('兼容 useMaterials 仍保持编辑态加载行为', () => {
    const { materialsMap } = useMaterials();

    expect(materialsMap['base-notice-content']).toBeDefined();
    expect(materialsMap['base-notice-style']).toBeDefined();
  });
});
