import { describe, expect, it } from 'vite-plus/test';

import {
  createDocumentFormEngineContext,
  getDocumentFieldWidgetDefinition,
  registerDocumentFieldWidgets
} from '../index';

describe('document field widget registry', () => {
  it('应允许通过 context 覆盖字段组件定义', () => {
    const context = createDocumentFormEngineContext({ appId: 'field-widget-test' });
    const customRuntime = {
      name: 'CustomTextareaRuntime',
      render() {
        return null;
      }
    };

    registerDocumentFieldWidgets(context, [
      {
        type: 'textarea',
        label: '长文本',
        runtimeRenderer: customRuntime,
        previewRenderer: customRuntime,
        printRenderer: customRuntime,
        defaultWidgetProps: {
          placeholder: '请输入长文本'
        }
      }
    ]);

    const definition = getDocumentFieldWidgetDefinition('textarea', context);

    expect(definition?.runtimeRenderer).toBe(customRuntime);
    expect(definition?.defaultWidgetProps).toMatchObject({
      placeholder: '请输入长文本'
    });
  });
});
