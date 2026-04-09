import { computed, ref, watch } from 'vue';
import { message } from '@one-base-template/ui';
import { orgApi } from '../api';
import type { OrgContactNode, OrgContactOrgNode, OrgManagerRecord } from '../types';
import { resolveOrgManagerDelta } from '../utils/managerDelta';
import type { BreadcrumbNode, SelectedUser } from './org-manager-dialog.types';
import { getErrorMessage, patchNodeChildren, syncCheckedNodes } from './org-manager-dialog-helpers';
import { useOrgManagerSelection } from './useOrgManagerSelection';

interface StateRequestContext {
  sessionId: number;
  requestToken: number;
  orgId: string;
}

interface OrgManagerDialogProps {
  modelValue: boolean;
  orgId: string;
}

interface OrgManagerDialogEmit {
  (event: 'update:modelValue', value: boolean): void;
  (event: 'success'): void;
}

export function useOrgManagerDialogState(props: OrgManagerDialogProps, emit: OrgManagerDialogEmit) {
  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  });

  const loading = ref(false);
  const saving = ref(false);
  const searchKeyword = ref('');
  const breadcrumbs = ref<BreadcrumbNode[]>([]);
  const showBreadcrumb = ref(true);

  const currentNodes = ref<OrgContactNode[]>([]);
  const rootNodes = ref<OrgContactNode[]>([]);
  const nodeChildrenMap = new Map<string, OrgContactNode[]>();

  const selectedUsers = ref<SelectedUser[]>([]);
  const originalManagers = ref<OrgManagerRecord[]>([]);
  const dialogSessionId = ref(0);
  const latestStateRequestToken = ref(0);

  function resetState() {
    loading.value = false;
    saving.value = false;
    searchKeyword.value = '';
    breadcrumbs.value = [
      {
        id: '0',
        title: '通讯录'
      }
    ];
    showBreadcrumb.value = true;
    currentNodes.value = [];
    rootNodes.value = [];
    nodeChildrenMap.clear();
    selectedUsers.value = [];
    originalManagers.value = [];
  }

  function startDialogSession(): number {
    dialogSessionId.value += 1;
    return dialogSessionId.value;
  }

  function createStateRequest(sessionId = dialogSessionId.value): StateRequestContext {
    latestStateRequestToken.value += 1;

    return {
      sessionId,
      requestToken: latestStateRequestToken.value,
      orgId: props.orgId
    };
  }

  function isLatestStateRequest(request: StateRequestContext): boolean {
    return (
      request.sessionId === dialogSessionId.value &&
      request.requestToken === latestStateRequestToken.value &&
      visible.value &&
      request.orgId === props.orgId
    );
  }

  function invalidateDialogSession() {
    dialogSessionId.value += 1;
    latestStateRequestToken.value += 1;
    resetState();
  }

  function syncCurrentNodeChecked() {
    currentNodes.value = syncCheckedNodes(currentNodes.value, selectedUserIdSet.value);
  }

  function updateNodeChildren(orgId: string, children: OrgContactNode[]) {
    nodeChildrenMap.set(orgId, children);

    if (orgId === '0') {
      rootNodes.value = children;
      return;
    }

    rootNodes.value = patchNodeChildren(rootNodes.value, orgId, children);
  }

  async function loadNodeChildren(
    parentId: string,
    request: StateRequestContext
  ): Promise<OrgContactNode[]> {
    const cached = nodeChildrenMap.get(parentId);
    if (cached) {
      return cached;
    }

    const response = await orgApi.getOrgContactsLazy({ parentId });
    if (response.code !== 200) {
      throw new Error(response.message || '加载通讯录失败');
    }

    const rows = Array.isArray(response.data) ? response.data : [];
    if (!isLatestStateRequest(request)) {
      return rows;
    }
    updateNodeChildren(parentId, rows);
    return rows;
  }

  async function loadOrgManagers(request: StateRequestContext) {
    if (!props.orgId) {
      return;
    }

    const response = await orgApi.queryOrgManagerList({ orgId: props.orgId });
    if (response.code !== 200) {
      throw new Error(response.message || '加载组织管理员失败');
    }

    if (!isLatestStateRequest(request)) {
      return;
    }

    originalManagers.value = Array.isArray(response.data) ? response.data : [];
    selectedUsers.value = originalManagers.value.map((item) => ({
      userId: item.userId,
      nickName: item.nickName,
      phone: item.phone,
      uniqueId: item.id
    }));
  }

  const { selectedUserIdSet, toggleUser, removeSelectedById, clearSelected } =
    useOrgManagerSelection({
      selectedUsers,
      syncCurrentNodeChecked
    });

  async function loadRootNodes(request: StateRequestContext) {
    const rows = await loadNodeChildren('0', request);
    if (!isLatestStateRequest(request)) {
      return;
    }
    currentNodes.value = rows;
    syncCurrentNodeChecked();
  }

  async function initDialog() {
    const sessionId = startDialogSession();
    const request = createStateRequest(sessionId);

    if (!props.orgId) {
      message.warning('缺少组织信息，无法设置管理员');
      return;
    }

    resetState();
    loading.value = true;
    try {
      await loadOrgManagers(request);
      if (!isLatestStateRequest(request)) {
        return;
      }

      await loadRootNodes(request);
    } catch (error) {
      if (!isLatestStateRequest(request)) {
        return;
      }
      message.error(getErrorMessage(error, '初始化组织管理员失败'));
    } finally {
      if (isLatestStateRequest(request)) {
        loading.value = false;
      }
    }
  }

  async function enterOrgNode(node: OrgContactOrgNode) {
    const request = createStateRequest();
    loading.value = true;
    try {
      const rows = await loadNodeChildren(node.id, request);
      if (!isLatestStateRequest(request)) {
        return;
      }
      currentNodes.value = rows;
      syncCurrentNodeChecked();

      const breadcrumbIndex = breadcrumbs.value.findIndex((item) => item.id === node.id);
      if (breadcrumbIndex >= 0) {
        breadcrumbs.value = breadcrumbs.value.slice(0, breadcrumbIndex + 1);
        return;
      }

      breadcrumbs.value.push({
        id: node.id,
        title: node.title || node.orgName || '组织'
      });
    } catch (error) {
      if (!isLatestStateRequest(request)) {
        return;
      }
      message.error(getErrorMessage(error, '加载组织下级失败'));
    } finally {
      if (isLatestStateRequest(request)) {
        loading.value = false;
      }
    }
  }

  async function gotoBreadcrumb(index: number) {
    const request = createStateRequest();
    const target = breadcrumbs.value[index];
    if (!target) {
      return;
    }

    loading.value = true;
    try {
      const rows = await loadNodeChildren(target.id, request);
      if (!isLatestStateRequest(request)) {
        return;
      }
      currentNodes.value = rows;
      syncCurrentNodeChecked();
      breadcrumbs.value = breadcrumbs.value.slice(0, index + 1);
    } catch (error) {
      if (!isLatestStateRequest(request)) {
        return;
      }
      message.error(getErrorMessage(error, '加载通讯录失败'));
    } finally {
      if (isLatestStateRequest(request)) {
        loading.value = false;
      }
    }
  }

  async function handleSearch() {
    const request = createStateRequest();
    const keyword = searchKeyword.value.trim();
    if (!keyword) {
      if (!isLatestStateRequest(request)) {
        return;
      }
      showBreadcrumb.value = true;
      currentNodes.value = rootNodes.value;
      syncCurrentNodeChecked();
      return;
    }

    loading.value = true;
    try {
      const response = await orgApi.searchContactUsers({ search: keyword });
      if (!isLatestStateRequest(request)) {
        return;
      }
      if (response.code !== 200) {
        throw new Error(response.message || '搜索人员失败');
      }

      showBreadcrumb.value = false;
      currentNodes.value = Array.isArray(response.data) ? response.data : [];
      syncCurrentNodeChecked();
    } catch (error) {
      if (!isLatestStateRequest(request)) {
        return;
      }
      message.error(getErrorMessage(error, '搜索人员失败'));
    } finally {
      if (isLatestStateRequest(request)) {
        loading.value = false;
      }
    }
  }

  function handleSearchClear() {
    createStateRequest();
    searchKeyword.value = '';
    showBreadcrumb.value = true;
    currentNodes.value = rootNodes.value;
    syncCurrentNodeChecked();
  }

  async function handleSubmit() {
    if (!props.orgId) {
      message.warning('缺少组织信息，无法设置管理员');
      return;
    }

    // 仅提交与初始快照的差异，避免重复写入。
    const { addUserIds, removeIds } = resolveOrgManagerDelta(
      selectedUsers.value,
      originalManagers.value
    );

    if (addUserIds.length === 0 && removeIds.length === 0) {
      message.info('组织管理员未发生变化');
      visible.value = false;
      return;
    }

    saving.value = true;
    try {
      if (addUserIds.length > 0) {
        const saveResponse = await orgApi.addOrgManager({
          orgId: props.orgId,
          userId: addUserIds
        });

        if (saveResponse.code !== 200) {
          throw new Error(saveResponse.message || '设置组织管理员失败');
        }
      }

      if (removeIds.length > 0) {
        const removeResponse = await orgApi.delOrgManager({
          id: removeIds.join(',')
        });
        if (removeResponse.code !== 200) {
          throw new Error(removeResponse.message || '移除组织管理员失败');
        }
      }

      message.success('设置组织管理员成功');
      emit('success');
      visible.value = false;
    } catch (error) {
      message.error(getErrorMessage(error, '设置组织管理员失败'));
    } finally {
      saving.value = false;
    }
  }

  watch(
    () => [props.modelValue, props.orgId] as const,
    ([visibleValue]) => {
      if (!visibleValue) {
        invalidateDialogSession();
        return;
      }

      void initDialog();
    },
    { immediate: true }
  );

  return {
    visible,
    loading,
    saving,
    searchKeyword,
    breadcrumbs,
    showBreadcrumb,
    currentNodes,
    selectedUsers,
    selectedUserIdSet,
    actions: {
      enterOrgNode,
      gotoBreadcrumb,
      toggleUser,
      removeSelectedById,
      clearSelected,
      handleSearch,
      handleSearchClear,
      handleSubmit
    }
  };
}
