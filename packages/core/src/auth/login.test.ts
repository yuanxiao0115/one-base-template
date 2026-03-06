import { beforeEach, describe, expect, it, vi } from 'vitest'

const { loginMock, finalizeAuthSessionMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  finalizeAuthSessionMock: vi.fn()
}))

vi.mock('../stores/auth', () => ({
  useAuthStore: () => ({
    login: loginMock
  })
}))

vi.mock('./flow', async () => {
  const actual = await vi.importActual<typeof import('./flow')>('./flow')

  return {
    ...actual,
    finalizeAuthSession: finalizeAuthSessionMock
  }
})

import { loginByPassword, resolvePortalLoginTarget } from './login'

describe('resolvePortalLoginTarget', () => {
  it('有 redirect 时优先返回 redirect', () => {
    expect(
      resolvePortalLoginTarget({
        redirect: '/portal/index/1',
        fallback: '/portal/index',
        frontConfig: {
          enable: false,
          customUrl: '/other'
        }
      })
    ).toBe('/portal/index/1')
  })

  it('没有 redirect 且 enable=true 时返回 fallback', () => {
    expect(
      resolvePortalLoginTarget({
        fallback: '/portal/index',
        frontConfig: {
          enable: true,
          customUrl: '/other'
        }
      })
    ).toBe('/portal/index')
  })

  it('没有 redirect 且 enable=false 时返回合法 customUrl', () => {
    expect(
      resolvePortalLoginTarget({
        fallback: '/portal/index',
        frontConfig: {
          enable: false,
          customUrl: '/front/home'
        }
      })
    ).toBe('/front/home')
  })

  it('customUrl 非法时回退 fallback', () => {
    expect(
      resolvePortalLoginTarget({
        fallback: '/portal/index',
        frontConfig: {
          enable: false,
          customUrl: 'https://example.com'
        }
      })
    ).toBe('/portal/index')
  })
})

describe('loginByPassword', () => {
  beforeEach(() => {
    loginMock.mockReset()
    finalizeAuthSessionMock.mockReset()
    finalizeAuthSessionMock.mockResolvedValue(undefined)
  })

  it('default 模式直接提交原始账号密码并完成会话收口', async () => {
    loginMock.mockResolvedValue(undefined)

    await loginByPassword({
      backend: 'default',
      username: 'demo',
      password: 'demo'
    })

    expect(loginMock).toHaveBeenCalledTimes(1)
    expect(loginMock).toHaveBeenCalledWith({
      username: 'demo',
      password: 'demo'
    })
    expect(finalizeAuthSessionMock).toHaveBeenCalledWith({
      shouldFetchMe: false
    })
  })

  it('sczfw 模式使用 encryptor 和验证码参数', async () => {
    loginMock.mockResolvedValue(undefined)
    const encryptor = vi.fn((value: string) => `enc:${value}`)

    await loginByPassword({
      backend: 'sczfw',
      username: 'user',
      password: 'pass',
      captcha: 'captcha-value',
      captchaKey: 'captcha-key',
      encryptor
    })

    expect(encryptor).toHaveBeenCalledTimes(2)
    expect(encryptor).toHaveBeenNthCalledWith(1, 'user')
    expect(encryptor).toHaveBeenNthCalledWith(2, 'pass')
    expect(loginMock).toHaveBeenCalledWith({
      username: 'enc:user',
      password: 'enc:pass',
      captcha: 'captcha-value',
      captchaKey: 'captcha-key',
      encrypt: 1
    })
    expect(finalizeAuthSessionMock).toHaveBeenCalledWith({
      shouldFetchMe: false
    })
  })

  it('sczfw 模式允许直接提交已加密账号密码', async () => {
    loginMock.mockResolvedValue(undefined)

    await loginByPassword({
      backend: 'sczfw',
      username: 'enc:user',
      password: 'enc:pass',
      captcha: 'captcha-value',
      captchaKey: 'captcha-key',
      alreadyEncrypted: true
    })

    expect(loginMock).toHaveBeenCalledWith({
      username: 'enc:user',
      password: 'enc:pass',
      captcha: 'captcha-value',
      captchaKey: 'captcha-key',
      encrypt: 1
    })
    expect(finalizeAuthSessionMock).toHaveBeenCalledWith({
      shouldFetchMe: false
    })
  })
})
