import { describe, expect, it } from 'vitest'
import { parseRuntimeConfig } from './platform-config'

describe('parseRuntimeConfig preset 收敛', () => {
  it('preset=static-single 支持最小配置并自动补全', () => {
    const config = parseRuntimeConfig({
      preset: 'static-single',
    })

    expect(config.preset).toBe('static-single')
    expect(config.menuMode).toBe('static')
    expect(config.backend).toBe('default')
    expect(config.authMode).toBe('token')
    expect(config.tokenKey).toBe('token')
    expect(config.idTokenKey).toBe('idToken')
    expect(config.defaultSystemCode).toBe('default')
    expect(config.systemHomeMap).toEqual({
      default: '/home/index',
    })
  })

  it('preset=remote-single 支持最小配置并自动补全', () => {
    const config = parseRuntimeConfig({
      preset: 'remote-single',
    })

    expect(config.preset).toBe('remote-single')
    expect(config.menuMode).toBe('remote')
    expect(config.backend).toBe('default')
    expect(config.defaultSystemCode).toBe('default')
    expect(config.systemHomeMap).toEqual({
      default: '/home/index',
    })
  })

  it('preset 下未显式传 storageNamespace 时应默认对齐 appcode', () => {
    const config = parseRuntimeConfig({
      preset: 'remote-single',
      appcode: 'demo-admin',
    })

    expect(config.appcode).toBe('demo-admin')
    expect(config.storageNamespace).toBe('demo-admin')
  })

  it('preset 与 menuMode 冲突时应报错', () => {
    expect(() =>
      parseRuntimeConfig({
        preset: 'static-single',
        menuMode: 'remote',
      })
    ).toThrowError(/preset=static-single.*menuMode=remote/)
  })

  it('preset 下 systemHomeMap 只能配置一个系统', () => {
    expect(() =>
      parseRuntimeConfig({
        preset: 'remote-single',
        systemHomeMap: {
          admin: '/home/index',
          report: '/report/home',
        },
      })
    ).toThrowError(/单系统模式/)
  })

  it('preset 下 defaultSystemCode 必须命中 systemHomeMap', () => {
    expect(() =>
      parseRuntimeConfig({
        preset: 'remote-single',
        defaultSystemCode: 'admin_server',
        systemHomeMap: {
          report: '/report/home',
        },
      })
    ).toThrowError(/defaultSystemCode/)
  })
})
