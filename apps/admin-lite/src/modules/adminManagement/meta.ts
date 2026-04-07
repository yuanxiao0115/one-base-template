import type { AppModuleManifestMeta } from '@one-base-template/core';

export const moduleMeta = {
  id: 'admin-management',
  version: '1',
  moduleTier: 'core',
  enabledByDefault: true
} as const satisfies AppModuleManifestMeta;
