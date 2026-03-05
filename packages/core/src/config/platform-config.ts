export type BackendKind = 'default' | 'sczfw';
export type AuthMode = 'cookie' | 'token' | 'mixed';
export type MenuMode = 'remote' | 'static';
export type EnabledModulesSetting = '*' | string[];
export type MenuRoutePreset = 'static-single' | 'remote-single';

export interface RuntimeConfig {
  preset?: MenuRoutePreset;
  backend: BackendKind;
  authMode: AuthMode;
  tokenKey: string;
  idTokenKey: string;
  menuMode: MenuMode;
  enabledModules: EnabledModulesSetting;
  authorizationType: string;
  appsource: string;
  appcode: string;
  clientSignatureSalt?: string;
  clientSignatureClientId?: string;
  storageNamespace?: string;
  defaultSystemCode?: string;
  systemHomeMap: Record<string, string>;
}

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
  if (candidates.includes(value as T)) {
    return value as T;
  }
  errors.push(`"${key}" 必须是 ${candidates.join('/')} 之一`);
  return undefined;
}

function expectString(raw: Record<string, unknown>, key: string, errors: string[]): string | undefined {
  const value = raw[key];
  if (isNonEmptyString(value)) {
    return value;
  }
  errors.push(`"${key}" 必须是非空字符串`);
  return undefined;
}

function expectOptionalString(raw: Record<string, unknown>, key: string, errors: string[]): string | undefined {
  const value = raw[key];
  if (value == null || value === '') {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  errors.push(`"${key}" 必须是字符串`);
  return undefined;
}

function isMenuRoutePreset(v: unknown): v is MenuRoutePreset {
  return v === 'static-single' || v === 'remote-single';
}

function getPresetExpectedMenuMode(preset: MenuRoutePreset): MenuMode {
  return preset === 'static-single' ? 'static' : 'remote';
}

function normalizePresetRuntimeConfig(input: Record<string, unknown>, errors: string[]): {
  preset?: MenuRoutePreset;
  normalized: Record<string, unknown>;
} {
  const rawPreset = input.preset;
  if (rawPreset == null || rawPreset === '') {
    return {
      normalized: input,
    };
  }

  if (!isMenuRoutePreset(rawPreset)) {
    errors.push('"preset" 必须是 static-single/remote-single 之一');
    return {
      normalized: input,
    };
  }

  const expectedMenuMode = getPresetExpectedMenuMode(rawPreset);
  if (input.menuMode != null && input.menuMode !== expectedMenuMode) {
    errors.push(`preset=${rawPreset} 不允许 menuMode=${String(input.menuMode)}，应为 ${expectedMenuMode}`);
  }

  const fallbackSystemCode = isNonEmptyString(input.defaultSystemCode) ? input.defaultSystemCode : 'default';
  const normalized: Record<string, unknown> = {
    preset: rawPreset,
    backend: 'default',
    authMode: 'token',
    tokenKey: 'token',
    idTokenKey: 'idToken',
    menuMode: expectedMenuMode,
    enabledModules: '*',
    authorizationType: 'ADMIN',
    appsource: 'frame',
    appcode: 'one-base-template',
    defaultSystemCode: fallbackSystemCode,
    systemHomeMap: {
      [fallbackSystemCode]: '/home/index',
    },
    ...input,
  };

  // storageNamespace 未显式配置时与 appcode 对齐，降低最小配置成本。
  if (!isNonEmptyString(normalized.storageNamespace) && isNonEmptyString(normalized.appcode)) {
    normalized.storageNamespace = normalized.appcode;
  }

  return {
    preset: rawPreset,
    normalized,
  };
}

function expectEnabledModules(raw: Record<string, unknown>, key: string, errors: string[]): EnabledModulesSetting {
  const value = raw[key];
  if (value == null || value === '*') {
    return '*';
  }

  if (!Array.isArray(value)) {
    errors.push(`"${key}" 必须是 "*" 或字符串数组`);
    return '*';
  }

  const modules = value.map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean);

  if (modules.length !== value.length) {
    errors.push(`"${key}" 仅允许非空字符串数组`);
  }

  return Array.from(new Set(modules));
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

export function parseRuntimeConfig(input: unknown): RuntimeConfig {
  if (!isRecord(input)) {
    throw new Error('[platform-config] 配置文件格式错误：根节点必须是 JSON 对象');
  }

  const errors: string[] = [];
  const { preset, normalized } = normalizePresetRuntimeConfig(input, errors);

  const backend = expectEnum(normalized, 'backend', ['default', 'sczfw'], errors);
  const authMode = expectEnum(normalized, 'authMode', ['cookie', 'token', 'mixed'], errors);
  const tokenKey = expectString(normalized, 'tokenKey', errors);
  const idTokenKey = expectString(normalized, 'idTokenKey', errors);
  const menuMode = expectEnum(normalized, 'menuMode', ['remote', 'static'], errors);
  const enabledModules = expectEnabledModules(normalized, 'enabledModules', errors);
  const authorizationType = expectString(normalized, 'authorizationType', errors);
  const appsource = expectString(normalized, 'appsource', errors);
  const appcode = expectString(normalized, 'appcode', errors);
  const clientSignatureSalt = expectOptionalString(normalized, 'clientSignatureSalt', errors);
  const clientSignatureClientId = expectOptionalString(normalized, 'clientSignatureClientId', errors);
  const storageNamespace = expectOptionalString(normalized, 'storageNamespace', errors);
  const defaultSystemCode = expectOptionalString(normalized, 'defaultSystemCode', errors);
  const systemHomeMap = expectSystemHomeMap(normalized, 'systemHomeMap', errors);

  if ('clientSignatureSecret' in normalized) {
    errors.push(
      '"clientSignatureSecret" 已废弃，请改为 "clientSignatureSalt"（该字段为公开签名盐值，不是前端 secret）'
    );
  }

  if (preset && systemHomeMap) {
    if (Object.keys(systemHomeMap).length !== 1) {
      errors.push(`preset=${preset} 为单系统模式，"systemHomeMap" 仅允许配置一个系统`);
    }
    if (defaultSystemCode && !systemHomeMap[defaultSystemCode]) {
      errors.push(`preset=${preset} 下 "defaultSystemCode" 必须命中 "systemHomeMap"`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`[platform-config] 校验失败：${errors.join('；')}`);
  }

  return {
    preset,
    backend: backend!,
    authMode: authMode!,
    tokenKey: tokenKey!,
    idTokenKey: idTokenKey!,
    menuMode: menuMode!,
    enabledModules,
    authorizationType: authorizationType!,
    appsource: appsource!,
    appcode: appcode!,
    clientSignatureSalt,
    clientSignatureClientId,
    storageNamespace,
    defaultSystemCode,
    systemHomeMap: systemHomeMap!,
  };
}
