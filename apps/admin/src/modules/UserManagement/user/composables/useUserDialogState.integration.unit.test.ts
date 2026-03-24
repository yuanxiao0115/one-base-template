import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const apiMocks = vi.hoisted(() => ({
  detail: vi.fn(),
  listUsers: vi.fn(),
  updateCorporateUser: vi.fn()
}));

const messageMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn()
}));

vi.mock('@/config/basic/crypto', () => ({
  sm4EncryptBase64: vi.fn((value: string) => `enc(${value})`)
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
  userApi: apiMocks
}));

import UserBindAccountForm from '../components/UserBindAccountForm.vue';
import { useUserDialogState } from './useUserDialogState';

function createElementStubs() {
  const formMethods = {
    validate: vi.fn(async () => true),
    clearValidate: vi.fn(),
    resetFields: vi.fn()
  };

  const ElForm = defineComponent({
    name: 'ElForm',
    setup(_, { expose, slots }) {
      expose(formMethods);
      return () => h('form', slots.default?.());
    }
  });

  const passthrough = (name: string) =>
    defineComponent({
      name,
      setup(_, { slots }) {
        return () => h('div', slots.default?.());
      }
    });

  const ElTag = defineComponent({
    name: 'ElTag',
    props: {
      closable: Boolean
    },
    setup(_, { slots }) {
      return () => h('span', slots.default?.());
    }
  });

  return {
    formMethods,
    stubs: {
      ElForm,
      ElFormItem: passthrough('ElFormItem'),
      ElSelect: passthrough('ElSelect'),
      ElOption: passthrough('ElOption'),
      ElTag
    }
  };
}

describe('UserManagement/user/useUserDialogState integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.listUsers.mockResolvedValue({
      code: 200,
      data: []
    });
    apiMocks.updateCorporateUser.mockResolvedValue({
      code: 200,
      data: true
    });
  });

  it('打开关联账号弹窗后应通过子表单展示初始账号，并可直接提交当前 userIds', async () => {
    apiMocks.detail.mockResolvedValue({
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

    const { stubs } = createElementStubs();
    let dialogState: ReturnType<typeof useUserDialogState> | null = null;

    const TestComponent = defineComponent({
      setup() {
        dialogState = useUserDialogState({
          onSearch: vi.fn(async () => undefined)
        });

        return () =>
          h(UserBindAccountForm, {
            ref: dialogState!.refs.bindFormRef,
            modelValue: dialogState!.dialogs.bindForm,
            'onUpdate:modelValue': (value: { userIds: string[] }) => {
              dialogState!.dialogs.bindForm.userIds = value.userIds;
            },
            disabled: dialogState!.dialogs.bindLoading.value,
            initialSelectedUsers: dialogState!.dialogs.bindSelectedUsers.value,
            fetchUsers: dialogState!.actions.fetchBindUsers
          });
      }
    });

    const wrapper = mount(TestComponent, {
      global: {
        stubs
      }
    });

    if (!dialogState) {
      throw new Error('dialogState 挂载失败');
    }

    const resolvedDialogState = dialogState as ReturnType<typeof useUserDialogState>;

    await resolvedDialogState.actions.openBindDialog({
      id: 'corp-1'
    } as never);
    await flushPromises();

    expect(wrapper.text()).toContain('张三');
    expect(resolvedDialogState.dialogs.bindForm.userIds).toEqual(['user-1']);

    await resolvedDialogState.actions.submitBindDialog();

    expect(apiMocks.updateCorporateUser).toHaveBeenCalledWith({
      corporateUserId: 'corp-1',
      userIds: ['user-1']
    });
    expect(messageMocks.success).toHaveBeenCalledWith('关联账号保存成功');

    wrapper.unmount();
  });
});
