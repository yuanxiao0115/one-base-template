<script setup lang="ts">
  import { computed, nextTick, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { message } from "@one-base-template/ui";
  import { confirm } from "@one-base-template/ui";
  import {
    buildPortalPageLayoutForSave,
    createDefaultPortalPageSettingsV2,
    type PortalPageSettingsV2,
  } from "@one-base-template/portal-engine";

  import { portalApi, portalAuthorityApi } from "../../api";
  import type { BizResponse, PortalTab, PortalTemplate } from "../../types";
  import {
    PREVIEW_MODE_SAFE,
    PREVIEW_VIEWPORT_DEFAULT,
    type PortalPreviewMode,
    type PortalPreviewViewport,
  } from "../../utils/preview";
  import {
    calcNextSort,
    containsTabId,
    findFirstPageTabId,
    findTabById,
    isPortalTabEditable,
    normalizeIdLike,
    normalizeParentId,
    normalizeTabName,
  } from "../../utils/portalTree";
  import { usePortalCurrentTabActions } from "../composables/portal-template/usePortalCurrentTabActions";
  import {
    loadPortalTabPageSettings,
    savePortalTabPageSettings,
  } from "../composables/portal-template/usePortalTabPageSettings";

  import PagePermissionDialog from "../components/portal-template/PagePermissionDialog.vue";
  import PortalDesignerActionStrip from "../components/portal-template/PortalDesignerActionStrip.vue";
  import PortalDesignerHeaderBar from "../components/portal-template/PortalDesignerHeaderBar.vue";
  import PortalPageSettingsDrawer from "../components/portal-template/PortalPageSettingsDrawer.vue";
  import PortalPageShellOverrideDialog from "../components/portal-template/PortalPageShellOverrideDialog.vue";
  import PortalDesignerPreviewFrame from "../components/portal-template/PortalDesignerPreviewFrame.vue";
  import PortalShellSettingsDialog from "../components/portal-template/PortalShellSettingsDialog.vue";
  import PortalDesignerTreePanel from "../components/portal-template/PortalDesignerTreePanel.vue";
  import TabAttributeDialog from "../components/portal-template/TabAttributeDialog.vue";

  defineOptions({
    name: "PortalDesigner",
  });

  const route = useRoute();
  const router = useRouter();

  const templateId = computed(() => {
    const id = route.query.id;
    if (typeof id === "string") {
      return id;
    }
    const templateId = route.query.templateId;
    return typeof templateId === "string" ? templateId : "";
  });

  const routeTabId = computed(() => {
    const v = route.query.tabId;
    return typeof v === "string" ? v : "";
  });

  const loading = ref(false);
  const creating = ref(false);

  const templateInfo = ref<PortalTemplate | null>(null);
  const currentTabId = ref("");

  const attrVisible = ref(false);
  const attrMode = ref<"create" | "edit">("create");
  const attrLoading = ref(false);
  const attrInitial = ref<Partial<PortalTab>>({});
  const attrParentId = ref<number | string>(0);
  const editingTabId = ref("");
  const editingTabType = ref<number | null>(null);

  const permissionVisible = ref(false);
  const permissionLoading = ref(false);
  const permissionInitial = ref<Partial<PortalTab>>({});
  const pageSettingsVisible = ref(false);
  const pageSettingsLoading = ref(false);
  const pageSettingsSaving = ref(false);
  const pageSettingsForm = ref<PortalPageSettingsV2 | null>(null);
  const roleLoading = ref(false);
  const roleOptions = ref<Array<{ label: string; value: string }>>([]);
  const shellSettingVisible = ref(false);
  const shellSettingSaving = ref(false);
  const shellSettingSavedInThisRound = ref(false);
  const pageShellSettingVisible = ref(false);
  const pageShellSettingSaving = ref(false);
  const pageShellSettingSavedInThisRound = ref(false);
  const sortingTabs = ref(false);
  const previewMode = ref<PortalPreviewMode>(PREVIEW_MODE_SAFE);
  const previewViewport = ref<PortalPreviewViewport>(PREVIEW_VIEWPORT_DEFAULT);
  const previewScale = ref(1);
  const previewInteractionMode = ref<"auto" | "manual">("auto");
  const shellPreviewDetailsDraft = ref("");
  const pageShellPreviewDetailsDraft = ref("");

  interface PreviewFrameExpose {
    postMessageToFrame: (message: unknown) => boolean;
    setInteractionMode: (mode: "auto" | "manual") => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
  }

  const previewFrameRef = ref<PreviewFrameExpose | null>(null);

  type BizResLike = Pick<BizResponse<unknown>, "code" | "message" | "success">;

  function normalizeBizOk(res: BizResLike | null | undefined): boolean {
    const code = res?.code;
    return res?.success === true || code === 0 || code === 200 || String(code) === "0" || String(code) === "200";
  }

  function getTabs(): PortalTab[] {
    return templateInfo.value?.tabList ?? [];
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
        .filter(Boolean) as Array<{ label: string; value: string }>;
    } catch {
      roleOptions.value = [];
    } finally {
      roleLoading.value = false;
    }
  }

  const currentTab = computed(() => findTabById(getTabs(), currentTabId.value));
  const currentTabName = computed(() => {
    const value = currentTab.value?.tabName;
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    return "未命名页面";
  });
  const {
    editCurrentTab,
    openCurrentPageSettings,
    openCurrentPermission,
    toggleCurrentTabHide,
    deleteCurrentTab,
    openPreviewWindow,
  } = usePortalCurrentTabActions({
    router,
    templateId,
    currentTabId,
    currentTab,
    previewMode,
    notifyWarning: (msg) => message.warning(msg),
    onEditTab: onEdit,
    onOpenPageSettings: openPageSettingsDrawer,
    onOpenAttribute: openAttribute,
    onOpenPermission: openPermissionDialog,
    onToggleHide: toggleHide,
    onDeleteTab: deleteTab,
  });

  const previewFrameSrc = computed(() => {
    if (!(templateId.value && currentTabId.value)) {
      return "";
    }
    return router.resolve({
      name: "PortalPreview",
      query: {
        templateId: templateId.value,
        tabId: currentTabId.value,
        previewMode: previewMode.value,
      },
    }).href;
  });

  function postShellPreviewDetails(details: string) {
    if (!templateId.value) {
      return;
    }
    if (!currentTabId.value) {
      return;
    }

    previewFrameRef.value?.postMessageToFrame({
      type: "preview-shell-details",
      data: {
        details,
        templateId: templateId.value,
        tabId: currentTabId.value,
      },
    });
  }

  function postPreviewViewport() {
    if (!(templateId.value && currentTabId.value)) {
      return;
    }
    previewFrameRef.value?.postMessageToFrame({
      type: "preview-viewport",
      data: {
        templateId: templateId.value,
        tabId: currentTabId.value,
        width: previewViewport.value.width,
        height: previewViewport.value.height,
      },
    });
  }

  function updateRouteTabId(tabId: string) {
    const next = tabId || undefined;
    const current = routeTabId.value || undefined;
    if (current === next) {
      return;
    }

    router
      .replace({
        query: {
          ...route.query,
          tabId: next,
        },
      })
      .catch((error) => {
        console.warn("[PortalTemplateSettingPage] 更新路由参数失败", error);
      });
  }

  function setCurrentTab(tabId: string) {
    currentTabId.value = tabId;
    updateRouteTabId(tabId);
  }

  interface TreeSortDropPayload {
    draggingId: string;
    dropId: string;
    dropType: "before" | "after" | "inner";
  }

  interface TabSortPatch {
    id: string;
    parentId: number | string;
    sort: number;
  }

  interface TabLocation {
    node: PortalTab;
    parent: PortalTab | null;
    siblings: PortalTab[];
    index: number;
  }

  function cloneTabsForSort(source: PortalTab[]): PortalTab[] {
    return JSON.parse(JSON.stringify(source)) as PortalTab[];
  }

  function findTabLocationById(tabs: PortalTab[], tabId: string, parent: PortalTab | null = null): TabLocation | null {
    for (let index = 0; index < tabs.length; index += 1) {
      const node = tabs[index];
      if (!node || typeof node !== "object") {
        continue;
      }
      if (normalizeIdLike(node.id) === tabId) {
        return {
          node,
          parent,
          siblings: tabs,
          index,
        };
      }
      if (Array.isArray(node.children) && node.children.length > 0) {
        const nested = findTabLocationById(node.children, tabId, node);
        if (nested) {
          return nested;
        }
      }
    }
    return null;
  }

  function removeTabById(tabs: PortalTab[], tabId: string, parent: PortalTab | null = null): TabLocation | null {
    for (let index = 0; index < tabs.length; index += 1) {
      const node = tabs[index];
      if (!node || typeof node !== "object") {
        continue;
      }
      if (normalizeIdLike(node.id) === tabId) {
        const [removed] = tabs.splice(index, 1);
        if (!removed || typeof removed !== "object") {
          return null;
        }
        return {
          node: removed,
          parent,
          siblings: tabs,
          index,
        };
      }
      if (Array.isArray(node.children) && node.children.length > 0) {
        const nested = removeTabById(node.children, tabId, node);
        if (nested) {
          return nested;
        }
      }
    }
    return null;
  }

  function ensureChildren(node: PortalTab): PortalTab[] {
    if (!Array.isArray(node.children)) {
      node.children = [];
    }
    return node.children;
  }

  function collectSortPatches(siblings: PortalTab[], parentId: number | string): TabSortPatch[] {
    return siblings
      .map((item, index) => {
        const id = normalizeIdLike(item.id);
        if (!id) {
          return null;
        }
        return {
          id,
          parentId,
          sort: index + 1,
        };
      })
      .filter((item): item is TabSortPatch => Boolean(item));
  }

  async function loadTemplate(preferTabId?: string) {
    if (!templateId.value) {
      templateInfo.value = null;
      currentTabId.value = "";
      return;
    }

    loading.value = true;
    try {
      const res = await portalApi.template.detail({ id: templateId.value });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "加载门户失败");
        templateInfo.value = null;
        currentTabId.value = "";
        return;
      }

      templateInfo.value = res?.data ?? null;

      const tabs = getTabs();
      const preferred = preferTabId || routeTabId.value;
      const nextTabId = preferred && containsTabId(tabs, preferred) ? preferred : findFirstPageTabId(tabs);
      setCurrentTab(nextTabId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载门户失败";
      message.error(msg);
      templateInfo.value = null;
      currentTabId.value = "";
    } finally {
      loading.value = false;
    }
  }

  async function linkTabToTemplate(tabId: string) {
    await loadTemplate(tabId);
    if (containsTabId(getTabs(), tabId)) {
      return;
    }

    const tpl = templateInfo.value;
    if (!tpl) {
      return;
    }

    const nextIds = Array.isArray(tpl.tabIds) ? [...tpl.tabIds] : [];
    if (!nextIds.includes(tabId)) {
      nextIds.push(tabId);
    }
    tpl.tabIds = nextIds;

    const res = await portalApi.template.update(tpl);
    if (!normalizeBizOk(res)) {
      message.error(res?.message || "关联页面到模板失败");
      return;
    }

    await loadTemplate(tabId);
  }

  function openCreate(parentId: number | string, initial?: Partial<PortalTab>) {
    attrMode.value = "create";
    attrParentId.value = parentId;
    editingTabId.value = "";
    editingTabType.value = null;
    attrInitial.value = {
      tabType: 2,
      sort: calcNextSort(getTabs(), parentId),
      ...initial,
    };
    attrVisible.value = true;
  }

  function openCreateRoot() {
    openCreate(0, { tabType: 2 });
  }

  function openCreateSibling(node: PortalTab) {
    openCreate(node.parentId ?? 0, { tabType: 2 });
  }

  function openCreateChild(node: PortalTab) {
    if (node.tabType !== 1) {
      return;
    }
    const id = normalizeIdLike(node.id);
    if (!id) {
      return;
    }
    openCreate(id, { tabType: 2 });
  }

  async function openAttribute(node: PortalTab) {
    const id = normalizeIdLike(node.id);
    if (!id) {
      return;
    }
    if (!templateId.value) {
      return;
    }

    attrLoading.value = true;
    try {
      const res = await portalApi.tab.detail({ id });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "加载页面详情失败");
        return;
      }

      const tab = res?.data;
      attrMode.value = "edit";
      editingTabId.value = id;
      editingTabType.value = typeof tab?.tabType === "number" ? tab.tabType : null;
      attrParentId.value = tab?.parentId ?? 0;
      attrInitial.value = tab ?? {};
      attrVisible.value = true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载页面详情失败";
      message.error(msg);
    } finally {
      attrLoading.value = false;
    }
  }

  async function onSubmitAttr(payload: {
    tabName: string;
    tabType: number;
    sort: number;
    tabUrl?: string;
    tabUrlOpenMode?: number;
    tabUrlSsoType?: number;
  }) {
    if (!templateId.value) {
      return;
    }
    if (creating.value) {
      return;
    }

    creating.value = true;
    try {
      if (attrMode.value === "create") {
        const data: Record<string, unknown> = {
          templateId: templateId.value,
          parentId: attrParentId.value,
          tabName: payload.tabName,
          tabType: payload.tabType,
          sort: payload.sort,
          tabIcon: "",
          order: 0,
        };

        if (payload.tabType === 3) {
          data.tabUrl = payload.tabUrl ?? "";
          data.tabUrlOpenMode = payload.tabUrlOpenMode ?? 1;
          data.tabUrlSsoType = payload.tabUrlSsoType ?? 1;
        } else {
          data.tabUrl = "";
          data.tabUrlOpenMode = 1;
          data.tabUrlSsoType = 1;
        }

        if (payload.tabType === 2) {
          data.pageLayout = JSON.stringify(
            buildPortalPageLayoutForSave(createDefaultPortalPageSettingsV2(), [])
          );
          data.cmptInsts = [];
        }

        const res = await portalApi.tab.add(data);
        if (!normalizeBizOk(res)) {
          message.error(res?.message || "新建失败");
          return;
        }

        const newTabId = typeof res?.data === "string" ? res.data : "";
        if (!newTabId) {
          message.error("新建成功但未返回 tabId");
          return;
        }

        await linkTabToTemplate(newTabId);

        if (payload.tabType === 2) {
          router.push({
            path: "/portal/page/edit",
            query: {
              id: templateId.value,
              tabId: newTabId,
            },
          });
          return;
        }

        message.success("新建成功");
        await loadTemplate(currentTabId.value);
        return;
      }

      // 编辑：不允许修改 tabType（与老项目保持一致）
      const id = editingTabId.value;
      if (!id) {
        return;
      }
      const tabType = editingTabType.value ?? payload.tabType;

      const updateData: Record<string, unknown> = {
        id,
        templateId: templateId.value,
        parentId: attrParentId.value,
        tabName: payload.tabName,
        tabType,
        sort: payload.sort,
      };

      if (tabType === 3) {
        updateData.tabUrl = payload.tabUrl ?? "";
        updateData.tabUrlOpenMode = payload.tabUrlOpenMode ?? 1;
        updateData.tabUrlSsoType = payload.tabUrlSsoType ?? 1;
      }

      const res = await portalApi.tab.update(updateData);
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "保存失败");
        return;
      }

      message.success("保存成功");
      await loadTemplate(currentTabId.value);
    } finally {
      creating.value = false;
      attrVisible.value = false;
    }
  }

  async function toggleHide(node: PortalTab) {
    if (!templateId.value) {
      return;
    }
    const tabId = normalizeIdLike(node.id);
    if (!tabId) {
      return;
    }

    const next = node.isHide === 1 ? 0 : 1;
    const text = next === 1 ? "隐藏" : "显示";

    try {
      await confirm.warn(`确定要${text}该页面吗？`, "操作确认");
    } catch {
      return;
    }

    const res = await portalApi.template.hideToggle({
      id: templateId.value,
      tabId,
      isHide: next,
    });
    if (!normalizeBizOk(res)) {
      message.error(res?.message || `${text}失败`);
      return;
    }

    message.success(`${text}成功`);
    await loadTemplate(currentTabId.value);
  }

  async function deleteTab(node: PortalTab) {
    if (!templateId.value) {
      return;
    }
    const tabId = normalizeIdLike(node.id);
    if (!tabId) {
      return;
    }

    try {
      await confirm.warn("确定要删除该页面吗？", "删除确认");
    } catch {
      return;
    }

    const res = await portalApi.tab.delete({ id: tabId });
    if (!normalizeBizOk(res)) {
      message.error(res?.message || "删除失败");
      return;
    }

    message.success("删除成功");
    await loadTemplate(currentTabId.value);

    if (tabId === currentTabId.value) {
      const next = findFirstPageTabId(getTabs());
      setCurrentTab(next);
    }
  }

  async function applyTabSortPatches(patches: TabSortPatch[]) {
    if (!templateId.value) {
      return;
    }

    for (const patch of patches) {
      const detailRes = await portalApi.tab.detail({ id: patch.id });
      if (!normalizeBizOk(detailRes)) {
        throw new Error(detailRes?.message || `加载页面详情失败：${patch.id}`);
      }

      const detail = detailRes?.data ?? {};
      const tabType = typeof detail.tabType === "number" ? detail.tabType : 2;
      const tabName = normalizeTabName(detail.tabName, `页面-${patch.id}`);
      const updateData: Record<string, unknown> = {
        id: patch.id,
        templateId: templateId.value,
        parentId: patch.parentId,
        tabName,
        tabType,
        sort: patch.sort,
      };

      if (tabType === 3) {
        updateData.tabUrl = typeof detail.tabUrl === "string" ? detail.tabUrl : "";
        updateData.tabUrlOpenMode = typeof detail.tabUrlOpenMode === "number" ? detail.tabUrlOpenMode : 1;
        updateData.tabUrlSsoType = typeof detail.tabUrlSsoType === "number" ? detail.tabUrlSsoType : 1;
      }

      const updateRes = await portalApi.tab.update(updateData);
      if (!normalizeBizOk(updateRes)) {
        throw new Error(updateRes?.message || `更新页面排序失败：${patch.id}`);
      }
    }
  }

  async function onTreeSortDrop(payload: TreeSortDropPayload) {
    if (!templateId.value || sortingTabs.value) {
      return;
    }

    const tabs = cloneTabsForSort(getTabs());
    const removed = removeTabById(tabs, payload.draggingId);
    if (!removed) {
      message.error("未找到被拖拽页面，排序失败");
      return;
    }

    const dropLocation = findTabLocationById(tabs, payload.dropId);
    if (!dropLocation) {
      message.error("未找到目标位置，排序失败");
      return;
    }

    const sourceParentId = normalizeParentId(removed.parent);
    let destinationParentId: number | string;
    let destinationSiblings: PortalTab[];

    if (payload.dropType === "inner") {
      if (dropLocation.node.tabType !== 1) {
        message.warning("仅导航组支持接收子页面");
        return;
      }
      destinationParentId = normalizeIdLike(dropLocation.node.id) || 0;
      destinationSiblings = ensureChildren(dropLocation.node);
      destinationSiblings.push(removed.node);
    } else {
      destinationParentId = normalizeParentId(dropLocation.parent);
      destinationSiblings = dropLocation.siblings;
      const insertIndex = payload.dropType === "before" ? dropLocation.index : dropLocation.index + 1;
      destinationSiblings.splice(insertIndex, 0, removed.node);
    }

    removed.node.parentId = destinationParentId;

    const patchMap = new Map<string, TabSortPatch>();
    for (const patch of collectSortPatches(destinationSiblings, destinationParentId)) {
      patchMap.set(patch.id, patch);
    }
    if (String(sourceParentId) !== String(destinationParentId)) {
      for (const patch of collectSortPatches(removed.siblings, sourceParentId)) {
        patchMap.set(patch.id, patch);
      }
    }
    const patches = Array.from(patchMap.values());
    if (patches.length === 0) {
      return;
    }

    sortingTabs.value = true;
    try {
      await applyTabSortPatches(patches);
      message.success("页面排序已更新");
      await loadTemplate(payload.draggingId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "页面排序更新失败";
      message.error(msg);
      await loadTemplate(currentTabId.value);
    } finally {
      sortingTabs.value = false;
    }
  }

  function onEdit(tabId: string) {
    if (!templateId.value) {
      return;
    }
    const tab = findTabById(getTabs(), tabId);
    if (!(tab && isPortalTabEditable(tab.tabType))) {
      message.warning("仅空白页支持编辑");
      return;
    }
    router.push({
      path: "/portal/page/edit",
      query: {
        id: templateId.value,
        tabId,
      },
    });
  }

  async function openPageSettingsDrawer(tabId: string) {
    if (!tabId || pageSettingsLoading.value) {
      return;
    }

    pageSettingsLoading.value = true;
    try {
      const detail = await loadPortalTabPageSettings(tabId);
      pageSettingsForm.value = detail.settings;
      pageSettingsVisible.value = true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载页面设置失败";
      message.error(msg);
    } finally {
      pageSettingsLoading.value = false;
    }
  }

  async function onSubmitPageSettings(settings: PortalPageSettingsV2) {
    if (!(templateId.value && currentTabId.value) || pageSettingsSaving.value) {
      return;
    }

    pageSettingsSaving.value = true;
    try {
      await savePortalTabPageSettings({
        tabId: currentTabId.value,
        templateId: templateId.value,
        settings,
      });
      message.success("页面设置保存成功");
      pageSettingsVisible.value = false;
      await loadTemplate(currentTabId.value);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "页面设置保存失败";
      message.error(msg);
    } finally {
      pageSettingsSaving.value = false;
    }
  }

  async function openPermissionDialog() {
    if (!(templateId.value && currentTabId.value) || permissionLoading.value) {
      return;
    }

    permissionLoading.value = true;
    try {
      const res = await portalApi.tab.detail({ id: currentTabId.value });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "加载页面权限失败");
        return;
      }
      permissionInitial.value = res?.data ?? {};
      permissionVisible.value = true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载页面权限失败";
      message.error(msg);
    } finally {
      permissionLoading.value = false;
    }
  }

  async function onSubmitPermission(payload: {
    authType: "person" | "role";
    allowPerms: { roleIds: string[]; userIds: string[] };
    forbiddenPerms: { roleIds: string[]; userIds: string[] };
    configPerms: { roleIds: string[]; userIds: string[] };
  }) {
    if (!(templateId.value && currentTabId.value) || permissionLoading.value) {
      return;
    }

    permissionLoading.value = true;
    try {
      const res = await portalApi.tab.update({
        id: currentTabId.value,
        templateId: templateId.value,
        ...payload,
      });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "页面权限保存失败");
        return;
      }

      message.success("页面权限保存成功");
      permissionVisible.value = false;
      await loadTemplate(currentTabId.value);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "页面权限保存失败";
      message.error(msg);
    } finally {
      permissionLoading.value = false;
    }
  }

  function onBack() {
    router.push("/portal/setting");
  }

  function onPreviewScaleChange(value: number) {
    previewScale.value = value;
  }

  function onPreviewInteractionStateChange(payload: { mode: "auto" | "manual"; scale: number }) {
    previewInteractionMode.value = payload.mode;
    previewScale.value = payload.scale;
  }

  function onPreviewChange(payload: { mode: PortalPreviewMode; viewport: PortalPreviewViewport }) {
    previewMode.value = payload.mode;
    previewViewport.value = payload.viewport;
    postPreviewViewport();
  }

  function onPreviewInteractionChange(payload: { mode: "auto" | "manual" }) {
    previewInteractionMode.value = payload.mode;
    previewFrameRef.value?.setInteractionMode(payload.mode);
  }

  function onZoomInPreview() {
    previewFrameRef.value?.zoomIn();
  }

  function onZoomOutPreview() {
    previewFrameRef.value?.zoomOut();
  }

  function onResetPreviewView() {
    previewFrameRef.value?.resetView();
  }

  function onPreviewFrameLoad() {
    postPreviewViewport();
    const draftDetails =
      (shellSettingVisible.value && shellPreviewDetailsDraft.value) ||
      (pageShellSettingVisible.value && pageShellPreviewDetailsDraft.value) ||
      "";
    if (!draftDetails) {
      return;
    }
    postShellPreviewDetails(draftDetails);
  }

  function openShellSettings() {
    if (!templateInfo.value) {
      message.warning("请先选择门户模板");
      return;
    }
    pageShellSettingVisible.value = false;
    shellSettingVisible.value = true;
  }

  function onShellPreviewChange(payload: { details: string }) {
    shellPreviewDetailsDraft.value = payload.details;
    postShellPreviewDetails(payload.details);
  }

  async function onSubmitShellSetting(payload: { details: string }) {
    if (!templateId.value || shellSettingSaving.value) {
      return;
    }

    shellSettingSaving.value = true;
    try {
      const currentTemplate = templateInfo.value ?? {};
      const res = await portalApi.template.update({
        ...currentTemplate,
        id: templateId.value,
        details: payload.details,
      });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "页眉页脚配置保存失败");
        return;
      }

      message.success("页眉页脚配置保存成功");
      shellSettingSavedInThisRound.value = true;
      shellPreviewDetailsDraft.value = payload.details;
      shellSettingVisible.value = false;
      await loadTemplate(currentTabId.value);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "页眉页脚配置保存失败";
      message.error(msg);
    } finally {
      shellSettingSaving.value = false;
    }
  }

  function openPageShellSettings() {
    if (!templateInfo.value) {
      message.warning("请先选择门户模板");
      return;
    }

    const current = currentTab.value;
    if (!(currentTabId.value && (current && isPortalTabEditable(current.tabType)))) {
      message.warning("请选择可编辑页面后再配置页面级页眉页脚");
      return;
    }

    shellSettingVisible.value = false;
    pageShellSettingVisible.value = true;
  }

  function onPageShellPreviewChange(payload: { details: string }) {
    pageShellPreviewDetailsDraft.value = payload.details;
    postShellPreviewDetails(payload.details);
  }

  async function onSubmitPageShellSetting(payload: { details: string }) {
    if (!templateId.value || pageShellSettingSaving.value) {
      return;
    }

    pageShellSettingSaving.value = true;
    try {
      const currentTemplate = templateInfo.value ?? {};
      const res = await portalApi.template.update({
        ...currentTemplate,
        id: templateId.value,
        details: payload.details,
      });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "页面级页眉页脚配置保存失败");
        return;
      }

      message.success("页面级页眉页脚配置保存成功");
      pageShellSettingSavedInThisRound.value = true;
      pageShellPreviewDetailsDraft.value = payload.details;
      pageShellSettingVisible.value = false;
      await loadTemplate(currentTabId.value);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "页面级页眉页脚配置保存失败";
      message.error(msg);
    } finally {
      pageShellSettingSaving.value = false;
    }
  }

  watch(
    () => currentTabId.value,
    () => {
      if (!currentTabId.value) {
        previewInteractionMode.value = "auto";
      }
      if (!pageSettingsVisible.value) {
        return;
      }
      pageSettingsVisible.value = false;
    }
  );

  watch(
    () => [pageSettingsVisible.value, pageSettingsForm.value?.access.mode] as const,
    ([opened, mode]) => {
      if (opened && mode === "role") {
        void loadRoleOptions();
      }
    }
  );

  watch(
    shellSettingVisible,
    (opened) => {
      if (opened) {
        shellPreviewDetailsDraft.value = "";
        shellSettingSavedInThisRound.value = false;
        return;
      }
      if (shellSettingSavedInThisRound.value) {
        shellSettingSavedInThisRound.value = false;
        return;
      }
      const persistedDetails = templateInfo.value?.details || "";
      shellPreviewDetailsDraft.value = "";
      postShellPreviewDetails(persistedDetails);
    }
  );

  watch(
    pageShellSettingVisible,
    (opened) => {
      if (opened) {
        pageShellPreviewDetailsDraft.value = "";
        pageShellSettingSavedInThisRound.value = false;
        return;
      }
      if (pageShellSettingSavedInThisRound.value) {
        pageShellSettingSavedInThisRound.value = false;
        return;
      }
      const persistedDetails = templateInfo.value?.details || "";
      pageShellPreviewDetailsDraft.value = "";
      postShellPreviewDetails(persistedDetails);
    }
  );

  watch(
    () => [previewFrameSrc.value, currentTabId.value, shellSettingVisible.value, shellPreviewDetailsDraft.value] as const,
    async ([, tabId, opened, draftDetails]) => {
      if (!(opened && draftDetails && tabId)) {
        return;
      }
      await nextTick();
      postShellPreviewDetails(draftDetails);
    }
  );

  watch(
    () =>
      [previewFrameSrc.value, currentTabId.value, pageShellSettingVisible.value, pageShellPreviewDetailsDraft.value] as const,
    async ([, tabId, opened, draftDetails]) => {
      if (!(opened && draftDetails && tabId)) {
        return;
      }
      await nextTick();
      postShellPreviewDetails(draftDetails);
    }
  );

  void loadTemplate();
</script>

<template>
  <div class="page">
    <PortalDesignerHeaderBar
      :title="templateInfo?.templateName || '门户配置工作台'"
      :template-id="templateId"
      :loading="loading"
      @back="onBack"
      @refresh="loadTemplate(currentTabId)"
      @shell-settings="openShellSettings"
    />

    <div v-loading="loading" class="layout">
      <aside class="tree-pane">
        <PortalDesignerTreePanel
          class="tree-content"
          :tabs="templateInfo?.tabList ?? []"
          :current-tab-id="currentTabId"
          :sorting="sortingTabs"
          @create-root="openCreateRoot"
          @select="setCurrentTab"
          @edit="onEdit"
          @create-sibling="openCreateSibling"
          @create-child="openCreateChild"
          @attribute="openAttribute"
          @toggle-hide="toggleHide"
          @delete="deleteTab"
          @sort-drop="onTreeSortDrop"
        />
      </aside>

      <section class="editor-pane">
        <PortalDesignerActionStrip
          :current-tab="currentTab"
          :preview-scale="previewScale"
          :interaction-mode="previewInteractionMode"
          @edit="editCurrentTab"
          @page-settings="openCurrentPageSettings"
          @page-shell="openPageShellSettings"
          @permission="openCurrentPermission"
          @toggle-hide="toggleCurrentTabHide"
          @preview="openPreviewWindow"
          @delete="deleteCurrentTab"
          @preview-change="onPreviewChange"
          @interaction-change="onPreviewInteractionChange"
          @zoom-in="onZoomInPreview"
          @zoom-out="onZoomOutPreview"
          @reset-view="onResetPreviewView"
        />

        <PortalDesignerPreviewFrame
          ref="previewFrameRef"
          :template-id="templateId"
          :current-tab-id="currentTabId"
          :preview-frame-src="previewFrameSrc"
          :viewport-width="previewViewport.width"
          :viewport-height="previewViewport.height"
          @create-root="openCreateRoot"
          @scale-change="onPreviewScaleChange"
          @interaction-state-change="onPreviewInteractionStateChange"
          @frame-load="onPreviewFrameLoad"
        />
      </section>
    </div>

    <TabAttributeDialog
      v-model="attrVisible"
      :mode="attrMode"
      :loading="creating || attrLoading"
      :initial="attrInitial"
      @submit="onSubmitAttr"
    />

    <PagePermissionDialog
      v-model="permissionVisible"
      :loading="permissionLoading"
      :initial="permissionInitial"
      @submit="onSubmitPermission"
    />

    <PortalPageSettingsDrawer
      v-model="pageSettingsVisible"
      :loading="pageSettingsSaving"
      :page-name="currentTabName"
      :settings="pageSettingsForm"
      :role-options="roleOptions"
      :role-loading="roleLoading"
      @submit="onSubmitPageSettings"
    />

    <PortalShellSettingsDialog
      v-model="shellSettingVisible"
      :loading="shellSettingSaving"
      :details="templateInfo?.details || ''"
      :tabs="templateInfo?.tabList || []"
      @submit="onSubmitShellSetting"
      @preview-change="onShellPreviewChange"
    />

    <PortalPageShellOverrideDialog
      v-model="pageShellSettingVisible"
      :loading="pageShellSettingSaving"
      :current-tab-id="currentTabId"
      :details="templateInfo?.details || ''"
      :tabs="templateInfo?.tabList || []"
      @submit="onSubmitPageShellSetting"
      @preview-change="onPageShellPreviewChange"
    />
  </div>
</template>

<style scoped>
  .page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    background: #fff;
  }

  .layout {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    background: #fff;
  }

  .tree-pane {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-right: 1px solid #e5ebf2;
    overflow: hidden;
    background: #fff;
  }

  .tree-content {
    flex: 1;
    min-height: 0;
  }

  .editor-pane {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    background: #fff;
  }

  .page :deep(.el-button) {
    border-radius: 0;
  }

  .page :deep(.el-input__wrapper) {
    border-radius: 0;
  }

  @media (max-width: 1366px) {
    .layout {
      grid-template-columns: 300px minmax(0, 1fr);
    }
  }

  @media (max-width: 960px) {
    .layout {
      grid-template-columns: 1fr;
      grid-template-rows: 340px minmax(0, 1fr);
    }
  }
</style>
