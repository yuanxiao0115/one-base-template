<script setup lang="ts">
import { computed } from 'vue';
import { Folder, UserFilled } from '@element-plus/icons-vue';
import { Icon } from '@iconify/vue';
import type {
  PersonnelBreadcrumbNode,
  PersonnelNode,
  PersonnelOrgNode,
  PersonnelUserNode
} from './types';

const props = withDefaults(defineProps<{
  loading: boolean
  disabled: boolean
  searchKeyword: string
  isSearchMode: boolean
  breadcrumbs: PersonnelBreadcrumbNode[]
  nodes: PersonnelNode[]
  selectedIdSet: Set<string>
  allowSelectOrg?: boolean
  searchPlaceholder?: string
  showHierarchyIcon?: boolean
}>(), {
  allowSelectOrg: false,
  searchPlaceholder: '搜索人员',
  showHierarchyIcon: true
});

const emit = defineEmits<{(event: 'update:search-keyword', value: string): void
                          (event: 'search'): void
                          (event: 'search-clear'): void
                          (event: 'breadcrumb-click', index: number): void
                          (event: 'enter-org', node: PersonnelOrgNode): void
                          (event: 'toggle-org', payload: { node: PersonnelOrgNode; checked: boolean }): void
                          (event: 'toggle-user', payload: { node: PersonnelUserNode; checked: boolean }): void
}>();

const breadcrumbItems = computed(() => props.breadcrumbs.slice(1));

function isOrgNode (node: PersonnelNode): node is PersonnelOrgNode {
  return node.nodeType === 'org';
}

function isUserNode (node: PersonnelNode): node is PersonnelUserNode {
  return node.nodeType === 'user';
}

function getUserId (node: PersonnelUserNode): string {
  return node.userId || node.id;
}

function getUserLabel (node: PersonnelUserNode): string {
  return `${node.nickName || node.title}（${node.phone || node.userAccount || '--'}）`;
}

function onKeywordChange (value: string) {
  emit('update:search-keyword', value);
}

function onToggleUser (node: PersonnelUserNode, checked: boolean) {
  emit('toggle-user', {
    node,
    checked
  });
}

function onToggleOrg (node: PersonnelOrgNode, checked: boolean) {
  emit('toggle-org', {
    node,
    checked
  });
}
</script>

<template>
  <div class="personnel-selector-source">
    <div class="personnel-selector-source__search">
      <el-input
        :model-value="props.searchKeyword"
        clearable
        :placeholder="props.searchPlaceholder"
        @update:model-value="onKeywordChange"
        @clear="emit('search-clear')"
        @keyup.enter="emit('search')"
      >
        <template #append>
          <el-button :loading="props.loading" :disabled="props.disabled" @click="emit('search')">搜索</el-button>
        </template>
      </el-input>
    </div>

    <div
      v-if="!props.isSearchMode && breadcrumbItems.length > 0"
      class="personnel-selector-source__breadcrumb"
    >
      <span
        v-for="(item, index) in breadcrumbItems"
        :key="item.id"
        class="personnel-selector-source__breadcrumb-item"
      >
        <span class="personnel-selector-source__breadcrumb-title" @click="() => emit('breadcrumb-click', index + 1)">
          {{ item.title }}
        </span>
        <span v-if="index < breadcrumbItems.length - 1" class="personnel-selector-source__breadcrumb-separator">
          /
        </span>
      </span>
    </div>

    <div v-loading="props.loading" class="personnel-selector-source__node-list">
      <template v-if="props.nodes.length > 0">
        <div
          v-for="node in props.nodes"
          :key="node.id"
          class="personnel-selector-source__node-item"
        >
          <template v-if="isOrgNode(node)">
            <el-icon class="personnel-selector-source__org-icon"><Folder /></el-icon>
            <el-checkbox
              v-if="props.allowSelectOrg"
              :model-value="props.selectedIdSet.has(node.id)"
              class="personnel-selector-source__org-checkbox"
              @update:model-value="(checked) => onToggleOrg(node, Boolean(checked))"
            >
              <span class="personnel-selector-source__org-text">
                {{ node.orgName || node.title }}
              </span>
            </el-checkbox>
            <span v-else class="personnel-selector-source__org-text" @click="() => emit('enter-org', node)">
              {{ node.orgName || node.title }}
            </span>
            <el-button
              v-if="props.showHierarchyIcon"
              link
              type="primary"
              class="personnel-selector-source__next-btn"
              @click="() => emit('enter-org', node)"
            >
              <Icon icon="mdi:sitemap-outline" width="16" height="16" />
              <span>下级</span>
            </el-button>
          </template>

          <template v-else-if="isUserNode(node)">
            <el-icon class="personnel-selector-source__user-icon"><UserFilled /></el-icon>
            <el-checkbox
              :model-value="props.selectedIdSet.has(getUserId(node))"
              class="personnel-selector-source__user-checkbox"
              @update:model-value="(checked) => onToggleUser(node, Boolean(checked))"
            >
              <span class="personnel-selector-source__user-text">
                {{ getUserLabel(node) }}
              </span>
            </el-checkbox>
          </template>
        </div>
      </template>

      <el-empty v-else description="暂无数据" :image-size="80" />
    </div>
  </div>
</template>

<style scoped>
.personnel-selector-source {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  background: var(--el-bg-color);
}

.personnel-selector-source__search {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.personnel-selector-source__breadcrumb {
  padding: 8px 12px 10px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.personnel-selector-source__breadcrumb-title {
  cursor: pointer;
}

.personnel-selector-source__breadcrumb-title:hover {
  color: var(--one-color-primary);
}

.personnel-selector-source__breadcrumb-separator {
  margin: 0 4px;
}

.personnel-selector-source__node-list {
  flex: 1;
  overflow: auto;
  background: var(--el-fill-color-blank);
}

.personnel-selector-source__node-list :deep(.el-loading-mask) {
  background-color: transparent;
}

.personnel-selector-source__node-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 12px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  transition: background-color .2s ease;
}

.personnel-selector-source__node-item:hover {
  background: var(--el-fill-color-light);
}

.personnel-selector-source__org-icon,
.personnel-selector-source__user-icon {
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.personnel-selector-source__org-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.personnel-selector-source__org-text:hover {
  color: var(--one-color-primary);
}

.personnel-selector-source__org-checkbox {
  flex: 1;
  min-width: 0;
}

.personnel-selector-source__org-checkbox :deep(.el-checkbox__label) {
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
}

.personnel-selector-source__next-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  min-height: 30px;
  font-size: 13px;
}

.personnel-selector-source__user-checkbox {
  flex: 1;
  min-width: 0;
}

.personnel-selector-source__user-checkbox :deep(.el-checkbox__label) {
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
}

.personnel-selector-source__user-text {
  display: inline-block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.personnel-selector-source__node-list::-webkit-scrollbar {
  width: 6px;
}

.personnel-selector-source__node-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--el-border-color);
}
</style>
