<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router';
import {
  createPortalPreviewDataSource,
  PortalPreviewPanel,
  type PortalPreviewDataSource,
  type PortalPreviewNavigatePayload,
  type PortalTab,
  type PortalTemplate
} from '@one-base-template/portal-engine';
import { useMaterials } from '../materials/useMaterials';
import { portalService } from '../services/portal-service';
import { findFirstPageTabId } from '../utils/portalTree';

defineOptions({
  name: 'PortalRenderPage'
});

interface BizResLike {
  code?: unknown;
  success?: unknown;
  message?: unknown;
  data?: PortalTemplate;
}

const route = useRoute();
const router = useRouter();
const { materialsMap } = useMaterials();

const routeTabId = computed(() => {
  const raw = route.params.tabId;
  return typeof raw === 'string' ? raw : '';
});

const routeQueryTabId = computed(() => {
  const raw = route.query.tabId;
  return typeof raw === 'string' ? raw : '';
});

const templateId = computed(() => {
  const raw = route.query.templateId;
  return typeof raw === 'string' ? raw : '';
});

const activeTabId = ref('');
const resolvingTarget = ref(false);
const errorMessage = ref('');
const emptyMessage = ref('');

let resolveRequestId = 0;

function normalizeBizOk(res: BizResLike | null | undefined): boolean {
  const code = res?.code;
  return (
    res?.success === true ||
    code === 0 ||
    code === 200 ||
    String(code) === '0' ||
    String(code) === '200'
  );
}

function resolveTabIdFromTemplate(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const template = data as { tabList?: PortalTab[]; tabIds?: unknown };
  const tabIdByTree = findFirstPageTabId(template.tabList);
  if (tabIdByTree) {
    return tabIdByTree;
  }

  const tabIds = template.tabIds;
  if (Array.isArray(tabIds)) {
    const first = tabIds.find((v) => typeof v === 'string' && v);
    return typeof first === 'string' ? first : '';
  }

  return '';
}

async function resolveTargetTabIdByTemplate(templateIdParam: string): Promise<string> {
  const tplRes = await portalService.templatePublic.getDetail({ id: templateIdParam });
  if (!normalizeBizOk(tplRes)) {
    return '';
  }
  return resolveTabIdFromTemplate(tplRes?.data);
}

function getPortalBasePath(): string {
  return route.name === 'PortalPreview' ? '/portal/preview' : '/portal/index';
}

function createRouteQueryWithoutTabId(): LocationQueryRaw {
  const nextQuery: LocationQueryRaw = { ...route.query };
  delete nextQuery.tabId;
  return nextQuery;
}

const previewDataSource: PortalPreviewDataSource = createPortalPreviewDataSource({
  getPublicTabDetail: (id: string) => portalService.tabPublic.detail({ id }),
  getTabDetail: (id: string) => portalService.tab.detail({ id }),
  getTemplateDetail: (id: string) => portalService.templatePublic.getDetail({ id })
});

async function resolveActiveTabId() {
  const currentRequestId = ++resolveRequestId;
  resolvingTarget.value = true;
  errorMessage.value = '';
  emptyMessage.value = '';
  activeTabId.value = '';

  const directTabId = routeQueryTabId.value || routeTabId.value;
  if (directTabId) {
    activeTabId.value = directTabId;
    resolvingTarget.value = false;
    return;
  }

  if (!templateId.value) {
    emptyMessage.value =
      '当前首页尚未配置门户页面，请先在前台配置中设置 customUrl，或从带 templateId/tabId 的入口进入。';
    resolvingTarget.value = false;
    return;
  }

  try {
    const targetTabId = await resolveTargetTabIdByTemplate(templateId.value);
    if (currentRequestId !== resolveRequestId) {
      return;
    }
    if (!targetTabId) {
      errorMessage.value = '缺少 tabId，且无法从 templateId 解析页面';
      return;
    }
    activeTabId.value = targetTabId;
  } catch (e: unknown) {
    if (currentRequestId !== resolveRequestId) {
      return;
    }
    errorMessage.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    if (currentRequestId === resolveRequestId) {
      resolvingTarget.value = false;
    }
  }
}

function onNavigate(payload: PortalPreviewNavigatePayload) {
  if (payload.type === 'tab' && payload.tabId) {
    if (payload.tabId === activeTabId.value) {
      return;
    }
    void router.replace({
      path: `${getPortalBasePath()}/${payload.tabId}`,
      query: createRouteQueryWithoutTabId()
    });
    return;
  }

  if (payload.type === 'url' && payload.url) {
    window.open(payload.url, '_blank', 'noopener,noreferrer');
  }
}

function onMessage(e: MessageEvent) {
  if (e.origin !== window.location.origin) {
    return;
  }

  const data = e.data as unknown;
  if (!data || typeof data !== 'object') {
    return;
  }

  const msg = data as { type?: unknown; data?: unknown };
  if (msg.type !== 'refresh-portal') {
    return;
  }

  const payload = msg.data as { tabId?: unknown } | undefined;
  const nextTabId = typeof payload?.tabId === 'string' ? payload.tabId : '';
  if (!nextTabId) {
    void resolveActiveTabId();
    return;
  }

  void router.replace({
    path: `${getPortalBasePath()}/${nextTabId}`,
    query: createRouteQueryWithoutTabId()
  });
}

watch(
  () => [routeTabId.value, routeQueryTabId.value, templateId.value],
  () => {
    void resolveActiveTabId();
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener('message', onMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage);
});
</script>

<template>
  <div v-loading="resolvingTarget" class="page">
    <div v-if="errorMessage" class="error">
      <el-result icon="error" title="加载失败" :sub-title="errorMessage">
        <template #extra> <el-button @click="resolveActiveTabId">重试</el-button> </template>
      </el-result>
    </div>

    <div v-else-if="emptyMessage" class="empty">
      <el-empty :description="emptyMessage" />
    </div>

    <PortalPreviewPanel
      v-else
      :tab-id="activeTabId"
      :template-id="templateId"
      :preview-data-source="previewDataSource"
      :on-navigate="onNavigate"
      :preview-mode="'live'"
      :listen-message="false"
      :materials-map="materialsMap"
    />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.error {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.empty {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 1px dashed var(--el-border-color);
  border-radius: 0;
  background: var(--el-bg-color);
}
</style>
