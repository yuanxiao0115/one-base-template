<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Component, CSSProperties } from 'vue';

import {
  PORTAL_PREVIEW_MESSAGE_PAGE_READY,
  PORTAL_PREVIEW_MESSAGE_PAGE_RUNTIME,
  PORTAL_PREVIEW_MESSAGE_SHELL_DETAILS,
  PORTAL_PREVIEW_MESSAGE_VIEWPORT
} from '../editor/preview-bridge/messages';
import {
  buildPortalHeaderNavItems,
  createDefaultPortalTemplateDetails,
  parsePortalTemplateDetails,
  resolvePortalShellForTab,
  type PortalShellNavItem
} from '../shell/template-details';
import {
  createDefaultPortalPageSettingsV2,
  normalizePortalPageSettingsV2,
  resolvePortalPageRuntimeSettings,
  type PortalPageBackgroundSettings,
  type PortalPageLayoutMode,
  type PortalPageSettingsV2
} from '../schema/page-settings';
import type { PortalTab } from '../schema/types';
import type { PortalLayoutItem } from '../stores/pageLayout';
import { isPortalBizOk } from '../utils/biz-response';
import PortalGridRenderer from './PortalGridRenderer.vue';
import PortalPreviewGlobalScrollLayout from './layouts/PortalPreviewGlobalScrollLayout.vue';
import PortalPreviewHeaderFixedContentScrollLayout from './layouts/PortalPreviewHeaderFixedContentScrollLayout.vue';
import PortalPreviewHeaderFooterFixedContentScrollLayout from './layouts/PortalPreviewHeaderFooterFixedContentScrollLayout.vue';
import type {
  PortalPreviewDataSource,
  PortalPreviewNavigatePayload
} from './portal-preview-panel.types';
import ConfigurablePortalFooter from './shell/ConfigurablePortalFooter.vue';
import ConfigurablePortalHeader from './shell/ConfigurablePortalHeader.vue';
import { customHeaderRegistry } from './shell/customHeaderRegistry';

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
  id?: unknown;
  details?: unknown;
  tabList?: unknown;
}

interface TabDetailLike {
  templateId?: unknown;
  pageLayout?: unknown;
}

interface PreviewPageRuntimePayload {
  tabId?: unknown;
  templateId?: unknown;
  settings?: unknown;
  component?: unknown;
}

const props = withDefaults(
  defineProps<{
    tabId: string;
    templateId?: string;
    previewDataSource: PortalPreviewDataSource;
    materialsMap: Record<string, unknown>;
    onNavigate?: (payload: PortalPreviewNavigatePayload) => void;
    embedded?: boolean;
    listenMessage?: boolean;
    previewMode?: 'safe' | 'live';
    viewportWidth?: number;
    viewportHeight?: number;
  }>(),
  {
    templateId: '',
    onNavigate: undefined,
    embedded: false,
    listenMessage: false,
    previewMode: 'safe',
    viewportWidth: 0,
    viewportHeight: 0
  }
);

defineOptions({
  name: 'PortalPreviewPanel'
});

const loading = ref(false);
const errorMessage = ref('');
const pageSettingData = ref<PortalPageSettingsV2>(createDefaultPortalPageSettingsV2());
const layoutItems = ref<PortalLayoutItem[]>([]);

const templateInfo = ref<TemplateInfoLike | null>(null);
const templateDetails = ref(createDefaultPortalTemplateDetails());
const loadedTemplateId = ref('');
const previewShellDetailsOverride = ref<string | null>(null);
const dynamicViewportWidth = ref(1920);
const runtimeViewport = ref({
  width: Math.max(0, props.viewportWidth),
  height: Math.max(0, props.viewportHeight)
});

const rendererMaterialsMap = computed(() => props.materialsMap as Record<string, Component>);

function normalizeIdLike(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

function setRuntimeViewport(width: unknown, height: unknown) {
  const nextWidth =
    Number.isFinite(Number(width)) && Number(width) > 0 ? Math.round(Number(width)) : 0;
  const nextHeight =
    Number.isFinite(Number(height)) && Number(height) > 0 ? Math.round(Number(height)) : 0;
  runtimeViewport.value = {
    width: nextWidth,
    height: nextHeight
  };
}

const hasFixedViewport = computed(
  () => runtimeViewport.value.width > 0 && runtimeViewport.value.height > 0
);
const previewShellStyle = computed(() => {
  if (!hasFixedViewport.value) {
    return undefined;
  }
  return {
    width: `${runtimeViewport.value.width}px`,
    minHeight: `${runtimeViewport.value.height}px`,
    maxHeight: `${runtimeViewport.value.height}px`
  };
});

const activeViewportWidth = computed(() =>
  hasFixedViewport.value ? Math.max(320, runtimeViewport.value.width) : dynamicViewportWidth.value
);

const normalizedPageSettings = computed(() => normalizePortalPageSettingsV2(pageSettingData.value));
const runtimeSettings = computed(() =>
  resolvePortalPageRuntimeSettings(normalizedPageSettings.value, {
    viewportWidth: activeViewportWidth.value
  })
);

const resolvedShell = computed(() => resolvePortalShellForTab(templateDetails.value, props.tabId));
const headerNavItems = computed(() => {
  const behavior = resolvedShell.value.header.behavior;
  if (behavior.navSource === 'manual' && behavior.manualNavItems.length > 0) {
    return behavior.manualNavItems;
  }
  return buildPortalHeaderNavItems(
    Array.isArray(templateInfo.value?.tabList) ? (templateInfo.value?.tabList as PortalTab[]) : []
  );
});

const showHeader = computed(
  () => resolvedShell.value.pageHeader === 1 && resolvedShell.value.header.enabled
);
const showFooter = computed(
  () => resolvedShell.value.pageFooter === 1 && resolvedShell.value.footer.enabled
);

const customHeaderComponent = computed(() => {
  const config = resolvedShell.value.header;
  if (config.mode !== 'customComponent') {
    return null;
  }
  return customHeaderRegistry[config.customComponentKey] ?? null;
});

const showBanner = computed(() => normalizedPageSettings.value.banner.enabled);
const activeLayoutMode = computed<PortalPageLayoutMode>(
  () => normalizedPageSettings.value.layoutMode
);
const isGlobalScrollLayout = computed(() => activeLayoutMode.value === 'global-scroll');
const isHeaderFixedLayout = computed(
  () => activeLayoutMode.value === 'header-fixed-content-scroll'
);
const isHeaderFooterFixedLayout = computed(
  () => activeLayoutMode.value === 'header-fixed-footer-fixed-content-scroll'
);
const useContentScroll = computed(
  () => isHeaderFixedLayout.value || isHeaderFooterFixedLayout.value
);
const useHeaderSticky = computed(
  () => isHeaderFixedLayout.value || isHeaderFooterFixedLayout.value
);
const useFixedFooter = computed(() => {
  if (!showFooter.value) {
    return false;
  }
  return isHeaderFooterFixedLayout.value;
});
const layoutComponent = computed(() => {
  if (isGlobalScrollLayout.value) {
    return PortalPreviewGlobalScrollLayout;
  }
  if (isHeaderFooterFixedLayout.value) {
    return PortalPreviewHeaderFooterFixedContentScrollLayout;
  }
  return PortalPreviewHeaderFixedContentScrollLayout;
});
const layoutShellClass = computed(() => `preview-shell--layout-${activeLayoutMode.value}`);
const useViewportFillForEmpty = computed(
  () => useContentScroll.value && layoutItems.value.length === 0
);
const showPreviewAreaOutline = computed(() => hasFixedViewport.value || props.embedded);

function updateViewportWidth() {
  dynamicViewportWidth.value = Math.max(320, Math.round(window.innerWidth || 1920));
}

function normalizeColor(color: string, opacity: number): string {
  const text = color.trim();
  if (/^#([A-Fa-f\d]{3}|[A-Fa-f\d]{6})$/.test(text)) {
    const hex = text.slice(1);
    if (hex.length === 3) {
      const r = Number.parseInt(hex.slice(0, 1).repeat(2), 16);
      const g = Number.parseInt(hex.slice(1, 2).repeat(2), 16);
      const b = Number.parseInt(hex.slice(2, 3).repeat(2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return `rgba(0, 0, 0, ${opacity})`;
}

function buildBackgroundStyle(background: PortalPageBackgroundSettings): CSSProperties {
  const style: CSSProperties = {};

  if (background.backgroundColor) {
    style.backgroundColor = background.backgroundColor;
  }

  if (background.backgroundImage) {
    const layers: string[] = [];
    if (background.overlayOpacity > 0) {
      const maskColor = normalizeColor(background.overlayColor, background.overlayOpacity);
      layers.push(`linear-gradient(${maskColor}, ${maskColor})`);
    }
    layers.push(`url(${background.backgroundImage})`);
    style.backgroundImage = layers.join(', ');
    style.backgroundRepeat = background.backgroundRepeat;
    style.backgroundPosition = background.backgroundPosition;
    style.backgroundAttachment = background.backgroundAttachment;
    style.backgroundSize =
      background.backgroundSizeMode === 'custom'
        ? background.backgroundSizeCustom
        : background.backgroundSizeMode;
  }

  return style;
}

const contentStyle = computed<CSSProperties>(() => {
  return {
    overflowX: 'hidden',
    minHeight: 0,
    paddingBottom: '0px'
  };
});
const contentScrollStyle = computed<CSSProperties>(() => {
  if (!useContentScroll.value) {
    return {};
  }
  const overflowY = isHeaderFooterFixedLayout.value
    ? 'auto'
    : normalizedPageSettings.value.layoutContainer.overflowMode;
  return {
    overflowY,
    overflowX: 'hidden'
  };
});
const layoutProps = computed(() => {
  if (isGlobalScrollLayout.value) {
    return {};
  }
  return {
    contentScrollStyle: contentScrollStyle.value
  };
});

const contentFrameStyle = computed<CSSProperties>(() => {
  const spacing = runtimeSettings.value.spacing;
  const style: CSSProperties = {
    marginTop: `${spacing.marginTop}px`,
    marginRight: `${spacing.marginRight}px`,
    marginBottom: `${spacing.marginBottom}px`,
    marginLeft: `${spacing.marginLeft}px`,
    minHeight: `${normalizedPageSettings.value.layoutContainer.contentMinHeight}px`
  };

  if (normalizedPageSettings.value.background.scope === 'page') {
    Object.assign(style, buildBackgroundStyle(normalizedPageSettings.value.background));
  }

  return style;
});

const contentContainerStyle = computed<CSSProperties>(() => {
  const spacing = runtimeSettings.value.spacing;
  const container = normalizedPageSettings.value.layoutContainer;

  const style: CSSProperties = {
    paddingTop: `${spacing.paddingTop}px`,
    paddingRight: `${spacing.paddingRight}px`,
    paddingBottom: `${spacing.paddingBottom}px`,
    paddingLeft: `${spacing.paddingLeft}px`,
    boxSizing: 'border-box',
    width: '100%'
  };

  if (container.widthMode === 'custom') {
    style.width = `${container.customWidth}px`;
    style.maxWidth = '100%';
  } else if (container.widthMode === 'fixed') {
    style.width = `${container.fixedWidth}px`;
    style.maxWidth = '100%';
  }

  if (normalizedPageSettings.value.background.scope === 'content') {
    Object.assign(style, buildBackgroundStyle(normalizedPageSettings.value.background));
  }

  return style;
});

const contentMainStyle = computed<CSSProperties>(() => {
  if (normalizedPageSettings.value.layoutContainer.widthMode === 'full-width') {
    return {};
  }
  return {
    display: 'flex',
    justifyContent:
      normalizedPageSettings.value.layoutContainer.contentAlign === 'left'
        ? 'flex-start'
        : 'center',
    minHeight: 0
  };
});

const bannerStyle = computed<CSSProperties>(() => {
  const banner = normalizedPageSettings.value.banner;

  const style: CSSProperties = {
    height: `${runtimeSettings.value.bannerHeight}px`
  };

  if (banner.fullWidth) {
    style.borderRadius = '0';
  }

  const fallbackBackground =
    normalizedPageSettings.value.background.scope === 'banner'
      ? normalizedPageSettings.value.background
      : null;

  if (banner.image) {
    const layers: string[] = [];
    if (banner.overlayOpacity > 0) {
      const maskColor = normalizeColor(banner.overlayColor, banner.overlayOpacity);
      layers.push(`linear-gradient(${maskColor}, ${maskColor})`);
    }
    layers.push(`url(${banner.image})`);
    style.backgroundImage = layers.join(', ');
    style.backgroundRepeat = 'no-repeat';
    style.backgroundPosition = 'center center';
    style.backgroundSize = 'cover';
  } else if (fallbackBackground) {
    Object.assign(style, buildBackgroundStyle(fallbackBackground));
  }

  return style;
});

const headerWrapStyle = computed<CSSProperties>(() => {
  if (!useHeaderSticky.value) {
    return {};
  }
  return {
    position: 'sticky',
    top: `${normalizedPageSettings.value.headerFooterBehavior.headerOffsetTop}px`,
    zIndex: 30
  };
});

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

async function loadTemplateInfo(templateId: string) {
  if (!templateId) {
    templateInfo.value = null;
    templateDetails.value = createDefaultPortalTemplateDetails();
    loadedTemplateId.value = '';
    return;
  }

  if (loadedTemplateId.value === templateId && normalizeIdLike(templateInfo.value?.id)) {
    return;
  }

  const res = await props.previewDataSource.getTemplateDetail(templateId);
  if (!isPortalBizOk(res)) {
    templateInfo.value = null;
    templateDetails.value = createDefaultPortalTemplateDetails();
    loadedTemplateId.value = '';
    return;
  }

  const data = (res?.data ?? {}) as TemplateInfoLike;
  templateInfo.value = data;

  const details = typeof data.details === 'string' ? data.details : '';
  const nextDetails = previewShellDetailsOverride.value ?? details;
  templateDetails.value = parsePortalTemplateDetails(nextDetails);
  loadedTemplateId.value = normalizeIdLike(data.id) || templateId;
}

async function loadTabLayout(id: string) {
  if (!id) {
    errorMessage.value = '缺少 tabId';
    layoutItems.value = [];
    pageSettingData.value = createDefaultPortalPageSettingsV2();
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  pageSettingData.value = createDefaultPortalPageSettingsV2();

  try {
    const res = await props.previewDataSource.getTabDetail(id);

    if (!isPortalBizOk(res)) {
      errorMessage.value = typeof res?.message === 'string' ? res.message : '加载失败';
      layoutItems.value = [];
      return;
    }

    const tab = (res?.data ?? {}) as TabDetailLike;
    const fallbackTemplateId = normalizeIdLike(tab.templateId);
    const nextTemplateId = props.templateId || fallbackTemplateId;
    await loadTemplateInfo(nextTemplateId);

    const pageLayout = tab.pageLayout;
    if (!pageLayout || typeof pageLayout !== 'string') {
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
    const msg = e instanceof Error ? e.message : '加载失败';
    errorMessage.value = msg;
    layoutItems.value = [];
  } finally {
    loading.value = false;
  }
}

function refresh(nextTabId?: string) {
  const id = typeof nextTabId === 'string' ? nextTabId : props.tabId;
  return loadTabLayout(id);
}

function applyRuntimePagePreview(payload: PreviewPageRuntimePayload | undefined): boolean {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const payloadTemplateId = normalizeIdLike(payload.templateId);
  const payloadTabId = normalizeIdLike(payload.tabId);
  if (
    payloadTemplateId &&
    payloadTemplateId !== props.templateId &&
    payloadTemplateId !== loadedTemplateId.value
  ) {
    return false;
  }
  if (payloadTabId && payloadTabId !== props.tabId) {
    return false;
  }
  const hasSettings = Object.hasOwn(payload, 'settings');
  const hasComponent = Object.hasOwn(payload, 'component');
  if (!(hasSettings || hasComponent)) {
    return false;
  }
  if (hasSettings) {
    pageSettingData.value = normalizePortalPageSettingsV2(payload.settings);
  }
  if (hasComponent) {
    layoutItems.value = normalizeLayoutItems(payload.component);
  }
  errorMessage.value = '';
  return true;
}

function getRuntimeSnapshot() {
  return {
    settings: normalizePortalPageSettingsV2(pageSettingData.value),
    component: normalizeLayoutItems(layoutItems.value)
  };
}

function postPreviewReadyMessage() {
  if (!props.listenMessage) {
    return;
  }
  const payload = {
    type: PORTAL_PREVIEW_MESSAGE_PAGE_READY,
    data: {
      tabId: props.tabId,
      templateId: props.templateId || loadedTemplateId.value
    }
  };

  const safePost = (target: WindowProxy | null | undefined) => {
    if (!target || target === window) {
      return;
    }
    try {
      target.postMessage(payload, window.location.origin);
    } catch {
      // 忽略窗口已销毁等 postMessage 异常
    }
  };

  safePost(window.opener);
  safePost(window.parent);
}

function onMessage(event: MessageEvent) {
  // 只接收同源消息，避免被第三方页面触发刷新
  if (event.origin && event.origin !== window.location.origin) {
    return;
  }

  const data = event.data as unknown;
  if (!data || typeof data !== 'object') {
    return;
  }

  const msg = data as { type?: unknown; data?: unknown };
  if (msg.type === PORTAL_PREVIEW_MESSAGE_SHELL_DETAILS) {
    const payload = msg.data as { details?: unknown; templateId?: unknown } | undefined;
    const details = typeof payload?.details === 'string' ? payload.details : '';
    const payloadTemplateId = normalizeIdLike(payload?.templateId);
    if (
      payloadTemplateId &&
      payloadTemplateId !== props.templateId &&
      payloadTemplateId !== loadedTemplateId.value
    ) {
      return;
    }
    previewShellDetailsOverride.value = details;
    templateDetails.value = parsePortalTemplateDetails(details);
    return;
  }

  if (msg.type === PORTAL_PREVIEW_MESSAGE_VIEWPORT) {
    const payload = msg.data as
      | {
          width?: unknown;
          height?: unknown;
          tabId?: unknown;
          templateId?: unknown;
        }
      | undefined;
    const payloadTemplateId = normalizeIdLike(payload?.templateId);
    const payloadTabId = normalizeIdLike(payload?.tabId);
    if (
      payloadTemplateId &&
      payloadTemplateId !== props.templateId &&
      payloadTemplateId !== loadedTemplateId.value
    ) {
      return;
    }
    if (payloadTabId && payloadTabId !== props.tabId) {
      return;
    }
    setRuntimeViewport(payload?.width, payload?.height);
    return;
  }

  if (msg.type === PORTAL_PREVIEW_MESSAGE_PAGE_RUNTIME) {
    const payload = msg.data as PreviewPageRuntimePayload | undefined;
    applyRuntimePagePreview(payload);
    return;
  }

  if (msg.type !== 'refresh-portal') {
    return;
  }

  const payload = msg.data as { tabId?: unknown } | undefined;
  const nextTabId = normalizeIdLike(payload?.tabId);
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

    props.onNavigate?.({
      type: 'tab',
      tabId: item.tabId,
      item
    });
    return;
  }

  if (item.url) {
    const payload: PortalPreviewNavigatePayload = {
      type: 'url',
      url: item.url,
      item
    };
    if (props.onNavigate) {
      props.onNavigate(payload);
      return;
    }
    window.open(item.url, '_blank', 'noopener,noreferrer');
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
  () => [props.viewportWidth, props.viewportHeight] as const,
  ([width, height]) => {
    setRuntimeViewport(width, height);
  },
  { immediate: true }
);

watch(
  () => [props.tabId, props.templateId] as const,
  () => {
    postPreviewReadyMessage();
  }
);

watch(
  () => props.listenMessage,
  (enabled) => {
    if (enabled) {
      window.addEventListener('message', onMessage);
    } else {
      window.removeEventListener('message', onMessage);
    }
  },
  { immediate: true }
);

onMounted(() => {
  updateViewportWidth();
  postPreviewReadyMessage();
  window.addEventListener('resize', updateViewportWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage);
  window.removeEventListener('resize', updateViewportWidth);
});

defineExpose({
  refresh,
  applyRuntimePagePreview,
  getRuntimeSnapshot
});
</script>

<template>
  <div v-loading="loading" class="preview-page" :class="{ 'preview-page--embedded': embedded }">
    <div
      class="preview-shell"
      :class="{
        'preview-shell--fixed': hasFixedViewport,
        'preview-shell--content-scroll': useContentScroll,
        'preview-shell--portal-outline': showPreviewAreaOutline,
        [layoutShellClass]: true
      }"
      :style="previewShellStyle"
    >
      <div v-if="errorMessage" class="state state--error">
        <el-result icon="error" title="加载失败" :sub-title="errorMessage">
          <template #extra>
            <el-button @click="refresh()">重试</el-button>
          </template>
        </el-result>
      </div>

      <component
        :is="layoutComponent"
        v-else
        :key="activeLayoutMode"
        v-bind="layoutProps"
        class="preview-layout-host"
        :class="{ 'preview-layout-host--content-scroll': useContentScroll }"
      >
        <template #header>
          <div v-if="showHeader" class="header-wrap" :style="headerWrapStyle">
            <component
              :is="customHeaderComponent"
              v-if="customHeaderComponent"
              :config="resolvedShell.header"
              :nav-items="headerNavItems"
              :active-tab-id="props.tabId"
              @navigate="onHeaderNavigate"
            />

            <ConfigurablePortalHeader
              v-else
              :key="`header-${activeLayoutMode}`"
              :config="resolvedShell.header"
              :nav-items="headerNavItems"
              :active-tab-id="props.tabId"
              :embedded="props.embedded"
              :sticky="false"
              @navigate="onHeaderNavigate"
            />
          </div>
        </template>

        <template #content>
          <div class="content" :class="{ 'content--embedded': embedded }" :style="contentStyle">
            <div
              class="content-frame"
              :class="{ 'content-frame--empty': useViewportFillForEmpty }"
              :style="contentFrameStyle"
            >
              <a
                v-if="showBanner && normalizedPageSettings.banner.linkUrl"
                class="page-banner page-banner--link"
                :style="bannerStyle"
                :href="normalizedPageSettings.banner.linkUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="page-banner__hint">Banner 独立区域</span>
              </a>
              <div v-else-if="showBanner" class="page-banner" :style="bannerStyle">
                <span class="page-banner__hint">Banner 独立区域</span>
              </div>

              <div class="content-main" :style="contentMainStyle">
                <div
                  class="content-container"
                  :class="{
                    'content-container--page-outline': showPreviewAreaOutline,
                    'content-container--empty': useViewportFillForEmpty
                  }"
                  :style="contentContainerStyle"
                >
                  <div v-if="layoutItems.length === 0" class="state state--empty">
                    <el-empty description="当前页面暂未配置组件" :image-size="100">
                      <template #description>
                        <p class="empty-desc">可先进入编辑器添加组件后，再返回此处查看效果。</p>
                      </template>
                    </el-empty>
                  </div>

                  <PortalGridRenderer
                    v-else
                    :layout-items="layoutItems"
                    :materials-map="rendererMaterialsMap"
                    :page-setting-data="pageSettingData"
                    :preview-mode="props.previewMode"
                    :viewport-width="activeViewportWidth"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #footer>
          <div
            v-if="showFooter"
            class="footer-wrap"
            :class="{ 'footer-wrap--fixed': useFixedFooter }"
          >
            <ConfigurablePortalFooter
              :key="`footer-${activeLayoutMode}`"
              :config="resolvedShell.footer"
              :fixed="useFixedFooter"
            />
          </div>
        </template>
      </component>
    </div>
  </div>
</template>

<style scoped>
.preview-page {
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  background: var(--el-bg-color);
}

.preview-page--embedded {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 8px;
  box-sizing: border-box;
}

.preview-shell {
  width: 100%;
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

.preview-shell--content-scroll {
  overflow: hidden;
}

.preview-shell--portal-outline {
  position: relative;
  outline: 1px solid rgb(37 99 235 / 0.42);
  outline-offset: -1px;
}

.preview-layout-host {
  min-height: 100%;
}

.preview-layout-host--content-scroll {
  min-height: 0;
  height: 100%;
}

.header-wrap {
  z-index: 20;
}

.content {
  flex: 1;
  min-height: 0;
  /* padding: 8px; */
  background: var(--el-bg-color);
  box-sizing: border-box;
}

.content--embedded {
  width: 100%;
  min-height: 0;
}

.content-frame {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100%;
}

.content-frame--empty {
  min-height: 100%;
}

.content-container {
  min-height: 0;
}

.content-main {
  min-height: 0;
}

.content-container--empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.content-container--page-outline {
  border: 1px dashed rgb(245 158 11 / 0.7);
}

.page-banner {
  position: relative;
  overflow: hidden;
  border: 1px dashed var(--el-border-color);
  border-radius: 10px;
  background: linear-gradient(135deg, rgb(15 98 207 / 0.14), rgb(15 98 207 / 0.04));
}

.page-banner--link {
  display: block;
  text-decoration: none;
}

.page-banner__hint {
  position: absolute;
  right: 10px;
  bottom: 10px;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: #fff;
  background: rgb(0 0 0 / 0.45);
}

.footer-wrap {
  position: relative;
  z-index: 15;
}

.footer-wrap--fixed {
  box-shadow: 0 -2px 10px rgb(0 0 0 / 0.08);
}

.preview-shell--layout-global-scroll :deep(.footer--fixed),
.preview-shell--layout-header-fixed-content-scroll :deep(.footer--fixed) {
  position: static;
  bottom: auto;
}

.state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
}

.state--empty {
  flex: 1;
  min-height: 0;
  background: var(--el-bg-color);
}

.empty-desc {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
