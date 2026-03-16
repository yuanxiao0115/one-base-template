import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import type { CrudFormLike } from '@one-base-template/ui';
import { useAuthStore, useTable } from '@one-base-template/core';
import { message } from '@one-base-template/ui';
import {
  fetchPersonnelTreeByLegacyApi,
  resolvePersonnelRootParentId,
  searchPersonnelUsersByStructure
} from '@/components/PersonnelSelector/contactDataSource';
import type { PersonnelNode, PersonnelUserNode } from '@/components/PersonnelSelector/types';
import roleAssignColumns from '../columns';
import { roleAssignApi } from '../api';
import type { RoleMemberRecord, RoleOption } from '../types';
import type { RoleAssignUserOption } from '../components/RoleAssignMemberSelectForm.vue';

type MemberSelectFormExpose = CrudFormLike & {
  loadRootNodes?: () => Promise<void>;
  setSelectedUsers?: (users: RoleAssignUserOption[]) => void;
};

interface RoleAssignMemberForm {
  userIds: string[];
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function getRoleMemberName(record: RoleMemberRecord): string {
  return record.nickName || record.userAccount || record.id;
}

function toRoleAssignUserOptions(records: RoleMemberRecord[]): RoleAssignUserOption[] {
  return records.map((item) => {
    const nickName = item.nickName || item.userAccount || item.id;
    const userAccount = item.userAccount || item.id;

    return {
      id: item.id,
      nodeType: 'user',
      title: nickName,
      subTitle: userAccount || '--',
      nickName,
      userAccount,
      phone: ''
    };
  });
}

function buildRemoveConfirmName(names: string[]): string {
  if (names.length <= 5) {
    return names.join('、');
  }
  return `${names.slice(0, 5).join('、')} 等${names.length}人`;
}

export function useRoleAssignPageState() {
  const authStore = useAuthStore();

  const tableRef = ref<unknown>(null);
  const memberFormRef = ref<MemberSelectFormExpose>();

  const roleLoading = ref(false);
  const roleKeyword = ref('');
  const roleList = ref<RoleOption[]>([]);
  const currentRole = ref<RoleOption | null>(null);

  const memberDialogVisible = ref(false);
  const memberDialogLoading = ref(false);
  const memberDialogSubmitting = ref(false);
  const originalMembers = ref<RoleMemberRecord[]>([]);

  const searchForm = reactive({
    roleId: '',
    keyWord: ''
  });

  const memberForm = reactive<RoleAssignMemberForm>({
    userIds: []
  });

  const tableOpt = reactive({
    query: {
      api: async (params: Record<string, unknown>) => {
        const roleId = String(params.roleId ?? '');
        const currentPage = Number(params.currentPage ?? 1);
        const pageSize = Number(params.pageSize ?? 10);
        const keyWord = String(params.keyWord ?? '');

        if (!roleId) {
          return {
            code: 200,
            data: {
              records: [],
              total: 0,
              currentPage,
              pageSize
            }
          };
        }

        return roleAssignApi.pageMembers({
          roleId,
          keyWord,
          currentPage,
          pageSize
        });
      },
      params: searchForm,
      pagination: true,
      immediate: false,
      paginationKey: {
        current: 'currentPage',
        size: 'pageSize'
      }
    }
  });

  const {
    loading,
    dataList,
    pagination,
    selectedNum,
    selectedList,
    onSearch,
    clearData,
    onSelectionCancel,
    handleSelectionChange,
    handleSizeChange,
    handleCurrentChange
  } = useTable(tableOpt, tableRef);

  const tableColumns = computed(() => roleAssignColumns);
  const tablePagination = computed(() => ({
    ...pagination
  }));
  const currentRoleName = computed(() => currentRole.value?.roleName || '角色分配');
  const rootParentId = computed(() => resolvePersonnelRootParentId(authStore.user));

  function resetMemberForm() {
    memberForm.userIds = [];
    originalMembers.value = [];
  }

  async function selectRole(role: RoleOption) {
    if (!role.id) {
      return;
    }

    const roleChanged = currentRole.value?.id !== role.id;
    currentRole.value = role;
    searchForm.roleId = role.id;
    onSelectionCancel();

    if (roleChanged) {
      searchForm.keyWord = '';
    }

    await onSearch();
  }

  async function loadRoleList(options?: { keepCurrent?: boolean }) {
    const keepCurrent = options?.keepCurrent !== false;
    roleLoading.value = true;

    try {
      const response = await roleAssignApi.listRoles({
        roleName: roleKeyword.value
      });
      if (response.code !== 200) {
        throw new Error(response.message || '加载角色列表失败');
      }

      const rows = Array.isArray(response.data) ? response.data : [];
      roleList.value = rows;

      if (rows.length === 0) {
        currentRole.value = null;
        searchForm.roleId = '';
        searchForm.keyWord = '';
        onSelectionCancel();
        clearData();
        return;
      }

      const currentRoleId = keepCurrent ? currentRole.value?.id : '';
      const nextRole = (currentRoleId && rows.find((item) => item.id === currentRoleId)) || rows[0];
      if (!nextRole) {
        return;
      }
      await selectRole(nextRole);
    } catch (error) {
      message.error(getErrorMessage(error, '加载角色列表失败'));
    } finally {
      roleLoading.value = false;
    }
  }

  function onRoleKeywordUpdate(value: string) {
    roleKeyword.value = value.trim();
  }

  function onRoleKeywordSearch() {
    void loadRoleList();
  }

  function onRoleKeywordClear() {
    roleKeyword.value = '';
    void loadRoleList();
  }

  function tableSearch(keyword: string) {
    searchForm.keyWord = keyword;
    void onSearch();
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.keyWord = keyword;
  }

  function onResetSearch() {
    searchForm.keyWord = '';
    void onSearch();
  }

  function onSelectionCancelAction() {
    onSelectionCancel();
  }

  async function removeMembersByIds(ids: string[], names: string[]) {
    const roleId = currentRole.value?.id;
    if (!roleId) {
      message.warning('请先选择角色');
      return;
    }

    if (ids.length === 0) {
      message.warning('请先选择用户');
      return;
    }

    const displayNames = buildRemoveConfirmName(names);

    try {
      await obConfirm.warn(`您确认要移除用户 ${displayNames} 吗？`, '删除确认');
      const response = await roleAssignApi.removeMembers({
        roleId,
        userIdList: ids
      });
      if (response.code !== 200) {
        throw new Error(response.message || '移除人员失败');
      }

      message.success('移除人员成功');
      onSelectionCancel();
      await loadRoleList();
    } catch (error) {
      if (error === 'cancel' || error === 'close') {
        return;
      }
      message.error(getErrorMessage(error, '移除人员失败'));
    }
  }

  async function handleRemove(row?: RoleMemberRecord) {
    if (row) {
      await removeMembersByIds([row.id], [getRoleMemberName(row)]);
      return;
    }

    const rows = selectedList.value as RoleMemberRecord[];
    const ids = rows.map((item) => item.id).filter(Boolean);
    const names = rows.map(getRoleMemberName);
    await removeMembersByIds(ids, names);
  }

  async function fetchContactNodes(parentId?: string): Promise<PersonnelNode[]> {
    const normalizedParentId = parentId?.trim() ? parentId : rootParentId.value;
    const response = await fetchPersonnelTreeByLegacyApi({
      parentId: normalizedParentId
    });
    if (response.code !== 200) {
      throw new Error(response.message || '加载组织通讯录失败');
    }

    return Array.isArray(response.data) ? response.data : [];
  }

  async function searchContactUsers(keyword: string): Promise<PersonnelUserNode[]> {
    const response = await searchPersonnelUsersByStructure({
      search: keyword
    });
    if (response.code !== 200) {
      throw new Error(response.message || '搜索人员失败');
    }

    return Array.isArray(response.data) ? response.data : [];
  }

  async function openAddMembersDialog() {
    const role = currentRole.value;
    if (!role?.id) {
      message.warning('请先选择角色');
      return;
    }

    memberDialogVisible.value = true;
    memberDialogLoading.value = true;
    resetMemberForm();

    try {
      const response = await roleAssignApi.listMembers({ roleId: role.id });
      if (response.code !== 200) {
        throw new Error(response.message || '加载角色成员失败');
      }

      const rows = Array.isArray(response.data) ? response.data : [];
      originalMembers.value = rows;
      memberForm.userIds = rows.map((item) => item.id).filter(Boolean);

      await nextTick();
      memberFormRef.value?.setSelectedUsers?.(toRoleAssignUserOptions(rows));
      await memberFormRef.value?.loadRootNodes?.();
    } catch (error) {
      message.error(getErrorMessage(error, '加载角色成员失败'));
    } finally {
      memberDialogLoading.value = false;
    }
  }

  function closeAddMembersDialog() {
    resetMemberForm();
    memberDialogVisible.value = false;
  }

  async function submitAddMembersDialog() {
    if (memberDialogSubmitting.value) {
      return;
    }

    const role = currentRole.value;
    if (!role?.id) {
      message.warning('请先选择角色');
      return;
    }

    const isValid = await memberFormRef.value?.validate?.();
    if (isValid === false) {
      return;
    }

    memberDialogSubmitting.value = true;
    try {
      const selectedIds = Array.from(new Set(memberForm.userIds.filter(Boolean)));
      const originalIds = Array.from(
        new Set(originalMembers.value.map((item) => item.id).filter(Boolean))
      );

      const originalSet = new Set(originalIds);
      const selectedSet = new Set(selectedIds);

      const addIds = selectedIds.filter((id) => !originalSet.has(id));
      const removeIds = originalIds.filter((id) => !selectedSet.has(id));

      if (addIds.length === 0 && removeIds.length === 0) {
        message.info('角色成员未发生变化');
        closeAddMembersDialog();
        return;
      }

      if (removeIds.length > 0) {
        const removeResponse = await roleAssignApi.removeMembers({
          roleId: role.id,
          userIdList: removeIds
        });
        if (removeResponse.code !== 200) {
          throw new Error(removeResponse.message || '移除角色成员失败');
        }
      }

      if (addIds.length > 0) {
        const addResponse = await roleAssignApi.addMembers({
          roleId: role.id,
          userIdList: addIds
        });
        if (addResponse.code !== 200) {
          throw new Error(addResponse.message || '添加角色成员失败');
        }
      }

      message.success('角色成员保存成功');
      closeAddMembersDialog();
      onSelectionCancel();
      await loadRoleList();
    } catch (error) {
      message.error(getErrorMessage(error, '角色成员保存失败'));
    } finally {
      memberDialogSubmitting.value = false;
    }
  }

  onMounted(() => {
    void loadRoleList({ keepCurrent: false });
  });

  return {
    refs: {
      tableRef,
      memberFormRef
    },
    table: {
      loading,
      dataList,
      tableColumns,
      tablePagination,
      selectedNum,
      searchForm,
      currentRoleName
    },
    roles: {
      roleLoading,
      roleKeyword,
      roleList,
      currentRole
    },
    dialogs: {
      memberDialogVisible,
      memberDialogLoading,
      memberDialogSubmitting,
      memberForm
    },
    actions: {
      onRoleKeywordUpdate,
      onRoleKeywordSearch,
      onRoleKeywordClear,
      selectRole,
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      onSelectionCancel: onSelectionCancelAction,
      handleRemove,
      fetchContactNodes,
      searchContactUsers,
      openAddMembersDialog,
      closeAddMembersDialog,
      submitAddMembersDialog
    }
  };
}
