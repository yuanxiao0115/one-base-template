<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import type { FormInstance } from "element-plus";

  import type { PortalTab } from "../../types";
  import {
    createDefaultPortalTemplateDetails,
    parsePortalTemplateDetails,
    PORTAL_CUSTOM_HEADER_OPTIONS,
    PORTAL_FOOTER_VARIANT_OPTIONS,
    PORTAL_HEADER_VARIANT_OPTIONS,
    stringifyPortalTemplateDetails,
    type PortalTemplateDetails,
  } from "../../utils/templateDetails";

  const props = withDefaults(
    defineProps<{
      modelValue: boolean;
      loading?: boolean;
      details?: string;
      tabs?: PortalTab[];
    }>(),
    {
      loading: false,
      details: "",
      tabs: () => [],
    }
  );

  const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
    (e: "submit", payload: { details: string }): void;
  }>();

  defineOptions({
    name: "PortalShellSettingsDialog",
  });

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
  });

  const formRef = ref<FormInstance>();
  const formState = ref<PortalTemplateDetails>(createDefaultPortalTemplateDetails());

  const activeTab = ref<"header" | "footer" | "advanced">("header");

  const manualNavJson = ref("[]");
  const footerLinksJson = ref("[]");
  const advancedJson = ref("");
  const advancedDirty = ref(false);
  const syncingAdvanced = ref(false);

  const previewTabCount = computed(() => (Array.isArray(props.tabs) ? props.tabs.length : 0));

  function hydrateFromDetails(rawDetails?: string) {
    syncingAdvanced.value = true;
    const parsed = parsePortalTemplateDetails(rawDetails || "");
    formState.value = parsed;
    manualNavJson.value = JSON.stringify(parsed.shell.header.behavior.manualNavItems, null, 2);
    footerLinksJson.value = JSON.stringify(parsed.shell.footer.content.links, null, 2);
    advancedJson.value = JSON.stringify(parsed, null, 2);
    advancedDirty.value = false;
    syncingAdvanced.value = false;
  }

  function syncAdvancedJsonByForm() {
    syncingAdvanced.value = true;
    advancedJson.value = JSON.stringify(formState.value, null, 2);
    advancedDirty.value = false;
    syncingAdvanced.value = false;
  }

  function parseJsonArray<T>(jsonText: string, fallback: T[]): T[] {
    try {
      const raw = JSON.parse(jsonText) as unknown;
      return Array.isArray(raw) ? (raw as T[]) : fallback;
    } catch {
      return fallback;
    }
  }

  function applyManualJsonToForm() {
    formState.value.shell.header.behavior.manualNavItems = parseJsonArray(manualNavJson.value, []);
    formState.value.shell.footer.content.links = parseJsonArray(footerLinksJson.value, []);
  }

  function onCancel() {
    visible.value = false;
  }

  async function onSubmit() {
    const form = formRef.value;
    if (form) {
      const valid = await form.validate().catch(() => false);
      if (!valid) {
        return;
      }
    }

    applyManualJsonToForm();

    let next = parsePortalTemplateDetails(formState.value);
    if (advancedDirty.value) {
      next = parsePortalTemplateDetails(advancedJson.value);
      formState.value = next;
    }

    next.pageHeader = next.shell.header.enabled ? 1 : 0;
    next.pageFooter = next.shell.footer.enabled ? 1 : 0;

    const details = stringifyPortalTemplateDetails(next);
    emit("submit", { details });
  }

  watch(
    () => visible.value,
    (opened) => {
      if (!opened) {
        return;
      }
      hydrateFromDetails(props.details);
    },
    { immediate: true }
  );

  watch(
    () => props.details,
    (details) => {
      if (!visible.value) {
        return;
      }
      hydrateFromDetails(details);
    }
  );

  watch(
    () => formState.value.shell.header.enabled,
    (enabled) => {
      formState.value.pageHeader = enabled ? 1 : 0;
    }
  );

  watch(
    () => formState.value.shell.footer.enabled,
    (enabled) => {
      formState.value.pageFooter = enabled ? 1 : 0;
    }
  );

  watch(
    () => advancedJson.value,
    () => {
      if (visible.value && !syncingAdvanced.value) {
        advancedDirty.value = true;
      }
    }
  );
</script>

<template>
  <el-dialog
    v-model="visible"
    title="页眉页脚配置"
    width="980px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="tips">当前模板页面数：{{ previewTabCount }}。所有配置保存到 `details`，并通过 `template/update` 持久化。</div>

    <el-tabs v-model="activeTab" class="tabs">
      <el-tab-pane name="header" label="页眉">
        <el-form ref="formRef" :model="formState" label-width="120px" class="form">
          <el-form-item label="启用页眉">
            <el-switch v-model="formState.shell.header.enabled" />
          </el-form-item>

          <el-form-item label="页眉模式">
            <el-radio-group v-model="formState.shell.header.mode">
              <el-radio value="configurable">通用可配置</el-radio>
              <el-radio value="customComponent">独立组件</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="formState.shell.header.mode === 'configurable'" label="预设风格">
            <el-select v-model="formState.shell.header.variant" class="w-280">
              <el-option
                v-for="item in PORTAL_HEADER_VARIANT_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item v-else label="独立组件">
            <el-select v-model="formState.shell.header.customComponentKey" class="w-280" placeholder="请选择组件">
              <el-option
                v-for="item in PORTAL_CUSTOM_HEADER_OPTIONS"
                :key="item.key"
                :label="item.label"
                :value="item.key"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="背景色">
            <el-color-picker v-model="formState.shell.header.tokens.bgColor" />
          </el-form-item>

          <el-form-item label="文字色">
            <el-color-picker v-model="formState.shell.header.tokens.textColor" />
          </el-form-item>

          <el-form-item label="激活背景">
            <el-color-picker v-model="formState.shell.header.tokens.activeBgColor" />
          </el-form-item>

          <el-form-item label="激活文字">
            <el-color-picker v-model="formState.shell.header.tokens.activeTextColor" />
          </el-form-item>

          <el-form-item label="高度(px)">
            <el-input-number v-model="formState.shell.header.tokens.height" :min="40" :max="200" />
          </el-form-item>

          <el-form-item label="Logo URL">
            <el-input v-model="formState.shell.header.tokens.logo" placeholder="可选，输入图片地址" />
          </el-form-item>

          <el-form-item label="Logo宽度(px)">
            <el-input-number v-model="formState.shell.header.tokens.logoWidth" :min="40" :max="420" />
          </el-form-item>

          <el-form-item label="内容宽度(px)">
            <el-input-number v-model="formState.shell.header.tokens.containerWidth" :min="320" :max="1920" />
          </el-form-item>

          <el-form-item label="吸顶">
            <el-switch v-model="formState.shell.header.tokens.sticky" />
          </el-form-item>

          <el-form-item label="导航来源">
            <el-radio-group v-model="formState.shell.header.behavior.navSource">
              <el-radio value="tabTree">页面树</el-radio>
              <el-radio value="manual">手工导航</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="formState.shell.header.behavior.navSource === 'manual'" label="导航JSON">
            <el-input
              v-model="manualNavJson"
              type="textarea"
              :rows="5"
              placeholder='例如：[ {"label":"首页","tabId":"xxx"}, {"label":"外链","url":"https://..."} ]'
            />
          </el-form-item>

          <el-form-item label="显示用户区">
            <el-switch v-model="formState.shell.header.behavior.showUserCenter" />
          </el-form-item>

          <el-form-item label="顶部公告">
            <el-switch v-model="formState.shell.header.behavior.showTopNotice" />
          </el-form-item>

          <el-form-item v-if="formState.shell.header.behavior.showTopNotice" label="公告文案">
            <el-input v-model="formState.shell.header.behavior.topNoticeText" maxlength="120" show-word-limit />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane name="footer" label="页脚">
        <el-form :model="formState" label-width="120px" class="form">
          <el-form-item label="启用页脚">
            <el-switch v-model="formState.shell.footer.enabled" />
          </el-form-item>

          <el-form-item label="预设风格">
            <el-select v-model="formState.shell.footer.variant" class="w-280">
              <el-option
                v-for="item in PORTAL_FOOTER_VARIANT_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="背景色">
            <el-color-picker v-model="formState.shell.footer.tokens.bgColor" />
          </el-form-item>

          <el-form-item label="文字色">
            <el-color-picker v-model="formState.shell.footer.tokens.textColor" />
          </el-form-item>

          <el-form-item label="链接色">
            <el-color-picker v-model="formState.shell.footer.tokens.linkColor" />
          </el-form-item>

          <el-form-item label="顶部分割线">
            <el-color-picker v-model="formState.shell.footer.tokens.borderTopColor" />
          </el-form-item>

          <el-form-item label="高度(px)">
            <el-input-number v-model="formState.shell.footer.tokens.height" :min="48" :max="260" />
          </el-form-item>

          <el-form-item label="内容宽度(px)">
            <el-input-number v-model="formState.shell.footer.tokens.containerWidth" :min="320" :max="1920" />
          </el-form-item>

          <el-form-item label="固定模式">
            <el-radio-group v-model="formState.shell.footer.behavior.fixedMode">
              <el-radio value="static">静态</el-radio>
              <el-radio value="fixed">吸底</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="固定时可滚动">
            <el-switch v-model="formState.shell.footer.behavior.scrollableWhenFixed" />
          </el-form-item>

          <el-form-item label="说明文案">
            <el-input v-model="formState.shell.footer.content.description" />
          </el-form-item>

          <el-form-item label="版权信息">
            <el-input v-model="formState.shell.footer.content.copyright" />
          </el-form-item>

          <el-form-item label="ICP备案号">
            <el-input v-model="formState.shell.footer.content.icp" />
          </el-form-item>

          <el-form-item label="公安备案号">
            <el-input v-model="formState.shell.footer.content.policeRecord" />
          </el-form-item>

          <el-form-item label="友情链接JSON">
            <el-input
              v-model="footerLinksJson"
              type="textarea"
              :rows="5"
              placeholder='例如：[ {"label":"网站地图","url":"/sitemap"} ]'
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane name="advanced" label="高级JSON">
        <div class="advanced-toolbar">
          <el-button size="small" @click="syncAdvancedJsonByForm">从当前表单刷新JSON</el-button>
        </div>
        <el-input v-model="advancedJson" type="textarea" :rows="20" class="advanced-input" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" :loading="props.loading" @click="onSubmit">保存配置</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
  .tips {
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .tabs {
    min-height: 480px;
  }

  .form {
    padding: 4px 6px 0;
    max-height: 56vh;
    overflow: auto;
  }

  .w-280 {
    width: 280px;
  }

  .advanced-toolbar {
    margin-bottom: 10px;
  }

  .advanced-input :deep(textarea) {
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
    font-size: 12px;
    line-height: 1.5;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
