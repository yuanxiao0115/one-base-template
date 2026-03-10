import type { EnabledModulesSetting } from '../config/platform-config';
import type {
  AppModuleDeclarationModule,
  AppModuleManifest,
  AppModuleManifestMeta,
} from './module-assembly';

export interface ModuleLoadEntry extends AppModuleManifestMeta {
  manifestPath: string;
  modulePath: string;
}

interface CollectModuleLoadEntriesOptions {
  manifestDefinitions: Record<
    string,
    {
      default?: AppModuleManifestMeta;
      moduleManifest?: AppModuleManifestMeta;
    }
  >;
  hasModuleDeclaration: (modulePath: string) => boolean;
  onWarn: (message: string) => void;
}

interface PickEnabledModuleEntriesOptions {
  allModules: ModuleLoadEntry[];
  enabledModules: EnabledModulesSetting;
  onWarn: (message: string) => void;
}

interface ValidateModuleDeclarationOptions {
  entry: ModuleLoadEntry;
  candidate: unknown;
  onWarn: (message: string) => void;
}

export function isValidAppModuleManifestMeta(input: unknown): input is AppModuleManifestMeta {
  if (!input || typeof input !== 'object') {
    return false;
  }

  const value = input as AppModuleManifestMeta;
  if (!value.id || typeof value.id !== 'string') {
    return false;
  }
  if (value.version !== '1') {
    return false;
  }
  if (value.moduleTier !== 'core' && value.moduleTier !== 'optional') {
    return false;
  }
  if (typeof value.enabledByDefault !== 'boolean') {
    return false;
  }

  if (value.moduleTier === 'optional' && value.enabledByDefault) {
    return false;
  }

  return true;
}

export function isValidAppModuleManifest(input: unknown): input is AppModuleManifest {
  if (!isValidAppModuleManifestMeta(input)) {
    return false;
  }

  const value = input as AppModuleManifest;
  return Array.isArray(value.routes?.layout);
}

export function toModuleDeclarationPath(manifestPath: string): string | null {
  if (!manifestPath.endsWith('/manifest.ts')) {
    return null;
  }

  return manifestPath.replace(/\/manifest\.ts$/, '/module.ts');
}

export function resolveModuleDeclarationCandidate(loaded: AppModuleDeclarationModule): AppModuleManifest | undefined {
  return loaded.default ?? loaded.module;
}

export function validateModuleDeclaration(options: ValidateModuleDeclarationOptions): AppModuleManifest | null {
  const { entry, candidate, onWarn } = options;

  if (!isValidAppModuleManifest(candidate)) {
    onWarn(`忽略无效模块声明：${entry.modulePath}（id=${entry.id}）`);
    return null;
  }

  if (
    candidate.id !== entry.id
    || candidate.version !== entry.version
    || candidate.moduleTier !== entry.moduleTier
    || candidate.enabledByDefault !== entry.enabledByDefault
  ) {
    onWarn(`模块清单与声明不一致：id=${entry.id}（manifest=${entry.manifestPath} module=${entry.modulePath}）`);
    return null;
  }

  return candidate;
}

export function collectModuleLoadEntries(options: CollectModuleLoadEntriesOptions): ModuleLoadEntry[] {
  const { manifestDefinitions, hasModuleDeclaration, onWarn } = options;
  const byId = new Map<string, ModuleLoadEntry>();

  for (const [path, mod] of Object.entries(manifestDefinitions)) {
    const candidate = mod.default ?? mod.moduleManifest;
    if (!isValidAppModuleManifestMeta(candidate)) {
      onWarn(`忽略无效模块清单：${path}（要求 moduleTier 必填，且 optional 模块 enabledByDefault 必须为 false）`);
      continue;
    }

    const modulePath = toModuleDeclarationPath(path);
    if (!modulePath) {
      onWarn(`忽略无效模块清单路径：${path}（要求文件名为 manifest.ts）`);
      continue;
    }

    if (!hasModuleDeclaration(modulePath)) {
      onWarn(`模块清单缺少对应声明文件：${modulePath}（manifest=${path}）`);
      continue;
    }

    if (byId.has(candidate.id)) {
      onWarn(`检测到重复模块 id：${candidate.id}（忽略清单：${path}）`);
      continue;
    }

    byId.set(candidate.id, {
      ...candidate,
      manifestPath: path,
      modulePath,
    });
  }

  const out = [...byId.values()];
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}

export function pickEnabledModuleEntries(options: PickEnabledModuleEntriesOptions): ModuleLoadEntry[] {
  const { allModules, enabledModules, onWarn } = options;

  if (enabledModules === '*') {
    return allModules;
  }

  if (enabledModules.length === 0) {
    return allModules.filter((item) => item.enabledByDefault);
  }

  const byId = new Map(allModules.map((item) => [item.id, item]));
  const used = new Set<string>();
  const out: ModuleLoadEntry[] = [];

  for (const id of enabledModules) {
    if (used.has(id)) {
      onWarn(`enabledModules 包含重复模块 id：${id}`);
      continue;
    }
    used.add(id);

    const mod = byId.get(id);
    if (!mod) {
      onWarn(`enabledModules 包含未知模块 id：${id}`);
      continue;
    }

    out.push(mod);
  }

  return out;
}
