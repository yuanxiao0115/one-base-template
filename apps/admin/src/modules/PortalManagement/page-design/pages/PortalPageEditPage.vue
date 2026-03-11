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
      <div class="left"><el-button @click="onBack">返回</el-button></div>
      <div class="center">
        <div class="title">{{ tabName || '页面编辑' }}</div>
        <div class="sub">tabId={{ tabId || '-' }}/ templateId={{ templateId || '-' }}</div>
      </div>
      <div class="right">
        <el-button :loading="saving" type="primary" @click="savePage">保存</el-button>
        <el-button :loading="previewLoading" @click="previewPage">预览</el-button>
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
            <div class="settings-scroll">
              <section class="settings-group">
                <div class="group-title">基础信息</div>
                <el-form label-position="top">
                  <el-form-item label="页面标题">
                    <el-input v-model="pageSettingData.basic.pageTitle" maxlength="80" show-word-limit placeholder="请输入页面标题" />
                  </el-form-item>
                  <el-form-item label="页面别名（slug）">
                    <el-input v-model="pageSettingData.basic.slug" maxlength="80" show-word-limit placeholder="如：workbench-home" />
                  </el-form-item>
                  <el-form-item label="页面可见性">
                    <el-switch v-model="pageSettingData.basic.isVisible" active-text="显示" inactive-text="隐藏" />
                  </el-form-item>
                </el-form>
              </section>

              <section class="settings-group">
                <div class="group-title">布局网格</div>
                <el-form label-position="top">
                  <el-form-item label="栅格列数">
                    <el-input-number v-model="pageSettingData.layout.colNum" :min="1" :max="48" controls-position="right" />
                  </el-form-item>
                  <el-form-item label="列间距">
                    <el-input-number v-model="pageSettingData.layout.colSpace" :min="0" :max="200" controls-position="right" />
                  </el-form-item>
                  <el-form-item label="行间距">
                    <el-input-number v-model="pageSettingData.layout.rowSpace" :min="0" :max="200" controls-position="right" />
                  </el-form-item>
                </el-form>
              </section>

              <section class="settings-group">
                <div class="group-title">访问控制</div>
                <el-form label-position="top">
                  <el-form-item label="访问方式">
                    <el-radio-group v-model="pageSettingData.access.mode">
                      <el-radio value="public">公开</el-radio>
                      <el-radio value="login">登录可见</el-radio>
                      <el-radio value="role">角色可见</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item v-if="pageSettingData.access.mode === 'role'" label="可访问角色">
                    <el-select
                      v-model="pageSettingData.access.roleIds"
                      multiple
                      clearable
                      filterable
                      collapse-tags
                      collapse-tags-tooltip
                      placeholder="请选择角色"
                      :loading="roleLoading"
                    >
                      <el-option v-for="role in roleOptions" :key="role.value" :label="role.label" :value="role.value" />
                    </el-select>
                  </el-form-item>
                </el-form>
              </section>

              <section class="settings-group">
                <div class="group-title">发布校验</div>
                <el-form label-position="top">
                  <el-form-item label="发布时要求页面标题">
                    <el-switch v-model="pageSettingData.publishGuard.requireTitle" active-text="开启" inactive-text="关闭" />
                  </el-form-item>
                  <el-form-item label="发布时要求页面有组件内容">
                    <el-switch v-model="pageSettingData.publishGuard.requireContent" active-text="开启" inactive-text="关闭" />
                  </el-form-item>
                </el-form>
              </section>
            </div>
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
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
  }

  .topbar {
    display: grid;
    grid-template-columns: 260px 1fr 360px;
    gap: 12px;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding: 10px 12px;
    background: var(--el-bg-color-overlay);
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

  .center {
    min-width: 0;
    text-align: center;
  }

  .title {
    font-size: 14px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sub {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .content {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .canvas {
    display: flex;
    flex: 1;
    min-width: 0;
    padding: 12px;
    background: var(--el-bg-color-page);
  }

  .canvas-inner {
    flex: 1;
    min-width: 0;
  }

  .right-panel {
    width: 380px;
    min-width: 380px;
    border-left: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color-overlay);
  }

  .right-tabs {
    height: 100%;
  }

  .right-tabs :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .right-tabs :deep(.el-tabs__content) {
    height: calc(100% - 49px);
  }

  .right-tabs :deep(.el-tab-pane) {
    height: 100%;
  }

  .settings-scroll {
    overflow: auto;
    height: 100%;
    padding: 12px;
  }

  .settings-group {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    margin-bottom: 12px;
    padding: 10px 12px 2px;
    background: var(--el-bg-color);
  }

  .group-title {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }
</style>
