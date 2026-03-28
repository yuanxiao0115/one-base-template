import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_DOCUMENT_MATERIALS } from '../materials/default-materials';
import { createDefaultDocumentTemplate } from '../schema/template';
import {
  buildCanvasMaterialCells,
  resolveCanvasGridMetrics
} from '../designer/canvas-render-model';

describe('designer canvas render flow', () => {
  it('应将模板节点转换为画布渲染单元', () => {
    const template = createDefaultDocumentTemplate();
    template.materials = [
      {
        id: 'body-1',
        type: 'BodyBlock',
        title: '正文区',
        anchor: {
          row: 1,
          col: 1,
          rowspan: 6,
          colspan: 24
        },
        props: {
          placeholder: '请输入正文'
        }
      }
    ];

    const cells = buildCanvasMaterialCells(template, DEFAULT_DOCUMENT_MATERIALS, 'body-1');

    expect(cells).toHaveLength(1);
    expect(cells[0]).toMatchObject({
      nodeId: 'body-1',
      isActive: true,
      label: '正文 · 正文区',
      range: {
        startRow: 0,
        startColumn: 0,
        endRow: 5,
        endColumn: 23
      }
    });
  });

  it('应在网格边界外自动裁剪为有效区域', () => {
    const template = createDefaultDocumentTemplate();
    template.page.minHeight = 200;
    template.grid.columns = 4;
    template.grid.rowHeight = 20;
    template.materials = [
      {
        id: 'meta-1',
        type: 'MetaInfoBlock',
        title: '元信息',
        anchor: {
          row: 12,
          col: 5,
          rowspan: 3,
          colspan: 3
        },
        props: {
          fieldsLabel: '拟稿人'
        }
      }
    ];

    const metrics = resolveCanvasGridMetrics(template);
    const cells = buildCanvasMaterialCells(template, DEFAULT_DOCUMENT_MATERIALS, null);

    expect(metrics).toMatchObject({
      maxRows: 10,
      maxColumns: 4
    });
    expect(cells[0]?.range).toMatchObject({
      startRow: 9,
      endRow: 9,
      startColumn: 3,
      endColumn: 3
    });
  });
});
