<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-simple-container" :style="bodyStyleObj">
      <PortalGridRenderer
        v-if="currentTab.layoutItems.length > 0"
        :layout-items="currentTab.layoutItems"
        :materials-map="resolvedMaterialsMap"
        :page-setting-data="resolvedPageSettingData"
        :preview-mode="previewMode"
        :nest-level="currentNestLevel"
      />
      <div v-else class="base-simple-container__empty">当前容器暂无组件内容</div>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import { computed, type Component, type CSSProperties } from 'vue';

import PortalGridRenderer from '../../../renderer/PortalGridRenderer.vue';
import type { PortalLayoutItem } from '../../../stores/pageLayout';
import { UnifiedContainerDisplay } from '../../common/unified-container';
import {
  BASE_SIMPLE_CONTAINER_INDEX_NAME,
  ensureBaseSimpleContainerTabs,
  mergeBaseSimpleContainerBodyStyle,
  resolveBaseSimpleContainerActiveTabId,
  type BaseSimpleContainerSchema,
  type BaseSimpleContainerTab
} from './model';

const props = defineProps<{
  schema: BaseSimpleContainerSchema;
  previewMode?: 'safe' | 'live';
  materialsMap?: Record<string, Component>;
  pageSettingData?: unknown;
  nestLevel?: number;
}>();

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);
const bodyStyleConfig = computed(() =>
  mergeBaseSimpleContainerBodyStyle(props.schema?.style?.body)
);

const resolvedMaterialsMap = computed<Record<string, Component>>(() => props.materialsMap || {});
const resolvedPageSettingData = computed(() => props.pageSettingData || {});
const previewMode = computed(() => props.previewMode || 'safe');
const currentNestLevel = computed(() => {
  const level = Number(props.nestLevel);
  return Number.isFinite(level) && level >= 0 ? Math.floor(level) : 0;
});

const tabs = computed(() =>
  ensureBaseSimpleContainerTabs<PortalLayoutItem>(props.schema?.content?.tabs)
);
const activeTabId = computed(() =>
  resolveBaseSimpleContainerActiveTabId(tabs.value, props.schema?.content?.activeTabId)
);

const currentTab = computed<BaseSimpleContainerTab<PortalLayoutItem>>(
  () =>
    tabs.value.find((tab) => tab.id === activeTabId.value) || {
      id: activeTabId.value,
      title: '容器内容',
      layoutItems: []
    }
);

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
  name: 'base-simple-container-index'
});
</script>

<style scoped>
.base-simple-container {
  width: 100%;
  min-height: 120px;
}

.base-simple-container__empty {
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
