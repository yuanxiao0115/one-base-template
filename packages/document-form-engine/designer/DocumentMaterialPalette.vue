<script setup lang="ts">
import type { DocumentMaterialDefinition } from '../materials/types';

defineOptions({
  name: 'DocumentMaterialPalette'
});

const props = defineProps<{
  materials: DocumentMaterialDefinition[];
}>();

const emit = defineEmits<{
  (e: 'add', type: string): void;
}>();
</script>

<template>
  <aside class="palette">
    <div class="panel-title">物料</div>
    <button
      v-for="material in props.materials"
      :key="material.type"
      class="palette-item"
      type="button"
      @click="emit('add', material.type)"
    >
      <span class="palette-item__icon">{{ material.icon }}</span>
      <span class="palette-item__body">
        <strong>{{ material.label }}</strong>
        <small>{{ material.description }}</small>
      </span>
    </button>
  </aside>
</template>

<style scoped>
.palette {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-right: 1px solid #d8dee8;
  background: linear-gradient(180deg, #f8fafc 0%, #eef3f8 100%);
}

.panel-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.palette-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid #d6deea;
  background: #fff;
  cursor: pointer;
  text-align: left;
}

.palette-item__icon {
  width: 30px;
  color: #334155;
  font-size: 12px;
}

.palette-item__body {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.palette-item__body strong {
  color: #0f172a;
  font-size: 13px;
}

.palette-item__body small {
  color: #64748b;
  line-height: 1.5;
}
</style>
