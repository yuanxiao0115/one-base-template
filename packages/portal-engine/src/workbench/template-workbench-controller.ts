import { computed, ref, type ComputedRef, type Ref } from 'vue';

import {
  calcPortalTabNextSort,
  containsPortalTabId,
  findFirstPortalPageTabId,
  findPortalTabById,
  isPortalTabEditable,
  normalizePortalParentId,
  normalizePortalTabId,
  normalizePortalTabName
} from '../domain/tab-tree';
import {
  buildPortalPageLayoutForSave,
  createDefaultPortalPageSettingsV2
} from '../schema/page-settings';
import type { BizResponse, PortalTab, PortalTemplate } from '../schema/types';
import { isPortalBizOk } from '../utils/biz-response';

export interface TemplateWorkbenchConfirmParams {
  message: string;
  title: string;
}

export interface TemplateWorkbenchNotifier {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

export interface TemplateWorkbenchApi {
  template: {
    detail: (params: { id: string }) => Promise<BizResponse<PortalTemplate>>;
    update: (data: Partial<PortalTemplate>) => Promise<BizResponse<unknown>>;
    hideToggle: (params: {
      id: string;
      tabId: string;
      isHide: number;
    }) => Promise<BizResponse<unknown>>;
  };
  tab: {
    detail: (params: {
      id: string;
      templateId?: string | number;
    }) => Promise<BizResponse<PortalTab>>;
    add: (data: Partial<PortalTab>) => Promise<BizResponse<unknown>>;
    update: (data: Partial<PortalTab>) => Promise<BizResponse<unknown>>;
    delete: (data: { id: string }) => Promise<BizResponse<unknown>>;
  };
}

export interface SubmitTabAttributePayload {
  tabName: string;
  tabType: number;
  sort: number;
  tabUrl?: string;
  tabUrlOpenMode?: number;
  tabUrlSsoType?: number;
  portalTemplateId?: string;
}

export interface TreeSortDropPayload {
  draggingId: string;
  dropId: string;
  dropType: 'before' | 'after' | 'inner';
}

export interface CreateTemplateWorkbenchControllerOptions {
  templateId: Readonly<Ref<string>>;
  routeTabId: Readonly<Ref<string>>;
  lockedTabId?: Readonly<Ref<string>> | ComputedRef<string>;
  api: TemplateWorkbenchApi;
  notify: TemplateWorkbenchNotifier;
  confirm: (params: TemplateWorkbenchConfirmParams) => Promise<void>;
  syncRouteTabId: (tabId: string) => void;
  openEditor: (params: { templateId: string; tabId: string }) => void;
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

function findTabLocationById(
  tabs: PortalTab[],
  tabId: string,
  parent: PortalTab | null = null
): TabLocation | null {
  for (let index = 0; index < tabs.length; index += 1) {
    const node = tabs[index];
    if (!node || typeof node !== 'object') {
      continue;
    }
    if (normalizePortalTabId(node.id) === tabId) {
      return {
        node,
        parent,
        siblings: tabs,
        index
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

function removeTabById(
  tabs: PortalTab[],
  tabId: string,
  parent: PortalTab | null = null
): TabLocation | null {
  for (let index = 0; index < tabs.length; index += 1) {
    const node = tabs[index];
    if (!node || typeof node !== 'object') {
      continue;
    }
    if (normalizePortalTabId(node.id) === tabId) {
      const [removed] = tabs.splice(index, 1);
      if (!removed || typeof removed !== 'object') {
        return null;
      }
      return {
        node: removed,
        parent,
        siblings: tabs,
        index
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
      const id = normalizePortalTabId(item.id);
      if (!id) {
        return null;
      }
      return {
        id,
        parentId,
        sort: index + 1
      };
    })
    .filter((item): item is TabSortPatch => Boolean(item));
}

function resolveCreatedTabId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return normalizePortalTabId(value);
  }
  if (!value || typeof value !== 'object') {
    return '';
  }
  const record = value as Record<string, unknown>;
  return normalizePortalTabId(record.id) || normalizePortalTabId(record.tabId);
}

export function createTemplateWorkbenchController(
  options: CreateTemplateWorkbenchControllerOptions
) {
  const loading = ref(false);
  const creating = ref(false);
  const sortingTabs = ref(false);

  const templateInfo = ref<PortalTemplate | null>(null);
  const currentTabId = ref('');

  const attrVisible = ref(false);
  const attrMode = ref<'create' | 'edit'>('create');
  const attrLoading = ref(false);
  const attrInitial = ref<Partial<PortalTab>>({});
  const attrParentId = ref<number | string>(0);
  const editingTabId = ref('');
  const editingTabType = ref<number | null>(null);

  const tabs = computed(() => templateInfo.value?.tabList ?? []);
  const currentTab = computed(() => findPortalTabById(tabs.value, currentTabId.value));
  const currentTabName = computed(() =>
    normalizePortalTabName(currentTab.value?.tabName, '未命名页面')
  );
  const currentLockedTabId = computed(() => options.lockedTabId?.value || '');

  function setCurrentTab(tabId: string, params?: { silentWhenLocked?: boolean }) {
    const lockedTabId = currentLockedTabId.value;
    if (lockedTabId && tabId && tabId !== lockedTabId) {
      if (!params?.silentWhenLocked) {
        options.notify.warning('页面设置已打开，请先保存或关闭后再切换页面');
      }
      options.syncRouteTabId(lockedTabId);
      return;
    }
    currentTabId.value = tabId;
    options.syncRouteTabId(tabId);
  }

  async function loadTemplate(preferTabId?: string) {
    if (!options.templateId.value) {
      templateInfo.value = null;
      currentTabId.value = '';
      return;
    }

    loading.value = true;
    try {
      const res = await options.api.template.detail({ id: options.templateId.value });
      if (!isPortalBizOk(res)) {
        options.notify.error(res?.message || '加载门户失败');
        templateInfo.value = null;
        currentTabId.value = '';
        return;
      }

      templateInfo.value = res?.data ?? null;

      const preferred = preferTabId || options.routeTabId.value;
      const nextTabId =
        preferred && containsPortalTabId(tabs.value, preferred)
          ? preferred
          : findFirstPortalPageTabId(tabs.value);
      setCurrentTab(nextTabId, { silentWhenLocked: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '加载门户失败';
      options.notify.error(message);
      templateInfo.value = null;
      currentTabId.value = '';
    } finally {
      loading.value = false;
    }
  }

  async function linkTabToTemplate(tabId: string) {
    await loadTemplate(tabId);
    if (containsPortalTabId(tabs.value, tabId)) {
      return;
    }

    const currentTemplate = templateInfo.value;
    if (!currentTemplate) {
      return;
    }

    const nextIds = Array.isArray(currentTemplate.tabIds) ? [...currentTemplate.tabIds] : [];
    if (!nextIds.includes(tabId)) {
      nextIds.push(tabId);
    }
    currentTemplate.tabIds = nextIds;

    const res = await options.api.template.update(currentTemplate);
    if (!isPortalBizOk(res)) {
      options.notify.error(res?.message || '关联页面到模板失败');
      return;
    }

    await loadTemplate(tabId);
  }

  function openCreate(parentId: number | string, initial?: Partial<PortalTab>) {
    attrMode.value = 'create';
    attrParentId.value = parentId;
    editingTabId.value = '';
    editingTabType.value = null;
    attrInitial.value = {
      tabType: 2,
      sort: calcPortalTabNextSort(tabs.value, parentId),
      ...initial
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
    const id = normalizePortalTabId(node.id);
    if (!id) {
      return;
    }
    openCreate(id, { tabType: 2 });
  }

  async function openAttribute(node: PortalTab) {
    const id = normalizePortalTabId(node.id);
    if (!(id && options.templateId.value)) {
      return;
    }

    attrLoading.value = true;
    try {
      const res = await options.api.tab.detail({ id });
      if (!isPortalBizOk(res)) {
        options.notify.error(res?.message || '加载页面详情失败');
        return;
      }

      const tab = res?.data;
      attrMode.value = 'edit';
      editingTabId.value = id;
      editingTabType.value = typeof tab?.tabType === 'number' ? tab.tabType : null;
      attrParentId.value = tab?.parentId ?? 0;
      attrInitial.value = tab ?? {};
      attrVisible.value = true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '加载页面详情失败';
      options.notify.error(message);
    } finally {
      attrLoading.value = false;
    }
  }

  async function onSubmitAttr(payload: SubmitTabAttributePayload) {
    if (!(options.templateId.value && !creating.value)) {
      return;
    }

    creating.value = true;
    try {
      if (attrMode.value === 'create') {
        const submitTabType = payload.tabType === 4 ? 3 : payload.tabType;
        const data: Record<string, unknown> = {
          templateId: options.templateId.value,
          parentId: attrParentId.value,
          tabName: payload.tabName,
          tabType: submitTabType,
          sort: payload.sort,
          tabIcon: '',
          order: 0
        };

        if (submitTabType === 3) {
          data.tabUrl = payload.tabUrl ?? '';
          data.tabUrlOpenMode = payload.tabUrlOpenMode ?? 1;
          data.tabUrlSsoType = payload.tabUrlSsoType ?? 1;
        } else {
          data.tabUrl = '';
          data.tabUrlOpenMode = 1;
          data.tabUrlSsoType = 1;
        }

        if (submitTabType === 2) {
          data.pageLayout = JSON.stringify(
            buildPortalPageLayoutForSave(createDefaultPortalPageSettingsV2(), [])
          );
          data.cmptInsts = [];
        }

        const res = await options.api.tab.add(data);
        if (!isPortalBizOk(res)) {
          options.notify.error(res?.message || '新建失败');
          return;
        }

        const newTabId = resolveCreatedTabId(res?.data);
        if (!newTabId) {
          options.notify.error('新建成功但未返回 tabId');
          return;
        }

        await linkTabToTemplate(newTabId);
        if (submitTabType === 2) {
          options.openEditor({
            templateId: options.templateId.value,
            tabId: newTabId
          });
          return;
        }

        options.notify.success('新建成功');
        await loadTemplate(currentTabId.value);
        return;
      }

      const tabId = editingTabId.value;
      if (!tabId) {
        return;
      }

      const rawTabType = editingTabType.value ?? payload.tabType;
      const tabType = rawTabType === 4 ? 3 : rawTabType;
      const updateData: Record<string, unknown> = {
        id: tabId,
        templateId: options.templateId.value,
        parentId: attrParentId.value,
        tabName: payload.tabName,
        tabType,
        sort: payload.sort
      };

      if (tabType === 3) {
        updateData.tabUrl = payload.tabUrl ?? '';
        updateData.tabUrlOpenMode = payload.tabUrlOpenMode ?? 1;
        updateData.tabUrlSsoType = payload.tabUrlSsoType ?? 1;
      }

      const res = await options.api.tab.update(updateData);
      if (!isPortalBizOk(res)) {
        options.notify.error(res?.message || '保存失败');
        return;
      }

      options.notify.success('保存成功');
      await loadTemplate(currentTabId.value);
    } finally {
      creating.value = false;
      attrVisible.value = false;
    }
  }

  async function toggleHide(node: PortalTab) {
    if (!options.templateId.value) {
      return;
    }
    const tabId = normalizePortalTabId(node.id);
    if (!tabId) {
      return;
    }

    const next = node.isHide === 1 ? 0 : 1;
    const text = next === 1 ? '隐藏' : '显示';

    try {
      await options.confirm({
        message: `确定要${text}该页面吗？`,
        title: '操作确认'
      });
    } catch {
      return;
    }

    const res = await options.api.template.hideToggle({
      id: options.templateId.value,
      tabId,
      isHide: next
    });
    if (!isPortalBizOk(res)) {
      options.notify.error(res?.message || `${text}失败`);
      return;
    }

    options.notify.success(`${text}成功`);
    await loadTemplate(currentTabId.value);
  }

  async function deleteTab(node: PortalTab) {
    if (!options.templateId.value) {
      return;
    }
    const tabId = normalizePortalTabId(node.id);
    if (!tabId) {
      return;
    }

    try {
      await options.confirm({
        message: '确定要删除该页面吗？',
        title: '删除确认'
      });
    } catch {
      return;
    }

    const res = await options.api.tab.delete({ id: tabId });
    if (!isPortalBizOk(res)) {
      options.notify.error(res?.message || '删除失败');
      return;
    }

    options.notify.success('删除成功');
    await loadTemplate(currentTabId.value);

    if (tabId === currentTabId.value) {
      const nextTabId = findFirstPortalPageTabId(tabs.value);
      setCurrentTab(nextTabId);
    }
  }

  async function applyTabSortPatches(patches: TabSortPatch[]) {
    if (!options.templateId.value) {
      return;
    }

    for (const patch of patches) {
      const detailRes = await options.api.tab.detail({ id: patch.id });
      if (!isPortalBizOk(detailRes)) {
        throw new Error(detailRes?.message || `加载页面详情失败：${patch.id}`);
      }

      const detail = detailRes?.data ?? {};
      const tabType = typeof detail.tabType === 'number' ? detail.tabType : 2;
      const tabName = normalizePortalTabName(detail.tabName, `页面-${patch.id}`);
      const updateData: Record<string, unknown> = {
        id: patch.id,
        templateId: options.templateId.value,
        parentId: patch.parentId,
        tabName,
        tabType,
        sort: patch.sort
      };

      if (tabType === 3) {
        updateData.tabUrl = typeof detail.tabUrl === 'string' ? detail.tabUrl : '';
        updateData.tabUrlOpenMode =
          typeof detail.tabUrlOpenMode === 'number' ? detail.tabUrlOpenMode : 1;
        updateData.tabUrlSsoType =
          typeof detail.tabUrlSsoType === 'number' ? detail.tabUrlSsoType : 1;
      }

      const updateRes = await options.api.tab.update(updateData);
      if (!isPortalBizOk(updateRes)) {
        throw new Error(updateRes?.message || `更新页面排序失败：${patch.id}`);
      }
    }
  }

  async function onTreeSortDrop(payload: TreeSortDropPayload) {
    if (!options.templateId.value || sortingTabs.value) {
      return;
    }

    const sortableTabs = cloneTabsForSort(tabs.value);
    const removed = removeTabById(sortableTabs, payload.draggingId);
    if (!removed) {
      options.notify.error('未找到被拖拽页面，排序失败');
      return;
    }

    const dropLocation = findTabLocationById(sortableTabs, payload.dropId);
    if (!dropLocation) {
      options.notify.error('未找到目标位置，排序失败');
      return;
    }

    const sourceParentId = normalizePortalParentId(removed.parent);
    let destinationParentId: number | string;
    let destinationSiblings: PortalTab[];

    if (payload.dropType === 'inner') {
      if (dropLocation.node.tabType !== 1) {
        options.notify.warning('仅导航组支持接收子页面');
        return;
      }
      destinationParentId = normalizePortalTabId(dropLocation.node.id) || 0;
      destinationSiblings = ensureChildren(dropLocation.node);
      destinationSiblings.push(removed.node);
    } else {
      destinationParentId = normalizePortalParentId(dropLocation.parent);
      destinationSiblings = dropLocation.siblings;
      const insertIndex =
        payload.dropType === 'before' ? dropLocation.index : dropLocation.index + 1;
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
      options.notify.success('页面排序已更新');
      await loadTemplate(payload.draggingId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '页面排序更新失败';
      options.notify.error(message);
      await loadTemplate(currentTabId.value);
    } finally {
      sortingTabs.value = false;
    }
  }

  function onEdit(tabId: string) {
    if (!options.templateId.value) {
      return;
    }

    const tab = findPortalTabById(tabs.value, tabId);
    if (!(tab && isPortalTabEditable(tab.tabType))) {
      options.notify.warning('仅空白页支持编辑');
      return;
    }

    options.openEditor({
      templateId: options.templateId.value,
      tabId
    });
  }

  return {
    loading,
    creating,
    sortingTabs,
    templateInfo,
    tabs,
    currentTabId,
    currentTab,
    currentTabName,
    attrVisible,
    attrMode,
    attrLoading,
    attrInitial,
    attrParentId,
    editingTabId,
    editingTabType,
    setCurrentTab,
    loadTemplate,
    openCreateRoot,
    openCreateSibling,
    openCreateChild,
    openAttribute,
    onSubmitAttr,
    toggleHide,
    deleteTab,
    onTreeSortDrop,
    onEdit
  };
}

export type TemplateWorkbenchController = ReturnType<typeof createTemplateWorkbenchController>;
