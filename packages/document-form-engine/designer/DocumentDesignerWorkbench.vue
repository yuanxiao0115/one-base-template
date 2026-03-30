<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import type {
  DocumentTemplateField,
  DocumentTemplatePlacement,
  DocumentTemplateSchema
} from '../schema/types';
import {
  createDefaultDocumentTemplate,
  createDesignerUniverSnapshotEnvelope,
  normalizeDocumentTemplate
} from '../schema/template';
import type { DocumentSheetRange } from '../schema/sheet';
import DocumentCanvas from './DocumentCanvas.vue';
import DocumentPropertyInspector from './DocumentPropertyInspector.vue';
import {
  DOCUMENT_DESIGNER_FIELD_BLUEPRINTS,
  useDocumentDesignerState
} from './useDocumentDesignerState';

defineOptions({
  name: 'DocumentDesignerWorkbench'
});

const props = withDefaults(
  defineProps<{
    modelValue?: DocumentTemplateSchema;
    title?: string;
  }>(),
  {
    modelValue: () => createDefaultDocumentTemplate(),
    title: '公文表单设计器'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: DocumentTemplateSchema): void;
}>();

const template = ref<DocumentTemplateSchema>(normalizeDocumentTemplate(props.modelValue));
const syncingFromParent = ref(false);

watch(
  () => props.modelValue,
  (value) => {
    if (value === template.value) {
      return;
    }

    syncingFromParent.value = true;
    template.value = normalizeDocumentTemplate(value);
  }
);

watch(
  template,
  (value) => {
    if (syncingFromParent.value) {
      syncingFromParent.value = false;
      return;
    }

    emit('update:modelValue', value);
  },
  { deep: true }
);

const state = useDocumentDesignerState(template);
const activeRange = computed(() => state.activeRange.value);
const selectedPlacementId = computed(() => state.selectedPlacementId.value);
const selectedPlacement = computed(() => state.selectedPlacement.value);
const selectedField = computed(() => state.selectedField.value);

const activeRangeSummary = computed(() => {
  const range = activeRange.value;
  return `R${range.row} C${range.col} · ${range.rowspan} x ${range.colspan}`;
});

const selectedFieldSummary = computed(() => {
  if (!selectedField.value) {
    return '未选中字段';
  }

  return `${selectedField.value.label} · ${selectedField.value.type}`;
});

function handleRangeSelect(range: DocumentSheetRange) {
  state.setActiveRange(range);
}

function handlePlacementSelect(placementId: string | null) {
  state.selectPlacement(placementId);
}

function handlePlacementRangeUpdate(placementId: string, range: DocumentSheetRange) {
  state.updatePlacementRange(placementId, range);
  state.selectPlacement(placementId);
  state.setActiveRange(range);
}

function handleFieldUpdate(patch: Partial<DocumentTemplateField>) {
  state.updateSelectedField(patch);
}

function handleFieldOptionsUpdate(options: Array<{ label: string; value: string }>) {
  state.updateSelectedFieldOptions(options);
}

function handlePlacementUpdate(
  patch: Partial<Pick<DocumentTemplatePlacement, 'displayMode' | 'section' | 'readonly'>>
) {
  state.updateSelectedPlacement(patch);
}

function handleSheetViewportUpdate(patch: Partial<DocumentTemplateSchema['sheet']['viewport']>) {
  state.updateSheetViewport(patch);
}

function handleUniverSnapshotSync(snapshot: Record<string, unknown>) {
  template.value.designer = {
    ...template.value.designer,
    univerSnapshot: createDesignerUniverSnapshotEnvelope(snapshot)
  };
}
</script>

<template>
  <div class="workbench">
    <header class="workbench-head">
      <div class="workbench-head__main">
        <div class="workbench-title">{{ props.title }}</div>
        <div class="workbench-meta">
          Sheet-first 设计态：Univer 负责表格、合并、边框与选区；Vue 负责运行态真实预览。
        </div>
      </div>
      <div class="workbench-head__status">
        <span>{{ activeRangeSummary }}</span>
        <span>{{ selectedFieldSummary }}</span>
      </div>
    </header>

    <section class="workbench-toolbar">
      <div class="toolbar-group">
        <span class="toolbar-label">插入字段</span>
        <div class="toolbar-actions toolbar-actions--chips">
          <button
            v-for="blueprint in DOCUMENT_DESIGNER_FIELD_BLUEPRINTS"
            :key="blueprint.type"
            type="button"
            class="field-chip"
            @click="state.insertField(blueprint.type)"
          >
            {{ blueprint.label }}
          </button>
        </div>
      </div>
    </section>

    <div class="workbench-body">
      <DocumentCanvas
        :active-range="activeRange"
        :selected-placement-id="selectedPlacementId"
        :template="template"
        @select-placement="handlePlacementSelect"
        @select-range="handleRangeSelect"
        @sync-univer-snapshot="handleUniverSnapshotSync"
        @update-placement-range="handlePlacementRangeUpdate"
      />
      <DocumentPropertyInspector
        :selected-field="selectedField"
        :selected-placement="selectedPlacement"
        :template="template"
        @remove-placement="state.removeSelectedPlacement"
        @select-placement="handlePlacementSelect"
        @update-field="handleFieldUpdate"
        @update-field-options="handleFieldOptionsUpdate"
        @update-sheet-viewport="handleSheetViewportUpdate"
        @update-placement="handlePlacementUpdate"
      />
    </div>
  </div>
</template>

<style scoped>
.workbench {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 720px;
  flex-direction: column;
  background: #e2e8f0;
}

.workbench-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid #cbd5e1;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.workbench-head__main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.workbench-title {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
}

.workbench-meta,
.workbench-head__status {
  color: rgb(226 232 240 / 82%);
  font-size: 12px;
}

.workbench-head__status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  white-space: nowrap;
}

.workbench-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid #d8dee8;
  background: #f8fafc;
}

.toolbar-group {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.toolbar-group--end {
  margin-left: auto;
}

.toolbar-label {
  color: #334155;
  font-size: 12px;
  font-weight: 600;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-actions--chips {
  flex-wrap: wrap;
}

.field-chip,
.toolbar-btn {
  padding: 7px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  font-size: 12px;
  cursor: pointer;
}

.field-chip:hover,
.toolbar-btn:hover {
  border-color: #93c5fd;
  color: #1d4ed8;
}

.workbench-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  flex: 1;
  min-height: 0;
}

@media (max-width: 1080px) {
  .workbench-head {
    flex-direction: column;
  }

  .workbench-head__status {
    align-items: flex-start;
  }

  .workbench-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-group--end {
    margin-left: 0;
  }
}

@media (max-width: 960px) {
  .workbench-body {
    grid-template-columns: 1fr;
  }
}
</style>
