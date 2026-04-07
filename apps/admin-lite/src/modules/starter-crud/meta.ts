import type { AppModuleManifestMeta } from '@one-base-template/core';

export const moduleMeta = {
  id: 'starter-crud',
  version: '1',
  moduleTier: 'optional',
  enabledByDefault: false
} as const satisfies AppModuleManifestMeta;
