import { describe, expect, it } from 'vite-plus/test';
import { getApp, loadApp } from '@/config/app';

describe('config/app', () => {
  it('应返回代码静态配置并支持同步读取', () => {
    const config = getApp();

    expect(config.backend).toBe('basic');
    expect(config.historyMode).toBe('history');
    expect(config.menuMode).toBe('remote');
    expect(config.enabledModules).toContain('home');
    expect(config.enabledModules).toEqual([
      'home',
      'admin-management',
      'log-management',
      'system-management',
      'system-sfss'
    ]);
    expect(config.storageNamespace).toBe('one-base-template-zfw-system-sfss');
    expect(config.tokenKey).toBe('one-base-template-zfw-system-sfss-token');
    expect(config.idTokenKey).toBe('one-base-template-zfw-system-sfss-id-token');
    expect(config.appcode).toBe('od');
    expect(config.defaultSystemCode).toBe('judicial_petition_management_system');
    expect(config.systemHomeMap.judicial_petition_management_system).toBe(
      '/law-supervison/sunshine-petition/shi'
    );
  });

  it('异步读取应返回同一份静态配置', async () => {
    const fromLoad = await loadApp();
    const fromGet = getApp();

    expect(fromLoad).toBe(fromGet);
  });
});
