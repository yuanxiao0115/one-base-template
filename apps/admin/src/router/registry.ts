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
import { createAppLogger } from '@/shared/logger';

const moduleManifestDefinitions = import.meta.glob<{
  default?: AppModuleManifestMeta;
  moduleManifest?: AppModuleManifestMeta;
}>('../modules/**/manifest.ts', {
  eager: true
});

const moduleDeclarationLoaders = import.meta.glob<AppModuleDeclarationModule>(
  '../modules/**/module.ts'
);

const logger = createAppLogger('router/modules');
let cachedAllModules: ModuleLoadEntry[] | null = null;
const cachedModuleTasks = new Map<string, Promise<AppModuleManifest | null>>();

function warn(message: string) {
  logger.warn(message);
}

function getAllModules(): ModuleLoadEntry[] {
  if (cachedAllModules) {
    return cachedAllModules;
  }

  cachedAllModules = collectModuleLoadEntries({
    manifestDefinitions: moduleManifestDefinitions,
    hasModuleDeclaration(modulePath) {
      return Boolean(moduleDeclarationLoaders[modulePath]);
    },
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
  const pickedModules = pickEnabledModuleEntries({
    allModules,
    enabledModules,
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
