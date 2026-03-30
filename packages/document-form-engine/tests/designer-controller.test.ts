import { describe, expect, it } from 'vite-plus/test';

import {
  createDefaultDocumentTemplate,
  createDispatchDocumentTemplate,
  extractDesignerUniverSnapshotData
} from '../schema/template';
import { useDocumentDesignerController } from '../designer/useDocumentDesignerController';

describe('document designer controller', () => {
  it('替换外部模板后应回退到有效选区', () => {
    const controller = useDocumentDesignerController(createDispatchDocumentTemplate());

    controller.selectPlacement('placement-document-title');
    controller.replaceTemplate(createDefaultDocumentTemplate());

    expect(controller.selectedPlacementId.value).toBeNull();
    expect(controller.selectedPlacement.value).toBeNull();
    expect(controller.activeRange.value).toEqual({
      row: 1,
      col: 1,
      rowspan: 1,
      colspan: 1
    });
  });

  it('同步 Univer 快照时应生成新模板并写入 envelope', () => {
    const controller = useDocumentDesignerController(createDispatchDocumentTemplate());
    const previousTemplate = controller.template.value;

    controller.syncUniverSnapshot({
      workbook: {
        id: 'mock-workbook'
      }
    });

    expect(controller.template.value).not.toBe(previousTemplate);
    expect(extractDesignerUniverSnapshotData(previousTemplate.designer?.univerSnapshot)).toBeNull();
    expect(
      extractDesignerUniverSnapshotData(controller.template.value.designer?.univerSnapshot)
    ).toMatchObject({
      workbook: {
        id: 'mock-workbook'
      }
    });
  });

  it('视口值未变化时不应创建新模板引用', () => {
    const controller = useDocumentDesignerController(createDispatchDocumentTemplate());
    const currentTemplate = controller.template.value;

    controller.updateSheetViewport({
      zoom: currentTemplate.sheet.viewport.zoom
    });

    expect(controller.template.value).toBe(currentTemplate);
  });
});
