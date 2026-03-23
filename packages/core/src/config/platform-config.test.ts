import { describe, expect, it } from 'vite-plus/test';
import { parseRuntimeConfig } from './platform-config';

describe('parseRuntimeConfig preset 收敛', () => {
  it('preset=static-single 支持最小配置并自动补全', () => {
    const config = parseRuntimeConfig({
      preset: 'static-single'
    });

    expect(config.preset).toBe('static-single');
    expect(config.menuMode).toBe('static');
    expect(config.backend).toBe('default');
    expect(config.authMode).toBe('token');
    expect(config.tokenKey).toBe('token');
    expect(config.idTokenKey).toBe('idToken');
    expect(config.defaultSystemCode).toBe('default');
    expect(config.systemHomeMap).toEqual({
      default: '/home/index'
    });
  });

  it('preset=remote-single 支持最小配置并自动补全', () => {
    const config = parseRuntimeConfig({
      preset: 'remote-single'
    });

    expect(config.preset).toBe('remote-single');
    expect(config.menuMode).toBe('remote');
    expect(config.backend).toBe('default');
    expect(config.defaultSystemCode).toBe('default');
    expect(config.systemHomeMap).toEqual({
      default: '/home/index'
    });
  });

  it('preset 下未显式传 storageNamespace 时应默认对齐 appcode', () => {
    const config = parseRuntimeConfig({
      preset: 'remote-single',
      appcode: 'demo-admin'
    });

    expect(config.appcode).toBe('demo-admin');
    expect(config.storageNamespace).toBe('demo-admin');
  });

  it('preset 与 menuMode 冲突时应报错', () => {
    expect(() =>
      parseRuntimeConfig({
        preset: 'static-single',
        menuMode: 'remote'
      })
    ).toThrowError(/preset=static-single.*menuMode=remote/);
  });

  it('preset 下 systemHomeMap 只能配置一个系统', () => {
    expect(() =>
      parseRuntimeConfig({
        preset: 'remote-single',
        systemHomeMap: {
          admin: '/home/index',
          report: '/report/home'
        }
      })
    ).toThrowError(/单系统模式/);
  });

  it('preset 下 defaultSystemCode 必须命中 systemHomeMap', () => {
    expect(() =>
      parseRuntimeConfig({
        preset: 'remote-single',
        defaultSystemCode: 'admin_server',
        systemHomeMap: {
          report: '/report/home'
        }
      })
    ).toThrowError(/defaultSystemCode/);
  });

  it('preset 下显式传 storageNamespace 时不应被 appcode 默认值覆盖', () => {
    const config = parseRuntimeConfig({
      preset: 'remote-single',
      appcode: 'demo-admin',
      storageNamespace: 'demo-storage'
    });

    expect(config.appcode).toBe('demo-admin');
    expect(config.storageNamespace).toBe('demo-storage');
  });
});

describe('parseRuntimeConfig 基础契约', () => {
  it('显式传已废弃的 clientSignatureSecret 时应提示改名', () => {
    expect(() =>
      parseRuntimeConfig({
        backend: 'sczfw',
        authMode: 'token',
        tokenKey: 'token',
        idTokenKey: 'idToken',
        menuMode: 'remote',
        enabledModules: '*',
        authorizationType: 'ADMIN',
        appsource: 'frame',
        appcode: 'demo-admin',
        clientSignatureSecret: 'legacy-secret',
        systemHomeMap: {
          default: '/home/index'
        }
      })
    ).toThrowError(/clientSignatureSecret/);
  });

  it('enabledModules 应保留去重后的模块列表', () => {
    const config = parseRuntimeConfig({
      backend: 'default',
      authMode: 'token',
      tokenKey: 'token',
      idTokenKey: 'idToken',
      menuMode: 'remote',
      enabledModules: ['PortalManagement', ' PortalManagement ', 'LogManagement'],
      authorizationType: 'ADMIN',
      appsource: 'frame',
      appcode: 'demo-admin',
      systemHomeMap: {
        default: '/home/index'
      }
    });

    expect(config.enabledModules).toEqual(['PortalManagement', 'LogManagement']);
  });
});
