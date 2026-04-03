<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Component } from 'vue';
import { ElMessage } from 'element-plus';
import type {
  UploadFile,
  UploadFiles,
  UploadInstance,
  UploadProps,
  UploadRawFile,
  UploadRequestOptions,
  UploadUserFile
} from 'element-plus';
import { Upload as UploadIcon } from '@element-plus/icons-vue';

type UploadShellRequest = (options: UploadRequestOptions) => Promise<unknown>;

type UploadAjaxErrorLike = Error & {
  status: number;
  method: string;
  url: string;
};

defineOptions({
  name: 'UploadShell'
});

const props = withDefaults(
  defineProps<{
    request?: UploadShellRequest;
    action?: string;
    name?: string;
    accept?: string;
    limit?: number;
    multiple?: boolean;
    drag?: boolean;
    disabled?: boolean;
    autoUpload?: boolean;
    showFileList?: boolean;
    listType?: 'text' | 'picture' | 'picture-card';
    withCredentials?: boolean;
    headers?: Record<string, unknown>;
    data?: Record<string, unknown>;
    buttonText?: string;
    buttonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
    buttonIcon?: Component;
    tip?: string;
    maxSizeMb?: number;
    extensions?: string[];
    beforeUpload?: UploadProps['beforeUpload'];
  }>(),
  {
    request: undefined,
    action: '',
    name: 'file',
    accept: '',
    limit: 1,
    multiple: false,
    drag: false,
    disabled: false,
    autoUpload: true,
    showFileList: true,
    listType: 'text',
    withCredentials: false,
    headers: undefined,
    data: undefined,
    buttonText: '点击上传',
    buttonType: 'default',
    buttonIcon: UploadIcon,
    tip: '',
    maxSizeMb: 0,
    extensions: () => [],
    beforeUpload: undefined
  }
);

const emit = defineEmits<{
  (event: 'uploaded', response: unknown, file: UploadFile, files: UploadFiles): void;
  (event: 'failed', error: Error, file: UploadFile, files: UploadFiles): void;
  (event: 'remove', file: UploadFile, files: UploadFiles): void;
  (event: 'change', file: UploadFile, files: UploadFiles): void;
  (event: 'preview', file: UploadFile): void;
  (event: 'exceed', files: File[], filesList: UploadUserFile[]): void;
}>();

const model = defineModel<UploadUserFile[]>('fileList', {
  default: () => []
});

const uploadRef = ref<UploadInstance>();
const uploading = ref(false);

const normalizedExtensions = computed(() =>
  (props.extensions || [])
    .map((item) =>
      String(item || '')
        .replace(/^\./, '')
        .toLowerCase()
    )
    .filter(Boolean)
);

function createError(message: string): Error {
  return new Error(message || '上传失败');
}

function toUploadAjaxError(error: Error): UploadAjaxErrorLike {
  const uploadError = error as Partial<UploadAjaxErrorLike> & Error;
  uploadError.status = uploadError.status ?? 0;
  uploadError.method = uploadError.method ?? 'post';
  uploadError.url = uploadError.url ?? props.action ?? '';
  return uploadError as UploadAjaxErrorLike;
}

function toUploadFiles(files: UploadUserFile[] | UploadFiles | undefined): UploadFiles {
  return (Array.isArray(files) ? files : []) as UploadFiles;
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

const handleBeforeUpload: UploadProps['beforeUpload'] = async (file) => {
  const rawFile = file as UploadRawFile;
  if (!validateExtension(rawFile) || !validateSize(rawFile)) {
    return false;
  }

  if (!props.beforeUpload) {
    return true;
  }

  return props.beforeUpload(file);
};

const handleExceed: UploadProps['onExceed'] = (files, filesList) => {
  emit(
    'exceed',
    Array.isArray(files) ? (files as unknown as File[]) : [],
    Array.isArray(filesList) ? filesList : []
  );
};

const handleRemove: UploadProps['onRemove'] = (file, files) => {
  emit('remove', file, files);
};

const handleChange: UploadProps['onChange'] = (file, files) => {
  emit('change', file, files);
};

const handlePreview: UploadProps['onPreview'] = (file) => {
  emit('preview', file);
};

const handleSuccess: UploadProps['onSuccess'] = (response, file, files) => {
  emit('uploaded', response, file, files);
};

const handleError: UploadProps['onError'] = (error, file, files) => {
  const normalizedError = error instanceof Error ? error : createError('上传失败');
  emit('failed', normalizedError, file, files);
};

const uploadRequest = async (options: UploadRequestOptions) => {
  if (!props.request) {
    const error = createError('未配置上传请求函数');
    options.onError(toUploadAjaxError(error));
    emit('failed', error, options.file as unknown as UploadFile, toUploadFiles(model.value));
    return;
  }

  if (uploading.value) {
    const error = createError('正在上传，请稍后重试');
    options.onError(toUploadAjaxError(error));
    emit('failed', error, options.file as unknown as UploadFile, toUploadFiles(model.value));
    ElMessage.warning(error.message);
    return;
  }

  uploading.value = true;
  try {
    const response = await props.request(options);
    options.onSuccess(response);
  } catch (error) {
    const normalizedError = error instanceof Error ? error : createError('上传失败');
    options.onError(toUploadAjaxError(normalizedError));
    ElMessage.error(normalizedError.message);
  } finally {
    uploading.value = false;
  }
};

defineExpose({
  submit: () => uploadRef.value?.submit?.(),
  clearFiles: () => uploadRef.value?.clearFiles?.(),
  abort: (file?: UploadFile) => uploadRef.value?.abort?.(file),
  handleStart: (rawFile: UploadRawFile) => uploadRef.value?.handleStart?.(rawFile),
  handleRemove: (file: UploadFile) => uploadRef.value?.handleRemove?.(file),
  loading: uploading
});
</script>

<template>
  <el-upload
    ref="uploadRef"
    v-model:file-list="model"
    class="ob-upload-shell"
    :class="{ 'is-drag': props.drag }"
    :action="props.action"
    :name="props.name"
    :headers="props.headers"
    :data="props.data"
    :accept="props.accept"
    :disabled="props.disabled || uploading"
    :limit="props.limit"
    :multiple="props.multiple"
    :drag="props.drag"
    :auto-upload="props.autoUpload"
    :show-file-list="props.showFileList"
    :list-type="props.listType"
    :with-credentials="props.withCredentials"
    :before-upload="handleBeforeUpload"
    :http-request="props.request ? uploadRequest : undefined"
    @success="handleSuccess"
    @error="handleError"
    @remove="handleRemove"
    @change="handleChange"
    @preview="handlePreview"
    @exceed="handleExceed"
  >
    <slot :loading="uploading">
      <el-button
        v-if="!props.drag"
        :type="props.buttonType"
        :icon="props.buttonIcon"
        :loading="uploading"
        :disabled="props.disabled || uploading"
      >
        {{ props.buttonText }}
      </el-button>
      <template v-else>
        <el-icon class="ob-upload-shell__drag-icon"><UploadIcon /></el-icon>
        <div class="ob-upload-shell__drag-text">将文件拖到此处，或<em>点击上传</em></div>
      </template>
    </slot>

    <template #tip>
      <slot name="tip">
        <div v-if="props.tip" class="ob-upload-shell__tip">{{ props.tip }}</div>
      </slot>
    </template>
  </el-upload>
</template>

<style scoped>
.ob-upload-shell {
  width: 100%;
}

.ob-upload-shell.is-drag {
  width: 100%;
}

.ob-upload-shell.is-drag :deep(.el-upload),
.ob-upload-shell.is-drag :deep(.el-upload-dragger) {
  width: 100%;
}

.ob-upload-shell__drag-icon {
  margin-bottom: 8px;
  font-size: 36px;
  color: var(--el-text-color-secondary);
}

.ob-upload-shell__drag-text {
  color: var(--el-text-color-regular);
}

.ob-upload-shell__drag-text em {
  color: var(--el-color-primary);
  font-style: normal;
}

.ob-upload-shell__tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
}
</style>
