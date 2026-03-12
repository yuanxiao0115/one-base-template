<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import {
    Delete as DeleteIcon,
    EditPen,
    Hide,
    Lock,
    Operation,
    RefreshRight,
    Setting,
    View,
    ZoomIn,
    ZoomOut,
  } from "@element-plus/icons-vue";

  import {
    PREVIEW_MODE_SAFE,
    PREVIEW_VIEWPORT_DEFAULT,
    type PortalPreviewMode,
    type PortalPreviewViewport,
  } from "../../../utils/preview";
  import type { PortalTab } from "../../../types";

  interface PreviewViewportOption extends PortalPreviewViewport {
    key: string;
    label: string;
  }

  interface PreviewChangePayload {
    mode: PortalPreviewMode;
    viewportKey: string;
    viewport: PortalPreviewViewport;
  }

  type PortalInteractionMode = "auto" | "manual";

  interface InteractionChangePayload {
    mode: PortalInteractionMode;
  }

  const previewViewportOptions: PreviewViewportOption[] = [
    { key: "1920x1080", label: "1920 × 1080", width: 1920, height: 1080 },
    { key: "1440x900", label: "1440 × 900", width: 1440, height: 900 },
    { key: "1280x720", label: "1280 × 720", width: 1280, height: 720 },
  ];

  const props = withDefaults(
    defineProps<{
      currentTab: PortalTab | null;
      previewScale: number;
      interactionMode?: PortalInteractionMode;
    }>(),
    {
      interactionMode: "auto",
    }
  );

  const emit = defineEmits<{
    (e: "preview-change", payload: PreviewChangePayload): void;
    (e: "interaction-change", payload: InteractionChangePayload): void;
    (
      e:
        | "edit"
        | "page-settings"
        | "page-shell"
        | "permission"
        | "toggle-hide"
        | "preview"
        | "delete"
        | "zoom-in"
        | "zoom-out"
        | "reset-view"
    ): void;
  }>();

  const previewModeModel = ref<PortalPreviewMode>(PREVIEW_MODE_SAFE);
  const previewViewportKeyModel = ref(`${PREVIEW_VIEWPORT_DEFAULT.width}x${PREVIEW_VIEWPORT_DEFAULT.height}`);

  const activeTabName = computed(() => props.currentTab?.tabName || "未选择页面");
  const canOperateCurrent = computed(() => Boolean(props.currentTab));
  const isCurrentHidden = computed(() => props.currentTab?.isHide === 1);
  const previewScalePercent = computed(() => `${Math.round(props.previewScale * 100)}%`);

  function resolveViewportByKey(key: string): PortalPreviewViewport {
    const found = previewViewportOptions.find((item) => item.key === key);
    if (found) {
      return {
        width: found.width,
        height: found.height,
      };
    }
    return {
      width: 1920,
      height: 1080,
    };
  }

  function isInteractionModeActive(mode: PortalInteractionMode): boolean {
    return props.interactionMode === mode;
  }

  function handleInteractionChange(mode: PortalInteractionMode): void {
    if (props.interactionMode === mode) {
      return;
    }
    emit("interaction-change", { mode });
  }

  watch(
    () => [previewModeModel.value, previewViewportKeyModel.value] as const,
    ([mode, viewportKey]) => {
      emit("preview-change", {
        mode,
        viewportKey,
        viewport: resolveViewportByKey(viewportKey),
      });
    },
    { immediate: true }
  );
</script>

<template>
  <div class="action-strip">
    <div class="active-brief" :title="activeTabName">
      {{ activeTabName }}
    </div>
    <div class="action-strip-right">
      <div class="preview-inline-controls">
        <el-select v-model="previewModeModel" size="small" class="preview-mode-select">
          <el-option label="安全预览（骨架）" value="safe" />
          <el-option label="真数据预览（骨架）" value="live" />
        </el-select>
        <el-select v-model="previewViewportKeyModel" size="small" class="preview-viewport-select">
          <el-option
            v-for="option in previewViewportOptions"
            :key="option.key"
            :label="option.label"
            :value="option.key"
          />
        </el-select>
        <div class="stage-inline-controls">
          <div class="interaction-mode-group">
            <el-button
              class="interaction-mode-button"
              :class="{ 'interaction-mode-button--active': isInteractionModeActive('auto') }"
              text
              size="small"
              :disabled="!canOperateCurrent"
              aria-label="自动模式"
              @click="handleInteractionChange('auto')"
            >
              自动
            </el-button>
            <el-button
              class="interaction-mode-button"
              :class="{ 'interaction-mode-button--active': isInteractionModeActive('manual') }"
              text
              size="small"
              :disabled="!canOperateCurrent"
              aria-label="手动模式"
              @click="handleInteractionChange('manual')"
            >
              手动
            </el-button>
          </div>
          <el-tooltip content="缩小" placement="top">
            <el-button
              class="action-icon"
              text
              size="small"
              :icon="ZoomOut"
              :disabled="!canOperateCurrent"
              aria-label="缩小"
              @click="emit('zoom-out')"
            />
          </el-tooltip>
          <span class="preview-scale">{{ previewScalePercent }}</span>
          <el-tooltip content="放大" placement="top">
            <el-button
              class="action-icon"
              text
              size="small"
              :icon="ZoomIn"
              :disabled="!canOperateCurrent"
              aria-label="放大"
              @click="emit('zoom-in')"
            />
          </el-tooltip>
          <el-tooltip content="重置视图" placement="top">
            <el-button
              class="action-icon"
              text
              size="small"
              :icon="RefreshRight"
              :disabled="!canOperateCurrent"
              aria-label="重置视图"
              @click="emit('reset-view')"
            />
          </el-tooltip>
        </div>
      </div>
      <div class="action-group">
        <el-tooltip content="进入编辑" placement="top">
          <el-button
            class="action-icon action-icon--primary"
            text
            size="small"
            :icon="EditPen"
            :disabled="!canOperateCurrent"
            aria-label="进入编辑"
            @click="emit('edit')"
          />
        </el-tooltip>
        <el-tooltip content="页面设置" placement="top">
          <el-button
            class="action-icon"
            text
            size="small"
            :icon="Setting"
            aria-label="页面设置"
            :disabled="!canOperateCurrent"
            @click="emit('page-settings')"
          />
        </el-tooltip>
        <el-tooltip content="页面壳层覆盖" placement="top">
          <el-button
            class="action-icon"
            text
            size="small"
            :icon="Operation"
            aria-label="页面壳层覆盖"
            :disabled="!canOperateCurrent"
            @click="emit('page-shell')"
          />
        </el-tooltip>
        <el-tooltip content="页面权限" placement="top">
          <el-button
            class="action-icon"
            text
            size="small"
            :icon="Lock"
            aria-label="页面权限"
            :disabled="!canOperateCurrent"
            @click="emit('permission')"
          />
        </el-tooltip>
        <el-tooltip :content="isCurrentHidden ? '显示页面' : '隐藏页面'" placement="top">
          <el-button
            class="action-icon"
            text
            size="small"
            :icon="Hide"
            :disabled="!canOperateCurrent"
            aria-label="隐藏页面"
            @click="emit('toggle-hide')"
          />
        </el-tooltip>
        <el-tooltip content="预览" placement="top">
          <el-button
            class="action-icon"
            text
            size="small"
            :icon="View"
            :disabled="!canOperateCurrent"
            aria-label="预览"
            @click="emit('preview')"
          />
        </el-tooltip>
        <el-tooltip content="删除页面" placement="top">
          <el-button
            class="action-icon action-icon--danger"
            text
            size="small"
            :icon="DeleteIcon"
            :disabled="!canOperateCurrent"
            aria-label="删除页面"
            @click="emit('delete')"
          />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .action-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 36px;
    padding: 4px 12px;
    border-bottom: 1px solid #edf1f6;
    background: #f6f9fc;
  }

  .active-brief {
    min-width: 0;
    font-size: 12px;
    color: #4b5563;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .action-strip-right {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .preview-inline-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .stage-inline-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .interaction-mode-group {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-right: 2px;
  }

  .interaction-mode-button {
    min-width: 34px;
    height: 24px;
    padding: 0 6px;
    color: #4b5563;
    border-radius: 0;
  }

  .interaction-mode-button:hover {
    color: #111827;
    background: #ebf0f6;
  }

  .interaction-mode-button--active {
    color: #0f62cf;
    background: #e9f2ff;
  }

  .preview-mode-select {
    width: 180px;
    flex: none;
  }

  .preview-viewport-select {
    width: 140px;
    flex: none;
  }

  .preview-scale {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    height: 24px;
    padding: 0 4px;
    color: #334155;
    font-size: 12px;
  }

  .action-group {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: none;
  }

  .action-icon {
    width: 26px;
    height: 26px;
    padding: 0;
    color: #4b5563;
    border-radius: 0;
  }

  .action-icon:hover {
    color: #111827;
    background: #ebf0f6;
  }

  .action-icon--danger {
    color: #b42318;
  }

  .action-icon--primary {
    color: #0f62cf;
    background: #e9f2ff;
  }

  @media (max-width: 1120px) {
    .action-strip {
      align-items: flex-start;
      flex-direction: column;
    }

    .action-strip-right {
      width: 100%;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }

    .preview-inline-controls {
      flex-wrap: wrap;
    }

    .action-group {
      width: 100%;
      justify-content: flex-start;
    }
  }

  @media (max-width: 640px) {
    .action-strip {
      padding-left: 10px;
      padding-right: 10px;
    }
  }
</style>
