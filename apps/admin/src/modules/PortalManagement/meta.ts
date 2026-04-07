import type { AppModuleManifestMeta } from '@one-base-template/core';

export const moduleMeta = {
  id: 'portal-management',
  version: '1',
  moduleTier: 'optional',
  enabledByDefault: false
} as const satisfies AppModuleManifestMeta;
