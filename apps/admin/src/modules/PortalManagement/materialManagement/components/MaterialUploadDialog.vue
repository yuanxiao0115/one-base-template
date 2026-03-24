<script setup lang="ts">
import { computed, ref } from 'vue';
import type {
  UploadFile,
  UploadFiles,
  UploadProps,
  UploadRawFile,
  UploadRequestOptions
} from 'element-plus';
import { message } from '@one-base-template/ui';
import { materialApi } from '../api';
import type { MaterialCategoryRecord, MaterialUploadDraft } from '../types';
import {
  isBizSuccess,
  MATERIAL_FILE_MAX_SIZE_MB,
  MATERIAL_IMAGE_ACCEPT,
  MATERIAL_NAME_MAX_LENGTH,
  MATERIAL_UPLOAD_LIMIT,
  normalizeUploadResult,
  resolveResourceUrl,
  toIdLike,
  toMaterialSavePayload
} from '../composables/material-helpers';

const props = defineProps<{
  modelValue: boolean;
  fodderType: number;
  defaultCategoryId: string;
  categories: MaterialCategoryRecord[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'uploaded'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const drafts = ref<MaterialUploadDraft[]>([]);
const submitting = ref(false);

const accept = MATERIAL_IMAGE_ACCEPT.join(',');

const canUpload = computed(() => drafts.value.length < MATERIAL_UPLOAD_LIMIT);
type UploadProgressArg = Parameters<UploadRequestOptions['onProgress']>[0];
type UploadErrorArg = Parameters<UploadRequestOptions['onError']>[0];

function resetDialog() {
  drafts.value = [];
}

function createDefaultLabelIds() {
  return props.defaultCategoryId ? [props.defaultCategoryId] : [];
}

function onClose() {
  visible.value = false;
  resetDialog();
}

function onExceed() {
  message.warning(`单次最多上传 ${MATERIAL_UPLOAD_LIMIT} 个素材`);
}

async function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return await new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.width, height: image.height });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('读取图片尺寸失败'));
    };
    image.src = objectUrl;
  });
}

const beforeUpload: UploadProps['beforeUpload'] = async (rawFile: UploadRawFile) => {
  if (!canUpload.value) {
    message.warning(`单次最多上传 ${MATERIAL_UPLOAD_LIMIT} 个素材`);
    return false;
  }

  const mimeType = rawFile.type;
  if (!MATERIAL_IMAGE_ACCEPT.includes(mimeType as (typeof MATERIAL_IMAGE_ACCEPT)[number])) {
    message.error('仅支持 png、gif、jpg、jpeg、bmp、svg、webp 格式');
    return false;
  }

  const fileName = rawFile.name || '';
  if (fileName.length > MATERIAL_NAME_MAX_LENGTH) {
    message.error(`文件名不能超过 ${MATERIAL_NAME_MAX_LENGTH} 个字符`);
    return false;
  }

  const sizeMb = Number(rawFile.size / 1024 / 1024);
  if (sizeMb > MATERIAL_FILE_MAX_SIZE_MB) {
    message.error(`图片大小不能超过 ${MATERIAL_FILE_MAX_SIZE_MB}MB`);
    return false;
  }

  return true;
};

function upsertDraft(nextDraft: MaterialUploadDraft) {
  const targetIndex = drafts.value.findIndex((item) => item.uid === nextDraft.uid);
  if (targetIndex > -1) {
    drafts.value.splice(targetIndex, 1, nextDraft);
    return;
  }
  drafts.value.push(nextDraft);
}

function toUploadProgressEvent(progressEvent: unknown): UploadProgressArg {
  const source = (progressEvent ?? {}) as { loaded?: number; total?: number; progress?: number };
  const loaded = Number(source.loaded) || 0;
  const total = Number(source.total) || 0;
  const fallback = total > 0 ? (loaded / total) * 100 : 0;
  const percent = Number.isFinite(source.progress) ? Number(source.progress) * 100 : fallback;

  return {
    ...(progressEvent as ProgressEvent),
    percent: Math.max(0, Math.min(100, percent))
  } as UploadProgressArg;
}

function toUploadError(error: unknown): UploadErrorArg {
  const base = error instanceof Error ? error : new Error('上传失败');
  return Object.assign(base, {
    status: 500,
    method: 'post',
    url: '/cmict/file/resource/upload'
  }) as UploadErrorArg;
}

const uploadRequest = async (options: UploadRequestOptions) => {
  const uploadFile = options.file as UploadRawFile;
  const uid = String(uploadFile.uid);

  const loadingDraft: MaterialUploadDraft = {
    uid,
    name: uploadFile.name,
    fileId: '',
    previewUrl: '',
    fodderLabelIds: createDefaultLabelIds(),
    loading: true
  };
  upsertDraft(loadingDraft);

  try {
    const response = await materialApi.uploadResource(uploadFile, {
      onProgress: (progressEvent) => {
        options.onProgress(toUploadProgressEvent(progressEvent));
      }
    });

    if (!isBizSuccess(response)) {
      throw new Error(response?.message || '上传失败');
    }

    const result = normalizeUploadResult(response?.data);
    const fileId = toIdLike(result.id);
    if (!fileId) {
      throw new Error('上传成功但未返回资源 ID');
    }

    const size = await readImageSize(uploadFile).catch(() => ({ width: 0, height: 0 }));
    upsertDraft({
      uid,
      name: uploadFile.name,
      fileId,
      fileLength: result.fileLength,
      fileSize: result.fileSize,
      fileType: result.fileType,
      width: size.width,
      height: size.height,
      previewUrl: resolveResourceUrl(fileId),
      fodderLabelIds: createDefaultLabelIds(),
      loading: false
    });

    options.onSuccess(response);
  } catch (error) {
    drafts.value = drafts.value.filter((item) => item.uid !== uid);
    options.onError(toUploadError(error));
    message.error(error instanceof Error ? error.message : '上传失败');
  }
};

function removeDraft(target: MaterialUploadDraft) {
  drafts.value = drafts.value.filter((item) => item.uid !== target.uid);
}

async function onConfirm() {
  if (!drafts.value.length) {
    message.warning('请先上传素材');
    return;
  }

  if (drafts.value.some((item) => item.loading)) {
    message.warning('存在上传中的文件，请稍后');
    return;
  }

  submitting.value = true;
  try {
    const payload = drafts.value.map((item) => toMaterialSavePayload(item, props.fodderType));
    const response = await materialApi.addMaterials(payload);
    if (!isBizSuccess(response)) {
      message.error(response?.message || '保存素材失败');
      return;
    }

    message.success('上传素材成功');
    visible.value = false;
    resetDialog();
    emit('uploaded');
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存素材失败');
  } finally {
    submitting.value = false;
  }
}

function onUploadRemove(_uploadFile: UploadFile, uploadFiles: UploadFiles) {
  const fileSet = new Set(uploadFiles.map((item) => String(item.uid)));
  drafts.value = drafts.value.filter((item) => fileSet.has(item.uid));
}
</script>

<template>
  <ObCrudContainer
    v-model="visible"
    container="dialog"
    mode="create"
    title="上传素材"
    :loading="submitting"
    confirm-text="确定"
    :dialog-width="980"
    :close-on-click-modal="false"
    @confirm="onConfirm"
    @cancel="onClose"
    @close="onClose"
  >
    <el-upload
      class="material-upload"
      drag
      multiple
      action="#"
      :accept="accept"
      :show-file-list="false"
      :limit="20"
      :before-upload="beforeUpload"
      :http-request="uploadRequest"
      :on-exceed="onExceed"
      :on-remove="onUploadRemove"
    >
      <el-icon class="el-icon--upload"><i class="ri-upload-cloud-2-line" /></el-icon>
      <div class="el-upload__text">点击或拖拽上传图片文件</div>
      <template #tip>
        <div class="el-upload__tip">支持 png/gif/jpg/jpeg/bmp/svg/webp，单个不超过 10MB</div>
      </template>
    </el-upload>

    <div v-if="drafts.length" class="draft-list">
      <div v-for="item in drafts" :key="item.uid" class="draft-item">
        <div class="draft-preview">
          <el-image
            v-if="item.previewUrl"
            :src="item.previewUrl"
            fit="contain"
            class="draft-image"
          />
          <div v-else class="draft-image draft-empty">待上传</div>
        </div>

        <div class="draft-form">
          <el-input
            v-model.trim="item.name"
            maxlength="32"
            show-word-limit
            placeholder="素材名称"
          />
          <el-select
            v-model="item.fodderLabelIds"
            multiple
            filterable
            clearable
            collapse-tags
            collapse-tags-tooltip
            placeholder="所属分类"
          >
            <el-option
              v-for="category in props.categories"
              :key="String(category.id || '')"
              :label="String(category.labelName || '')"
              :value="String(category.id || '')"
            />
          </el-select>
        </div>

        <el-button link type="danger" class="remove-btn" @click="removeDraft(item)">删除</el-button>
      </div>
    </div>
  </ObCrudContainer>
</template>

<style scoped>
.material-upload {
  margin-bottom: 14px;
}

.material-upload :deep(.el-upload-dragger) {
  border-radius: 14px;
  border: 1px dashed #9ab3d4;
  background:
    radial-gradient(circle at right top, rgb(37 99 235 / 12%) 0%, transparent 40%),
    linear-gradient(180deg, #f9fbff 0%, #f2f7ff 100%);
  min-height: 168px;
  transition:
    border-color 0.22s ease,
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.material-upload :deep(.el-upload-dragger:hover) {
  border-color: var(--el-color-primary);
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgb(37 99 235 / 12%);
}

.material-upload :deep(.el-upload__text) {
  color: #0f172a;
  font-weight: 600;
}

.material-upload :deep(.el-upload__tip) {
  color: #52637a;
  font-size: 12px;
}

.draft-list {
  max-height: 420px;
  overflow: auto;
  display: grid;
  gap: 12px;
  padding-right: 2px;
}

.draft-item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 12px;
  border: 1px solid #dce5f0;
  border-radius: 12px;
  padding: 12px;
  align-items: center;
  background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.draft-item:hover {
  transform: translateY(-1px);
  border-color: #c8d6e5;
  box-shadow: 0 12px 20px rgb(15 23 42 / 9%);
}

.draft-preview {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #dce5f0;
  background:
    radial-gradient(circle at 80% 14%, rgb(37 99 235 / 16%) 0%, transparent 42%),
    linear-gradient(180deg, #fff 0%, #f1f6ff 100%);
}

.draft-image {
  width: 100%;
  height: 92px;
  display: block;
}

.draft-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #52637a;
  background: var(--el-fill-color-light);
}

.draft-form {
  display: grid;
  gap: 8px;
}

.draft-form :deep(.el-input__wrapper),
.draft-form :deep(.el-select__wrapper) {
  border-radius: 10px;
}

.remove-btn {
  min-width: 44px;
}

@media (width <= 768px) {
  .draft-item {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .draft-image {
    height: 132px;
  }

  .remove-btn {
    justify-self: end;
  }
}
</style>
