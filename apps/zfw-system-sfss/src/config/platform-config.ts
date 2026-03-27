import { parseRuntimeConfig, type RuntimeConfig } from '@one-base-template/core';

/**
 * template 平台配置入口（代码静态配置）。
 *
 * 维护建议：
 * - 仅维护这里的配置常量，不再依赖 public/platform-config.json；
 * - 如需新增字段，先对齐 `packages/core/src/config/platform-config.ts` 契约。
 */
const platformConfig: RuntimeConfig = parseRuntimeConfig({
  preset: 'remote-single',
  backend: 'basic',
  authMode: 'token',
  tokenKey: 'token',
  idTokenKey: 'idToken',
  menuMode: 'remote',
  authorizationType: 'ADMIN',
  appsource: 'frame',
  appcode: 'zfw-system-sfss',
  storageNamespace: 'one-base-template-zfw-system-sfss',
  clientSignatureClientId: '1',
  clientSignatureSalt: 'fc54f9655dc04da486663f1055978ba8',
  defaultSystemCode: 'admin_server',
  systemHomeMap: {
    admin_server: '/home/index'
  },
  enabledModules: ['home', 'demo', 'starter-crud']
});

export async function loadPlatformConfig(): Promise<RuntimeConfig> {
  return platformConfig;
}

export function getPlatformConfig(): RuntimeConfig {
  return platformConfig;
}
