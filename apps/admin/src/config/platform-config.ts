type BackendKind = 'default' | 'sczfw';
type AuthMode = 'cookie' | 'token' | 'mixed';
type MenuMode = 'remote' | 'static';

export type PlatformRuntimeConfig = {
  backend: BackendKind;
  authMode: AuthMode;
  tokenKey: string;
  idTokenKey: string;
  menuMode: MenuMode;
  authorizationType: string;
  appsource: string;
  appcode: string;
  clientSignatureSecret?: string;
  clientSignatureClientId?: string;
  storageNamespace?: string;
  defaultSystemCode?: string;
  systemHomeMap: Record<string, string>;
};

const CONFIG_URL = `${import.meta.env.BASE_URL}platform-config.json`;

let cachedConfig: PlatformRuntimeConfig | null = null;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function expectEnum<T extends string>(
  raw: Record<string, unknown>,
  key: string,
  candidates: readonly T[],
  errors: string[]
): T | undefined {
  const value = raw[key];
  if (candidates.includes(value as T)) return value as T;
  errors.push(`"${key}" 必须是 ${candidates.join('/')} 之一`);
  return undefined;
}

function expectString(raw: Record<string, unknown>, key: string, errors: string[]): string | undefined {
  const value = raw[key];
  if (isNonEmptyString(value)) return value;
  errors.push(`"${key}" 必须是非空字符串`);
  return undefined;
}

function expectOptionalString(raw: Record<string, unknown>, key: string, errors: string[]): string | undefined {
  const value = raw[key];
  if (value == null || value === '') return undefined;
  if (typeof value === 'string') return value;
  errors.push(`"${key}" 必须是字符串`);
  return undefined;
}

function expectSystemHomeMap(
  raw: Record<string, unknown>,
  key: string,
  errors: string[]
): Record<string, string> | undefined {
  const value = raw[key];
  if (!isRecord(value)) {
    errors.push(`"${key}" 必须是对象，形如 {"systemCode":"/home/path"}`);
    return undefined;
  }

  const out: Record<string, string> = {};
  for (const [systemCode, path] of Object.entries(value)) {
    if (!isNonEmptyString(systemCode)) {
      errors.push(`"${key}" 的 systemCode 不能为空`);
      continue;
    }
    if (typeof path !== 'string' || !path.startsWith('/')) {
      errors.push(`"${key}.${systemCode}" 必须是以 "/" 开头的路径字符串`);
      continue;
    }
    out[systemCode] = path;
  }
  return out;
}

function parsePlatformRuntimeConfig(input: unknown): PlatformRuntimeConfig {
  if (!isRecord(input)) {
    throw new Error('[platform-config] 配置文件格式错误：根节点必须是 JSON 对象');
  }

  const errors: string[] = [];

  const backend = expectEnum(input, 'backend', ['default', 'sczfw'], errors);
  const authMode = expectEnum(input, 'authMode', ['cookie', 'token', 'mixed'], errors);
  const tokenKey = expectString(input, 'tokenKey', errors);
  const idTokenKey = expectString(input, 'idTokenKey', errors);
  const menuMode = expectEnum(input, 'menuMode', ['remote', 'static'], errors);
  const authorizationType = expectString(input, 'authorizationType', errors);
  const appsource = expectString(input, 'appsource', errors);
  const appcode = expectString(input, 'appcode', errors);
  const clientSignatureSecret = expectOptionalString(input, 'clientSignatureSecret', errors);
  const clientSignatureClientId = expectOptionalString(input, 'clientSignatureClientId', errors);
  const storageNamespace = expectOptionalString(input, 'storageNamespace', errors);
  const defaultSystemCode = expectOptionalString(input, 'defaultSystemCode', errors);
  const systemHomeMap = expectSystemHomeMap(input, 'systemHomeMap', errors);

  if (errors.length > 0) {
    throw new Error(`[platform-config] 校验失败：${errors.join('；')}`);
  }

  return {
    backend: backend!,
    authMode: authMode!,
    tokenKey: tokenKey!,
    idTokenKey: idTokenKey!,
    menuMode: menuMode!,
    authorizationType: authorizationType!,
    appsource: appsource!,
    appcode: appcode!,
    clientSignatureSecret,
    clientSignatureClientId,
    storageNamespace,
    defaultSystemCode,
    systemHomeMap: systemHomeMap!
  };
}

export async function loadPlatformConfig(): Promise<PlatformRuntimeConfig> {
  if (cachedConfig) return cachedConfig;

  const response = await fetch(CONFIG_URL, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`[platform-config] 加载失败：${response.status} ${response.statusText}`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    throw new Error(`[platform-config] 解析 JSON 失败：${message}`);
  }

  cachedConfig = parsePlatformRuntimeConfig(json);
  return cachedConfig;
}

export function getPlatformConfig(): PlatformRuntimeConfig {
  if (!cachedConfig) {
    throw new Error('[platform-config] 尚未加载，请先调用 loadPlatformConfig()');
  }
  return cachedConfig;
}
