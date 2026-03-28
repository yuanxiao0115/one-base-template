<script setup lang="ts">
import type { DocumentSheetMerge } from '../../schema/sheet';
import type { DocumentMaterialAnchor } from '../../schema/types';

defineOptions({
  name: 'MergeEditor'
});

const props = defineProps<{
  merges: DocumentSheetMerge[];
  nodeAnchor: DocumentMaterialAnchor | null;
}>();

const emit = defineEmits<{
  (e: 'add-current'): void;
  (e: 'remove', index: number): void;
}>();

function formatRange(merge: DocumentSheetMerge) {
  const rowEnd = merge.row + merge.rowspan - 1;
  const colEnd = merge.col + merge.colspan - 1;
  return `R${merge.row}C${merge.col} ~ R${rowEnd}C${colEnd}`;
}
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <strong>合并区域</strong>
      <button type="button" :disabled="!props.nodeAnchor" @click="emit('add-current')">
        添加当前物料区域
      </button>
    </div>
    <div v-if="props.merges.length === 0" class="empty">暂无合并区域</div>
    <div v-else class="merge-list">
      <div
        v-for="(merge, index) in props.merges"
        :key="`${merge.row}-${merge.col}-${index}`"
        class="merge-item"
      >
        <span>{{ formatRange(merge) }}</span>
        <button type="button" class="delete-btn" @click="emit('remove', index)">移除</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid #d8dee8;
  background: #fff;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.panel-head button {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  cursor: pointer;
}

.panel-head button:disabled {
  border-color: #e2e8f0;
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.merge-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.merge-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 8px;
  border: 1px dashed #cbd5e1;
  color: #334155;
  font-size: 12px;
}

.delete-btn {
  border: 1px solid #fda4af;
  background: #fff1f2;
  color: #be123c;
  cursor: pointer;
}

.empty {
  color: #94a3b8;
  font-size: 12px;
}
</style>
