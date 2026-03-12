<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import type { Component, CSSProperties } from 'vue';
  import { GridItem, GridLayout } from 'grid-layout-plus';

  import {
    getPortalGridSettings,
    normalizePortalPageSettingsV2,
    resolvePortalPageRuntimeSettings,
    type PortalPageBackgroundSettings,
  } from '../schema/page-settings';
  import { hasLayoutGeometryChanged, mergeLayoutItems, type LayoutUpdateItem } from './layout-sync';
  import { deepClone } from '../utils/deep';
  import { type PortalLayoutItem, usePortalPageLayoutStore } from '../stores/pageLayout';

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

  const runtimeSettings = computed(() =>
    resolvePortalPageRuntimeSettings(pageSettings.value, {
      viewportWidth: viewportWidth.value,
    })
  );

  const gridSettings = computed(() =>
    getPortalGridSettings(pageSettings.value, {
      viewportWidth: viewportWidth.value,
    })
  );
  const colNum = computed(() => gridSettings.value.colNum);
  const marginX = computed(() => gridSettings.value.colSpace);
  const marginY = computed(() => gridSettings.value.rowSpace);

  const rowHeight = computed(() => 1);

  const layoutItems = computed(() => pageLayoutStore.layoutItems);
  const selectedItemId = computed(() => pageLayoutStore.currentLayoutItemId);
  const showBanner = computed(() => pageSettings.value.banner.enabled);

  function updateViewportWidth() {
    viewportWidth.value = Math.max(320, Math.round(window.innerWidth || 1920));
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
      style.backgroundSize = background.backgroundSizeMode === 'custom' ? background.backgroundSizeCustom : background.backgroundSizeMode;
    }

    return style;
  }

  const pageFrameStyle = computed<CSSProperties>(() => {
    const spacing = runtimeSettings.value.spacing;
    const widthMode = pageSettings.value.layoutContainer.widthMode;

    const style: CSSProperties = {
      marginTop: `${spacing.marginTop}px`,
      marginRight: `${spacing.marginRight}px`,
      marginBottom: `${spacing.marginBottom}px`,
      marginLeft: `${spacing.marginLeft}px`,
    };

    if (widthMode !== 'full-width') {
      style.display = 'flex';
      style.justifyContent = pageSettings.value.layoutContainer.contentAlign === 'left' ? 'flex-start' : 'center';
    }

    if (pageSettings.value.background.scope === 'page') {
      Object.assign(style, buildBackgroundStyle(pageSettings.value.background));
    }

    return style;
  });

  const pageCanvasStyle = computed<CSSProperties>(() => {
    const spacing = runtimeSettings.value.spacing;
    const container = pageSettings.value.layoutContainer;

    const style: CSSProperties = {
      paddingTop: `${spacing.paddingTop}px`,
      paddingRight: `${spacing.paddingRight}px`,
      paddingBottom: `${spacing.paddingBottom}px`,
      paddingLeft: `${spacing.paddingLeft}px`,
      '--portal-content-min-height': `${container.contentMinHeight}px`,
    };

    if (container.widthMode === 'full-width') {
      style.width = '100%';
    } else if (container.widthMode === 'custom') {
      style.width = `${container.customWidth}px`;
      style.maxWidth = '100%';
    } else {
      style.width = `${container.fixedWidth}px`;
      style.maxWidth = '100%';
    }

    return style;
  });

  const bannerStyle = computed<CSSProperties>(() => {
    const banner = pageSettings.value.banner;
    const spacing = runtimeSettings.value.spacing;
    const style: CSSProperties = {
      height: `${runtimeSettings.value.bannerHeight}px`,
    };

    if (banner.fullWidth) {
      style.marginLeft = `-${spacing.paddingLeft}px`;
      style.marginRight = `-${spacing.paddingRight}px`;
      style.borderRadius = '0';
    }

    const fallbackBackground = pageSettings.value.background.scope === 'banner' ? pageSettings.value.background : null;

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

  const gridContainerStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {
      overflowX: 'hidden',
      overflowY: pageSettings.value.layoutContainer.overflowMode,
    };

    if (pageSettings.value.background.scope === 'content') {
      Object.assign(style, buildBackgroundStyle(pageSettings.value.background));
    }

    return style;
  });

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
        cmptConfig: deepClone((payload?.cmptConfig as Record<string, unknown> | undefined) || {}),
      },
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
  <div class="page-frame" :style="pageFrameStyle">
    <div class="page-canvas" :style="pageCanvasStyle">
      <a
        v-if="showBanner && pageSettings.banner.linkUrl"
        class="page-banner page-banner--link"
        :style="bannerStyle"
        :href="pageSettings.banner.linkUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="page-banner__hint">Banner（独立区域，不参与拖拽布局）</span>
      </a>
      <div v-else-if="showBanner" class="page-banner" :style="bannerStyle">
        <span class="page-banner__hint">Banner（独立区域，不参与拖拽布局）</span>
      </div>

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
              :class="{ active: selectedItemId === item.i }"
              @click.stop="() => handleClickGridItem(item.i)"
            >
              <div class="item-inner">
                <button class="item-delete" type="button" @click.stop="() => delItem(item)">删除</button>

                <component
                  :is="getComponent(item)"
                  v-if="getComponentName(item)"
                  :id="item.i"
                  :schema="getComponentConfig(item)"
                />
                <div v-else class="component-debug-placeholder">
                  <div class="debug-header">组件缺失：{{ getComponentName(item) || '未知组件' }}</div>
                  <div class="debug-info">
                    i={{ item.i }}
                    / x={{ item.x }}
                    / y={{ item.y }}
                    / w={{ item.w }}
                    / h={{ item.h }}
                  </div>
                </div>
              </div>
            </GridItem>
          </template>
        </GridLayout>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .page-frame {
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .page-canvas {
    box-sizing: border-box;
    display: flex;
    width: 100%;
    height: 100%;
    min-height: 0;
    flex-direction: column;
    overflow: hidden;
  }

  .page-banner {
    position: relative;
    overflow: hidden;
    border: 1px dashed var(--el-border-color);
    border-radius: 10px;
    margin-bottom: 12px;
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
    min-height: max(560px, var(--portal-content-min-height, 560px));
    width: 100%;
  }

  .grid-item {
    overflow: hidden;
    border-radius: 10px;
    background: var(--el-bg-color-overlay);
    box-shadow: 0 2px 8px rgb(2 8 23 / 0.06);
    transition:
      box-shadow 140ms ease,
      outline-color 140ms ease;
  }

  .grid-item.active {
    outline: 2px solid var(--el-color-primary);
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
