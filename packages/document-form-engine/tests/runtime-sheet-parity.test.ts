import { describe, expect, it } from 'vite-plus/test';
import { createDefaultDocumentTemplate } from '../schema/template';
import { createDocumentPrintRenderer } from '../runtime/print-renderer';
import { createDocumentSheetRenderer } from '../runtime/sheet-renderer';

describe('document runtime sheet parity', () => {
  it('运行态与打印态应共享同一份 sheet 渲染模型', () => {
    const template = createDefaultDocumentTemplate();
    template.materials = [
      {
        id: 'body-1',
        type: 'BodyBlock',
        title: '正文',
        anchor: {
          row: 2,
          col: 2,
          rowspan: 6,
          colspan: 20
        },
        props: {
          placeholder: '请填写正文'
        }
      },
      {
        id: 'stamp-1',
        type: 'StampBlock',
        title: '签章区',
        anchor: {
          row: 10,
          col: 14,
          rowspan: 5,
          colspan: 8
        },
        props: {}
      }
    ];
    template.sheet.merges.push({
      row: 2,
      col: 2,
      rowspan: 1,
      colspan: 20
    });
    template.sheet.styles.push({
      row: 2,
      col: 2,
      rowspan: 6,
      colspan: 20,
      backgroundColor: '#eff6ff',
      textColor: '#1e3a8a'
    });

    const runtimeModel = createDocumentSheetRenderer().buildSheetRenderModel(template);
    const printModel = createDocumentPrintRenderer().buildPrintModel(template);

    expect(runtimeModel.merges).toHaveLength(1);
    expect(runtimeModel.cells).toHaveLength(2);
    expect(runtimeModel.cells[0]?.sheetStyle).toMatchObject({
      backgroundColor: '#eff6ff',
      textColor: '#1e3a8a'
    });
    expect(printModel).toEqual(runtimeModel);
  });

  it('当模板未配置区域样式时应回退到物料 stylePreset', () => {
    const template = createDefaultDocumentTemplate();
    template.materials = [
      {
        id: 'meta-1',
        type: 'MetaInfoBlock',
        title: '元信息',
        anchor: {
          row: 1,
          col: 1,
          rowspan: 4,
          colspan: 12
        },
        props: {}
      }
    ];

    const runtimeModel = createDocumentSheetRenderer().buildSheetRenderModel(template);

    expect(runtimeModel.cells).toHaveLength(1);
    expect(runtimeModel.cells[0]?.sheetStyle.border?.top?.color).toBeTruthy();
    expect(runtimeModel.cells[0]?.sheetStyle.backgroundColor).toBe('#f8fafc');
  });
});
