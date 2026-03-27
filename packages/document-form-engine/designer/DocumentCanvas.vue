<script setup lang="ts">
import type { DocumentMaterialDefinition } from '../materials/types';
import type { DocumentTemplateSchema } from '../schema/types';

defineOptions({
  name: 'DocumentCanvas'
});

const props = defineProps<{
  template: DocumentTemplateSchema;
  materials: DocumentMaterialDefinition[];
  selectedNodeId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', nodeId: string): void;
}>();

function resolveDefinition(type: string) {
  return props.materials.find((item) => item.type === type) ?? null;
}

function resolveStyle(node: DocumentTemplateSchema['materials'][number]) {
  const { columns, rowHeight } = props.template.grid;
  return {
    left: `${(node.anchor.col / columns) * 100}%`,
    top: `${(((node.anchor.row - 1) * rowHeight) / props.template.page.minHeight) * 100}%`,
    width: `${(node.anchor.colspan / columns) * 100}%`,
    height: `${((node.anchor.rowspan * rowHeight) / props.template.page.minHeight) * 100}%`
  };
}
</script>

<template>
  <section class="canvas-shell">
    <div class="canvas-page">
      <button
        v-for="node in props.template.materials"
        :key="node.id"
        class="canvas-node"
        :class="{ 'canvas-node--active': node.id === props.selectedNodeId }"
        :style="resolveStyle(node)"
        type="button"
        @click="emit('select', node.id)"
      >
        <component :is="resolveDefinition(node.type)?.designerPreview" :node="node" />
      </button>
      <div v-if="props.template.materials.length === 0" class="canvas-empty">
        从左侧选择一个物料开始编排
      </div>
    </div>
  </section>
</template>

<style scoped>
.canvas-shell {
  display: flex;
  min-width: 0;
  min-height: 0;
  justify-content: center;
  padding: 20px;
  background:
    linear-gradient(180deg, rgb(226 232 240 / 40%) 0%, rgb(241 245 249 / 90%) 100%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 23px,
      rgb(148 163 184 / 10%) 23px,
      rgb(148 163 184 / 10%) 24px
    );
  overflow: auto;
}

.canvas-page {
  position: relative;
  width: 794px;
  min-height: 1123px;
  border: 1px solid #d6deea;
  background: #fff;
  box-shadow: 0 18px 48px -30px rgb(15 23 42 / 45%);
}

.canvas-node {
  position: absolute;
  padding: 0;
  border: 1px dashed transparent;
  background: transparent;
  cursor: pointer;
}

.canvas-node--active {
  border-color: #2563eb;
}

.canvas-node :deep(.document-material-shell) {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--document-shell-accent) 35%, white);
  background: color-mix(in srgb, var(--document-shell-accent) 8%, white);
}

.canvas-node :deep(.document-material-shell__label) {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.canvas-node :deep(.document-material-shell__summary) {
  color: #475569;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.canvas-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
}
</style>
