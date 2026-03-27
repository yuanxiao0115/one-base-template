import { describe, expect, it } from 'vite-plus/test';
import {
  createDocumentFormEngineContext,
  createDocumentRuntimeRenderer,
  createDefaultDocumentTemplate
} from '../index';

describe('document runtime renderer', () => {
  it('应将节点 props 与默认物料 props 合并成运行态模型', () => {
    const context = createDocumentFormEngineContext({ appId: 'runtime-test' });
    const renderer = createDocumentRuntimeRenderer(context);
    const template = createDefaultDocumentTemplate();

    template.materials.push({
      id: 'opinion-1',
      type: 'OpinionBlock',
      title: '会签意见',
      anchor: {
        row: 1,
        col: 1,
        rowspan: 6,
        colspan: 24
      },
      props: {
        roleLabel: '会签意见'
      }
    });

    const renderModel = renderer.buildRenderModel(template);

    expect(renderModel).toHaveLength(1);
    expect(renderModel[0]?.componentProps).toMatchObject({
      roleCode: 'draft',
      roleLabel: '会签意见',
      signatureMode: 'image'
    });
  });
});
