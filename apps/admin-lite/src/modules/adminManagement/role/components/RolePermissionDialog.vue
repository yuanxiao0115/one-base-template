<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { TreeInstance } from 'element-plus';
import { message } from '@one-base-template/ui';
import { roleApi } from '../api';
import type { PermissionTreeNode } from '../types';

const props = defineProps<{
  modelValue: boolean;
  roleId: string;
  roleName: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'saved'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const treeRef = ref<TreeInstance>();
const loading = ref(false);
const submitting = ref(false);
const treeData = ref<PermissionTreeNode[]>([]);
const treeRenderSeed = ref(0);
const checkedPermissionIds = ref<string[]>([]);
const appliedRoleId = ref('');

const expandedAll = ref(true);
const checkedAll = ref(false);
let latestLoadToken = 0;
let latestSaveToken = 0;

const treeProps = {
  children: 'children',
  label: 'resourceName'
};

function getAllPermissionIds(list: PermissionTreeNode[]): string[] {
  const result: string[] = [];

  const walk = (nodes: PermissionTreeNode[]) => {
    nodes.forEach((node) => {
      if (node.id) {
        result.push(node.id);
      }
      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children);
      }
    });
  };

  walk(list);
  return result;
}

function getCurrentCheckedPermissionIds(): string[] {
  const checkedKeys = treeRef.value?.getCheckedKeys(false) || [];
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || [];
  return [...new Set([...checkedKeys, ...halfCheckedKeys].map((item) => String(item)))];
}

function clearTreeState() {
  appliedRoleId.value = '';
  treeData.value = [];
  checkedPermissionIds.value = [];
  treeRenderSeed.value += 1;
}

function invalidateDialogSession() {
  latestLoadToken += 1;
  latestSaveToken += 1;
  loading.value = false;
  submitting.value = false;
  clearTreeState();
}

function isLatestLoadRequest(requestToken: number, requestRoleId: string) {
  return requestToken === latestLoadToken && visible.value && requestRoleId === props.roleId;
}

async function rerenderTreeWithExpandedState() {
  if (!appliedRoleId.value) {
    return;
  }

  checkedPermissionIds.value = getCurrentCheckedPermissionIds();
  treeRenderSeed.value += 1;
  await nextTick();
  treeRef.value?.setCheckedKeys(checkedPermissionIds.value);
}

function setChecked(flag: boolean) {
  if (flag) {
    const allIds = getAllPermissionIds(treeData.value);
    checkedPermissionIds.value = allIds;
    treeRef.value?.setCheckedKeys(allIds);
    return;
  }

  checkedPermissionIds.value = [];
  treeRef.value?.setCheckedKeys([]);
}

async function loadDialogData() {
  const requestRoleId = props.roleId;
  if (!requestRoleId) {
    clearTreeState();
    return;
  }

  const requestToken = ++latestLoadToken;
  loading.value = true;
  checkedAll.value = false;
  expandedAll.value = true;
  clearTreeState();

  try {
    const [permissionIdRes, treeRes] = await Promise.all([
      roleApi.getRolePermissionIds({ roleId: requestRoleId }),
      roleApi.getPermissionTree()
    ]);

    if (permissionIdRes.code !== 200) {
      throw new Error(permissionIdRes.message || '加载角色权限失败');
    }

    if (treeRes.code !== 200) {
      throw new Error(treeRes.message || '加载权限树失败');
    }

    if (!isLatestLoadRequest(requestToken, requestRoleId)) {
      return;
    }

    treeData.value = Array.isArray(treeRes.data) ? treeRes.data : [];
    checkedPermissionIds.value = Array.isArray(permissionIdRes.data)
      ? permissionIdRes.data.map((item) => String(item))
      : [];
    treeRenderSeed.value += 1;
    await nextTick();
    if (!isLatestLoadRequest(requestToken, requestRoleId)) {
      return;
    }
    treeRef.value?.setCheckedKeys(checkedPermissionIds.value);
    appliedRoleId.value = requestRoleId;
  } catch (error) {
    if (!isLatestLoadRequest(requestToken, requestRoleId)) {
      return;
    }

    const errorMessage = error instanceof Error ? error.message : '加载角色权限失败';
    message.error(errorMessage);
  } finally {
    if (requestToken === latestLoadToken) {
      loading.value = false;
    }
  }
}

async function save() {
  const submitRoleId = props.roleId;
  if (!submitRoleId) {
    message.warning('请先选择角色');
    return;
  }

  if (!visible.value || loading.value || appliedRoleId.value !== submitRoleId) {
    message.warning('角色权限正在加载，请稍后再试');
    return;
  }

  const checkedKeys = treeRef.value?.getCheckedKeys(false) || [];
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || [];
  const permissionIdList = [
    ...new Set([...checkedKeys, ...halfCheckedKeys].map((item) => String(item)))
  ];

  const requestToken = ++latestSaveToken;
  submitting.value = true;
  try {
    const response = await roleApi.updateRolePermissions({
      roleId: submitRoleId,
      permissionIdList
    });

    if (response.code !== 200) {
      throw new Error(response.message || '保存角色权限失败');
    }

    if (
      requestToken !== latestSaveToken ||
      !visible.value ||
      submitRoleId !== props.roleId ||
      appliedRoleId.value !== submitRoleId
    ) {
      return;
    }

    message.success('保存角色权限成功');
    emit('saved');
    visible.value = false;
  } catch (error) {
    if (requestToken !== latestSaveToken || appliedRoleId.value !== submitRoleId) {
      return;
    }

    const errorMessage = error instanceof Error ? error.message : '保存角色权限失败';
    message.error(errorMessage);
  } finally {
    if (requestToken === latestSaveToken) {
      submitting.value = false;
    }
  }
}

watch(
  () => visible.value,
  (value) => {
    if (!value) {
      invalidateDialogSession();
      return;
    }
    void loadDialogData();
  }
);

watch(
  () => props.roleId,
  (value, oldValue) => {
    if (!visible.value || !value || value === oldValue) {
      return;
    }
    invalidateDialogSession();
    void loadDialogData();
  }
);

watch(
  () => expandedAll.value,
  () => {
    void rerenderTreeWithExpandedState();
  }
);

watch(
  () => checkedAll.value,
  (value) => {
    setChecked(value);
  }
);
</script>

<template>
  <ObCrudContainer
    v-model="visible"
    container="dialog"
    mode="edit"
    :title="`菜单权限配置 - ${props.roleName || '--'}`"
    :dialog-width="760"
    :loading="submitting"
    @confirm="save"
  >
    <div v-loading="loading" class="role-permission-dialog">
      <div class="role-permission-dialog__toolbar">
        <el-checkbox v-model="expandedAll">展开/折叠</el-checkbox>
        <el-checkbox v-model="checkedAll">全选/全不选</el-checkbox>
      </div>

      <el-scrollbar class="role-permission-dialog__tree">
        <el-tree
          :key="`permission-tree-${props.roleId}-${treeRenderSeed}`"
          ref="treeRef"
          node-key="id"
          :data="treeData"
          :props="treeProps"
          show-checkbox
          empty-text="暂无权限数据"
          :default-expand-all="expandedAll"
        />
      </el-scrollbar>
    </div>
  </ObCrudContainer>
</template>

<style scoped>
.role-permission-dialog__toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.role-permission-dialog__tree {
  height: min(60vh, calc(100vh - 260px));
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 8px;
}
</style>
