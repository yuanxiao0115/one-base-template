<script setup lang="ts">
import { Folder, UserFilled } from '@element-plus/icons-vue';
import type { OrgContactNode, OrgContactOrgNode, OrgContactUserNode } from '../types';
import type { BreadcrumbNode } from './org-manager-dialog.types';

const props = defineProps<{
  searchKeyword: string;
  showBreadcrumb: boolean;
  breadcrumbs: BreadcrumbNode[];
  currentNodes: OrgContactNode[];
  selectedUserIdSet: Set<string>;
}>();

const emit = defineEmits<{
  (event: 'update:searchKeyword', value: string): void;
  (event: 'search'): void;
  (event: 'search-clear'): void;
  (event: 'goto-breadcrumb', index: number): void;
  (event: 'enter-org', node: OrgContactOrgNode): void;
  (event: 'toggle-user', node: OrgContactUserNode, checked: boolean): void;
}>();

function onKeywordUpdate(value: string | number) {
  emit('update:searchKeyword', String(value ?? ''));
}

function onSearch() {
  emit('search');
}

function onSearchClear() {
  emit('search-clear');
}

function onGotoBreadcrumb(index: number) {
  emit('goto-breadcrumb', index);
}

function onEnterOrgNode(node: OrgContactNode) {
  if (node.nodeType !== 'org') {
    return;
  }
  emit('enter-org', node);
}

function onToggleUser(node: OrgContactNode, checked: unknown) {
  if (node.nodeType !== 'user') {
    return;
  }
  emit('toggle-user', node, Boolean(checked));
}

function isCheckedUser(node: OrgContactNode): boolean {
  if (node.nodeType !== 'user') {
    return false;
  }
  return props.selectedUserIdSet.has(node.userId);
}
</script>

<template>
  <div class="org-manager-dialog__left">
    <div class="org-manager-dialog__search">
      <el-input
        :model-value="searchKeyword"
        clearable
        placeholder="查询人员"
        @update:model-value="onKeywordUpdate"
        @keyup.enter="onSearch"
        @clear="onSearchClear"
      />
    </div>

    <div v-if="showBreadcrumb" class="org-manager-dialog__breadcrumb">
      <span
        v-for="(item, index) in breadcrumbs"
        :key="item.id"
        class="org-manager-dialog__breadcrumb-item"
      >
        <span class="org-manager-dialog__breadcrumb-title" @click="onGotoBreadcrumb(index)">{{
          item.title
        }}</span>
        <span v-if="index < breadcrumbs.length - 1" class="org-manager-dialog__breadcrumb-separator"
          >/</span
        >
      </span>
    </div>

    <div class="org-manager-dialog__node-list">
      <template v-if="currentNodes.length > 0">
        <div v-for="node in currentNodes" :key="node.id" class="org-manager-dialog__node-item">
          <template v-if="node.nodeType === 'org'">
            <el-icon class="org-manager-dialog__org-icon"><Folder /></el-icon>
            <span class="org-manager-dialog__org-title" @click="onEnterOrgNode(node)">{{
              node.title
            }}</span>
          </template>

          <template v-else>
            <el-icon class="org-manager-dialog__user-icon"><UserFilled /></el-icon>
            <span class="org-manager-dialog__user-title">{{ node.title }}</span>
            <el-checkbox
              class="org-manager-dialog__user-checkbox"
              :model-value="isCheckedUser(node)"
              @update:model-value="onToggleUser(node, $event)"
            />
          </template>
        </div>
      </template>

      <el-empty v-else description="暂无数据" :image-size="80" />
    </div>
  </div>
</template>

<style scoped>
.org-manager-dialog__left {
  display: flex;
  flex-direction: column;
  min-height: 520px;
  border-right: 1px solid var(--el-border-color-lighter);
}

.org-manager-dialog__search {
  padding: 16px;
}

.org-manager-dialog__breadcrumb {
  padding: 0 16px 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-secondary);
}

.org-manager-dialog__breadcrumb-item {
  font-size: 13px;
}

.org-manager-dialog__breadcrumb-title {
  cursor: pointer;
}

.org-manager-dialog__breadcrumb-title:hover {
  color: var(--el-color-primary);
}

.org-manager-dialog__breadcrumb-separator {
  margin: 0 4px;
}

.org-manager-dialog__node-list {
  flex: 1;
  overflow-y: auto;
}

.org-manager-dialog__node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.org-manager-dialog__node-item:hover {
  background: var(--el-fill-color-light);
}

.org-manager-dialog__org-icon,
.org-manager-dialog__user-icon {
  color: var(--el-text-color-secondary);
}

.org-manager-dialog__org-title {
  flex: 1;
  cursor: pointer;
}

.org-manager-dialog__org-title:hover {
  color: var(--el-color-primary);
}

.org-manager-dialog__user-title {
  flex: 1;
}
</style>
