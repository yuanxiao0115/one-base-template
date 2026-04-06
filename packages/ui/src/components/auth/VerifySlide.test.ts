import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vite-plus/test';
import VerifySlide from './VerifySlide.vue';

const CAPTCHA_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6XbWQAAAABJRU5ErkJggg==';
const JPEG_BASE64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2w==';
const PNG_DATA_URI = `data:image/png;base64,${CAPTCHA_BASE64}`;

interface VerifySlideVm {
  show: () => Promise<void>;
  end: () => Promise<void>;
  getPictrue: () => Promise<void>;
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
});
