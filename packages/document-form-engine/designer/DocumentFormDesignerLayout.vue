<script setup lang="ts">
import type { DocumentTemplateSchema } from '../schema/types';
import DocumentDesignerWorkbench from './DocumentDesignerWorkbench.vue';

defineOptions({
  name: 'DocumentFormDesignerLayout'
});

const props = defineProps<{
  template: DocumentTemplateSchema;
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'update:template', value: DocumentTemplateSchema): void;
}>();
</script>

<template>
  <div class="layout-shell">
    <div class="layout-actions">
      <button type="button" class="layout-back-btn" @click="emit('back')">返回</button>
    </div>
    <DocumentDesignerWorkbench
      :model-value="props.template"
      :title="props.title || '公文表单设计器'"
      @update:model-value="emit('update:template', $event)"
    />
  </div>
</template>

<style scoped>
.layout-shell {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex-direction: column;
}

.layout-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid #d5deea;
  background: #f8fafc;
}

.layout-back-btn {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  cursor: pointer;
}
</style>
