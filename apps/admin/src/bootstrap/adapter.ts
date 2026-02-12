import type { BackendAdapter, ObHttp } from '@one-base-template/core';
import { createDefaultAdapter, createSczfwAdapter } from '@one-base-template/adapters';

import type { BackendKind } from '../infra/env';

export function createAppAdapter(params: {
  backend: BackendKind;
  http: ObHttp;
  tokenKey: string;
  sczfwSystemPermissionCode?: string;
}): BackendAdapter {
  const { backend, http, tokenKey, sczfwSystemPermissionCode } = params;

  if (backend === 'sczfw') {
    return createSczfwAdapter(http, {
      tokenKey,
      systemPermissionCode: sczfwSystemPermissionCode || 'admin_server'
    });
  }

  return createDefaultAdapter(http);
}
