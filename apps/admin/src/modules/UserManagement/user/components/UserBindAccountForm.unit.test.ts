import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it, vi } from 'vite-plus/test';

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
      ElSelect: passthrough('ElSelect'),
      ElOption: passthrough('ElOption'),
      ElTag
    }
  };
}

describe('UserBindAccountForm', () => {
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
});
