<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="admin-simple-container" :style="bodyStyleObj" @click.stop="selectParentContainer">
      <div
        v-if="isEditorMode"
        ref="canvasRef"
        class="admin-simple-container__editor"
        :class="{ 'is-drag-over': isDragOver }"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
      >
        <GridLayout
          :layout="currentTab.layoutItems"
          :col-num
          :row-height
          :margin="[marginX, marginY]"
          :prevent-collision="false"
          class="admin-simple-container__layout"
          @layout-updated="handleLayoutUpdated"
        >
          <div v-if="currentTab.layoutItems.length === 0" class="admin-simple-container__empty">
            <el-empty description="拖拽物料到容器内部" :image-size="64" />
          </div>

          <GridItem
            v-for="child in currentTab.layoutItems"
            :key="child.i"
            :x="child.x"
            :y="child.y"
            :w="child.w"
            :h="child.h"
            :i="child.i"
            class="admin-simple-container__item"
            :class="{ 'is-active': selectedChildItemId === child.i }"
            @click.stop="() => handleSelectChild(child.i)"
          >
            <div class="admin-simple-container__item-inner">
              <button
                class="admin-simple-container__item-delete"
                type="button"
                @click.stop="() => handleDeleteChild(child.i)"
              >
                删除
              </button>

              <div
                v-if="isBlockedNestedContainer(child)"
                class="admin-simple-container__nested-blocked"
              >
                当前容器暂不支持再嵌套同类容器
              </div>
              <component
                :is="getComponent(child)"
                v-else-if="getComponentName(child)"
                :id="child.i"
                :schema="child.component?.cmptConfig || {}"
                :materials-map="resolvedMaterialsMap"
                :page-setting-data="resolvedPageSettingData"
              />
              <div v-else class="admin-simple-container__debug">
                组件缺失：{{ getComponentName(child) || '未知组件' }}
              </div>
            </div>
          </GridItem>
        </GridLayout>
      </div>

      <div v-else class="admin-simple-container__preview">
        <PortalGridRenderer
          v-if="currentTab.layoutItems.length > 0"
          :layout-items="currentTab.layoutItems"
          :materials-map="resolvedMaterialsMap"
          :page-setting-data="resolvedPageSettingData"
          :preview-mode="previewMode"
          :nest-level="currentNestLevel + 1"
        />
        <div v-else class="admin-simple-container__empty-text">当前容器暂无组件内容</div>
      </div>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import { computed, ref, type Component, type CSSProperties } from 'vue';
import { GridItem, GridLayout } from 'grid-layout-plus';
import {
  deepClone,
  getPortalGridSettings,
  hasLayoutGeometryChanged,
  mergeLayoutItems,
  normalizePortalPageSettingsV2,
  PortalGridRenderer,
  UnifiedContainerDisplay,
  usePortalPageLayoutStore,
  type LayoutUpdateItem,
  type PortalLayoutItem
} from '@one-base-template/portal-engine';

import {
  ADMIN_SIMPLE_CONTAINER_INDEX_NAME,
  ensureAdminSimpleContainerTabs,
  mergeAdminSimpleContainerBodyStyle,
  resolveAdminSimpleContainerActiveTabId,
  type AdminSimpleContainerSchema,
  type AdminSimpleContainerTab
} from './model';

const props = defineProps<{
  id?: string;
  schema: AdminSimpleContainerSchema;
  materialsMap?: Record<string, Component>;
  pageSettingData?: unknown;
  previewMode?: 'safe' | 'live';
  nestLevel?: number;
}>();

const pageLayoutStore = usePortalPageLayoutStore();
const canvasRef = ref<HTMLDivElement>();
const isDragOver = ref(false);

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

const tabs = computed(() => ensureAdminSimpleContainerTabs(props.schema?.content?.tabs));
const activeTabId = computed(() =>
  resolveAdminSimpleContainerActiveTabId(tabs.value, props.schema?.content?.activeTabId)
);
const currentTab = computed<AdminSimpleContainerTab>(
  () =>
    tabs.value.find((tab) => tab.id === activeTabId.value) || {
      id: activeTabId.value,
      title: '容器内容',
      layoutItems: []
    }
);

const pageSettings = computed(() => normalizePortalPageSettingsV2(props.pageSettingData));
const gridSettings = computed(() => getPortalGridSettings(pageSettings.value));
const colNum = computed(() => gridSettings.value.colNum);
const marginX = computed(() => gridSettings.value.colSpace);
const marginY = computed(() => gridSettings.value.rowSpace);
const rowHeight = computed(() => 1);

const selectedChildItemId = computed(() => {
  const selection = pageLayoutStore.currentSelection;
  if (!selection || selection.type !== 'tab-child-item') {
    return '';
  }
  if (selection.parentItemId !== props.id || selection.tabId !== currentTab.value.id) {
    return '';
  }
  return selection.itemId;
});

const isEditorMode = computed(() => !props.previewMode);

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

function getComponentName(item: PortalLayoutItem): string {
  return String(item.component?.cmptConfig?.index?.name || '').trim();
}

function getComponent(item: PortalLayoutItem) {
  const componentName = getComponentName(item);
  return componentName ? resolvedMaterialsMap.value[componentName] : null;
}

function isBlockedNestedContainer(item: PortalLayoutItem): boolean {
  const name = getComponentName(item);
  return name === ADMIN_SIMPLE_CONTAINER_INDEX_NAME || name === 'base-tab-container-index';
}

function selectParentContainer() {
  if (!(props.id && isEditorMode.value)) {
    return;
  }
  pageLayoutStore.selectTabContainer(props.id);
}

function handleSelectChild(itemId: string) {
  if (!props.id) {
    return;
  }
  pageLayoutStore.selectTabChildItem(props.id, currentTab.value.id, itemId);
}

function handleDeleteChild(itemId: string) {
  if (!props.id) {
    return;
  }
  pageLayoutStore.removeTabChildLayoutItem(props.id, currentTab.value.id, itemId);
}

function handleLayoutUpdated(nextLayout: LayoutUpdateItem[]) {
  if (!props.id) {
    return;
  }

  const prevLayout = currentTab.value.layoutItems;
  const merged = mergeLayoutItems(prevLayout, nextLayout);
  if (!hasLayoutGeometryChanged(prevLayout, merged)) {
    return;
  }

  pageLayoutStore.updateTabChildLayoutItems(props.id, currentTab.value.id, merged);
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

function createChildItemId(): string {
  return `admin-simple-container-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  isDragOver.value = false;

  if (!props.id) {
    return;
  }

  const container = canvasRef.value;
  const transferData = event.dataTransfer;
  if (!(container && transferData)) {
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

  const droppedIndexName = String(asRecord(asRecord(payload.cmptConfig).index).name || '').trim();
  if (
    droppedIndexName === ADMIN_SIMPLE_CONTAINER_INDEX_NAME ||
    droppedIndexName === 'base-tab-container-index'
  ) {
    return;
  }

  const relativeX = mouseX - rect.left;
  const relativeY = mouseY - rect.top;
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

  const defaultW = Math.min(Math.max(1, Number(payload.w) || 6), cols);
  const defaultH = Math.max(1, Math.round(Number(payload.h) || 6));

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
    i: createChildItemId(),
    component: {
      cmptConfig: deepClone((payload.cmptConfig as Record<string, unknown> | undefined) || {})
    }
  };

  const nextItems = [...currentTab.value.layoutItems, newItem];
  pageLayoutStore.updateTabChildLayoutItems(props.id, currentTab.value.id, nextItems);
  pageLayoutStore.selectTabChildItem(props.id, currentTab.value.id, newItem.i);
}

defineOptions({
  name: ADMIN_SIMPLE_CONTAINER_INDEX_NAME
});
</script>

<style scoped>
.admin-simple-container {
  width: 100%;
  min-height: 180px;
}

.admin-simple-container__editor {
  width: 100%;
  min-height: 180px;
  border: 1px dashed transparent;
  border-radius: 8px;
  transition: border-color 120ms ease;
}

.admin-simple-container__editor.is-drag-over {
  border-color: var(--el-color-primary);
}

.admin-simple-container__layout {
  position: relative;
  width: 100%;
  min-height: 140px;
}

.admin-simple-container__item {
  border-radius: 8px;
  background: transparent;
  box-shadow: 0 2px 8px rgb(2 8 23 / 0.06);
}

.admin-simple-container__item.is-active {
  outline: 2px solid var(--el-color-primary);
}

.admin-simple-container__item-inner {
  position: relative;
  overflow: auto;
  width: 100%;
  height: 100%;
}

.admin-simple-container__item-delete {
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

.admin-simple-container__item:hover .admin-simple-container__item-delete,
.admin-simple-container__item.is-active .admin-simple-container__item-delete {
  opacity: 1;
  transform: translateY(0);
}

.admin-simple-container__empty {
  display: flex;
  width: 100%;
  min-height: 120px;
  align-items: center;
  justify-content: center;
}

.admin-simple-container__preview {
  width: 100%;
}

.admin-simple-container__empty-text {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #64748b;
  font-size: 13px;
}

.admin-simple-container__nested-blocked,
.admin-simple-container__debug {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0 12px;
  text-align: center;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.admin-simple-container__nested-blocked {
  color: #b45309;
  background: rgb(245 158 11 / 0.12);
}
</style>
