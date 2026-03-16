<template>
  <div class="cms-list-container" :class="containerClass"><slot /></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    columnCount?: 1 | 2 | 3;
    listType?: string | 'image-text' | 'text-only';
  }>(),
  {
    columnCount: 1,
    listType: 'text-only'
  }
);

const containerClass = computed(() => ({
  'double-column': props.columnCount === 2,
  'triple-column': props.columnCount === 3,
  'image-text-mode': props.listType === 'image-text',
  'text-only-mode': props.listType === 'text-only'
}));

defineOptions({
  name: 'PbListContainer'
});
</script>

<style scoped>
.cms-list-container {
  display: flex;
  width: 100%;
  min-height: 40px;
  flex-direction: column;
}

.cms-list-container.double-column {
  flex-flow: row wrap;
  column-gap: 24px;
}

.cms-list-container.triple-column {
  flex-flow: row wrap;
  column-gap: 24px;
}

.cms-list-container.double-column :deep(.cms-list-item),
.cms-list-container.double-column :deep(.list-item) {
  width: calc(50% - 12px);
}

.cms-list-container.triple-column :deep(.cms-list-item),
.cms-list-container.triple-column :deep(.list-item) {
  width: calc(33.333% - 16px);
}
</style>
