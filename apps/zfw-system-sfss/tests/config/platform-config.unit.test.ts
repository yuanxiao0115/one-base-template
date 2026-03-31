import { describe, expect, it } from 'vite-plus/test';
import { getPlatformConfig, loadPlatformConfig } from '@/config/platform-config';

describe('config/platform-config', () => {
  it('应返回代码静态平台配置', () => {
    const config = getPlatformConfig();

    expect(config.backend).toBe('basic');
    expect(config.menuMode).toBe('remote');
    expect(config.authMode).toBe('token');
    expect(config.enabledModules).toContain('home');
    expect(config.storageNamespace).toBe('one-base-template-zfw-system-sfss');
    expect(config.tokenKey).toBe('one-base-template-zfw-system-sfss-token');
    expect(config.idTokenKey).toBe('one-base-template-zfw-system-sfss-id-token');
    expect(config.systemHomeMap.admin_server).toBe('/home/index');
  });

  it('异步读取与同步读取应指向同一配置对象', async () => {
    const asyncConfig = await loadPlatformConfig();
    const syncConfig = getPlatformConfig();

    expect(asyncConfig).toBe(syncConfig);
  });
});
