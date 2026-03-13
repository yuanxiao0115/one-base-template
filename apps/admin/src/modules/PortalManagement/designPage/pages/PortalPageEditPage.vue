<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { message } from "@one-base-template/ui";
  import {
    buildPortalPageLayoutForSave,
    createDefaultPortalPageSettingsV2,
    type PortalLayoutItem,
    type PortalPageSettingsV2,
    normalizePortalPageSettingsV2,
    PortalPageEditorWorkbench,
    portalMaterialsRegistry,
    usePortalPageLayoutStore,
  } from "@one-base-template/portal-engine";

  import { portalApi } from "../../api";
  import { useMaterials } from "../../materials/useMaterials";

  defineOptions({
    name: "PortalPageEditor",
  });

  interface BizResLike {
    code?: unknown;
    success?: unknown;
  }

  interface PageLayoutJson {
    settings?: unknown;
    component?: PortalLayoutItem[];
  }

  const route = useRoute();
  const router = useRouter();

  const pageLayoutStore = usePortalPageLayoutStore();

  const { materialsMap } = useMaterials();
  const materialCategories = portalMaterialsRegistry.categories;

  const tabId = computed(() => {
    const v = route.query.tabId;
    return typeof v === "string" ? v : "";
  });

  const templateId = computed(() => {
    const id = route.query.id;
    if (typeof id === "string") {
      return id;
    }
    const templateId = route.query.templateId;
    return typeof templateId === "string" ? templateId : "";
  });

  const loading = ref(false);
  const saving = ref(false);
  const previewLoading = ref(false);

  const tabName = ref("");

  const pageSettingData = ref<PortalPageSettingsV2>(createDefaultPortalPageSettingsV2());
  const previewWindowRef = ref<Window | null>(null);

  const PREVIEW_WINDOW_NAME = "portal-page-preview";
  const PREVIEW_RUNTIME_SYNC_DELAY = 160;
  const PREVIEW_RUNTIME_BOOTSTRAP_DELAYS = [180, 520] as const;
  const PREVIEW_READY_MESSAGE_TYPE = "preview-page-ready";

  let previewRuntimeSyncTimer: number | null = null;
  let previewRuntimeBootstrapTimers: number[] = [];

  function normalizeBizOk(res: BizResLike | null | undefined): boolean {
    const code = res?.code;
    const ok = res?.success === true || code === 0 || code === 200 || String(code) === "0" || String(code) === "200";
    return Boolean(ok);
  }

  function normalizeLayoutItems(input: unknown): PortalLayoutItem[] {
    if (!Array.isArray(input)) {
      return [];
    }
    return input
      .map((raw) => {
        if (!raw || typeof raw !== "object") {
          return null;
        }
        const item = raw as Record<string, unknown>;
        const iRaw = item.i;
        const i = typeof iRaw === "string" || typeof iRaw === "number" ? String(iRaw) : "";
        if (!i) {
          return null;
        }
        return {
          i,
          x: Number(item.x) || 0,
          y: Number(item.y) || 0,
          w: Number(item.w) || 1,
          h: Number(item.h) || 1,
          component: item.component as PortalLayoutItem["component"],
        } satisfies PortalLayoutItem;
      })
      .filter(Boolean) as PortalLayoutItem[];
  }

  function applyPageSettings(input: unknown, fallbackTitle: string): PortalPageSettingsV2 {
    const normalized = normalizePortalPageSettingsV2(input);
    if (!normalized.basic.pageTitle.trim()) {
      normalized.basic.pageTitle = fallbackTitle || "页面";
    }
    return normalized;
  }

  function toPlainData<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  function getPreviewWindow(): Window | null {
    const targetWindow = previewWindowRef.value;
    if (!targetWindow || targetWindow.closed) {
      previewWindowRef.value = null;
      return null;
    }
    return targetWindow;
  }

  function clearPreviewRuntimeSyncTimer() {
    if (!previewRuntimeSyncTimer) {
      return;
    }
    window.clearTimeout(previewRuntimeSyncTimer);
    previewRuntimeSyncTimer = null;
  }

  function clearPreviewRuntimeBootstrapTimers() {
    if (previewRuntimeBootstrapTimers.length === 0) {
      return;
    }
    for (const timer of previewRuntimeBootstrapTimers) {
      window.clearTimeout(timer);
    }
    previewRuntimeBootstrapTimers = [];
  }

  function postPreviewRuntimeMessage(): boolean {
    if (!tabId.value) {
      return false;
    }
    const targetWindow = getPreviewWindow();
    if (!targetWindow) {
      return false;
    }

    try {
      targetWindow.postMessage(
        {
          type: "preview-page-runtime",
          data: {
            tabId: tabId.value,
            templateId: templateId.value,
            settings: toPlainData(pageSettingData.value),
            component: toPlainData(pageLayoutStore.layoutItems),
          },
        },
        window.location.origin
      );
      return true;
    } catch {
      previewWindowRef.value = null;
      return false;
    }
  }

  function queuePreviewRuntimeSync() {
    clearPreviewRuntimeSyncTimer();
    previewRuntimeSyncTimer = window.setTimeout(() => {
      previewRuntimeSyncTimer = null;
      postPreviewRuntimeMessage();
    }, PREVIEW_RUNTIME_SYNC_DELAY);
  }

  function pushPreviewRuntimeBootstrapSync() {
    postPreviewRuntimeMessage();
    clearPreviewRuntimeBootstrapTimers();
    previewRuntimeBootstrapTimers = PREVIEW_RUNTIME_BOOTSTRAP_DELAYS.map((delay) =>
      window.setTimeout(() => {
        postPreviewRuntimeMessage();
      }, delay)
    );
  }

  function openPreviewWindow(href: string): Window | null {
    const existing = getPreviewWindow();
    if (existing) {
      try {
        existing.location.href = href;
      } catch {
        previewWindowRef.value = null;
      }
      existing.focus();
      return existing;
    }

    const opened = window.open(href, PREVIEW_WINDOW_NAME);
    if (!opened) {
      message.warning("预览窗口被浏览器拦截，请允许弹窗后重试");
      return null;
    }
    previewWindowRef.value = opened;
    return opened;
  }

  function onPreviewWindowMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) {
      return;
    }

    const raw = event.data as unknown;
    if (!raw || typeof raw !== "object") {
      return;
    }

    const msg = raw as { type?: unknown; data?: unknown };
    if (msg.type !== PREVIEW_READY_MESSAGE_TYPE) {
      return;
    }

    const payload = msg.data as { tabId?: unknown; templateId?: unknown } | undefined;
    const payloadTabId = typeof payload?.tabId === "string" ? payload.tabId : "";
    const payloadTemplateId = typeof payload?.templateId === "string" ? payload.templateId : "";
    if (payloadTabId && payloadTabId !== tabId.value) {
      return;
    }
    if (payloadTemplateId && payloadTemplateId !== templateId.value) {
      return;
    }

    const source = event.source as Window | null;
    if (!source || typeof source.postMessage !== "function") {
      return;
    }
    previewWindowRef.value = source;
    pushPreviewRuntimeBootstrapSync();
  }

  async function loadTabDetail(id: string) {
    if (!id) {
      pageLayoutStore.reset();
      tabName.value = "新建页面";
      return;
    }

    loading.value = true;
    try {
      const res = await portalApi.tab.detail({ id });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "加载页面失败");
        pageLayoutStore.reset();
        return;
      }

      const tab = res?.data;
      tabName.value = tab?.tabName || "页面编辑";

      if (tab?.pageLayout) {
        try {
          const parsed = JSON.parse(tab.pageLayout) as PageLayoutJson;
          pageSettingData.value = applyPageSettings(parsed.settings, tabName.value);
          pageLayoutStore.updateLayoutItems(normalizeLayoutItems(parsed.component));
        } catch {
          pageSettingData.value = applyPageSettings(null, tabName.value);
          pageLayoutStore.updateLayoutItems([]);
        }
      } else {
        pageSettingData.value = applyPageSettings(null, tabName.value);
        pageLayoutStore.updateLayoutItems([]);
      }

      pageLayoutStore.deselectLayoutItem();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载页面失败";
      message.error(msg);
      pageSettingData.value = applyPageSettings(null, tabName.value);
      pageLayoutStore.reset();
    } finally {
      loading.value = false;
    }
  }

  async function savePage() {
    if (!tabId.value) {
      message.warning("缺少 tabId，无法保存");
      return false;
    }

    if (saving.value) {
      return false;
    }
    saving.value = true;

    try {
      pageSettingData.value = applyPageSettings(pageSettingData.value, tabName.value);
      const pageLayout = buildPortalPageLayoutForSave(pageSettingData.value, pageLayoutStore.layoutItems);

      const res = await portalApi.tab.update({
        id: tabId.value,
        tabName: tabName.value || "页面",
        pageLayout: JSON.stringify(pageLayout),
      });

      if (!normalizeBizOk(res)) {
        message.error(res?.message || "保存失败");
        return false;
      }

      message.success("保存成功");
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "保存失败";
      message.error(msg);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function previewPage() {
    if (!tabId.value) {
      message.warning("缺少 tabId，无法预览");
      return;
    }

    if (previewLoading.value) {
      return;
    }
    previewLoading.value = true;

    try {
      const ok = await savePage();
      if (!ok) {
        return;
      }

      const resolved = router.resolve({
        name: "PortalPreview",
        query: {
          tabId: tabId.value,
          templateId: templateId.value,
          previewMode: "live",
        },
      });
      const previewWindow = openPreviewWindow(resolved.href);
      if (!previewWindow) {
        return;
      }
      previewWindowRef.value = previewWindow;
      pushPreviewRuntimeBootstrapSync();
    } finally {
      previewLoading.value = false;
    }
  }

  function onBack() {
    if (templateId.value) {
      router.push({
        path: "/portal/design",
        query: {
          id: templateId.value,
          tabId: tabId.value,
        },
      });
      return;
    }
    router.push("/portal/setting");
  }

  watch(
    () => tabId.value,
    async (id) => {
      await loadTabDetail(id);
    },
    { immediate: true }
  );

  watch(
    () => [pageSettingData.value, pageLayoutStore.layoutItems, tabId.value, templateId.value] as const,
    () => {
      queuePreviewRuntimeSync();
    },
    { deep: true }
  );

  onBeforeUnmount(() => {
    clearPreviewRuntimeSyncTimer();
    clearPreviewRuntimeBootstrapTimers();
    window.removeEventListener("message", onPreviewWindowMessage);
    previewWindowRef.value = null;
  });

  onMounted(() => {
    window.addEventListener("message", onPreviewWindowMessage);
  });
</script>

<template>
  <PortalPageEditorWorkbench
    :loading="loading"
    :saving="saving"
    :preview-loading="previewLoading"
    :title="tabName || '页面编辑'"
    :meta="`templateId ${templateId || '-'} · tabId ${tabId || '-'}`"
    :page-setting-data="pageSettingData"
    :materials-map="materialsMap"
    :categories="materialCategories"
    @back="onBack"
    @save="savePage"
    @preview="previewPage"
  />
</template>
