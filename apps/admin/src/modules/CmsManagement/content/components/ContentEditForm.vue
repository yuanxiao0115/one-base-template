<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import type {
    FormInstance,
    FormRules,
    UploadProps,
    UploadRawFile,
    UploadRequestOptions as ElUploadRequestOptions,
    UploadUserFile,
  } from "element-plus";
  import { Plus } from "@element-plus/icons-vue";
  import type { CrudFormLike } from "@one-base-template/ui";
  import ObRichTextEditor from "@/components/rich-text/ObRichTextEditor.vue";
  import { message } from "@one-base-template/ui";
  import { contentApi } from "../api";
  import type {
    ContentCategoryRecord,
    UploadAttachmentResult,
    UploadResourceResult,
  } from "../types";
  import type { ContentForm } from "../form";

  const props = defineProps<{
    rules: FormRules<ContentForm>;
    disabled: boolean;
    categoryTreeOptions: ContentCategoryRecord[];
    categoryTreeLoading: boolean;
  }>();

  const model = defineModel<ContentForm>({ required: true });
  const formRef = ref<FormInstance>();
  type ContentAttachmentFormItem = ContentForm["cmsArticleAttachmentList"][number];
  type AttachmentLike = {
    attachmentName?: string;
    attachmentUrl?: string;
  };

  const treeProps = {
    children: "children",
    label: "categoryName",
    value: "id",
  } as const;

  const isRepost = computed(() => Number(model.value.articleType) === 2);
  const coverUploadList = ref<UploadUserFile[]>([]);
  const coverUploadLimit = 1;
  const coverMaxSizeMb = 2;
  const coverAccept = "image/png,image/jpg,image/jpeg,image/bmp";
  const coverAllowedExtensions = ["jpg", "jpeg", "png", "bmp"];
  const attachmentUploadList = ref<UploadUserFile[]>([]);
  const attachmentLimit = 20;
  const attachmentMaxSizeMb = 500;

  function buildAttachmentName(url: string, index: number): string {
    const rawPath = url.split("?")[0] || "";
    const pathSegments = rawPath.split("/");
    const fileName = decodeURIComponent(pathSegments.at(-1) || "").trim();
    if (fileName) {
      return fileName;
    }
    return `附件${index + 1}`;
  }

  function normalizeAttachmentList(attachments: AttachmentLike[] | undefined): ContentAttachmentFormItem[] {
    const normalizedList: ContentAttachmentFormItem[] = [];
    (attachments || []).forEach((item, index) => {
      const attachmentUrl = String(item.attachmentUrl || "").trim();
      if (!attachmentUrl) {
        return;
      }

      normalizedList.push({
        attachmentName: String(item.attachmentName || "").trim() || buildAttachmentName(attachmentUrl, index),
        attachmentUrl,
      });
    });

    return normalizedList;
  }

  function toUploadList(attachments: ContentAttachmentFormItem[]): UploadUserFile[] {
    return attachments.map((item, index) => ({
      uid: index + 1,
      name: item.attachmentName || buildAttachmentName(item.attachmentUrl, index),
      url: item.attachmentUrl,
      status: "success",
    }));
  }

  function syncAttachmentUploadList(attachments: ContentAttachmentFormItem[]) {
    attachmentUploadList.value = toUploadList(attachments);
  }

  function applyAttachmentList(attachments: ContentAttachmentFormItem[]) {
    model.value.cmsArticleAttachmentList = attachments;
    syncAttachmentUploadList(attachments);
  }

  function findAttachmentIndex(attachments: ContentAttachmentFormItem[], target: UploadUserFile): number {
    if (target.url) {
      const indexByUrl = attachments.findIndex((item) => item.attachmentUrl === target.url);
      if (indexByUrl >= 0) {
        return indexByUrl;
      }
    }

    return attachments.findIndex((item) => item.attachmentName === target.name);
  }

  function beforeAttachmentUpload(file: UploadRawFile) {
    const fileSizeMb = Number(file.size / 1024 / 1024);
    if (fileSizeMb > attachmentMaxSizeMb) {
      message.error(`文件大小不能超过 ${attachmentMaxSizeMb}MB`);
      return false;
    }
    return true;
  }

  function handleAttachmentExceed() {
    message.warning(`最多上传 ${attachmentLimit} 个附件`);
  }

  function resolveCoverImageUrl(coverUrl: string) {
    const value = String(coverUrl || "").trim();
    if (!value) {
      return "";
    }

    if (/^https?:\/\//.test(value) || value.startsWith("/")) {
      return value;
    }

    return `/cmict/file/resource/show?id=${encodeURIComponent(value)}`;
  }

  function syncCoverUploadList(coverUrl: string) {
    const value = String(coverUrl || "").trim();
    if (!value) {
      coverUploadList.value = [];
      return;
    }

    coverUploadList.value = [
      {
        uid: 1,
        name: "封面图",
        status: "success",
        url: resolveCoverImageUrl(value),
      },
    ];
  }

  function beforeCoverUpload(file: UploadRawFile) {
    const fileSizeMb = Number(file.size / 1024 / 1024);
    if (fileSizeMb > coverMaxSizeMb) {
      message.error(`封面图片大小不能超过 ${coverMaxSizeMb}MB`);
      return false;
    }

    const type = String(file.type || "").toLowerCase();
    const fileName = String(file.name || "").toLowerCase();
    const extension = fileName.includes(".") ? fileName.split(".").at(-1) || "" : "";
    const allowedType = ["image/jpeg", "image/jpg", "image/png", "image/bmp"];
    if (!(allowedType.includes(type) || coverAllowedExtensions.includes(extension))) {
      message.error(`封面图片仅支持 ${coverAllowedExtensions.join("、")} 格式`);
      return false;
    }

    return true;
  }

  function handleCoverExceed() {
    message.warning("封面图片最多上传 1 张");
  }

  async function uploadEditorResource(payload: { file: File; type: "image" | "video" }): Promise<string> {
    const result = await contentApi.uploadResource(payload.file);
    const url = String(result.joinUrl || result.savedPath || "").trim();
    if (!url) {
      throw new Error("上传成功但未返回资源地址");
    }
    return url;
  }

  type UploadAjaxErrorLike = Error & {
    status: number;
    method: string;
    url: string;
  };

  function toUploadAjaxError(error: Error): UploadAjaxErrorLike {
    const uploadError = error as UploadAjaxErrorLike;
    uploadError.status = uploadError.status ?? 0;
    uploadError.method = uploadError.method ?? "post";
    uploadError.url = uploadError.url ?? "";
    return uploadError;
  }

  const uploadAttachmentRequest = async (options: ElUploadRequestOptions) => {
    try {
      const result = await contentApi.uploadAttachment(options.file as File, {
        onProgress: (event) => {
          const percent = event.total ? Number(((event.loaded / event.total) * 100).toFixed(2)) : 0;
          options.onProgress?.({ percent } as never);
        },
      });
      options.onSuccess?.(result);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error("上传附件失败");
      options.onError?.(toUploadAjaxError(normalizedError));
      message.error(normalizedError.message || "上传附件失败");
    }
  };

  const uploadCoverRequest = async (options: ElUploadRequestOptions) => {
    try {
      const result = await contentApi.uploadResource(options.file as File, {
        onProgress: (event) => {
          const percent = event.total ? Number(((event.loaded / event.total) * 100).toFixed(2)) : 0;
          options.onProgress?.({ percent } as never);
        },
      });
      options.onSuccess?.(result);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error("上传封面图片失败");
      options.onError?.(toUploadAjaxError(normalizedError));
      message.error(normalizedError.message || "上传封面图片失败");
    }
  };

  const handleCoverUploadSuccess: UploadProps["onSuccess"] = (response) => {
    const row = response as UploadResourceResult;
    const coverId = String(row.id || "").trim();
    const fallbackUrl = String(row.joinUrl || row.savedPath || "").trim();
    const nextValue = coverId || fallbackUrl;

    if (!nextValue) {
      message.error("上传成功但未返回封面图片地址");
      return;
    }

    model.value.coverUrl = nextValue;
    syncCoverUploadList(nextValue);
  };

  const handleCoverRemove: UploadProps["onRemove"] = () => {
    model.value.coverUrl = "";
    syncCoverUploadList("");
  };

  const handleAttachmentSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
    const row = response as UploadAttachmentResult;
    const attachmentUrl = String(row.attachmentUrl || row.savedPath || "").trim();
    if (!attachmentUrl) {
      message.error("上传成功但未返回附件地址");
      return;
    }

    const normalizedList = normalizeAttachmentList(model.value.cmsArticleAttachmentList);
    const attachmentName = String(row.attachmentName || uploadFile.name || "").trim() || "附件";
    const attachment: ContentAttachmentFormItem = {
      attachmentName,
      attachmentUrl,
    };

    const next = normalizedList.filter((item) => item.attachmentUrl !== attachment.attachmentUrl);
    next.push(attachment);
    applyAttachmentList(next);
  };

  const handleAttachmentRemove: UploadProps["onRemove"] = (uploadFile) => {
    const normalizedList = normalizeAttachmentList(model.value.cmsArticleAttachmentList);
    const targetIndex = findAttachmentIndex(normalizedList, uploadFile);
    if (targetIndex < 0) {
      return;
    }

    normalizedList.splice(targetIndex, 1);
    applyAttachmentList(normalizedList);
  };

  watch(
    () => model.value.coverUrl,
    (value) => {
      syncCoverUploadList(value);
    },
    { immediate: true }
  );

  watch(
    () => model.value.cmsArticleAttachmentList,
    (value) => {
      syncAttachmentUploadList(normalizeAttachmentList(value));
    },
    { deep: true, immediate: true }
  );

  watch(
    () => model.value.articleType,
    (value) => {
      if (Number(value) === 2) {
        return;
      }
      model.value.articleSource = "";
      model.value.outerHref = "";
    }
  );

  watch(
    () => model.value.articleContent,
    (value) => {
      if (typeof value === "string") {
        return;
      }
      model.value.articleContent = "";
    },
    { immediate: true }
  );

  const attachmentPreviewList = computed(() => normalizeAttachmentList(model.value.cmsArticleAttachmentList));

  const contentPreviewHtml = computed(() => {
    const html = String(model.value.articleContent || "").trim();
    return html || "<p class='content-empty'>暂无正文内容</p>";
  });
  const coverPreviewUrl = computed(() => resolveCoverImageUrl(model.value.coverUrl));

  defineExpose<CrudFormLike>({
    validate: (...args) => {
      const [callback] = args;
      if (callback) {
        return formRef.value?.validate?.(callback);
      }
      return formRef.value?.validate?.();
    },
    clearValidate: (...args) => formRef.value?.clearValidate?.(...args),
    resetFields: (...args) => formRef.value?.resetFields?.(...args),
  });
</script>

<template>
  <el-form
    ref="formRef"
    :model
    :rules="props.rules"
    label-position="top"
    :disabled="props.disabled"
    class="content-form"
    :class="{ 'content-form--readonly': props.disabled }"
  >
    <div class="content-form-shell">
      <section class="content-form-side content-form-side--meta">
        <div class="content-form-section content-form-section--meta">
          <div class="content-form-meta-grid">
            <el-form-item label="标题" prop="articleTitle" class="content-form-item content-form-item--full">
              <el-input v-model.trim="model.articleTitle" maxlength="100" show-word-limit placeholder="请输入标题" />
            </el-form-item>

            <el-form-item label="所属栏目" prop="cmsCategoryIdList" class="content-form-item content-form-item--full">
              <el-tree-select
                v-model="model.cmsCategoryIdList"
                class="w-full"
                :data="props.categoryTreeOptions"
                :props="treeProps"
                :loading="props.categoryTreeLoading"
                clearable
                multiple
                check-strictly
                node-key="id"
                value-key="id"
                placeholder="请选择所属栏目"
              />
            </el-form-item>

            <el-form-item label="文章类型" prop="articleType" class="content-form-item content-form-item--half">
              <el-select v-model="model.articleType" placeholder="请选择文章类型" class="w-full">
                <el-option label="原创" :value="1" />
                <el-option label="转载" :value="2" />
              </el-select>
            </el-form-item>

            <el-form-item label="作者" prop="articleAuthorName" class="content-form-item content-form-item--half">
              <el-input v-model.trim="model.articleAuthorName" maxlength="50" show-word-limit placeholder="请输入作者" />
            </el-form-item>

            <el-form-item label="发布时间" prop="publishTime" class="content-form-item content-form-item--full">
              <el-date-picker
                v-model="model.publishTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择发布时间"
                class="w-full"
              />
            </el-form-item>

            <el-form-item label="封面" prop="coverUrl" class="content-form-item content-form-item--full">
              <div class="cover-upload-wrapper">
                <template v-if="props.disabled">
                  <div v-if="coverPreviewUrl" class="cover-preview">
                    <el-image
                      class="cover-preview-image"
                      :src="coverPreviewUrl"
                      fit="cover"
                      :preview-src-list="[coverPreviewUrl]"
                      preview-teleported
                    />
                  </div>
                  <el-empty v-else description="暂无封面图片" :image-size="60" />
                </template>

                <el-upload
                  v-else
                  v-model:file-list="coverUploadList"
                  class="cover-upload"
                  :class="{ 'hide-cover-upload-btn': coverUploadList.length >= coverUploadLimit }"
                  list-type="picture-card"
                  action="#"
                  :accept="coverAccept"
                  :limit="coverUploadLimit"
                  :http-request="uploadCoverRequest"
                  :before-upload="beforeCoverUpload"
                  :on-success="handleCoverUploadSuccess"
                  :on-remove="handleCoverRemove"
                  :on-exceed="handleCoverExceed"
                >
                  <el-icon><Plus /></el-icon>
                  <template #tip>
                    <div class="cover-upload-tip">
                      支持 {{ coverAllowedExtensions.join("、") }} 格式，单张不超过 {{ coverMaxSizeMb }}MB，仅可上传 1 张
                    </div>
                  </template>
                </el-upload>
                <p v-if="!props.disabled" class="cover-upload-hint">建议比例 16:9，获得更好的列表展示效果</p>
              </div>
            </el-form-item>

            <template v-if="isRepost">
              <el-form-item label="转载来源" prop="articleSource" class="content-form-item content-form-item--full">
                <el-input v-model.trim="model.articleSource" maxlength="300" show-word-limit placeholder="请输入转载来源" />
              </el-form-item>

              <el-form-item label="转载链接" prop="outerHref" class="content-form-item content-form-item--full">
                <el-input v-model.trim="model.outerHref" maxlength="500" show-word-limit placeholder="请输入转载链接" />
              </el-form-item>
            </template>
          </div>
        </div>
      </section>

      <section class="content-form-side content-form-side--body">
        <section class="content-form-section content-form-section--editor">
          <el-form-item label="正文内容" prop="articleContent" class="content-form-item content-form-item--full">
            <div class="content-editor-wrapper">
              <div v-if="props.disabled" class="content-preview" v-html="contentPreviewHtml"></div>
              <ObRichTextEditor v-else v-model="model.articleContent" :upload="uploadEditorResource" />
            </div>
          </el-form-item>
        </section>

        <section class="content-form-section content-form-section--attachment">
          <el-form-item label="附件" prop="cmsArticleAttachmentList" class="content-form-item content-form-item--full">
            <div class="attachment-wrapper">
              <template v-if="props.disabled">
                <div v-if="attachmentPreviewList.length > 0" class="attachment-list">
                  <a
                    v-for="(item, index) in attachmentPreviewList"
                    :key="`${item.attachmentUrl}-${index}`"
                    class="attachment-item"
                    :href="item.attachmentUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ item.attachmentName || `附件${index + 1}` }}
                  </a>
                </div>
                <el-empty v-else description="暂无附件" :image-size="60" />
              </template>

              <el-upload
                v-else
                v-model:file-list="attachmentUploadList"
                class="attachment-upload"
                action="#"
                multiple
                :limit="attachmentLimit"
                :http-request="uploadAttachmentRequest"
                :before-upload="beforeAttachmentUpload"
                :on-success="handleAttachmentSuccess"
                :on-remove="handleAttachmentRemove"
                :on-exceed="handleAttachmentExceed"
              >
                <el-button type="primary">上传附件</el-button>
                <template #tip>
                  <div class="attachment-tip">支持常见文档、压缩包、媒体文件，单文件不超过 {{ attachmentMaxSizeMb }}MB</div>
                </template>
              </el-upload>
            </div>
          </el-form-item>
        </section>
      </section>
    </div>
  </el-form>
</template>

<style scoped>
  .content-form {
    width: 100%;
  }

  .content-form-shell {
    display: grid;
    grid-template-columns: minmax(360px, 460px) minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }

  .content-form-side {
    padding: 0;
  }

  .content-form-side--meta {
    position: sticky;
    top: 0;
  }

  .content-form-section--attachment {
    margin-top: 14px;
    padding-top: 8px;
  }

  .content-form-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 10px;
  }

  .content-form-item {
    margin-bottom: 10px;
  }

  .content-form-item--full {
    grid-column: 1 / -1;
  }

  .content-form-item--half {
    grid-column: span 1;
  }

  .content-form :deep(.el-form-item__label) {
    margin-bottom: 4px;
  }

  .content-form-side--body :deep(.el-form-item:last-child) {
    margin-bottom: 0;
  }

  .content-editor-wrapper {
    width: 100%;
    min-height: clamp(360px, 52vh, 640px);
  }

  .cover-upload-wrapper {
    width: 100%;
  }

  .cover-upload-tip {
    color: var(--el-text-color-secondary);
    line-height: 18px;
  }

  .cover-preview {
    width: 198px;
    height: 112px;
  }

  .cover-preview-image {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
  }

  .cover-upload {
    width: 100%;
  }

  .cover-upload-hint {
    margin: 6px 0 0;
    font-size: 12px;
    line-height: 17px;
    color: var(--el-text-color-secondary);
  }

  .cover-upload :deep(.el-upload--picture-card),
  .cover-upload :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 198px;
    height: 112px;
    border-radius: 8px;
  }

  .hide-cover-upload-btn :deep(.el-upload--picture-card) {
    display: none;
  }

  .content-preview {
    max-height: min(66vh, 780px);
    min-height: clamp(300px, 44vh, 520px);
    overflow: auto;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    padding: 12px;
    background: var(--el-bg-color-page);
  }

  :deep(.content-preview img),
  :deep(.content-preview video) {
    max-width: 100%;
    height: auto;
  }

  :deep(.content-preview .content-empty) {
    margin: 0;
    color: var(--el-text-color-secondary);
  }

  .attachment-wrapper {
    width: 100%;
  }

  .attachment-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .attachment-item {
    display: inline-flex;
    align-items: center;
    color: var(--el-color-primary);
    text-decoration: none;
    width: fit-content;
    max-width: 100%;
    padding: 3px 8px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    word-break: break-all;
  }

  .attachment-item:hover {
    text-decoration: underline;
  }

  .attachment-upload {
    width: 100%;
  }

  .attachment-tip {
    color: var(--el-text-color-secondary);
  }

  @media (max-width: 1360px) {
    .content-form-shell {
      grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
    }
  }

  @media (max-width: 1100px) {
    .content-form-shell {
      grid-template-columns: minmax(0, 1fr);
    }

    .content-form-side--meta {
      position: static;
    }
  }

  @media (max-width: 768px) {
    .content-form-meta-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .content-form-item--half,
    .content-form-item--full {
      grid-column: auto;
    }

    .cover-preview {
      width: 100%;
      max-width: 198px;
    }
  }
</style>
