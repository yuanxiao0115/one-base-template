<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { message } from '@one-base-template/ui';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    sourceFile?: File | null;
  }>(),
  {
    sourceFile: null
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'confirm', file: File): void;
}>();

const PREVIEW_SIZE = 320;
const OUTPUT_SIZE = 512;

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const imageSrc = ref('');
const objectUrl = ref('');
const sourceImage = ref<HTMLImageElement | null>(null);
const naturalWidth = ref(0);
const naturalHeight = ref(0);
const loading = ref(false);
const exporting = ref(false);

const zoomRatio = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);

const dragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragOriginX = ref(0);
const dragOriginY = ref(0);

const baseScale = computed(() => {
  if (!(naturalWidth.value > 0 && naturalHeight.value > 0)) {
    return 1;
  }
  return Math.max(PREVIEW_SIZE / naturalWidth.value, PREVIEW_SIZE / naturalHeight.value);
});

const displayScale = computed(() => baseScale.value * zoomRatio.value);
const displayWidth = computed(() => naturalWidth.value * displayScale.value);
const displayHeight = computed(() => naturalHeight.value * displayScale.value);

const offsetLimitX = computed(() => Math.max(0, (displayWidth.value - PREVIEW_SIZE) / 2));
const offsetLimitY = computed(() => Math.max(0, (displayHeight.value - PREVIEW_SIZE) / 2));

const imageStyle = computed(() => ({
  width: `${displayWidth.value}px`,
  height: `${displayHeight.value}px`,
  transform: `translate(${offsetX.value}px, ${offsetY.value}px)`
}));

function resetState() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = '';
  }
  imageSrc.value = '';
  sourceImage.value = null;
  naturalWidth.value = 0;
  naturalHeight.value = 0;
  zoomRatio.value = 1;
  offsetX.value = 0;
  offsetY.value = 0;
}

function clampOffset() {
  if (!offsetLimitX.value) {
    offsetX.value = 0;
  } else {
    offsetX.value = Math.min(offsetLimitX.value, Math.max(-offsetLimitX.value, offsetX.value));
  }

  if (!offsetLimitY.value) {
    offsetY.value = 0;
  } else {
    offsetY.value = Math.min(offsetLimitY.value, Math.max(-offsetLimitY.value, offsetY.value));
  }
}

async function loadImage(file: File) {
  loading.value = true;
  const nextUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = nextUrl;
    });

    sourceImage.value = image;
    objectUrl.value = nextUrl;
    imageSrc.value = nextUrl;
    naturalWidth.value = image.naturalWidth;
    naturalHeight.value = image.naturalHeight;
    zoomRatio.value = 1;
    offsetX.value = 0;
    offsetY.value = 0;
  } catch (error) {
    URL.revokeObjectURL(nextUrl);
    throw error;
  } finally {
    loading.value = false;
  }
}

watch(
  () => visible.value,
  async (nextVisible) => {
    if (!nextVisible) {
      stopDragging();
      resetState();
      return;
    }

    if (!props.sourceFile) {
      message.error('未找到待裁剪图片');
      visible.value = false;
      return;
    }

    try {
      await loadImage(props.sourceFile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '图片加载失败';
      message.error(errorMessage);
      visible.value = false;
    }
  }
);

watch([zoomRatio, naturalWidth, naturalHeight], () => {
  clampOffset();
});

function stopDragging() {
  dragging.value = false;
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
}

function onPointerDown(event: PointerEvent) {
  if (!sourceImage.value || loading.value || exporting.value) {
    return;
  }

  dragging.value = true;
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
  dragOriginX.value = offsetX.value;
  dragOriginY.value = offsetY.value;

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) {
    return;
  }

  offsetX.value = dragOriginX.value + (event.clientX - dragStartX.value);
  offsetY.value = dragOriginY.value + (event.clientY - dragStartY.value);
  clampOffset();
}

function onPointerUp() {
  stopDragging();
}

onBeforeUnmount(() => {
  stopDragging();
});

async function exportCroppedFile() {
  if (!sourceImage.value) {
    throw new Error('图片未准备完成');
  }

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('浏览器不支持图片裁剪');
  }

  const drawScale = OUTPUT_SIZE / PREVIEW_SIZE;
  const drawWidth = displayWidth.value * drawScale;
  const drawHeight = displayHeight.value * drawScale;
  const drawX = ((PREVIEW_SIZE - displayWidth.value) / 2 + offsetX.value) * drawScale;
  const drawY = ((PREVIEW_SIZE - displayHeight.value) / 2 + offsetY.value) * drawScale;

  ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  ctx.drawImage(sourceImage.value, drawX, drawY, drawWidth, drawHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/jpeg', 0.92);
  });
  if (!blob) {
    throw new Error('图片裁剪失败');
  }

  return new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
}

async function onConfirm() {
  if (exporting.value) {
    return;
  }

  exporting.value = true;
  try {
    const file = await exportCroppedFile();
    emit('confirm', file);
    visible.value = false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '图片裁剪失败';
    message.error(errorMessage);
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="头像裁剪"
    width="620"
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
  >
    <div class="avatar-crop-dialog">
      <div class="avatar-crop-dialog__stage">
        <div class="avatar-crop-dialog__canvas" @pointerdown="onPointerDown">
          <img
            v-if="imageSrc"
            class="avatar-crop-dialog__image"
            :src="imageSrc"
            alt="头像裁剪预览"
            :style="imageStyle"
            draggable="false"
          />
          <div v-else class="avatar-crop-dialog__placeholder">加载中...</div>
        </div>
      </div>

      <div class="avatar-crop-dialog__toolbar">
        <span class="avatar-crop-dialog__label">缩放</span>
        <el-slider
          v-model="zoomRatio"
          :min="1"
          :max="3"
          :step="0.01"
          :disabled="loading || exporting"
        />
      </div>

      <p class="avatar-crop-dialog__tip">拖动图片调整裁剪区域，支持缩放后精细定位。</p>
    </div>

    <template #footer>
      <div class="avatar-crop-dialog__footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="exporting"
          :disabled="loading || !sourceImage"
          @click="onConfirm"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.avatar-crop-dialog {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.avatar-crop-dialog__stage {
  display: flex;
  justify-content: center;
}

.avatar-crop-dialog__canvas {
  width: 320px;
  height: 320px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
  background: #f3f5f8;
  position: relative;
  touch-action: none;
  cursor: move;
  user-select: none;
}

.avatar-crop-dialog__image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center;
}

.avatar-crop-dialog__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
}

.avatar-crop-dialog__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-crop-dialog__label {
  width: 36px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.avatar-crop-dialog__tip {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.avatar-crop-dialog__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
