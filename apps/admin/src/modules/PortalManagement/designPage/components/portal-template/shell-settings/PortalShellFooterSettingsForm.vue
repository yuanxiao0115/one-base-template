<script setup lang="ts">
  import { computed } from "vue";
  import { Delete, Plus } from "@element-plus/icons-vue";

  import type { PortalTemplateDetails } from "../../../../utils/templateDetails";
  import PortalColorField from "../PortalColorField.vue";

  const props = defineProps<{
    formState: PortalTemplateDetails;
  }>();

  type ContainerWidthMode = "fixed" | "full";

  const footerContainerWidthMode = computed<ContainerWidthMode>({
    get() {
      return props.formState.shell.footer.tokens.containerWidth === "100%" ? "full" : "fixed";
    },
    set(mode) {
      if (mode === "full") {
        props.formState.shell.footer.tokens.containerWidth = "100%";
        return;
      }
      if (props.formState.shell.footer.tokens.containerWidth === "100%") {
        props.formState.shell.footer.tokens.containerWidth = 1200;
      }
    },
  });

  const footerContainerWidthPx = computed<number>({
    get() {
      const width = props.formState.shell.footer.tokens.containerWidth;
      return typeof width === "number" ? width : 1200;
    },
    set(value) {
      props.formState.shell.footer.tokens.containerWidth = Number.isFinite(value) ? value : 1200;
    },
  });

  function addFooterLink() {
    props.formState.shell.footer.content.links.push({
      label: "",
      url: "",
    });
  }

  function removeFooterLink(index: number) {
    props.formState.shell.footer.content.links.splice(index, 1);
  }
</script>

<template>
  <el-form :model="props.formState" label-position="top" class="settings-form">
    <ObCard class="settings-card" title="基础布局">
      <el-form-item label="启用页脚">
        <el-switch v-model="props.formState.shell.footer.enabled" />
      </el-form-item>

      <el-form-item label="布局模式">
        <el-select v-model="props.formState.shell.footer.behavior.fixedMode">
          <el-option label="静态布局" value="static" />
          <el-option label="吸底固定" value="fixed" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="props.formState.shell.footer.behavior.fixedMode === 'fixed'" label="固定可滚动">
        <el-switch v-model="props.formState.shell.footer.behavior.scrollableWhenFixed" />
      </el-form-item>

      <el-form-item label="高度(px)">
        <el-input-number v-model="props.formState.shell.footer.tokens.height" :min="56" :max="260" />
      </el-form-item>

      <el-form-item label="内容宽度模式">
        <el-select v-model="footerContainerWidthMode">
          <el-option label="固定宽度" value="fixed" />
          <el-option label="100%铺满" value="full" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="footerContainerWidthMode === 'fixed'" label="固定宽度(px)">
        <el-input-number v-model="footerContainerWidthPx" :min="320" :max="1920" controls-position="right" />
      </el-form-item>

      <el-form-item label="背景色">
        <PortalColorField v-model="props.formState.shell.footer.tokens.bgColor" />
      </el-form-item>

      <el-form-item label="主文字色">
        <PortalColorField v-model="props.formState.shell.footer.tokens.textColor" />
      </el-form-item>

      <el-form-item label="分割线色">
        <PortalColorField v-model="props.formState.shell.footer.tokens.borderTopColor" />
      </el-form-item>
    </ObCard>

    <ObCard class="settings-card" title="友情链接模块">
      <el-form-item label="显示友情链接">
        <el-switch v-model="props.formState.shell.footer.behavior.showLinks" />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.footer.behavior.showLinks" label="链接色">
        <PortalColorField v-model="props.formState.shell.footer.tokens.linkColor" />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.footer.behavior.showLinks" label="友情链接">
        <div class="rows-panel">
          <div class="rows-header">
            <span>每项支持名称和跳转地址</span>
            <el-button type="primary" plain size="small" :icon="Plus" @click="addFooterLink">新增链接</el-button>
          </div>

          <div v-if="!props.formState.shell.footer.content.links.length" class="empty">
            暂无链接项，请点击“新增链接”。
          </div>

          <div v-for="(item, index) in props.formState.shell.footer.content.links" :key="index" class="row-grid">
            <el-input v-model="item.label" maxlength="20" show-word-limit placeholder="链接名称" class="col-2" />
            <el-input
              v-model="item.url"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              maxlength="200"
              show-word-limit
              placeholder="链接地址"
              class="col-3"
            />
            <el-button text type="danger" :icon="Delete" @click="removeFooterLink(index)" />
          </div>
        </div>
      </el-form-item>
    </ObCard>

    <ObCard class="settings-card" title="备案与版权模块">
      <el-form-item label="显示备案信息">
        <el-switch v-model="props.formState.shell.footer.behavior.showRecord" />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.footer.behavior.showRecord" label="站点描述">
        <el-input
          v-model="props.formState.shell.footer.content.description"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 3 }"
          maxlength="120"
          show-word-limit
        />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.footer.behavior.showRecord" label="版权信息">
        <el-input
          v-model="props.formState.shell.footer.content.copyright"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 3 }"
          maxlength="120"
          show-word-limit
        />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.footer.behavior.showRecord" label="ICP备案号">
        <el-input v-model="props.formState.shell.footer.content.icp" maxlength="20" show-word-limit />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.footer.behavior.showRecord" label="公安备案号">
        <el-input v-model="props.formState.shell.footer.content.policeRecord" maxlength="20" show-word-limit />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.footer.behavior.showRecord" label="次文字色">
        <PortalColorField v-model="props.formState.shell.footer.tokens.mutedTextColor" />
      </el-form-item>
    </ObCard>

    <ObCard class="settings-card" title="联系模块">
      <el-form-item label="显示联系区">
        <el-switch v-model="props.formState.shell.footer.behavior.showContact" />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.footer.behavior.showContact" label="服务热线">
        <el-input v-model="props.formState.shell.footer.content.servicePhone" maxlength="20" show-word-limit />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.footer.behavior.showContact" label="服务邮箱">
        <el-input
          v-model="props.formState.shell.footer.content.serviceEmail"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 3 }"
          maxlength="80"
          show-word-limit
        />
      </el-form-item>

      <el-form-item v-if="props.formState.shell.footer.behavior.showContact" label="联系地址">
        <el-input
          v-model="props.formState.shell.footer.content.address"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          maxlength="120"
          show-word-limit
        />
      </el-form-item>
    </ObCard>
  </el-form>
</template>

<style scoped>
  .settings-form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .settings-card :deep(.ob-card__body .el-form-item) {
    margin-bottom: 12px;
  }

  .settings-card :deep(.ob-card__body .el-form-item:last-child) {
    margin-bottom: 0;
  }

  .settings-card :deep(.ob-card__body .el-form-item__label) {
    padding-bottom: 4px;
    font-size: 12px;
    color: #475569;
    line-height: 1.45;
  }

  .settings-card :deep(.ob-card__body .el-form-item__content) {
    min-height: 32px;
  }

  .settings-card :deep(.ob-card__body .el-form-item__content > .el-input),
  .settings-card :deep(.ob-card__body .el-form-item__content > .el-textarea),
  .settings-card :deep(.ob-card__body .el-form-item__content > .el-select),
  .settings-card :deep(.ob-card__body .el-form-item__content > .el-input-number),
  .settings-card :deep(.ob-card__body .el-form-item__content > .portal-color-field) {
    width: min(100%, 320px);
  }

  .settings-card :deep(.ob-card__body .el-form-item__content > .el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 12px;
  }

  .rows-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
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
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr) 28px;
    gap: 8px;
    align-items: start;
  }

  .col-2 {
    grid-column: span 1;
  }

  .col-3 {
    grid-column: span 1;
  }

  @media (max-width: 900px) {
    .row-grid {
      grid-template-columns: 1fr;
    }

    .settings-card :deep(.ob-card__body .el-form-item__content > .el-input),
    .settings-card :deep(.ob-card__body .el-form-item__content > .el-textarea),
    .settings-card :deep(.ob-card__body .el-form-item__content > .el-select),
    .settings-card :deep(.ob-card__body .el-form-item__content > .el-input-number),
    .settings-card :deep(.ob-card__body .el-form-item__content > .portal-color-field) {
      width: 100%;
    }
  }
</style>
