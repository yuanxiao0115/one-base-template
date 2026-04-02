import {
  type AppModuleDeclarationModule,
  type AppModuleManifest,
  type AppModuleManifestMeta,
  type EnabledModulesSetting,
  collectModuleLoadEntries,
  pickEnabledModuleEntries,
  resolveModuleDeclarationCandidate,
  type ModuleLoadEntry,
  validateModuleDeclaration
} from '@one-base-template/core';
import { createAppLogger } from '@/utils/logger';

const moduleMetaDefinitions = import.meta.glob<{
  moduleMeta?: AppModuleManifestMeta;
}>('../modules/**/index.ts', {
  eager: true
});

const moduleDeclarationLoaders = import.meta.glob<AppModuleDeclarationModule>(
  '../modules/**/index.ts'
);

const logger = createAppLogger('router/modules');
let cachedAllModules: ModuleLoadEntry[] | null = null;
const cachedModuleTasks = new Map<string, Promise<AppModuleManifest | null>>();
const LEGACY_MODULE_ID_ALIASES = Object.freeze({
  PortalManagement: 'portal-management',
  DocumentFormManagement: 'document-form-management'
});

function warn(message: string) {
  logger.warn(message);
}

function buildEnabledModulesSetting(enabledModules: EnabledModulesSetting): EnabledModulesSetting {
  if (enabledModules === '*') {
    return enabledModules;
  }

  return enabledModules.map((id) => {
    const alias = LEGACY_MODULE_ID_ALIASES[id as keyof typeof LEGACY_MODULE_ID_ALIASES];
    if (!alias) {
      return id;
    }
    warn(`enabledModules 使用历史模块 id：${id}，已自动映射为 ${alias}`);
    return alias;
  });
}

function getAllModules(): ModuleLoadEntry[] {
  if (cachedAllModules) {
    return cachedAllModules;
  }

  cachedAllModules = collectModuleLoadEntries({
    moduleMetaDefinitions: Object.fromEntries(
      Object.entries(moduleMetaDefinitions).map(([path, mod]) => [path, mod.moduleMeta])
    ),
    onWarn: warn
  });

  return cachedAllModules;
}

async function loadModule(entry: ModuleLoadEntry): Promise<AppModuleManifest | null> {
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
      const candidate = resolveModuleDeclarationCandidate(loaded);
      return validateModuleDeclaration({
        entry,
        candidate,
        onWarn: warn
      });
    })
    .catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : String(error);
      warn(`加载模块声明失败：${entry.modulePath}（id=${entry.id}，reason=${reason}）`);
      return null;
    });

  cachedModuleTasks.set(entry.id, task);
  return task;
}

export async function getEnabledModules(
  enabledModules: EnabledModulesSetting
): Promise<AppModuleManifest[]> {
  const allModules = getAllModules();
  const normalizedEnabledModules = buildEnabledModulesSetting(enabledModules);
  const pickedModules = pickEnabledModuleEntries({
    allModules,
    enabledModules: normalizedEnabledModules,
    onWarn: warn
  });
  const loaded = await Promise.all(pickedModules.map((entry) => loadModule(entry)));
  return loaded.filter((item): item is AppModuleManifest => item !== null);
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
