<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import Cropper from 'cropperjs';
import { message } from '@one-base-template/ui';
import 'cropperjs/dist/cropper.css';

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

const OUTPUT_SIZE = 512;

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const imageRef = ref<HTMLImageElement | null>(null);
const imageSrc = ref('');
const objectUrl = ref('');
const loading = ref(false);
const exporting = ref(false);
const cropperInstance = ref<Cropper | null>(null);

function destroyCropper() {
  if (cropperInstance.value) {
    cropperInstance.value.destroy();
    cropperInstance.value = null;
  }
}

function revokeObjectUrl() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = '';
  }
}

function resetState() {
  destroyCropper();
  revokeObjectUrl();
  imageSrc.value = '';
  loading.value = false;
  exporting.value = false;
}

async function loadImage(file: File) {
  loading.value = true;
  destroyCropper();
  revokeObjectUrl();

  const nextUrl = URL.createObjectURL(file);
  objectUrl.value = nextUrl;
  imageSrc.value = nextUrl;
  await nextTick();
}

function initCropper() {
  const imageElement = imageRef.value;
  if (!imageElement) {
    return;
  }

  destroyCropper();
  cropperInstance.value = new Cropper(imageElement, {
    aspectRatio: 1,
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 1,
    background: false,
    movable: true,
    zoomable: true,
    zoomOnWheel: true,
    cropBoxMovable: false,
    cropBoxResizable: false,
    toggleDragModeOnDblclick: false,
    responsive: true,
    checkOrientation: false
  });
  loading.value = false;
}

function onImageLoaded() {
  if (!visible.value) {
    return;
  }
  initCropper();
}

function onImageError() {
  loading.value = false;
  message.error('图片加载失败');
  visible.value = false;
}

watch(
  () => visible.value,
  async (nextVisible) => {
    if (!nextVisible) {
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

watch(
  () => props.sourceFile,
  async (nextFile) => {
    if (!visible.value || !nextFile) {
      return;
    }

    try {
      await loadImage(nextFile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '图片加载失败';
      message.error(errorMessage);
      visible.value = false;
    }
  }
);

onBeforeUnmount(() => {
  resetState();
});

async function exportCroppedFile() {
  if (!cropperInstance.value) {
    throw new Error('图片未准备完成');
  }

  const canvas = cropperInstance.value.getCroppedCanvas({
    width: OUTPUT_SIZE,
    height: OUTPUT_SIZE,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  });
  if (!canvas) {
    throw new Error('图片裁剪失败');
  }

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
        <div class="avatar-crop-dialog__canvas">
          <img
            v-if="imageSrc"
            ref="imageRef"
            class="avatar-crop-dialog__image"
            :src="imageSrc"
            alt="头像裁剪预览"
            draggable="false"
            @load="onImageLoaded"
            @error="onImageError"
          />
          <div v-if="loading" class="avatar-crop-dialog__placeholder">加载中...</div>
        </div>
      </div>

      <p class="avatar-crop-dialog__tip">使用鼠标拖动和滚轮缩放调整裁剪区域。</p>
    </div>

    <template #footer>
      <div class="avatar-crop-dialog__footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="exporting"
          :disabled="loading || !cropperInstance"
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
  width: 360px;
  height: 360px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
  background: #f3f5f8;
  position: relative;
}

.avatar-crop-dialog__image {
  max-width: 100%;
  display: block;
}

.avatar-crop-dialog__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  background: rgb(243 245 248 / 76%);
}

.avatar-crop-dialog__tip {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.avatar-crop-dialog__footer {
  display: flex;
  justify-content: flex-end;
}

.avatar-crop-dialog :deep(.cropper-bg) {
  background-image: none;
}

.avatar-crop-dialog :deep(.cropper-view-box),
.avatar-crop-dialog :deep(.cropper-face) {
  border-radius: 50%;
}
</style>
