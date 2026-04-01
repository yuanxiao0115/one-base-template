import { ref } from 'vue';
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

vi.mock('@/modules/adminManagement/role-assign/api', () => ({
  roleAssignApi: apiMocks
}));

import { useRoleAssignMemberDialog } from '@/modules/adminManagement/role-assign/composables/useRoleAssignMemberDialog';

describe('UserManagement/role-assign/useRoleAssignMemberDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('移除旧成员失败时应回滚本次新增，避免半成功落库', async () => {
    apiMocks.listMembers.mockResolvedValue({
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
    apiMocks.addMembers.mockResolvedValue({
      code: 200
    });
    apiMocks.removeMembers.mockImplementation(({ userIdList }: { userIdList: string[] }) => {
      if (userIdList.includes('user-1')) {
        return Promise.resolve({
          code: 500,
          message: '移除旧成员失败'
        });
      }

      return Promise.resolve({
        code: 200
      });
    });

    const dialog = useRoleAssignMemberDialog({
      currentRole: ref({
        id: 'role-1',
        roleName: '角色一'
      }),
      memberFormRef: ref({
        validate: vi.fn(async () => true)
      }),
      rootParentId: ref('company-1'),
      onSaved: vi.fn(async () => undefined)
    });

    await dialog.actions.openAddMembersDialog();
    dialog.dialogs.memberForm.userIds = ['user-2'];

    await dialog.actions.submitAddMembersDialog();

    expect(apiMocks.addMembers).toHaveBeenCalledWith({
      roleId: 'role-1',
      userIdList: ['user-2']
    });
    expect(apiMocks.removeMembers).toHaveBeenNthCalledWith(1, {
      roleId: 'role-1',
      userIdList: ['user-1']
    });
    expect(apiMocks.removeMembers).toHaveBeenNthCalledWith(2, {
      roleId: 'role-1',
      userIdList: ['user-2']
    });
    expect(messageMocks.error).toHaveBeenCalledWith(
      '移除旧成员失败，已自动回滚本次新增成员，请重试'
    );
  });

  it('回滚新增成员也失败时应提示完整错误信息', async () => {
    apiMocks.listMembers.mockResolvedValue({
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
    apiMocks.addMembers.mockResolvedValue({
      code: 200
    });
    apiMocks.removeMembers.mockImplementation(({ userIdList }: { userIdList: string[] }) => {
      if (userIdList.includes('user-1')) {
        return Promise.resolve({
          code: 500,
          message: '移除旧成员失败'
        });
      }

      return Promise.resolve({
        code: 500,
        message: '回滚也失败'
      });
    });

    const dialog = useRoleAssignMemberDialog({
      currentRole: ref({
        id: 'role-1',
        roleName: '角色一'
      }),
      memberFormRef: ref({
        validate: vi.fn(async () => true)
      }),
      rootParentId: ref('company-1'),
      onSaved: vi.fn(async () => undefined)
    });

    await dialog.actions.openAddMembersDialog();
    dialog.dialogs.memberForm.userIds = ['user-2'];

    await dialog.actions.submitAddMembersDialog();

    expect(apiMocks.removeMembers).toHaveBeenNthCalledWith(1, {
      roleId: 'role-1',
      userIdList: ['user-1']
    });
    expect(apiMocks.removeMembers).toHaveBeenNthCalledWith(2, {
      roleId: 'role-1',
      userIdList: ['user-2']
    });
    expect(messageMocks.error).toHaveBeenCalledWith(
      '移除旧成员失败，且回滚新增成员失败：回滚也失败'
    );
  });
});
