import {
  parseJsonArray,
  parseJsonObject,
  resolveValueByPath,
  toPositiveNumber
} from './material-utils';

export type PortalDataMode = 'static' | 'api';
export type PortalHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH';

export interface PortalDataSourceModel {
  mode: PortalDataMode;
  staticRowsJson: string;
  method: PortalHttpMethod;
  apiUrl: string;
  headersJson: string;
  queryJson: string;
  bodyJson: string;
  listPath: string;
  totalPath: string;
  successPath: string;
  successValue: string;
  pageParamKey: string;
  pageSizeParamKey: string;
}

export interface LoadPortalRowsOptions {
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

export interface LoadPortalRowsResult<
  Row extends Record<string, unknown> = Record<string, unknown>
> {
  success: boolean;
  rows: Row[];
  total: number;
  errorMessage: string;
  payload?: unknown;
}

const DEFAULT_PORTAL_DATA_SOURCE: PortalDataSourceModel = {
  mode: 'static',
  staticRowsJson: '[]',
  method: 'GET',
  apiUrl: '',
  headersJson: '{}',
  queryJson: '{}',
  bodyJson: '{}',
  listPath: 'data.records',
  totalPath: 'data.total',
  successPath: 'code',
  successValue: '200',
  pageParamKey: 'currentPage',
  pageSizeParamKey: 'pageSize'
};

function normalizeHttpMethod(value: unknown): PortalHttpMethod {
  return value === 'POST' || value === 'PUT' || value === 'PATCH' ? value : 'GET';
}

function normalizeMode(value: unknown): PortalDataMode {
  return value === 'api' ? 'api' : 'static';
}

function normalizeRows<Row extends Record<string, unknown>>(rows: unknown): Row[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((item, index) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        return item as Row;
      }
      return {
        value: item,
        __rowIndex: index
      } as unknown as Row;
    })
    .filter(Boolean);
}

function normalizeRequestUrl(baseUrl: string, query: Record<string, unknown>): string {
  const url = String(baseUrl || '').trim();
  if (!url) {
    return '';
  }

  const entries = Object.entries(query).filter(
    ([, value]) => value !== undefined && value !== null && `${value}` !== ''
  );

  if (!entries.length) {
    return url;
  }

  try {
    const currentOrigin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'http://localhost';
    const normalizedUrl = new URL(url, currentOrigin);

    entries.forEach(([key, value]) => {
      normalizedUrl.searchParams.set(key, String(value));
    });

    if (/^https?:\/\//.test(url)) {
      return normalizedUrl.toString();
    }

    return `${normalizedUrl.pathname}${normalizedUrl.search}${normalizedUrl.hash}`;
  } catch {
    const hasQuery = url.includes('?');
    const serialized = entries
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    return `${url}${hasQuery ? '&' : '?'}${serialized}`;
  }
}

function resolveResponseRows(payload: unknown, listPath: string): Record<string, unknown>[] {
  const rows = resolveValueByPath(payload, listPath);
  if (Array.isArray(rows)) {
    return normalizeRows(rows);
  }

  if (Array.isArray(payload)) {
    return normalizeRows(payload);
  }

  return [];
}

function checkResponseSuccess(payload: unknown, config: PortalDataSourceModel): boolean {
  const successPath = String(config.successPath || '').trim();
  if (!successPath) {
    return true;
  }

  const actualValue = resolveValueByPath(payload, successPath);
  const expectedValue = String(config.successValue || '').trim();
  if (!expectedValue) {
    return Boolean(actualValue);
  }

  return String(actualValue) === expectedValue;
}

export function createDefaultPortalDataSourceModel(): PortalDataSourceModel {
  return { ...DEFAULT_PORTAL_DATA_SOURCE };
}

export function mergePortalDataSourceModel(
  value?: Partial<PortalDataSourceModel> | null
): PortalDataSourceModel {
  const merged = {
    ...DEFAULT_PORTAL_DATA_SOURCE,
    ...value
  };

  return {
    mode: normalizeMode(merged.mode),
    staticRowsJson:
      typeof merged.staticRowsJson === 'string'
        ? merged.staticRowsJson
        : DEFAULT_PORTAL_DATA_SOURCE.staticRowsJson,
    method: normalizeHttpMethod(merged.method),
    apiUrl: typeof merged.apiUrl === 'string' ? merged.apiUrl : DEFAULT_PORTAL_DATA_SOURCE.apiUrl,
    headersJson:
      typeof merged.headersJson === 'string'
        ? merged.headersJson
        : DEFAULT_PORTAL_DATA_SOURCE.headersJson,
    queryJson:
      typeof merged.queryJson === 'string'
        ? merged.queryJson
        : DEFAULT_PORTAL_DATA_SOURCE.queryJson,
    bodyJson:
      typeof merged.bodyJson === 'string' ? merged.bodyJson : DEFAULT_PORTAL_DATA_SOURCE.bodyJson,
    listPath:
      typeof merged.listPath === 'string' && merged.listPath.trim().length
        ? merged.listPath
        : DEFAULT_PORTAL_DATA_SOURCE.listPath,
    totalPath:
      typeof merged.totalPath === 'string' && merged.totalPath.trim().length
        ? merged.totalPath
        : DEFAULT_PORTAL_DATA_SOURCE.totalPath,
    successPath:
      typeof merged.successPath === 'string' && merged.successPath.trim().length
        ? merged.successPath
        : DEFAULT_PORTAL_DATA_SOURCE.successPath,
    successValue:
      typeof merged.successValue === 'string' && merged.successValue.trim().length
        ? merged.successValue
        : DEFAULT_PORTAL_DATA_SOURCE.successValue,
    pageParamKey:
      typeof merged.pageParamKey === 'string' && merged.pageParamKey.trim().length
        ? merged.pageParamKey
        : DEFAULT_PORTAL_DATA_SOURCE.pageParamKey,
    pageSizeParamKey:
      typeof merged.pageSizeParamKey === 'string' && merged.pageSizeParamKey.trim().length
        ? merged.pageSizeParamKey
        : DEFAULT_PORTAL_DATA_SOURCE.pageSizeParamKey
  };
}

export async function loadPortalDataSourceRows<
  Row extends Record<string, unknown> = Record<string, unknown>
>(
  source: Partial<PortalDataSourceModel> | null | undefined,
  options: LoadPortalRowsOptions = {}
): Promise<LoadPortalRowsResult<Row>> {
  const normalizedSource = mergePortalDataSourceModel(source);

  if (normalizedSource.mode === 'static') {
    const rows = normalizeRows<Row>(parseJsonArray(normalizedSource.staticRowsJson));
    return {
      success: true,
      rows,
      total: rows.length,
      errorMessage: ''
    };
  }

  const url = String(normalizedSource.apiUrl || '').trim();
  if (!url) {
    return {
      success: false,
      rows: [],
      total: 0,
      errorMessage: '未配置接口地址'
    };
  }

  const method = normalizeHttpMethod(normalizedSource.method);
  const page = Math.max(1, toPositiveNumber(options.page, 1));
  const pageSize = Math.max(1, toPositiveNumber(options.pageSize, 10));
  const query = parseJsonObject(normalizedSource.queryJson);
  const body = parseJsonObject(normalizedSource.bodyJson);
  const headersObject = parseJsonObject(normalizedSource.headersJson);

  if (normalizedSource.pageParamKey.trim()) {
    query[normalizedSource.pageParamKey] = page;
  }
  if (normalizedSource.pageSizeParamKey.trim()) {
    query[normalizedSource.pageSizeParamKey] = pageSize;
  }

  const requestUrl =
    method === 'GET' ? normalizeRequestUrl(url, query) : normalizeRequestUrl(url, query);
  const requestHeaders: HeadersInit = {};

  Object.entries(headersObject).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    requestHeaders[key] = String(value);
  });

  let requestBody: BodyInit | undefined;
  if (method !== 'GET') {
    if (!Object.keys(requestHeaders).some((key) => key.toLowerCase() === 'content-type')) {
      requestHeaders['Content-Type'] = 'application/json';
    }
    requestBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(requestUrl, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: options.signal,
      credentials: 'include'
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? ((await response.json()) as unknown)
      : await response.text();

    if (!response.ok) {
      return {
        success: false,
        rows: [],
        total: 0,
        errorMessage: `请求失败（HTTP ${response.status}）`,
        payload
      };
    }

    if (!checkResponseSuccess(payload, normalizedSource)) {
      return {
        success: false,
        rows: [],
        total: 0,
        errorMessage: '接口返回成功状态不匹配',
        payload
      };
    }

    const rows = resolveResponseRows(payload, normalizedSource.listPath) as Row[];
    const totalRaw = resolveValueByPath(payload, normalizedSource.totalPath);
    const total = Number.isFinite(Number(totalRaw)) ? Number(totalRaw) : rows.length;

    return {
      success: true,
      rows,
      total: Math.max(rows.length, Math.max(0, total)),
      errorMessage: '',
      payload
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        rows: [],
        total: 0,
        errorMessage: '请求已取消'
      };
    }

    const message = error instanceof Error && error.message ? error.message : '请求失败';
    return {
      success: false,
      rows: [],
      total: 0,
      errorMessage: message
    };
  }
}
