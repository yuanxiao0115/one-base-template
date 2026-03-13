import type { Component } from 'vue';
import TransparentPlaceholderIndex from './base/transparent-placeholder/index.vue';
import TransparentPlaceholderContent from './base/transparent-placeholder/content.vue';
import TransparentPlaceholderStyle from './base/transparent-placeholder/style.vue';

interface MaterialModule {
  default?: Component;
}

export interface RegisterPortalMaterialComponentOptions {
  name: string;
  component: Component;
  aliases?: string[];
  strategy?: 'reject' | 'replace';
}

function tryGetComponentName(mod: unknown): string | null {
  const component = (mod as MaterialModule | undefined)?.default;
  const name = (component as any)?.name;
  return typeof name === 'string' && name.length > 0 ? name : null;
}

function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function getMaterialNameAliases(name: string): string[] {
  const names = new Set<string>();

  const appendAliasPair = (candidate: string) => {
    if (candidate.startsWith('pb-')) {
      names.add(candidate);
      names.add(`cms-${candidate.slice(3)}`);
      return;
    }
    if (candidate.startsWith('cms-')) {
      names.add(candidate);
      names.add(`pb-${candidate.slice(4)}`);
      return;
    }
    names.add(candidate);
  };

  appendAliasPair(name);
  const kebabName = toKebabCase(name);
  if (kebabName !== name) {
    appendAliasPair(kebabName);
  }

  return Array.from(names);
}

const customMaterialComponents: Record<string, Component> = {};

function resolveRegisterNames(name: string, aliases: string[] = []): string[] {
  return Array.from(new Set([...getMaterialNameAliases(name), ...aliases]));
}

/**
 * 注册运行时物料组件。
 *
 * 说明：
 * - 默认冲突策略为 reject，防止业务无感覆盖内置组件。
 * - 需要显式覆盖时传 strategy=replace。
 */
export function registerPortalMaterialComponent(options: RegisterPortalMaterialComponentOptions) {
  const strategy = options.strategy === 'replace' ? 'replace' : 'reject';
  const names = resolveRegisterNames(options.name, options.aliases);

  if (strategy === 'reject') {
    const conflict = names.find((name) => Boolean(customMaterialComponents[name]));
    if (conflict) {
      throw new Error(`[portal-engine] 注册物料组件冲突：${conflict}`);
    }
  }

  for (const name of names) {
    customMaterialComponents[name] = options.component;
  }
}

export function unregisterPortalMaterialComponent(name: string, aliases: string[] = []): boolean {
  const names = resolveRegisterNames(name, aliases);
  let removed = false;
  for (const aliasName of names) {
    if (customMaterialComponents[aliasName]) {
      delete customMaterialComponents[aliasName];
      removed = true;
    }
  }
  return removed;
}

function registerMaterialComponent(
  materialsMap: Record<string, Component>,
  mod: MaterialModule | undefined
) {
  const name = tryGetComponentName(mod);
  if (!name || !mod?.default) {
    return;
  }
  for (const aliasName of getMaterialNameAliases(name)) {
    materialsMap[aliasName] = mod.default;
  }
}

function registerMaterialComponentByName(
  materialsMap: Record<string, Component>,
  name: string,
  component: Component
) {
  for (const aliasName of getMaterialNameAliases(name)) {
    materialsMap[aliasName] = component;
  }
}

/**
 * 动态加载物料组件映射
 *
 * 约定：
 * - 每个物料目录提供：index.vue / content.vue / style.vue
 * - defineOptions({ name }) 必须与 cmptConfig.index/content/style.name 对齐
 */
export function useMaterials() {
  const materialsMap: Record<string, Component> = {};

  const indexModules = {
    ...import.meta.glob<MaterialModule>('./base/**/index.vue', { eager: true }),
    ...import.meta.glob<MaterialModule>('./cms/**/index.vue', { eager: true }),
  };
  const contentModules = {
    ...import.meta.glob<MaterialModule>('./base/**/content.vue', { eager: true }),
    ...import.meta.glob<MaterialModule>('./cms/**/content.vue', { eager: true }),
  };
  const styleModules = {
    ...import.meta.glob<MaterialModule>('./base/**/style.vue', { eager: true }),
    ...import.meta.glob<MaterialModule>('./cms/**/style.vue', { eager: true }),
  };

  for (const mod of Object.values(indexModules) as MaterialModule[]) {
    registerMaterialComponent(materialsMap, mod);
  }
  for (const mod of Object.values(contentModules) as MaterialModule[]) {
    registerMaterialComponent(materialsMap, mod);
  }
  for (const mod of Object.values(styleModules) as MaterialModule[]) {
    registerMaterialComponent(materialsMap, mod);
  }

  // 透明占位模块兜底注册：
  // 某些开发缓存场景下，新增文件可能短时间未进入 import.meta.glob 结果。
  registerMaterialComponentByName(
    materialsMap,
    'pb-transparent-placeholder-index',
    TransparentPlaceholderIndex as Component
  );
  registerMaterialComponentByName(
    materialsMap,
    'pb-transparent-placeholder-content',
    TransparentPlaceholderContent as Component
  );
  registerMaterialComponentByName(
    materialsMap,
    'pb-transparent-placeholder-style',
    TransparentPlaceholderStyle as Component
  );

  for (const [name, component] of Object.entries(customMaterialComponents)) {
    materialsMap[name] = component;
  }

  return { materialsMap };
}
