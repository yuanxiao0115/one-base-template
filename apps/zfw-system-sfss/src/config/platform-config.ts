import { parseRuntimeConfig, type RuntimeConfig } from '@one-base-template/core';

/**
 * admin-lite 平台配置入口（代码静态配置）。
 *
 * 维护建议：
 * - 仅维护这里的配置常量，不再依赖 public/platform-config.json；
 * - 如需新增字段，先对齐 `packages/core/src/config/platform-config.ts` 契约。
 *
 * 配置项清单（按阅读顺序）：
 * 1. `systemConfig`：系统范围配置；支持单系统、多系统白名单、多系统全量三种模式。
 * 2. `backend`：后端适配类型；`basic` 表示走 basic 适配协议。
 * 3. `authMode`：鉴权模式；`token` 表示前端基于 token 管理登录态。
 * 4. `historyMode`：路由模式；`history` 对应 `createWebHistory`。
 * 5. `menuMode`：菜单来源；`remote` 表示菜单来自后端接口。
 * 6. `authorizationType`：权限类型透传字段；用于后端权限域区分。
 * 7. `appsource`：应用来源透传字段；用于后端识别终端来源。
 * 8. `appcode`：应用唯一标识；用于平台侧区分不同子应用。
 * 9. `storageNamespace`：本地存储命名空间；用于隔离多应用缓存与 token key 前缀。
 * 10. `clientSignatureClientId`：basic 签名 clientId。
 * 11. `clientSignatureSalt`：basic 签名盐值（公开盐，不是 secret）。
 * 12. `defaultSystemCode`：默认系统编码；首次进入或无系统上下文时使用。
 * 13. `systemHomeMap`：系统首页映射；key 为 systemCode，value 为首页路由。
 * 14. `enabledModules`：模块白名单；仅加载列表中的模块 id。
 *
 * 补充：
 * - `tokenKey` / `idTokenKey` 未显式配置时，会按 `storageNamespace` 自动生成。
 */
const systemScopeConfig = {
  systemConfig: {
    mode: 'single',
    code: 'judicial_petition_management_system'
  },
  defaultSystemCode: 'judicial_petition_management_system',
  systemHomeMap: {
    judicial_petition_management_system: '/law-supervison/sunshine-petition/shi'
  }
};

const runtimeModeConfig = {
  backend: 'basic',
  authMode: 'token',
  historyMode: 'history',
  menuMode: 'remote'
};

const appIdentityConfig = {
  authorizationType: 'ADMIN',
  appsource: 'frame',
  // 老项目默认 Appcode 为 od，菜单与登录联调沿用该口径。
  appcode: 'od',
  storageNamespace: 'one-base-template-zfw-system-sfss',
  clientSignatureClientId: '1',
  clientSignatureSalt: 'fc54f9655dc04da486663f1055978ba8'
};

const moduleConfig = {
  enabledModules: ['home', 'admin-management', 'log-management', 'system-management', 'system-sfss']
};

const platformConfig: RuntimeConfig = parseRuntimeConfig({
  ...systemScopeConfig,
  ...runtimeModeConfig,
  ...appIdentityConfig,
  ...moduleConfig
});

export async function loadPlatformConfig(): Promise<RuntimeConfig> {
  return platformConfig;
}

export function getPlatformConfig(): RuntimeConfig {
  return platformConfig;
}
