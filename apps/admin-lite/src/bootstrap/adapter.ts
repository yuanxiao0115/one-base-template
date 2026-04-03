import type {
  AppMenuSystem,
  BackendAdapter,
  ObHttp,
  RuntimeSystemConfig
} from '@one-base-template/core';
import { createDefaultAdapter, createBasicAdapter } from '@one-base-template/adapters';

import type { BackendKind } from '../config/env';

function resolveAllowedSystemCodes(systemConfig: RuntimeSystemConfig): Set<string> | undefined {
  if (systemConfig.mode === 'single') {
    return new Set([systemConfig.code]);
  }
  if (!systemConfig.codes || systemConfig.codes.length === 0) {
    return undefined;
  }
  return new Set(systemConfig.codes);
}

function filterMenuSystemsByConfig(
  systems: AppMenuSystem[],
  systemConfig: RuntimeSystemConfig
): AppMenuSystem[] {
  const allowedCodes = resolveAllowedSystemCodes(systemConfig);
  if (!allowedCodes) {
    return systems;
  }
  return systems.filter((item) => allowedCodes.has(item.code));
}

export function createAppAdapter(params: {
  backend: BackendKind;
  http: ObHttp;
  tokenKey: string;
  basicSystemPermissionCode?: string;
  systemConfig: RuntimeSystemConfig;
  basicTicketSsoEndpoint: string;
}): BackendAdapter {
  const {
    backend,
    http,
    tokenKey,
    basicSystemPermissionCode,
    systemConfig,
    basicTicketSsoEndpoint
  } = params;

  if (backend === 'basic') {
    const basicAdapter = createBasicAdapter(http, {
      tokenKey,
      systemPermissionCode: basicSystemPermissionCode || 'admin_server',
      ssoEndpoints: {
        ticketSsoEndpoint: basicTicketSsoEndpoint
      }
    });

    return {
      ...basicAdapter,
      menu: {
        ...basicAdapter.menu,
        async fetchMenuSystems() {
          const allSystems = (await basicAdapter.menu.fetchMenuSystems?.()) ?? [];
          const scopedSystems = filterMenuSystemsByConfig(allSystems, systemConfig);
          if (scopedSystems.length > 0 || systemConfig.mode === 'multi') {
            return scopedSystems;
          }

          // single 模式下若未命中后端系统列表，仍回退到固定系统，保证可用性。
          const fixedSystemCode = systemConfig.code;
          return [
            {
              code: fixedSystemCode,
              name: fixedSystemCode,
              menus: await basicAdapter.menu.fetchMenuTree()
            }
          ];
        }
      }
    };
  }

  return createDefaultAdapter(http);
}
