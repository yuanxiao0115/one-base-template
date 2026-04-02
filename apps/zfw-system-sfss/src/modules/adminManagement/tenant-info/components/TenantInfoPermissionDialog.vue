<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { TreeInstance } from 'element-plus';
import { message } from '@one-base-template/ui';
import { tenantInfoApi } from '../api';
import type { TenantPermissionTreeNode } from '../types';

const props = defineProps<{
  modelValue: boolean;
  tenantId: string;
  tenantName: string;
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
const treeData = ref<TenantPermissionTreeNode[]>([]);
const checkedPermissionIds = ref<string[]>([]);
const treeRenderSeed = ref(0);
const appliedTenantId = ref('');
let latestLoadToken = 0;
let latestSaveToken = 0;

const treeProps = {
  children: 'children',
  label: 'resourceName'
};

function normalizeIdList(list: Array<string | number>): string[] {
  return [...new Set(list.map((item) => String(item)).filter(Boolean))];
}

function collectLeafNodeIds(nodes: TenantPermissionTreeNode[]): string[] {
  const ids: string[] = [];
  const walk = (items: TenantPermissionTreeNode[]) => {
    items.forEach((item) => {
      const children = Array.isArray(item.children) ? item.children : [];
      if (!children.length) {
        ids.push(String(item.id));
        return;
      }
      walk(children);
    });
  };
  walk(nodes);
  return ids;
}

function getCurrentCheckedPermissionIds(): string[] {
  const checkedKeys = treeRef.value?.getCheckedKeys(false) || [];
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || [];
  return normalizeIdList([...checkedKeys, ...halfCheckedKeys] as Array<string | number>);
}

function equalIdSet(left: string[], right: string[]): boolean {
  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();
  return (
    leftSorted.length === rightSorted.length &&
    leftSorted.every((item, index) => item === rightSorted[index])
  );
}

function clearTreeState() {
  appliedTenantId.value = '';
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

function isLatestLoadRequest(requestToken: number, requestTenantId: string) {
  return requestToken === latestLoadToken && visible.value && requestTenantId === props.tenantId;
}

async function loadPermissionData() {
  const requestTenantId = props.tenantId;
  if (!requestTenantId) {
    clearTreeState();
    return;
  }

  const requestToken = ++latestLoadToken;
  loading.value = true;
  clearTreeState();
  try {
    const [treeResponse, permissionResponse] = await Promise.all([
      tenantInfoApi.getTenantTree(),
      tenantInfoApi.getTenantPermissionIds({ tenantId: requestTenantId })
    ]);

    if (treeResponse.code !== 200) {
      throw new Error(treeResponse.message || '加载权限树失败');
    }

    if (permissionResponse.code !== 200) {
      throw new Error(permissionResponse.message || '加载租户权限失败');
    }

    if (!isLatestLoadRequest(requestToken, requestTenantId)) {
      return;
    }

    const nextTreeData = Array.isArray(treeResponse.data) ? treeResponse.data : [];
    const nextCheckedPermissionIds = normalizeIdList(
      (Array.isArray(permissionResponse.data) ? permissionResponse.data : []) as Array<
        string | number
      >
    );
    const leafIdSet = new Set(collectLeafNodeIds(nextTreeData));
    const selectedLeafIds = nextCheckedPermissionIds.filter((id) => leafIdSet.has(id));

    treeData.value = nextTreeData;
    checkedPermissionIds.value = nextCheckedPermissionIds;
    treeRenderSeed.value += 1;
    await nextTick();
    if (!isLatestLoadRequest(requestToken, requestTenantId)) {
      return;
    }
    treeRef.value?.setCheckedKeys(selectedLeafIds, false);
    appliedTenantId.value = requestTenantId;
  } catch (error) {
    if (!isLatestLoadRequest(requestToken, requestTenantId)) {
      return;
    }

    const errorMessage = error instanceof Error ? error.message : '加载租户权限失败';
    message.error(errorMessage);
    visible.value = false;
  } finally {
    if (requestToken === latestLoadToken) {
      loading.value = false;
    }
  }
}

async function savePermission() {
  const submitTenantId = props.tenantId;
  if (!submitTenantId) {
    message.warning('请先选择租户');
    return;
  }

  if (!visible.value || loading.value || appliedTenantId.value !== submitTenantId) {
    message.warning('租户权限正在加载，请稍后再试');
    return;
  }

  const permissionIdList = getCurrentCheckedPermissionIds();
  if (equalIdSet(permissionIdList, checkedPermissionIds.value)) {
    message.success('编辑成功');
    visible.value = false;
    return;
  }

  const requestToken = ++latestSaveToken;
  submitting.value = true;
  try {
    const response = await tenantInfoApi.updateTenantPermission({
      tenantId: submitTenantId,
      permissionIdList
    });

    if (response.code !== 200) {
      throw new Error(response.message || '保存租户权限失败');
    }

    if (
      requestToken !== latestSaveToken ||
      !visible.value ||
      submitTenantId !== props.tenantId ||
      appliedTenantId.value !== submitTenantId
    ) {
      return;
    }

    checkedPermissionIds.value = permissionIdList;
    message.success('编辑成功');
    emit('saved');
    visible.value = false;
  } catch (error) {
    if (requestToken !== latestSaveToken || appliedTenantId.value !== submitTenantId) {
      return;
    }

    const errorMessage = error instanceof Error ? error.message : '保存租户权限失败';
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
    void loadPermissionData();
  }
);

watch(
  () => props.tenantId,
  (value, oldValue) => {
    if (!visible.value || value === oldValue) {
      return;
    }

    invalidateDialogSession();
    if (value) {
      void loadPermissionData();
    }
  }
);
</script>

<template>
  <ObCrudContainer
    v-model="visible"
    container="drawer"
    mode="edit"
    :title="`添加权限 - ${props.tenantName || '--'}`"
    :drawer-size="560"
    :loading="loading || submitting"
    confirm-text="保存"
    @confirm="savePermission"
  >
    <el-scrollbar class="tenant-permission-dialog__tree">
      <el-tree
        :key="`tenant-permission-tree-${props.tenantId}-${treeRenderSeed}`"
        ref="treeRef"
        node-key="id"
        :data="treeData"
        :props="treeProps"
        show-checkbox
        default-expand-all
      />
    </el-scrollbar>
  </ObCrudContainer>
</template>

<style scoped>
.tenant-permission-dialog__tree {
  height: min(68vh, calc(100vh - 220px));
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 8px;
}
</style>
