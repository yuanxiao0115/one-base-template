import type { SystemOptions } from '@one-base-template/core';

export const DEFAULT_FALLBACK_HOME = '/home/index';

export function createSystemsOptions(params: {
  defaultCode?: string;
  homeMap: Record<string, string>;
}): SystemOptions {
  return {
    defaultCode: params.defaultCode,
    homeMap: params.homeMap,
    fallbackHome: DEFAULT_FALLBACK_HOME
  };
}
