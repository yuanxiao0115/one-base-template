<!-- eslint-disable max-lines -->
<script setup lang="ts">
/* eslint-disable max-lines */
import { getCurrentInstance, onMounted, reactive, ref, watch } from 'vue';
import type { TableColumnList } from '@one-base-template/ui';
import { confirm, message } from '@one-base-template/ui';
import { openPersonnelSelection } from '@/components/PersonnelSelector';
import type { PersonnelSelectedUser } from '@/components/PersonnelSelector/types';
import {
  fetchPersonnelTreeByLegacyApi,
  searchPersonnelUsersByStructure
} from '@/components/PersonnelSelector/contactDataSource';
import { loginNoticeApi } from './api';
import LoginNoticeEditForm from './components/LoginNoticeEditForm.vue';
import type {
  LoginNoticeFormModel,
  LoginNoticePayload,
  LoginNoticeRecord,
  LoginNoticeUserPopup
} from './types';
import { createLatestRequestGuard } from '../shared/latestRequest';
import {
  getErrorMessage,
  isHttpUrl,
  normalizePageRecords,
  normalizePageTotal
} from '../shared/utils';

defineOptions({
  name: 'PortalLoginNoticeManagement'
});

interface LoginNoticeFormExpose {
  validate?: () => Promise<boolean> | boolean;
  clearValidate?: () => void;
  resetFields?: () => void;
}

const instance = getCurrentInstance();
const loading = ref(false);
const rows = ref<LoginNoticeRecord[]>([]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const searchForm = reactive<{
  title: string;
}>({
  title: ''
});

const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const dialogSubmitting = ref(false);
const dialogDetailLoading = ref(false);
const dialogFormRef = ref<LoginNoticeFormExpose>();
const dialogForm = ref<LoginNoticeFormModel>(createDefaultFormModel());
const pickingUsers = ref(false);
const publishLoadingMap = ref<Record<string, boolean>>({});

const previewVisible = ref(false);
const previewLoading = ref(false);
const previewData = ref<LoginNoticeFormModel>(createDefaultFormModel());

const listGuard = createLatestRequestGuard();
const detailGuard = createLatestRequestGuard();
const previewGuard = createLatestRequestGuard();

const tableColumns: TableColumnList = [
  {
    label: '标题',
    prop: 'title',
    minWidth: 180
  },
  {
    label: '信息内容',
    prop: 'content',
    minWidth: 220
  },
  {
    label: '状态',
    prop: 'isPublish',
    minWidth: 100,
    slot: 'isPublish'
  },
  {
    label: '创建人',
    prop: 'creator',
    minWidth: 120
  },
  {
    label: '创建时间',
    prop: 'createTime',
    minWidth: 180
  },
  {
    label: '操作',
    width: 320,
    align: 'right',
    fixed: 'right',
    slot: 'operation'
  }
];

function createDefaultFormModel(): LoginNoticeFormModel {
  return {
    id: '',
    title: '',
    content: '',
    frequency: '',
    time: [],
    notificationScope: 0,
    userPopUps: [],
    notificationType: 1,
    popSize: '0',
    showTitle: 1,
    showContent: 1,
    showBtn: 0,
    linkUrl: '',
    backgroundId: ''
  };
}

function normalizeUserPopups(value: unknown): LoginNoticeUserPopup[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const record = item as {
        userId?: string;
        nickName?: string;
      };
      if (!record.userId || !record.nickName) {
        return null;
      }
      return {
        userId: record.userId,
        nickName: record.nickName
      };
    })
    .filter((item): item is LoginNoticeUserPopup => Boolean(item));
}

function normalizeFormModel(record?: LoginNoticeRecord | null): LoginNoticeFormModel {
  return {
    id: record?.id || '',
    title: record?.title || '',
    content: record?.content || '',
    frequency: record?.frequency || '',
    time: record?.beginDate && record?.endDate ? [record.beginDate, record.endDate] : [],
    notificationScope: record?.notificationScope === 1 ? 1 : 0,
    userPopUps: normalizeUserPopups(record?.userPopUps),
    notificationType:
      record?.notificationType === 0 || record?.notificationType === 2
        ? record.notificationType
        : 1,
    popSize: record?.popSize || '0',
    showTitle: record?.showTitle === 0 ? 0 : 1,
    showContent: record?.showContent === 0 ? 0 : 1,
    showBtn: record?.showBtn === 1 ? 1 : 0,
    linkUrl: record?.linkUrl || '',
    backgroundId: record?.backgroundId || ''
  };
}

function cloneFormModel(form: LoginNoticeFormModel): LoginNoticeFormModel {
  return {
    ...form,
    time: [...form.time],
    userPopUps: form.userPopUps.map((item) => ({ ...item }))
  };
}

function buildPayload(form: LoginNoticeFormModel): LoginNoticePayload {
  const [beginDate, endDate] = Array.isArray(form.time) ? form.time : [];
  if (!beginDate || !endDate) {
    throw new Error('请选择通知时间范围');
  }

  return {
    id: form.id || undefined,
    title: form.title.trim(),
    content: form.content.trim(),
    frequency: form.frequency,
    beginDate,
    endDate,
    notificationScope: form.notificationScope,
    userPopUps:
      form.notificationScope === 1
        ? form.userPopUps.map((item) => ({
            userId: item.userId,
            nickName: item.nickName
          }))
        : [],
    notificationType: form.notificationType,
    popSize: form.popSize,
    showTitle: form.showTitle,
    showContent: form.showContent,
    showBtn: form.showBtn,
    linkUrl: form.showBtn === 1 ? form.linkUrl.trim() || undefined : undefined,
    backgroundId: form.backgroundId.trim() || undefined
  };
}

function setPublishLoading(id: string, loadingFlag: boolean) {
  publishLoadingMap.value = {
    ...publishLoadingMap.value,
    [id]: loadingFlag
  };
}

function getPublishLoading(id: string): boolean {
  return Boolean(publishLoadingMap.value[id]);
}

async function loadList(page = currentPage.value) {
  const token = listGuard.next();
  loading.value = true;
  currentPage.value = page;

  try {
    const response = await loginNoticeApi.page({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      title: searchForm.title.trim() || undefined
    });

    if (!listGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载弹窗通知列表失败');
    }

    rows.value = normalizePageRecords(response.data) as LoginNoticeRecord[];
    total.value = normalizePageTotal(response.data);
  } catch (error) {
    if (!listGuard.isLatest(token)) {
      return;
    }
    rows.value = [];
    total.value = 0;
    message.error(getErrorMessage(error, '加载弹窗通知列表失败'));
  } finally {
    if (listGuard.isLatest(token)) {
      loading.value = false;
    }
  }
}

function tableSearch(keyword: string) {
  searchForm.title = keyword;
  void loadList(1);
}

function onKeywordUpdate(keyword: string) {
  searchForm.title = keyword;
}

function onResetSearch() {
  searchForm.title = '';
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

async function openEdit(row: LoginNoticeRecord) {
  dialogMode.value = 'edit';
  dialogVisible.value = true;
  await loadDetail(row.id);
}

async function loadDetail(id: string) {
  dialogDetailLoading.value = true;
  dialogForm.value = createDefaultFormModel();
  const token = detailGuard.next();

  try {
    const response = await loginNoticeApi.detail(id);
    if (!detailGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载弹窗详情失败');
    }

    dialogForm.value = normalizeFormModel(response.data);
    dialogFormRef.value?.clearValidate?.();
  } catch (error) {
    if (!detailGuard.isLatest(token)) {
      return;
    }
    dialogVisible.value = false;
    message.error(getErrorMessage(error, '加载弹窗详情失败'));
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
  pickingUsers.value = false;
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
    const response = await loginNoticeApi.save(payload);
    if (response.code !== 200) {
      throw new Error(response.message || '保存弹窗通知失败');
    }

    message.success('保存成功');
    closeDialog();
    await loadList(dialogMode.value === 'add' ? 1 : currentPage.value);
  } catch (error) {
    message.error(getErrorMessage(error, '保存弹窗通知失败'));
  } finally {
    dialogSubmitting.value = false;
  }
}

async function publishCurrentForm() {
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
    const response = await loginNoticeApi.publish(payload);
    if (response.code !== 200) {
      throw new Error(response.message || '发布失败');
    }

    message.success('发布成功');
    closeDialog();
    await loadList(currentPage.value);
  } catch (error) {
    message.error(getErrorMessage(error, '发布失败'));
  } finally {
    dialogSubmitting.value = false;
  }
}

async function removeRow(row: LoginNoticeRecord) {
  try {
    await confirm.warn('您确认要删除该弹窗通知吗？', '删除确认');
  } catch {
    return;
  }

  try {
    const response = await loginNoticeApi.remove(row.id);
    if (response.code !== 200) {
      throw new Error(response.message || '删除失败');
    }

    message.success('删除成功');
    const nextPage =
      rows.value.length <= 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value;
    await loadList(nextPage);
  } catch (error) {
    message.error(getErrorMessage(error, '删除失败'));
  }
}

async function publishRow(row: LoginNoticeRecord) {
  const id = row.id;
  if (!id || getPublishLoading(id)) {
    return;
  }

  setPublishLoading(id, true);
  try {
    const detailResponse = await loginNoticeApi.detail(id);
    if (detailResponse.code !== 200) {
      throw new Error(detailResponse.message || '加载发布详情失败');
    }

    const payload = buildPayload(normalizeFormModel(detailResponse.data));
    const publishResponse = await loginNoticeApi.publish(payload);
    if (publishResponse.code !== 200) {
      throw new Error(publishResponse.message || '发布失败');
    }

    message.success('发布成功');
    await loadList(currentPage.value);
  } catch (error) {
    message.error(getErrorMessage(error, '发布失败'));
  } finally {
    setPublishLoading(id, false);
  }
}

async function openPreviewByRow(row: LoginNoticeRecord) {
  previewVisible.value = true;
  previewLoading.value = true;
  previewData.value = createDefaultFormModel();
  const token = previewGuard.next();

  try {
    const response = await loginNoticeApi.detail(row.id);
    if (!previewGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载预览详情失败');
    }

    previewData.value = normalizeFormModel(response.data);
  } catch (error) {
    if (!previewGuard.isLatest(token)) {
      return;
    }
    previewVisible.value = false;
    message.error(getErrorMessage(error, '加载预览详情失败'));
  } finally {
    if (previewGuard.isLatest(token)) {
      previewLoading.value = false;
    }
  }
}

function openPreviewByForm() {
  previewGuard.invalidate();
  previewLoading.value = false;
  previewData.value = cloneFormModel(dialogForm.value);
  previewVisible.value = true;
}

function closePreview() {
  previewVisible.value = false;
  previewLoading.value = false;
  previewGuard.invalidate();
}

function openPreviewLink() {
  const url = previewData.value.linkUrl.trim();
  if (!url || !isHttpUrl(url)) {
    message.warning('当前未配置有效跳转链接');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

async function pickUsers() {
  if (pickingUsers.value) {
    return;
  }

  pickingUsers.value = true;
  try {
    const selectedItems = dialogForm.value.userPopUps.map((item) => ({
      id: item.userId,
      title: item.nickName,
      subTitle: '',
      nodeType: 'user' as const
    }));

    const result = await openPersonnelSelection({
      title: '选择用户',
      mode: 'person',
      required: false,
      selectedItems,
      model: {
        userIds: dialogForm.value.userPopUps.map((item) => item.userId),
        orgIds: [],
        roleIds: [],
        positionIds: []
      },
      fetchNodes: async ({ parentId }) => {
        const response = await fetchPersonnelTreeByLegacyApi({ parentId });
        if (response.code !== 200) {
          throw new Error(response.message || '加载组织通讯录失败');
        }
        return response.data;
      },
      searchNodes: async ({ keyword }) => {
        const response = await searchPersonnelUsersByStructure({
          search: keyword
        });
        if (response.code !== 200) {
          throw new Error(response.message || '搜索用户失败');
        }
        return response.data;
      },
      appContext: instance?.appContext
    }).catch(() => null);

    if (!result) {
      return;
    }

    dialogForm.value.userPopUps = result.users.map((item: PersonnelSelectedUser) => ({
      userId: item.id,
      nickName: item.nickName
    }));
    dialogFormRef.value?.clearValidate?.();
  } catch (error) {
    message.error(getErrorMessage(error, '选择用户失败'));
  } finally {
    pickingUsers.value = false;
  }
}

watch(
  () => dialogForm.value.notificationScope,
  (nextScope) => {
    if (nextScope === 0) {
      dialogForm.value.userPopUps = [];
      dialogFormRef.value?.clearValidate?.();
    }
  }
);

onMounted(() => {
  void loadList(1);
});
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="弹窗通知"
      :columns="tableColumns"
      placeholder="请输入标题"
      :keyword="searchForm.title"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" @click="openCreate">新建弹窗</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObTable
          :size
          :loading="loading"
          :data="rows"
          :columns="dynamicColumns"
          :pagination="{
            currentPage,
            pageSize,
            total
          }"
          row-key="id"
          @page-size-change="handlePageSizeChange"
          @page-current-change="handlePageCurrentChange"
        >
          <template #isPublish="{ row }">
            <el-tag :type="row.isPublish === 1 ? 'success' : 'info'">
              {{ row.isPublish === 1 ? '已发布' : '未发布' }}
            </el-tag>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="openEdit(row)"
                >编辑</el-button
              >
              <el-button link :size="actionSize" @click="openPreviewByRow(row)">预览</el-button>
              <el-button
                link
                type="success"
                :size="actionSize"
                :loading="getPublishLoading(row.id)"
                @click="publishRow(row)"
              >
                发布
              </el-button>
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
    :mode="dialogMode === 'add' ? 'create' : 'edit'"
    :title="dialogMode === 'add' ? '新建弹窗通知' : '编辑弹窗通知'"
    :loading="dialogSubmitting || dialogDetailLoading"
    confirm-text="保存"
    :dialog-width="820"
    @confirm="submitDialog"
    @cancel="closeDialog"
    @close="closeDialog"
  >
    <div class="login-notice-page__toolbar">
      <el-button @click="openPreviewByForm">预览当前</el-button>
      <el-button type="success" :loading="dialogSubmitting" @click="publishCurrentForm">
        发布当前配置
      </el-button>
    </div>

    <LoginNoticeEditForm
      ref="dialogFormRef"
      v-model="dialogForm"
      :disabled="dialogDetailLoading"
      :picking-users="pickingUsers"
      @pick-users="pickUsers"
    />
  </ObCrudContainer>

  <ObCrudContainer
    v-model="previewVisible"
    container="dialog"
    mode="detail"
    title="弹窗预览"
    :loading="previewLoading"
    :show-confirm-button="false"
    :show-cancel-button="false"
    :dialog-width="720"
    @close="closePreview"
  >
    <section
      class="login-notice-preview"
      :style="{
        backgroundImage: previewData.backgroundId
          ? `url(/cmict/file/resource/show?id=${previewData.backgroundId})`
          : 'linear-gradient(140deg, #f8fafc, #e2e8f0)'
      }"
    >
      <article class="login-notice-preview__card">
        <h3 v-if="previewData.showTitle === 1">{{ previewData.title || '提示' }}</h3>
        <p v-if="previewData.showContent === 1">
          {{ previewData.content || '这是通知内容预览。' }}
        </p>

        <div class="login-notice-preview__meta">
          <span>频率：{{ previewData.frequency || '--' }}</span>
          <span>类型：{{ previewData.notificationType }}</span>
          <span>尺寸：{{ previewData.popSize }}</span>
        </div>

        <div v-if="previewData.showBtn === 1" class="login-notice-preview__actions">
          <el-button type="primary" @click="openPreviewLink">查看详情</el-button>
        </div>
      </article>
    </section>
  </ObCrudContainer>
</template>

<style scoped>
.login-notice-page__toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
}

.login-notice-preview {
  min-height: 360px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  background-size: cover;
  background-position: center;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-notice-preview__card {
  width: min(560px, 100%);
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.login-notice-preview__card h3 {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.login-notice-preview__card p {
  margin: 0;
  color: #1f2937;
  line-height: 1.7;
  white-space: pre-wrap;
}

.login-notice-preview__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #475569;
  font-size: 12px;
}

.login-notice-preview__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
