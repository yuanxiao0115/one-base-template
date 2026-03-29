import { describe, expect, it } from 'vite-plus/test';

import {
  createDispatchDocumentTemplate,
  createDocumentPrintRenderer,
  createDocumentRuntimeRenderer
} from '../index';

describe('document runtime preview model', () => {
  it('应构建可供真实预览消费的表格模型', () => {
    const template = createDispatchDocumentTemplate();
    const renderer = createDocumentRuntimeRenderer();
    const renderModel = renderer.buildRenderModel(template);

    expect(renderModel.rows.length).toBe(template.sheet.rows);
    expect(renderModel.rows[0]?.cells.length).toBeGreaterThan(0);
    expect(
      renderModel.rows.some((row) =>
        row.cells.some((cell) => cell.placement?.field.type === 'richText')
      )
    ).toBe(true);
  });

  it('打印态应复用同一份运行态模型', () => {
    const template = createDispatchDocumentTemplate();
    const runtimeModel = createDocumentRuntimeRenderer().buildRenderModel(template);
    const printModel = createDocumentPrintRenderer().buildPrintModel(template);

    expect(printModel).toEqual(runtimeModel);
  });
});
