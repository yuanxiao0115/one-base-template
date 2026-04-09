<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { TableColumnList } from '@one-base-template/ui';
import { confirm, message } from '@one-base-template/ui';
import { loginPageApi } from './api';
import LoginPageEditForm from './components/LoginPageEditForm.vue';
import type { LoginPageFormModel, LoginPagePayload, LoginPageRecord } from './types';
import { createLatestRequestGuard } from '../shared/latestRequest';
import {
  getErrorMessage,
  normalizeFodderId,
  normalizePageRecords,
  normalizePageTotal
} from '../shared/utils';

defineOptions({
  name: 'PortalLoginPageManagement'
});

interface LoginPageFormExpose {
  validate?: () => Promise<boolean> | boolean;
  clearValidate?: () => void;
  resetFields?: () => void;
}

const router = useRouter();

const loading = ref(false);
const rows = ref<LoginPageRecord[]>([]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const searchForm = reactive<{
  searchKey: string;
}>({
  searchKey: ''
});

const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const dialogSubmitting = ref(false);
const dialogDetailLoading = ref(false);
const dialogFormRef = ref<LoginPageFormExpose>();
const dialogForm = ref<LoginPageFormModel>(createDefaultFormModel());
const statusLoadingMap = ref<Record<string, boolean>>({});

const listGuard = createLatestRequestGuard();
const detailGuard = createLatestRequestGuard();

const tableColumns: TableColumnList = [
  {
    label: '模板名称',
    prop: 'modelName',
    minWidth: 240
  },
  {
    label: '创建人',
    prop: 'creator',
    minWidth: 140
  },
  {
    label: '修改时间',
    prop: 'createTime',
    minWidth: 180
  },
  {
    label: '状态',
    prop: 'isAvailable',
    minWidth: 120,
    slot: 'status'
  },
  {
    label: '操作',
    width: 260,
    fixed: 'right',
    align: 'right',
    slot: 'operation'
  }
];

const tablePagination = computed(() => ({
  currentPage: currentPage.value,
  pageSize: pageSize.value,
  total: total.value
}));

const dialogTitle = computed(() =>
  dialogMode.value === 'add' ? '新增登录页模板' : '编辑登录页模板'
);
const dialogContainerMode = computed(() => (dialogMode.value === 'add' ? 'create' : 'edit'));

function createDefaultFormModel(): LoginPageFormModel {
  return {
    id: '',
    modelName: '',
    webLogoText: '',
    webLoginLogoId: '',
    loginPageFodderIds: [],
    boxLocation: 'right',
    boxOpacity: 100
  };
}

function normalizeFormModel(record?: LoginPageRecord | null): LoginPageFormModel {
  const fodderIds = Array.isArray(record?.loginPageFodders)
    ? record.loginPageFodders.map((item) => normalizeFodderId(item)).filter((id) => Boolean(id))
    : [];

  return {
    id: record?.id || '',
    modelName: record?.modelName || '',
    webLogoText: record?.webLogoText || '',
    webLoginLogoId: normalizeFodderId(record?.webLoginLogo),
    loginPageFodderIds: Array.from(new Set(fodderIds)),
    boxLocation: record?.boxLocation === 'center' ? 'center' : 'right',
    boxOpacity: typeof record?.boxOpacity === 'number' ? record.boxOpacity : 100
  };
}

function buildPayload(form: LoginPageFormModel): LoginPagePayload {
  const fodderIds = Array.from(
    new Set(form.loginPageFodderIds.map((item) => item.trim()).filter((item) => Boolean(item)))
  );

  return {
    id: form.id || undefined,
    modelName: form.modelName.trim(),
    webLogoText: form.webLogoText.trim() || undefined,
    webLoginLogo: form.webLoginLogoId.trim() || undefined,
    loginPageFodders: fodderIds.map((fodderId) => ({ fodderId })),
    boxLocation: form.boxLocation,
    boxOpacity: form.boxOpacity
  };
}

function setStatusLoading(id: string, loadingFlag: boolean) {
  statusLoadingMap.value = {
    ...statusLoadingMap.value,
    [id]: loadingFlag
  };
}

function getStatusLoading(id: string): boolean {
  return Boolean(statusLoadingMap.value[id]);
}

async function loadList(page = currentPage.value) {
  const token = listGuard.next();
  loading.value = true;
  currentPage.value = page;

  try {
    const response = await loginPageApi.page({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      searchKey: searchForm.searchKey.trim() || undefined
    });

    if (!listGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载登录页列表失败');
    }

    rows.value = normalizePageRecords(response.data) as LoginPageRecord[];
    total.value = normalizePageTotal(response.data);
  } catch (error) {
    if (!listGuard.isLatest(token)) {
      return;
    }
    rows.value = [];
    total.value = 0;
    message.error(getErrorMessage(error, '加载登录页列表失败'));
  } finally {
    if (listGuard.isLatest(token)) {
      loading.value = false;
    }
  }
}

function tableSearch(keyword: string) {
  searchForm.searchKey = keyword;
  void loadList(1);
}

function onKeywordUpdate(keyword: string) {
  searchForm.searchKey = keyword;
}

function onResetSearch() {
  searchForm.searchKey = '';
  void loadList(1);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  void loadList(1);
}

function handlePageCurrentChange(page: number) {
  void loadList(page);
}

function openCreate() {
  dialogMode.value = 'add';
  dialogDetailLoading.value = false;
  detailGuard.invalidate();
  dialogForm.value = createDefaultFormModel();
  dialogVisible.value = true;
}

async function openEdit(row: LoginPageRecord) {
  dialogMode.value = 'edit';
  dialogVisible.value = true;
  await loadDetail(row.id);
}

async function loadDetail(id: string) {
  dialogDetailLoading.value = true;
  dialogForm.value = createDefaultFormModel();
  const token = detailGuard.next();

  try {
    const response = await loginPageApi.detail(id);
    if (!detailGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载模板详情失败');
    }

    dialogForm.value = normalizeFormModel(response.data);
    dialogFormRef.value?.clearValidate?.();
  } catch (error) {
    if (!detailGuard.isLatest(token)) {
      return;
    }
    dialogVisible.value = false;
    message.error(getErrorMessage(error, '加载模板详情失败'));
  } finally {
    if (detailGuard.isLatest(token)) {
      dialogDetailLoading.value = false;
    }
  }
}

function closeDialog() {
  dialogVisible.value = false;
  dialogSubmitting.value = false;
  dialogDetailLoading.value = false;
  detailGuard.invalidate();
}

async function submitDialog() {
  if (dialogSubmitting.value) {
    return;
  }

  const validateResult = await dialogFormRef.value?.validate?.();
  if (!validateResult) {
    return;
  }

  dialogSubmitting.value = true;

  try {
    const payload = buildPayload(dialogForm.value);
    const response =
      dialogMode.value === 'add'
        ? await loginPageApi.add(payload)
        : await loginPageApi.update(payload);

    if (response.code !== 200) {
      throw new Error(response.message || '保存模板失败');
    }

    message.success(dialogMode.value === 'add' ? '新增成功' : '更新成功');
    closeDialog();
    await loadList(dialogMode.value === 'add' ? 1 : currentPage.value);
  } catch (error) {
    message.error(getErrorMessage(error, '保存模板失败'));
  } finally {
    dialogSubmitting.value = false;
  }
}

async function removeRow(row: LoginPageRecord) {
  try {
    await confirm.warn(`是否确认删除名称为 ${row.modelName || '--'} 的模板？`, '删除确认');
  } catch {
    return;
  }

  try {
    const response = await loginPageApi.remove(row.id);
    if (response.code !== 200) {
      throw new Error(response.message || '删除模板失败');
    }

    message.success('删除成功');
    const nextPage =
      rows.value.length <= 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value;
    await loadList(nextPage);
  } catch (error) {
    message.error(getErrorMessage(error, '删除模板失败'));
  }
}

async function handleStatusChange(row: LoginPageRecord, nextValue: string | number | boolean) {
  const id = row.id;
  if (!id || getStatusLoading(id)) {
    return;
  }

  const targetStatus = Number(nextValue) === 1 ? 1 : 0;
  const previousStatus = row.isAvailable === 1 ? 1 : 0;
  if (targetStatus === previousStatus) {
    return;
  }

  setStatusLoading(id, true);
  try {
    const response = await loginPageApi.updateStatus({
      id,
      isAvailable: targetStatus
    });
    if (response.code !== 200) {
      throw new Error(response.message || '状态更新失败');
    }

    row.isAvailable = targetStatus;
    message.success('状态更新成功');
  } catch (error) {
    row.isAvailable = previousStatus;
    message.error(getErrorMessage(error, '状态更新失败'));
  } finally {
    setStatusLoading(id, false);
  }
}

function openPreview(row: LoginPageRecord) {
  void router.push(`/portal/login-page/preview/${row.id}`);
}

onMounted(() => {
  void loadList(1);
});
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="登录页管理"
      :columns="tableColumns"
      placeholder="请输入模板名称"
      :keyword="searchForm.searchKey"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" @click="openCreate">新增模板</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObTable
          :size
          :loading="loading"
          :data="rows"
          :columns="dynamicColumns"
          :pagination="tablePagination"
          row-key="id"
          @page-size-change="handlePageSizeChange"
          @page-current-change="handlePageCurrentChange"
        >
          <template #status="{ row }">
            <el-switch
              :model-value="row.isAvailable ?? 0"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              active-text="启用"
              inactive-text="停用"
              :loading="getStatusLoading(row.id)"
              @change="handleStatusChange(row, $event)"
            />
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="openEdit(row)"
                >编辑</el-button
              >
              <el-button link :size="actionSize" @click="openPreview(row)">预览</el-button>
              <el-button link type="danger" :size="actionSize" @click="removeRow(row)"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObTable>
      </template>
    </ObTableBox>
  </ObPageContainer>

  <ObCrudContainer
    v-model="dialogVisible"
    container="dialog"
    :mode="dialogContainerMode"
    :title="dialogTitle"
    :loading="dialogSubmitting || dialogDetailLoading"
    confirm-text="保存"
    :dialog-width="760"
    @confirm="submitDialog"
    @cancel="closeDialog"
    @close="closeDialog"
  >
    <LoginPageEditForm ref="dialogFormRef" v-model="dialogForm" :disabled="dialogDetailLoading" />
  </ObCrudContainer>
</template>
