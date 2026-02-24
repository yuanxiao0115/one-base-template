<template>
  <div class="pb-list-container" :class="containerClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    columnCount?: 1 | 2 | 3;
    listType?: 'image-text' | 'text-only' | string;
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
  name: 'pb-list-container'
});
</script>

<style scoped>
.pb-list-container {
  display: flex;
  width: 100%;
  min-height: 40px;
  flex-direction: column;
}

.pb-list-container.double-column {
  flex-flow: row wrap;
  column-gap: 24px;
}

.pb-list-container.triple-column {
  flex-flow: row wrap;
  column-gap: 24px;
}

.pb-list-container.double-column :deep(.pb-list-item),
.pb-list-container.double-column :deep(.list-item) {
  width: calc(50% - 12px);
}

.pb-list-container.triple-column :deep(.pb-list-item),
.pb-list-container.triple-column :deep(.list-item) {
  width: calc(33.333% - 16px);
}
</style>
