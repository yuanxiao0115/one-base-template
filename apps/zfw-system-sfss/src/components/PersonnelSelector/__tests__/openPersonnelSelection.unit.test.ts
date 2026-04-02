import type { AppContext } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const createVNodeMock = vi.hoisted(() => vi.fn((_component, props) => ({ props })));
const renderMock = vi.hoisted(() => vi.fn());

vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue');
  return {
    ...actual,
    createVNode: createVNodeMock,
    render: renderMock
  };
});

vi.mock('../PersonnelSelectionDialogHost.vue', () => ({
  default: {}
}));

import { openPersonnelSelection } from '../openPersonnelSelection';

function createSelectionResult() {
  return {
    mode: 'person' as const,
    selectionField: 'userIds' as const,
    ids: ['u1'],
    model: {
      userIds: ['u1'],
      orgIds: [],
      roleIds: [],
      positionIds: []
    },
    selectedItems: [],
    users: [],
    orgs: [],
    roles: [],
    positions: []
  };
}

describe('openPersonnelSelection', () => {
  beforeEach(() => {
    createVNodeMock.mockClear();
    renderMock.mockClear();
    document.body.innerHTML = '';
  });

  it('传入 appContext 时应透传到 vnode', async () => {
    const appContext = { app: {} } as AppContext;
    const promise = openPersonnelSelection({
      appContext,
      fetchNodes: async () => [],
      searchNodes: async () => []
    });

    const vnode = createVNodeMock.mock.results[0]?.value as {
      appContext?: AppContext;
      props: {
        onConfirm: (payload: ReturnType<typeof createSelectionResult>) => void;
        onClosed: () => void;
      };
    };
    expect(vnode.appContext).toBe(appContext);

    vnode.props.onConfirm(createSelectionResult());
    vnode.props.onClosed();

    await expect(promise).resolves.toMatchObject({
      ids: ['u1'],
      selectionField: 'userIds'
    });
  });

  it('未传 appContext 也应能正常取消', async () => {
    const promise = openPersonnelSelection({
      fetchNodes: async () => [],
      searchNodes: async () => []
    });

    const vnode = createVNodeMock.mock.results[0]?.value as {
      appContext?: AppContext;
      props: {
        onCancel: () => void;
        onClosed: () => void;
      };
    };
    expect(vnode.appContext).toBeUndefined();

    vnode.props.onCancel();
    vnode.props.onClosed();

    await expect(promise).rejects.toBe('cancel');
  });
});
