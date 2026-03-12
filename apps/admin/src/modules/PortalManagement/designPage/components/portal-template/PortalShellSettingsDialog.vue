<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from "vue";
  import { CopyDocument } from "@element-plus/icons-vue";
  import { message } from "@one-base-template/ui";

  import type { PortalTab } from "../../../types";
  import {
    buildPortalTemplateDetailsSchemaPreview,
    createDefaultPortalTemplateDetails,
    parsePortalTemplateDetails,
    stringifyPortalTemplateDetails,
    type PortalTemplateDetails,
  } from "../../../utils/templateDetails";
  import PortalShellFooterSettingsForm from "./shell-settings/PortalShellFooterSettingsForm.vue";
  import PortalShellHeaderSettingsForm from "./shell-settings/PortalShellHeaderSettingsForm.vue";

  interface SelectOption {
    label: string;
    value: string;
  }

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
    (e: "submit" | "preview-change", payload: { details: string }): void;
  }>();

  defineOptions({
    name: "PortalShellSettingsDialog",
  });

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
  });

  const formState = ref<PortalTemplateDetails>(createDefaultPortalTemplateDetails());
  const activeTab = ref<"header" | "footer">("header");
  const jsonViewerVisible = ref(false);
  const syncingFromProps = ref(false);

  let previewTimer: ReturnType<typeof setTimeout> | null = null;
  const PREVIEW_DEBOUNCE_MS = 120;

  const previewTabCount = computed(() => (Array.isArray(props.tabs) ? props.tabs.length : 0));

  const pageTabOptions = computed<SelectOption[]>(() => {
    const options: SelectOption[] = [];

    const walk = (nodes: PortalTab[], parentNames: string[]) => {
      for (const node of nodes) {
        if (!node || typeof node !== "object") {
          continue;
        }
        const tabName = typeof node.tabName === "string" ? node.tabName.trim() : "";
        const nextParents = tabName ? [...parentNames, tabName] : parentNames;

        if (node.tabType === 2) {
          const tabId = typeof node.id === "string" || typeof node.id === "number" ? String(node.id) : "";
          if (tabId && tabName) {
            options.push({
              value: tabId,
              label: nextParents.join(" / "),
            });
          }
        }

        if (Array.isArray(node.children) && node.children.length > 0) {
          walk(node.children, nextParents);
        }
      }
    };

    walk(Array.isArray(props.tabs) ? props.tabs : [], []);
    return options;
  });

  function normalizeFormState(source: PortalTemplateDetails): PortalTemplateDetails {
    const normalized = parsePortalTemplateDetails(source);
    normalized.pageHeader = normalized.shell.header.enabled ? 1 : 0;
    normalized.pageFooter = normalized.shell.footer.enabled ? 1 : 0;
    normalized.shell.header.enabled = normalized.pageHeader === 1;
    normalized.shell.footer.enabled = normalized.pageFooter === 1;
    return normalized;
  }

  function buildDetailsByFormState(): string {
    return stringifyPortalTemplateDetails(normalizeFormState(formState.value));
  }

  const currentDetailsPrettyJson = computed(() => {
    try {
      return JSON.stringify(JSON.parse(buildDetailsByFormState()) as unknown, null, 2);
    } catch {
      return "{}";
    }
  });

  const schemaDetailsPrettyJson = computed(() => JSON.stringify(buildPortalTemplateDetailsSchemaPreview(), null, 2));

  function clearPreviewTimer() {
    if (!previewTimer) {
      return;
    }
    clearTimeout(previewTimer);
    previewTimer = null;
  }

  function emitPreviewChange() {
    emit("preview-change", { details: buildDetailsByFormState() });
  }

  function schedulePreviewChange() {
    if (!visible.value || syncingFromProps.value) {
      return;
    }
    clearPreviewTimer();
    previewTimer = setTimeout(() => {
      emitPreviewChange();
      previewTimer = null;
    }, PREVIEW_DEBOUNCE_MS);
  }

  function hydrateFromDetails(rawDetails?: string) {
    syncingFromProps.value = true;
    formState.value = parsePortalTemplateDetails(rawDetails || "");
    syncingFromProps.value = false;
  }

  function onCancel() {
    visible.value = false;
  }

  function onSubmit() {
    emit("submit", { details: buildDetailsByFormState() });
  }

  async function copyJson(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      message.success("已复制到剪贴板");
    } catch {
      message.error("复制失败，请手动复制");
    }
  }

  watch(
    () => visible.value,
    (opened) => {
      if (!opened) {
        clearPreviewTimer();
        jsonViewerVisible.value = false;
        return;
      }
      activeTab.value = "header";
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
    () => formState.value,
    () => {
      schedulePreviewChange();
    },
    { deep: true }
  );

  onBeforeUnmount(() => {
    clearPreviewTimer();
  });
</script>

<template>
  <el-dialog
    v-model="visible"
    class="shell-settings-dialog"
    title="门户页眉页脚配置"
    width="1120px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <section class="dialog-top">
      <div class="top-main">
        <div class="top-title">门户级壳层设置</div>
        <div class="top-sub-title">
          当前模板页面数：{{ previewTabCount }}。配置编辑时会实时驱动右侧预览，保存后统一写入 `details`。
        </div>
      </div>

      <div class="top-actions">
        <el-button size="small" :icon="CopyDocument" @click="jsonViewerVisible = true">查看数据结构</el-button>
      </div>
    </section>

    <el-tabs v-model="activeTab" class="tabs">
      <el-tab-pane name="header" label="页眉组件">
        <div class="tab-content">
          <PortalShellHeaderSettingsForm :form-state="formState" :page-tab-options="pageTabOptions" />
        </div>
      </el-tab-pane>

      <el-tab-pane name="footer" label="页脚组件">
        <div class="tab-content">
          <PortalShellFooterSettingsForm :form-state="formState" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="footer-actions">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" :loading="props.loading" @click="onSubmit">保存配置</el-button>
      </div>
    </template>
  </el-dialog>

  <el-drawer v-model="jsonViewerVisible" title="details 数据结构（只读）" size="56%" append-to-body destroy-on-close>
    <div class="json-panel-list">
      <section class="json-panel">
        <header class="json-header">
          <span>当前配置 JSON（即将写入 details）</span>
          <el-button text size="small" :icon="CopyDocument" @click="copyJson(currentDetailsPrettyJson)">复制</el-button>
        </header>
        <pre class="json-block">{{ currentDetailsPrettyJson }}</pre>
      </section>

      <section class="json-panel">
        <header class="json-header">
          <span>结构示例 JSON</span>
          <el-button text size="small" :icon="CopyDocument" @click="copyJson(schemaDetailsPrettyJson)">复制</el-button>
        </header>
        <pre class="json-block">{{ schemaDetailsPrettyJson }}</pre>
      </section>
    </div>
  </el-drawer>
</template>

<style scoped>
  .dialog-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
    padding: 12px 14px;
    border: 1px solid #dbe6f5;
    background: linear-gradient(128deg, #f7fbff 0%, #f4f8ff 48%, #ffffff 100%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.95),
      0 8px 24px -20px rgba(30, 64, 175, 0.35);
  }

  .top-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .top-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    letter-spacing: 0.02em;
  }

  .top-sub-title {
    font-size: 12px;
    line-height: 1.6;
    color: #475569;
  }

  .top-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .tabs {
    min-height: 560px;
  }

  .tab-content {
    max-height: 58vh;
    overflow: auto;
    padding-right: 4px;
  }

  .footer-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .json-panel-list {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    padding-bottom: 12px;
  }

  .json-panel {
    border: 1px solid #d8e4f3;
    background: #f8fbff;
    overflow: hidden;
  }

  .json-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid #d8e4f3;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    background: linear-gradient(180deg, #ffffff 0%, #f3f8ff 100%);
  }

  .json-block {
    margin: 0;
    padding: 12px;
    max-height: 34vh;
    overflow: auto;
    background: #f8fbff;
    color: #0f172a;
    font-size: 12px;
    line-height: 1.6;
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  }

  @media (max-width: 1200px) {
    .tab-content {
      max-height: 54vh;
    }
  }

  @media (max-width: 900px) {
    .dialog-top {
      flex-direction: column;
      align-items: stretch;
    }

    .top-actions {
      justify-content: flex-start;
    }
  }
</style>
