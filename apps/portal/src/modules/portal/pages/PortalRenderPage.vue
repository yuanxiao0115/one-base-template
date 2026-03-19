<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  createDefaultPortalPageSettingsV2,
  normalizePortalPageSettingsV2,
  type PortalLayoutItem,
  type PortalPageSettingsV2,
  type PortalTab,
  PortalGridRenderer
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
  data?: unknown;
}

interface PageLayoutJson {
  settings?: unknown;
  component?: PortalLayoutItem[];
}

const route = useRoute();
const router = useRouter();
const { materialsMap } = useMaterials();

const tabId = computed(() => {
  const raw = route.params.tabId;
  return typeof raw === 'string' ? raw : '';
});

const templateId = computed(() => {
  const raw = route.query.templateId;
  return typeof raw === 'string' ? raw : '';
});

const loading = ref(false);
const errorMessage = ref('');
const emptyMessage = ref('');

const pageSettingData = ref<PortalPageSettingsV2>(createDefaultPortalPageSettingsV2());

const layoutItems = ref<PortalLayoutItem[]>([]);

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

function normalizeLayoutItems(input: unknown): PortalLayoutItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((raw) => {
      if (!raw || typeof raw !== 'object') {
        return null;
      }

      const item = raw as Record<string, unknown>;
      const iRaw = item.i;
      const i = typeof iRaw === 'string' || typeof iRaw === 'number' ? String(iRaw) : '';
      if (!i) {
        return null;
      }

      return {
        i,
        x: Number(item.x) || 0,
        y: Number(item.y) || 0,
        w: Number(item.w) || 1,
        h: Number(item.h) || 1,
        component: item.component as PortalLayoutItem['component']
      } satisfies PortalLayoutItem;
    })
    .filter(Boolean) as PortalLayoutItem[];
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

async function resolveTargetTabId(): Promise<string> {
  if (tabId.value) {
    return tabId.value;
  }

  if (!templateId.value) {
    return '';
  }

  const tplRes = await portalService.templatePublic.getDetail({ id: templateId.value });
  if (!normalizeBizOk(tplRes)) {
    return '';
  }

  return resolveTabIdFromTemplate(tplRes?.data);
}

async function loadTabLayout() {
  loading.value = true;
  errorMessage.value = '';
  emptyMessage.value = '';
  pageSettingData.value = createDefaultPortalPageSettingsV2();

  try {
    const targetTabId = await resolveTargetTabId();
    if (!targetTabId) {
      layoutItems.value = [];
      if (!(tabId.value || templateId.value)) {
        emptyMessage.value =
          '当前首页尚未配置门户页面，请先在前台配置中设置 customUrl，或从带 templateId/tabId 的入口进入。';
        return;
      }
      errorMessage.value = '缺少 tabId，且无法从 templateId 解析页面';
      return;
    }

    const resPublic = await portalService.tabPublic.detail({ id: targetTabId });
    const res = normalizeBizOk(resPublic)
      ? resPublic
      : await portalService.tab.detail({ id: targetTabId });

    if (!normalizeBizOk(res)) {
      errorMessage.value = typeof res?.message === 'string' ? res.message : '加载失败';
      return;
    }

    const tab = res?.data as { pageLayout?: unknown } | undefined;
    if (!tab?.pageLayout || typeof tab.pageLayout !== 'string') {
      layoutItems.value = [];
      return;
    }

    try {
      const parsed = JSON.parse(tab.pageLayout) as PageLayoutJson;
      pageSettingData.value = normalizePortalPageSettingsV2(parsed.settings);
      layoutItems.value = normalizeLayoutItems(parsed.component);
    } catch {
      pageSettingData.value = createDefaultPortalPageSettingsV2();
      layoutItems.value = [];
    }
  } catch (e: unknown) {
    errorMessage.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
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
    void loadTabLayout();
    return;
  }

  const basePath = route.name === 'PortalPreview' ? '/portal/preview' : '/portal/index';
  void router.replace({ path: `${basePath}/${nextTabId}`, query: route.query });
}

watch(
  () => [tabId.value, templateId.value],
  () => {
    void loadTabLayout();
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
  <div v-loading="loading" class="page">
    <div v-if="errorMessage" class="error">
      <el-result icon="error" title="加载失败" :sub-title="errorMessage">
        <template #extra> <el-button @click="loadTabLayout">重试</el-button> </template>
      </el-result>
    </div>

    <div v-else-if="emptyMessage" class="empty">
      <el-empty :description="emptyMessage" />
    </div>

    <div v-else class="content">
      <PortalGridRenderer
        :layout-items="layoutItems"
        :materials-map="materialsMap"
        :page-setting-data="pageSettingData"
        preview-mode="live"
      />
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  padding: 16px;
}

.content {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 12px;
  background: var(--el-bg-color);
  min-height: calc(100vh - 32px);
}

.error {
  display: flex;
  min-height: calc(100vh - 32px);
  align-items: center;
  justify-content: center;
}

.empty {
  display: flex;
  min-height: calc(100vh - 32px);
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--el-border-color);
  border-radius: 12px;
  background: var(--el-bg-color);
}
</style>
