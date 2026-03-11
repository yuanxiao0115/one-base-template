<script setup lang="ts">
  import { computed } from "vue";
  import type { UploadRawFile, UploadRequestOptions as ElUploadRequestOptions } from "element-plus";
  import { Delete, Plus, UploadFilled } from "@element-plus/icons-vue";
  import { message } from "@one-base-template/ui";

  import { portalApi } from "../../../api";
  import { PORTAL_CUSTOM_HEADER_OPTIONS, type PortalTemplateDetails } from "../../../utils/templateDetails";

  interface SelectOption {
    label: string;
    value: string;
  }

  interface BizResLike {
    code?: unknown;
    success?: unknown;
    message?: unknown;
    data?: unknown;
  }

  const props = defineProps<{
    formState: PortalTemplateDetails;
    pageTabOptions: SelectOption[];
  }>();

  type ContainerWidthMode = "fixed" | "full";

  const headerContainerWidthMode = computed<ContainerWidthMode>({
    get() {
      return props.formState.shell.header.tokens.containerWidth === "100%" ? "full" : "fixed";
    },
    set(mode) {
      if (mode === "full") {
        props.formState.shell.header.tokens.containerWidth = "100%";
        return;
      }
      if (props.formState.shell.header.tokens.containerWidth === "100%") {
        props.formState.shell.header.tokens.containerWidth = 1200;
      }
    },
  });

  const headerContainerWidthPx = computed<number>({
    get() {
      const width = props.formState.shell.header.tokens.containerWidth;
      return typeof width === "number" ? width : 1200;
    },
    set(value) {
      props.formState.shell.header.tokens.containerWidth = Number.isFinite(value) ? value : 1200;
    },
  });

  const logoPreviewUrl = computed(() => {
    const value = String(props.formState.shell.header.tokens.logo || "").trim();
    if (!value) {
      return "";
    }
    if (/^https?:\/\//.test(value) || value.startsWith("/")) {
      return value;
    }
    return `/cmict/file/resource/show?id=${encodeURIComponent(value)}`;
  });

  function normalizeBizOk(res: BizResLike | null | undefined): boolean {
    const code = res?.code;
    return res?.success === true || code === 0 || code === 200 || String(code) === "0" || String(code) === "200";
  }

  function createRowKey(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function addManualNavItem() {
    props.formState.shell.header.behavior.manualNavItems.push({
      key: createRowKey("nav"),
      label: "",
      tabId: "",
      url: "",
    });
  }

  function removeManualNavItem(index: number) {
    props.formState.shell.header.behavior.manualNavItems.splice(index, 1);
  }

  function beforeLogoUpload(file: UploadRawFile) {
    const fileSizeMb = Number(file.size / 1024 / 1024);
    if (fileSizeMb > 2) {
      message.error("Logo 图片大小不能超过 2MB");
      return false;
    }

    const type = String(file.type || "").toLowerCase();
    const fileName = String(file.name || "").toLowerCase();
    const extension = fileName.includes(".") ? fileName.split(".").at(-1) || "" : "";
    const allowedType = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
    const allowedExtension = ["jpg", "jpeg", "png", "webp", "svg"];
    if (!(allowedType.includes(type) || allowedExtension.includes(extension))) {
      message.error("Logo 仅支持 jpg/jpeg/png/webp/svg 格式");
      return false;
    }

    return true;
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

  async function uploadLogoRequest(options: ElUploadRequestOptions) {
    try {
      const res = await portalApi.resource.upload(options.file as File);
      if (!normalizeBizOk(res)) {
        throw new Error((res?.message as string) || "Logo 上传失败");
      }
      const data = (res?.data ?? {}) as { id?: unknown; joinUrl?: unknown; savedPath?: unknown };
      const logoValue =
        (typeof data.id === "string" && data.id.trim()) ||
        (typeof data.joinUrl === "string" && data.joinUrl.trim()) ||
        (typeof data.savedPath === "string" && data.savedPath.trim()) ||
        "";
      if (!logoValue) {
        throw new Error("上传成功但未返回可用地址");
      }
      props.formState.shell.header.tokens.logo = logoValue;
      options.onSuccess?.(res);
      message.success("Logo 上传成功");
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error("Logo 上传失败");
      options.onError?.(toUploadAjaxError(normalizedError));
      message.error(normalizedError.message || "Logo 上传失败");
    }
  }

  function clearLogo() {
    props.formState.shell.header.tokens.logo = "";
  }
</script>

<template>
  <el-form :model="props.formState" label-width="128px" class="settings-form">
    <section class="settings-section">
      <h4 class="section-title">基础布局</h4>
      <el-form-item label="启用页眉">
        <el-switch v-model="props.formState.shell.header.enabled" />
      </el-form-item>

      <el-form-item label="页眉模式">
        <el-radio-group v-model="props.formState.shell.header.mode">
          <el-radio value="configurable">可配置组件</el-radio>
          <el-radio value="customComponent">独立组件</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="props.formState.shell.header.mode === 'customComponent'" label="独立组件">
        <el-select v-model="props.formState.shell.header.customComponentKey" class="w-320" placeholder="请选择组件">
          <el-option
            v-for="item in PORTAL_CUSTOM_HEADER_OPTIONS"
            :key="item.key"
            :label="`${item.label}（${item.description}）`"
            :value="item.key"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="背景色">
        <el-color-picker v-model="props.formState.shell.header.tokens.bgColor" />
      </el-form-item>

      <el-form-item label="文字色">
        <el-color-picker v-model="props.formState.shell.header.tokens.textColor" />
      </el-form-item>

      <el-form-item label="高度(px)">
        <el-input-number v-model="props.formState.shell.header.tokens.height" :min="40" :max="200" />
      </el-form-item>

      <el-form-item label="内容宽度">
        <div class="width-config">
          <el-radio-group v-model="headerContainerWidthMode">
            <el-radio value="fixed">固定宽度</el-radio>
            <el-radio value="full">100%铺满</el-radio>
          </el-radio-group>
          <el-input-number
            v-model="headerContainerWidthPx"
            :min="320"
            :max="1920"
            controls-position="right"
            :disabled="headerContainerWidthMode === 'full'"
          />
        </div>
      </el-form-item>

      <el-form-item label="吸顶">
        <el-switch v-model="props.formState.shell.header.tokens.sticky" />
      </el-form-item>

      <el-form-item label="层级 z-index">
        <el-input-number v-model="props.formState.shell.header.tokens.zIndex" :min="1" :max="2000" />
      </el-form-item>

      <el-form-item label="阴影">
        <el-input
          v-model="props.formState.shell.header.tokens.shadow"
          placeholder="例如：0 8px 24px rgba(2, 44, 102, 0.18)"
        />
      </el-form-item>
    </section>

    <section class="settings-section">
      <h4 class="section-title">品牌与标题</h4>
      <el-form-item label="标题">
        <el-input v-model="props.formState.shell.header.behavior.title" maxlength="24" show-word-limit />
      </el-form-item>

      <el-form-item label="副标题">
        <el-input v-model="props.formState.shell.header.behavior.subTitle" maxlength="40" show-word-limit />
      </el-form-item>

      <el-form-item label="标题排布">
        <el-radio-group v-model="props.formState.shell.header.behavior.titleLayout">
          <el-radio value="stack">主副标题上下排</el-radio>
          <el-radio value="divider">主标题 | 副标题</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="标题位置">
        <el-radio-group v-model="props.formState.shell.header.behavior.titlePosition">
          <el-radio value="logoRight">Logo 右侧</el-radio>
          <el-radio value="leftEdge">页眉最左侧</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="主标题字号(px)">
        <el-input-number v-model="props.formState.shell.header.behavior.titleFontSize" :min="12" :max="48" />
      </el-form-item>

      <el-form-item label="副标题字号(px)">
        <el-input-number v-model="props.formState.shell.header.behavior.subTitleFontSize" :min="10" :max="36" />
      </el-form-item>

      <el-form-item label="Logo 图片">
        <div class="logo-uploader">
          <div class="logo-preview">
            <img v-if="logoPreviewUrl" :src="logoPreviewUrl" alt="logo-preview" class="logo-preview-image" />
            <div v-else class="logo-preview-empty">未上传 Logo</div>
          </div>
          <div class="logo-actions">
            <el-upload
              action="#"
              :show-file-list="false"
              :before-upload="beforeLogoUpload"
              :http-request="uploadLogoRequest"
            >
              <el-button type="primary" plain :icon="UploadFilled">上传图片</el-button>
            </el-upload>
            <el-button @click="clearLogo">清空</el-button>
          </div>
          <div class="logo-tip">支持 jpg/jpeg/png/webp/svg，单张不超过 2MB。上传后自动写入 details。</div>
        </div>
      </el-form-item>

      <el-form-item label="Logo 值">
        <el-input
          v-model="props.formState.shell.header.tokens.logo"
          placeholder="资源 id 或 URL（示例：abc123 / https://cdn/logo.png）"
        />
      </el-form-item>

      <el-form-item label="Logo 宽度(px)">
        <el-input-number v-model="props.formState.shell.header.tokens.logoWidth" :min="40" :max="420" />
      </el-form-item>

      <el-form-item label="Logo 左偏移(px)">
        <el-input-number v-model="props.formState.shell.header.tokens.logoLeftMargin" :min="0" :max="200" />
      </el-form-item>
    </section>

    <section class="settings-section">
      <h4 class="section-title">导航模块</h4>
      <el-form-item label="导航来源">
        <el-radio-group v-model="props.formState.shell.header.behavior.navSource">
          <el-radio value="tabTree">页面树自动生成</el-radio>
          <el-radio value="manual">手工维护</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="导航对齐">
        <el-radio-group v-model="props.formState.shell.header.behavior.navAlign">
          <el-radio value="left">左对齐</el-radio>
          <el-radio value="center">居中</el-radio>
          <el-radio value="right">右对齐</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="导航激活背景">
        <el-color-picker v-model="props.formState.shell.header.tokens.activeBgColor" />
      </el-form-item>

      <el-form-item label="导航激活文字">
        <el-color-picker v-model="props.formState.shell.header.tokens.activeTextColor" />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.header.behavior.navSource === 'manual'" label="手工导航">
        <div class="rows-panel">
          <div class="rows-header">
            <span>可配置名称、绑定页面（tabId）或外链 URL</span>
            <el-button type="primary" plain size="small" :icon="Plus" @click="addManualNavItem">新增导航</el-button>
          </div>

          <div v-if="!props.formState.shell.header.behavior.manualNavItems.length" class="empty">
            暂无导航项，请点击“新增导航”。
          </div>

          <div
            v-for="(item, index) in props.formState.shell.header.behavior.manualNavItems"
            :key="item.key || index"
            class="row-grid"
          >
            <el-input v-model="item.label" placeholder="导航名称（必填）" class="col-2" />
            <el-select v-model="item.tabId" clearable filterable placeholder="绑定页面（可选）" class="col-2">
              <el-option v-for="tab in props.pageTabOptions" :key="tab.value" :label="tab.label" :value="tab.value" />
            </el-select>
            <el-input v-model="item.url" placeholder="外链 URL（可选）" class="col-3" />
            <el-button text type="danger" :icon="Delete" @click="removeManualNavItem(index)" />
          </div>
        </div>
      </el-form-item>
    </section>

    <section class="settings-section">
      <h4 class="section-title">顶部公告模块</h4>
      <el-form-item label="顶部公告">
        <el-switch v-model="props.formState.shell.header.behavior.showTopNotice" />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.header.behavior.showTopNotice" label="公告文案">
        <el-input v-model="props.formState.shell.header.behavior.topNoticeText" maxlength="120" show-word-limit />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.header.behavior.showTopNotice" label="公告背景色">
        <el-color-picker v-model="props.formState.shell.header.tokens.noticeBgColor" />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.header.behavior.showTopNotice" label="公告文字色">
        <el-color-picker v-model="props.formState.shell.header.tokens.noticeTextColor" />
      </el-form-item>
    </section>

    <section class="settings-section">
      <h4 class="section-title">行动按钮与用户区</h4>
      <el-form-item label="行动按钮">
        <el-switch v-model="props.formState.shell.header.behavior.showActionButton" />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.header.behavior.showActionButton" label="按钮文案">
        <el-input v-model="props.formState.shell.header.behavior.actionButtonText" maxlength="20" show-word-limit />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.header.behavior.showActionButton" label="按钮跳转 URL">
        <el-input v-model="props.formState.shell.header.behavior.actionButtonUrl" placeholder="https://example.com/path" />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.header.behavior.showActionButton" label="按钮背景色">
        <el-color-picker v-model="props.formState.shell.header.tokens.actionBgColor" />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.header.behavior.showActionButton" label="按钮文字色">
        <el-color-picker v-model="props.formState.shell.header.tokens.actionTextColor" />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.header.behavior.showActionButton" label="按钮边框色">
        <el-color-picker v-model="props.formState.shell.header.tokens.actionBorderColor" />
      </el-form-item>

      <el-form-item label="用户中心">
        <el-switch v-model="props.formState.shell.header.behavior.showUserCenter" />
      </el-form-item>
    </section>
  </el-form>
</template>

<style scoped>
  .settings-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .settings-section {
    border: 1px solid #e2e8f0;
    background: linear-gradient(180deg, #f8fbff 0%, #ffffff 88%);
    padding: 10px 12px 6px;
  }

  .settings-section :deep(.el-form-item) {
    margin-bottom: 10px;
  }

  .settings-section :deep(.el-form-item__label) {
    font-size: 12px;
    color: #475569;
  }

  .settings-section :deep(.el-form-item__content) {
    min-height: 32px;
  }

  .section-title {
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    letter-spacing: 0.02em;
  }

  .w-320 {
    width: 320px;
  }

  .rows-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border: 1px solid #d7e1ed;
    background: #f8fafc;
  }

  .rows-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: #64748b;
    font-size: 12px;
  }

  .empty {
    padding: 10px 8px;
    border: 1px dashed #c9d6e4;
    background: #fff;
    color: #94a3b8;
    font-size: 12px;
    text-align: center;
  }

  .row-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 2fr) minmax(0, 3fr) 28px;
    gap: 8px;
    align-items: center;
  }

  .col-2 {
    grid-column: span 1;
  }

  .col-3 {
    grid-column: span 1;
  }

  .logo-uploader {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .logo-preview {
    width: 220px;
    height: 72px;
    border: 1px solid #d7e1ed;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .logo-preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .logo-preview-empty {
    font-size: 12px;
    color: #94a3b8;
  }

  .logo-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-tip {
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;
  }

  .width-config {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  @media (max-width: 900px) {
    .row-grid {
      grid-template-columns: 1fr;
    }

    .logo-preview {
      width: 100%;
      max-width: 260px;
    }

    .width-config {
      align-items: stretch;
    }
  }
</style>
