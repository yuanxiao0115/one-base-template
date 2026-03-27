<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { DocumentMaterialDefinition } from '../materials/types';
import type { DocumentTemplateSchema } from '../schema/types';
import { createDefaultDocumentTemplate, normalizeDocumentTemplate } from '../schema/template';
import DocumentCanvas from './DocumentCanvas.vue';
import DocumentMaterialPalette from './DocumentMaterialPalette.vue';
import DocumentPropertyInspector from './DocumentPropertyInspector.vue';
import { useDocumentDesignerState } from './useDocumentDesignerState';

defineOptions({
  name: 'DocumentDesignerWorkbench'
});

const props = withDefaults(
  defineProps<{
    modelValue?: DocumentTemplateSchema;
    materials: DocumentMaterialDefinition[];
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

watch(
  () => props.modelValue,
  (value) => {
    template.value = normalizeDocumentTemplate(value);
  }
);

watch(
  template,
  (value) => {
    emit('update:modelValue', value);
  },
  { deep: true }
);

const materialsRef = computed(() => props.materials);
const {
  selectedNodeId,
  selectedNode,
  selectedDefinition,
  addMaterial,
  selectNode,
  removeSelectedNode,
  updateSelectedNodeProp
} = useDocumentDesignerState(template, materialsRef);
</script>

<template>
  <div class="workbench">
    <header class="workbench-head">
      <div>
        <div class="workbench-title">{{ props.title }}</div>
        <div class="workbench-meta">MVP 设计态使用物料壳预览，运行态再映射真实组件</div>
      </div>
    </header>
    <div class="workbench-body">
      <DocumentMaterialPalette :materials="props.materials" @add="addMaterial" />
      <DocumentCanvas
        :template="template"
        :materials="props.materials"
        :selected-node-id="selectedNodeId"
        @select="selectNode"
      />
      <DocumentPropertyInspector
        :definition="selectedDefinition"
        :node="selectedNode"
        @update:field="updateSelectedNodeProp"
        @remove="removeSelectedNode"
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
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #cbd5e1;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.workbench-title {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
}

.workbench-meta {
  color: rgb(226 232 240 / 80%);
  font-size: 12px;
}

.workbench-body {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 320px;
  flex: 1;
  min-height: 0;
}

@media (max-width: 1180px) {
  .workbench-body {
    grid-template-columns: 240px minmax(0, 1fr) 280px;
  }
}

@media (max-width: 960px) {
  .workbench-body {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr) auto;
  }
}
</style>
