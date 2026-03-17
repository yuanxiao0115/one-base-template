<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="admin-simple-container" :style="tabsVars">
      <div
        v-if="isAdminSimpleContainerSchema"
        class="admin-simple-container__body"
        :style="bodyStyleObj"
      >
        <PortalGridRenderer
          v-if="currentTab.layoutItems.length > 0"
          :layout-items="currentTab.layoutItems"
          :materials-map="resolvedMaterialsMap"
          :page-setting-data="resolvedPageSettingData"
          :preview-mode="props.previewMode"
          :nest-level="currentNestLevel"
        />
        <div v-else class="admin-simple-container__empty-text">当前容器暂无组件内容</div>
      </div>

      <el-tabs
        v-else
        v-model="activeTabId"
        class="admin-simple-container__tabs"
        :stretch="tabsStyleConfig.stretch"
      >
        <el-tab-pane v-for="tab in tabs" :key="tab.id" :label="tab.title" :name="tab.id">
          <div class="admin-simple-container__pane" :style="tabPaneStyleObj">
            <PortalGridRenderer
              v-if="tab.layoutItems.length > 0"
              :layout-items="tab.layoutItems"
              :materials-map="resolvedMaterialsMap"
              :page-setting-data="resolvedPageSettingData"
              :preview-mode="props.previewMode"
              :nest-level="currentNestLevel"
            />
            <div v-else class="admin-simple-container__empty-text">当前页签暂无组件内容</div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import type { Component, CSSProperties } from 'vue';
import { computed, ref, watch } from 'vue';
import {
  PortalGridRenderer,
  type PortalLayoutItem,
  UnifiedContainerDisplay
} from '@one-base-template/portal-engine';

import {
  ADMIN_SIMPLE_CONTAINER_CONTENT_NAME,
  ADMIN_SIMPLE_CONTAINER_INDEX_NAME,
  ensureAdminSimpleContainerTabs,
  mergeAdminSimpleContainerBodyStyle,
  resolveAdminSimpleContainerActiveTabId,
  type AdminSimpleContainerSchema,
  type AdminSimpleContainerTab
} from './model';

interface TabStyleConfig {
  stretch?: boolean;
  textColor?: string;
  activeTextColor?: string;
  fontSize?: number;
  navMarginBottom?: number;
  paneBackgroundColor?: string;
  panePaddingTop?: number;
  panePaddingRight?: number;
  panePaddingBottom?: number;
  panePaddingLeft?: number;
}

interface GenericTab {
  id: string;
  title: string;
  layoutItems: PortalLayoutItem[];
}

const props = defineProps<{
  schema: AdminSimpleContainerSchema & {
    style?: {
      tabs?: TabStyleConfig;
      [key: string]: unknown;
    };
  };
  previewMode?: 'safe' | 'live';
  materialsMap?: Record<string, Component>;
  pageSettingData?: unknown;
  nestLevel?: number;
}>();

const activeTabId = ref('');

const isAdminSimpleContainerSchema = computed(
  () => props.schema?.content?.name === ADMIN_SIMPLE_CONTAINER_CONTENT_NAME
);

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);
const bodyStyleConfig = computed(() =>
  mergeAdminSimpleContainerBodyStyle(props.schema?.style?.body)
);

const resolvedMaterialsMap = computed<Record<string, Component>>(() => props.materialsMap || {});
const resolvedPageSettingData = computed(() => props.pageSettingData || {});

const currentNestLevel = computed(() => {
  const level = Number(props.nestLevel);
  return Number.isFinite(level) && level >= 0 ? Math.floor(level) : 0;
});

function normalizeGenericTabs(value: unknown): GenericTab[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((raw, index) => {
      if (!raw || typeof raw !== 'object') {
        return null;
      }

      const item = raw as Record<string, unknown>;
      const id =
        typeof item.id === 'string' && item.id.trim().length > 0
          ? item.id.trim()
          : `tab-${index + 1}`;
      const title =
        typeof item.title === 'string' && item.title.trim().length > 0
          ? item.title
          : `页签${index + 1}`;

      return {
        id,
        title,
        layoutItems: Array.isArray(item.layoutItems) ? (item.layoutItems as PortalLayoutItem[]) : []
      } satisfies GenericTab;
    })
    .filter(Boolean) as GenericTab[];
}

function resolveActiveTabId(tabs: GenericTab[], rawActiveTabId: unknown): string {
  const nextActiveTabId = typeof rawActiveTabId === 'string' ? rawActiveTabId.trim() : '';
  if (nextActiveTabId && tabs.some((tab) => tab.id === nextActiveTabId)) {
    return nextActiveTabId;
  }
  return tabs[0]?.id || '';
}

const tabs = computed<GenericTab[]>(() => {
  if (isAdminSimpleContainerSchema.value) {
    return ensureAdminSimpleContainerTabs(props.schema?.content?.tabs);
  }
  return normalizeGenericTabs(props.schema?.content?.tabs);
});

watch(
  [tabs, () => props.schema?.content?.activeTabId],
  ([nextTabs, nextRawActiveTabId]) => {
    if (isAdminSimpleContainerSchema.value) {
      activeTabId.value = resolveAdminSimpleContainerActiveTabId(
        nextTabs as AdminSimpleContainerTab[],
        nextRawActiveTabId
      );
      return;
    }

    activeTabId.value = resolveActiveTabId(nextTabs, nextRawActiveTabId);
  },
  { immediate: true }
);

const currentTab = computed<GenericTab>(
  () =>
    tabs.value.find((tab) => tab.id === activeTabId.value) || {
      id: activeTabId.value || 'tab-1',
      title: isAdminSimpleContainerSchema.value ? '容器内容' : '页签1',
      layoutItems: []
    }
);

const tabsStyleConfig = computed(() => {
  const tabsStyle = props.schema?.style?.tabs || {};

  return {
    stretch: tabsStyle.stretch === true,
    textColor: tabsStyle.textColor || '#475569',
    activeTextColor: tabsStyle.activeTextColor || '#2563eb',
    fontSize: Number(tabsStyle.fontSize) > 0 ? Number(tabsStyle.fontSize) : 14,
    navMarginBottom: Number.isFinite(Number(tabsStyle.navMarginBottom))
      ? Number(tabsStyle.navMarginBottom)
      : 12,
    paneBackgroundColor: tabsStyle.paneBackgroundColor || 'transparent',
    panePaddingTop: Number.isFinite(Number(tabsStyle.panePaddingTop))
      ? Number(tabsStyle.panePaddingTop)
      : 0,
    panePaddingRight: Number.isFinite(Number(tabsStyle.panePaddingRight))
      ? Number(tabsStyle.panePaddingRight)
      : 0,
    panePaddingBottom: Number.isFinite(Number(tabsStyle.panePaddingBottom))
      ? Number(tabsStyle.panePaddingBottom)
      : 0,
    panePaddingLeft: Number.isFinite(Number(tabsStyle.panePaddingLeft))
      ? Number(tabsStyle.panePaddingLeft)
      : 0
  };
});

const tabsVars = computed<CSSProperties>(() => ({
  '--ob-tabs-text-color': tabsStyleConfig.value.textColor,
  '--ob-tabs-active-text-color': tabsStyleConfig.value.activeTextColor,
  '--ob-tabs-font-size': `${tabsStyleConfig.value.fontSize}px`,
  '--ob-tabs-nav-margin-bottom': `${tabsStyleConfig.value.navMarginBottom}px`
}));

const tabPaneStyleObj = computed<CSSProperties>(() => ({
  background: tabsStyleConfig.value.paneBackgroundColor,
  paddingTop: `${tabsStyleConfig.value.panePaddingTop}px`,
  paddingRight: `${tabsStyleConfig.value.panePaddingRight}px`,
  paddingBottom: `${tabsStyleConfig.value.panePaddingBottom}px`,
  paddingLeft: `${tabsStyleConfig.value.panePaddingLeft}px`
}));

const bodyStyleObj = computed<CSSProperties>(() => {
  const style = bodyStyleConfig.value;
  const borderWidth = Math.max(0, Number(style.borderWidth) || 0);
  const borderStyle = style.borderStyle || 'none';

  return {
    background: style.backgroundColor,
    border:
      borderStyle === 'none'
        ? `${borderWidth}px solid transparent`
        : `${borderWidth}px ${borderStyle} ${style.borderColor}`,
    borderRadius: `${Math.max(0, Number(style.borderRadius) || 0)}px`,
    paddingTop: `${Math.max(0, Number(style.paddingTop) || 0)}px`,
    paddingRight: `${Math.max(0, Number(style.paddingRight) || 0)}px`,
    paddingBottom: `${Math.max(0, Number(style.paddingBottom) || 0)}px`,
    paddingLeft: `${Math.max(0, Number(style.paddingLeft) || 0)}px`
  };
});

defineOptions({
  name: ADMIN_SIMPLE_CONTAINER_INDEX_NAME
});
</script>

<style scoped>
.admin-simple-container {
  width: 100%;
  min-height: 140px;
}

.admin-simple-container__body,
.admin-simple-container__pane {
  width: 100%;
}

.admin-simple-container__tabs :deep(.el-tabs__header) {
  margin-bottom: var(--ob-tabs-nav-margin-bottom);
}

.admin-simple-container__tabs :deep(.el-tabs__item) {
  color: var(--ob-tabs-text-color);
  font-size: var(--ob-tabs-font-size);
}

.admin-simple-container__tabs :deep(.el-tabs__item.is-active) {
  color: var(--ob-tabs-active-text-color);
}

.admin-simple-container__empty-text {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #64748b;
  font-size: 13px;
}
</style>
