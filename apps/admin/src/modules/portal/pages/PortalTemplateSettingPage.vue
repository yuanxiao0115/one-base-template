<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

import { portalApi } from '../api/portal';
import type { BizResponse, PortalTemplate, PortalTab } from '../types';
import { containsTabId, findFirstPageTabId } from '../utils/portalTree';

import PortalPreviewIframe from '../components/designer/PortalPreviewIframe.vue';
import PortalTabTree from '../components/designer/PortalTabTree.vue';
import CreateBlankPageDialog from '../components/designer/CreateBlankPageDialog.vue';

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

const createVisible = ref(false);
const createParentId = ref<string | number>(0);

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

function openCreateRoot() {
  createParentId.value = 0;
  createVisible.value = true;
}

function openCreateSibling(node: PortalTab) {
  createParentId.value = node.parentId ?? 0;
  createVisible.value = true;
}

function openCreateChild(node: PortalTab) {
  if (node.tabType !== 1) return;
  if (!node.id) return;
  createParentId.value = node.id;
  createVisible.value = true;
}

async function onCreateSubmit(payload: { tabName: string }) {
  if (!templateId.value) return;
  if (creating.value) return;

  creating.value = true;
  try {
    const res = await portalApi.tab.add({
      templateId: templateId.value,
      parentId: createParentId.value,
      tabName: payload.tabName,
      tabType: 2,
      tabUrl: '',
      order: 0,
      tabUrlOpenMode: null,
      tabIcon: '',
      pageLayout: JSON.stringify({ component: [] }),
      cmptInsts: [],
    });

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

    router.push({
      path: '/portal/layout',
      query: { templateId: templateId.value, tabId: newTabId },
    });
  } finally {
    creating.value = false;
    createVisible.value = false;
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
        <el-button type="primary" @click="openCreateRoot">新建空白页</el-button>
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

    <CreateBlankPageDialog v-model="createVisible" :loading="creating" @submit="onCreateSubmit" />
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

