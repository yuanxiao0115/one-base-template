import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it, vi } from 'vite-plus/test';

import RoleAssignMemberSelectForm from './RoleAssignMemberSelectForm.vue';

function createFormStub() {
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

  const ElFormItem = defineComponent({
    name: 'ElFormItem',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    }
  });

  const PersonnelSelector = defineComponent({
    name: 'PersonnelSelector',
    setup() {
      return () => h('div', { 'data-testid': 'personnel-selector' });
    }
  });

  return {
    formMethods,
    stubs: {
      ElForm,
      ElFormItem,
      PersonnelSelector
    }
  };
}

describe('RoleAssignMemberSelectForm', () => {
  it('defineExpose 仅暴露通用表单句柄', async () => {
    const { formMethods, stubs } = createFormStub();
    const updateModel = vi.fn();

    const wrapper = mount(RoleAssignMemberSelectForm, {
      props: {
        modelValue: {
          userIds: []
        },
        disabled: false,
        initialSelectedUsers: [],
        fetchContactNodes: vi.fn(async () => []),
        searchContactUsers: vi.fn(async () => []),
        fetchNodes: vi.fn(async () => []),
        searchNodes: vi.fn(async () => []),
        'onUpdate:modelValue': updateModel
      },
      global: {
        stubs
      }
    });

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
