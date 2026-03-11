<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import {
    createDefaultPortalPageSettingsV2,
    normalizePortalPageSettingsV2,
    type PortalLayoutItem,
    type PortalPageSettingsV2,
    PortalGridRenderer,
  } from "@one-base-template/portal-engine";

  import { portalApi } from "../../api";
  import { useMaterials } from "../../materials/useMaterials";
  import type { PortalTab } from "../../types";
  import {
    buildPortalHeaderNavItems,
    createDefaultPortalTemplateDetails,
    parsePortalTemplateDetails,
    resolvePortalShellForTab,
    type PortalShellNavItem,
  } from "../../utils/templateDetails";
  import ConfigurablePortalFooter from "./shell/ConfigurablePortalFooter.vue";
  import ConfigurablePortalHeader from "./shell/ConfigurablePortalHeader.vue";
  import { customHeaderRegistry } from "./shell/customHeaderRegistry";

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

  interface TemplateInfoLike {
    id?: string;
    details?: string;
    tabList?: unknown;
  }

  interface TabDetailLike {
    templateId?: unknown;
    pageLayout?: unknown;
  }

  const props = withDefaults(
    defineProps<{
      tabId: string;
      templateId?: string;
      embedded?: boolean;
      listenMessage?: boolean;
      previewMode?: "safe" | "live";
      viewportWidth?: number;
      viewportHeight?: number;
    }>(),
    {
      templateId: "",
      embedded: false,
      listenMessage: false,
      previewMode: "safe",
      viewportWidth: 0,
      viewportHeight: 0,
    }
  );

  defineOptions({
    name: "PortalPreviewPanel",
  });

  const route = useRoute();
  const router = useRouter();
  const { materialsMap } = useMaterials();

  const loading = ref(false);
  const errorMessage = ref("");
  const pageSettingData = ref<PortalPageSettingsV2>(createDefaultPortalPageSettingsV2());
  const layoutItems = ref<PortalLayoutItem[]>([]);

  const templateInfo = ref<TemplateInfoLike | null>(null);
  const templateDetails = ref(createDefaultPortalTemplateDetails());
  const loadedTemplateId = ref("");
  const previewShellDetailsOverride = ref<string | null>(null);

  const hasFixedViewport = computed(() => props.viewportWidth > 0 && props.viewportHeight > 0);
  const previewShellStyle = computed(() => {
    if (!hasFixedViewport.value) {
      return undefined;
    }
    return {
      width: `${props.viewportWidth}px`,
      minHeight: `${props.viewportHeight}px`,
    };
  });

  const resolvedShell = computed(() => resolvePortalShellForTab(templateDetails.value, props.tabId));
  const headerNavItems = computed(() => {
    const behavior = resolvedShell.value.header.behavior;
    if (behavior.navSource === "manual" && behavior.manualNavItems.length > 0) {
      return behavior.manualNavItems;
    }
    return buildPortalHeaderNavItems(Array.isArray(templateInfo.value?.tabList) ? (templateInfo.value?.tabList as PortalTab[]) : []);
  });

  const showHeader = computed(() => resolvedShell.value.pageHeader === 1 && resolvedShell.value.header.enabled);
  const showFooter = computed(() => resolvedShell.value.pageFooter === 1 && resolvedShell.value.footer.enabled);

  const customHeaderComponent = computed(() => {
    const config = resolvedShell.value.header;
    if (config.mode !== "customComponent") {
      return null;
    }
    return customHeaderRegistry[config.customComponentKey] ?? null;
  });

  const isFixedFooter = computed(() => resolvedShell.value.footer.behavior.fixedMode === "fixed");
  const contentStyle = computed(() => {
    if (!(showFooter.value && isFixedFooter.value)) {
      return undefined;
    }
    const footerHeight = Math.max(56, resolvedShell.value.footer.tokens.height);
    return {
      paddingBottom: `${footerHeight + 8}px`,
    };
  });

  function normalizeBizOk(res: BizResLike | null | undefined): boolean {
    const code = res?.code;
    return res?.success === true || code === 0 || code === 200 || String(code) === "0" || String(code) === "200";
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

  async function loadTemplateInfo(templateId: string) {
    if (!templateId) {
      templateInfo.value = null;
      templateDetails.value = createDefaultPortalTemplateDetails();
      loadedTemplateId.value = "";
      return;
    }

    if (loadedTemplateId.value === templateId && templateInfo.value?.id) {
      return;
    }

    const res = await portalApi.template.detail({ id: templateId });
    if (!normalizeBizOk(res)) {
      templateInfo.value = null;
      templateDetails.value = createDefaultPortalTemplateDetails();
      loadedTemplateId.value = "";
      return;
    }

    const data = (res?.data ?? {}) as TemplateInfoLike;
    templateInfo.value = data;
    const nextDetails = previewShellDetailsOverride.value ?? data.details ?? "";
    templateDetails.value = parsePortalTemplateDetails(nextDetails);
    loadedTemplateId.value = String(data.id ?? templateId);
  }

  async function loadTabLayout(id: string) {
    if (!id) {
      errorMessage.value = "缺少 tabId";
      layoutItems.value = [];
      pageSettingData.value = createDefaultPortalPageSettingsV2();
      return;
    }

    loading.value = true;
    errorMessage.value = "";
    pageSettingData.value = createDefaultPortalPageSettingsV2();

    try {
      // 优先匿名接口；失败再兜底鉴权接口（用户可能已登录）
      const resPublic = await portalApi.tabPublic.detail({ id });
      const res = normalizeBizOk(resPublic) ? resPublic : await portalApi.tab.detail({ id });

      if (!normalizeBizOk(res)) {
        errorMessage.value = res?.message || "加载失败";
        layoutItems.value = [];
        return;
      }

      const tab = (res?.data ?? {}) as TabDetailLike;
      const fallbackTemplateId = typeof tab.templateId === "string" ? tab.templateId : "";
      const nextTemplateId = props.templateId || fallbackTemplateId;
      await loadTemplateInfo(nextTemplateId);

      const pageLayout = tab.pageLayout;
      if (!pageLayout || typeof pageLayout !== "string") {
        layoutItems.value = [];
        return;
      }

      try {
        const parsed = JSON.parse(pageLayout) as PageLayoutJson;
        pageSettingData.value = normalizePortalPageSettingsV2(parsed.settings);
        layoutItems.value = normalizeLayoutItems(parsed.component);
      } catch {
        pageSettingData.value = createDefaultPortalPageSettingsV2();
        layoutItems.value = [];
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载失败";
      errorMessage.value = msg;
      layoutItems.value = [];
    } finally {
      loading.value = false;
    }
  }

  function refresh(nextTabId?: string) {
    const id = typeof nextTabId === "string" ? nextTabId : props.tabId;
    return loadTabLayout(id);
  }

  function onMessage(event: MessageEvent) {
    // 只接收同源消息，避免被第三方页面触发刷新
    if (event.origin !== window.location.origin) {
      return;
    }

    const data = event.data as unknown;
    if (!data || typeof data !== "object") {
      return;
    }

    const msg = data as { type?: unknown; data?: unknown };
    if (msg.type === "preview-shell-details") {
      const payload = msg.data as { details?: unknown; templateId?: unknown } | undefined;
      const details = typeof payload?.details === "string" ? payload.details : "";
      const payloadTemplateId = typeof payload?.templateId === "string" ? payload.templateId : "";
      if (payloadTemplateId && payloadTemplateId !== props.templateId && payloadTemplateId !== loadedTemplateId.value) {
        return;
      }
      previewShellDetailsOverride.value = details;
      templateDetails.value = parsePortalTemplateDetails(details);
      return;
    }

    if (msg.type !== "refresh-portal") {
      return;
    }

    const payload = msg.data as { tabId?: unknown } | undefined;
    const nextTabId = typeof payload?.tabId === "string" ? payload.tabId : "";
    if (!nextTabId) {
      return;
    }

    void loadTabLayout(nextTabId);
  }

  function onHeaderNavigate(item: PortalShellNavItem) {
    if (item.tabId) {
      if (item.tabId === props.tabId) {
        return;
      }

      const query = {
        ...route.query,
        tabId: item.tabId,
        templateId: props.templateId || loadedTemplateId.value || undefined,
      };
      router.replace({ query }).catch(() => undefined);
      return;
    }

    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  }

  watch(
    () => props.tabId,
    (id) => {
      void loadTabLayout(id);
    },
    { immediate: true }
  );

  watch(
    () => props.templateId,
    (id) => {
      previewShellDetailsOverride.value = null;
      if (!id) {
        return;
      }
      void loadTemplateInfo(id);
    }
  );

  watch(
    () => props.listenMessage,
    (enabled) => {
      if (enabled) {
        window.addEventListener("message", onMessage);
      } else {
        window.removeEventListener("message", onMessage);
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    window.removeEventListener("message", onMessage);
  });

  defineExpose({
    refresh,
  });
</script>

<template>
  <div v-loading="loading" class="preview-page" :class="{ 'preview-page--embedded': embedded }">
    <div class="preview-shell" :class="{ 'preview-shell--fixed': hasFixedViewport }" :style="previewShellStyle">
      <div v-if="errorMessage" class="state state--error">
        <el-result icon="error" title="加载失败" :sub-title="errorMessage">
          <template #extra>
            <el-button @click="refresh()">重试</el-button>
          </template>
        </el-result>
      </div>

      <template v-else>
        <component
          :is="customHeaderComponent"
          v-if="showHeader && customHeaderComponent"
          :config="resolvedShell.header"
          :nav-items="headerNavItems"
          :active-tab-id="props.tabId"
          @navigate="onHeaderNavigate"
        />

        <ConfigurablePortalHeader
          v-else-if="showHeader"
          :config="resolvedShell.header"
          :nav-items="headerNavItems"
          :active-tab-id="props.tabId"
          :embedded="props.embedded"
          @navigate="onHeaderNavigate"
        />

        <div class="content" :class="{ 'content--embedded': embedded }" :style="contentStyle">
          <div v-if="layoutItems.length === 0" class="state state--empty">
            <el-empty description="当前页面暂未配置组件" :image-size="100">
              <template #description>
                <p class="empty-desc">可先进入编辑器添加组件后，再返回此处查看效果。</p>
              </template>
            </el-empty>
          </div>

          <PortalGridRenderer
            v-else
            :layout-items
            :materials-map
            :page-setting-data
            :preview-mode="props.previewMode"
          />
        </div>

        <ConfigurablePortalFooter v-if="showFooter" :config="resolvedShell.footer" />
      </template>
    </div>
  </div>
</template>

<style scoped>
  .preview-page {
    min-height: 100vh;
    background: var(--el-bg-color);
  }

  .preview-page--embedded {
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 8px;
  }

  .preview-shell {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border: none;
    border-radius: 0;
    background: var(--el-bg-color);
    overflow: auto;
  }

  .preview-shell--fixed {
    margin: 0 auto;
  }

  .content {
    flex: 1;
    min-height: 0;
    padding: 8px;
    background: var(--el-bg-color);
    box-sizing: border-box;
  }

  .content--embedded {
    width: 100%;
    min-height: 0;
  }

  .state {
    display: flex;
    flex: 1;
    min-height: 0;
    align-items: center;
    justify-content: center;
    padding: 24px 12px;
  }

  .state--empty {
    background: var(--el-bg-color);
  }

  .empty-desc {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
</style>
