import { describe, expect, it } from 'vite-plus/test';
import { parseRuntimeConfig } from './platform-config';

function createBaseInput() {
  return {
    systemConfig: {
      mode: 'single' as const,
      code: 'admin_server'
    },
    backend: 'basic' as const,
    authMode: 'token' as const,
    historyMode: 'history' as const,
    menuMode: 'remote' as const,
    enabledModules: '*',
    authorizationType: 'ADMIN',
    appsource: 'frame',
    appcode: 'demo-admin',
    systemHomeMap: {
      admin_server: '/home/index'
    }
  };
}

describe('parseRuntimeConfig systemConfig 收敛', () => {
  it('single 模式应自动补齐 defaultSystemCode', () => {
    const config = parseRuntimeConfig(createBaseInput());

    expect(config.systemConfig).toEqual({
      mode: 'single',
      code: 'admin_server'
    });
    expect(config.defaultSystemCode).toBe('admin_server');
    expect(config.tokenKey).toBe('demo-admin-token');
    expect(config.idTokenKey).toBe('demo-admin-id-token');
  });

  it('single 模式显式配置 defaultSystemCode 不一致时应报错', () => {
    expect(() =>
      parseRuntimeConfig({
        ...createBaseInput(),
        defaultSystemCode: 'report_system'
      })
    ).toThrowError(/single 模式下 "defaultSystemCode" 必须与 "systemConfig.code" 一致/);
  });

  it('single 模式缺少 code 时应报错', () => {
    expect(() =>
      parseRuntimeConfig({
        ...createBaseInput(),
        // @ts-expect-error 测试非法输入
        systemConfig: { mode: 'single' }
      })
    ).toThrowError(/systemConfig\.code/);
  });

  it('multi + codes 应去重并保留输入顺序', () => {
    const config = parseRuntimeConfig({
      ...createBaseInput(),
      systemConfig: {
        mode: 'multi',
        codes: ['admin_server', ' report_center ', 'admin_server']
      },
      defaultSystemCode: 'admin_server',
      systemHomeMap: {
        admin_server: '/home/index',
        report_center: '/report/index'
      }
    });

    expect(config.systemConfig).toEqual({
      mode: 'multi',
      codes: ['admin_server', 'report_center']
    });
  });

  it('multi + 空数组应报错', () => {
    expect(() =>
      parseRuntimeConfig({
        ...createBaseInput(),
        // @ts-expect-error 测试非法输入
        systemConfig: {
          mode: 'multi',
          codes: []
        }
      })
    ).toThrowError(/systemConfig\.codes/);
  });

  it('multi 不传 codes 应视为全量系统', () => {
    const config = parseRuntimeConfig({
      ...createBaseInput(),
      systemConfig: {
        mode: 'multi'
      }
    });

    expect(config.systemConfig).toEqual({
      mode: 'multi'
    });
  });

  it('defaultSystemCode 未命中 systemHomeMap 时应报错', () => {
    expect(() =>
      parseRuntimeConfig({
        ...createBaseInput(),
        defaultSystemCode: 'not-exist'
      })
    ).toThrowError(/defaultSystemCode/);
  });

  it('旧 preset 字段应直接报错', () => {
    expect(() =>
      parseRuntimeConfig({
        ...createBaseInput(),
        // @ts-expect-error 测试废弃字段
        preset: 'remote-single'
      })
    ).toThrowError(/"preset" 已废弃/);
  });

  it('显式传 storageNamespace 时 tokenKey 应按命名空间自动生成', () => {
    const config = parseRuntimeConfig({
      ...createBaseInput(),
      storageNamespace: 'demo-storage'
    });

    expect(config.storageNamespace).toBe('demo-storage');
    expect(config.tokenKey).toBe('demo-storage-token');
    expect(config.idTokenKey).toBe('demo-storage-id-token');
  });

  it('显式传 tokenKey/idTokenKey 时应优先使用显式值', () => {
    const config = parseRuntimeConfig({
      ...createBaseInput(),
      storageNamespace: 'demo-storage',
      tokenKey: 'custom-token',
      idTokenKey: 'custom-id-token'
    });

    expect(config.tokenKey).toBe('custom-token');
    expect(config.idTokenKey).toBe('custom-id-token');
  });
});

describe('parseRuntimeConfig 基础契约', () => {
  it('显式传已废弃的 clientSignatureSecret 时应提示改名', () => {
    expect(() =>
      parseRuntimeConfig({
        ...createBaseInput(),
        clientSignatureSecret: 'legacy-secret'
      })
    ).toThrowError(/clientSignatureSecret/);
  });

  it('enabledModules 应保留去重后的模块列表', () => {
    const config = parseRuntimeConfig({
      ...createBaseInput(),
      enabledModules: ['PortalManagement', ' PortalManagement ', 'LogManagement']
    });

    expect(config.enabledModules).toEqual(['PortalManagement', 'LogManagement']);
  });

  it('应支持显式配置 hash 路由模式', () => {
    const config = parseRuntimeConfig({
      ...createBaseInput(),
      historyMode: 'hash'
    });

    expect(config.historyMode).toBe('hash');
  });
});
