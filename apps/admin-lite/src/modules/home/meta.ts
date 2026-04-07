import type { AppModuleManifestMeta } from '@one-base-template/core';

export const moduleMeta = {
  id: 'home',
  version: '1',
  moduleTier: 'core',
  enabledByDefault: true
} as const satisfies AppModuleManifestMeta;
