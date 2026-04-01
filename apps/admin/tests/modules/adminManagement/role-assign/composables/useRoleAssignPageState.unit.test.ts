import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const messageMocks = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
  success: vi.fn(),
  warning: vi.fn()
}));

const apiMocks = vi.hoisted(() => ({
  addMembers: vi.fn(),
  listMembers: vi.fn(),
  listRoles: vi.fn(),
  listMembersByPage: vi.fn(),
  removeMembers: vi.fn()
}));

vi.mock('@one-base-template/ui', async () => {
  const actual =
    await vi.importActual<typeof import('@one-base-template/ui')>('@one-base-template/ui');

  return {
    ...actual,
    message: messageMocks
  };
});

vi.mock('@one-base-template/core', async () => {
  const actual =
    await vi.importActual<typeof import('@one-base-template/core')>('@one-base-template/core');

  return {
    ...actual,
    useAuthStore: () => ({
      user: {
        companyId: 'company-1'
      }
    })
  };
});

vi.mock('@/modules/adminManagement/role-assign/api', () => ({
  roleAssignApi: apiMocks
}));

import { useRoleAssignPageState } from '@/modules/adminManagement/role-assign/composables/useRoleAssignPageState';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject
  };
}

function mountUseRoleAssignPageState() {
  let pageState: ReturnType<typeof useRoleAssignPageState> | null = null;

  const TestComponent = defineComponent({
    setup() {
      pageState = useRoleAssignPageState();
      return () => h('div');
    }
  });

  const wrapper = mount(TestComponent);

  if (!pageState) {
    throw new Error('useRoleAssignPageState 挂载失败');
  }

  const resolvedPageState = pageState as ReturnType<typeof useRoleAssignPageState>;

  return {
    pageState: resolvedPageState,
    unmount: () => wrapper.unmount()
  };
}

describe('UserManagement/role-assign/useRoleAssignPageState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.listRoles.mockResolvedValue({
      code: 200,
      data: [
        {
          id: 'role-1',
          roleName: '角色一'
        }
      ]
    });
    apiMocks.listMembersByPage.mockResolvedValue({
      code: 200,
      data: {
        records: [],
        total: 0,
        currentPage: 1,
        pageSize: 10
      }
    });
    apiMocks.listMembers.mockResolvedValue({
      code: 200,
      data: []
    });
  });

  it('打开添加人员弹窗时应就地写入初始已选人员', async () => {
    apiMocks.listMembers.mockResolvedValueOnce({
      code: 200,
      data: [
        {
          id: 'user-1',
          nickName: '张三',
          userAccount: 'zhangsan',
          phone: '13800000000'
        }
      ]
    });

    const { pageState, unmount } = mountUseRoleAssignPageState();

    await flushPromises();
    await pageState.actions.openAddMembersDialog();
    await flushPromises();

    expect(pageState.dialogs.memberForm.userIds).toEqual(['user-1']);
    expect(pageState.dialogs.memberDialogSelectedUsers.value).toEqual([
      {
        id: 'user-1',
        nodeType: 'user',
        title: '张三',
        subTitle: '13800000000',
        nickName: '张三',
        userAccount: 'zhangsan',
        phone: '13800000000'
      }
    ]);

    unmount();
  });

  it('弹窗关闭后应忽略过期的成员初始化响应', async () => {
    const pendingResponse = createDeferred<{
      code: number;
      data: Array<{ id: string; nickName: string; userAccount: string }>;
    }>();
    apiMocks.listMembers.mockImplementationOnce(() => pendingResponse.promise);

    const { pageState, unmount } = mountUseRoleAssignPageState();

    await flushPromises();
    const openTask = pageState.actions.openAddMembersDialog();
    pageState.actions.closeAddMembersDialog();

    pendingResponse.resolve({
      code: 200,
      data: [
        {
          id: 'user-1',
          nickName: '张三',
          userAccount: 'zhangsan'
        }
      ]
    });

    await openTask;
    await flushPromises();

    expect(pageState.dialogs.memberDialogVisible.value).toBe(false);
    expect(pageState.dialogs.memberForm.userIds).toEqual([]);
    expect(pageState.dialogs.memberDialogSelectedUsers.value).toEqual([]);

    unmount();
  });
});
