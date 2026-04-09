import { parseRuntimeConfig, type RuntimeConfig } from '@one-base-template/core';

/** 登录成功后兜底首页 */
export const homeFallback = '/home/index';

const systemScope = {
  /** 系统范围模式 */
  systemConfig: {
    /** 单系统模式 */
    mode: 'single',
    /** 默认系统编码 */
    code: 'admin_server'
  },
  /** 默认系统编码（用于首页与菜单装配） */
  defaultSystemCode: 'admin_server',
  /** 系统首页映射 */
  systemHomeMap: {
    /** admin_server 首页 */
    admin_server: '/home/index'
  }
};

const runtimeMode = {
  /** 后端适配类型 */
  backend: 'basic',
  /** 鉴权模式 */
  authMode: 'token',
  /** 路由 history 模式 */
  historyMode: 'history',
  /** 菜单来源模式 */
  menuMode: 'remote'
};

const identity = {
  /** 授权类型 */
  authorizationType: 'ADMIN',
  /** 应用来源 */
  appsource: 'frame',
  /** 应用编码 */
  appcode: 'od',
  /** 本地缓存命名空间 */
  storageNamespace: 'one-base-template-admin',
  /** 客户端签名 clientId */
  clientSignatureClientId: '1',
  /** 客户端签名 salt */
  clientSignatureSalt: 'fc54f9655dc04da486663f1055978ba8'
};

const modules = {
  /** 启用模块清单 */
  enabledModules: [
    'home',
    'admin-management',
    'log-management',
    'system-management',
    'cms-management',
    'portal-management',
    'message-management',
    'portal-login-management',
    'document-form-management'
  ]
};

/** 应用运行配置 */
export const app: RuntimeConfig = parseRuntimeConfig({
  ...systemScope,
  ...runtimeMode,
  ...identity,
  ...modules
});

/** 异步加载运行配置 */
export function loadApp(): Promise<RuntimeConfig> {
  return Promise.resolve(app);
}

/** 读取运行配置 */
export function getApp(): RuntimeConfig {
  return app;
}
