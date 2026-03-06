import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import VerifySlide from './VerifySlide.vue'

const CAPTCHA_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6XbWQAAAABJRU5ErkJggg=='
const JPEG_BASE64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2w=='
const PNG_DATA_URI = `data:image/png;base64,${CAPTCHA_BASE64}`

function createWrapper(options?: {
  originBase64?: string
  jigsawBase64?: string
}) {
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
  })
}

describe('VerifySlide', () => {
  it('会把接口返回的裸 base64 解析成可渲染图片地址', async () => {
    const wrapper = createWrapper()

    await (wrapper.vm as typeof wrapper.vm & { show: () => Promise<void> }).show()
    await flushPromises()

    const panelImage = wrapper.find('.verify-img-panel img')

    expect(panelImage.exists()).toBe(true)
    expect(panelImage.attributes('src')).toContain(`data:image/png;base64,${CAPTCHA_BASE64}`)
  })

  it('会把拼图切片挂到滑块内部，并保留初始拖动底座宽度', async () => {
    const wrapper = createWrapper()

    await (wrapper.vm as typeof wrapper.vm & { show: () => Promise<void> }).show()
    await flushPromises()

    const blockImage = wrapper.find('.verify-move-block .verify-sub-block img')

    expect(blockImage.exists()).toBe(true)
    expect(blockImage.attributes('src')).toContain(`data:image/png;base64,${CAPTCHA_BASE64}`)
    expect(wrapper.get('.verify-left-bar').attributes('style')).toContain('width: 50px;')
  })

  it('会把以斜杠开头的 JPEG 裸 base64 也解析为 data url', async () => {
    const wrapper = createWrapper({
      originBase64: JPEG_BASE64,
      jigsawBase64: JPEG_BASE64
    })

    await (wrapper.vm as typeof wrapper.vm & { show: () => Promise<void> }).show()
    await flushPromises()

    expect(wrapper.get('.verify-img-panel img').attributes('src')).toContain(`data:image/jpeg;base64,${JPEG_BASE64}`)
    expect(wrapper.get('.verify-move-block .verify-sub-block img').attributes('src')).toContain(`data:image/jpeg;base64,${JPEG_BASE64}`)
  })

  it('不会重复包裹已经带 data 前缀的图片地址', async () => {
    const wrapper = createWrapper({
      originBase64: PNG_DATA_URI,
      jigsawBase64: PNG_DATA_URI
    })

    await (wrapper.vm as typeof wrapper.vm & { show: () => Promise<void> }).show()
    await flushPromises()

    expect(wrapper.get('.verify-img-panel img').attributes('src')).toBe(PNG_DATA_URI)
    expect(wrapper.get('.verify-move-block .verify-sub-block img').attributes('src')).toBe(PNG_DATA_URI)
  })
})
