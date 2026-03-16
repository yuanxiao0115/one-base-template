<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Search } from '@element-plus/icons-vue';

import type { PortalTab } from '../schema/types';

import PortalTabTree from './PortalTabTree.vue';

interface TreeSortDropPayload {
  draggingId: string;
  dropId: string;
  dropType: 'before' | 'after' | 'inner';
}

const props = defineProps<{
  tabs: PortalTab[];
  currentTabId: string;
  sorting?: boolean;
}>();

const emit = defineEmits<{
  (e: 'create-root'): void;
  (e: 'select' | 'edit', tabId: string): void;
  (
    e: 'delete' | 'toggle-hide' | 'attribute' | 'create-child' | 'create-sibling',
    node: PortalTab
  ): void;
  (e: 'sort-drop', payload: TreeSortDropPayload): void;
}>();
const keyword = ref('');
</script>

<template>
  <div class="tree-panel">
    <div class="tree-tools">
      <el-input v-model="keyword" clearable size="small" placeholder="搜索页面名称">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-tooltip content="新建页面" placement="top">
        <el-button
          class="tool-add-btn"
          size="small"
          :icon="Plus"
          aria-label="新建页面"
          @click="emit('create-root')"
        />
      </el-tooltip>
    </div>
    <PortalTabTree
      class="tree-content"
      :tabs="props.tabs"
      :current-tab-id="props.currentTabId"
      :keyword="keyword"
      :sorting="props.sorting"
      @select="(tabId) => emit('select', tabId)"
      @edit="(tabId) => emit('edit', tabId)"
      @create-sibling="(node) => emit('create-sibling', node)"
      @create-child="(node) => emit('create-child', node)"
      @attribute="(node) => emit('attribute', node)"
      @toggle-hide="(node) => emit('toggle-hide', node)"
      @delete="(node) => emit('delete', node)"
      @sort-drop="(payload) => emit('sort-drop', payload)"
    />
  </div>
</template>

<style scoped>
.tree-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  background: #fff;
}

.tree-tools {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 8px;
}

.tool-add-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 0;
  color: #4b5563;
  background: #f2f5f8;
}

.tool-add-btn:hover {
  color: #1f2937;
  background: #e8edf3;
}

.tree-content {
  flex: 1;
  min-height: 0;
}

.tree-panel :deep(.el-input__wrapper) {
  border-radius: 0;
}
</style>
