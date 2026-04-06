import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vite-plus/test';
import VerifySlide from './VerifySlide.vue';

const CAPTCHA_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6XbWQAAAABJRU5ErkJggg==';
const JPEG_BASE64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2w==';
const GIF_BASE64 = 'R0lGODlhAQABAIAAAAUEBA==';
const WEBP_BASE64 = 'UklGRjwAAABXRUJQVlA4IC4AAABwAgCdASoBAAEALAAAAABAAQAcJaQAA3AA/vuUAAA=';
const SVG_BASE64 = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';
const PNG_DATA_URI = `data:image/png;base64,${CAPTCHA_BASE64}`;

interface VerifySlideVm {
  show: () => Promise<void>;
  end: () => Promise<void>;
  getPictrue: () => Promise<void>;
  start: (event: MouseEvent | TouchEvent) => void;
  move: (event: MouseEvent | TouchEvent) => void;
  closeBox: () => void;
  backImgBase: string;
  blockBackImgBase: string;
  tipWords: string;
  visible: boolean;
  status: boolean;
  isEnd: boolean;
  moveBlockLeft: string;
  setSize: {
    imgWidth: string;
  };
  startLeft: number;
  passFlag: boolean | '';
  startMoveTime: number;
}

function createWrapper(options?: { originBase64?: string; jigsawBase64?: string }) {
  return mount(VerifySlide, {
    props: {
      barSize: {
        width: '310px',
        height: '50px'
      },
      loadCaptcha: vi.fn().mockResolvedValue({
        code: 200,
        data: {
          originBase64: options?.originBase64 ?? CAPTCHA_BASE64,
          jigsawBase64: options?.jigsawBase64 ?? CAPTCHA_BASE64,
          captchaKey: 'captcha-key'
        }
      }),
      checkCaptcha: vi.fn().mockResolvedValue({
        code: 200
      })
    }
  });
}

describe('VerifySlide', () => {
  it('会把接口返回的裸 base64 解析成可渲染图片地址', async () => {
    const wrapper = createWrapper();

    await (wrapper.vm as typeof wrapper.vm & { show: () => Promise<void> }).show();
    await flushPromises();

    const panelImage = wrapper.find('.verify-img-panel img');

    expect(panelImage.exists()).toBe(true);
    expect(panelImage.attributes('src')).toContain(`data:image/png;base64,${CAPTCHA_BASE64}`);
  });

  it('会把拼图切片挂到滑块内部，并保留初始拖动底座宽度', async () => {
    const wrapper = createWrapper();

    await (wrapper.vm as typeof wrapper.vm & { show: () => Promise<void> }).show();
    await flushPromises();

    const blockImage = wrapper.find('.verify-move-block .verify-sub-block img');

    expect(blockImage.exists()).toBe(true);
    expect(blockImage.attributes('src')).toContain(`data:image/png;base64,${CAPTCHA_BASE64}`);
    expect(wrapper.get('.verify-left-bar').attributes('style')).toContain('width: 50px;');
  });

  it('会把以斜杠开头的 JPEG 裸 base64 也解析为 data url', async () => {
    const wrapper = createWrapper({
      originBase64: JPEG_BASE64,
      jigsawBase64: JPEG_BASE64
    });

    await (wrapper.vm as typeof wrapper.vm & { show: () => Promise<void> }).show();
    await flushPromises();

    expect(wrapper.get('.verify-img-panel img').attributes('src')).toContain(
      `data:image/jpeg;base64,${JPEG_BASE64}`
    );
    expect(wrapper.get('.verify-move-block .verify-sub-block img').attributes('src')).toContain(
      `data:image/jpeg;base64,${JPEG_BASE64}`
    );
  });

  it('不会重复包裹已经带 data 前缀的图片地址', async () => {
    const wrapper = createWrapper({
      originBase64: PNG_DATA_URI,
      jigsawBase64: PNG_DATA_URI
    });

    await (wrapper.vm as typeof wrapper.vm & { show: () => Promise<void> }).show();
    await flushPromises();

    expect(wrapper.get('.verify-img-panel img').attributes('src')).toBe(PNG_DATA_URI);
    expect(wrapper.get('.verify-move-block .verify-sub-block img').attributes('src')).toBe(
      PNG_DATA_URI
    );
  });

  it('会识别 GIF/WEBP/SVG 裸 base64 并转成 data url', async () => {
    const cases = [
      { source: GIF_BASE64, expectedPrefix: 'data:image/gif;base64,' },
      { source: WEBP_BASE64, expectedPrefix: 'data:image/webp;base64,' },
      { source: SVG_BASE64, expectedPrefix: 'data:image/svg+xml;base64,' }
    ];

    for (const item of cases) {
      const wrapper = createWrapper({
        originBase64: item.source,
        jigsawBase64: item.source
      });
      const vm = wrapper.vm as unknown as VerifySlideVm;

      await vm.show();
      await flushPromises();

      expect(wrapper.get('.verify-img-panel img').attributes('src')).toContain(item.expectedPrefix);
      expect(wrapper.get('.verify-move-block .verify-sub-block img').attributes('src')).toContain(
        item.expectedPrefix
      );
      wrapper.unmount();
    }
  });

  it('获取验证码失败且 code=6201 时应清空图片并提示错误信息', async () => {
    const wrapper = mount(VerifySlide, {
      props: {
        loadCaptcha: vi.fn().mockResolvedValue({
          code: 6201,
          message: '验证码已过期',
          data: {
            originBase64: CAPTCHA_BASE64,
            jigsawBase64: CAPTCHA_BASE64,
            captchaKey: 'captcha-key'
          }
        }),
        checkCaptcha: vi.fn().mockResolvedValue({ code: 200 })
      }
    });

    const vm = wrapper.vm as unknown as VerifySlideVm;
    vm.backImgBase = 'old-bg';
    vm.blockBackImgBase = 'old-block';

    await vm.getPictrue();
    await flushPromises();

    expect(vm.tipWords).toBe('验证码已过期');
    expect(vm.backImgBase).toBe('');
    expect(vm.blockBackImgBase).toBe('');
    expect(vm.visible).toBe(false);
    expect(wrapper.emitted('loading-change')).toEqual([[true], [false]]);
  });

  it('校验成功后应触发 success 事件并自动关闭弹层', async () => {
    vi.useFakeTimers();
    const checkCaptcha = vi.fn().mockResolvedValue({
      code: 200
    });

    const wrapper = mount(VerifySlide, {
      props: {
        barSize: {
          width: '310px',
          height: '50px'
        },
        loadCaptcha: vi.fn().mockResolvedValue({
          code: 200,
          data: {
            originBase64: CAPTCHA_BASE64,
            jigsawBase64: CAPTCHA_BASE64,
            captchaKey: 'captcha-key'
          }
        }),
        checkCaptcha
      }
    });

    const vm = wrapper.vm as unknown as VerifySlideVm;
    await vm.show();
    await flushPromises();

    vm.status = true;
    vm.isEnd = false;
    vm.moveBlockLeft = '120px';
    vm.setSize.imgWidth = '310px';
    vm.startMoveTime = Date.now() - 1200;

    await vm.end();
    await flushPromises();

    expect(checkCaptcha).toHaveBeenCalledTimes(1);
    expect(vm.passFlag).toBe(true);

    await vi.runAllTimersAsync();
    await flushPromises();

    expect(wrapper.emitted('success')?.length).toBe(1);
    expect(wrapper.emitted('closeBox')?.length).toBe(1);
    expect(vm.visible).toBe(false);
    vi.useRealTimers();
  });

  it('校验异常时应触发 error 事件并写入提示', async () => {
    const checkCaptcha = vi.fn().mockRejectedValue(new Error('网络异常'));
    const wrapper = mount(VerifySlide, {
      props: {
        barSize: {
          width: '310px',
          height: '50px'
        },
        loadCaptcha: vi.fn().mockResolvedValue({
          code: 200,
          data: {
            originBase64: CAPTCHA_BASE64,
            jigsawBase64: CAPTCHA_BASE64,
            captchaKey: 'captcha-key'
          }
        }),
        checkCaptcha
      }
    });

    const vm = wrapper.vm as unknown as VerifySlideVm;
    await vm.show();
    await flushPromises();

    vm.status = true;
    vm.isEnd = false;
    vm.moveBlockLeft = '80px';
    vm.setSize.imgWidth = '310px';

    await vm.end();
    await flushPromises();

    expect(checkCaptcha).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('error')?.length).toBe(1);
    expect(vm.passFlag).toBe(false);
    expect(vm.tipWords).toBe('网络异常');
  });

  it('校验返回失败码时应提示错误并触发 refresh 重置', async () => {
    vi.useFakeTimers();
    const loadCaptcha = vi.fn().mockResolvedValue({
      code: 200,
      data: {
        originBase64: CAPTCHA_BASE64,
        jigsawBase64: CAPTCHA_BASE64,
        captchaKey: 'captcha-key'
      }
    });
    const checkCaptcha = vi.fn().mockResolvedValue({
      code: 500,
      message: '拼图失败'
    });
    const wrapper = mount(VerifySlide, {
      props: {
        loadCaptcha,
        checkCaptcha
      }
    });
    const vm = wrapper.vm as unknown as VerifySlideVm;

    await vm.show();
    await flushPromises();

    vm.status = true;
    vm.isEnd = false;
    vm.moveBlockLeft = '100px';
    vm.setSize.imgWidth = '310px';

    await vm.end();
    await flushPromises();

    expect(checkCaptcha).toHaveBeenCalledTimes(1);
    expect(vm.passFlag).toBe(false);
    expect(vm.tipWords).toBe('拼图失败');

    await vi.runAllTimersAsync();
    await flushPromises();

    expect(loadCaptcha).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('触摸拖动分支应更新滑块偏移并支持关闭按钮', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as VerifySlideVm;
    await vm.show();
    await flushPromises();

    const barArea = wrapper.get('.verify-bar-area').element as HTMLElement;
    Object.defineProperty(barArea, 'offsetWidth', {
      value: 310,
      configurable: true
    });
    Object.defineProperty(barArea, 'getBoundingClientRect', {
      value: () => ({ left: 20 }),
      configurable: true
    });

    const startPreventDefault = vi.fn();
    const startStopPropagation = vi.fn();
    const startEvent = {
      touches: [{ pageX: 120 }],
      preventDefault: startPreventDefault,
      stopPropagation: startStopPropagation
    } as unknown as TouchEvent;
    vm.start(startEvent);

    const movePreventDefault = vi.fn();
    const moveEvent = {
      touches: [{ pageX: 160 }],
      preventDefault: movePreventDefault
    } as unknown as TouchEvent;
    vm.move(moveEvent);

    expect(vm.status).toBe(true);
    expect(vm.startLeft).toBe(100);
    expect(vm.moveBlockLeft).toBeDefined();
    expect(startPreventDefault).toHaveBeenCalled();
    expect(movePreventDefault).toHaveBeenCalled();

    await wrapper.get('.verifybox-close').trigger('click');
    expect(wrapper.emitted('closeBox')?.length).toBe(1);
  });
});
