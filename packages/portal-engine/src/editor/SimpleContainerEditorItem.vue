<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type Component,
  type CSSProperties
} from 'vue';
import { ElMessage } from 'element-plus';
import { GridItem, GridLayout } from 'grid-layout-plus';

import { getPortalGridSettings, normalizePortalPageSettingsV2 } from '../schema/page-settings';
import { BASE_TAB_CONTAINER_INDEX_NAME } from '../schema/tab-container';
import { hasLayoutGeometryChanged, mergeLayoutItems, type LayoutUpdateItem } from './layout-sync';
import { deepClone } from '../utils/deep';
import {
  type PortalLayoutItem,
  resolveLayoutItemComponentName,
  usePortalPageLayoutStore
} from '../stores/pageLayout';
import { UnifiedContainerDisplay } from '../materials/common/unified-container';
import {
  BASE_SIMPLE_CONTAINER_INDEX_NAME,
  type BaseSimpleContainerTab,
  createBaseSimpleContainerChildItemId,
  ensureBaseSimpleContainerTabs,
  mergeBaseSimpleContainerBodyStyle,
  resolveBaseSimpleContainerActiveTabId
} from '../materials/base/base-simple-container/model';

const props = defineProps<{
  item: PortalLayoutItem;
  materialsMap: Record<string, Component>;
  pageSettingData: unknown;
}>();

const pageLayoutStore = usePortalPageLayoutStore();
const activeTabId = ref('');
const isDragOver = ref(false);
const canvasRef = ref<HTMLDivElement>();
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

const tabs = computed(() =>
  ensureBaseSimpleContainerTabs<PortalLayoutItem>(props.item?.component?.cmptConfig?.content?.tabs)
);

watch(
  () => [tabs.value, props.item?.component?.cmptConfig?.content?.activeTabId] as const,
  () => {
    activeTabId.value = resolveBaseSimpleContainerActiveTabId(
      tabs.value,
      props.item?.component?.cmptConfig?.content?.activeTabId
    );
  },
  { immediate: true, deep: true }
);

const currentTab = computed<BaseSimpleContainerTab<PortalLayoutItem> | null>(() => {
  if (!activeTabId.value) {
    return null;
  }
  return tabs.value.find((tab) => tab.id === activeTabId.value) || null;
});

const currentTabLayoutItems = computed(() => currentTab.value?.layoutItems || []);

const selectedChildItemId = computed(() => {
  if (pageLayoutStore.currentSelectionType !== 'tab-child-item') {
    return null;
  }
  if (pageLayoutStore.currentRootLayoutItemId !== props.item.i) {
    return null;
  }
  if (pageLayoutStore.currentTabId !== activeTabId.value) {
    return null;
  }
  return pageLayoutStore.currentLayoutItemId;
});

const containerContentConfig = computed(
  () => props.item?.component?.cmptConfig?.content?.container || {}
);
const containerStyleConfig = computed(
  () => props.item?.component?.cmptConfig?.style?.container || {}
);
const bodyStyleConfig = computed(() =>
  mergeBaseSimpleContainerBodyStyle(props.item?.component?.cmptConfig?.style?.body)
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

function updateViewportWidth() {
  viewportWidth.value = Math.max(320, Math.round(window.innerWidth || 1920));
}

function commitTabs(
  nextTabs: BaseSimpleContainerTab<PortalLayoutItem>[],
  nextActiveTabId?: string
) {
  pageLayoutStore.updateTabContainerTabs(
    props.item.i,
    nextTabs,
    nextActiveTabId || activeTabId.value
  );
}

function updateCurrentTabLayoutItems(nextItems: PortalLayoutItem[]) {
  const tab = currentTab.value;
  if (!tab) {
    return;
  }

  const nextTabs = tabs.value.map((item) =>
    item.id === tab.id
      ? {
          ...item,
          layoutItems: deepClone(nextItems)
        }
      : item
  );
  commitTabs(nextTabs, tab.id);
}

function selectParentContainer() {
  pageLayoutStore.selectTabContainer(props.item.i);
}

function getComponentName(item: PortalLayoutItem): string | undefined {
  return resolveLayoutItemComponentName(item);
}

function getComponent(item: PortalLayoutItem) {
  const name = getComponentName(item);
  return name ? props.materialsMap[name] : null;
}

function isBlockedNestedContainer(item: PortalLayoutItem): boolean {
  const name = getComponentName(item);
  return name === BASE_SIMPLE_CONTAINER_INDEX_NAME || name === BASE_TAB_CONTAINER_INDEX_NAME;
}

function handleLayoutUpdated(nextLayout: LayoutUpdateItem[]) {
  const tab = currentTab.value;
  if (!tab) {
    return;
  }

  const prevLayout = currentTabLayoutItems.value;
  const merged = mergeLayoutItems(prevLayout, nextLayout);
  if (!hasLayoutGeometryChanged(prevLayout, merged)) {
    return;
  }

  updateCurrentTabLayoutItems(merged);
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  isDragOver.value = true;
}

function onDragLeave(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  isDragOver.value = false;
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  isDragOver.value = false;

  const targetTab = currentTab.value;
  const container =
    (event.currentTarget instanceof HTMLElement ? event.currentTarget : canvasRef.value) || null;
  const transferData = event.dataTransfer;
  if (!(targetTab && container && transferData)) {
    return;
  }

  const rect = container.getBoundingClientRect();
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  if (mouseX < rect.left || mouseX > rect.right || mouseY < rect.top || mouseY > rect.bottom) {
    return;
  }

  const rawPayload = transferData.getData('application/json') || transferData.getData('text/plain');
  if (!rawPayload) {
    return;
  }

  let payload: { w?: unknown; h?: unknown; cmptConfig?: unknown };
  try {
    const parsed = JSON.parse(rawPayload) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return;
    }
    payload = parsed as { w?: unknown; h?: unknown; cmptConfig?: unknown };
  } catch {
    return;
  }

  const droppedComponentName = (payload.cmptConfig as Record<string, unknown> | undefined)?.index as
    | Record<string, unknown>
    | undefined;
  const droppedIndexName =
    typeof droppedComponentName?.name === 'string' ? droppedComponentName.name : '';
  if (
    droppedIndexName === BASE_SIMPLE_CONTAINER_INDEX_NAME ||
    droppedIndexName === BASE_TAB_CONTAINER_INDEX_NAME
  ) {
    ElMessage.warning('单容器内禁止放置单容器或 Tab 容器');
    return;
  }

  const relativeX = mouseX - rect.left + container.scrollLeft;
  const relativeY = mouseY - rect.top + container.scrollTop;

  const cols = Math.max(1, Number(colNum.value) || 12);
  const mx = Math.max(0, Number(marginX.value) || 0);
  const my = Math.max(0, Number(marginY.value) || 0);
  const rh = Math.max(1, Number(rowHeight.value) || 1);

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

  const newItem: PortalLayoutItem = {
    x: gridX,
    y: gridY,
    w: defaultW,
    h: defaultH,
    i: createBaseSimpleContainerChildItemId(),
    component: {
      cmptConfig: deepClone((payload?.cmptConfig as Record<string, unknown> | undefined) || {})
    }
  };

  const nextItems = [...currentTabLayoutItems.value, newItem];
  updateCurrentTabLayoutItems(nextItems);
  pageLayoutStore.selectTabChildItem(props.item.i, targetTab.id, newItem.i);
}

function handleSelectChild(itemId: string) {
  const tab = currentTab.value;
  if (!tab) {
    return;
  }

  pageLayoutStore.selectTabChildItem(props.item.i, tab.id, itemId);
}

function handleDeleteChild(item: PortalLayoutItem) {
  const tab = currentTab.value;
  if (!tab) {
    return;
  }

  const nextItems = currentTabLayoutItems.value.filter((layoutItem) => layoutItem.i !== item.i);
  updateCurrentTabLayoutItems(nextItems);
  pageLayoutStore.selectTabContainer(props.item.i);
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
  <div class="simple-container-editor-root" @click.stop="selectParentContainer">
    <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
      <div class="simple-container-editor" :style="bodyStyleObj">
        <div
          ref="canvasRef"
          class="simple-container-editor__canvas"
          :class="{ 'is-drag-over': isDragOver }"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <GridLayout
            :layout="currentTabLayoutItems"
            :col-num
            :row-height
            :margin="[marginX, marginY]"
            :prevent-collision="false"
            class="simple-container-editor__layout"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
            @layout-updated="handleLayoutUpdated"
          >
            <div v-if="currentTabLayoutItems.length === 0" class="simple-container-editor__empty">
              <el-empty description="拖拽物料到容器内部画布" :image-size="64" />
            </div>

            <GridItem
              v-for="child in currentTabLayoutItems"
              :key="child.i"
              :x="child.x"
              :y="child.y"
              :w="child.w"
              :h="child.h"
              :i="child.i"
              class="simple-container-editor__item"
              :class="{ 'is-active': selectedChildItemId === child.i }"
              @click.stop="() => handleSelectChild(child.i)"
            >
              <div class="simple-container-editor__item-inner">
                <button
                  class="simple-container-editor__item-delete"
                  type="button"
                  @click.stop="() => handleDeleteChild(child)"
                >
                  删除
                </button>

                <component
                  :is="getComponent(child)"
                  v-if="
                    getComponentName(child) &&
                    getComponent(child) &&
                    !isBlockedNestedContainer(child)
                  "
                  :id="child.i"
                  :schema="child.component?.cmptConfig || {}"
                  :materials-map="props.materialsMap"
                  :page-setting-data="props.pageSettingData"
                />
                <div
                  v-else-if="isBlockedNestedContainer(child)"
                  class="simple-container-editor__nested-blocked"
                >
                  单容器内禁止嵌套单容器或 Tab 容器
                </div>
                <div v-else class="simple-container-editor__debug">
                  组件缺失：{{ getComponentName(child) || '未知组件' }}
                </div>
              </div>
            </GridItem>
          </GridLayout>
        </div>
      </div>
    </UnifiedContainerDisplay>
  </div>
</template>

<style scoped>
.simple-container-editor-root {
  width: 100%;
  height: 100%;
}

.simple-container-editor {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.simple-container-editor__canvas {
  overflow: auto;
  border: 1px dashed rgb(15 23 42 / 0.2);
  border-radius: 10px;
  width: 100%;
  height: 100%;
  min-height: 220px;
  background:
    linear-gradient(to right, rgb(15 23 42 / 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(15 23 42 / 0.08) 1px, transparent 1px);
  background-size: 20px 20px;
}

.simple-container-editor__canvas.is-drag-over {
  border-color: var(--el-color-primary);
}

.simple-container-editor__layout {
  min-height: 220px;
}

.simple-container-editor__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 220px;
}

.simple-container-editor__item {
  overflow: hidden;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgb(2 8 23 / 0.08);
}

.simple-container-editor__item.is-active {
  outline: 2px solid var(--el-color-primary);
}

.simple-container-editor__item-inner {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.simple-container-editor__item-delete {
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
}

.simple-container-editor__item-delete:hover {
  background: #ffffff;
}

.simple-container-editor__debug {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--el-color-danger);
  font-size: 12px;
}

.simple-container-editor__nested-blocked {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0 12px;
  text-align: center;
  border: 1px dashed var(--el-color-warning);
  border-radius: 8px;
  color: var(--el-color-warning-dark-2);
  background: var(--el-color-warning-light-9);
  font-size: 12px;
  line-height: 1.6;
}
</style>
