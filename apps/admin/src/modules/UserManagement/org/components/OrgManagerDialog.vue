<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Folder, UserFilled } from '@element-plus/icons-vue';
import {
  orgApi,
  type OrgContactNode,
  type OrgContactOrgNode,
  type OrgContactUserNode,
  type OrgManagerRecord
} from '../api';

type BreadcrumbNode = {
  id: string;
  title: string;
};

type SelectedUser = {
  userId: string;
  nickName: string;
  phone: string;
  uniqueId: string;
};

const props = defineProps<{
  modelValue: boolean;
  orgId: string;
  orgName: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'success'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const loading = ref(false);
const saving = ref(false);
const searchKeyword = ref('');
const breadcrumbs = ref<BreadcrumbNode[]>([]);
const showBreadcrumb = ref(true);

const currentNodes = ref<OrgContactNode[]>([]);
const rootNodes = ref<OrgContactNode[]>([]);
const nodeChildrenMap = new Map<string, OrgContactNode[]>();

const selectedUsers = ref<SelectedUser[]>([]);
const originalManagers = ref<OrgManagerRecord[]>([]);

function isOrgNode(node: OrgContactNode): node is OrgContactOrgNode {
  return node.nodeType === 'org';
}

function isUserNode(node: OrgContactNode): node is OrgContactUserNode {
  return node.nodeType === 'user';
}

function getUserDisplay(node: OrgContactUserNode): SelectedUser {
  return {
    userId: node.userId,
    nickName: node.nickName,
    phone: node.phone,
    uniqueId: node.id
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function resetState() {
  loading.value = false;
  saving.value = false;
  searchKeyword.value = '';
  breadcrumbs.value = [{ id: '0', title: '通讯录' }];
  showBreadcrumb.value = true;
  currentNodes.value = [];
  rootNodes.value = [];
  nodeChildrenMap.clear();
  selectedUsers.value = [];
  originalManagers.value = [];
}

function syncCurrentNodeChecked() {
  const selectedIdSet = new Set(selectedUsers.value.map((item) => item.userId));

  currentNodes.value = currentNodes.value.map((node) => {
    if (!isUserNode(node)) return node;
    return {
      ...node,
      checked: selectedIdSet.has(node.userId)
    } as OrgContactUserNode;
  });
}

function updateNodeChildren(orgId: string, children: OrgContactNode[]) {
  nodeChildrenMap.set(orgId, children);

  if (orgId === '0') {
    rootNodes.value = children;
    return;
  }

  const patch = (nodes: OrgContactNode[]): OrgContactNode[] =>
    nodes.map((node) => {
      if (!isOrgNode(node)) return node;
      if (node.id === orgId) {
        return {
          ...node,
          children
        };
      }
      if (!Array.isArray(node.children) || node.children.length === 0) {
        return node;
      }
      return {
        ...node,
        children: patch(node.children)
      };
    });

  rootNodes.value = patch(rootNodes.value);
}

async function loadNodeChildren(parentId: string): Promise<OrgContactNode[]> {
  const cached = nodeChildrenMap.get(parentId);
  if (cached) return cached;

  const response = await orgApi.getOrgContactsLazy({ parentId });
  if (response.code !== 200) {
    throw new Error(response.message || '加载通讯录失败');
  }

  const rows = Array.isArray(response.data) ? response.data : [];
  updateNodeChildren(parentId, rows);
  return rows;
}

async function loadOrgManagers() {
  if (!props.orgId) return;

  const response = await orgApi.queryOrgManagerList({ orgId: props.orgId });
  if (response.code !== 200) {
    throw new Error(response.message || '加载组织管理员失败');
  }

  originalManagers.value = Array.isArray(response.data) ? response.data : [];

  selectedUsers.value = originalManagers.value.map((item) => ({
    userId: item.userId,
    nickName: item.nickName,
    phone: item.phone,
    uniqueId: item.id
  }));
}

async function loadRootNodes() {
  const rows = await loadNodeChildren('0');
  currentNodes.value = rows;
  syncCurrentNodeChecked();
}

async function initDialog() {
  if (!props.orgId) {
    message.warning('缺少组织信息，无法设置管理员');
    return;
  }

  resetState();
  loading.value = true;
  try {
    await loadOrgManagers();
    await loadRootNodes();
  } catch (error) {
    message.error(getErrorMessage(error, '初始化组织管理员失败'));
  } finally {
    loading.value = false;
  }
}

async function enterOrgNode(node: OrgContactOrgNode) {
  loading.value = true;
  try {
    const rows = await loadNodeChildren(node.id);
    currentNodes.value = rows;
    syncCurrentNodeChecked();

    const breadcrumbIndex = breadcrumbs.value.findIndex((item) => item.id === node.id);
    if (breadcrumbIndex >= 0) {
      breadcrumbs.value = breadcrumbs.value.slice(0, breadcrumbIndex + 1);
      return;
    }

    breadcrumbs.value.push({
      id: node.id,
      title: node.title || node.orgName || '组织'
    });
  } catch (error) {
    message.error(getErrorMessage(error, '加载组织下级失败'));
  } finally {
    loading.value = false;
  }
}

async function gotoBreadcrumb(index: number) {
  const target = breadcrumbs.value[index];
  if (!target) return;

  loading.value = true;
  try {
    const rows = await loadNodeChildren(target.id);
    currentNodes.value = rows;
    syncCurrentNodeChecked();
    breadcrumbs.value = breadcrumbs.value.slice(0, index + 1);
  } catch (error) {
    message.error(getErrorMessage(error, '加载通讯录失败'));
  } finally {
    loading.value = false;
  }
}

function addSelectedUser(node: OrgContactUserNode) {
  const exists = selectedUsers.value.some((item) => item.userId === node.userId);
  if (exists) return;
  selectedUsers.value.push(getUserDisplay(node));
}

function removeSelectedUser(node: OrgContactUserNode) {
  selectedUsers.value = selectedUsers.value.filter((item) => item.userId !== node.userId);
}

function toggleUser(node: OrgContactUserNode, checked: boolean) {
  if (checked) {
    addSelectedUser(node);
  } else {
    removeSelectedUser(node);
  }
  syncCurrentNodeChecked();
}

function removeSelectedById(userId: string) {
  selectedUsers.value = selectedUsers.value.filter((item) => item.userId !== userId);
  syncCurrentNodeChecked();
}

function clearSelected() {
  selectedUsers.value = [];
  syncCurrentNodeChecked();
}

async function handleSearch() {
  const keyword = searchKeyword.value.trim();
  if (!keyword) {
    showBreadcrumb.value = true;
    currentNodes.value = rootNodes.value;
    syncCurrentNodeChecked();
    return;
  }

  loading.value = true;
  try {
    const response = await orgApi.searchContactUsers({ search: keyword });
    if (response.code !== 200) {
      throw new Error(response.message || '搜索人员失败');
    }

    showBreadcrumb.value = false;
    currentNodes.value = Array.isArray(response.data) ? response.data : [];
    syncCurrentNodeChecked();
  } catch (error) {
    message.error(getErrorMessage(error, '搜索人员失败'));
  } finally {
    loading.value = false;
  }
}

function handleSearchClear() {
  searchKeyword.value = '';
  showBreadcrumb.value = true;
  currentNodes.value = rootNodes.value;
  syncCurrentNodeChecked();
}

async function handleSubmit() {
  if (!props.orgId) {
    message.warning('缺少组织信息，无法设置管理员');
    return;
  }

  const userIds = Array.from(new Set(selectedUsers.value.map((item) => item.userId).filter(Boolean)));
  if (userIds.length === 0) {
    message.warning('请选择人员');
    return;
  }

  saving.value = true;
  try {
    const saveResponse = await orgApi.addOrgManager({
      orgId: props.orgId,
      userId: userIds
    });

    if (saveResponse.code !== 200) {
      throw new Error(saveResponse.message || '设置组织管理员失败');
    }

    const selectedSet = new Set(userIds);
    const removeIds = originalManagers.value
      .filter((item) => !selectedSet.has(item.userId))
      .map((item) => item.id)
      .filter(Boolean);

    if (removeIds.length > 0) {
      const removeResponse = await orgApi.delOrgManager({ id: removeIds.join(',') });
      if (removeResponse.code !== 200) {
        throw new Error(removeResponse.message || '移除组织管理员失败');
      }
    }

    message.success('设置组织管理员成功');
    emit('success');
    visible.value = false;
  } catch (error) {
    message.error(getErrorMessage(error, '设置组织管理员失败'));
  } finally {
    saving.value = false;
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      resetState();
      return;
    }

    void initDialog();
  },
  { immediate: true }
);

watch(
  () => props.orgId,
  () => {
    if (!props.modelValue) return;
    void initDialog();
  }
);
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="`设置管理员 - ${props.orgName || '组织'}`"
    width="980"
    append-to-body
    destroy-on-close
  >
    <div v-loading="loading" class="org-manager-dialog">
      <div class="org-manager-dialog__left">
        <div class="org-manager-dialog__search">
          <el-input
            v-model.trim="searchKeyword"
            clearable
            placeholder="查询人员"
            @keyup.enter="handleSearch"
            @clear="handleSearchClear"
          />
        </div>

        <div v-if="showBreadcrumb" class="org-manager-dialog__breadcrumb">
          <span
            v-for="(item, index) in breadcrumbs"
            :key="item.id"
            class="org-manager-dialog__breadcrumb-item"
          >
            <span class="org-manager-dialog__breadcrumb-title" @click="gotoBreadcrumb(index)">{{ item.title }}</span>
            <span v-if="index < breadcrumbs.length - 1" class="org-manager-dialog__breadcrumb-separator">/</span>
          </span>
        </div>

        <div class="org-manager-dialog__node-list">
          <template v-if="currentNodes.length > 0">
            <div
              v-for="node in currentNodes"
              :key="node.id"
              class="org-manager-dialog__node-item"
            >
              <template v-if="node.nodeType === 'org'">
                <el-icon class="org-manager-dialog__org-icon"><Folder /></el-icon>
                <span class="org-manager-dialog__org-title" @click="enterOrgNode(node)">{{ node.title }}</span>
              </template>

              <template v-else>
                <el-icon class="org-manager-dialog__user-icon"><UserFilled /></el-icon>
                <span class="org-manager-dialog__user-title">{{ node.title }}</span>
                <el-checkbox
                  class="org-manager-dialog__user-checkbox"
                  :model-value="selectedUsers.some((item) => item.userId === node.userId)"
                  @update:model-value="(checked) => toggleUser(node, Boolean(checked))"
                />
              </template>
            </div>
          </template>

          <el-empty v-else description="暂无数据" :image-size="80" />
        </div>
      </div>

      <div class="org-manager-dialog__right">
        <div class="org-manager-dialog__selected-head">
          <span>已选择 {{ selectedUsers.length }} 个联系人</span>
          <el-button link type="primary" @click="clearSelected">清空</el-button>
        </div>

        <div class="org-manager-dialog__selected-list">
          <div
            v-for="user in selectedUsers"
            :key="`${user.userId}-${user.uniqueId}`"
            class="org-manager-dialog__selected-item"
          >
            <div class="org-manager-dialog__selected-text">
              <span>{{ user.nickName }}</span>
              <span class="org-manager-dialog__selected-phone">{{ user.phone ? `(${user.phone})` : '' }}</span>
            </div>
            <el-button link type="danger" @click="removeSelectedById(user.userId)">移除</el-button>
          </div>

          <el-empty v-if="selectedUsers.length === 0" description="未选择人员" :image-size="80" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="org-manager-dialog__footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.org-manager-dialog {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  min-height: 520px;
  border: 1px solid var(--el-border-color-lighter);
}

.org-manager-dialog__left,
.org-manager-dialog__right {
  display: flex;
  flex-direction: column;
  min-height: 520px;
}

.org-manager-dialog__left {
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

.org-manager-dialog__selected-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.org-manager-dialog__selected-list {
  flex: 1;
  overflow-y: auto;
}

.org-manager-dialog__selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.org-manager-dialog__selected-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.org-manager-dialog__selected-phone {
  color: var(--el-text-color-secondary);
}

.org-manager-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
