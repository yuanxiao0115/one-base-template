import type { AdminModuleManifest, EnabledModulesSetting, ModuleTier } from './types';
import { createAppLogger } from '@/shared/logger';

type RouteModule = {
  default?: AdminModuleManifest;
  module?: AdminModuleManifest;
};

const modules = import.meta.glob('../modules/**/module.ts', {
  eager: true
}) as Record<string, RouteModule>;

const logger = createAppLogger('router/modules');
let cachedAllModules: AdminModuleManifest[] | null = null;

function warn(message: string) {
  logger.warn(message);
}

function isValidManifest(input: unknown): input is AdminModuleManifest {
  if (!input || typeof input !== 'object') return false;
  const value = input as AdminModuleManifest;
  if (!value.id || typeof value.id !== 'string') return false;
  if (value.version !== '1') return false;
  if (typeof value.enabledByDefault !== 'boolean') return false;
  if (value.moduleTier && value.moduleTier !== 'core' && value.moduleTier !== 'optional') return false;
  return Array.isArray(value.routes?.layout);
}

function resolveModuleTier(moduleTier: AdminModuleManifest['moduleTier']): ModuleTier {
  if (moduleTier === 'optional') return 'optional';
  return 'core';
}

function normalizeManifest(manifest: AdminModuleManifest, path: string): AdminModuleManifest {
  const moduleTier = resolveModuleTier(manifest.moduleTier);

  if (moduleTier === 'optional' && manifest.enabledByDefault) {
    warn(`optional 模块不应 enabledByDefault=true，已自动收敛为 false：${manifest.id}（${path}）`);
  }

  return {
    ...manifest,
    moduleTier,
    enabledByDefault: moduleTier === 'optional' ? false : manifest.enabledByDefault
  };
}

function getAllModules(): AdminModuleManifest[] {
  if (cachedAllModules) return cachedAllModules;

  const byId = new Map<string, AdminModuleManifest>();

  for (const [path, mod] of Object.entries(modules)) {
    const candidate = mod.default ?? mod.module;
    if (!isValidManifest(candidate)) {
      warn(`忽略无效模块声明：${path}`);
      continue;
    }

    const normalized = normalizeManifest(candidate, path);

    if (byId.has(normalized.id)) {
      warn(`检测到重复模块 id：${normalized.id}（忽略：${path}）`);
      continue;
    }

    byId.set(normalized.id, normalized);
  }

  const out = [...byId.values()];
  // 模块注册按 id 排序，确保路由组装顺序稳定（便于 CLI 与测试复现）
  out.sort((a, b) => a.id.localeCompare(b.id));
  cachedAllModules = out;
  return out;
}

export function getEnabledModules(enabledModules: EnabledModulesSetting): AdminModuleManifest[] {
  const allModules = getAllModules();

  if (enabledModules === '*') {
    return allModules;
  }

  if (enabledModules.length === 0) {
    return allModules.filter((item) => item.enabledByDefault);
  }

  const byId = new Map(allModules.map((item) => [item.id, item]));
  const used = new Set<string>();
  const out: AdminModuleManifest[] = [];

  for (const id of enabledModules) {
    if (used.has(id)) {
      warn(`enabledModules 包含重复模块 id：${id}`);
      continue;
    }
    used.add(id);

    const mod = byId.get(id);
    if (!mod) {
      warn(`enabledModules 包含未知模块 id：${id}`);
      continue;
    }
    out.push(mod);
  }

  return out;
}

export function getModuleIds(): string[] {
  return getAllModules().map((item) => item.id);
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    cachedAllModules = null;
  });
}
