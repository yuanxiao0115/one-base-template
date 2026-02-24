<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

import { portalApi } from '../api/portal';
import type { BizResponse, PageResult, PortalTemplate } from '../types';
import { findFirstPageTabId } from '../utils/portalTree';
import PortalTemplateCreateDialog from '../components/template/PortalTemplateCreateDialog.vue';

defineOptions({ name: 'PortalTemplateList' });

type BizResLike = Pick<BizResponse<unknown>, 'code' | 'success' | 'message'>;

const router = useRouter();

const loading = ref(false);
const searchKey = ref('');
const publishStatus = ref(-1); // -1 表示全部（Element Plus el-option 不接受 null/undefined）

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const rows = ref<PortalTemplate[]>([]);

const createVisible = ref(false);
const creating = ref(false);

function normalizeBizOk(res: BizResLike | null | undefined): boolean {
  const code = res?.code;
  return res?.success === true || code === 0 || code === 200 || String(code) === '0' || String(code) === '200';
}

function normalizePageTotal(data: PageResult<unknown> | null | undefined): number {
  const raw = (data as Record<string, unknown> | null)?.total ?? (data as Record<string, unknown> | null)?.totalCount ?? 0;
  const val = Number(raw);
  return Number.isFinite(val) ? val : 0;
}

function normalizeRecords(data: PageResult<PortalTemplate> | null | undefined): PortalTemplate[] {
  const raw = (data as PageResult<PortalTemplate> | null)?.records;
  return Array.isArray(raw) ? raw : [];
}

function isPublished(row: PortalTemplate): boolean {
  return Number(row.publishStatus) === 1;
}

function getPublishStatusText(row: PortalTemplate): string {
  const val = Number(row.publishStatus);
  if (val === 1) return '已发布';
  if (val === 0) return '草稿';
  return '未知';
}

function normalizeIdLike(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function extractTemplateId(value: unknown): string {
  // 尽量兼容不同环境：可能返回 string/number，或 { id } / { templateId }
  const direct = normalizeIdLike(value);
  if (direct) return direct;

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return normalizeIdLike(obj.id) || normalizeIdLike(obj.templateId) || '';
  }

  return '';
}

async function queryList(page = currentPage.value) {
  loading.value = true;
  try {
    currentPage.value = page;

    const res = await portalApi.template.list({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      searchKey: searchKey.value || undefined,
      publishStatus: publishStatus.value === -1 ? undefined : publishStatus.value
    });

    if (!normalizeBizOk(res)) {
      ElMessage.error(res?.message || '加载失败');
      rows.value = [];
      total.value = 0;
      return;
    }

    rows.value = normalizeRecords(res?.data);
    total.value = normalizePageTotal(res?.data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '加载失败';
    ElMessage.error(msg);
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  queryList(1).catch(() => {});
}

function onReset() {
  searchKey.value = '';
  publishStatus.value = -1;
  queryList(1).catch(() => {});
}

function openCreate() {
  createVisible.value = true;
}

async function onCreateTemplate(payload: { templateName: string; description: string; templateType: number; isOpen: number }) {
  if (creating.value) return;

  creating.value = true;
  try {
    const res = await portalApi.template.add({
      templateName: payload.templateName,
      description: payload.description || '',
      // 对齐老项目的必填字段，避免后端校验失败
      templateType: payload.templateType,
      isOpen: payload.isOpen,
      // 这些字段在部分环境可能存在默认值，显式传递更稳妥（后端可忽略）
      widthSize: 1280,
      widthType: 1,
      autoWidthSize: 100,
    });

    if (!normalizeBizOk(res)) {
      ElMessage.error(res?.message || '创建失败');
      return;
    }

    const newId = extractTemplateId((res as BizResponse<unknown> | null)?.data);
    ElMessage.success('创建成功');
    createVisible.value = false;

    // 创建后默认进入配置（符合老项目“创建即配置”的常用操作路径）
    if (newId) {
      router.push({ path: '/portal/designer', query: { templateId: newId } }).catch(() => {});
      return;
    }

    await queryList(1);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '创建失败';
    ElMessage.error(msg);
  } finally {
    creating.value = false;
  }
}

function goDesigner(row: PortalTemplate) {
  const id = row.id;
  if (!id) return;
  router.push({ path: '/portal/designer', query: { templateId: id } }).catch(() => {});
}

async function openPreview(row: PortalTemplate) {
  const id = row.id;
  if (!id) return;

  try {
    const res = await portalApi.template.detail({ id });
    if (!normalizeBizOk(res)) {
      ElMessage.error(res?.message || '获取模板详情失败');
      return;
    }

    const tpl = res.data;
    const tabIdFromTree = findFirstPageTabId(tpl?.tabList);
    const tabId = tabIdFromTree || (Array.isArray(tpl?.tabIds) ? (tpl?.tabIds?.[0] || '') : '');
    if (!tabId) {
      ElMessage.warning('该模板暂无可预览页面');
      return;
    }

    window.open(`/portal/preview/${tabId}?templateId=${id}`, '_blank');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '预览失败';
    ElMessage.error(msg);
  }
}

async function togglePublish(row: PortalTemplate) {
  const id = row.id;
  if (!id) return;

  const nextStatus = isPublished(row) ? 0 : 1;
  const text = nextStatus === 1 ? '发布' : '取消发布';

  const res = await portalApi.template.publish({ id, status: nextStatus });
  if (!normalizeBizOk(res)) {
    ElMessage.error(res?.message || `${text}失败`);
    return;
  }

  ElMessage.success(`${text}成功`);
  await queryList();
}

async function deleteTemplate(row: PortalTemplate) {
  const id = row.id;
  if (!id) return;

  try {
    await ElMessageBox.confirm('确定要删除该门户模板吗？', '删除确认', { type: 'warning' });
  } catch {
    return;
  }

  const res = await portalApi.template.delete({ id });
  if (!normalizeBizOk(res)) {
    ElMessage.error(res?.message || '删除失败');
    return;
  }

  ElMessage.success('删除成功');

  // 若当前页删空，自动回退上一页（避免出现空白页体验差）
  const nextPage = rows.value.length <= 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value;
  await queryList(nextPage);
}

onMounted(() => {
  queryList(1).catch(() => {});
});
</script>

<template>
  <div class="space-y-3 portal-template-list">
    <el-card shadow="never" class="toolbar-card">
      <template #header>
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="title">门户模板</div>
            <div class="sub">创建、配置并发布门户模板</div>
          </div>
          <div class="toolbar-right">
            <el-button :loading="loading" @click="queryList(1)">刷新</el-button>
            <el-button type="primary" @click="openCreate">新增门户</el-button>
          </div>
        </div>
      </template>

      <div class="filters">
        <div class="filter-item">
          <div class="label">门户名称</div>
          <el-input
            v-model.trim="searchKey"
            placeholder="输入门户名称"
            clearable
            @keydown.enter="onSearch"
            @clear="onSearch"
          />
        </div>

        <div class="filter-item small">
          <div class="label">发布状态</div>
          <el-select v-model="publishStatus" placeholder="全部">
            <el-option :value="-1" label="全部" />
            <el-option :value="0" label="草稿" />
            <el-option :value="1" label="已发布" />
          </el-select>
        </div>

        <div class="filter-actions">
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="rows" row-key="id" stripe style="width: 100%">
        <template #empty>
          <div class="table-empty">
            <el-empty description="暂无门户模板" :image-size="90">
              <el-button type="primary" @click="openCreate">新增门户</el-button>
            </el-empty>
          </div>
        </template>

        <el-table-column prop="templateName" label="门户名称" min-width="220" />
        <el-table-column label="描述" min-width="280">
          <template #default="{ row }">
            <span class="text-[var(--el-text-color-regular)]">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="isPublished(row) ? 'success' : 'info'">
              {{ getPublishStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2 flex-wrap">
              <el-button link type="primary" @click="goDesigner(row)">配置</el-button>
              <el-button link @click="openPreview(row)">预览</el-button>
              <el-button link @click="togglePublish(row)">{{ isPublished(row) ? '取消发布' : '发布' }}</el-button>
              <el-button link type="danger" @click="deleteTemplate(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-3 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="queryList"
          @size-change="() => queryList(1)"
        />
      </div>
    </el-card>

    <PortalTemplateCreateDialog
      v-model="createVisible"
      :loading="creating"
      @submit="onCreateTemplate"
    />
  </div>
</template>

<style scoped>
.toolbar-card {
  border-radius: 12px;
}

.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.toolbar-left {
  min-width: 0;
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.sub {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

.filter-item {
  width: 260px;
}

.filter-item.small {
  width: 160px;
}

.label {
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex: none;
}

.table-card {
  border-radius: 12px;
}

.portal-template-list :deep(.el-card__header) {
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-bg-color-overlay) 100%);
}

.portal-template-list :deep(.el-table__row) {
  transition: background-color 160ms ease;
}

.table-empty {
  padding: 36px 0 24px;
}
</style>
