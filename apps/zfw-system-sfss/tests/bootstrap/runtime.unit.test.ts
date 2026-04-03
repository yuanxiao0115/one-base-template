import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { getApp } from '@/config/app';
import { resolveRuntime, resolveDefaultSystemCode, resolveBasicHeaders } from '@/bootstrap/runtime';

describe('bootstrap/runtime', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

  it('应将构建期与代码静态配置合并为 appEnv', () => {
    const runtime = getApp();
    const appEnv = resolveRuntime({
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
      backend: runtime.backend,
      authMode: runtime.authMode,
      tokenKey: runtime.tokenKey,
      idTokenKey: runtime.idTokenKey,
      menuMode: runtime.menuMode,
      enabledModules: runtime.enabledModules,
      storageNamespace: runtime.storageNamespace ?? runtime.appcode,
      defaultSystemCode: runtime.defaultSystemCode,
      basicSystemPermissionCode: runtime.defaultSystemCode,
      systemHomeMap: runtime.systemHomeMap,
      basicHeaders: {
        'Authorization-Type': runtime.authorizationType,
        Appsource: runtime.appsource,
        Appcode: runtime.appcode
      },
      clientSignatureSalt: runtime.clientSignatureSalt,
      clientSignatureClientId: runtime.clientSignatureClientId
    });
  });
});
