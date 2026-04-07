<script setup lang="ts">
import MenuIcon from '../menu/MenuIcon.vue';
import type { CommandPaletteItem } from './types';

const props = withDefaults(
  defineProps<{
    items?: CommandPaletteItem[];
    activeIndex?: number;
    emptyText?: string;
  }>(),
  {
    items: () => [],
    activeIndex: 0,
    emptyText: '暂无匹配结果'
  }
);

const emit = defineEmits<{
  (event: 'select', index: number): void;
  (event: 'hover-index', index: number): void;
}>();

function onSelect(index: number) {
  emit('select', index);
}

function onHover(index: number) {
  emit('hover-index', index);
}

function getRowClass(index: number) {
  return {
    'ob-command-palette-result__row': true,
    'is-active': index === props.activeIndex
  };
}
</script>

<template>
  <section class="ob-command-palette-result">
    <div v-if="!props.items.length" class="ob-command-palette-result__empty">
      {{ props.emptyText }}
    </div>

    <ul v-else class="ob-command-palette-result__list">
      <li
        v-for="(item, index) in props.items"
        :key="item.id"
        :class="getRowClass(index)"
        @mouseenter="onHover(index)"
        @click="onSelect(index)"
      >
        <div class="ob-command-palette-result__left">
          <MenuIcon v-if="item.icon" :icon="item.icon" />
          <span class="ob-command-palette-result__title">{{ item.title }}</span>
        </div>
        <code class="ob-command-palette-result__path">{{ item.path }}</code>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.ob-command-palette-result {
  padding: 6px 0 4px;
  min-height: 160px;
}

.ob-command-palette-result__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 340px;
  overflow: auto;
}

.ob-command-palette-result__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
}

.ob-command-palette-result__row:hover,
.ob-command-palette-result__row.is-active {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
}

.ob-command-palette-result__left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.ob-command-palette-result__title {
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.ob-command-palette-result__path {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.ob-command-palette-result__empty {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
