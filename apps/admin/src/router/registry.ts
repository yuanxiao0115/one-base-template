import type {
  AdminModuleDeclarationModule,
  AdminModuleManifest,
  AdminModuleManifestMeta,
  EnabledModulesSetting,
} from "./types";
import { createAppLogger } from "@/shared/logger";

const moduleManifestDefinitions = import.meta.glob<{
  default?: AdminModuleManifestMeta;
  moduleManifest?: AdminModuleManifestMeta;
}>("../modules/**/manifest.ts", {
  eager: true,
});

const moduleDeclarationLoaders = import.meta.glob<AdminModuleDeclarationModule>("../modules/**/module.ts");

const logger = createAppLogger("router/modules");
let cachedAllModules: ModuleLoadEntry[] | null = null;
const cachedModuleTasks = new Map<string, Promise<AdminModuleManifest | null>>();

interface ModuleLoadEntry extends AdminModuleManifestMeta {
  manifestPath: string;
  modulePath: string;
}

function warn(message: string) {
  logger.warn(message);
}

function isValidManifestMeta(input: unknown): input is AdminModuleManifestMeta {
  if (!input || typeof input !== "object") {
    return false;
  }
  const value = input as AdminModuleManifestMeta;
  if (!value.id || typeof value.id !== "string") {
    return false;
  }
  if (value.version !== "1") {
    return false;
  }
  if (value.moduleTier !== "core" && value.moduleTier !== "optional") {
    return false;
  }
  if (typeof value.enabledByDefault !== "boolean") {
    return false;
  }
  if (value.moduleTier === "optional" && value.enabledByDefault) {
    return false;
  }
  return true;
}

function isValidModuleManifest(input: unknown): input is AdminModuleManifest {
  if (!isValidManifestMeta(input)) {
    return false;
  }
  const value = input as AdminModuleManifest;
  return Array.isArray(value.routes?.layout);
}

function toModulePath(manifestPath: string): string | null {
  if (!manifestPath.endsWith("/manifest.ts")) {
    return null;
  }
  return manifestPath.replace(/\/manifest\.ts$/, "/module.ts");
}

function getAllModules(): ModuleLoadEntry[] {
  if (cachedAllModules) {
    return cachedAllModules;
  }

  const byId = new Map<string, ModuleLoadEntry>();

  for (const [path, mod] of Object.entries(moduleManifestDefinitions)) {
    const candidate = mod.default ?? mod.moduleManifest;
    if (!isValidManifestMeta(candidate)) {
      warn(`忽略无效模块清单：${path}（要求 moduleTier 必填，且 optional 模块 enabledByDefault 必须为 false）`);
      continue;
    }

    const modulePath = toModulePath(path);
    if (!modulePath) {
      warn(`忽略无效模块清单路径：${path}（要求文件名为 manifest.ts）`);
      continue;
    }

    if (!moduleDeclarationLoaders[modulePath]) {
      warn(`模块清单缺少对应声明文件：${modulePath}（manifest=${path}）`);
      continue;
    }

    if (byId.has(candidate.id)) {
      warn(`检测到重复模块 id：${candidate.id}（忽略清单：${path}）`);
      continue;
    }

    byId.set(candidate.id, {
      ...candidate,
      manifestPath: path,
      modulePath,
    });
  }

  const out = [...byId.values()];
  // 模块注册按 id 排序，确保路由组装顺序稳定（便于 CLI 与测试复现）
  out.sort((a, b) => a.id.localeCompare(b.id));
  cachedAllModules = out;
  return out;
}

async function loadModule(entry: ModuleLoadEntry): Promise<AdminModuleManifest | null> {
  const cachedTask = cachedModuleTasks.get(entry.id);
  if (cachedTask) {
    return cachedTask;
  }

  const loader = moduleDeclarationLoaders[entry.modulePath];
  if (!loader) {
    warn(`模块声明加载器缺失：${entry.modulePath}（id=${entry.id}）`);
    return null;
  }

  const task = loader()
    .then((loaded) => {
      const candidate = loaded.default ?? loaded.module;
      if (!isValidModuleManifest(candidate)) {
        warn(`忽略无效模块声明：${entry.modulePath}（id=${entry.id}）`);
        return null;
      }

      if (
        candidate.id !== entry.id
        || candidate.version !== entry.version
        || candidate.moduleTier !== entry.moduleTier
        || candidate.enabledByDefault !== entry.enabledByDefault
      ) {
        warn(
          `模块清单与声明不一致：id=${entry.id}（manifest=${entry.manifestPath} module=${entry.modulePath}）`
        );
        return null;
      }

      return candidate;
    })
    .catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : String(error);
      warn(`加载模块声明失败：${entry.modulePath}（id=${entry.id}，reason=${reason}）`);
      return null;
    });

  cachedModuleTasks.set(entry.id, task);
  return task;
}

export async function getEnabledModules(enabledModules: EnabledModulesSetting): Promise<AdminModuleManifest[]> {
  const allModules = getAllModules();

  if (enabledModules === "*") {
    const loaded = await Promise.all(allModules.map((entry) => loadModule(entry)));
    return loaded.filter((item): item is AdminModuleManifest => item !== null);
  }

  if (enabledModules.length === 0) {
    const defaultModules = allModules.filter((item) => item.enabledByDefault);
    const loaded = await Promise.all(defaultModules.map((entry) => loadModule(entry)));
    return loaded.filter((item): item is AdminModuleManifest => item !== null);
  }

  const byId = new Map(allModules.map((item) => [item.id, item]));
  const used = new Set<string>();
  const out: ModuleLoadEntry[] = [];

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

  const loaded = await Promise.all(out.map((entry) => loadModule(entry)));
  return loaded.filter((item): item is AdminModuleManifest => item !== null);
}

export function getModuleIds(): string[] {
  return getAllModules().map((item) => item.id);
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    cachedAllModules = null;
    cachedModuleTasks.clear();
  });
}
