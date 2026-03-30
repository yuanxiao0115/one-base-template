import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

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

const messageMocks = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
  success: vi.fn(),
  warning: vi.fn()
}));

const apiMocks = vi.hoisted(() => ({
  addOrgManager: vi.fn(),
  delOrgManager: vi.fn(),
  getOrgContactsLazy: vi.fn(),
  queryOrgManagerList: vi.fn(),
  searchContactUsers: vi.fn()
}));

vi.mock('@one-base-template/ui', async () => {
  const actual =
    await vi.importActual<typeof import('@one-base-template/ui')>('@one-base-template/ui');

  return {
    ...actual,
    message: messageMocks
  };
});

vi.mock('@element-plus/icons-vue', () => ({
  Folder: defineComponent({
    name: 'FolderIcon',
    setup() {
      return () => h('i');
    }
  }),
  UserFilled: defineComponent({
    name: 'UserFilledIcon',
    setup() {
      return () => h('i');
    }
  })
}));

vi.mock('../api', () => ({
  orgApi: apiMocks
}));

import OrgManagerDialog from './OrgManagerDialog.vue';

function createStubs() {
  const ElDialog = defineComponent({
    name: 'ElDialog',
    props: {
      modelValue: {
        type: Boolean,
        required: true
      }
    },
    setup(_, { slots }) {
      return () =>
        h('div', { 'data-testid': 'dialog-root' }, [slots.default?.(), slots.footer?.()]);
    }
  });

  const ElInput = defineComponent({
    name: 'ElInput',
    props: {
      modelValue: {
        type: String,
        required: false,
        default: ''
      }
    },
    emits: ['update:modelValue', 'keyup', 'clear'],
    setup(props, { emit }) {
      return () =>
        h('input', {
          value: props.modelValue,
          onInput: (event: Event) => {
            emit('update:modelValue', (event.target as HTMLInputElement).value);
          },
          onKeyup: (event: KeyboardEvent) => {
            emit('keyup', event);
          }
        });
    }
  });

  const ElCheckbox = defineComponent({
    name: 'ElCheckbox',
    props: {
      modelValue: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return () =>
        h('input', {
          type: 'checkbox',
          checked: props.modelValue,
          onChange: (event: Event) => {
            emit('update:modelValue', (event.target as HTMLInputElement).checked);
          }
        });
    }
  });

  const passthrough = (name: string) =>
    defineComponent({
      name,
      setup(_, { slots }) {
        return () => h('div', slots.default?.());
      }
    });

  return {
    ElDialog,
    ElInput,
    ElCheckbox,
    ElButton: passthrough('ElButton'),
    ElEmpty: passthrough('ElEmpty'),
    ElIcon: passthrough('ElIcon')
  };
}

describe('OrgManagerDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('关闭弹窗后旧搜索请求不应回写当前节点', async () => {
    const searchDeferred = createDeferred<{
      code: number;
      data: Array<{
        id: string;
        parentId: string;
        companyId: string;
        title: string;
        nodeType: 'user';
        userId: string;
        nickName: string;
        phone: string;
      }>;
    }>();

    apiMocks.queryOrgManagerList.mockResolvedValue({
      code: 200,
      data: []
    });
    apiMocks.getOrgContactsLazy.mockResolvedValue({
      code: 200,
      data: [
        {
          id: 'org-child-1',
          parentId: '0',
          companyId: 'company-1',
          title: '研发中心',
          nodeType: 'org',
          orgName: '研发中心',
          orgType: 1
        }
      ]
    });
    apiMocks.searchContactUsers.mockImplementation(() => searchDeferred.promise);

    const wrapper = mount(OrgManagerDialog, {
      props: {
        modelValue: true,
        orgId: 'org-1',
        orgName: '测试组织',
        'onUpdate:modelValue': vi.fn(),
        onSuccess: vi.fn()
      },
      global: {
        stubs: createStubs(),
        directives: {
          loading: {}
        }
      }
    });

    await flushPromises();
    expect(wrapper.text()).toContain('研发中心');

    const input = wrapper.get('input');
    await input.setValue('张三');
    await input.trigger('keyup', { key: 'Enter' });
    await flushPromises();

    await wrapper.setProps({
      modelValue: false
    });

    searchDeferred.resolve({
      code: 200,
      data: [
        {
          id: 'user-node-1',
          parentId: 'org-child-1',
          companyId: 'company-1',
          title: '张三',
          nodeType: 'user',
          userId: 'user-1',
          nickName: '张三',
          phone: '13800000000'
        }
      ]
    });
    await flushPromises();

    expect(wrapper.findAll('.org-manager-dialog__node-item')).toHaveLength(0);
  });
});
