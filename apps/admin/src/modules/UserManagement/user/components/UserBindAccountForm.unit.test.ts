import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const messageMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn()
}));

vi.mock('@one-base-template/ui', async () => {
  const actual =
    await vi.importActual<typeof import('@one-base-template/ui')>('@one-base-template/ui');

  return {
    ...actual,
    message: messageMocks
  };
});

import UserBindAccountForm from './UserBindAccountForm.vue';

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

  const ElSelect = defineComponent({
    name: 'ElSelect',
    props: {
      remoteMethod: {
        type: Function,
        required: false
      }
    },
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    }
  });

  const ElTag = defineComponent({
    name: 'ElTag',
    setup(_, { slots }) {
      return () => h('span', slots.default?.());
    }
  });

  return {
    formMethods,
    stubs: {
      ElForm,
      ElFormItem: passthrough('ElFormItem'),
      ElSelect,
      ElOption: passthrough('ElOption'),
      ElTag
    }
  };
}

describe('UserBindAccountForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应通过 initialSelectedUsers 直接回填已选账号，并且 defineExpose 仅暴露表单句柄', async () => {
    const { formMethods, stubs } = createElementStubs();

    const wrapper = mount(UserBindAccountForm, {
      props: {
        modelValue: {
          userIds: ['u-1']
        },
        disabled: false,
        fetchUsers: vi.fn(async () => []),
        initialSelectedUsers: [
          {
            id: 'u-1',
            nickName: '张三',
            userAccount: 'zhangsan',
            phone: '13800000000'
          }
        ],
        'onUpdate:modelValue': vi.fn()
      },
      global: {
        stubs
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain('张三');
    expect(wrapper.text()).toContain('zhangsan');

    const exposed = wrapper.vm.$.exposed as {
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

  it('远程搜索失败时不应由子表单直接弹全局错误', async () => {
    vi.useFakeTimers();
    const { stubs } = createElementStubs();

    const wrapper = mount(UserBindAccountForm, {
      props: {
        modelValue: {
          userIds: []
        },
        disabled: false,
        fetchUsers: vi.fn(async () => {
          throw new Error('搜索关联账号失败');
        }),
        'onUpdate:modelValue': vi.fn()
      },
      global: {
        stubs
      }
    });

    const remoteMethod = wrapper.getComponent({ name: 'ElSelect' }).props('remoteMethod') as
      | ((keyword: string) => void)
      | undefined;

    if (!remoteMethod) {
      throw new Error('ElSelect.remoteMethod 未透出');
    }

    remoteMethod('张三');
    await vi.advanceTimersByTimeAsync(250);
    await flushPromises();

    expect(messageMocks.error).not.toHaveBeenCalled();

    vi.useRealTimers();
    wrapper.unmount();
  });
});
