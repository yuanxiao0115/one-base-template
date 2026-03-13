import { appendQueryToUrl } from './material-utils';

export type PortalLinkOpenType = 'router' | 'newTab' | 'current';

export interface PortalLinkConfig {
  path: string;
  paramKey: string;
  valueKey: string;
  openType: PortalLinkOpenType;
}

export interface OpenPortalLinkOptions {
  link: string;
  openType?: PortalLinkOpenType;
  routerPush?: ((link: string) => Promise<unknown> | void) | null;
}

const DEFAULT_PORTAL_LINK_CONFIG: PortalLinkConfig = {
  path: '',
  paramKey: 'id',
  valueKey: 'id',
  openType: 'router',
};

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}

export function createDefaultPortalLinkConfig(): PortalLinkConfig {
  return { ...DEFAULT_PORTAL_LINK_CONFIG };
}

export function mergePortalLinkConfig(value?: Partial<PortalLinkConfig> | null): PortalLinkConfig {
  const merged = {
    ...DEFAULT_PORTAL_LINK_CONFIG,
    ...(value ?? {}),
  };

  return {
    path: typeof merged.path === 'string' ? merged.path : DEFAULT_PORTAL_LINK_CONFIG.path,
    paramKey:
      typeof merged.paramKey === 'string' && merged.paramKey.trim().length
        ? merged.paramKey
        : DEFAULT_PORTAL_LINK_CONFIG.paramKey,
    valueKey:
      typeof merged.valueKey === 'string' && merged.valueKey.trim().length
        ? merged.valueKey
        : DEFAULT_PORTAL_LINK_CONFIG.valueKey,
    openType: merged.openType === 'newTab' || merged.openType === 'current' ? merged.openType : 'router',
  };
}

export function resolvePortalLink(
  config: Partial<PortalLinkConfig> | null | undefined,
  value: unknown
): string {
  const normalizedConfig = mergePortalLinkConfig(config);
  const path = normalizedConfig.path.trim();
  if (!path) {
    return '';
  }

  const paramKey = normalizedConfig.paramKey.trim();
  if (!paramKey) {
    return path;
  }

  return appendQueryToUrl(path, {
    [paramKey]: value,
  });
}

export function openPortalLink(options: OpenPortalLinkOptions): void {
  const link = String(options.link || '').trim();
  if (!link) {
    return;
  }

  const openType = options.openType || 'router';
  const routerPush = options.routerPush || null;

  if (isHttpUrl(link)) {
    if (openType === 'current') {
      window.location.href = link;
      return;
    }
    window.open(link, '_blank', 'noopener,noreferrer');
    return;
  }

  if (openType === 'newTab') {
    window.open(link, '_blank', 'noopener,noreferrer');
    return;
  }

  if (openType === 'current') {
    window.location.href = link;
    return;
  }

  if (routerPush) {
    Promise.resolve(routerPush(link)).catch(() => {
      window.location.href = link;
    });
    return;
  }

  window.location.href = link;
}
