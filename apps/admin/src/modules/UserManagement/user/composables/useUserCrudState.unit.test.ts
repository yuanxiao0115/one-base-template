import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, reactive } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const coreMocks = vi.hoisted(() => ({
  dataList: null as unknown,
  selectedList: null as unknown,
  onSearch: vi.fn(async () => undefined),
  useCrudPage: vi.fn()
}));

const dragSortMocks = vi.hoisted(() => ({
  useUserDragSort: vi.fn()
}));

const remoteOptionMocks = vi.hoisted(() => ({
  checkFieldUnique: vi.fn(),
  loadOrgTree: vi.fn(async () => undefined),
  loadPositionOptions: vi.fn(async () => undefined),
  loadRoleOptions: vi.fn(async () => undefined),
  uploadAvatar: vi.fn()
}));

const statusActionMocks = vi.hoisted(() => ({
  handleBatchStatus: vi.fn(),
  handleResetPassword: vi.fn(),
  handleSingleStatus: vi.fn(),
  useUserStatusActions: vi.fn()
}));

const messageMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn()
}));

const envMocks = vi.hoisted(() => ({
  getAppEnv: vi.fn(() => ({
    baseUrl: '/admin/'
  }))
}));

vi.mock('@one-base-template/core', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue');

  coreMocks.dataList = vue.ref([
    {
      id: 'user-1'
    }
  ]);
  coreMocks.selectedList = vue.ref([
    {
      id: 'user-2'
    }
  ]);

  coreMocks.useCrudPage.mockReturnValue({
    table: {
      loading: vue.ref(false),
      dataList: coreMocks.dataList,
      pagination: {
        currentPage: 1,
        pageSize: 10
      },
      selectedList: coreMocks.selectedList,
      onSearch: coreMocks.onSearch,
      resetForm: vi.fn(),
      handleSelectionChange: vi.fn(),
      handleSizeChange: vi.fn(),
      handleCurrentChange: vi.fn()
    },
    editor: {
      visible: vue.ref(false),
      mode: vue.ref('create'),
      title: vue.ref('用户'),
      readonly: vue.ref(false),
      submitting: vue.ref(false),
      form: vue.reactive({})
    },
    actions: {
      remove: vi.fn(async () => undefined)
    }
  });

  return {
    useCrudPage: coreMocks.useCrudPage
  };
});

vi.mock('@one-base-template/ui', () => ({
  message: messageMocks
}));

vi.mock('@/infra/env', () => ({
  getAppEnv: envMocks.getAppEnv
}));

vi.mock('./useUserDragSort', () => dragSortMocks);
vi.mock('./useUserRemoteOptions', () => ({
  useUserRemoteOptions: vi.fn(() => remoteOptionMocks)
}));
vi.mock('./useUserStatusActions', () => ({
  useUserStatusActions: statusActionMocks.useUserStatusActions
}));

import { useUserCrudState } from './useUserCrudState';

function mountUseUserCrudState() {
  let crudState: ReturnType<typeof useUserCrudState> | null = null;

  const TestComponent = defineComponent({
    setup() {
      crudState = useUserCrudState();
      return () => h('div');
    }
  });

  const wrapper = mount(TestComponent);

  if (!crudState) {
    throw new Error('useUserCrudState 挂载失败');
  }

  const resolvedCrudState = crudState as ReturnType<typeof useUserCrudState>;

  return {
    crudState: resolvedCrudState,
    unmount: () => wrapper.unmount()
  };
}

describe('UserManagement/user/useUserCrudState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statusActionMocks.useUserStatusActions.mockReturnValue({
      handleSingleStatus: statusActionMocks.handleSingleStatus,
      handleBatchStatus: statusActionMocks.handleBatchStatus,
      handleResetPassword: statusActionMocks.handleResetPassword
    });
  });

  it('应把表格真实数据源直接传给状态操作与拖拽能力', () => {
    const { crudState, unmount } = mountUseUserCrudState();

    expect(crudState.table.dataList).toBe(coreMocks.dataList);
    expect(statusActionMocks.useUserStatusActions).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedList: coreMocks.selectedList
      })
    );
    expect(dragSortMocks.useUserDragSort).toHaveBeenCalledWith(
      expect.objectContaining({
        dataList: coreMocks.dataList
      })
    );

    unmount();
  });

  it('首屏仅预加载组织树并立即拉列表，编辑态再补职位与角色选项', async () => {
    const { unmount } = mountUseUserCrudState();

    await flushPromises();

    expect(remoteOptionMocks.loadOrgTree).toHaveBeenCalledTimes(1);
    expect(remoteOptionMocks.loadPositionOptions).not.toHaveBeenCalled();
    expect(remoteOptionMocks.loadRoleOptions).not.toHaveBeenCalled();
    expect(coreMocks.onSearch).toHaveBeenCalledWith(false);

    const crudOptions = coreMocks.useCrudPage.mock.calls.at(-1)?.[0] as {
      editor: {
        detail: {
          beforeOpen: (params: {
            mode: string;
            form: { userOrgs: Array<{ orgId: string }> };
          }) => Promise<void>;
        };
      };
    };

    vi.clearAllMocks();
    const form = reactive({
      userOrgs: []
    });

    await crudOptions.editor.detail.beforeOpen({
      mode: 'create',
      form
    });

    expect(remoteOptionMocks.loadOrgTree).toHaveBeenCalledTimes(1);
    expect(remoteOptionMocks.loadPositionOptions).toHaveBeenCalledTimes(1);
    expect(remoteOptionMocks.loadRoleOptions).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('模板下载应尊重应用 baseUrl', () => {
    const appendChild = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    const removeChild = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const anchor = {
      href: '',
      download: '',
      click
    } as unknown as HTMLAnchorElement;
    const createElement = vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string
    ) => {
      if (tagName === 'a') {
        return anchor;
      }

      return originalCreateElement(tagName);
    }) as typeof document.createElement);

    const { crudState, unmount } = mountUseUserCrudState();

    crudState.actions.downloadTemplate();

    expect(anchor.href).toContain('/admin/组织用户导入模板.xlsx');
    expect(anchor.download).toBe('组织用户导入模板.xlsx');
    expect(click).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalledWith(anchor);
    expect(removeChild).toHaveBeenCalledWith(anchor);

    createElement.mockRestore();
    appendChild.mockRestore();
    removeChild.mockRestore();
    unmount();
  });
});
