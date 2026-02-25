/* eslint-disable vue/one-component-per-file */
import { describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { createEmitter, createReactiveState, withInstall } from '../index';

describe('vue utils', () => {
  it('withInstall 可以在插件安装后渲染注册组件', () => {
    const HelloBlock = defineComponent({
      name: 'HelloBlock',
      template: '<div data-testid="hello-block">hello</div>'
    });

    const Root = defineComponent({
      template: '<HelloBlock />'
    });

    const wrapper = mount(Root, {
      global: {
        plugins: [withInstall({ HelloBlock })]
      }
    });

    expect(wrapper.find('[data-testid="hello-block"]').text()).toBe('hello');
  });

  it('createReactiveState 可以更新并重置状态', () => {
    const { state, setState, getState, resetState } = createReactiveState({
      count: 0,
      keyword: 'init'
    });

    setState({ count: 2, keyword: 'updated' });
    expect(state.count).toBe(2);
    expect(getState()).toEqual({ count: 2, keyword: 'updated' });

    resetState();
    expect(state.count).toBe(0);
    expect(state.keyword).toBe('init');
  });

  it('createEmitter 会按事件语义透传 payload', () => {
    const emit = vi.fn<(event: string, ...args: unknown[]) => void>();
    const emitter = createEmitter(emit);

    emitter.success('保存成功', { id: 1 });
    emitter.error('保存失败', new Error('network'));
    emitter.change('next');

    expect(emit).toHaveBeenNthCalledWith(1, 'success', { message: '保存成功', data: { id: 1 } });
    expect(emit).toHaveBeenNthCalledWith(2, 'error', {
      message: '保存失败',
      error: expect.any(Error)
    });
    expect(emit).toHaveBeenNthCalledWith(3, 'change', 'next');
  });
});
