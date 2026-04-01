import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import RoleAssignMemberSelectForm from '@/modules/adminManagement/role-assign/components/RoleAssignMemberSelectForm.vue';

function createStubs() {
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
    props: {
      modelValue: {
        type: Object,
        required: true
      },
      disabled: {
        type: Boolean,
        required: true
      },
      mode: {
        type: String,
        required: true
      },
      initialSelectedUsers: {
        type: Array,
        required: false,
        default: () => []
      },
      fetchNodes: {
        type: Function,
        required: true
      },
      searchNodes: {
        type: Function,
        required: true
      }
    },
    setup(props) {
      return () =>
        h('div', {
          'data-testid': 'personnel-selector',
          'data-mode': props.mode,
          'data-selected-count': String(props.initialSelectedUsers.length)
        });
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应通过 props/v-model 将初始已选人员透传给 PersonnelSelector', async () => {
    const { stubs } = createStubs();

    const wrapper = mount(RoleAssignMemberSelectForm, {
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

    const selector = wrapper.getComponent({ name: 'PersonnelSelector' });

    expect(selector.props('mode')).toBe('person');
    expect(selector.props('modelValue')).toEqual({
      userIds: ['user-1']
    });
    expect(selector.props('initialSelectedUsers')).toEqual([
      expect.objectContaining({
        id: 'user-1',
        userAccount: 'zhangsan'
      })
    ]);
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
