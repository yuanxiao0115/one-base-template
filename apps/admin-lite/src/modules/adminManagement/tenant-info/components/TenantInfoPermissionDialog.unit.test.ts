import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, ref, watch } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import type { TenantPermissionTreeNode } from '../types';

const messageMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn()
}));

const apiMocks = vi.hoisted(() => ({
  getTenantTree: vi.fn(),
  getTenantPermissionIds: vi.fn(),
  updateTenantPermission: vi.fn()
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
  tenantInfoApi: apiMocks
}));

import TenantInfoPermissionDialog from './TenantInfoPermissionDialog.vue';

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
  const renderedTreeData = ref<TenantPermissionTreeNode[]>([]);
  const renderedCheckedKeys = ref<string[]>([]);

  const ObCrudContainer = defineComponent({
    name: 'ObCrudContainer',
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
    emits: ['update:modelValue', 'confirm', 'cancel', 'close'],
    setup(props, { slots }) {
      return () =>
        h('div', { 'data-testid': 'dialog' }, [
          h('div', { 'data-testid': 'dialog-title' }, props.title),
          slots.default?.()
        ]);
    }
  });

  const ElScrollbar = defineComponent({
    name: 'ElScrollbar',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    }
  });

  const ElTree = defineComponent({
    name: 'ElTree',
    props: {
      data: {
        type: Array as () => TenantPermissionTreeNode[],
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

      expose({
        setCheckedKeys: (list: Array<string | number>) => {
          checkedKeys.value = list.map((item) => String(item));
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
    stubs: {
      ObCrudContainer,
      ElScrollbar,
      ElTree
    }
  };
}

function readTreeState(wrapper: ReturnType<typeof mount>) {
  return JSON.parse(wrapper.get('[data-testid="tree-state"]').text()) as {
    data: TenantPermissionTreeNode[];
    checkedKeys: string[];
  };
}

describe('TenantInfoPermissionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('切换租户后应忽略旧请求回写的权限树状态', async () => {
    const firstPermissionIds = createDeferred<{ code: number; data: string[] }>();
    const secondPermissionIds = createDeferred<{ code: number; data: string[] }>();
    const firstTree = createDeferred<{ code: number; data: TenantPermissionTreeNode[] }>();
    const secondTree = createDeferred<{ code: number; data: TenantPermissionTreeNode[] }>();

    apiMocks.getTenantPermissionIds.mockImplementation(({ tenantId }: { tenantId: string }) => {
      return tenantId === 'tenant-1' ? firstPermissionIds.promise : secondPermissionIds.promise;
    });
    apiMocks.getTenantTree
      .mockImplementationOnce(() => firstTree.promise)
      .mockImplementationOnce(() => secondTree.promise);

    const { stubs } = createStubs();

    const wrapper = mount(TenantInfoPermissionDialog, {
      props: {
        modelValue: false,
        tenantId: 'tenant-1',
        tenantName: '租户一',
        'onUpdate:modelValue': vi.fn(),
        onSaved: vi.fn()
      },
      global: {
        stubs
      }
    });

    await wrapper.setProps({
      modelValue: true
    });

    await wrapper.setProps({
      tenantId: 'tenant-2',
      tenantName: '租户二'
    });

    secondPermissionIds.resolve({
      code: 200,
      data: ['perm-tenant-2']
    });
    secondTree.resolve({
      code: 200,
      data: [
        {
          id: 'perm-tenant-2',
          resourceName: '租户二权限'
        }
      ]
    });

    await flushPromises();

    expect(readTreeState(wrapper)).toEqual({
      data: [
        {
          id: 'perm-tenant-2',
          resourceName: '租户二权限'
        }
      ],
      checkedKeys: ['perm-tenant-2']
    });
    expect(wrapper.get('[data-testid="dialog-title"]').text()).toBe('添加权限 - 租户二');

    firstPermissionIds.resolve({
      code: 200,
      data: ['perm-tenant-1']
    });
    firstTree.resolve({
      code: 200,
      data: [
        {
          id: 'perm-tenant-1',
          resourceName: '租户一权限'
        }
      ]
    });

    await flushPromises();

    expect(readTreeState(wrapper)).toEqual({
      data: [
        {
          id: 'perm-tenant-2',
          resourceName: '租户二权限'
        }
      ],
      checkedKeys: ['perm-tenant-2']
    });
    expect(apiMocks.getTenantPermissionIds).toHaveBeenNthCalledWith(1, { tenantId: 'tenant-1' });
    expect(apiMocks.getTenantPermissionIds).toHaveBeenNthCalledWith(2, { tenantId: 'tenant-2' });
  });

  it('关闭弹窗后应忽略未完成请求的回写', async () => {
    const permissionIds = createDeferred<{ code: number; data: string[] }>();
    const tree = createDeferred<{ code: number; data: TenantPermissionTreeNode[] }>();

    apiMocks.getTenantPermissionIds.mockImplementation(() => permissionIds.promise);
    apiMocks.getTenantTree.mockImplementation(() => tree.promise);

    const { stubs } = createStubs();

    const wrapper = mount(TenantInfoPermissionDialog, {
      props: {
        modelValue: false,
        tenantId: 'tenant-1',
        tenantName: '租户一',
        'onUpdate:modelValue': vi.fn(),
        onSaved: vi.fn()
      },
      global: {
        stubs
      }
    });

    await wrapper.setProps({
      modelValue: true
    });

    await wrapper.setProps({
      modelValue: false
    });

    permissionIds.resolve({
      code: 200,
      data: ['perm-tenant-1']
    });
    tree.resolve({
      code: 200,
      data: [
        {
          id: 'perm-tenant-1',
          resourceName: '租户一权限'
        }
      ]
    });

    await flushPromises();

    expect(readTreeState(wrapper)).toEqual({
      data: [],
      checkedKeys: []
    });
    expect(messageMocks.error).not.toHaveBeenCalled();
  });

  it('加载失败后应关闭弹窗', async () => {
    const updateVisible = vi.fn();

    apiMocks.getTenantPermissionIds.mockResolvedValue({
      code: 500,
      message: '加载失败'
    });
    apiMocks.getTenantTree.mockResolvedValue({
      code: 200,
      data: []
    });

    const { stubs } = createStubs();

    const wrapper = mount(TenantInfoPermissionDialog, {
      props: {
        modelValue: false,
        tenantId: 'tenant-1',
        tenantName: '租户一',
        'onUpdate:modelValue': updateVisible,
        onSaved: vi.fn()
      },
      global: {
        stubs
      }
    });

    await wrapper.setProps({
      modelValue: true
    });

    await flushPromises();

    expect(messageMocks.error).toHaveBeenCalledWith('加载失败');
    expect(updateVisible).toHaveBeenCalledWith(false);
  });
});
