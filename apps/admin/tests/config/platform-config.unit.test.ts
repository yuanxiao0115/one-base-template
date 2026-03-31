import { describe, expect, it } from 'vite-plus/test';
import { getPlatformConfig, loadPlatformConfig } from '@/config/platform-config';

describe('config/platform-config', () => {
  it('应返回代码静态配置并支持同步读取', () => {
    const config = getPlatformConfig();

    expect(config.backend).toBe('basic');
    expect(config.menuMode).toBe('remote');
    expect(config.enabledModules).toContain('home');
    expect(config.enabledModules).toContain('DocumentFormManagement');
    expect(config.storageNamespace).toBe('one-base-template-admin');
    expect(config.tokenKey).toBe('one-base-template-admin-token');
    expect(config.idTokenKey).toBe('one-base-template-admin-id-token');
    expect(config.systemHomeMap.admin_server).toBe('/home/index');
  });

  it('异步读取应返回同一份静态配置', async () => {
    const fromLoad = await loadPlatformConfig();
    const fromGet = getPlatformConfig();

    expect(fromLoad).toBe(fromGet);
  });
});
