import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import type { BackendAdapter } from '@one-base-template/core';

const mocks = vi.hoisted(() => {
  const fetchMenuTree = vi.fn(async () => [
    {
      path: '/home/index',
      title: '首页'
    }
  ]);
  const fetchMenuSystems = vi.fn(async () => [
    {
      code: 'judicial_petition_management_system',
      name: '涉法涉诉信访协同子系统',
      menus: [
        {
          path: '/law-supervison/sunshine-petition/shi',
          title: '到市访'
        }
      ]
    },
    {
      code: 'document_system',
      name: '公文系统',
      menus: [
        {
          path: '/document/index',
          title: '公文首页'
        }
      ]
    }
  ]);

  return {
    fetchMenuTree,
    fetchMenuSystems,
    createDefaultAdapter: vi.fn(() => ({ __adapter: 'default' }) as unknown as BackendAdapter),
    createBasicAdapter: vi.fn(
      () =>
        ({
          __adapter: 'basic',
          menu: {
            fetchMenuTree,
            fetchMenuSystems
          }
        }) as unknown as BackendAdapter
    )
  };
});

vi.mock('@one-base-template/adapters', () => ({
  createDefaultAdapter: mocks.createDefaultAdapter,
  createBasicAdapter: mocks.createBasicAdapter
}));

import { createAppAdapter } from '@/bootstrap/adapter';

describe('bootstrap/adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('single 模式应只返回 systemConfig.code 对应系统', async () => {
    const adapter = createAppAdapter({
      backend: 'basic',
      http: {} as never,
      tokenKey: 'token-key',
      basicSystemPermissionCode: 'judicial_petition_management_system',
      systemConfig: {
        mode: 'single',
        code: 'judicial_petition_management_system'
      },
      basicTicketSsoEndpoint: '/cmict/auth/ticket/sso'
    });

    const systems = await adapter.menu.fetchMenuSystems?.();
    expect(systems).toEqual([
      {
        code: 'judicial_petition_management_system',
        name: '涉法涉诉信访协同子系统',
        menus: [
          {
            path: '/law-supervison/sunshine-petition/shi',
            title: '到市访'
          }
        ]
      }
    ]);
  });

  it('multi + codes 模式应仅保留白名单系统（缺失 code 忽略）', async () => {
    const adapter = createAppAdapter({
      backend: 'basic',
      http: {} as never,
      tokenKey: 'token-key',
      basicSystemPermissionCode: 'judicial_petition_management_system',
      systemConfig: {
        mode: 'multi',
        codes: ['document_system', 'missing_system']
      },
      basicTicketSsoEndpoint: '/cmict/auth/ticket/sso'
    });

    const systems = await adapter.menu.fetchMenuSystems?.();
    expect(systems).toEqual([
      {
        code: 'document_system',
        name: '公文系统',
        menus: [
          {
            path: '/document/index',
            title: '公文首页'
          }
        ]
      }
    ]);
  });

  it('multi 不传 codes 时应返回全部系统', async () => {
    const adapter = createAppAdapter({
      backend: 'basic',
      http: {} as never,
      tokenKey: 'token-key',
      basicSystemPermissionCode: 'judicial_petition_management_system',
      systemConfig: {
        mode: 'multi'
      },
      basicTicketSsoEndpoint: '/cmict/auth/ticket/sso'
    });

    const systems = await adapter.menu.fetchMenuSystems?.();
    expect(systems).toHaveLength(2);
  });

  it('single 模式未命中后端系统列表时应回退固定系统', async () => {
    mocks.fetchMenuSystems.mockResolvedValueOnce([
      {
        code: 'document_system',
        name: '公文系统',
        menus: [
          {
            path: '/document/index',
            title: '公文首页'
          }
        ]
      }
    ]);

    const adapter = createAppAdapter({
      backend: 'basic',
      http: {} as never,
      tokenKey: 'token-key',
      basicSystemPermissionCode: 'judicial_petition_management_system',
      systemConfig: {
        mode: 'single',
        code: 'judicial_petition_management_system'
      },
      basicTicketSsoEndpoint: '/cmict/auth/ticket/sso'
    });

    const systems = await adapter.menu.fetchMenuSystems?.();
    expect(systems).toEqual([
      {
        code: 'judicial_petition_management_system',
        name: 'judicial_petition_management_system',
        menus: [
          {
            path: '/home/index',
            title: '首页'
          }
        ]
      }
    ]);
  });
});
