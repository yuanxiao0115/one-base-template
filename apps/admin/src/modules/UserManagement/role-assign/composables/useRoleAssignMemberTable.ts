import { computed, reactive, type Ref } from 'vue';
import { useTable } from '@one-base-template/core';
import { message } from '@one-base-template/ui';
import roleAssignColumns from '../columns';
import { roleAssignApi } from '../api';
import type { RoleMemberRecord, RoleOption } from '../types';
import { confirmWarn, isConfirmCancelled } from '../../shared/confirm';

interface UseRoleAssignMemberTableOptions {
  currentRole: Ref<RoleOption | null>;
  tableRef: Ref<unknown>;
  onRemoved: () => Promise<void>;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function getRoleMemberName(record: RoleMemberRecord): string {
  return record.nickName || record.userAccount || record.id;
}

function buildRemoveConfirmName(names: string[]): string {
  if (names.length <= 5) {
    return names.join('、');
  }
  return `${names.slice(0, 5).join('、')} 等${names.length}人`;
}

export function useRoleAssignMemberTable(options: UseRoleAssignMemberTableOptions) {
  const searchForm = reactive({
    keyWord: ''
  });

  const tableOpt = reactive({
    query: {
      api: async (params: Record<string, unknown>) => {
        const roleId = options.currentRole.value?.id || '';
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

        return roleAssignApi.listMembersByPage({
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
  } = useTable(tableOpt, options.tableRef);

  const tableColumns = computed(() => roleAssignColumns);
  const tablePagination = computed(() => ({
    ...pagination
  }));
  const currentRoleName = computed(() => options.currentRole.value?.roleName || '角色分配');

  async function applyRoleChange(roleChanged: boolean) {
    onSelectionCancel();
    if (roleChanged) {
      searchForm.keyWord = '';
    }

    await onSearch();
  }

  function clearForNoRole() {
    searchForm.keyWord = '';
    onSelectionCancel();
    clearData();
  }

  function clearSelection() {
    onSelectionCancel();
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
    const roleId = options.currentRole.value?.id;
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
      await confirmWarn(`您确认要移除用户 ${displayNames} 吗？`, '删除确认');
      const response = await roleAssignApi.removeMembers({
        roleId,
        userIdList: ids
      });
      if (response.code !== 200) {
        throw new Error(response.message || '移除人员失败');
      }

      message.success('移除人员成功');
      clearSelection();
      await options.onRemoved();
    } catch (error) {
      if (isConfirmCancelled(error)) {
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

  return {
    table: {
      loading,
      dataList,
      tableColumns,
      tablePagination,
      selectedNum,
      searchForm,
      currentRoleName
    },
    actions: {
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      onSelectionCancel: onSelectionCancelAction,
      handleRemove,
      applyRoleChange,
      clearForNoRole,
      clearSelection
    }
  };
}
