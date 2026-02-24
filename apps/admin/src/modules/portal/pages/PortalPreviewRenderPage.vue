<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { portalApi } from '../api/portal';
import { useMaterials } from '../materials/useMaterials';
import type { PortalLayoutItem } from '../stores/pageLayout';

import PortalGridRenderer from '../components/preview/PortalGridRenderer.vue';

defineOptions({
  name: 'PortalPreview',
});

type BizResLike = { code?: unknown; success?: unknown; message?: unknown; data?: unknown };

type PortalPageSettings = {
  gridData: {
    colNum: number;
    colSpace: number;
    rowSpace: number;
  };
  [k: string]: unknown;
};

type PageLayoutJson = {
  settings?: PortalPageSettings;
  component?: PortalLayoutItem[];
};

const route = useRoute();
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

const pageSettingData = ref<PortalPageSettings>({
  gridData: {
    colNum: 12,
    colSpace: 16,
    rowSpace: 16,
  },
});

const layoutItems = ref<PortalLayoutItem[]>([]);

function normalizeBizOk(res: BizResLike | null | undefined): boolean {
  const code = res?.code;
  return res?.success === true || code === 0 || code === 200 || String(code) === '0' || String(code) === '200';
}

function normalizeLayoutItems(input: unknown): PortalLayoutItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null;
      const item = raw as Record<string, unknown>;
      const iRaw = item.i;
      const i = typeof iRaw === 'string' || typeof iRaw === 'number' ? String(iRaw) : '';
      if (!i) return null;
      return {
        i,
        x: Number(item.x) || 0,
        y: Number(item.y) || 0,
        w: Number(item.w) || 1,
        h: Number(item.h) || 1,
        component: item.component as PortalLayoutItem['component'],
      } satisfies PortalLayoutItem;
    })
    .filter(Boolean) as PortalLayoutItem[];
}

async function loadTabLayout(id: string) {
  if (!id) {
    errorMessage.value = '缺少 tabId';
    layoutItems.value = [];
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    // 优先匿名接口；失败再兜底鉴权接口（用户可能已登录）
    const resPublic = await portalApi.tabPublic.detail({ id });
    const res = normalizeBizOk(resPublic) ? resPublic : await portalApi.tab.detail({ id });

    if (!normalizeBizOk(res)) {
      errorMessage.value = res?.message || '加载失败';
      return;
    }

    const tab = res?.data;
    if (!tab?.pageLayout) {
      layoutItems.value = [];
      return;
    }

    try {
      const parsed = JSON.parse(tab.pageLayout) as PageLayoutJson;
      if (parsed.settings) pageSettingData.value = parsed.settings;
      layoutItems.value = normalizeLayoutItems(parsed.component);
    } catch {
      layoutItems.value = [];
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '加载失败';
    errorMessage.value = msg;
  } finally {
    loading.value = false;
  }
}

function onMessage(e: MessageEvent) {
  // 只接收同源消息，避免被第三方页面触发刷新
  if (e.origin !== window.location.origin) return;

  const data = e.data as unknown;
  if (!data || typeof data !== 'object') return;

  const msg = data as { type?: unknown; data?: unknown };
  if (msg.type !== 'refresh-portal') return;

  const payload = msg.data as { tabId?: unknown } | undefined;
  const nextTabId = typeof payload?.tabId === 'string' ? payload.tabId : '';
  if (!nextTabId) return;

  loadTabLayout(nextTabId).catch(() => {});
}

onMounted(() => {
  window.addEventListener('message', onMessage);
  loadTabLayout(tabId.value).catch(() => {});
});

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage);
});

// 预览页允许匿名访问；这里不强依赖 templateId，但保留用于后续扩展（主题/页眉等）
void templateId.value;
</script>

<template>
  <div v-loading="loading" class="page">
    <div v-if="errorMessage" class="error">
      <el-result icon="error" title="加载失败" :sub-title="errorMessage">
        <template #extra>
          <el-button @click="loadTabLayout(tabId)">重试</el-button>
        </template>
      </el-result>
    </div>

    <div v-else class="content">
      <PortalGridRenderer
        :layout-items="layoutItems"
        :materials-map="materialsMap"
        :page-setting-data="pageSettingData"
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
</style>
