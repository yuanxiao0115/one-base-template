<script setup lang="ts">
import type { CommandPaletteItem } from './types';

const props = withDefaults(
  defineProps<{
    items?: CommandPaletteItem[];
    activeId?: string;
  }>(),
  {
    items: () => [],
    activeId: ''
  }
);

const emit = defineEmits<{
  (event: 'select', item: CommandPaletteItem): void;
  (event: 'clear'): void;
}>();

function onSelect(item: CommandPaletteItem) {
  emit('select', item);
}

function onClear() {
  emit('clear');
}

function getItemClass(item: CommandPaletteItem) {
  return {
    'ob-command-palette-history__item': true,
    'is-active': props.activeId === item.id
  };
}
</script>

<template>
  <section class="ob-command-palette-history">
    <header class="ob-command-palette-history__header">
      <span>最近访问</span>
      <el-button text size="small" @click="onClear">清空</el-button>
    </header>

    <ul class="ob-command-palette-history__list">
      <li
        v-for="item in props.items"
        :key="item.id"
        :class="getItemClass(item)"
        @click="onSelect(item)"
      >
        <span class="ob-command-palette-history__title">{{ item.title }}</span>
        <code class="ob-command-palette-history__path">{{ item.path }}</code>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.ob-command-palette-history {
  padding: 8px 0 10px;
}

.ob-command-palette-history__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  margin-bottom: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.ob-command-palette-history__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ob-command-palette-history__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  border: 1px solid transparent;
  cursor: pointer;
}

.ob-command-palette-history__item:hover,
.ob-command-palette-history__item.is-active {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.ob-command-palette-history__title {
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.ob-command-palette-history__path {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
