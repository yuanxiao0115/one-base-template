<script setup lang="ts">
import type { DocumentSheetMerge, DocumentSheetRange } from '../../schema/sheet';

defineOptions({
  name: 'MergeEditor'
});

const props = defineProps<{
  merges: DocumentSheetMerge[];
  activeRange: DocumentSheetRange | null;
}>();

const emit = defineEmits<{
  (e: 'add-current'): void;
  (e: 'remove', index: number): void;
}>();
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <strong>合并区域</strong>
      <button type="button" @click="emit('add-current')">按当前选区合并</button>
    </div>
    <div v-if="props.activeRange" class="panel-meta">
      当前选区：R{{ props.activeRange.row }} C{{ props.activeRange.col }} ·
      {{ props.activeRange.rowspan }} x {{ props.activeRange.colspan }}
    </div>
    <ul v-if="props.merges.length > 0" class="merge-list">
      <li v-for="(merge, index) in props.merges" :key="`${merge.row}-${merge.col}-${index}`">
        <span>R{{ merge.row }} C{{ merge.col }} · {{ merge.rowspan }} x {{ merge.colspan }}</span>
        <button type="button" @click="emit('remove', index)">移除</button>
      </li>
    </ul>
    <div v-else class="empty-text">当前模板未配置合并区域</div>
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

.panel-head button,
.merge-list button {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  cursor: pointer;
}

.panel-meta,
.empty-text {
  color: #64748b;
  font-size: 12px;
}

.merge-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.merge-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  font-size: 12px;
}
</style>
