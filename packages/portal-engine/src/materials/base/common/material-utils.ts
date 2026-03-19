export const PORTAL_RESOURCE_SHOW_PREFIX = '/cmict/file/resource/show?id=';

const JSON_OBJECT_FALLBACK: Record<string, unknown> = {};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeImageSource(value: unknown): string {
  const source = typeof value === 'string' ? value.trim() : '';
  if (!source) {
    return '';
  }

  if (
    source.startsWith('http://') ||
    source.startsWith('https://') ||
    source.startsWith('data:') ||
    source.startsWith('blob:') ||
    source.startsWith('/')
  ) {
    return source;
  }

  if (source.startsWith(PORTAL_RESOURCE_SHOW_PREFIX)) {
    return source;
  }

  return `${PORTAL_RESOURCE_SHOW_PREFIX}${encodeURIComponent(source)}`;
}

export function normalizeIframeSource(value: unknown): string {
  const source = typeof value === 'string' ? value.trim() : '';
  if (!source) {
    return '';
  }

  const lowerSource = source.toLowerCase();
  if (
    lowerSource.startsWith('javascript:') ||
    lowerSource.startsWith('vbscript:') ||
    lowerSource.startsWith('data:')
  ) {
    return '';
  }

  if (
    source.startsWith('http://') ||
    source.startsWith('https://') ||
    source.startsWith('//') ||
    source.startsWith('/')
  ) {
    return source;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(source)) {
    return '';
  }

  return `https://${source}`;
}

export function parseJsonObject(value: unknown): Record<string, unknown> {
  if (isPlainObject(value)) {
    return value;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return { ...JSON_OBJECT_FALLBACK };
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return isPlainObject(parsed) ? parsed : { ...JSON_OBJECT_FALLBACK };
  } catch {
    return { ...JSON_OBJECT_FALLBACK };
  }
}

export function parseJsonArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function resolveValueByPath(target: unknown, path: unknown): unknown {
  if (!path || typeof path !== 'string') {
    return target;
  }

  const normalizedPath = path
    .replace(/\[(\w+)\]/g, '.$1')
    .replace(/^\./, '')
    .trim();

  if (!normalizedPath) {
    return target;
  }

  return normalizedPath.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, target);
}

export function appendQueryToUrl(url: string, query: Record<string, unknown>): string {
  const trimmedUrl = String(url || '').trim();
  if (!trimmedUrl) {
    return '';
  }

  const validQueryEntries = Object.entries(query).filter(
    ([, value]) => value !== null && value !== undefined && `${value}` !== ''
  );
  if (validQueryEntries.length === 0) {
    return trimmedUrl;
  }

  try {
    const baseUrl =
      typeof window !== 'undefined' && window.location?.origin
        ? new URL(trimmedUrl, window.location.origin)
        : new URL(trimmedUrl, 'http://localhost');

    validQueryEntries.forEach(([key, value]) => {
      baseUrl.searchParams.set(key, String(value));
    });

    if (/^https?:\/\//.test(trimmedUrl)) {
      return baseUrl.toString();
    }

    return `${baseUrl.pathname}${baseUrl.search}${baseUrl.hash}`;
  } catch {
    const hasQuery = trimmedUrl.includes('?');
    const serialized = validQueryEntries
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    return `${trimmedUrl}${hasQuery ? '&' : '?'}${serialized}`;
  }
}

export function toNonNegativeNumber(value: unknown, fallback: number): number {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return fallback;
  }
  return next < 0 ? 0 : next;
}

export function toPositiveNumber(value: unknown, fallback: number): number {
  const next = Number(value);
  if (!Number.isFinite(next) || next <= 0) {
    return fallback;
  }
  return next;
}

export function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}
