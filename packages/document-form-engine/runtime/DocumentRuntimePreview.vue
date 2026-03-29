<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

import type { DocumentFormEngineContext } from '../register/context';
import { createDocumentFormEngineContext } from '../register/context';
import type { DocumentSheetStyle } from '../schema/sheet';
import type { DocumentTemplateSchema } from '../schema/types';
import { createDocumentRuntimeRenderer } from './renderer';

defineOptions({
  name: 'DocumentRuntimePreview'
});

const props = withDefaults(
  defineProps<{
    context?: DocumentFormEngineContext;
    template: DocumentTemplateSchema;
    readonly?: boolean;
  }>(),
  {
    readonly: true
  }
);

const internalContext = computed(
  () => props.context ?? createDocumentFormEngineContext({ appId: 'document-form-preview' })
);
const renderer = computed(() => createDocumentRuntimeRenderer(internalContext.value));
const renderModel = computed(() => renderer.value.buildRenderModel(props.template));

function resolveColumnWidth(index: number) {
  return (
    renderModel.value.sheet.columnWidths[String(index)] ??
    Math.floor(renderModel.value.page.width / renderModel.value.sheet.columns)
  );
}

function resolveCellStyle(style: DocumentSheetStyle | null): CSSProperties {
  return {
    padding: '6px 8px',
    background: style?.backgroundColor ?? '#ffffff',
    color: style?.textColor ?? '#0f172a',
    fontSize: style?.fontSize ? `${style.fontSize}px` : '13px',
    fontWeight: style?.fontWeight ?? 'normal',
    textAlign: style?.horizontalAlign ?? 'left',
    verticalAlign: style?.verticalAlign ?? 'middle',
    whiteSpace: style?.wrap ? 'pre-wrap' : 'normal',
    borderTop: style?.border?.top
      ? `${style.border.top.width}px solid ${style.border.top.color}`
      : '1px solid #d5deea',
    borderRight: style?.border?.right
      ? `${style.border.right.width}px solid ${style.border.right.color}`
      : '1px solid #d5deea',
    borderBottom: style?.border?.bottom
      ? `${style.border.bottom.width}px solid ${style.border.bottom.color}`
      : '1px solid #d5deea',
    borderLeft: style?.border?.left
      ? `${style.border.left.width}px solid ${style.border.left.color}`
      : '1px solid #d5deea'
  };
}
</script>

<template>
  <section class="runtime-preview">
    <div class="runtime-preview__page">
      <table class="runtime-preview__table">
        <colgroup>
          <col
            v-for="index in renderModel.sheet.columns"
            :key="index"
            :style="{ width: `${resolveColumnWidth(index)}px` }"
          />
        </colgroup>
        <tbody>
          <tr
            v-for="row in renderModel.rows"
            :key="row.index"
            :style="{ height: `${row.height}px` }"
          >
            <td
              v-for="cell in row.cells"
              :key="cell.key"
              :rowspan="cell.rowspan"
              :colspan="cell.colspan"
              :style="resolveCellStyle(cell.style)"
            >
              <component
                :is="cell.placement.runtimeRenderer"
                v-if="cell.placement"
                :field="cell.placement.field"
                :readonly="props.readonly"
                :model-value="cell.placement.field.defaultValue"
                :options="cell.placement.options"
                v-bind="cell.placement.componentProps"
              />
              <span v-else>{{ cell.value }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.runtime-preview {
  display: flex;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(180deg, rgb(226 232 240 / 40%) 0%, rgb(241 245 249 / 90%) 100%);
  overflow: auto;
}

.runtime-preview__page {
  width: 794px;
  min-height: 1123px;
  padding: 18px;
  border: 1px solid #d6deea;
  background: #fff;
  box-shadow: 0 18px 48px -30px rgb(15 23 42 / 45%);
}

.runtime-preview__table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.runtime-preview__table td {
  min-width: 0;
}

:deep(.document-field-widget) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

:deep(.document-field-widget__label) {
  color: #334155;
  font-size: 12px;
  font-weight: 600;
}

:deep(.document-field-widget__input),
:deep(.document-field-widget__textarea),
:deep(.document-field-widget__select) {
  width: 100%;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  padding: 6px 8px;
  font-size: 13px;
}

:deep(.document-field-widget__textarea) {
  resize: vertical;
}

:deep(.document-field-widget__choices) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
}

:deep(.document-field-widget__choice) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-size: 13px;
}

:deep(.document-field-widget__rich-text) {
  min-height: 180px;
  border: 1px solid #cbd5e1;
  padding: 10px;
  background: #fff;
  white-space: pre-wrap;
}

:deep(.document-field-widget__attachment),
:deep(.document-field-widget__stamp) {
  display: flex;
  min-height: 96px;
  align-items: center;
  justify-content: center;
  border: 1px dashed #94a3b8;
  background: #f8fafc;
  color: #64748b;
}

:deep(.document-field-widget__opinion) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.document-field-widget__meta) {
  color: #64748b;
  font-size: 12px;
  text-align: right;
}
</style>
