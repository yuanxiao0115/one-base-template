<script setup lang="ts">
import type { DocumentMaterialDefinition } from '../materials/types';
import type { DocumentMaterialNode } from '../schema/types';

defineOptions({
  name: 'DocumentPropertyInspector'
});

const props = defineProps<{
  definition: DocumentMaterialDefinition | null;
  node: DocumentMaterialNode | null;
}>();

const emit = defineEmits<{
  (e: 'update:field', key: string, value: unknown): void;
  (e: 'remove'): void;
}>();
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
