import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const cryptoMocks = vi.hoisted(() => ({
  sm4EncryptBase64: vi.fn((value: string) => `enc(${value})`)
}));

const messageMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn()
}));

const apiMocks = vi.hoisted(() => ({
  changeUserAccount: vi.fn(),
  detail: vi.fn(),
  searchUsers: vi.fn(),
  updateCorporateUser: vi.fn()
}));

vi.mock('@/infra/sczfw/crypto', () => cryptoMocks);

vi.mock('@one-base-template/ui', async () => {
  const actual =
    await vi.importActual<typeof import('@one-base-template/ui')>('@one-base-template/ui');

  return {
    ...actual,
    message: messageMocks
  };
});

vi.mock('../api', () => ({
  userApi: apiMocks
}));

import { useUserDialogState } from './useUserDialogState';

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

function mountUseUserDialogState() {
  let dialogState: ReturnType<typeof useUserDialogState> | null = null;

  const TestComponent = defineComponent({
    setup() {
      dialogState = useUserDialogState({
        onSearch: vi.fn(async () => undefined)
      });
      return () => h('div');
    }
  });

  const wrapper = mount(TestComponent);

  if (!dialogState) {
    throw new Error('useUserDialogState 挂载失败');
  }

  const resolvedDialogState = dialogState as ReturnType<typeof useUserDialogState>;

  return {
    dialogState: resolvedDialogState,
    unmount: () => wrapper.unmount()
  };
}

describe('UserManagement/user/useUserDialogState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.detail.mockResolvedValue({
      code: 200,
      data: {
        corporateUserList: []
      }
    });
  });

  it('打开关联账号弹窗时应就地写入初始已选账号', async () => {
    apiMocks.detail.mockResolvedValueOnce({
      code: 200,
      data: {
        corporateUserList: [
          {
            userId: 'user-1',
            userName: '张三',
            phone: '13800000000'
          }
        ]
      }
    });

    const { dialogState, unmount } = mountUseUserDialogState();

    await dialogState.actions.openBindDialog({
      id: 'corp-1'
    } as never);

    expect(dialogState.dialogs.bindForm.userIds).toEqual(['user-1']);
    expect(dialogState.dialogs.bindSelectedUsers.value).toEqual([
      {
        id: 'user-1',
        nickName: '张三',
        userAccount: '张三',
        phone: '13800000000'
      }
    ]);

    unmount();
  });

  it('快速切换目标用户时应忽略过期的关联账号响应', async () => {
    const firstResponse = createDeferred<{
      code: number;
      data: {
        corporateUserList: Array<{ userId: string; userName: string; phone: string }>;
      };
    }>();
    const secondResponse = createDeferred<{
      code: number;
      data: {
        corporateUserList: Array<{ userId: string; userName: string; phone: string }>;
      };
    }>();

    apiMocks.detail.mockImplementation(({ id }: { id: string }) => {
      if (id === 'corp-1') {
        return firstResponse.promise;
      }

      return secondResponse.promise;
    });

    const { dialogState, unmount } = mountUseUserDialogState();

    const firstTask = dialogState.actions.openBindDialog({
      id: 'corp-1'
    } as never);
    const secondTask = dialogState.actions.openBindDialog({
      id: 'corp-2'
    } as never);

    secondResponse.resolve({
      code: 200,
      data: {
        corporateUserList: [
          {
            userId: 'user-2',
            userName: '李四',
            phone: '13900000000'
          }
        ]
      }
    });

    await secondTask;
    await flushPromises();

    expect(dialogState.dialogs.bindForm.userIds).toEqual(['user-2']);
    expect(dialogState.dialogs.bindSelectedUsers.value).toEqual([
      {
        id: 'user-2',
        nickName: '李四',
        userAccount: '李四',
        phone: '13900000000'
      }
    ]);

    firstResponse.resolve({
      code: 200,
      data: {
        corporateUserList: [
          {
            userId: 'user-1',
            userName: '张三',
            phone: '13800000000'
          }
        ]
      }
    });

    await firstTask;
    await flushPromises();

    expect(dialogState.dialogs.bindForm.userIds).toEqual(['user-2']);
    expect(dialogState.dialogs.bindSelectedUsers.value).toEqual([
      {
        id: 'user-2',
        nickName: '李四',
        userAccount: '李四',
        phone: '13900000000'
      }
    ]);

    unmount();
  });

  it('关联账号搜索失败时应由弹窗状态统一兜底提示并返回空列表', async () => {
    apiMocks.searchUsers.mockResolvedValueOnce({
      code: 500,
      message: '搜索关联账号失败'
    });

    const { dialogState, unmount } = mountUseUserDialogState();

    await expect(dialogState.actions.fetchBindUsers('张三')).resolves.toEqual([]);
    expect(messageMocks.error).toHaveBeenCalledWith('搜索关联账号失败');

    unmount();
  });
});
