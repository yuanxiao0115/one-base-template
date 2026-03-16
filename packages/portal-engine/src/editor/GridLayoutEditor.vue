<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { Component, CSSProperties } from 'vue';
import { GridItem, GridLayout } from 'grid-layout-plus';

import { getPortalGridSettings, normalizePortalPageSettingsV2 } from '../schema/page-settings';
import { hasLayoutGeometryChanged, mergeLayoutItems, type LayoutUpdateItem } from './layout-sync';
import TabContainerEditorItem from './TabContainerEditorItem.vue';
import { deepClone } from '../utils/deep';
import {
  type PortalLayoutItem,
  isTabContainerLayoutItem,
  resolveLayoutItemComponentName,
  usePortalPageLayoutStore
} from '../stores/pageLayout';

const props = defineProps<{
  materialsMap: Record<string, Component>;
  scale: number;
  loaded: boolean;
  pageSettingData: unknown;
}>();

const pageLayoutStore = usePortalPageLayoutStore();

const isDragOver = ref(false);
const gridContainer = ref<HTMLDivElement>();
const viewportWidth = ref(1920);

const pageSettings = computed(() => normalizePortalPageSettingsV2(props.pageSettingData));

const gridSettings = computed(() =>
  getPortalGridSettings(pageSettings.value, {
    viewportWidth: viewportWidth.value
  })
);
const colNum = computed(() => gridSettings.value.colNum);
const marginX = computed(() => gridSettings.value.colSpace);
const marginY = computed(() => gridSettings.value.rowSpace);

const rowHeight = computed(() => 1);

const layoutItems = computed(() => pageLayoutStore.layoutItems);
const selectedRootItemId = computed(() => pageLayoutStore.currentRootLayoutItemId);

function updateViewportWidth() {
  viewportWidth.value = Math.max(320, Math.round(window.innerWidth || 1920));
}

const gridContainerStyle = computed<CSSProperties>(() => {
  return {
    '--portal-content-min-height': `${pageSettings.value.layoutContainer.contentMinHeight}px`,
    overflowX: 'hidden',
    overflowY: pageSettings.value.layoutContainer.overflowMode
  } as CSSProperties;
});

function getComponentName(item: PortalLayoutItem): string | undefined {
  return resolveLayoutItemComponentName(item);
}

function getComponent(item: PortalLayoutItem) {
  const name = getComponentName(item);
  return name ? props.materialsMap[name] : null;
}

function isTransparentPlaceholder(item: PortalLayoutItem): boolean {
  const name = getComponentName(item);
  return name === 'base-transparent-placeholder-index';
}

function isTabContainer(item: PortalLayoutItem): boolean {
  return isTabContainerLayoutItem(item);
}

function getComponentConfig(item: PortalLayoutItem) {
  return item.component?.cmptConfig || {};
}

function handleLayoutUpdated(nextLayout: LayoutUpdateItem[]) {
  const prevLayout = pageLayoutStore.layoutItems;
  const merged = mergeLayoutItems(prevLayout, nextLayout);
  if (!hasLayoutGeometryChanged(prevLayout, merged)) {
    return;
  }
  pageLayoutStore.updateLayoutItems(merged);
}

function handleGridContainerClick() {
  pageLayoutStore.deselectLayoutItem();
}

function handleClickGridItem(itemId: string) {
  pageLayoutStore.selectLayoutItem(itemId);
}

function delItem(item: PortalLayoutItem) {
  pageLayoutStore.removeLayoutItem(item.i);
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  isDragOver.value = true;
}

function onDragLeave() {
  isDragOver.value = false;
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  isDragOver.value = false;

  const container = gridContainer.value;
  const dt = e.dataTransfer;
  if (!(container && dt)) {
    return;
  }

  const rect = container.getBoundingClientRect();
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // 鼠标落点不在画布内时直接忽略
  if (mouseX < rect.left || mouseX > rect.right || mouseY < rect.top || mouseY > rect.bottom) {
    return;
  }

  const jsonStr = dt.getData('application/json') || dt.getData('text/plain');
  if (!jsonStr) {
    return;
  }

  let payload: { w?: unknown; h?: unknown; cmptConfig?: unknown };
  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return;
    }
    payload = parsed as { w?: unknown; h?: unknown; cmptConfig?: unknown };
  } catch {
    return;
  }

  const relativeX = mouseX - rect.left;
  const relativeY = mouseY - rect.top;

  const cols = Math.max(1, Number(colNum.value) || 12);
  const mx = Math.max(0, Number(marginX.value) || 0);
  const my = Math.max(0, Number(marginY.value) || 0);
  const rh = Math.max(1, Number(rowHeight.value) || 1);

  // vueGridLayout 的列宽计算：考虑左右 margin
  const colWidth = (rect.width - mx * (cols + 1)) / cols;
  const xUnit = Math.max(1, colWidth + mx);
  const yUnit = rh + my;

  let gridX = Math.floor((relativeX - mx) / xUnit);
  let gridY = Math.floor((relativeY - my) / yUnit);
  if (!Number.isFinite(gridX)) {
    gridX = 0;
  }
  if (!Number.isFinite(gridY)) {
    gridY = 0;
  }

  const defaultW = Math.min(Math.max(1, Number(payload?.w) || 6), cols);
  const defaultH = Math.max(1, Math.round(Number(payload?.h) || 6));

  gridX = Math.max(0, Math.min(gridX, cols - 1));
  gridY = Math.max(0, gridY);
  if (gridX + defaultW > cols) {
    gridX = Math.max(0, cols - defaultW);
  }

  const itemId = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const newItem: PortalLayoutItem = {
    x: gridX,
    y: gridY,
    w: defaultW,
    h: defaultH,
    i: itemId,
    component: {
      cmptConfig: deepClone((payload?.cmptConfig as Record<string, unknown> | undefined) || {})
    }
  };

  pageLayoutStore.updateLayoutItems([...pageLayoutStore.layoutItems, newItem]);
  pageLayoutStore.selectLayoutItem(newItem.i);
}

onMounted(() => {
  updateViewportWidth();
  window.addEventListener('resize', updateViewportWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportWidth);
});
</script>

<template>
  <div
    ref="gridContainer"
    class="grid-container"
    :class="{
      empty: !props.loaded || layoutItems.length === 0,
      'drag-over': isDragOver
    }"
    :style="gridContainerStyle"
    @click="handleGridContainerClick"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <GridLayout
      :layout="layoutItems"
      :transform-scale="props.scale"
      :col-num
      :row-height
      :margin="[marginX, marginY]"
      :prevent-collision="false"
      class="grid-layout"
      @layout-updated="handleLayoutUpdated"
    >
      <template v-if="layoutItems.length === 0">
        <div class="empty-layout"><el-empty description="拖拽物料到此处开始布局" /></div>
      </template>

      <template v-else>
        <GridItem
          v-for="item in layoutItems"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          class="grid-item"
          :class="{
            active: selectedRootItemId === item.i,
            'is-transparent-placeholder': isTransparentPlaceholder(item)
          }"
          @click.stop="() => handleClickGridItem(item.i)"
        >
          <div class="item-inner">
            <button class="item-delete" type="button" @click.stop="() => delItem(item)">
              删除
            </button>

            <TabContainerEditorItem
              v-if="isTabContainer(item)"
              :item="item"
              :materials-map="props.materialsMap"
              :page-setting-data="pageSettings"
            />

            <component
              :is="getComponent(item)"
              v-else-if="getComponentName(item)"
              :id="item.i"
              :schema="getComponentConfig(item)"
              :materials-map="props.materialsMap"
              :page-setting-data="pageSettings"
            />
            <div v-else class="component-debug-placeholder">
              <div class="debug-header">组件缺失：{{ getComponentName(item) || '未知组件' }}</div>
              <div class="debug-info">
                i={{ item.i }} / x={{ item.x }} / y={{ item.y }} / w={{ item.w }} / h={{ item.h }}
              </div>
            </div>
          </div>
        </GridItem>
      </template>
    </GridLayout>
  </div>
</template>

<style scoped>
.grid-container {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  width: 100%;
  height: auto;
  background-color: #f8fafc;
  background-image:
    linear-gradient(to right, rgb(15 23 42 / 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(15 23 42 / 0.08) 1px, transparent 1px);
  background-size: 20px 20px;
}

.grid-container.drag-over {
  border-style: dashed;
  border-color: var(--el-color-primary);
}

.empty-layout {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.grid-layout {
  position: relative;
  min-height: max(560px, var(--portal-content-min-height, 560px));
  width: 100%;
}

.grid-item {
  overflow: hidden;
  border-radius: 10px;
  background: transparent;
  box-shadow: 0 2px 8px rgb(2 8 23 / 0.06);
  transition:
    box-shadow 140ms ease,
    outline-color 140ms ease;
}

.grid-item.active {
  outline: 2px solid var(--el-color-primary);
}

.grid-item.is-transparent-placeholder {
  background: transparent;
  box-shadow: none;
}

.item-inner {
  position: relative;
  overflow: auto;
  width: 100%;
  height: 100%;
}

.item-delete {
  position: absolute;
  z-index: 2;
  top: 8px;
  right: 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--el-color-danger);
  background: rgb(255 255 255 / 0.92);
  cursor: pointer;
  opacity: 0;
  transform: translateY(-2px);
  transition: all 120ms ease;
}

.grid-item:hover .item-delete,
.grid-item.active .item-delete {
  opacity: 1;
  transform: translateY(0);
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
