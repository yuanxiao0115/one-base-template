import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import LoginBox from './LoginBox.vue';

const { encryptMock } = vi.hoisted(() => ({
  encryptMock: vi.fn((value: string, key: string) => `enc(${value})@${key}`)
}));

vi.mock('gm-crypto', () => ({
  SM4: {
    encrypt: encryptMock
  }
}));

let formValidateImpl: () => Promise<unknown> = async () => true;
const formValidateSpy = vi.fn(() => formValidateImpl());
const formClearValidateSpy = vi.fn();

const ElFormStub = defineComponent({
  name: 'ElForm',
  props: {
    model: {
      type: Object,
      default: () => ({})
    },
    rules: {
      type: Object,
      default: () => ({})
    },
    size: {
      type: String,
      default: 'large'
    },
    labelPosition: {
      type: String,
      default: 'top'
    }
  },
  setup(_, { slots, expose }) {
    expose({
      validate: () => formValidateSpy(),
      clearValidate: () => formClearValidateSpy()
    });
    return () => h('form', slots.default?.());
  }
});

const ElFormItemStub = defineComponent({
  name: 'ElFormItem',
  setup(_, { slots }) {
    return () => h('div', slots.default?.());
  }
});

const ElInputStub = defineComponent({
  name: 'ElInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    }
  },
  emits: ['update:modelValue', 'keyup'],
  setup(props, { emit }) {
    return () =>
      h('input', {
        'data-testid': 'el-input',
        type: props.type,
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

const ElButtonStub = defineComponent({
  name: 'ElButton',
  emits: ['click'],
  setup(_, { slots, emit }) {
    return () =>
      h(
        'button',
        {
          'data-testid': 'el-button',
          type: 'button',
          onClick: () => emit('click')
        },
        slots.default?.()
      );
  }
});

function createWrapper(props?: Partial<{ username: string; password: string; encrypt: boolean }>) {
  return mount(LoginBox, {
    props: {
      username: props?.username ?? 'admin',
      password: props?.password ?? 'Passw0rd!',
      encrypt: props?.encrypt ?? false
    },
    global: {
      components: {
        ElForm: ElFormStub,
        ElFormItem: ElFormItemStub,
        ElInput: ElInputStub,
        ElButton: ElButtonStub
      }
    }
  });
}

describe('LoginBox', () => {
  beforeEach(() => {
    encryptMock.mockReset();
    formValidateSpy.mockReset();
    formClearValidateSpy.mockReset();
    formValidateImpl = async () => true;
  });

  it('应在输入变化时透传 update 事件', async () => {
    const wrapper = createWrapper();
    const inputs = wrapper.findAll('[data-testid="el-input"]');

    await inputs[0]!.setValue('next-user');
    await inputs[1]!.setValue('next-pass');

    expect(wrapper.emitted('update:username')?.[0]).toEqual(['next-user']);
    expect(wrapper.emitted('update:password')?.[0]).toEqual(['next-pass']);
  });

  it('校验通过时点击登录应提交原始 payload', async () => {
    const wrapper = createWrapper({
      username: 'one',
      password: 'Passw0rd!'
    });

    await wrapper.get('[data-testid="el-button"]').trigger('click');
    await flushPromises();

    expect(formValidateSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('submit')?.[0]).toEqual([
      {
        username: 'one',
        password: 'Passw0rd!'
      }
    ]);
  });

  it('加密模式应提交 SM4 加密后的 payload', async () => {
    encryptMock.mockImplementation((value: string, key: string) => `${value}-cipher-${key}`);
    const wrapper = createWrapper({
      username: 'encrypted-user',
      password: 'Encrypted!1',
      encrypt: true
    });

    await wrapper.get('[data-testid="el-button"]').trigger('click');
    await flushPromises();

    expect(encryptMock).toHaveBeenCalledTimes(2);
    expect(wrapper.emitted('submit')?.[0]).toEqual([
      {
        username: 'encrypted-user-cipher-6f889d54ad8c4ddb8c525fc96a185444',
        password: 'Encrypted!1-cipher-6f889d54ad8c4ddb8c525fc96a185444'
      }
    ]);
  });

  it('校验失败时不应提交，expose.validate 应返回 false', async () => {
    formValidateImpl = async () => {
      throw new Error('invalid');
    };
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as {
      validate: () => Promise<boolean>;
      clearValidate: () => void;
      buildSubmitPayload: () => { username: string; password: string };
    };

    expect(await vm.validate()).toBe(false);
    await wrapper.get('[data-testid="el-button"]').trigger('click');
    await flushPromises();

    expect(wrapper.emitted('submit')).toBeUndefined();
  });

  it('expose.clearValidate 与 buildSubmitPayload 应可直接复用', async () => {
    const wrapper = createWrapper({
      username: 'u1',
      password: 'p1'
    });
    const vm = wrapper.vm as unknown as {
      clearValidate: () => void;
      buildSubmitPayload: () => { username: string; password: string };
    };

    vm.clearValidate();
    expect(formClearValidateSpy).toHaveBeenCalledTimes(1);
    expect(vm.buildSubmitPayload()).toEqual({
      username: 'u1',
      password: 'p1'
    });
  });

  it('规则应支持用户名必填开关与密码格式校验开关', async () => {
    const wrapper = mount(LoginBox, {
      props: {
        username: '',
        password: '',
        requireUsername: false,
        validatePassword: false,
        passwordRuleMessage: '密码不合法'
      },
      global: {
        components: {
          ElForm: ElFormStub,
          ElFormItem: ElFormItemStub,
          ElInput: ElInputStub,
          ElButton: ElButtonStub
        }
      }
    });

    const formProps = wrapper.getComponent(ElFormStub).props() as unknown as {
      rules: {
        username?: unknown[];
        password?: Array<{
          validator: (rule: unknown, value: string, callback: (error?: Error) => void) => void;
        }>;
      };
    };

    expect(formProps.rules.username).toEqual([]);
    const callback = vi.fn();
    formProps.rules.password?.[0]?.validator({}, 'anything', callback);
    expect(callback).toHaveBeenCalledWith();
  });
});
