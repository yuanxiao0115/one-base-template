<script setup lang="ts">
import { computed } from 'vue';
import type { DocumentMaterialSheetStyleValue } from '../materials/sheet-style';
import type { DocumentMaterialDefinition } from '../materials/types';
import type { DocumentMaterialNode, DocumentTemplateSchema } from '../schema/types';
import MergeEditor from './panels/MergeEditor.vue';
import SheetStyleEditor from './panels/SheetStyleEditor.vue';

defineOptions({
  name: 'DocumentPropertyInspector'
});

const props = defineProps<{
  definition: DocumentMaterialDefinition | null;
  node: DocumentMaterialNode | null;
  template: DocumentTemplateSchema;
}>();

const emit = defineEmits<{
  (e: 'update:field', key: string, value: unknown): void;
  (e: 'remove'): void;
  (e: 'apply-sheet-style', value: DocumentMaterialSheetStyleValue): void;
  (e: 'add-current-merge'): void;
  (e: 'remove-merge', index: number): void;
}>();

const selectedRangeStyle = computed(() => {
  if (!props.node) {
    return null;
  }
  return (
    props.template.sheet.styles.find(
      (item) =>
        item.row === props.node?.anchor.row &&
        item.col === props.node?.anchor.col &&
        item.rowspan === props.node?.anchor.rowspan &&
        item.colspan === props.node?.anchor.colspan
    ) ?? null
  );
});

const defaultStyle = computed(() => props.definition?.stylePreset.style ?? null);
</script>

<template>
  <aside class="inspector">
    <div class="panel-title">设置</div>
    <template v-if="props.definition && props.node">
      <div class="inspector-head">
        <strong>{{ props.definition.label }}</strong>
        <button type="button" class="danger-btn" @click="emit('remove')">删除</button>
      </div>
      <label v-for="field in props.definition.propertySchema" :key="field.key" class="field">
        <span>{{ field.label }}</span>
        <textarea
          v-if="field.type === 'textarea'"
          :value="String(props.node.props[field.key] ?? '')"
          :placeholder="field.placeholder"
          rows="4"
          @input="emit('update:field', field.key, ($event.target as HTMLTextAreaElement).value)"
        />
        <input
          v-else-if="field.type === 'text'"
          :value="String(props.node.props[field.key] ?? '')"
          :placeholder="field.placeholder"
          type="text"
          @input="emit('update:field', field.key, ($event.target as HTMLInputElement).value)"
        />
        <input
          v-else-if="field.type === 'number'"
          :value="Number(props.node.props[field.key] ?? 0)"
          :min="field.min"
          :max="field.max"
          type="number"
          @input="
            emit('update:field', field.key, Number(($event.target as HTMLInputElement).value))
          "
        />
        <input
          v-else-if="field.type === 'boolean'"
          :checked="Boolean(props.node.props[field.key])"
          type="checkbox"
          @change="emit('update:field', field.key, ($event.target as HTMLInputElement).checked)"
        />
        <select
          v-else
          :value="String(props.node.props[field.key] ?? '')"
          @change="emit('update:field', field.key, ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="option in field.options || []" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <MergeEditor
        :merges="props.template.sheet.merges"
        :node-anchor="props.node.anchor"
        @add-current="emit('add-current-merge')"
        @remove="(index) => emit('remove-merge', index)"
      />
      <SheetStyleEditor
        :model-value="selectedRangeStyle"
        :default-style="defaultStyle"
        @apply="(value) => emit('apply-sheet-style', value)"
      />
    </template>
    <div v-else class="empty-text">请选择画布中的物料节点</div>
  </aside>
</template>

<style scoped>
.inspector {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-left: 1px solid #d8dee8;
  background: linear-gradient(180deg, #f8fafc 0%, #eef3f8 100%);
  overflow: auto;
}

.panel-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.inspector-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #334155;
  font-size: 12px;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
}

.field input[type='checkbox'] {
  width: 16px;
  height: 16px;
  padding: 0;
}

.danger-btn {
  padding: 6px 10px;
  border: 1px solid #fda4af;
  background: #fff1f2;
  color: #be123c;
  cursor: pointer;
}

.empty-text {
  color: #94a3b8;
  font-size: 13px;
}
</style>
