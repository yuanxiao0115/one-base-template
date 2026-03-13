<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { Plus } from "@element-plus/icons-vue";

  import { calcPreviewScale } from "@one-base-template/portal-engine";

  const props = defineProps<{
    templateId: string;
    currentTabId: string;
    previewFrameSrc: string;
    viewportWidth: number;
    viewportHeight: number;
  }>();

  const emit = defineEmits<{
    (e: "create-root" | "frame-load"): void;
    (e: "scale-change", value: number): void;
    (e: "interaction-state-change", payload: { mode: "auto" | "manual"; scale: number }): void;
  }>();

  const MIN_MANUAL_SCALE_PERCENT = 50;
  const MAX_MANUAL_SCALE_PERCENT = 200;
  const MANUAL_SCALE_STEP_PERCENT = 10;
  const MANUAL_PAN_MIN_OFFSET = 80;

  const previewHostRef = ref<HTMLElement | null>(null);
  const previewIframeRef = ref<HTMLIFrameElement | null>(null);
  const hostInnerSize = ref({ width: 0, height: 0 });
  const autoPreviewScale = ref(1);
  const manualPreviewScale = ref(1);
  const manualMode = ref(false);
  const panOffset = ref({ x: 0, y: 0 });
  const isPanning = ref(false);

  let panPointerId: number | null = null;
  let panStartClientX = 0;
  let panStartClientY = 0;
  let panStartOffsetX = 0;
  let panStartOffsetY = 0;

  let previewHostResizeObserver: ResizeObserver | null = null;
  let previewRecalcRaf = 0;

  const activePreviewScale = computed(() => (manualMode.value ? manualPreviewScale.value : autoPreviewScale.value));
  const previewScalePercent = computed(() => Math.round(activePreviewScale.value * 100));
  const previewWidth = computed(() => Math.max(1, Math.floor(props.viewportWidth * activePreviewScale.value)));
  const previewHeight = computed(() => Math.max(1, Math.floor(props.viewportHeight * activePreviewScale.value)));

  const previewStageStyle = computed(() => ({
    width: `${previewWidth.value}px`,
    height: `${previewHeight.value}px`,
  }));
  const previewStagePositionStyle = computed(() => {
    const position = getStagePosition();
    return {
      transform: `translate3d(${Math.round(position.x)}px, ${Math.round(position.y)}px, 0)`,
    };
  });
  const previewDeviceStyle = computed(() => ({
    width: `${props.viewportWidth}px`,
    height: `${props.viewportHeight}px`,
    transform: `scale(${activePreviewScale.value})`,
  }));

  function clampNumber(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }

  function getInteractionMode(): "auto" | "manual" {
    return manualMode.value ? "manual" : "auto";
  }

  function emitInteractionState(scale = activePreviewScale.value) {
    emit("interaction-state-change", {
      mode: getInteractionMode(),
      scale,
    });
  }

  function getHostInnerSize(host: HTMLElement) {
    const style = window.getComputedStyle(host);
    const paddingX = Number.parseFloat(style.paddingLeft || "0") + Number.parseFloat(style.paddingRight || "0");
    const paddingY = Number.parseFloat(style.paddingTop || "0") + Number.parseFloat(style.paddingBottom || "0");
    return {
      width: Math.max(0, host.clientWidth - paddingX),
      height: Math.max(0, host.clientHeight - paddingY),
    };
  }

  function getManualPanRange(hostSize: number, stageSize: number) {
    if (stageSize > hostSize) {
      return 0;
    }
    return Math.max((hostSize - stageSize) / 2, MANUAL_PAN_MIN_OFFSET);
  }

  function getPanBounds() {
    const hostWidth = hostInnerSize.value.width;
    const hostHeight = hostInnerSize.value.height;
    const stageWidth = previewWidth.value;
    const stageHeight = previewHeight.value;
    const centeredX = (hostWidth - stageWidth) / 2;

    if (!manualMode.value) {
      return {
        centeredX,
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
      };
    }

    const minX =
      stageWidth <= hostWidth
        ? -getManualPanRange(hostWidth, stageWidth)
        : hostWidth - stageWidth;
    const maxX =
      stageWidth <= hostWidth
        ? getManualPanRange(hostWidth, stageWidth)
        : 0;
    const minY =
      stageHeight <= hostHeight
        ? -getManualPanRange(hostHeight, stageHeight)
        : hostHeight - stageHeight;
    const maxY =
      stageHeight <= hostHeight
        ? getManualPanRange(hostHeight, stageHeight)
        : 0;

    return {
      centeredX,
      minX,
      maxX,
      minY,
      maxY,
    };
  }

  function clampPanOffset(offset = panOffset.value) {
    const bounds = getPanBounds();
    return {
      x: clampNumber(offset.x, bounds.minX, bounds.maxX),
      y: clampNumber(offset.y, bounds.minY, bounds.maxY),
    };
  }

  function getStagePosition(offset = panOffset.value) {
    const bounds = getPanBounds();
    const clampedOffset = clampPanOffset(offset);
    const x = bounds.centeredX + clampedOffset.x;
    const y = clampedOffset.y;
    return { x, y };
  }

  function syncPanOffsetWithinBounds() {
    if (!manualMode.value) {
      if (panOffset.value.x !== 0 || panOffset.value.y !== 0) {
        panOffset.value = { x: 0, y: 0 };
      }
      return;
    }
    panOffset.value = clampPanOffset();
  }

  function recalcPreviewScale() {
    const host = previewHostRef.value;
    if (!host) {
      hostInnerSize.value = { width: 0, height: 0 };
      autoPreviewScale.value = 1;
      if (!manualMode.value) {
        emit("scale-change", 1);
        emitInteractionState(1);
      }
      return;
    }
    const innerSize = getHostInnerSize(host);
    hostInnerSize.value = innerSize;
    const nextScale = calcPreviewScale(innerSize.width, innerSize.height, props.viewportWidth, props.viewportHeight);
    autoPreviewScale.value = nextScale;
    if (!manualMode.value) {
      emit("scale-change", nextScale);
      emitInteractionState(nextScale);
    }
    syncPanOffsetWithinBounds();
  }

  function schedulePreviewScaleRecalc() {
    if (previewRecalcRaf) {
      cancelAnimationFrame(previewRecalcRaf);
    }
    previewRecalcRaf = requestAnimationFrame(() => {
      previewRecalcRaf = 0;
      recalcPreviewScale();
    });
  }

  function cancelPreviewScaleTask() {
    if (!previewRecalcRaf) {
      return;
    }
    cancelAnimationFrame(previewRecalcRaf);
    previewRecalcRaf = 0;
  }

  function clearPreviewHostObserver() {
    if (previewHostResizeObserver) {
      previewHostResizeObserver.disconnect();
      previewHostResizeObserver = null;
    }
  }

  function bindPreviewHostObserver(host: HTMLElement | null) {
    clearPreviewHostObserver();
    if (!host || typeof ResizeObserver === "undefined") {
      return;
    }
    previewHostResizeObserver = new ResizeObserver(() => {
      schedulePreviewScaleRecalc();
    });
    previewHostResizeObserver.observe(host);
  }

  function onPreviewFrameLoad() {
    schedulePreviewScaleRecalc();
    emit("frame-load");
  }

  function setInteractionMode(mode: "auto" | "manual") {
    if (mode === "manual") {
      if (!manualMode.value) {
        manualPreviewScale.value = activePreviewScale.value;
        manualMode.value = true;
        syncPanOffsetWithinBounds();
      }
      emit("scale-change", manualPreviewScale.value);
      emitInteractionState(manualPreviewScale.value);
      return;
    }

    if (manualMode.value || panOffset.value.x !== 0 || panOffset.value.y !== 0) {
      manualMode.value = false;
      manualPreviewScale.value = autoPreviewScale.value;
      panOffset.value = { x: 0, y: 0 };
      stopPan();
    }
    emit("scale-change", autoPreviewScale.value);
    emitInteractionState(autoPreviewScale.value);
  }

  function updateManualScale(scalePercent: number) {
    const nextScale = clampNumber(scalePercent, MIN_MANUAL_SCALE_PERCENT, MAX_MANUAL_SCALE_PERCENT) / 100;
    if (!manualMode.value) {
      setInteractionMode("manual");
    }
    manualPreviewScale.value = nextScale;
    syncPanOffsetWithinBounds();
    emit("scale-change", nextScale);
    emitInteractionState(nextScale);
  }

  function zoomIn() {
    updateManualScale(previewScalePercent.value + MANUAL_SCALE_STEP_PERCENT);
  }

  function zoomOut() {
    updateManualScale(previewScalePercent.value - MANUAL_SCALE_STEP_PERCENT);
  }

  function stopPan() {
    isPanning.value = false;
    panPointerId = null;
  }

  function onPanPointerDown(event: PointerEvent) {
    if (!manualMode.value || event.button !== 0) {
      return;
    }
    event.preventDefault();
    const target = event.currentTarget as HTMLElement | null;
    target?.setPointerCapture?.(event.pointerId);
    panPointerId = event.pointerId;
    panStartClientX = event.clientX;
    panStartClientY = event.clientY;
    panStartOffsetX = panOffset.value.x;
    panStartOffsetY = panOffset.value.y;
    isPanning.value = true;
  }

  function onPanPointerMove(event: PointerEvent) {
    if (!isPanning.value || panPointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    const nextOffset = {
      x: panStartOffsetX + (event.clientX - panStartClientX),
      y: panStartOffsetY + (event.clientY - panStartClientY),
    };
    panOffset.value = clampPanOffset(nextOffset);
  }

  function onPanPointerEnd(event: PointerEvent) {
    if (!isPanning.value || panPointerId !== event.pointerId) {
      return;
    }
    const target = event.currentTarget as HTMLElement | null;
    if (target?.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    stopPan();
  }

  function isScrollableElement(target: Element | null, view: Window): target is HTMLElement {
    if (!target) {
      return false;
    }
    const candidate = target as HTMLElement;
    if (typeof candidate.scrollHeight !== "number" || typeof candidate.clientHeight !== "number") {
      return false;
    }
    const style = view.getComputedStyle(candidate);
    const overflowY = style.overflowY;
    const canScrollY = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
    if (!canScrollY) {
      return false;
    }
    return candidate.scrollHeight > candidate.clientHeight;
  }

  function resolveFrameScrollContainer(): HTMLElement | null {
    const frameWindow = previewIframeRef.value?.contentWindow;
    if (!frameWindow) {
      return null;
    }
    try {
      const frameDocument = frameWindow.document;
      const contentScroll = frameDocument.querySelector(".preview-layout__content-scroll");
      if (isScrollableElement(contentScroll, frameWindow)) {
        return contentScroll;
      }
      const shell = frameDocument.querySelector(".preview-shell");
      if (isScrollableElement(shell, frameWindow)) {
        return shell;
      }
      const scrollingElement = frameDocument.scrollingElement;
      if (!scrollingElement) {
        return null;
      }
      const candidate = scrollingElement as HTMLElement;
      return typeof candidate.scrollBy === "function" ? candidate : null;
    } catch {
      return null;
    }
  }

  function onPanWheel(event: WheelEvent) {
    if (!manualMode.value) {
      return;
    }
    const scrollContainer = resolveFrameScrollContainer();
    if (!scrollContainer) {
      return;
    }
    event.preventDefault();
    scrollContainer.scrollBy({
      top: event.deltaY,
      left: event.deltaX,
      behavior: "auto",
    });
  }

  function resetView() {
    setInteractionMode("auto");
    schedulePreviewScaleRecalc();
  }

  function postMessageToFrame(message: unknown) {
    if (!message) {
      return false;
    }
    const targetWindow = previewIframeRef.value?.contentWindow;
    if (!targetWindow) {
      return false;
    }
    targetWindow.postMessage(message, window.location.origin);
    return true;
  }

  watch(
    () => [props.viewportWidth, props.viewportHeight, props.currentTabId],
    async () => {
      await nextTick();
      schedulePreviewScaleRecalc();
    }
  );

  watch(
    previewHostRef,
    async (host) => {
      bindPreviewHostObserver(host);
      await nextTick();
      schedulePreviewScaleRecalc();
    },
    { immediate: true }
  );

  watch(
    [activePreviewScale, () => hostInnerSize.value.width, () => hostInnerSize.value.height],
    () => {
      syncPanOffsetWithinBounds();
    }
  );

  onMounted(() => {
    window.addEventListener("resize", schedulePreviewScaleRecalc);
    window.visualViewport?.addEventListener("resize", schedulePreviewScaleRecalc);
    schedulePreviewScaleRecalc();
  });

  onBeforeUnmount(() => {
    clearPreviewHostObserver();
    window.removeEventListener("resize", schedulePreviewScaleRecalc);
    window.visualViewport?.removeEventListener("resize", schedulePreviewScaleRecalc);
    cancelPreviewScaleTask();
    stopPan();
  });

  defineExpose({
    postMessageToFrame,
    setInteractionMode,
    zoomIn,
    zoomOut,
    resetView,
  });
</script>

<template>
  <div class="preview-host">
    <div v-if="!props.templateId" class="empty">
      <el-result icon="warning" title="缺少参数" sub-title="请通过 /portal/design?id=xxx 进入工作台" />
    </div>
    <div v-else-if="!props.currentTabId" class="empty">
      <el-result icon="info" title="请先选择页面" sub-title="从左侧选择一个页面，或先新建空白页">
        <template #extra>
          <el-button type="primary" size="small" :icon="Plus" @click="emit('create-root')">新建页面</el-button>
        </template>
      </el-result>
    </div>
    <div v-else ref="previewHostRef" class="preview-host-frame">
      <div class="preview-stage" :style="[previewStageStyle, previewStagePositionStyle]">
        <div class="preview-device" :style="previewDeviceStyle">
          <iframe
            ref="previewIframeRef"
            :key="props.previewFrameSrc"
            class="preview-iframe"
            :src="props.previewFrameSrc"
            title="门户页面预览"
            loading="lazy"
            @load="onPreviewFrameLoad"
          />
        </div>
      </div>
      <div
        v-if="manualMode"
        class="preview-pan-layer"
        :class="{ 'is-dragging': isPanning }"
        @pointerdown="onPanPointerDown"
        @pointermove="onPanPointerMove"
        @pointerup="onPanPointerEnd"
        @pointercancel="onPanPointerEnd"
        @wheel.prevent="onPanWheel"
      >
        <span class="preview-pan-tip">按住拖拽平移</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .preview-host {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: 10px 12px 12px;
    overflow: hidden;
    background: #fff;
  }

  .preview-host-frame {
    flex: 1;
    position: relative;
    min-height: 0;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    background-color: #f8fafc;
    background-image:
      linear-gradient(to right, rgb(148 163 184 / 0.2) 1px, transparent 1px),
      linear-gradient(to bottom, rgb(148 163 184 / 0.2) 1px, transparent 1px);
    background-size: 24px 24px;
    padding: 10px;
    box-sizing: border-box;
  }

  .preview-stage {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    will-change: transform;
  }

  .preview-device {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: top left;
    border: 1px solid #c9d3e0;
    background: #fff;
    box-sizing: border-box;
    overflow: hidden;
    box-shadow: 0 10px 30px rgb(15 23 42 / 0.12);
  }

  .preview-iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: #fff;
  }

  .preview-pan-layer {
    position: absolute;
    inset: 0;
    z-index: 20;
    cursor: grab;
    touch-action: none;
    background: transparent;
  }

  .preview-pan-layer.is-dragging {
    cursor: grabbing;
  }

  .preview-pan-tip {
    position: absolute;
    left: 12px;
    bottom: 12px;
    font-size: 12px;
    line-height: 1;
    color: #475569;
    background: rgb(248 250 252 / 0.9);
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    pointer-events: none;
    user-select: none;
  }

  .empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }

  .preview-host :deep(.el-button) {
    border-radius: 0;
  }

  @media (max-width: 640px) {
    .preview-host {
      padding-left: 10px;
      padding-right: 10px;
    }

    .preview-pan-tip {
      left: 8px;
      bottom: 8px;
      font-size: 11px;
      padding: 4px 6px;
    }
  }
</style>
