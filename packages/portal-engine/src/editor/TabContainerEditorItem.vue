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
import {
  BASE_TAB_CONTAINER_INDEX_NAME,
  createTabContainerChildItemId,
  normalizeTabContainerTabs,
  resolveTabContainerActiveTabId,
  type TabContainerTab
} from '../schema/tab-container';
import { hasLayoutGeometryChanged, mergeLayoutItems, type LayoutUpdateItem } from './layout-sync';
import { deepClone } from '../utils/deep';
import {
  type PortalLayoutItem,
  resolveLayoutItemComponentName,
  usePortalPageLayoutStore
} from '../stores/pageLayout';
import { UnifiedContainerDisplay } from '../materials/common/unified-container';

const props = defineProps<{
  item: PortalLayoutItem;
  materialsMap: Record<string, Component>;
  pageSettingData: unknown;
}>();

const pageLayoutStore = usePortalPageLayoutStore();
const activeTabId = ref('');
const isDragOver = ref(false);
const tabCanvasRef = ref<HTMLDivElement>();
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
  normalizeTabContainerTabs<PortalLayoutItem>(props.item?.component?.cmptConfig?.content?.tabs)
);
const tabsStyleConfig = computed<Record<string, unknown>>(
  () => props.item?.component?.cmptConfig?.style?.tabs || {}
);
const containerContentConfig = computed(
  () => props.item?.component?.cmptConfig?.content?.container || {}
);
const containerStyleConfig = computed(
  () => props.item?.component?.cmptConfig?.style?.container || {}
);

const currentTabLayoutItems = computed(() =>
  pageLayoutStore.getTabChildLayoutItems(props.item.i, activeTabId.value)
);

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

const tabsVars = computed<CSSProperties>(() => ({
  '--tab-text-color': String(tabsStyleConfig.value.textColor || '#475569'),
  '--tab-active-color': String(tabsStyleConfig.value.activeTextColor || '#2563eb'),
  '--tab-font-size': `${Math.max(12, Number(tabsStyleConfig.value.fontSize) || 14)}px`,
  '--tab-nav-mb': `${Math.max(0, Number(tabsStyleConfig.value.navMarginBottom) || 12)}px`
}));

function getCurrentTab(): TabContainerTab<PortalLayoutItem> | null {
  return tabs.value.find((tab) => tab.id === activeTabId.value) || null;
}

function commitTabs(nextTabs: TabContainerTab<PortalLayoutItem>[], nextActiveTabId?: string) {
  pageLayoutStore.updateTabContainerTabs(
    props.item.i,
    nextTabs,
    nextActiveTabId || activeTabId.value
  );
}

function updateViewportWidth() {
  viewportWidth.value = Math.max(320, Math.round(window.innerWidth || 1920));
}

function selectParentTabContainer() {
  pageLayoutStore.selectTabContainer(props.item.i);
}

function handleTabChange(nextTabId: string | number) {
  const normalizedId = String(nextTabId || '');
  if (!normalizedId) {
    return;
  }
  activeTabId.value = normalizedId;
  commitTabs(tabs.value, normalizedId);
  pageLayoutStore.selectTabContainer(props.item.i);
}

function handleLayoutUpdated(nextLayout: LayoutUpdateItem[]) {
  const tab = getCurrentTab();
  if (!tab) {
    return;
  }
  const prevLayout = currentTabLayoutItems.value;
  const merged = mergeLayoutItems(prevLayout, nextLayout);
  if (!hasLayoutGeometryChanged(prevLayout, merged)) {
    return;
  }
  pageLayoutStore.updateTabChildLayoutItems(props.item.i, tab.id, merged);
}

function getComponentName(item: PortalLayoutItem): string | undefined {
  return resolveLayoutItemComponentName(item);
}

function getComponent(item: PortalLayoutItem) {
  const name = getComponentName(item);
  return name ? props.materialsMap[name] : null;
}

function isNestedTabContainer(item: PortalLayoutItem): boolean {
  return getComponentName(item) === BASE_TAB_CONTAINER_INDEX_NAME;
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  isDragOver.value = true;
}

function onDragLeave(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  isDragOver.value = false;
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  isDragOver.value = false;

  const currentTab = getCurrentTab();
  const container =
    (e.currentTarget instanceof HTMLElement ? e.currentTarget : tabCanvasRef.value) || null;
  const dt = e.dataTransfer;
  if (!(currentTab && container && dt)) {
    return;
  }

  const rect = container.getBoundingClientRect();
  const mouseX = e.clientX;
  const mouseY = e.clientY;
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

  const droppedComponentName = (payload.cmptConfig as Record<string, unknown> | undefined)?.index as
    | Record<string, unknown>
    | undefined;
  const droppedIndexName =
    typeof droppedComponentName?.name === 'string' ? droppedComponentName.name : '';
  if (droppedIndexName === BASE_TAB_CONTAINER_INDEX_NAME) {
    ElMessage.warning('Tab 容器内禁止再次放置 Tab 容器');
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
    i: createTabContainerChildItemId(),
    component: {
      cmptConfig: deepClone((payload?.cmptConfig as Record<string, unknown> | undefined) || {})
    }
  };

  const nextItems = [...currentTabLayoutItems.value, newItem];
  pageLayoutStore.updateTabChildLayoutItems(props.item.i, currentTab.id, nextItems);
  pageLayoutStore.selectTabChildItem(props.item.i, currentTab.id, newItem.i);
}

function handleSelectChild(itemId: string) {
  const tab = getCurrentTab();
  if (!tab) {
    return;
  }
  pageLayoutStore.selectTabChildItem(props.item.i, tab.id, itemId);
}

function handleDeleteChild(item: PortalLayoutItem) {
  const tab = getCurrentTab();
  if (!tab) {
    return;
  }
  pageLayoutStore.removeTabChildLayoutItem(props.item.i, tab.id, item.i);
}

watch(
  () => [tabs.value, props.item?.component?.cmptConfig?.content?.activeTabId] as const,
  () => {
    const resolved = resolveTabContainerActiveTabId(
      tabs.value,
      props.item?.component?.cmptConfig?.content?.activeTabId || activeTabId.value
    );
    if (!resolved) {
      activeTabId.value = '';
      return;
    }
    const changed = activeTabId.value !== resolved;
    activeTabId.value = resolved;
    if (changed) {
      commitTabs(tabs.value, resolved);
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => pageLayoutStore.currentSelection,
  (selection) => {
    if (!selection || selection.type !== 'tab-child-item') {
      return;
    }
    if (selection.parentItemId !== props.item.i) {
      return;
    }
    if (selection.tabId !== activeTabId.value) {
      activeTabId.value = selection.tabId;
      commitTabs(tabs.value, selection.tabId);
    }
  },
  { deep: true }
);

onMounted(() => {
  updateViewportWidth();
  window.addEventListener('resize', updateViewportWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportWidth);
});
</script>

<template>
  <div class="tab-container-editor-root" @click.stop="selectParentTabContainer">
    <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
      <div class="tab-container-editor" :style="tabsVars">
        <el-tabs
          v-model="activeTabId"
          class="tab-container-editor__tabs"
          :stretch="Boolean(tabsStyleConfig.stretch)"
          @tab-change="handleTabChange"
        >
          <el-tab-pane v-for="tab in tabs" :key="tab.id" :label="tab.title" :name="tab.id">
            <div
              ref="tabCanvasRef"
              class="tab-container-editor__canvas"
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
                class="tab-container-editor__layout"
                @layout-updated="handleLayoutUpdated"
              >
                <div v-if="currentTabLayoutItems.length === 0" class="tab-container-editor__empty">
                  <el-empty description="拖拽物料到当前页签子画布" :image-size="64" />
                </div>

                <GridItem
                  v-for="child in currentTabLayoutItems"
                  :key="child.i"
                  :x="child.x"
                  :y="child.y"
                  :w="child.w"
                  :h="child.h"
                  :i="child.i"
                  class="tab-container-editor__item"
                  :class="{ 'is-active': selectedChildItemId === child.i }"
                  @click.stop="() => handleSelectChild(child.i)"
                >
                  <div class="tab-container-editor__item-inner">
                    <button
                      class="tab-container-editor__item-delete"
                      type="button"
                      @click.stop="() => handleDeleteChild(child)"
                    >
                      删除
                    </button>

                    <component
                      :is="getComponent(child)"
                      v-if="getComponentName(child) && !isNestedTabContainer(child)"
                      :id="child.i"
                      :schema="child.component?.cmptConfig || {}"
                      :materials-map="props.materialsMap"
                      :page-setting-data="props.pageSettingData"
                    />
                    <div
                      v-else-if="isNestedTabContainer(child)"
                      class="tab-container-editor__nested-blocked"
                    >
                      仅支持一层 Tab 嵌套，请删除该子 Tab 容器
                    </div>
                    <div v-else class="tab-container-editor__debug">
                      组件缺失：{{ getComponentName(child) || '未知组件' }}
                    </div>
                  </div>
                </GridItem>
              </GridLayout>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </UnifiedContainerDisplay>
  </div>
</template>

<style scoped>
.tab-container-editor-root {
  width: 100%;
  height: 100%;
}

.tab-container-editor {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.tab-container-editor__tabs {
  height: 100%;
}

.tab-container-editor__tabs :deep(.el-tabs__header) {
  margin-bottom: var(--tab-nav-mb);
}

.tab-container-editor__tabs :deep(.el-tabs__item) {
  color: var(--tab-text-color);
  font-size: var(--tab-font-size);
}

.tab-container-editor__tabs :deep(.el-tabs__item.is-active) {
  color: var(--tab-active-color);
}

.tab-container-editor__tabs :deep(.el-tabs__active-bar) {
  background: var(--tab-active-color);
}

.tab-container-editor__tabs :deep(.el-tabs__content),
.tab-container-editor__tabs :deep(.el-tab-pane) {
  height: 100%;
}

.tab-container-editor__canvas {
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

.tab-container-editor__canvas.is-drag-over {
  border-color: var(--el-color-primary);
}

.tab-container-editor__layout {
  min-height: 220px;
}

.tab-container-editor__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 220px;
}

.tab-container-editor__item {
  overflow: hidden;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgb(2 8 23 / 0.08);
}

.tab-container-editor__item.is-active {
  outline: 2px solid var(--el-color-primary);
}

.tab-container-editor__item-inner {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.tab-container-editor__item-delete {
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

.tab-container-editor__item-delete:hover {
  background: #ffffff;
}

.tab-container-editor__debug {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--el-color-danger);
  font-size: 12px;
}

.tab-container-editor__nested-blocked {
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
