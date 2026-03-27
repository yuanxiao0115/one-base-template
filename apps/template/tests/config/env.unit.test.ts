import { describe, expect, it } from 'vite-plus/test';
import { getPlatformConfig } from '@/config/platform-config';
import { resolveAppEnv, resolveBasicHeaders, resolveDefaultSystemCode } from '@/config/env';

describe('config/env', () => {
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
        appcode: 'template'
      })
    ).toEqual({
      'Authorization-Type': 'ADMIN',
      Appsource: 'frame',
      Appcode: 'template'
    });

    expect(
      resolveBasicHeaders({
        backend: 'default',
        authorizationType: 'ADMIN',
        appsource: 'frame',
        appcode: 'template'
      })
    ).toBeUndefined();
  });

  it('应合并构建期变量与静态平台配置', () => {
    const platformConfig = getPlatformConfig();
    const appEnv = resolveAppEnv({
      buildEnv: {
        isProd: true,
        baseUrl: '/template/',
        apiBaseUrl: 'https://api.example.com'
      }
    });

    expect(appEnv).toMatchObject({
      isProd: true,
      baseUrl: '/template/',
      apiBaseUrl: 'https://api.example.com',
      backend: platformConfig.backend,
      authMode: platformConfig.authMode,
      tokenKey: platformConfig.tokenKey,
      idTokenKey: platformConfig.idTokenKey,
      menuMode: platformConfig.menuMode,
      enabledModules: platformConfig.enabledModules,
      storageNamespace: platformConfig.storageNamespace ?? platformConfig.appcode,
      defaultSystemCode: platformConfig.defaultSystemCode,
      basicSystemPermissionCode: platformConfig.defaultSystemCode,
      systemHomeMap: platformConfig.systemHomeMap,
      basicHeaders: {
        'Authorization-Type': platformConfig.authorizationType,
        Appsource: platformConfig.appsource,
        Appcode: platformConfig.appcode
      },
      clientSignatureSalt: platformConfig.clientSignatureSalt,
      clientSignatureClientId: platformConfig.clientSignatureClientId
    });
  });
});
