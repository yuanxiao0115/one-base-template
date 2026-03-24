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

async function loadPermissionData() {
  if (!props.tenantId) {
    return;
  }

  loading.value = true;
  try {
    const [treeResponse, permissionResponse] = await Promise.all([
      tenantInfoApi.getTenantTree(),
      tenantInfoApi.getTenantPermissionIds({ tenantId: props.tenantId })
    ]);

    if (treeResponse.code !== 200) {
      throw new Error(treeResponse.message || '加载权限树失败');
    }

    if (permissionResponse.code !== 200) {
      throw new Error(permissionResponse.message || '加载租户权限失败');
    }

    treeData.value = Array.isArray(treeResponse.data) ? treeResponse.data : [];
    checkedPermissionIds.value = normalizeIdList(
      (Array.isArray(permissionResponse.data) ? permissionResponse.data : []) as Array<
        string | number
      >
    );

    const leafIds = collectLeafNodeIds(treeData.value);
    const selectedLeafIds = checkedPermissionIds.value.filter((id) => leafIds.includes(id));

    treeRenderSeed.value += 1;
    await nextTick();
    treeRef.value?.setCheckedKeys(selectedLeafIds, false);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '加载租户权限失败';
    message.error(errorMessage);
    visible.value = false;
  } finally {
    loading.value = false;
  }
}

async function savePermission() {
  if (!props.tenantId) {
    message.warning('请先选择租户');
    return;
  }

  const permissionIdList = getCurrentCheckedPermissionIds();
  if (equalIdSet(permissionIdList, checkedPermissionIds.value)) {
    message.success('编辑成功');
    visible.value = false;
    return;
  }

  submitting.value = true;
  try {
    const response = await tenantInfoApi.updateTenantPermission({
      tenantId: props.tenantId,
      permissionIdList
    });

    if (response.code !== 200) {
      throw new Error(response.message || '保存租户权限失败');
    }

    message.success('编辑成功');
    emit('saved');
    visible.value = false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '保存租户权限失败';
    message.error(errorMessage);
  } finally {
    submitting.value = false;
  }
}

watch(
  () => visible.value,
  (next) => {
    if (next) {
      void loadPermissionData();
    }
  }
);
</script>

<template>
  <ObCrudContainer
    v-model="visible"
    container="dialog"
    mode="edit"
    :title="`添加权限 - ${props.tenantName || '--'}`"
    :dialog-width="760"
    :loading="submitting"
    confirm-text="保存"
    @confirm="savePermission"
  >
    <div v-loading="loading" class="tenant-permission-dialog">
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
    </div>
  </ObCrudContainer>
</template>

<style scoped>
.tenant-permission-dialog__tree {
  max-height: 60vh;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 8px;
}
</style>
