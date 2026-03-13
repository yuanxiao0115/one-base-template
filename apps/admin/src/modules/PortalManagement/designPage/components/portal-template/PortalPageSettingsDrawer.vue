<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from "vue";
  import {
    createDefaultPortalPageSettingsV2,
    normalizePortalPageSettingsV2,
    type PortalPageSettingsV2,
  } from "@one-base-template/portal-engine";

  import type { PortalTab } from "../../../types";
  import {
    createDefaultPortalTemplateDetails,
    normalizeTabId,
    parsePortalTemplateDetails,
    resolvePortalShellForTab,
    stringifyPortalTemplateDetails,
    type PortalPageShellOverride,
    type PortalTemplateDetails,
  } from "../../../utils/templateDetails";
  import PortalPageSettingsForm from "../page-settings/PortalPageSettingsForm.vue";
  import PortalShellFooterSettingsForm from "./shell-settings/PortalShellFooterSettingsForm.vue";
  import PortalShellHeaderSettingsForm from "./shell-settings/PortalShellHeaderSettingsForm.vue";

  interface SelectOption {
    label: string;
    value: string;
  }

  const props = withDefaults(
    defineProps<{
      modelValue: boolean;
      activeTab?: "layout" | "advanced" | "header" | "footer";
      loading?: boolean;
      shellLoading?: boolean;
      pageName?: string;
      settings?: PortalPageSettingsV2 | null;
      details?: string;
      tabs?: PortalTab[];
      currentTabId?: string;
    }>(),
    {
      activeTab: "layout",
      loading: false,
      shellLoading: false,
      pageName: "",
      settings: null,
      details: "",
      tabs: () => [],
      currentTabId: "",
    }
  );

  const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
    (e: "update:activeTab", value: "layout" | "advanced" | "header" | "footer"): void;
    (e: "submit" | "preview-change", settings: PortalPageSettingsV2): void;
    (e: "submit-shell" | "preview-shell-change", payload: { details: string }): void;
  }>();

  defineOptions({
    name: "PortalPageSettingsDrawer",
  });

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
  });

  const activeTabModel = computed({
    get: () => props.activeTab,
    set: (value: "layout" | "advanced" | "header" | "footer") => emit("update:activeTab", value),
  });

  const submitLoading = computed(() =>
    activeTabModel.value === "header" || activeTabModel.value === "footer" ? props.shellLoading : props.loading
  );
  const submitText = computed(() => {
    if (activeTabModel.value === "layout") {
      return "保存基础设置";
    }
    if (activeTabModel.value === "advanced") {
      return "保存高级设置";
    }
    if (activeTabModel.value === "header") {
      return "保存页眉设置";
    }
    return "保存页脚设置";
  });

  const syncingLayout = ref(false);
  const formState = ref<PortalPageSettingsV2>(createDefaultPortalPageSettingsV2());

  function buildDraftSettings(source?: PortalPageSettingsV2 | null): PortalPageSettingsV2 {
    return JSON.parse(JSON.stringify(normalizePortalPageSettingsV2(source ?? createDefaultPortalPageSettingsV2()))) as PortalPageSettingsV2;
  }

  function hydrateLayoutFromProps() {
    syncingLayout.value = true;
    formState.value = buildDraftSettings(props.settings);
    if (!formState.value.basic.pageTitle.trim() && props.pageName) {
      formState.value.basic.pageTitle = props.pageName;
    }
    syncingLayout.value = false;
  }

  function onCancel() {
    visible.value = false;
  }

  function onSubmitCurrent() {
    if (activeTabModel.value === "layout" || activeTabModel.value === "advanced") {
      emit("submit", normalizePortalPageSettingsV2(formState.value));
      return;
    }
    emit("submit-shell", { details: buildDetailsByFormState() });
  }

  const baseDetailsState = ref<PortalTemplateDetails>(createDefaultPortalTemplateDetails());
  const overrideDraftState = ref<PortalTemplateDetails>(createDefaultPortalTemplateDetails());
  const headerOverrideEnabled = ref(false);
  const footerOverrideEnabled = ref(false);
  const syncingShell = ref(false);

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

  function emitShellPreviewChange() {
    emit("preview-shell-change", { details: buildDetailsByFormState() });
  }

  function scheduleShellPreviewChange() {
    if (!visible.value || syncingShell.value) {
      return;
    }
    clearPreviewTimer();
    previewTimer = setTimeout(() => {
      emitShellPreviewChange();
      previewTimer = null;
    }, PREVIEW_DEBOUNCE_MS);
  }

  function hydrateShellFromProps(rawDetails?: string) {
    syncingShell.value = true;

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

    syncingShell.value = false;
  }

  watch(
    () => visible.value,
    (opened) => {
      if (!opened) {
        clearPreviewTimer();
        return;
      }
      hydrateLayoutFromProps();
      hydrateShellFromProps(props.details);
    },
    { immediate: true }
  );

  watch(
    () => props.settings,
    () => {
      if (!visible.value) {
        return;
      }
      hydrateLayoutFromProps();
    }
  );

  watch(
    () => [props.details, props.currentTabId] as const,
    ([details]) => {
      if (!visible.value) {
        return;
      }
      hydrateShellFromProps(details);
    }
  );

  watch(
    formState,
    (value) => {
      if (!visible.value || syncingLayout.value) {
        return;
      }
      emit("preview-change", normalizePortalPageSettingsV2(value));
    },
    { deep: true }
  );

  watch([headerOverrideEnabled, footerOverrideEnabled] as const, () => {
    scheduleShellPreviewChange();
  });

  watch(
    overrideDraftState,
    () => {
      scheduleShellPreviewChange();
    },
    { deep: true }
  );

  onBeforeUnmount(() => {
    clearPreviewTimer();
  });
</script>

<template>
  <ObCrudContainer
    v-model="visible"
    class="page-settings-drawer"
    container="drawer"
    mode="edit"
    :title="`页面配置 ${currentPageLabel}`"
    :loading="submitLoading"
    :confirm-text="submitText"
    :drawer-size="400"
    :close-on-click-modal="false"
    destroy-on-close
    @confirm="onSubmitCurrent"
    @cancel="onCancel"
    @close="onCancel"
  >
    <section class="drawer-body">
      <el-tabs v-model="activeTabModel" class="drawer-tabs">
        <el-tab-pane name="layout" label="基础设置">
          <div class="tab-content">
            <PortalPageSettingsForm
              v-model="formState"
              :show-basic-info="false"
              section-mode="basic"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="advanced" label="高级设置">
          <div class="tab-content">
            <PortalPageSettingsForm
              v-model="formState"
              :show-basic-info="false"
              section-mode="advanced"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="header" label="页眉设置">
          <div class="tab-content">
            <div class="tab-switch-card" :class="{ 'is-active': headerOverrideEnabled }">
              <div class="switch-meta">
                <div class="switch-label">启用页眉覆盖</div>
                <span class="switch-state" :class="{ 'is-active': headerOverrideEnabled }">
                  {{ headerOverrideEnabled ? "当前页面使用独立页眉" : "当前页面继承门户页眉" }}
                </span>
              </div>
              <el-switch v-model="headerOverrideEnabled" />
            </div>
            <el-empty
              v-if="!headerOverrideEnabled"
              class="dialog-empty"
              description="未启用页眉设置，当前页面将继承门户默认页眉。"
            />
            <div v-else class="tab-panel-scroll">
              <PortalShellHeaderSettingsForm :form-state="overrideDraftState" :page-tab-options="pageTabOptions" />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="footer" label="页脚设置">
          <div class="tab-content">
            <div class="tab-switch-card" :class="{ 'is-active': footerOverrideEnabled }">
              <div class="switch-meta">
                <div class="switch-label">启用页脚覆盖</div>
                <span class="switch-state" :class="{ 'is-active': footerOverrideEnabled }">
                  {{ footerOverrideEnabled ? "当前页面使用独立页脚" : "当前页面继承门户页脚" }}
                </span>
              </div>
              <el-switch v-model="footerOverrideEnabled" />
            </div>
            <el-empty
              v-if="!footerOverrideEnabled"
              class="dialog-empty"
              description="未启用页脚设置，当前页面将继承门户默认页脚。"
            />
            <div v-else class="tab-panel-scroll">
              <PortalShellFooterSettingsForm :form-state="overrideDraftState" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>

  </ObCrudContainer>
</template>

<style scoped>
  .page-settings-drawer :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 14px 16px 10px;
    border-bottom: 1px solid #e7edf6;
  }

  .page-settings-drawer :deep(.el-drawer__title) {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }

  .page-settings-drawer :deep(.el-drawer__body) {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    background: #f5f7fa;
  }

  .page-settings-drawer :deep(.el-drawer__footer) {
    padding: 10px 12px 12px;
    border-top: 1px solid #e7edf6;
  }

  .page-settings-drawer :deep(.ob-card) {
    margin-bottom: 12px;
    padding: 14px;
  }

  .page-settings-drawer :deep(.ob-card__header) {
    margin-bottom: 10px;
  }

  .drawer-top-card {
    margin-bottom: 0 !important;
  }

  .drawer-sub-title {
    margin: 0;
    font-size: 12px;
    color: #475569;
    line-height: 1.5;
  }

  .drawer-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .drawer-tabs {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .drawer-tabs :deep(.el-tabs__header) {
    margin: 0 0 8px;
  }

  .drawer-tabs :deep(.el-tabs__item) {
    height: 34px;
    line-height: 34px;
    font-size: 13px;
  }

  .drawer-tabs :deep(.el-tabs__content) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .drawer-tabs :deep(.el-tab-pane) {
    height: 100%;
    min-height: 0;
  }

  .tab-switch-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid #d9e3f2;
    border-radius: 4px;
    background: #fff;
    flex-shrink: 0;
  }

  .tab-switch-card.is-active {
    border-color: color-mix(in srgb, var(--el-color-primary) 36%, #d9e3f2);
    background: #f8fbff;
  }

  .switch-meta {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .switch-label {
    font-size: 12px;
    font-weight: 500;
    color: #334155;
  }

  .switch-state {
    font-size: 11px;
    line-height: 1.2;
    color: #94a3b8;
  }

  .switch-state.is-active {
    color: var(--el-color-primary);
    font-weight: 600;
  }

  .dialog-empty {
    min-height: 180px;
    border: 1px dashed #dbe6f5;
    border-radius: 4px;
    background: #fff;
    margin: 0;
  }

  .tab-content {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    padding: 2px 0 0;
  }

  .tab-panel-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .tab-content :deep(.settings-scroll) {
    padding: 0;
    background: transparent;
  }
</style>
