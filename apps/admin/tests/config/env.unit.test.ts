import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

vi.mock('@/config/platform-config', () => ({
  getPlatformConfig: vi.fn()
}));

import { getPlatformConfig } from '@/config/platform-config';
import { resolveAppEnv, resolveDefaultSystemCode, resolveBasicHeaders } from '@/config/env';

const mockedGetPlatformConfig = vi.mocked(getPlatformConfig);

describe('config/env', () => {
  beforeEach(() => {
    mockedGetPlatformConfig.mockReset();
  });

  it('basic 场景默认系统编码应回退到 admin_server', () => {
    expect(resolveDefaultSystemCode({ backend: 'basic' })).toBe('admin_server');
    expect(resolveDefaultSystemCode({ backend: 'default' })).toBeUndefined();
    expect(resolveDefaultSystemCode({ backend: 'basic', defaultSystemCode: 'custom-system' })).toBe(
      'custom-system'
    );
  });

  it('仅 basic 场景生成网关头', () => {
    expect(
      resolveBasicHeaders({
        backend: 'basic',
        authorizationType: 'ADMIN',
        appsource: 'frame',
        appcode: 'one-base-template'
      })
    ).toEqual({
      'Authorization-Type': 'ADMIN',
      Appsource: 'frame',
      Appcode: 'one-base-template'
    });

    expect(
      resolveBasicHeaders({
        backend: 'default',
        authorizationType: 'ADMIN',
        appsource: 'frame',
        appcode: 'one-base-template'
      })
    ).toBeUndefined();
  });

  it('应将构建期与运行时配置合并为 appEnv', () => {
    mockedGetPlatformConfig.mockReturnValue({
      backend: 'basic',
      authMode: 'cookie',
      tokenKey: 'token',
      idTokenKey: 'idToken',
      menuMode: 'remote',
      enabledModules: ['system-management'],
      authorizationType: 'ADMIN',
      appsource: 'frame',
      appcode: 'admin-app',
      clientSignatureSalt: 'salt-1',
      clientSignatureClientId: 'client-1',
      defaultSystemCode: 'admin_server',
      systemHomeMap: {
        admin_server: '/home/index'
      }
    } as never);

    const appEnv = resolveAppEnv({
      buildEnv: {
        isProd: true,
        baseUrl: '/admin/',
        apiBaseUrl: 'https://api.example.com'
      }
    });

    expect(appEnv).toMatchObject({
      isProd: true,
      baseUrl: '/admin/',
      apiBaseUrl: 'https://api.example.com',
      backend: 'basic',
      authMode: 'cookie',
      tokenKey: 'token',
      idTokenKey: 'idToken',
      menuMode: 'remote',
      enabledModules: ['system-management'],
      storageNamespace: 'admin-app',
      defaultSystemCode: 'admin_server',
      basicSystemPermissionCode: 'admin_server',
      systemHomeMap: {
        admin_server: '/home/index'
      },
      basicHeaders: {
        'Authorization-Type': 'ADMIN',
        Appsource: 'frame',
        Appcode: 'admin-app'
      },
      clientSignatureSalt: 'salt-1',
      clientSignatureClientId: 'client-1'
    });
  });
});
