import { describe, expect, it } from 'vite-plus/test';
import { ref } from 'vue';

import { createDefaultDocumentTemplate, createDispatchDocumentTemplate } from '../schema/template';
import { useDocumentDesignerState } from '../designer/useDocumentDesignerState';

describe('document designer state', () => {
  it('应在当前选区插入字段并自动选中新放置区域', () => {
    const templateRef = ref(createDispatchDocumentTemplate());
    const state = useDocumentDesignerState(templateRef);

    state.setActiveRange({
      row: 42,
      col: 6,
      rowspan: 2,
      colspan: 8
    });
    state.insertField('text');

    const field = templateRef.value.fields.at(-1);
    const placement = templateRef.value.placements.at(-1);

    expect(field).toMatchObject({
      type: 'text',
      label: '文本'
    });
    expect(placement).toMatchObject({
      fieldId: field?.id,
      range: {
        row: 42,
        col: 6,
        rowspan: 2,
        colspan: 8
      }
    });
    expect(state.selectedPlacement.value?.id).toBe(placement?.id);
  });

  it('应支持更新当前字段配置与选项', () => {
    const templateRef = ref(createDispatchDocumentTemplate());
    const state = useDocumentDesignerState(templateRef);

    state.selectPlacement('placement-document-title');
    state.updateSelectedField({
      label: '公文标题',
      required: true,
      widgetProps: {
        placeholder: '请输入公文标题'
      }
    });
    state.updateSelectedFieldOptions([
      { label: '普通件', value: 'normal' },
      { label: '加急件', value: 'urgent' }
    ]);

    expect(state.selectedField.value).toMatchObject({
      id: 'documentTitle',
      label: '公文标题',
      required: true,
      dataSource: {
        kind: 'static',
        options: [
          { label: '普通件', value: 'normal' },
          { label: '加急件', value: 'urgent' }
        ]
      }
    });
    expect(state.selectedField.value?.widgetProps).toMatchObject({
      placeholder: '请输入公文标题'
    });
  });

  it('应支持删除当前字段及其放置区域', () => {
    const templateRef = ref(createDispatchDocumentTemplate());
    const state = useDocumentDesignerState(templateRef);

    state.selectPlacement('placement-document-title');
    state.removeSelectedPlacement();

    expect(
      templateRef.value.placements.find((item) => item.id === 'placement-document-title')
    ).toBeUndefined();
    expect(templateRef.value.fields.find((item) => item.id === 'documentTitle')).toBeUndefined();
    expect(state.selectedPlacement.value?.id).toBe(templateRef.value.placements[0]?.id);
  });

  it('应支持重置回发文单预设', () => {
    const templateRef = ref(createDefaultDocumentTemplate());
    const state = useDocumentDesignerState(templateRef);

    state.resetToDispatchPreset();

    expect(templateRef.value.title).toBe('发文单示例模板');
    expect(templateRef.value.placements).not.toHaveLength(0);
    expect(state.selectedPlacement.value?.id).toBe(templateRef.value.placements[0]?.id);
    expect(state.activeRange.value).toMatchObject(templateRef.value.placements[0]?.range ?? {});
  });
});
