<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

import { portalApi } from '../api/portal';
import type { BizResponse, PortalTemplate, PortalTab } from '../types';
import { calcNextSort, containsTabId, findFirstPageTabId } from '../utils/portalTree';

import PortalPreviewIframe from '../components/designer/PortalPreviewIframe.vue';
import PortalTabTree from '../components/designer/PortalTabTree.vue';
import TabAttributeDialog from '../components/designer/TabAttributeDialog.vue';

defineOptions({
  name: 'PortalDesigner',
});

const route = useRoute();
const router = useRouter();

const templateId = computed(() => {
  const v = route.query.templateId;
  return typeof v === 'string' ? v : '';
});

const routeTabId = computed(() => {
  const v = route.query.tabId;
  return typeof v === 'string' ? v : '';
});

const loading = ref(false);
const creating = ref(false);

const templateInfo = ref<PortalTemplate | null>(null);
const currentTabId = ref('');

const attrVisible = ref(false);
const attrMode = ref<'create' | 'edit'>('create');
const attrLoading = ref(false);
const attrInitial = ref<Partial<PortalTab>>({});
const attrParentId = ref<string | number>(0);
const editingTabId = ref('');
const editingTabType = ref<number | null>(null);

type BizResLike = Pick<BizResponse<unknown>, 'code' | 'success' | 'message'>;

function normalizeBizOk(res: BizResLike | null | undefined): boolean {
  const code = res?.code;
  return res?.success === true || code === 0 || code === 200 || String(code) === '0' || String(code) === '200';
}

function getTabs(): PortalTab[] {
  return templateInfo.value?.tabList ?? [];
}

function updateRouteTabId(tabId: string) {
  const next = tabId || undefined;
  const current = routeTabId.value || undefined;
  if (current === next) return;

  router
    .replace({
      query: {
        ...route.query,
        tabId: next,
      },
    })
    .catch(() => {});
}

function setCurrentTab(tabId: string) {
  currentTabId.value = tabId;
  updateRouteTabId(tabId);
}

function normalizeIdLike(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

async function loadTemplate(preferTabId?: string) {
  if (!templateId.value) {
    templateInfo.value = null;
    currentTabId.value = '';
    return;
  }

  loading.value = true;
  try {
    const res = await portalApi.template.detail({ id: templateId.value });
    if (!normalizeBizOk(res)) {
      ElMessage.error(res?.message || '加载门户失败');
      templateInfo.value = null;
      currentTabId.value = '';
      return;
    }

    templateInfo.value = res?.data ?? null;

    const tabs = getTabs();
    const preferred = preferTabId || routeTabId.value;
    const nextTabId = preferred && containsTabId(tabs, preferred) ? preferred : findFirstPageTabId(tabs);
    setCurrentTab(nextTabId);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '加载门户失败';
    ElMessage.error(msg);
    templateInfo.value = null;
    currentTabId.value = '';
  } finally {
    loading.value = false;
  }
}

async function ensureTabLinkedToTemplate(tabId: string) {
  await loadTemplate(tabId);
  if (containsTabId(getTabs(), tabId)) return;

  const tpl = templateInfo.value;
  if (!tpl) return;

  const nextIds = Array.isArray(tpl.tabIds) ? [...tpl.tabIds] : [];
  if (!nextIds.includes(tabId)) nextIds.push(tabId);
  tpl.tabIds = nextIds;

  const res = await portalApi.template.update(tpl);
  if (!normalizeBizOk(res)) {
    ElMessage.error(res?.message || '关联页面到模板失败');
    return;
  }

  await loadTemplate(tabId);
}

function openCreate(parentId: string | number, initial?: Partial<PortalTab>) {
  attrMode.value = 'create';
  attrParentId.value = parentId;
  editingTabId.value = '';
  editingTabType.value = null;
  attrInitial.value = {
    tabType: 2,
    sort: calcNextSort(getTabs(), parentId),
    ...initial,
  };
  attrVisible.value = true;
}

function openCreateRoot() {
  openCreate(0, { tabType: 2 });
}

function openCreateSibling(node: PortalTab) {
  openCreate(node.parentId ?? 0, { tabType: 2 });
}

function openCreateChild(node: PortalTab) {
  if (node.tabType !== 1) return;
  const id = normalizeIdLike(node.id);
  if (!id) return;
  openCreate(id, { tabType: 2 });
}

async function openAttribute(node: PortalTab) {
  const id = normalizeIdLike(node.id);
  if (!id) return;
  if (!templateId.value) return;

  attrLoading.value = true;
  try {
    const res = await portalApi.tab.detail({ id });
    if (!normalizeBizOk(res)) {
      ElMessage.error(res?.message || '加载页面详情失败');
      return;
    }

    const tab = res?.data;
    attrMode.value = 'edit';
    editingTabId.value = id;
    editingTabType.value = typeof tab?.tabType === 'number' ? tab.tabType : null;
    attrParentId.value = tab?.parentId ?? 0;
    attrInitial.value = tab ?? {};
    attrVisible.value = true;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '加载页面详情失败';
    ElMessage.error(msg);
  } finally {
    attrLoading.value = false;
  }
}

async function onSubmitAttr(payload: {
  tabName: string;
  tabType: number;
  sort: number;
  tabUrl?: string;
  tabUrlOpenMode?: number;
  tabUrlSsoType?: number;
}) {
  if (!templateId.value) return;
  if (creating.value) return;

  creating.value = true;
  try {
    if (attrMode.value === 'create') {
      const data: Record<string, unknown> = {
        templateId: templateId.value,
        parentId: attrParentId.value,
        tabName: payload.tabName,
        tabType: payload.tabType,
        sort: payload.sort,
        tabIcon: '',
        order: 0,
      };

      if (payload.tabType === 3) {
        data.tabUrl = payload.tabUrl ?? '';
        data.tabUrlOpenMode = payload.tabUrlOpenMode ?? 1;
        data.tabUrlSsoType = payload.tabUrlSsoType ?? 1;
      } else {
        data.tabUrl = '';
        data.tabUrlOpenMode = 1;
        data.tabUrlSsoType = 1;
      }

      if (payload.tabType === 2) {
        data.pageLayout = JSON.stringify({ component: [] });
        data.cmptInsts = [];
      }

      const res = await portalApi.tab.add(data);
      if (!normalizeBizOk(res)) {
        ElMessage.error(res?.message || '新建失败');
        return;
      }

      const newTabId = typeof res?.data === 'string' ? res.data : '';
      if (!newTabId) {
        ElMessage.error('新建成功但未返回 tabId');
        return;
      }

      await ensureTabLinkedToTemplate(newTabId);

      if (payload.tabType === 2) {
        router.push({
          path: '/portal/layout',
          query: { templateId: templateId.value, tabId: newTabId },
        });
        return;
      }

      ElMessage.success('新建成功');
      await loadTemplate(currentTabId.value);
      return;
    }

    // 编辑：不允许修改 tabType（与老项目保持一致）
    const id = editingTabId.value;
    if (!id) return;
    const tabType = editingTabType.value ?? payload.tabType;

    const updateData: Record<string, unknown> = {
      id,
      templateId: templateId.value,
      parentId: attrParentId.value,
      tabName: payload.tabName,
      tabType,
      sort: payload.sort,
    };

    if (tabType === 3) {
      updateData.tabUrl = payload.tabUrl ?? '';
      updateData.tabUrlOpenMode = payload.tabUrlOpenMode ?? 1;
      updateData.tabUrlSsoType = payload.tabUrlSsoType ?? 1;
    }

    const res = await portalApi.tab.update(updateData);
    if (!normalizeBizOk(res)) {
      ElMessage.error(res?.message || '保存失败');
      return;
    }

    ElMessage.success('保存成功');
    await loadTemplate(currentTabId.value);
  } finally {
    creating.value = false;
    attrVisible.value = false;
  }
}

async function toggleHide(node: PortalTab) {
  if (!templateId.value) return;
  const tabId = normalizeIdLike(node.id);
  if (!tabId) return;

  const next = node.isHide === 1 ? 0 : 1;
  const text = next === 1 ? '隐藏' : '显示';

  try {
    await ElMessageBox.confirm(`确定要${text}该页面吗？`, '操作确认', { type: 'warning' });
  } catch {
    return;
  }

  const res = await portalApi.template.hideToggle({ id: templateId.value, tabId, isHide: next });
  if (!normalizeBizOk(res)) {
    ElMessage.error(res?.message || `${text}失败`);
    return;
  }

  ElMessage.success(`${text}成功`);
  await loadTemplate(currentTabId.value);
}

async function deleteTab(node: PortalTab) {
  if (!templateId.value) return;
  const tabId = normalizeIdLike(node.id);
  if (!tabId) return;

  try {
    await ElMessageBox.confirm('确定要删除该页面吗？', '删除确认', { type: 'warning' });
  } catch {
    return;
  }

  const res = await portalApi.tab.delete({ id: tabId });
  if (!normalizeBizOk(res)) {
    ElMessage.error(res?.message || '删除失败');
    return;
  }

  ElMessage.success('删除成功');
  await loadTemplate(currentTabId.value);

  if (tabId === currentTabId.value) {
    const next = findFirstPageTabId(getTabs());
    setCurrentTab(next);
  }
}

function onEdit(tabId: string) {
  if (!templateId.value) return;
  router.push({
    path: '/portal/layout',
    query: { templateId: templateId.value, tabId },
  });
}

function onBack() {
  router.push('/portal/templates');
}

void loadTemplate();
</script>

<template>
  <div class="page">
    <div class="topbar">
      <div class="left">
        <el-button @click="onBack">返回</el-button>
        <div class="title">
          <div class="name">{{ templateInfo?.templateName || '门户配置' }}</div>
          <div class="meta">templateId={{ templateId || '-' }}</div>
        </div>
      </div>
      <div class="right">
        <el-button :loading="loading" @click="loadTemplate(currentTabId)">刷新</el-button>
        <el-button type="primary" @click="openCreateRoot">新建页面</el-button>
      </div>
    </div>

    <div v-loading="loading" class="content">
      <div class="sidebar">
        <PortalTabTree
          :tabs="templateInfo?.tabList || []"
          :current-tab-id="currentTabId"
          @select="setCurrentTab"
          @edit="onEdit"
          @create-sibling="openCreateSibling"
          @create-child="openCreateChild"
          @attribute="openAttribute"
          @toggle-hide="toggleHide"
          @delete="deleteTab"
        />
      </div>

      <div class="main">
        <div v-if="!templateId" class="empty">
          <el-result icon="warning" title="缺少参数" sub-title="请通过 /portal/designer?templateId=xxx 进入" />
        </div>
        <div v-else-if="!currentTabId" class="empty">
          <el-result icon="info" title="暂无可预览页面" sub-title="请先新建一个空白页" />
        </div>
        <PortalPreviewIframe v-else :template-id="templateId" :tab-id="currentTabId" />
      </div>
    </div>

    <TabAttributeDialog
      v-model="attrVisible"
      :mode="attrMode"
      :loading="creating || attrLoading"
      :initial="attrInitial"
      @submit="onSubmitAttr"
    />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.topbar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color-overlay);
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.title {
  min-width: 0;
}

.name {
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 520px;
}

.meta {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}

.content {
  flex: 1;
  min-height: 0;
  display: flex;
}

.sidebar {
  width: 300px;
  height: 100%;
  min-height: 0;
  flex: none;
}

.main {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color-page);
}
</style>
