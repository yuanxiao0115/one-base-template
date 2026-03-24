import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const messageMocks = vi.hoisted(() => ({
  error: vi.fn()
}));

const apiMocks = vi.hoisted(() => ({
  listRoles: vi.fn()
}));

vi.mock('@one-base-template/ui', async () => {
  const actual =
    await vi.importActual<typeof import('@one-base-template/ui')>('@one-base-template/ui');

  return {
    ...actual,
    message: messageMocks
  };
});

vi.mock('../api', () => ({
  roleAssignApi: apiMocks
}));

import { useRoleAssignRoleSidebar } from './useRoleAssignRoleSidebar';

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

function mountUseRoleAssignRoleSidebar() {
  const onRoleActivated = vi.fn(async () => undefined);
  const onRolesEmpty = vi.fn();
  let sidebar: ReturnType<typeof useRoleAssignRoleSidebar> | null = null;

  const TestComponent = defineComponent({
    setup() {
      sidebar = useRoleAssignRoleSidebar({
        onRoleActivated,
        onRolesEmpty
      });
      return () => h('div');
    }
  });

  const wrapper = mount(TestComponent);

  if (!sidebar) {
    throw new Error('useRoleAssignRoleSidebar 挂载失败');
  }

  const resolvedSidebar = sidebar as ReturnType<typeof useRoleAssignRoleSidebar>;

  return {
    sidebar: resolvedSidebar,
    onRoleActivated,
    onRolesEmpty,
    unmount: () => wrapper.unmount()
  };
}

describe('UserManagement/role-assign/useRoleAssignRoleSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('加载角色列表后应默认激活首个角色', async () => {
    apiMocks.listRoles.mockResolvedValue({
      code: 200,
      data: [
        { id: 'role-1', roleName: '角色一' },
        { id: 'role-2', roleName: '角色二' }
      ]
    });

    const { sidebar, onRoleActivated, unmount } = mountUseRoleAssignRoleSidebar();

    await sidebar.actions.loadRoleList({ keepCurrent: false });

    expect(sidebar.roles.roleList.value).toHaveLength(2);
    expect(sidebar.roles.currentRole.value).toEqual({ id: 'role-1', roleName: '角色一' });
    expect(onRoleActivated).toHaveBeenCalledWith({
      role: { id: 'role-1', roleName: '角色一' },
      roleChanged: true
    });

    unmount();
  });

  it('角色列表为空时应清空当前角色并通知下游清空列表', async () => {
    apiMocks.listRoles.mockResolvedValue({
      code: 200,
      data: []
    });

    const { sidebar, onRolesEmpty, unmount } = mountUseRoleAssignRoleSidebar();
    sidebar.roles.roleKeyword.value = '管理员';

    await sidebar.actions.loadRoleList();

    expect(sidebar.roles.roleList.value).toEqual([]);
    expect(sidebar.roles.currentRole.value).toBeNull();
    expect(onRolesEmpty).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('角色搜索慢响应不应覆盖后到达的最新结果', async () => {
    const firstResponse = createDeferred<{
      code: number;
      data: Array<{ id: string; roleName: string }>;
    }>();
    const secondResponse = createDeferred<{
      code: number;
      data: Array<{ id: string; roleName: string }>;
    }>();

    apiMocks.listRoles.mockImplementation(({ roleName }: { roleName?: string }) => {
      if (roleName === '管理员') {
        return firstResponse.promise;
      }

      return secondResponse.promise;
    });

    const { sidebar, unmount } = mountUseRoleAssignRoleSidebar();

    sidebar.actions.onRoleKeywordUpdate('管理员');
    const firstTask = sidebar.actions.loadRoleList();
    sidebar.actions.onRoleKeywordUpdate('访客');
    const secondTask = sidebar.actions.loadRoleList();

    secondResponse.resolve({
      code: 200,
      data: [{ id: 'role-2', roleName: '访客角色' }]
    });

    await secondTask;

    expect(sidebar.roles.roleList.value).toEqual([{ id: 'role-2', roleName: '访客角色' }]);
    expect(sidebar.roles.currentRole.value).toEqual({ id: 'role-2', roleName: '访客角色' });

    firstResponse.resolve({
      code: 200,
      data: [{ id: 'role-1', roleName: '管理员角色' }]
    });

    await firstTask;

    expect(sidebar.roles.roleList.value).toEqual([{ id: 'role-2', roleName: '访客角色' }]);
    expect(sidebar.roles.currentRole.value).toEqual({ id: 'role-2', roleName: '访客角色' });

    unmount();
  });
});
