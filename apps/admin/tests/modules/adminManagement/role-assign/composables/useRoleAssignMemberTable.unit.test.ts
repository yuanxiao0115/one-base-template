import { mount } from '@vue/test-utils';
import { defineComponent, h, ref, type Ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const tableMocks = vi.hoisted(() => ({
  loading: null as Ref<boolean> | null,
  dataList: null as Ref<unknown[]> | null,
  selectedList: null as Ref<unknown[]> | null,
  selectedNum: null as Ref<number> | null,
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0
  },
  onSearch: vi.fn(async () => undefined),
  clearData: vi.fn(),
  onSelectionCancel: vi.fn(),
  handleSelectionChange: vi.fn(),
  handleSizeChange: vi.fn(),
  handleCurrentChange: vi.fn(),
  useTable: vi.fn()
}));

vi.mock('@one-base-template/core', () => ({
  useTable: tableMocks.useTable
}));

import { useRoleAssignMemberTable } from '@/modules/adminManagement/role-assign/composables/useRoleAssignMemberTable';

function mountUseRoleAssignMemberTable() {
  const currentRole = ref<{ id: string; roleName: string } | null>(null);
  const tableRef = ref<unknown>(null);
  const onRemoved = vi.fn(async () => undefined);
  let memberTable: ReturnType<typeof useRoleAssignMemberTable> | null = null;

  const TestComponent = defineComponent({
    setup() {
      memberTable = useRoleAssignMemberTable({
        currentRole,
        tableRef,
        onRemoved
      });
      return () => h('div');
    }
  });

  const wrapper = mount(TestComponent);

  if (!memberTable) {
    throw new Error('useRoleAssignMemberTable 挂载失败');
  }

  const resolvedMemberTable = memberTable as ReturnType<typeof useRoleAssignMemberTable>;

  return {
    currentRole,
    memberTable: resolvedMemberTable,
    onRemoved,
    unmount: () => wrapper.unmount()
  };
}

describe('UserManagement/role-assign/useRoleAssignMemberTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableMocks.loading = ref(false);
    tableMocks.dataList = ref([]);
    tableMocks.selectedList = ref([]);
    tableMocks.selectedNum = ref(0);
    tableMocks.pagination.currentPage = 1;
    tableMocks.pagination.pageSize = 10;
    tableMocks.pagination.total = 0;
    tableMocks.useTable.mockReturnValue({
      loading: tableMocks.loading,
      dataList: tableMocks.dataList,
      pagination: tableMocks.pagination,
      selectedNum: tableMocks.selectedNum,
      selectedList: tableMocks.selectedList,
      onSearch: tableMocks.onSearch,
      clearData: tableMocks.clearData,
      onSelectionCancel: tableMocks.onSelectionCancel,
      handleSelectionChange: tableMocks.handleSelectionChange,
      handleSizeChange: tableMocks.handleSizeChange,
      handleCurrentChange: tableMocks.handleCurrentChange
    });
  });

  it('角色切换时应清空关键字、取消选中并刷新成员列表', async () => {
    const { memberTable, currentRole, unmount } = mountUseRoleAssignMemberTable();

    memberTable.table.searchForm.keyWord = '张三';
    currentRole.value = {
      id: 'role-1',
      roleName: '角色一'
    };

    await memberTable.actions.applyRoleChange(true);

    expect(memberTable.table.searchForm.keyWord).toBe('');
    expect(tableMocks.onSelectionCancel).toHaveBeenCalledTimes(1);
    expect(tableMocks.onSearch).toHaveBeenCalledTimes(1);
    expect(memberTable.table.currentRoleName.value).toBe('角色一');

    unmount();
  });

  it('无可用角色时应清空关键字并清空当前表格数据', () => {
    const { memberTable, unmount } = mountUseRoleAssignMemberTable();

    memberTable.table.searchForm.keyWord = '张三';
    memberTable.actions.clearForNoRole();

    expect(memberTable.table.searchForm.keyWord).toBe('');
    expect(tableMocks.onSelectionCancel).toHaveBeenCalledTimes(1);
    expect(tableMocks.clearData).toHaveBeenCalledTimes(1);

    unmount();
  });
});
