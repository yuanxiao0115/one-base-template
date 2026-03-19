<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="图片内容">
        <el-form-item label="图片资源值">
          <el-input
            v-model.trim="sectionData.image.src"
            maxlength="300"
            show-word-limit
            placeholder="输入资源ID或完整URL，例如 abc123 / https://cdn.example.com/demo.png"
          />
        </el-form-item>

        <el-form-item label="预览">
          <el-image v-if="previewSrc" class="preview" :src="previewSrc" fit="cover">
            <template #error>
              <div class="preview-empty">图片加载失败</div>
            </template>
          </el-image>
          <div v-else class="preview-empty">未配置图片</div>
        </el-form-item>

        <el-form-item label="替代文本 alt">
          <el-input
            v-model.trim="sectionData.image.alt"
            maxlength="80"
            show-word-limit
            placeholder="用于无障碍与图片加载失败场景"
          />
        </el-form-item>

        <el-form-item label="图片说明">
          <el-input
            v-model.trim="sectionData.image.caption"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            maxlength="120"
            show-word-limit
            placeholder="可选，展示在图片下方"
          />
        </el-form-item>

        <el-form-item label="点击跳转链接">
          <el-input
            v-model.trim="sectionData.image.linkUrl"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            maxlength="240"
            show-word-limit
            placeholder="可选，支持站内路径或完整URL"
          />
        </el-form-item>

        <el-form-item label="新窗口打开">
          <el-switch
            v-model="sectionData.image.openInNewTab"
            :disabled="!sectionData.image.linkUrl"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="上传配置">
        <el-form-item label="启用上传">
          <el-switch v-model="sectionData.upload.enabled" />
        </el-form-item>

        <template v-if="sectionData.upload.enabled">
          <el-form-item label="上传地址">
            <el-input
              v-model.trim="sectionData.upload.uploadUrl"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              maxlength="240"
              show-word-limit
              placeholder="例如：/cmict/file/resource/upload"
            />
          </el-form-item>

          <el-form-item label="文件字段名">
            <el-input
              v-model.trim="sectionData.upload.fileField"
              maxlength="32"
              show-word-limit
              placeholder="默认 file"
            />
          </el-form-item>

          <el-form-item label="上传文件大小限制(MB)">
            <el-input-number
              v-model="sectionData.upload.maxSizeMb"
              :min="1"
              :max="100"
              controls-position="right"
            />
          </el-form-item>

          <el-form-item label="响应图片路径">
            <el-input
              v-model.trim="sectionData.upload.responseImagePath"
              maxlength="120"
              show-word-limit
              placeholder="例如：data.id / data.url"
            />
          </el-form-item>

          <el-form-item label="请求头 JSON">
            <el-input
              v-model.trim="sectionData.upload.headersJson"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              maxlength="400"
              show-word-limit
              placeholder="例如：{Authorization: Bearer xxx}"
            />
          </el-form-item>

          <el-form-item label="附加表单 JSON">
            <el-input
              v-model.trim="sectionData.upload.dataJson"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              maxlength="400"
              show-word-limit
              placeholder="例如：{bizType: portal}"
            />
          </el-form-item>

          <el-form-item label="上传图片">
            <div class="upload-actions">
              <el-upload
                action="#"
                :show-file-list="false"
                :before-upload="beforeImageUpload"
                :http-request="uploadImageRequest"
                :disabled="uploading"
              >
                <el-button type="primary" plain :icon="UploadFilled" :loading="uploading"
                  >上传图片</el-button
                >
              </el-upload>
              <el-button :disabled="!sectionData.image.src" @click="sectionData.image.src = ''"
                >清空图片值</el-button
              >
            </div>
            <div class="upload-tip">上传完成后会自动写回“图片资源值”。</div>
          </el-form-item>
        </template>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import { ObCard } from '@one-base-template/ui';
import type { UploadRawFile, UploadRequestOptions as ElUploadRequestOptions } from 'element-plus';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import { message } from '../../cms/common/message';
import {
  UnifiedContainerContentConfig,
  createDefaultUnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';
import {
  normalizeImageSource,
  parseJsonObject,
  resolveValueByPath,
  toPositiveNumber
} from '../common/material-utils';

interface ImageContentModel {
  src: string;
  alt: string;
  caption: string;
  linkUrl: string;
  openInNewTab: boolean;
}

interface UploadContentModel {
  enabled: boolean;
  uploadUrl: string;
  fileField: string;
  maxSizeMb: number;
  responseImagePath: string;
  headersJson: string;
  dataJson: string;
}

interface BaseImageContentData {
  container: UnifiedContainerContentConfigModel;
  image: ImageContentModel;
  upload: UploadContentModel;
}

type UploadAjaxErrorLike = Error & {
  status: number;
  method: string;
  url: string;
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseImageContentData>({
  name: 'base-image-content',
  sections: {
    container: {},
    image: {},
    upload: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
sectionData.image = {
  src: typeof sectionData.image?.src === 'string' ? sectionData.image.src : '',
  alt: typeof sectionData.image?.alt === 'string' ? sectionData.image.alt : '',
  caption: typeof sectionData.image?.caption === 'string' ? sectionData.image.caption : '',
  linkUrl: typeof sectionData.image?.linkUrl === 'string' ? sectionData.image.linkUrl : '',
  openInNewTab: sectionData.image?.openInNewTab !== false
};
sectionData.upload = {
  enabled: sectionData.upload?.enabled === true,
  uploadUrl: typeof sectionData.upload?.uploadUrl === 'string' ? sectionData.upload.uploadUrl : '',
  fileField:
    typeof sectionData.upload?.fileField === 'string' && sectionData.upload.fileField.trim()
      ? sectionData.upload.fileField
      : 'file',
  maxSizeMb: Math.max(1, toPositiveNumber(sectionData.upload?.maxSizeMb, 5)),
  responseImagePath:
    typeof sectionData.upload?.responseImagePath === 'string' &&
    sectionData.upload.responseImagePath.trim()
      ? sectionData.upload.responseImagePath
      : 'data.id',
  headersJson:
    typeof sectionData.upload?.headersJson === 'string' ? sectionData.upload.headersJson : '{}',
  dataJson: typeof sectionData.upload?.dataJson === 'string' ? sectionData.upload.dataJson : '{}'
};

const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
if (!sectionData.container.title.trim()) {
  sectionData.container.title = '图片物料';
}
if (!sectionData.container.subtitle.trim()) {
  sectionData.container.subtitle = '支持上传图片、资源ID与直链展示';
}
if (!sectionData.container.externalLinkText.trim()) {
  sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
}

const uploading = ref(false);
const previewSrc = computed(() => normalizeImageSource(sectionData.image.src));

function toUploadAjaxError(error: Error): UploadAjaxErrorLike {
  const uploadError = error as UploadAjaxErrorLike;
  uploadError.status = uploadError.status ?? 0;
  uploadError.method = uploadError.method ?? 'post';
  uploadError.url = uploadError.url ?? '';
  return uploadError;
}

function beforeImageUpload(file: UploadRawFile) {
  const fileSizeMb = Number(file.size / 1024 / 1024);
  const maxSize = Math.max(1, toPositiveNumber(sectionData.upload.maxSizeMb, 5));
  if (fileSizeMb > maxSize) {
    message.error(`图片大小不能超过 ${maxSize}MB`);
    return false;
  }

  const type = String(file.type || '').toLowerCase();
  if (!type.startsWith('image/')) {
    message.error('仅支持上传图片文件');
    return false;
  }

  return true;
}

function buildUploadHeaders(): HeadersInit {
  const headersObject = parseJsonObject(sectionData.upload.headersJson);
  const normalized: Record<string, string> = {};

  Object.entries(headersObject).forEach(([key, value]) => {
    if (value === undefined || value === null || key.toLowerCase() === 'content-type') {
      return;
    }
    normalized[key] = String(value);
  });

  return normalized;
}

function appendExtraUploadData(formData: FormData) {
  const dataObject = parseJsonObject(sectionData.upload.dataJson);
  Object.entries(dataObject).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      return;
    }
    formData.append(key, String(value));
  });
}

async function uploadImageRequest(options: ElUploadRequestOptions) {
  const uploadUrl = String(sectionData.upload.uploadUrl || '').trim();
  if (!uploadUrl) {
    const error = new Error('请先配置上传地址');
    options.onError?.(toUploadAjaxError(error));
    message.error(error.message);
    return;
  }

  const fileField = String(sectionData.upload.fileField || '').trim() || 'file';
  const formData = new FormData();
  appendExtraUploadData(formData);
  formData.append(fileField, options.file as File);

  uploading.value = true;
  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: buildUploadHeaders(),
      body: formData,
      credentials: 'include'
    });

    const contentType = response.headers.get('content-type') || '';
    const responsePayload = contentType.includes('application/json')
      ? ((await response.json()) as unknown)
      : ((await response.text()) as unknown);

    if (!response.ok) {
      throw new Error(`上传失败（HTTP ${response.status}）`);
    }

    const responsePath = String(sectionData.upload.responseImagePath || '').trim() || 'data.id';
    const extracted = resolveValueByPath(responsePayload, responsePath);
    const nextImageValue = String(extracted ?? '').trim();
    if (!nextImageValue) {
      throw new Error('上传成功但未提取到图片值，请检查响应路径');
    }

    sectionData.image.src = nextImageValue;
    options.onSuccess?.(responsePayload as Record<string, unknown>);
    message.success('图片上传成功');
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error('图片上传失败');
    options.onError?.(toUploadAjaxError(normalizedError));
    message.error(normalizedError.message || '图片上传失败');
  } finally {
    uploading.value = false;
  }
}

defineOptions({
  name: 'base-image-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview,
.preview-empty {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  width: min(100%, 320px);
  height: 180px;
  background: #f8fafc;
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #64748b;
}

.upload-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.upload-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}
</style>
