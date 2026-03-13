<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-tab-container" :style="tabsVars">
      <el-tabs v-model="activeTabId" class="base-tab-container__tabs" :stretch="tabsStyleConfig.stretch">
        <el-tab-pane v-for="tab in tabs" :key="tab.id" :label="tab.title" :name="tab.id">
          <div class="base-tab-container__pane" :style="tabPaneStyleObj">
            <PortalGridRenderer
              v-if="tab.layoutItems.length > 0"
              :layout-items="tab.layoutItems"
              :materials-map="resolvedMaterialsMap"
              :page-setting-data="resolvedPageSettingData"
              :preview-mode="previewMode"
              :nest-level="currentNestLevel"
            />
            <div v-else class="base-tab-container__empty">当前页签暂无组件内容</div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
  import { computed, ref, watch, type CSSProperties, type Component } from 'vue';

  import PortalGridRenderer from '../../../renderer/PortalGridRenderer.vue';
  import { normalizeTabContainerTabs, resolveTabContainerActiveTabId } from '../../../schema/tab-container';
  import { UnifiedContainerDisplay } from '../../common/unified-container';
  import type {
    UnifiedContainerContentConfigModel,
    UnifiedContainerStyleConfigModel,
  } from '../../common/unified-container';
  import { toNonNegativeNumber } from '../common/material-utils';
  import type { PortalLayoutItem } from '../../../stores/pageLayout';

  interface TabStyleConfig {
    type?: 'line' | 'card' | 'border-card';
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

  interface BaseTabContainerSchema {
    content?: {
      container?: Partial<UnifiedContainerContentConfigModel>;
      tabs?: Array<{ id?: string; title?: string; layoutItems?: PortalLayoutItem[] }>;
      activeTabId?: string;
    };
    style?: {
      container?: Partial<UnifiedContainerStyleConfigModel>;
      tabs?: TabStyleConfig;
    };
  }

  const props = defineProps<{
    schema: BaseTabContainerSchema;
    previewMode?: 'safe' | 'live';
    materialsMap?: Record<string, Component>;
    pageSettingData?: unknown;
    nestLevel?: number;
  }>();

  const containerContentConfig = computed(() => props.schema?.content?.container);
  const containerStyleConfig = computed(() => props.schema?.style?.container);

  const tabs = computed(() => normalizeTabContainerTabs<PortalLayoutItem>(props.schema?.content?.tabs));
  const tabsStyleConfig = computed<TabStyleConfig>(() => props.schema?.style?.tabs || {});
  const activeTabId = ref('');
  const lastSyncedSchemaActiveTabId = ref('');

  const resolvedMaterialsMap = computed<Record<string, Component>>(() => {
    if (!props.materialsMap || typeof props.materialsMap !== 'object') {
      return {};
    }
    return props.materialsMap;
  });

  const resolvedPageSettingData = computed(() => props.pageSettingData || {});
  const previewMode = computed(() => props.previewMode || 'safe');
  const currentNestLevel = computed(() => {
    const level = Number(props.nestLevel);
    return Number.isFinite(level) && level >= 0 ? Math.floor(level) : 0;
  });

  watch(
    () => [tabs.value, props.schema?.content?.activeTabId] as const,
    () => {
      const resolvedSchemaActiveTabId = resolveTabContainerActiveTabId(tabs.value, props.schema?.content?.activeTabId);
      const hasCurrent = tabs.value.some((tab) => tab.id === activeTabId.value);
      const schemaChanged = resolvedSchemaActiveTabId !== lastSyncedSchemaActiveTabId.value;

      if (!hasCurrent || !activeTabId.value || schemaChanged) {
        activeTabId.value = resolvedSchemaActiveTabId;
      }

      lastSyncedSchemaActiveTabId.value = resolvedSchemaActiveTabId;
    },
    { immediate: true, deep: true }
  );

  const tabsVars = computed<CSSProperties>(() => ({
    '--tab-text-color': tabsStyleConfig.value.textColor || '#475569',
    '--tab-active-color': tabsStyleConfig.value.activeTextColor || '#2563eb',
    '--tab-font-size': `${Math.max(12, Number(tabsStyleConfig.value.fontSize) || 14)}px`,
    '--tab-nav-mb': `${toNonNegativeNumber(tabsStyleConfig.value.navMarginBottom, 12)}px`,
  }));

  const tabPaneStyleObj = computed<CSSProperties>(() => ({
    background: tabsStyleConfig.value.paneBackgroundColor || 'transparent',
    padding: `${toNonNegativeNumber(tabsStyleConfig.value.panePaddingTop, 0)}px ${toNonNegativeNumber(
      tabsStyleConfig.value.panePaddingRight,
      0
    )}px ${toNonNegativeNumber(tabsStyleConfig.value.panePaddingBottom, 0)}px ${toNonNegativeNumber(
      tabsStyleConfig.value.panePaddingLeft,
      0
    )}px`,
  }));

  defineOptions({
    name: 'base-tab-container-index',
  });
</script>

<style scoped>
  .base-tab-container {
    width: 100%;
    height: 100%;
    min-height: 160px;
  }

  .base-tab-container__tabs {
    height: 100%;
  }

  .base-tab-container__tabs :deep(.el-tabs__header) {
    margin-bottom: var(--tab-nav-mb);
  }

  .base-tab-container__tabs :deep(.el-tabs__item) {
    font-size: var(--tab-font-size);
    color: var(--tab-text-color);
  }

  .base-tab-container__tabs :deep(.el-tabs__item.is-active) {
    color: var(--tab-active-color);
  }

  .base-tab-container__tabs :deep(.el-tabs__active-bar) {
    background: var(--tab-active-color);
  }

  .base-tab-container__tabs :deep(.el-tabs__content),
  .base-tab-container__tabs :deep(.el-tab-pane) {
    height: 100%;
  }

  .base-tab-container__pane {
    min-height: 120px;
    height: 100%;
  }

  .base-tab-container__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    border: 1px dashed rgb(148 163 184 / 0.4);
    border-radius: 8px;
    color: #64748b;
    background: rgb(148 163 184 / 0.08);
    font-size: 13px;
  }
</style>
