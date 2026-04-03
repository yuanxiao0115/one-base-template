export type BackendKind = 'default' | 'basic';
export type AuthMode = 'cookie' | 'token' | 'mixed';
export type MenuMode = 'remote' | 'static';
export type RouterHistoryMode = 'history' | 'hash';
export type EnabledModulesSetting = '*' | string[];

export type RuntimeSystemConfig =
  | {
      mode: 'single';
      code: string;
    }
  | {
      mode: 'multi';
      codes?: string[];
    };

export interface RuntimeConfig {
  systemConfig: RuntimeSystemConfig;
  backend: BackendKind;
  authMode: AuthMode;
  historyMode: RouterHistoryMode;
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

function expectString(
  raw: Record<string, unknown>,
  key: string,
  errors: string[]
): string | undefined {
  const value = raw[key];
  if (isNonEmptyString(value)) {
    return value;
  }
  errors.push(`"${key}" 必须是非空字符串`);
  return undefined;
}

function expectOptionalString(
  raw: Record<string, unknown>,
  key: string,
  errors: string[]
): string | undefined {
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

function resolveTokenStorageScope(normalized: Record<string, unknown>): string {
  if (isNonEmptyString(normalized.storageNamespace)) {
    return normalized.storageNamespace;
  }
  if (isNonEmptyString(normalized.appcode)) {
    return normalized.appcode;
  }
  return 'one-base-template';
}

function normalizeRuntimeConfig(input: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {
    ...input
  };

  // storageNamespace 未显式配置时与 appcode 对齐，降低最小配置成本。
  if (!isNonEmptyString(normalized.storageNamespace) && isNonEmptyString(normalized.appcode)) {
    normalized.storageNamespace = normalized.appcode;
  }

  const tokenStorageScope = resolveTokenStorageScope(normalized);
  if (!isNonEmptyString(normalized.tokenKey)) {
    normalized.tokenKey = `${tokenStorageScope}-token`;
  }
  if (!isNonEmptyString(normalized.idTokenKey)) {
    normalized.idTokenKey = `${tokenStorageScope}-id-token`;
  }

  return normalized;
}

function expectEnabledModules(
  raw: Record<string, unknown>,
  key: string,
  errors: string[]
): EnabledModulesSetting {
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

function expectSystemConfig(
  raw: Record<string, unknown>,
  key: string,
  errors: string[]
): RuntimeSystemConfig | undefined {
  const value = raw[key];
  if (!isRecord(value)) {
    errors.push(`"${key}" 必须是对象，形如 {"mode":"single","code":"admin"}`);
    return undefined;
  }

  const mode = value.mode;
  if (mode !== 'single' && mode !== 'multi') {
    errors.push(`"${key}.mode" 必须是 single/multi 之一`);
    return undefined;
  }

  if (mode === 'single') {
    if (!isNonEmptyString(value.code)) {
      errors.push(`"${key}.code" 在 single 模式下必须是非空字符串`);
      return undefined;
    }

    return {
      mode: 'single',
      code: value.code
    };
  }

  const rawCodes = value.codes;
  if (rawCodes == null) {
    return {
      mode: 'multi'
    };
  }

  if (!Array.isArray(rawCodes)) {
    errors.push(`"${key}.codes" 必须是字符串数组`);
    return undefined;
  }

  const codes = rawCodes
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  if (codes.length !== rawCodes.length) {
    errors.push(`"${key}.codes" 仅允许非空字符串数组`);
  }

  const uniqueCodes = Array.from(new Set(codes));
  if (uniqueCodes.length === 0) {
    errors.push(`"${key}.codes" 至少需要一个 systemCode`);
    return undefined;
  }

  return {
    mode: 'multi',
    codes: uniqueCodes
  };
}

export function parseRuntimeConfig(input: unknown): RuntimeConfig {
  if (!isRecord(input)) {
    throw new Error('[platform-config] 配置文件格式错误：根节点必须是 JSON 对象');
  }

  const errors: string[] = [];
  if ('preset' in input) {
    errors.push('"preset" 已废弃，请改为 "systemConfig"（single/multi）');
  }

  const normalized = normalizeRuntimeConfig(input);

  const systemConfig = expectSystemConfig(normalized, 'systemConfig', errors);
  const backend = expectEnum(normalized, 'backend', ['default', 'basic'], errors);
  const authMode = expectEnum(normalized, 'authMode', ['cookie', 'token', 'mixed'], errors);
  const historyMode = expectEnum(normalized, 'historyMode', ['history', 'hash'], errors);
  const tokenKey = expectString(normalized, 'tokenKey', errors);
  const idTokenKey = expectString(normalized, 'idTokenKey', errors);
  const menuMode = expectEnum(normalized, 'menuMode', ['remote', 'static'], errors);
  const enabledModules = expectEnabledModules(normalized, 'enabledModules', errors);
  const authorizationType = expectString(normalized, 'authorizationType', errors);
  const appsource = expectString(normalized, 'appsource', errors);
  const appcode = expectString(normalized, 'appcode', errors);
  const clientSignatureSalt = expectOptionalString(normalized, 'clientSignatureSalt', errors);
  const clientSignatureClientId = expectOptionalString(
    normalized,
    'clientSignatureClientId',
    errors
  );
  const storageNamespace = expectOptionalString(normalized, 'storageNamespace', errors);
  const defaultSystemCode = expectOptionalString(normalized, 'defaultSystemCode', errors);
  const systemHomeMap = expectSystemHomeMap(normalized, 'systemHomeMap', errors);

  if ('clientSignatureSecret' in normalized) {
    errors.push(
      '"clientSignatureSecret" 已废弃，请改为 "clientSignatureSalt"（该字段为公开签名盐值，不是前端 secret）'
    );
  }

  let resolvedDefaultSystemCode = defaultSystemCode;
  if (systemConfig?.mode === 'single') {
    if (!resolvedDefaultSystemCode) {
      resolvedDefaultSystemCode = systemConfig.code;
    } else if (resolvedDefaultSystemCode !== systemConfig.code) {
      errors.push('single 模式下 "defaultSystemCode" 必须与 "systemConfig.code" 一致');
    }
  }

  if (resolvedDefaultSystemCode && systemHomeMap && !systemHomeMap[resolvedDefaultSystemCode]) {
    errors.push('"defaultSystemCode" 必须命中 "systemHomeMap"');
  }

  if (errors.length > 0) {
    throw new Error(`[platform-config] 校验失败：${errors.join('；')}`);
  }

  return {
    systemConfig: systemConfig!,
    backend: backend!,
    authMode: authMode!,
    historyMode: historyMode!,
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
    defaultSystemCode: resolvedDefaultSystemCode,
    systemHomeMap: systemHomeMap!
  };
}
