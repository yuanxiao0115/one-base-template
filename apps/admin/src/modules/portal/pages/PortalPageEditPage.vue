<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

import { portalService } from '../services/portal-service';
import { useMaterials } from '../materials/useMaterials';
import { usePortalPageLayoutStore, type PortalLayoutItem } from '../stores/pageLayout';

import GridLayoutEditor from '../components/page-editor/GridLayoutEditor.vue';
import MaterialLibrary from '../components/page-editor/MaterialLibrary.vue';
import PropertyPanel from '../components/page-editor/PropertyPanel.vue';

defineOptions({
  name: 'PortalPageEditor',
});

type BizResLike = { code?: unknown; success?: unknown };

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
const router = useRouter();

const pageLayoutStore = usePortalPageLayoutStore();

const { materialsMap } = useMaterials();

const tabId = computed(() => {
  const v = route.query.tabId;
  return typeof v === 'string' ? v : '';
});

const templateId = computed(() => {
  const v = route.query.templateId;
  return typeof v === 'string' ? v : '';
});

const loading = ref(false);
const saving = ref(false);
const previewLoading = ref(false);

const tabName = ref('');

const pageSettingData = ref<PortalPageSettings>({
  gridData: {
    colNum: 12,
    colSpace: 16,
    rowSpace: 16,
  },
});

function normalizeBizOk(res: BizResLike | null | undefined): boolean {
  const code = res?.code;
  const ok = res?.success === true || code === 0 || code === 200 || String(code) === '0' || String(code) === '200';
  return !!ok;
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

async function loadTabDetail(id: string) {
  if (!id) {
    pageLayoutStore.reset();
    tabName.value = '新建页面';
    return;
  }

  loading.value = true;
  try {
    const res = await portalService.tab.detail({ id });
    if (!normalizeBizOk(res)) {
      ElMessage.error(res?.message || '加载页面失败');
      pageLayoutStore.reset();
      return;
    }

    const tab = res?.data;
    tabName.value = tab?.tabName || '页面编辑';

    if (tab?.pageLayout) {
      try {
        const parsed = JSON.parse(tab.pageLayout) as PageLayoutJson;
        if (parsed.settings) pageSettingData.value = parsed.settings;
        pageLayoutStore.updateLayoutItems(normalizeLayoutItems(parsed.component));
      } catch {
        pageLayoutStore.updateLayoutItems([]);
      }
    } else {
      pageLayoutStore.updateLayoutItems([]);
    }

    pageLayoutStore.deselectLayoutItem();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '加载页面失败';
    ElMessage.error(msg);
    pageLayoutStore.reset();
  } finally {
    loading.value = false;
  }
}

async function savePage() {
  if (!tabId.value) {
    ElMessage.warning('缺少 tabId，无法保存');
    return false;
  }

  if (saving.value) return false;
  saving.value = true;

  try {
    const pageLayout: PageLayoutJson = {
      settings: pageSettingData.value,
      component: pageLayoutStore.layoutItems,
    };

    const res = await portalService.tab.update({
      id: tabId.value,
      tabName: tabName.value || '页面',
      pageLayout: JSON.stringify(pageLayout),
    });

    if (!normalizeBizOk(res)) {
      ElMessage.error(res?.message || '保存失败');
      return false;
    }

    ElMessage.success('保存成功');
    return true;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '保存失败';
    ElMessage.error(msg);
    return false;
  } finally {
    saving.value = false;
  }
}

async function previewPage() {
  if (!tabId.value) {
    ElMessage.warning('缺少 tabId，无法预览');
    return;
  }

  if (previewLoading.value) return;
  previewLoading.value = true;

  try {
    const ok = await savePage();
    if (!ok) return;

    const resolved = router.resolve({
      name: 'PortalPreview',
      params: { tabId: tabId.value },
      query: { templateId: templateId.value, isPreview: 'true', isInIframe: 'false' },
    });
    window.open(resolved.href, '_blank', 'noopener,noreferrer');
  } finally {
    previewLoading.value = false;
  }
}

function onBack() {
  if (templateId.value) {
    router.push({ path: '/portal/designer', query: { templateId: templateId.value, tabId: tabId.value } });
    return;
  }
  router.push('/portal/templates');
}

watch(
  () => tabId.value,
  async (id) => {
    await loadTabDetail(id);
  },
  { immediate: true }
);
</script>

<template>
  <div class="page">
    <div class="topbar">
      <div class="left">
        <el-button @click="onBack">返回</el-button>
      </div>
      <div class="center">
        <div class="title">{{ tabName || '页面编辑' }}</div>
        <div class="sub">tabId={{ tabId || '-' }} / templateId={{ templateId || '-' }}</div>
      </div>
      <div class="right">
        <el-button :loading="saving" type="primary" @click="savePage">保存</el-button>
        <el-button :loading="previewLoading" @click="previewPage">预览</el-button>
      </div>
    </div>

    <div v-loading="loading" class="content">
      <MaterialLibrary />
      <div class="canvas">
        <GridLayoutEditor
          class="canvas-inner"
          :materials-map="materialsMap"
          :scale="1"
          :loaded="!loading"
          :page-setting-data="pageSettingData"
        />
      </div>
      <PropertyPanel :materials-map="materialsMap" />
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

.topbar {
  display: grid;
  grid-template-columns: 260px 1fr 360px;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 10px 12px;
  background: var(--el-bg-color-overlay);
}

.left,
.right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.right {
  justify-content: flex-end;
}

.center {
  min-width: 0;
  text-align: center;
}

.title {
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.content {
  display: flex;
  flex: 1;
  min-height: 0;
}

.canvas {
  display: flex;
  flex: 1;
  min-width: 0;
  padding: 12px;
  background: var(--el-bg-color-page);
}

.canvas-inner {
  flex: 1;
  min-width: 0;
}
</style>
