<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Lock, Unlock } from '@element-plus/icons-vue';
import { useTable } from '@one-base-template/core';
import { message, obConfirm } from '@one-base-template/ui';
import tenantManagerColumns from './columns';
import TenantManagerSearchForm from './components/TenantManagerSearchForm.vue';
import { tenantManagerApi } from './api';
import type { TenantManagerRecord } from './types';

defineOptions({
  name: 'TenantManagerManagementPage'
});

interface SearchRefExpose {
  resetFields?: () => void;
}

const tableRef = ref<unknown>(null);
const searchRef = ref<SearchRefExpose>();

const searchForm = reactive({
  tenantName: '',
  isEnable: '' as string | boolean
});

const tableOpt = reactive({
  query: {
    api: tenantManagerApi.page,
    params: searchForm,
    pagination: true
  }
});

const {
  loading,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleSelectionChange,
  handleSizeChange,
  handleCurrentChange,
  onSelectionCancel,
  selectedNum,
  selectedList
} = useTable(tableOpt, tableRef);

function isEnabled(row: TenantManagerRecord): boolean {
  return row.isEnable === true || Number(row.isEnable ?? 0) === 1;
}

function getStatusType(row: TenantManagerRecord): 'success' | 'danger' {
  return isEnabled(row) ? 'success' : 'danger';
}

function getStatusText(row: TenantManagerRecord): string {
  return isEnabled(row) ? '正常' : '停用';
}

function tableSearch(keyword: string) {
  searchForm.tenantName = keyword;
  void onSearch();
}

function onKeywordUpdate(keyword: string) {
  searchForm.tenantName = keyword;
}

function onResetSearch() {
  searchForm.isEnable = '';
  resetForm(searchRef, 'tenantName');
}

async function resetPassword(row: TenantManagerRecord) {
  await obConfirm.warn('您确认要重置密码（恢复初始系统设置）？', '重置确认');

  const response = await tenantManagerApi.resetPassword({
    id: String(row.id)
  });

  if (response.code !== 200) {
    throw new Error(response.message || '重置密码失败');
  }

  message.success('重置密码成功');
}

function getSelectedIdsAndNames() {
  const rows = Array.isArray(selectedList.value) ? selectedList.value : [];
  const ids = rows.map((item) => String(item.id)).filter(Boolean);
  const names = rows.map((item) => item.userAccount || '--').join('、');
  return { ids, names };
}

async function changeStatus(ids: string[], names: string, isEnable: boolean) {
  const actionText = isEnable ? '启用' : '停用';
  await obConfirm.warn(`您确认要${actionText}租户管理员${names}？`, `${actionText}确认`);

  const response = await tenantManagerApi.deactivate({
    ids,
    isEnable
  });

  if (response.code !== 200) {
    throw new Error(response.message || `${actionText}失败`);
  }

  message.success(`${actionText}成功`);
  await onSearch(false);
}

async function handleStatus(row: TenantManagerRecord) {
  try {
    await changeStatus([String(row.id)], row.userAccount || '--', !isEnabled(row));
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return;
    }
    const errorMessage = error instanceof Error ? error.message : '操作失败';
    message.error(errorMessage);
  }
}

async function handleStatusMultiple(isEnable: boolean) {
  const { ids, names } = getSelectedIdsAndNames();
  if (!ids.length) {
    message.error('请先选择租户管理员');
    return;
  }

  try {
    await changeStatus(ids, names, isEnable);
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return;
    }
    const errorMessage = error instanceof Error ? error.message : '操作失败';
    message.error(errorMessage);
  }
}

async function handleResetPassword(row: TenantManagerRecord) {
  try {
    await resetPassword(row);
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return;
    }
    const errorMessage = error instanceof Error ? error.message : '重置密码失败';
    message.error(errorMessage);
  }
}
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="租户管理员管理"
      :columns="tenantManagerColumns"
      :selected-num="selectedNum"
      placeholder="请输入租户名称搜索"
      :keyword="searchForm.tenantName"
      @selection-cancel="onSelectionCancel(tableRef)"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button :icon="Lock" @click="handleStatusMultiple(false)">批量停用</el-button>
        <el-button type="primary" :icon="Unlock" @click="handleStatusMultiple(true)">
          批量启用
        </el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          :ref="tableRef"
          :size
          :loading
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          row-key="id"
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #isEnable="{ row }">
            <el-tag :type="getStatusType(row)">{{ getStatusText(row) }}</el-tag>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="handleStatus(row)">
                {{ isEnabled(row) ? '停用' : '启用' }}
              </el-button>
              <el-button link type="primary" :size="actionSize" @click="handleResetPassword(row)">
                重置密码
              </el-button>
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <TenantManagerSearchForm ref="searchRef" v-model="searchForm" />
      </template>
    </ObTableBox>
  </ObPageContainer>
</template>
