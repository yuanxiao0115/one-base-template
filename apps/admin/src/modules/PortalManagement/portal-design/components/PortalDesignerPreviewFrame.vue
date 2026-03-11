<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { Plus } from "@element-plus/icons-vue";

  import { calcPreviewScale } from "../../utils/preview";

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
  }>();

  const previewHostRef = ref<HTMLElement | null>(null);
  const previewIframeRef = ref<HTMLIFrameElement | null>(null);
  const previewScale = ref(1);
  let previewHostResizeObserver: ResizeObserver | null = null;
  let previewRecalcRaf = 0;

  const previewStageStyle = computed(() => ({
    width: `${Math.round(props.viewportWidth * previewScale.value)}px`,
    height: `${Math.round(props.viewportHeight * previewScale.value)}px`,
  }));
  const previewDeviceStyle = computed(() => ({
    width: `${props.viewportWidth}px`,
    height: `${props.viewportHeight}px`,
    transform: `scale(${previewScale.value})`,
  }));

  function recalcPreviewScale() {
    const host = previewHostRef.value;
    if (!host) {
      previewScale.value = 1;
      emit("scale-change", 1);
      return;
    }
    const nextScale = calcPreviewScale(host.clientWidth, host.clientHeight, props.viewportWidth, props.viewportHeight);
    previewScale.value = nextScale;
    emit("scale-change", nextScale);
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
  });

  defineExpose({
    postMessageToFrame,
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
      <div class="preview-stage" :style="previewStageStyle">
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
    min-height: 0;
    overflow: auto;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    border: 1px solid #e2e8f0;
    background: #f4f7fb;
    padding: 10px;
    box-sizing: border-box;
  }

  .preview-stage {
    position: relative;
    flex: none;
  }

  .preview-device {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: top left;
    border: 1px solid #d8e0ea;
    background: #fff;
    box-sizing: border-box;
    overflow: hidden;
  }

  .preview-iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: #fff;
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
  }
</style>
