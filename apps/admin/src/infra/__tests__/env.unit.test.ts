import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

vi.mock('../../config/platform-config', () => ({
  getPlatformConfig: vi.fn()
}));

import { getPlatformConfig } from '../../config/platform-config';
import { resolveAppEnv, resolveDefaultSystemCode, resolveSczfwHeaders } from '../env';

const mockedGetPlatformConfig = vi.mocked(getPlatformConfig);

describe('infra/env', () => {
  beforeEach(() => {
    mockedGetPlatformConfig.mockReset();
  });

  it('sczfw 场景默认系统编码应回退到 admin_server', () => {
    expect(resolveDefaultSystemCode({ backend: 'sczfw' })).toBe('admin_server');
    expect(resolveDefaultSystemCode({ backend: 'default' })).toBeUndefined();
    expect(resolveDefaultSystemCode({ backend: 'sczfw', defaultSystemCode: 'custom-system' })).toBe(
      'custom-system'
    );
  });

  it('仅 sczfw 场景生成网关头', () => {
    expect(
      resolveSczfwHeaders({
        backend: 'sczfw',
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
      resolveSczfwHeaders({
        backend: 'default',
        authorizationType: 'ADMIN',
        appsource: 'frame',
        appcode: 'one-base-template'
      })
    ).toBeUndefined();
  });

  it('应将构建期与运行时配置合并为 appEnv', () => {
    mockedGetPlatformConfig.mockReturnValue({
      backend: 'sczfw',
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
      backend: 'sczfw',
      authMode: 'cookie',
      tokenKey: 'token',
      idTokenKey: 'idToken',
      menuMode: 'remote',
      enabledModules: ['system-management'],
      storageNamespace: 'admin-app',
      defaultSystemCode: 'admin_server',
      sczfwSystemPermissionCode: 'admin_server',
      systemHomeMap: {
        admin_server: '/home/index'
      },
      sczfwHeaders: {
        'Authorization-Type': 'ADMIN',
        Appsource: 'frame',
        Appcode: 'admin-app'
      },
      clientSignatureSalt: 'salt-1',
      clientSignatureClientId: 'client-1'
    });
  });
});
