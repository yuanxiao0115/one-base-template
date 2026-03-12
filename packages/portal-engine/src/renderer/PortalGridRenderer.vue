<script setup lang="ts">
  import { computed } from 'vue';
  import type { Component } from 'vue';
  import { GridItem, GridLayout } from 'grid-layout-plus';

  import { getPortalGridSettings } from '../schema/page-settings';
  import type { PortalLayoutItem } from '../stores/pageLayout';

  const props = defineProps<{
    layoutItems: PortalLayoutItem[];
    materialsMap: Record<string, Component>;
    pageSettingData: unknown;
    previewMode?: 'safe' | 'live';
    viewportWidth?: number;
  }>();

  const gridSettings = computed(() =>
    getPortalGridSettings(props.pageSettingData, {
      viewportWidth: props.viewportWidth,
    })
  );
  const colNum = computed(() => gridSettings.value.colNum);
  const marginX = computed(() => gridSettings.value.colSpace);
  const marginY = computed(() => gridSettings.value.rowSpace);
  const rowHeight = computed(() => 1);

  function getComponentName(item: PortalLayoutItem): string | undefined {
    const name = item.component?.cmptConfig?.index?.name;
    return typeof name === 'string' ? name : undefined;
  }

  function getComponent(item: PortalLayoutItem) {
    const name = getComponentName(item);
    return name ? props.materialsMap[name] : null;
  }

  function getComponentConfig(item: PortalLayoutItem) {
    return item.component?.cmptConfig || {};
  }
</script>

<template>
  <GridLayout
    :layout="props.layoutItems"
    :col-num
    :row-height
    :margin="[marginX, marginY]"
    :is-draggable="false"
    :is-resizable="false"
    :prevent-collision="false"
    class="grid-layout"
  >
    <GridItem
      v-for="item in props.layoutItems"
      :key="item.i"
      :x="item.x"
      :y="item.y"
      :w="item.w"
      :h="item.h"
      :i="item.i"
      class="grid-item"
    >
      <component
        :is="getComponent(item)"
        v-if="getComponentName(item)"
        :id="item.i"
        :schema="getComponentConfig(item)"
        :preview-mode="props.previewMode"
      />
      <div v-else class="component-debug-placeholder">
        <div class="debug-header">组件缺失：{{ getComponentName(item) || '未知组件' }}</div>
        <div class="debug-info">i={{ item.i }}/ x={{ item.x }}/ y={{ item.y }}/ w={{ item.w }}/ h={{ item.h }}</div>
      </div>
    </GridItem>
  </GridLayout>
</template>

<style scoped>
  .grid-layout {
    position: relative;
    width: 100%;
    min-height: 100%;
  }

  .grid-item {
    overflow: hidden;
    border-radius: 8px;
    background: var(--el-bg-color-overlay);
  }

  .component-debug-placeholder {
    display: flex;
    overflow: auto;
    border: 1px dashed var(--el-color-danger);
    padding: 10px;
    width: 100%;
    height: 100%;
    background: var(--el-fill-color-lighter);
    flex-direction: column;
    gap: 8px;
  }

  .debug-header {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .debug-info {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
