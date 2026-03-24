import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it, vi } from 'vite-plus/test';

const messageMocks = vi.hoisted(() => ({
  error: vi.fn()
}));

vi.mock('@one-base-template/ui', async () => {
  const actual =
    await vi.importActual<typeof import('@one-base-template/ui')>('@one-base-template/ui');

  return {
    ...actual,
    message: messageMocks
  };
});

import RoleAssignMemberSelectForm from './RoleAssignMemberSelectForm.vue';

function createStubs(options?: {
  loadRootNodes?: ReturnType<typeof vi.fn>;
  setSelectedUsers?: ReturnType<typeof vi.fn>;
}) {
  const formMethods = {
    validate: vi.fn(async () => true),
    clearValidate: vi.fn(),
    resetFields: vi.fn()
  };
  const loadRootNodes = options?.loadRootNodes || vi.fn(async () => undefined);
  const setSelectedUsers = options?.setSelectedUsers || vi.fn();

  const ElForm = defineComponent({
    name: 'ElForm',
    setup(_, { expose, slots }) {
      expose(formMethods);
      return () => h('form', slots.default?.());
    }
  });

  const ElFormItem = defineComponent({
    name: 'ElFormItem',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    }
  });

  const PersonnelSelector = defineComponent({
    name: 'PersonnelSelector',
    setup(_, { expose }) {
      expose({
        loadRootNodes,
        setSelectedUsers
      });

      return () => h('div', { 'data-testid': 'personnel-selector' });
    }
  });

  return {
    formMethods,
    loadRootNodes,
    setSelectedUsers,
    stubs: {
      ElForm,
      ElFormItem,
      PersonnelSelector
    }
  };
}

describe('RoleAssignMemberSelectForm', () => {
  it('应在挂载后加载根节点并同步初始已选人员', async () => {
    const { loadRootNodes, setSelectedUsers, stubs } = createStubs();

    mount(RoleAssignMemberSelectForm, {
      props: {
        modelValue: {
          userIds: ['user-1']
        },
        disabled: false,
        initialSelectedUsers: [
          {
            id: 'user-1',
            nodeType: 'user',
            title: '张三',
            subTitle: '13800000000',
            nickName: '张三',
            userAccount: 'zhangsan',
            phone: '13800000000'
          }
        ],
        fetchNodes: vi.fn(async () => []),
        searchNodes: vi.fn(async () => []),
        'onUpdate:modelValue': vi.fn()
      },
      global: {
        stubs
      }
    });

    await flushPromises();

    expect(loadRootNodes).toHaveBeenCalledTimes(1);
    expect(setSelectedUsers).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'user-1',
        subTitle: '13800000000'
      })
    ]);
  });

  it('初始化根节点失败时应提示错误而不是抛出未处理异常', async () => {
    const { stubs } = createStubs({
      loadRootNodes: vi.fn(async () => {
        throw new Error('加载组织通讯录失败');
      })
    });

    mount(RoleAssignMemberSelectForm, {
      props: {
        modelValue: {
          userIds: []
        },
        disabled: false,
        initialSelectedUsers: [],
        fetchNodes: vi.fn(async () => []),
        searchNodes: vi.fn(async () => []),
        'onUpdate:modelValue': vi.fn()
      },
      global: {
        stubs
      }
    });

    await flushPromises();

    expect(messageMocks.error).toHaveBeenCalledWith('加载组织通讯录失败');
  });

  it('仅暴露通用表单句柄', async () => {
    const { formMethods, stubs } = createStubs();

    const wrapper = mount(RoleAssignMemberSelectForm, {
      props: {
        modelValue: {
          userIds: []
        },
        disabled: false,
        initialSelectedUsers: [],
        fetchNodes: vi.fn(async () => []),
        searchNodes: vi.fn(async () => []),
        'onUpdate:modelValue': vi.fn()
      },
      global: {
        stubs
      }
    });

    const exposed = wrapper.vm as unknown as {
      validate: () => Promise<unknown>;
      clearValidate: () => void;
      resetFields: () => void;
    };

    expect(Object.keys(exposed).sort()).toEqual(['clearValidate', 'resetFields', 'validate']);

    await exposed.validate();
    exposed.clearValidate();
    exposed.resetFields();

    expect(formMethods.validate).toHaveBeenCalledTimes(1);
    expect(formMethods.clearValidate).toHaveBeenCalledTimes(1);
    expect(formMethods.resetFields).toHaveBeenCalledTimes(1);
  });
});
