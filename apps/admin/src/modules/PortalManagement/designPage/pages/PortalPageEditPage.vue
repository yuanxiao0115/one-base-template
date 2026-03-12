<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { message } from "@one-base-template/ui";
  import {
    buildPortalPageLayoutForSave,
    createDefaultPortalPageSettingsV2,
    type PortalLayoutItem,
    type PortalPageSettingsV2,
    GridLayoutEditor,
    MaterialLibrary,
    normalizePortalPageSettingsV2,
    PropertyPanel,
    usePortalPageLayoutStore,
    validatePortalPageSettingsV2,
  } from "@one-base-template/portal-engine";

  import { portalApi, portalAuthorityApi } from "../../api";
  import PortalPageSettingsForm from "../components/page-settings/PortalPageSettingsForm.vue";
  import { useMaterials } from "../../materials/useMaterials";
  import { portalMaterialsRegistry } from "../../materials/registry/materials-registry";

  defineOptions({
    name: "PortalPageEditor",
  });

  interface BizResLike {
    code?: unknown;
    success?: unknown;
  }

  interface PageLayoutJson {
    settings?: unknown;
    component?: PortalLayoutItem[];
  }

  interface RoleOption {
    label: string;
    value: string;
  }

  const route = useRoute();
  const router = useRouter();

  const pageLayoutStore = usePortalPageLayoutStore();

  const { materialsMap } = useMaterials();
  const materialCategories = portalMaterialsRegistry.categories;

  const tabId = computed(() => {
    const v = route.query.tabId;
    return typeof v === "string" ? v : "";
  });

  const templateId = computed(() => {
    const id = route.query.id;
    if (typeof id === "string") {
      return id;
    }
    const templateId = route.query.templateId;
    return typeof templateId === "string" ? templateId : "";
  });

  const loading = ref(false);
  const saving = ref(false);
  const previewLoading = ref(false);
  const roleLoading = ref(false);
  const settingTab = ref<"settings" | "component">("settings");

  const tabName = ref("");
  const roleOptions = ref<RoleOption[]>([]);

  const pageSettingData = ref<PortalPageSettingsV2>(createDefaultPortalPageSettingsV2());

  function normalizeBizOk(res: BizResLike | null | undefined): boolean {
    const code = res?.code;
    const ok = res?.success === true || code === 0 || code === 200 || String(code) === "0" || String(code) === "200";
    return Boolean(ok);
  }

  function normalizeLayoutItems(input: unknown): PortalLayoutItem[] {
    if (!Array.isArray(input)) {
      return [];
    }
    return input
      .map((raw) => {
        if (!raw || typeof raw !== "object") {
          return null;
        }
        const item = raw as Record<string, unknown>;
        const iRaw = item.i;
        const i = typeof iRaw === "string" || typeof iRaw === "number" ? String(iRaw) : "";
        if (!i) {
          return null;
        }
        return {
          i,
          x: Number(item.x) || 0,
          y: Number(item.y) || 0,
          w: Number(item.w) || 1,
          h: Number(item.h) || 1,
          component: item.component as PortalLayoutItem["component"],
        } satisfies PortalLayoutItem;
      })
      .filter(Boolean) as PortalLayoutItem[];
  }

  function applyPageSettings(input: unknown, fallbackTitle: string): PortalPageSettingsV2 {
    const normalized = normalizePortalPageSettingsV2(input);
    if (!normalized.basic.pageTitle.trim()) {
      normalized.basic.pageTitle = fallbackTitle || "页面";
    }
    return normalized;
  }

  async function loadRoleOptions() {
    if (roleLoading.value || roleOptions.value.length > 0) {
      return;
    }

    roleLoading.value = true;
    try {
      const res = await portalAuthorityApi.listRoles();
      if (!normalizeBizOk(res)) {
        return;
      }
      const list = Array.isArray(res?.data) ? res.data : [];
      roleOptions.value = list
        .map((item) => {
          const value = typeof item?.id === "string" ? item.id : "";
          const label = typeof item?.roleName === "string" ? item.roleName : typeof item?.name === "string" ? item.name : "";
          if (!(value && label)) {
            return null;
          }
          return { label, value };
        })
        .filter(Boolean) as RoleOption[];
    } catch {
      roleOptions.value = [];
    } finally {
      roleLoading.value = false;
    }
  }

  function validateBeforeSave(): boolean {
    const issues = validatePortalPageSettingsV2(pageSettingData.value, {
      componentCount: pageLayoutStore.layoutItems.length,
    });
    if (issues.length === 0) {
      return true;
    }
    settingTab.value = "settings";
    message.warning(issues[0]?.message || "页面设置校验失败");
    return false;
  }

  async function loadTabDetail(id: string) {
    if (!id) {
      pageLayoutStore.reset();
      tabName.value = "新建页面";
      return;
    }

    loading.value = true;
    try {
      const res = await portalApi.tab.detail({ id });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "加载页面失败");
        pageLayoutStore.reset();
        return;
      }

      const tab = res?.data;
      tabName.value = tab?.tabName || "页面编辑";

      if (tab?.pageLayout) {
        try {
          const parsed = JSON.parse(tab.pageLayout) as PageLayoutJson;
          pageSettingData.value = applyPageSettings(parsed.settings, tabName.value);
          pageLayoutStore.updateLayoutItems(normalizeLayoutItems(parsed.component));
        } catch {
          pageSettingData.value = applyPageSettings(null, tabName.value);
          pageLayoutStore.updateLayoutItems([]);
        }
      } else {
        pageSettingData.value = applyPageSettings(null, tabName.value);
        pageLayoutStore.updateLayoutItems([]);
      }

      pageLayoutStore.deselectLayoutItem();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载页面失败";
      message.error(msg);
      pageSettingData.value = applyPageSettings(null, tabName.value);
      pageLayoutStore.reset();
    } finally {
      loading.value = false;
    }
  }

  async function savePage() {
    if (!tabId.value) {
      message.warning("缺少 tabId，无法保存");
      return false;
    }

    if (saving.value) {
      return false;
    }
    saving.value = true;

    try {
      pageSettingData.value = applyPageSettings(pageSettingData.value, tabName.value);
      if (!validateBeforeSave()) {
        return false;
      }

      const pageLayout = buildPortalPageLayoutForSave(pageSettingData.value, pageLayoutStore.layoutItems);

      const res = await portalApi.tab.update({
        id: tabId.value,
        tabName: tabName.value || "页面",
        pageLayout: JSON.stringify(pageLayout),
      });

      if (!normalizeBizOk(res)) {
        message.error(res?.message || "保存失败");
        return false;
      }

      message.success("保存成功");
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "保存失败";
      message.error(msg);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function previewPage() {
    if (!tabId.value) {
      message.warning("缺少 tabId，无法预览");
      return;
    }

    if (previewLoading.value) {
      return;
    }
    previewLoading.value = true;

    try {
      const ok = await savePage();
      if (!ok) {
        return;
      }

      const resolved = router.resolve({
        name: "PortalPreview",
        query: {
          tabId: tabId.value,
          templateId: templateId.value,
          previewMode: "live",
        },
      });
      window.open(resolved.href, "_blank", "noopener,noreferrer");
    } finally {
      previewLoading.value = false;
    }
  }

  function onBack() {
    if (templateId.value) {
      router.push({
        path: "/portal/design",
        query: {
          id: templateId.value,
          tabId: tabId.value,
        },
      });
      return;
    }
    router.push("/portal/setting");
  }

  watch(
    () => tabId.value,
    async (id) => {
      await loadTabDetail(id);
    },
    { immediate: true }
  );

  watch(
    () => pageSettingData.value.access.mode,
    (mode) => {
      if (mode === "role") {
        void loadRoleOptions();
      }
    },
    { immediate: true }
  );
</script>

<template>
  <div class="page">
    <div class="topbar">
      <div class="left topbar-block"><el-button class="toolbar-btn" @click="onBack">返回</el-button></div>
      <div class="center">
        <div class="title-row">
          <div class="title">{{ tabName || '页面编辑' }}</div>
          <div class="title-badge">页面设置工作台</div>
        </div>
        <div class="sub">tabId={{ tabId || '-' }} · templateId={{ templateId || '-' }}</div>
      </div>
      <div class="right topbar-block">
        <el-button class="toolbar-btn" :loading="saving" type="primary" @click="savePage">保存</el-button>
        <el-button class="toolbar-btn" :loading="previewLoading" @click="previewPage">预览</el-button>
      </div>
    </div>

    <div v-loading="loading" class="content">
      <MaterialLibrary :categories="materialCategories" />
      <div class="canvas">
        <GridLayoutEditor class="canvas-inner" :materials-map :scale="1" :loaded="!loading" :page-setting-data />
      </div>
      <div class="right-panel">
        <el-tabs v-model="settingTab" class="right-tabs">
          <el-tab-pane label="页面设置" name="settings">
            <PortalPageSettingsForm v-model="pageSettingData" :role-options="roleOptions" :role-loading="roleLoading" />
          </el-tab-pane>

          <el-tab-pane label="组件属性" name="component">
            <PropertyPanel :materials-map />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .page {
    --portal-line: #d7e0ec;
    --portal-line-strong: #c8d4e4;
    --portal-bg: #f1f4f9;
    --portal-pane-bg: #f8fbff;
    display: flex;
    width: 100%;
    height: 100%;
    min-height: 0;
    flex-direction: column;
    background: var(--portal-bg);
    overflow: hidden;
  }

  .topbar {
    display: grid;
    grid-template-columns: 180px minmax(0, 1fr) 220px;
    gap: 12px;
    box-sizing: border-box;
    height: 60px;
    align-items: center;
    border-bottom: 1px solid var(--portal-line-strong);
    padding: 0 16px;
    background: linear-gradient(90deg, #fbfdff 0%, #f3f8ff 58%, #fbfdff 100%);
  }

  .left,
  .right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .right {
    justify-content: flex-end;
  }

  .topbar-block {
    min-width: 0;
  }

  .toolbar-btn {
    height: 32px;
    min-width: 74px;
    border-radius: 4px;
  }

  .toolbar-btn:active {
    transform: translateY(1px);
  }

  .center {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .title-badge {
    width: fit-content;
    border: 1px solid rgb(37 99 235 / 22%);
    border-radius: 4px;
    padding: 1px 8px;
    font-size: 11px;
    font-weight: 600;
    line-height: 18px;
    color: rgb(29 78 216 / 95%);
    background: rgb(255 255 255 / 92%);
    white-space: nowrap;
  }

  .title {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sub {
    font-size: 12px;
    line-height: 1.2;
    color: var(--el-text-color-secondary);
    font-family: var(--el-font-family-monospace, "SFMono-Regular", "JetBrains Mono", Consolas, "Liberation Mono", Menlo, monospace);
    letter-spacing: 0.15px;
  }

  .content {
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr) 396px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background: linear-gradient(180deg, #f3f7fc 0%, #edf2f8 100%);
  }

  .content :deep(.material-library) {
    width: 100%;
    flex: 1 1 auto;
    border-right: 1px solid var(--portal-line);
    background: linear-gradient(180deg, #f9fbfe 0%, #f4f8fd 100%);
  }

  .content :deep(.material-library .header) {
    border-bottom: 1px solid #e2e9f3;
  }

  .content :deep(.material-library .material-card) {
    border-radius: 2px;
    border-color: #dde6f1;
    background: #fff;
    box-shadow: none;
  }

  .content :deep(.material-library .material-card:hover) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px -22px rgb(17 42 80 / 60%);
  }

  .canvas {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: 12px;
    background: linear-gradient(180deg, #f4f8fd 0%, #eef3f9 100%);
    overflow: hidden;
  }

  .canvas-inner {
    flex: 1;
    min-width: 0;
    min-height: 0;
    height: 100%;
  }

  .canvas :deep(.page-banner),
  .canvas :deep(.grid-container) {
    border-radius: 0;
    border-color: var(--portal-line);
  }

  .canvas :deep(.grid-item) {
    border-radius: 2px;
    box-shadow: 0 6px 16px -14px rgb(15 23 42 / 30%);
  }

  .right-panel {
    width: 396px;
    min-width: 396px;
    min-height: 0;
    border-left: 1px solid var(--portal-line);
    background: var(--portal-pane-bg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .right-tabs {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .right-tabs :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 12px;
    border-bottom: 1px solid #e2e9f3;
    background: linear-gradient(180deg, #fcfdff 0%, #f6f9fe 100%);
  }

  .right-tabs :deep(.el-tabs__content) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .right-tabs :deep(.el-tab-pane) {
    height: 100%;
    min-height: 0;
  }

  .right-tabs :deep(.el-tabs__item) {
    height: 48px;
    line-height: 48px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
  }

  .right-tabs :deep(.el-tabs__item.is-active) {
    font-weight: 700;
    color: var(--el-color-primary);
  }

  .right-tabs :deep(.el-tabs__active-bar) {
    height: 2px;
    border-radius: 999px;
  }

  @media (max-width: 1600px) {
    .content {
      grid-template-columns: 248px minmax(0, 1fr) 376px;
    }

    .right-panel {
      width: 376px;
      min-width: 376px;
    }
  }

  @media (max-width: 1360px) {
    .topbar {
      grid-template-columns: 160px minmax(0, 1fr) 240px;
    }

    .title-badge {
      display: none;
    }

    .right-panel {
      width: 352px;
      min-width: 352px;
    }

    .content {
      grid-template-columns: 236px minmax(0, 1fr) 352px;
    }
  }

  @media (max-width: 1200px) {
    .canvas {
      padding: 10px;
    }

    .right-panel {
      width: 336px;
      min-width: 336px;
    }

    .content {
      grid-template-columns: 220px minmax(0, 1fr) 336px;
    }

  }
</style>
