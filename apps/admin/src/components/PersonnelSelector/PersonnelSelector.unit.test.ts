import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import type { PersonnelNode } from './types';

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

import PersonnelSelector from './PersonnelSelector.vue';

function createPanelStubs() {
  const PersonnelSelectorSourcePanel = defineComponent({
    name: 'PersonnelSelectorSourcePanel',
    props: {
      nodes: {
        type: Array,
        required: true
      },
      loading: {
        type: Boolean,
        required: true
      }
    },
    setup(props) {
      return () =>
        h('div', {
          'data-testid': 'source-panel',
          'data-node-count': String(props.nodes.length),
          'data-loading': String(props.loading)
        });
    }
  });

  const PersonnelSelectorSelectedPanel = defineComponent({
    name: 'PersonnelSelectorSelectedPanel',
    props: {
      selectedItems: {
        type: Array,
        required: true
      }
    },
    setup(props) {
      return () =>
        h(
          'div',
          {
            'data-testid': 'selected-panel',
            'data-selected-count': String(props.selectedItems.length)
          },
          JSON.stringify(props.selectedItems)
        );
    }
  });

  return {
    PersonnelSelectorSourcePanel,
    PersonnelSelectorSelectedPanel
  };
}

describe('PersonnelSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应在挂载后加载根节点并同步 initialSelectedUsers', async () => {
    const modelValue = {
      userIds: [],
      orgIds: [],
      roleIds: [],
      positionIds: []
    };
    const fetchNodes = vi.fn(
      async (): Promise<PersonnelNode[]> => [
        {
          id: 'org-1',
          parentId: '0',
          title: '研发中心',
          nodeType: 'org' as const,
          companyId: 'company-1',
          orgName: '研发中心',
          orgType: 1
        }
      ]
    );

    const wrapper = mount(PersonnelSelector, {
      props: {
        modelValue,
        disabled: false,
        mode: 'person',
        fetchNodes,
        searchNodes: vi.fn(async () => []),
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
        'onUpdate:modelValue': vi.fn()
      },
      global: {
        stubs: createPanelStubs()
      }
    });

    await flushPromises();

    expect(fetchNodes).toHaveBeenCalledWith({
      parentId: '0',
      mode: 'person'
    });
    expect(modelValue.userIds).toEqual(['user-1']);
    expect(wrapper.get('[data-testid="source-panel"]').attributes('data-node-count')).toBe('1');
    expect(wrapper.get('[data-testid="selected-panel"]').attributes('data-selected-count')).toBe(
      '1'
    );
    expect(wrapper.get('[data-testid="selected-panel"]').text()).toContain('zhangsan');
  });

  it('initialSelectedUsers 变化后应同步已选项', async () => {
    const wrapper = mount(PersonnelSelector, {
      props: {
        modelValue: {
          userIds: [],
          orgIds: [],
          roleIds: [],
          positionIds: []
        },
        disabled: false,
        mode: 'person',
        fetchNodes: vi.fn(async () => []),
        searchNodes: vi.fn(async () => []),
        initialSelectedUsers: [],
        'onUpdate:modelValue': vi.fn()
      },
      global: {
        stubs: createPanelStubs()
      }
    });

    await wrapper.setProps({
      initialSelectedUsers: [
        {
          id: 'user-2',
          nodeType: 'user',
          title: '李四',
          subTitle: 'lisi',
          nickName: '李四',
          userAccount: 'lisi',
          phone: ''
        }
      ]
    });
    await flushPromises();

    expect(wrapper.get('[data-testid="selected-panel"]').attributes('data-selected-count')).toBe(
      '1'
    );
    expect(wrapper.get('[data-testid="selected-panel"]').text()).toContain('user-2');
  });

  it('根节点初始化失败时应提示错误', async () => {
    mount(PersonnelSelector, {
      props: {
        modelValue: {
          userIds: [],
          orgIds: [],
          roleIds: [],
          positionIds: []
        },
        disabled: false,
        mode: 'person',
        fetchNodes: vi.fn(async () => {
          throw new Error('加载组织通讯录失败');
        }),
        searchNodes: vi.fn(async () => []),
        'onUpdate:modelValue': vi.fn()
      },
      global: {
        stubs: createPanelStubs()
      }
    });

    await flushPromises();

    expect(messageMocks.error).toHaveBeenCalledWith('加载组织通讯录失败');
  });
});
