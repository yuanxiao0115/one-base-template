import { describe, expect, it } from 'vite-plus/test';
import {
  createDocumentFormEngineContext,
  getDocumentMaterials,
  registerDocumentMaterials
} from '../index';

describe('document material registry', () => {
  it('应允许通过 context 覆盖同 type 物料定义', () => {
    const context = createDocumentFormEngineContext({ appId: 'unit-test' });

    registerDocumentMaterials(context, [
      {
        type: 'BodyBlock',
        label: '正文扩展',
        description: '扩展正文',
        icon: 'ri:test-tube-line',
        defaultSize: {
          rowspan: 10,
          colspan: 24
        },
        defaultProps: {
          placeholder: '扩展正文'
        },
        propertySchema: [],
        designerPreview: {
          name: 'BodyBlockDesignerStub',
          render() {
            return null;
          }
        },
        runtimeRenderer: {
          name: 'BodyBlockRuntimeStub',
          render() {
            return null;
          }
        },
        printRenderer: {
          name: 'BodyBlockPrintStub',
          render() {
            return null;
          }
        }
      }
    ]);

    const bodyBlock = getDocumentMaterials(context).find((item) => item.type === 'BodyBlock');

    expect(bodyBlock?.label).toBe('正文扩展');
    expect(bodyBlock?.defaultProps).toMatchObject({
      placeholder: '扩展正文'
    });
  });
});
