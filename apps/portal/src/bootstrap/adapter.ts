import type { BackendAdapter, ObHttp } from '@one-base-template/core';
import { createBasicAdapter, createDefaultAdapter } from '@one-base-template/adapters';
import type { BackendKind } from '@/config/env';

export function createAppAdapter(params: {
  backend: BackendKind;
  http: ObHttp;
  tokenKey: string;
  basicSystemPermissionCode?: string;
  basicTicketSsoEndpoint: string;
}): BackendAdapter {
  const { backend, http, tokenKey, basicSystemPermissionCode, basicTicketSsoEndpoint } = params;

  if (backend === 'basic') {
    return createBasicAdapter(http, {
      tokenKey,
      systemPermissionCode: basicSystemPermissionCode || 'admin_server',
      ssoEndpoints: {
        ticketSsoEndpoint: basicTicketSsoEndpoint
      }
    });
  }

  return createDefaultAdapter(http);
}
