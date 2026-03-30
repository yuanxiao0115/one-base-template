import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, ref, watch } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import type { PermissionTreeNode } from '../types';

const messageMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn()
}));

const apiMocks = vi.hoisted(() => ({
  getRolePermissionIds: vi.fn(),
  getPermissionTree: vi.fn(),
  updateRolePermissions: vi.fn()
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
  roleApi: apiMocks
}));

import RolePermissionDialog from './RolePermissionDialog.vue';

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

function createStubs() {
  const renderedTreeData = ref<PermissionTreeNode[]>([]);
  const renderedCheckedKeys = ref<string[]>([]);

  const ElDialog = defineComponent({
    name: 'ElDialog',
    props: {
      modelValue: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ''
      }
    },
    emits: ['update:modelValue'],
    setup(props, { slots }) {
      return () =>
        h('div', { 'data-testid': 'dialog' }, [
          h('div', { 'data-testid': 'dialog-title' }, props.title),
          slots.default?.(),
          slots.footer?.()
        ]);
    }
  });

  const ElScrollbar = defineComponent({
    name: 'ElScrollbar',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    }
  });

  const ElCheckbox = defineComponent({
    name: 'ElCheckbox',
    props: {
      modelValue: {
        type: Boolean,
        default: false
      }
    },
    emits: ['update:modelValue'],
    setup(_, { slots }) {
      return () => h('label', slots.default?.());
    }
  });

  const ElButton = defineComponent({
    name: 'ElButton',
    emits: ['click'],
    setup(_, { slots, emit }) {
      return () =>
        h(
          'button',
          {
            type: 'button',
            onClick: () => emit('click')
          },
          slots.default?.()
        );
    }
  });

  const ElTree = defineComponent({
    name: 'ElTree',
    props: {
      data: {
        type: Array as () => PermissionTreeNode[],
        default: () => []
      }
    },
    setup(props, { expose }) {
      const checkedKeys = ref<string[]>([]);

      watch(
        () => props.data,
        (value) => {
          renderedTreeData.value = Array.isArray(value) ? value : [];
        },
        {
          immediate: true
        }
      );

      function normalizeKeys(list: Array<string | number>) {
        return list.map((item) => String(item));
      }

      expose({
        setCheckedKeys: (list: Array<string | number>) => {
          checkedKeys.value = normalizeKeys(list);
          renderedCheckedKeys.value = [...checkedKeys.value];
        },
        getCheckedKeys: () => checkedKeys.value,
        getHalfCheckedKeys: () => []
      });

      return () =>
        h(
          'div',
          { 'data-testid': 'tree-state' },
          JSON.stringify({
            data: renderedTreeData.value,
            checkedKeys: renderedCheckedKeys.value
          })
        );
    }
  });

  return {
    renderedTreeData,
    renderedCheckedKeys,
    stubs: {
      ElDialog,
      ElScrollbar,
      ElCheckbox,
      ElButton,
      ElTree
    }
  };
}

function readTreeState(wrapper: ReturnType<typeof mount>) {
  return JSON.parse(wrapper.get('[data-testid="tree-state"]').text()) as {
    data: PermissionTreeNode[];
    checkedKeys: string[];
  };
}

describe('RolePermissionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('切换角色后应忽略旧请求回写的权限树状态', async () => {
    const firstPermissionIds = createDeferred<{ code: number; data: string[] }>();
    const secondPermissionIds = createDeferred<{ code: number; data: string[] }>();
    const firstTree = createDeferred<{ code: number; data: PermissionTreeNode[] }>();
    const secondTree = createDeferred<{ code: number; data: PermissionTreeNode[] }>();

    apiMocks.getRolePermissionIds.mockImplementation(({ roleId }: { roleId: string }) => {
      return roleId === 'role-1' ? firstPermissionIds.promise : secondPermissionIds.promise;
    });
    apiMocks.getPermissionTree
      .mockImplementationOnce(() => firstTree.promise)
      .mockImplementationOnce(() => secondTree.promise);

    const { stubs } = createStubs();

    const wrapper = mount(RolePermissionDialog, {
      props: {
        modelValue: false,
        roleId: 'role-1',
        roleName: '角色一',
        'onUpdate:modelValue': vi.fn(),
        onSaved: vi.fn()
      },
      global: {
        stubs,
        directives: {
          loading: {}
        }
      }
    });

    await wrapper.setProps({
      modelValue: true
    });

    await wrapper.setProps({
      roleId: 'role-2',
      roleName: '角色二'
    });

    secondPermissionIds.resolve({
      code: 200,
      data: ['perm-role-2']
    });
    secondTree.resolve({
      code: 200,
      data: [
        {
          id: 'perm-role-2',
          resourceName: '角色二权限'
        }
      ]
    });

    await flushPromises();

    expect(readTreeState(wrapper)).toEqual({
      data: [
        {
          id: 'perm-role-2',
          resourceName: '角色二权限'
        }
      ],
      checkedKeys: ['perm-role-2']
    });
    expect(wrapper.get('[data-testid="dialog-title"]').text()).toBe('菜单权限配置 - 角色二');

    firstPermissionIds.resolve({
      code: 200,
      data: ['perm-role-1']
    });
    firstTree.resolve({
      code: 200,
      data: [
        {
          id: 'perm-role-1',
          resourceName: '角色一权限'
        }
      ]
    });

    await flushPromises();

    expect(readTreeState(wrapper)).toEqual({
      data: [
        {
          id: 'perm-role-2',
          resourceName: '角色二权限'
        }
      ],
      checkedKeys: ['perm-role-2']
    });
    expect(apiMocks.getRolePermissionIds).toHaveBeenNthCalledWith(1, { roleId: 'role-1' });
    expect(apiMocks.getRolePermissionIds).toHaveBeenNthCalledWith(2, { roleId: 'role-2' });
  });
});
