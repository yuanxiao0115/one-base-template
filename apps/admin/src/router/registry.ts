import type { AdminModuleManifest, EnabledModulesSetting } from './types';

type RouteModule = {
  default?: AdminModuleManifest;
  module?: AdminModuleManifest;
};

const modules = import.meta.glob('../modules/**/module.ts', {
  eager: true
}) as Record<string, RouteModule>;

function isValidManifest(input: unknown): input is AdminModuleManifest {
  if (!input || typeof input !== 'object') return false;
  const value = input as AdminModuleManifest;
  if (!value.id || typeof value.id !== 'string') return false;
  if (value.version !== '1') return false;
  return Array.isArray(value.routes?.layout);
}

function getAllModules(): AdminModuleManifest[] {
  const out: AdminModuleManifest[] = [];
  for (const mod of Object.values(modules)) {
    const candidate = mod.default ?? mod.module;
    if (!isValidManifest(candidate)) continue;
    out.push(candidate);
  }

  // 模块注册按 id 排序，确保路由组装顺序稳定（便于 CLI 与测试复现）
  out.sort((a, b) => a.id.localeCompare(b.id));
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
  return enabledModules.map((id) => byId.get(id)).filter((item): item is AdminModuleManifest => Boolean(item));
}

export function getModuleIds(): string[] {
  return getAllModules().map((item) => item.id);
}
