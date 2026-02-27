import type { AdminModuleManifest, EnabledModulesSetting } from './types';

type RouteModule = {
  default?: AdminModuleManifest;
  module?: AdminModuleManifest;
};

const modules = import.meta.glob('../modules/**/module.ts', {
  eager: true
}) as Record<string, RouteModule>;

function warn(message: string) {
  console.warn(`[router/modules] ${message}`);
}

function isValidManifest(input: unknown): input is AdminModuleManifest {
  if (!input || typeof input !== 'object') return false;
  const value = input as AdminModuleManifest;
  if (!value.id || typeof value.id !== 'string') return false;
  if (value.version !== '1') return false;
  return Array.isArray(value.routes?.layout);
}

function getAllModules(): AdminModuleManifest[] {
  const byId = new Map<string, AdminModuleManifest>();

  for (const [path, mod] of Object.entries(modules)) {
    const candidate = mod.default ?? mod.module;
    if (!isValidManifest(candidate)) {
      warn(`忽略无效模块声明：${path}`);
      continue;
    }

    if (byId.has(candidate.id)) {
      warn(`检测到重复模块 id：${candidate.id}（忽略：${path}）`);
      continue;
    }

    byId.set(candidate.id, candidate);
  }

  const out = [...byId.values()];
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
