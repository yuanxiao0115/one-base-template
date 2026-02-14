<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Component } from 'vue';
import { GridItem, GridLayout } from 'grid-layout-plus';

import { deepClone } from '../../utils/deep';
import { usePortalPageLayoutStore, type PortalLayoutItem } from '../../stores/pageLayout';

type PortalPageSettings = {
  gridData?: {
    colNum?: number;
    colSpace?: number;
    rowSpace?: number;
  };
  [k: string]: unknown;
};

type LayoutUpdateItem = {
  i: string | number;
  x: number;
  y: number;
  w: number;
  h: number;
  component?: PortalLayoutItem['component'];
  [k: string]: unknown;
};

const props = defineProps<{
  materialsMap: Record<string, Component>;
  scale: number;
  loaded: boolean;
  pageSettingData: PortalPageSettings;
}>();

const pageLayoutStore = usePortalPageLayoutStore();

const isDragOver = ref(false);
const gridContainer = ref<HTMLDivElement>();

const colNum = computed(() => props.pageSettingData?.gridData?.colNum || 12);
const marginX = computed(() => props.pageSettingData?.gridData?.colSpace ?? 16);
const marginY = computed(() => props.pageSettingData?.gridData?.rowSpace ?? 16);

const rowHeight = computed(() => 1);

const layoutItems = computed(() => pageLayoutStore.layoutItems);
const selectedItemId = computed(() => pageLayoutStore.currentLayoutItemId);

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

function mergeLayoutWithComponents(next: LayoutUpdateItem[]): PortalLayoutItem[] {
  const prevMap = new Map(pageLayoutStore.layoutItems.map((i) => [i.i, i]));

  return next.map((raw) => {
    const id = String(raw.i);
    const prev = prevMap.get(id);
    return {
      ...(prev || {}),
      ...raw,
      i: id,
      component: raw.component ?? prev?.component,
    } as PortalLayoutItem;
  });
}

function handleLayoutUpdated(nextLayout: LayoutUpdateItem[]) {
  pageLayoutStore.updateLayoutItems(mergeLayoutWithComponents(nextLayout));
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
  if (!container || !dt) return;

  const rect = container.getBoundingClientRect();
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // 鼠标落点不在画布内时直接忽略
  if (mouseX < rect.left || mouseX > rect.right || mouseY < rect.top || mouseY > rect.bottom) return;

  const jsonStr = dt.getData('application/json') || dt.getData('text/plain');
  if (!jsonStr) return;

  let payload: { w?: unknown; h?: unknown; cmptConfig?: unknown } | null = null;
  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    if (!parsed || typeof parsed !== 'object') return;
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

  // VueGridLayout 的列宽计算：考虑左右 margin
  const colWidth = (rect.width - mx * (cols + 1)) / cols;
  const xUnit = Math.max(1, colWidth + mx);
  const yUnit = rh + my;

  let gridX = Math.floor((relativeX - mx) / xUnit);
  let gridY = Math.floor((relativeY - my) / yUnit);
  if (!Number.isFinite(gridX)) gridX = 0;
  if (!Number.isFinite(gridY)) gridY = 0;

  const defaultW = Math.min(Math.max(1, Number(payload?.w) || 6), cols);
  const defaultH = Math.max(1, Math.round(Number(payload?.h) || 6));

  gridX = Math.max(0, Math.min(gridX, cols - 1));
  gridY = Math.max(0, gridY);
  if (gridX + defaultW > cols) gridX = Math.max(0, cols - defaultW);

  const itemId = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const newItem: PortalLayoutItem = {
    x: gridX,
    y: gridY,
    w: defaultW,
    h: defaultH,
    i: itemId,
    component: {
      cmptConfig: deepClone((payload?.cmptConfig as Record<string, unknown> | undefined) || {}),
    },
  };

  pageLayoutStore.updateLayoutItems([...pageLayoutStore.layoutItems, newItem]);
  pageLayoutStore.selectLayoutItem(newItem.i);
}
</script>

<template>
  <div
    ref="gridContainer"
    class="grid-container"
    :class="{ empty: !props.loaded || layoutItems.length === 0, 'drag-over': isDragOver }"
    @click="handleGridContainerClick"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <GridLayout
      :layout="layoutItems"
      :transform-scale="props.scale"
      :col-num="colNum"
      :row-height="rowHeight"
      :margin="[marginX, marginY]"
      :prevent-collision="false"
      class="grid-layout"
      @layout-updated="handleLayoutUpdated"
    >
      <template v-if="layoutItems.length === 0">
        <div class="empty-layout">
          <el-empty description="拖拽物料到此处开始布局" />
        </div>
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
          :class="{ active: selectedItemId === item.i }"
          @click.stop="handleClickGridItem(item.i)"
          @moved="() => handleLayoutUpdated(layoutItems)"
          @resized="() => handleLayoutUpdated(layoutItems)"
        >
          <div class="item-inner">
            <button class="item-delete" type="button" @click.stop="delItem(item)">删除</button>

            <component
              :is="getComponent(item)"
              v-if="getComponentName(item)"
              :id="item.i"
              :schema="getComponentConfig(item)"
            />
            <div v-else class="component-debug-placeholder">
              <div class="debug-header">组件缺失：{{ getComponentName(item) || '未知组件' }}</div>
              <div class="debug-info">i={{ item.i }} / x={{ item.x }} / y={{ item.y }} / w={{ item.w }} / h={{ item.h }}</div>
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
  overflow: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, var(--el-fill-color-light) 0%, var(--el-bg-color-page) 100%);
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
  width: 100%;
  min-height: 100%;
}

.grid-item.active {
  outline: 1px dashed var(--el-color-primary);
}

.item-inner {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  width: 100%;
  height: 100%;
  background: var(--el-bg-color-overlay);
}

.item-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 20;
  display: none;
  border: 0;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: #fff;
  background: var(--el-color-danger);
  cursor: pointer;
}

.grid-item:hover .item-delete {
  display: inline-flex;
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
