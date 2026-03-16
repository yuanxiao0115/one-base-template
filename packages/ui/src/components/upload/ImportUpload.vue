<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import type {
  UploadInstance,
  UploadProps,
  UploadRawFile,
  UploadRequestOptions,
  UploadUserFile
} from 'element-plus';
import type { Component } from 'vue';
import { Upload as UploadIcon } from '@element-plus/icons-vue';

export interface ImportUploadResponseLike {
  code?: string | number;
  message?: string;
  [key: string]: unknown;
}

const props = withDefaults(
  defineProps<{
    request: (file: File) => Promise<unknown>;
    limit?: number;
    maxSizeMb?: number;
    accept?: string;
    extensions?: string[];
    showFileList?: boolean;
    disabled?: boolean;
    buttonText?: string;
    buttonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
    buttonIcon?: Component;
    successCode?: number | string;
    resolveSuccess?: (response: unknown) => boolean;
    successMessage?: string;
    errorMessage?: string;
  }>(),
  {
    limit: 1,
    maxSizeMb: 10,
    accept:
      'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,.xlsx',
    extensions: () => ['xls', 'xlsx'],
    showFileList: false,
    disabled: false,
    buttonText: '导入',
    buttonType: 'default',
    buttonIcon: UploadIcon,
    successCode: 200,
    resolveSuccess: undefined,
    successMessage: '导入成功',
    errorMessage: ''
  }
);

const emit = defineEmits<{
  (event: 'uploaded', response: unknown): void;
  (event: 'failed', error: Error): void;
}>();

const uploadRef = ref<UploadInstance>();
const uploadList = ref<UploadUserFile[]>([]);
const uploading = ref(false);

const normalizedExtensions = computed(() => {
  return (props.extensions || [])
    .map((item) =>
      String(item || '')
        .replace(/^\./, '')
        .toLowerCase()
    )
    .filter(Boolean);
});

function createError(message: string): Error {
  return new Error(message || '导入失败');
}

type UploadAjaxErrorLike = Error & {
  status: number;
  method: string;
  url: string;
};

function toUploadAjaxError(error: Error): UploadAjaxErrorLike {
  const uploadError = error as Partial<UploadAjaxErrorLike> & Error;
  uploadError.status = uploadError.status ?? 0;
  uploadError.method = uploadError.method ?? 'post';
  uploadError.url = uploadError.url ?? '';
  return uploadError as UploadAjaxErrorLike;
}

function clearUploadList() {
  uploadRef.value?.clearFiles();
  uploadList.value = [];
}

function validateExtension(file: UploadRawFile): boolean {
  const extensions = normalizedExtensions.value;
  if (extensions.length === 0) {
    return true;
  }

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (extensions.includes(ext)) {
    return true;
  }

  ElMessage.warning(`文件格式不正确，仅支持：${extensions.join('、')}`);
  return false;
}

function validateSize(file: UploadRawFile): boolean {
  const maxSizeMb = Number(props.maxSizeMb || 0);
  if (!maxSizeMb || maxSizeMb <= 0) {
    return true;
  }

  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size <= maxBytes) {
    return true;
  }

  ElMessage.error(`上传文件大小不能超过 ${maxSizeMb}MB`);
  return false;
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const rawFile = file as UploadRawFile;
  return validateExtension(rawFile) && validateSize(rawFile);
};

const onExceed: UploadProps['onExceed'] = (_, files) => {
  const currentCount = Array.isArray(files) ? files.length : 0;
  const remaining = Math.max(props.limit - currentCount, 0);
  if (remaining > 0) {
    ElMessage.error(`最多可上传 ${props.limit} 个文件，还可选择 ${remaining} 个`);
    return;
  }

  ElMessage.error(`最多可上传 ${props.limit} 个文件`);
};

function isRequestSuccess(response: unknown): boolean {
  if (props.resolveSuccess) {
    return Boolean(props.resolveSuccess(response));
  }

  if (!response || typeof response !== 'object') {
    return true;
  }

  const payload = response as ImportUploadResponseLike;
  if (typeof payload.code === 'undefined' || payload.code === null) {
    return true;
  }

  return String(payload.code) === String(props.successCode);
}

function getResponseErrorMessage(response: unknown): string {
  if (response && typeof response === 'object') {
    const payload = response as ImportUploadResponseLike;
    if (payload.message?.trim()) {
      return payload.message;
    }
  }

  return props.errorMessage || '导入失败';
}

const uploadRequest = async (options: UploadRequestOptions) => {
  if (uploading.value) {
    const error = createError('正在上传，请稍后重试');
    options.onError(toUploadAjaxError(error));
    emit('failed', error);
    ElMessage.warning(error.message);
    return;
  }

  uploading.value = true;
  try {
    const response = await props.request(options.file as File);
    if (!isRequestSuccess(response)) {
      const error = createError(getResponseErrorMessage(response));
      throw error;
    }

    if (props.successMessage) {
      ElMessage.success(props.successMessage);
    }

    options.onSuccess(response);
    emit('uploaded', response);

    if (!props.showFileList) {
      clearUploadList();
    }
  } catch (error) {
    const normalizedError =
      error instanceof Error ? error : createError(props.errorMessage || '导入失败');
    ElMessage.error(normalizedError.message);
    options.onError(toUploadAjaxError(normalizedError));
    emit('failed', normalizedError);
    clearUploadList();
  } finally {
    uploading.value = false;
  }
};

defineExpose({
  clearFiles: () => clearUploadList(),
  upload: () => uploadRef.value?.submit?.(),
  loading: uploading
});
</script>

<template>
  <el-upload
    ref="uploadRef"
    v-model:file-list="uploadList"
    :accept="accept"
    :disabled="disabled || uploading"
    :limit="limit"
    :show-file-list="showFileList"
    :before-upload="beforeUpload"
    :http-request="uploadRequest"
    :on-exceed="onExceed"
  >
    <slot :loading="uploading">
      <el-button
        :type="buttonType"
        :icon="buttonIcon"
        :loading="uploading"
        :disabled="disabled || uploading"
      >
        {{ buttonText }}
      </el-button>
    </slot>
  </el-upload>
</template>
