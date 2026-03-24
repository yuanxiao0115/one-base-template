<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { useTable } from '@one-base-template/core';
import { message, obConfirm, type CrudFormLike } from '@one-base-template/ui';
import tenantInfoColumns from './columns';
import TenantInfoSearchForm from './components/TenantInfoSearchForm.vue';
import TenantInfoEditForm from './components/TenantInfoEditForm.vue';
import TenantInfoPermissionDialog from './components/TenantInfoPermissionDialog.vue';
import { tenantInfoApi } from './api';
import {
  createTenantInfoForm,
  tenantInfoFormRules,
  toTenantInfoForm,
  toTenantInfoPayload
} from './form';
import type { TenantInfoRecord } from './types';

defineOptions({
  name: 'TenantInfoManagementPage'
});

interface SearchRefExpose {
  resetFields?: () => void;
}

type EditorMode = 'create' | 'edit' | 'detail';

const tableRef = ref<unknown>(null);
const searchRef = ref<SearchRefExpose>();
const editFormRef = ref<CrudFormLike>();

const searchForm = reactive({
  tenantName: '',
  id: '',
  contactName: '',
  tenantState: '' as string | number
});

const tableOpt = reactive({
  query: {
    api: tenantInfoApi.page,
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
  handleSizeChange,
  handleCurrentChange
} = useTable(tableOpt, tableRef);

const editor = reactive({
  visible: false,
  mode: 'create' as EditorMode,
  title: '新增租户',
  readonly: false,
  submitting: false,
  currentId: '',
  form: createTenantInfoForm()
});

const permissionDialog = reactive({
  visible: false,
  tenantId: '',
  tenantName: ''
});

function isTenantEnabled(row: TenantInfoRecord): boolean {
  return Number(row.tenantState ?? 0) === 0;
}

function getTenantStatusType(row: TenantInfoRecord): 'success' | 'danger' | 'warning' {
  const value = Number(row.tenantState ?? 0);
  if (value === 0) {
    return 'success';
  }
  if (value === 1) {
    return 'danger';
  }
  return 'warning';
}

function getTenantStatusText(row: TenantInfoRecord): string {
  const value = Number(row.tenantState ?? 0);
  if (value === 0) {
    return '正常';
  }
  if (value === 1) {
    return '停用';
  }
  return '过期';
}

function openCreate() {
  editor.visible = true;
  editor.mode = 'create';
  editor.title = '新增租户';
  editor.readonly = false;
  editor.currentId = '';
  Object.assign(editor.form, createTenantInfoForm());
}

function openEdit(row: TenantInfoRecord) {
  editor.visible = true;
  editor.mode = 'edit';
  editor.title = '编辑租户';
  editor.readonly = false;
  editor.currentId = row.id;
  Object.assign(editor.form, toTenantInfoForm(row));
}

function openDetail(row: TenantInfoRecord) {
  editor.visible = true;
  editor.mode = 'detail';
  editor.title = '查看租户';
  editor.readonly = true;
  editor.currentId = row.id;
  Object.assign(editor.form, toTenantInfoForm(row));
}

function openPermission(row: TenantInfoRecord) {
  permissionDialog.visible = true;
  permissionDialog.tenantId = String(row.id);
  permissionDialog.tenantName = row.tenantName == null ? '' : String(row.tenantName);
}

function closeEditor() {
  editor.visible = false;
  editor.submitting = false;
  editor.currentId = '';
}

function tableSearch(keyword: string) {
  searchForm.tenantName = keyword;
  void onSearch();
}

function onKeywordUpdate(keyword: string) {
  searchForm.tenantName = keyword;
}

function onResetSearch() {
  searchForm.tenantState = '';
  resetForm(searchRef, 'tenantName');
}

function onPermissionDialogChange(visible: boolean) {
  if (visible) {
    return;
  }
  permissionDialog.tenantId = '';
  permissionDialog.tenantName = '';
}

async function onToggleStatus(row: TenantInfoRecord) {
  const nextEnable = !isTenantEnabled(row);
  const actionText = nextEnable ? '启用' : '停用';
  await obConfirm.warn(`您确定要${actionText}租户${row.tenantName || ''}吗？`, `${actionText}确认`);

  const response = await tenantInfoApi.deactivate({
    ids: String(row.id),
    isEnable: nextEnable
  });

  if (response.code !== 200) {
    throw new Error(response.message || `${actionText}租户失败`);
  }

  message.success(`${actionText}成功`);
  await onSearch(false);
}

async function onDelete(row: TenantInfoRecord) {
  await obConfirm.warn(`是否确认删除名称为${row.tenantName || ''}的这条数据`, '删除确认');

  const response = await tenantInfoApi.remove({
    idList: String(row.id)
  });

  if (response.code !== 200) {
    throw new Error(response.message || '删除租户失败');
  }

  message.success('删除成功');
  await onSearch(false);
}

async function onConfirmCrud() {
  if (editor.readonly) {
    closeEditor();
    return;
  }

  const valid = await editFormRef.value?.validate?.();
  if (!valid) {
    return;
  }

  editor.submitting = true;
  try {
    const payload = toTenantInfoPayload(editor.form);
    if (editor.mode === 'edit') {
      payload.id = editor.currentId || payload.id;
    }

    const response =
      editor.mode === 'create'
        ? await tenantInfoApi.add(payload)
        : await tenantInfoApi.update(payload);

    if (response.code !== 200) {
      throw new Error(response.message || '保存租户失败');
    }

    message.success(editor.mode === 'create' ? '新增成功' : '更新成功');
    closeEditor();
    await onSearch(false);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '保存租户失败';
    message.error(errorMessage);
  } finally {
    editor.submitting = false;
  }
}

async function handleToggleStatus(row: TenantInfoRecord) {
  try {
    await onToggleStatus(row);
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return;
    }
    const errorMessage = error instanceof Error ? error.message : '操作失败';
    message.error(errorMessage);
  }
}

async function handleDelete(row: TenantInfoRecord) {
  try {
    await onDelete(row);
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return;
    }
    const errorMessage = error instanceof Error ? error.message : '删除失败';
    message.error(errorMessage);
  }
}

async function handlePermissionSaved() {
  await onSearch(false);
}
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="租户信息管理"
      :columns="tenantInfoColumns"
      placeholder="请输入租户名称搜索"
      :keyword="searchForm.tenantName"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openCreate">新增租户</el-button>
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
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #tenantState="{ row }">
            <el-tag :type="getTenantStatusType(row)">{{ getTenantStatusText(row) }}</el-tag>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="openEdit(row)"
                >编辑</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="openDetail(row)"
                >查看</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="openPermission(row)">
                添加权限
              </el-button>
              <el-button
                link
                :type="isTenantEnabled(row) ? 'danger' : 'success'"
                :size="actionSize"
                @click="handleToggleStatus(row)"
              >
                {{ isTenantEnabled(row) ? '停用' : '启用' }}
              </el-button>
              <el-button link type="danger" :size="actionSize" @click="handleDelete(row)"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <TenantInfoSearchForm ref="searchRef" v-model="searchForm" />
      </template>
    </ObTableBox>
  </ObPageContainer>

  <ObCrudContainer
    v-model="editor.visible"
    container="drawer"
    :mode="editor.mode"
    :title="editor.title"
    :loading="editor.submitting"
    :show-cancel-button="!editor.readonly"
    confirm-text="保存"
    :drawer-size="560"
    @confirm="onConfirmCrud"
    @cancel="closeEditor"
    @close="closeEditor"
  >
    <TenantInfoEditForm
      ref="editFormRef"
      v-model="editor.form"
      :rules="tenantInfoFormRules"
      :disabled="editor.readonly"
    />
  </ObCrudContainer>

  <TenantInfoPermissionDialog
    v-model="permissionDialog.visible"
    :tenant-id="permissionDialog.tenantId"
    :tenant-name="permissionDialog.tenantName"
    @saved="handlePermissionSaved"
    @update:model-value="onPermissionDialogChange"
  />
</template>
