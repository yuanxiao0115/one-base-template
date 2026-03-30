import { describe, expect, it } from 'vite-plus/test';
import { ref } from 'vue';

import { createDispatchDocumentTemplate } from '../schema/template';
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

  it('应支持更新画布视口配置', () => {
    const templateRef = ref(createDispatchDocumentTemplate());
    const state = useDocumentDesignerState(templateRef);

    state.updateSheetViewport({
      showGrid: true,
      zoom: 125
    });

    expect(templateRef.value.sheet.viewport.showGrid).toBe(true);
    expect(templateRef.value.sheet.viewport.zoom).toBe(125);
  });

  it('视口参数未变化时不应重复写入', () => {
    const templateRef = ref(createDispatchDocumentTemplate());
    const state = useDocumentDesignerState(templateRef);
    const currentViewport = templateRef.value.sheet.viewport;

    state.updateSheetViewport({
      zoom: currentViewport.zoom
    });

    expect(templateRef.value.sheet.viewport).toBe(currentViewport);
  });

  it('当前选中区域失效时应回退到首个有效 placement', () => {
    const templateRef = ref(createDispatchDocumentTemplate());
    const state = useDocumentDesignerState(templateRef);

    state.selectPlacement('placement-document-title');
    templateRef.value.placements = templateRef.value.placements.filter(
      (item) => item.id !== 'placement-document-title'
    );

    state.syncSelectionState();

    expect(state.selectedPlacement.value?.id).toBe(templateRef.value.placements[0]?.id);
    expect(state.activeRange.value).toEqual(templateRef.value.placements[0]?.range);
  });
});
