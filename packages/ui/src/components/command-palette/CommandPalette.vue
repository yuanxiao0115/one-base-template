<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import { computed, nextTick, onBeforeUnmount, onMounted, watch, ref } from 'vue';
import type { AppMenuItem } from '@one-base-template/core';
import CommandPaletteHistory from './CommandPaletteHistory.vue';
import CommandPaletteResult from './CommandPaletteResult.vue';
import CommandPaletteFooter from './CommandPaletteFooter.vue';
import type { CommandPaletteNavigatePayload } from './types';
import { buildCommandPaletteItemsFromMenus, useCommandPalette } from './useCommandPalette';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    menuItems?: AppMenuItem[];
    includeExternal?: boolean;
    excludePaths?: string[];
    placeholder?: string;
    dialogTitle?: string;
    historyKeyBase?: string;
    maxHistory?: number;
    suggestionLimit?: number;
    shortcut?: boolean;
    showTrigger?: boolean;
    triggerText?: string;
  }>(),
  {
    modelValue: false,
    menuItems: () => [],
    includeExternal: false,
    excludePaths: () => [],
    placeholder: '输入菜单名称或路径，按 Enter 快速跳转',
    dialogTitle: '菜单搜索',
    historyKeyBase: 'ob_command_palette_history',
    maxHistory: 8,
    suggestionLimit: 24,
    shortcut: true,
    showTrigger: true,
    triggerText: '菜单搜索'
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'navigate', payload: CommandPaletteNavigatePayload): void;
  (event: 'open'): void;
  (event: 'close'): void;
  (event: 'search', keyword: string): void;
}>();

const inputRef = ref<{ focus: () => void } | null>(null);

const normalizedItems = computed(() => {
  return buildCommandPaletteItemsFromMenus(props.menuItems, {
    includeExternal: props.includeExternal,
    excludePaths: props.excludePaths
  });
});

const {
  visible,
  keyword,
  activeIndex,
  historyItems,
  activeItems,
  open,
  close,
  setKeyword,
  setActiveIndex,
  moveActive,
  getActiveItem,
  recordHistory,
  clearHistory
} = useCommandPalette(() => normalizedItems.value, {
  historyKeyBase: props.historyKeyBase,
  maxHistory: props.maxHistory,
  suggestionLimit: props.suggestionLimit
});

const hasKeyword = computed(() => keyword.value.trim().length > 0);
const activeItemId = computed(() => activeItems.value[activeIndex.value]?.id || '');
const emptyText = computed(() => (hasKeyword.value ? '未找到匹配菜单' : '暂无可用菜单'));

watch(
  () => props.modelValue,
  (nextVisible) => {
    if (nextVisible) {
      open();
      return;
    }
    close();
  },
  { immediate: true }
);

watch(
  () => visible.value,
  (nextVisible) => {
    emit('update:modelValue', nextVisible);
    if (nextVisible) {
      emit('open');
      void nextTick(() => {
        inputRef.value?.focus();
      });
      return;
    }
    emit('close');
  }
);

watch(
  () => keyword.value,
  (nextKeyword) => {
    emit('search', nextKeyword);
  }
);

function onTriggerClick() {
  open();
}

function onSearchInput(value: string | number) {
  setKeyword(String(value ?? ''));
}

function onHoverResultIndex(index: number) {
  setActiveIndex(index);
}

function onSelectByIndex(index: number) {
  setActiveIndex(index);
  const selectedItem = activeItems.value[index];
  if (!selectedItem) {
    return;
  }
  handleSelect(selectedItem);
}

function onSelectHistory(item: CommandPaletteNavigatePayload['item']) {
  handleSelect(item);
}

function handleSelect(item: CommandPaletteNavigatePayload['item']) {
  recordHistory(item);
  emit('navigate', {
    path: item.path,
    external: item.external,
    item
  });
  close();
}

function onPanelKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    moveActive(1);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    moveActive(-1);
    return;
  }

  if (event.key === 'Enter') {
    const currentItem = getActiveItem();
    if (!currentItem) {
      return;
    }
    event.preventDefault();
    handleSelect(currentItem);
    return;
  }

  if (event.key === 'Escape') {
    close();
  }
}

function onGlobalKeydown(event: KeyboardEvent) {
  if (!props.shortcut) {
    return;
  }

  const loweredKey = event.key.toLowerCase();
  if (loweredKey !== 'k') {
    return;
  }

  if (!(event.ctrlKey || event.metaKey)) {
    return;
  }

  event.preventDefault();
  if (visible.value) {
    close();
    return;
  }
  open();
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown);
});
</script>

<template>
  <div class="ob-command-palette">
    <el-button
      v-if="props.showTrigger"
      class="ob-command-palette__trigger"
      text
      @click="onTriggerClick"
    >
      <el-icon class="ob-command-palette__trigger-icon"><Search /></el-icon>
      <span>{{ props.triggerText }}</span>
      <kbd>Ctrl/Cmd + K</kbd>
    </el-button>

    <el-dialog
      v-model="visible"
      class="ob-command-palette__dialog"
      :title="props.dialogTitle"
      width="680"
      top="12vh"
      append-to-body
      destroy-on-close
      :show-close="false"
      :close-on-click-modal="false"
    >
      <div class="ob-command-palette__panel" @keydown="onPanelKeydown">
        <el-input
          ref="inputRef"
          :model-value="keyword"
          clearable
          size="large"
          :placeholder="props.placeholder"
          @update:model-value="onSearchInput"
        />

        <CommandPaletteHistory
          v-if="!hasKeyword && historyItems.length > 0"
          :items="historyItems"
          :active-id="activeItemId"
          @select="onSelectHistory"
          @clear="clearHistory"
        />

        <CommandPaletteResult
          :items="activeItems"
          :active-index="activeIndex"
          :empty-text="emptyText"
          @hover-index="onHoverResultIndex"
          @select="onSelectByIndex"
        />

        <CommandPaletteFooter />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.ob-command-palette__trigger {
  color: #fff;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 24%);
  background: rgb(255 255 255 / 12%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
}

.ob-command-palette__trigger:hover {
  color: #fff;
  background: rgb(255 255 255 / 20%);
}

.ob-command-palette__trigger-icon {
  font-size: 14px;
}

.ob-command-palette__trigger kbd {
  border-radius: 4px;
  border: 1px solid rgb(255 255 255 / 28%);
  background: rgb(0 0 0 / 12%);
  padding: 1px 4px;
  font-size: 11px;
}

.ob-command-palette__panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
