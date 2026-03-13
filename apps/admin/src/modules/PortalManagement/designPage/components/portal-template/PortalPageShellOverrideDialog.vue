<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from "vue";

  import type { PortalTab } from "../../../types";
  import {
    createDefaultPortalTemplateDetails,
    normalizeTabId,
    parsePortalTemplateDetails,
    resolvePortalShellForTab,
    stringifyPortalTemplateDetails,
    type PortalPageShellOverride,
    type PortalTemplateDetails,
  } from "@one-base-template/portal-engine";
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
      currentTabId: string;
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
    name: "PortalPageShellOverrideDialog",
  });

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
  });

  const baseDetailsState = ref<PortalTemplateDetails>(createDefaultPortalTemplateDetails());
  const overrideDraftState = ref<PortalTemplateDetails>(createDefaultPortalTemplateDetails());
  const activeTab = ref<"header" | "footer">("header");
  const headerOverrideEnabled = ref(false);
  const footerOverrideEnabled = ref(false);
  const syncingFromProps = ref(false);

  let previewTimer: ReturnType<typeof setTimeout> | null = null;
  const PREVIEW_DEBOUNCE_MS = 120;

  function deepCopy<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  const pageTabOptions = computed<SelectOption[]>(() => {
    const options: SelectOption[] = [];

    const walk = (nodes: PortalTab[], parentNames: string[]) => {
      for (const node of nodes) {
        if (!node || typeof node !== "object") {
          continue;
        }
        const tabName = typeof node.tabName === "string" ? node.tabName.trim() : "";
        const nextParents = tabName ? [...parentNames, tabName] : parentNames;
        const tabId = normalizeTabId(node.id);

        if (node.tabType === 2 && tabId && tabName) {
          options.push({
            value: tabId,
            label: nextParents.join(" / "),
          });
        }

        if (Array.isArray(node.children) && node.children.length > 0) {
          walk(node.children, nextParents);
        }
      }
    };

    walk(Array.isArray(props.tabs) ? props.tabs : [], []);
    return options;
  });

  const currentPageLabel = computed(() => {
    const tabId = normalizeTabId(props.currentTabId);
    if (!tabId) {
      return "未选择页面";
    }
    return pageTabOptions.value.find((item) => item.value === tabId)?.label ?? `页面 ${tabId}`;
  });

  function clearPreviewTimer() {
    if (!previewTimer) {
      return;
    }
    clearTimeout(previewTimer);
    previewTimer = null;
  }

  function buildDetailsByFormState(): string {
    const next = parsePortalTemplateDetails(baseDetailsState.value);
    const tabId = normalizeTabId(props.currentTabId);

    if (!tabId) {
      return stringifyPortalTemplateDetails(next);
    }

    if (!(headerOverrideEnabled.value || footerOverrideEnabled.value)) {
      delete next.pageOverrides[tabId];
      return stringifyPortalTemplateDetails(next);
    }

    const override: PortalPageShellOverride = {
      headerOverrideEnabled: headerOverrideEnabled.value,
      footerOverrideEnabled: footerOverrideEnabled.value,
    };

    if (headerOverrideEnabled.value) {
      override.header = deepCopy(overrideDraftState.value.shell.header);
    }
    if (footerOverrideEnabled.value) {
      override.footer = deepCopy(overrideDraftState.value.shell.footer);
    }

    next.pageOverrides[tabId] = override;
    return stringifyPortalTemplateDetails(next);
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

    const parsed = parsePortalTemplateDetails(rawDetails || "");
    const tabId = normalizeTabId(props.currentTabId);
    const override = tabId ? parsed.pageOverrides[tabId] : undefined;
    const resolved = resolvePortalShellForTab(parsed, tabId);

    baseDetailsState.value = parsed;
    overrideDraftState.value = createDefaultPortalTemplateDetails();
    overrideDraftState.value.shell.header = deepCopy(resolved.header);
    overrideDraftState.value.shell.footer = deepCopy(resolved.footer);
    headerOverrideEnabled.value = Boolean(override?.headerOverrideEnabled);
    footerOverrideEnabled.value = Boolean(override?.footerOverrideEnabled);

    syncingFromProps.value = false;
  }

  function onCancel() {
    visible.value = false;
  }

  function onSubmit() {
    emit("submit", { details: buildDetailsByFormState() });
  }

  watch(
    () => visible.value,
    (opened) => {
      if (!opened) {
        clearPreviewTimer();
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
    () => props.currentTabId,
    () => {
      if (!visible.value) {
        return;
      }
      hydrateFromDetails(props.details);
    }
  );

  watch(
    [headerOverrideEnabled, footerOverrideEnabled],
    ([enableHeader, enableFooter]) => {
      if (!(enableHeader || enableFooter)) {
        activeTab.value = "header";
        return;
      }
      if (enableHeader) {
        activeTab.value = "header";
        return;
      }
      activeTab.value = "footer";
    }
  );

  watch([headerOverrideEnabled, footerOverrideEnabled] as const, () => {
    schedulePreviewChange();
  });

  watch(
    overrideDraftState,
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
    class="page-shell-override-dialog"
    title="页面级页眉页脚覆盖"
    width="1120px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <section class="dialog-top">
      <div class="top-main">
        <div class="top-title">当前页面：{{ currentPageLabel }}</div>
        <div class="top-sub-title">覆盖配置仅对当前页面生效。保存后写入 `details.pageOverrides[tabId]`。</div>
      </div>
    </section>

    <section class="switch-panel">
      <div class="switch-item">
        <div class="switch-label">启用页眉覆盖</div>
        <el-switch v-model="headerOverrideEnabled" />
      </div>
      <div class="switch-item">
        <div class="switch-label">启用页脚覆盖</div>
        <el-switch v-model="footerOverrideEnabled" />
      </div>
    </section>

    <el-empty
      v-if="!(headerOverrideEnabled || footerOverrideEnabled)"
      class="dialog-empty"
      description="当前页面未启用壳层覆盖，将完全继承门户默认页眉页脚。"
    />

    <el-tabs v-else v-model="activeTab" class="tabs">
      <el-tab-pane v-if="headerOverrideEnabled" name="header" label="页眉覆盖">
        <div class="tab-content">
          <PortalShellHeaderSettingsForm :form-state="overrideDraftState" :page-tab-options="pageTabOptions" />
        </div>
      </el-tab-pane>

      <el-tab-pane v-if="footerOverrideEnabled" name="footer" label="页脚覆盖">
        <div class="tab-content">
          <PortalShellFooterSettingsForm :form-state="overrideDraftState" />
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
  }

  .top-sub-title {
    font-size: 12px;
    line-height: 1.6;
    color: #475569;
  }

  .switch-panel {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 12px;
  }

  .switch-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid #dbe6f5;
    background: #f8fbff;
  }

  .switch-label {
    font-size: 13px;
    font-weight: 500;
    color: #1e293b;
  }

  .dialog-empty {
    min-height: 240px;
    border: 1px dashed #dbe6f5;
    background: #f8fbff;
    margin-bottom: 12px;
  }

  .tabs {
    min-height: 520px;
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

  @media (max-width: 1200px) {
    .tab-content {
      max-height: 54vh;
    }
  }

  @media (max-width: 900px) {
    .switch-panel {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
