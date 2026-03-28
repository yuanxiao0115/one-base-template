import { describe, expect, it } from 'vite-plus/test';

import { createDefaultDocumentTemplate } from '../schema/template';
import { DEFAULT_DOCUMENT_MATERIALS } from '../materials/default-materials';
import { createMaterialNode, useDocumentDesignerState } from '../designer/useDocumentDesignerState';

describe('document designer state', () => {
  it('应支持按节点回写 anchor', () => {
    const template = createDefaultDocumentTemplate();
    const node = createMaterialNode(DEFAULT_DOCUMENT_MATERIALS[0]!, 0);
    template.materials = [node];

    const state = useDocumentDesignerState(
      { value: template },
      { value: DEFAULT_DOCUMENT_MATERIALS }
    );

    state.updateNodeAnchor(node.id, {
      row: 3,
      col: 2,
      rowspan: 8,
      colspan: 12
    });

    expect(template.materials[0]?.anchor).toMatchObject({
      row: 3,
      col: 2,
      rowspan: 8,
      colspan: 12
    });
  });
});
