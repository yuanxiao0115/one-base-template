<script setup lang="ts">
import { computed } from 'vue';

import type { PortalTab } from '../../types';

defineOptions({
  name: 'PortalTabTree',
});

type PortalTabWithUi = PortalTab & {
  disabled?: boolean;
  children?: PortalTabWithUi[];
};

const props = defineProps<{
  tabs: PortalTab[];
  currentTabId: string;
}>();

const emit = defineEmits<{
  (e: 'select', tabId: string): void;
  (e: 'edit', tabId: string): void;
  (e: 'create-sibling', node: PortalTab): void;
  (e: 'create-child', node: PortalTab): void;
}>();

function mapTabs(tabs: PortalTab[] | undefined): PortalTabWithUi[] {
  if (!Array.isArray(tabs)) return [];
  return tabs.map((t) => {
    const children = mapTabs(t.children);
    return {
      ...t,
      disabled: t.tabType !== 2,
      children,
    };
  });
}

const treeData = computed(() => mapTabs(props.tabs));

const treeProps = {
  label: 'tabName',
  children: 'children',
  disabled: 'disabled',
} as const;

function normalizeId(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number') return String(raw);
  return '';
}

function onNodeClick(data: PortalTab) {
  if (data.tabType !== 2) return;
  const id = normalizeId(data.id);
  if (!id) return;
  emit('select', id);
}

function onEdit(data: PortalTab) {
  const id = normalizeId(data.id);
  if (!id) return;
  emit('edit', id);
}

function onCommand(command: string, data: PortalTab) {
  if (command === 'sibling') emit('create-sibling', data);
  if (command === 'child') emit('create-child', data);
}
</script>

<template>
  <div class="tree-wrap">
    <div class="tree-title">页面导航</div>
    <el-tree
      class="tree"
      node-key="id"
      default-expand-all
      highlight-current
      :data="treeData"
      :props="treeProps"
      :current-node-key="currentTabId"
      @node-click="onNodeClick"
    >
      <template #default="{ data }">
        <div class="node">
          <div class="name">
            <span class="truncate">{{ data.tabName || '未命名' }}</span>
            <el-tag v-if="data.isHide === 1" size="small" type="info">隐藏</el-tag>
          </div>

          <div class="actions" @click.stop>
            <el-button v-if="data.tabType === 2" link size="small" @click="onEdit(data)">编辑</el-button>
            <el-dropdown trigger="click" @command="(cmd: string) => onCommand(cmd, data)">
              <el-button link size="small">新建</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="sibling">新建同级</el-dropdown-item>
                  <el-dropdown-item v-if="data.tabType === 1" command="child">新建子级</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<style scoped>
.tree-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.tree-title {
  flex: none;
  padding: 12px 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}

.tree {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px 8px 12px;
}

.node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-right: 4px;
}

.name {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
}

.truncate {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

