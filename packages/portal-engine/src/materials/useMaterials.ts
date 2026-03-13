import type { Component } from 'vue';
import TransparentPlaceholderIndex from './base/transparent-placeholder/index.vue';
import TransparentPlaceholderContent from './base/transparent-placeholder/content.vue';
import TransparentPlaceholderStyle from './base/transparent-placeholder/style.vue';
import BaseIframeContainerIndex from './base/base-iframe-container/index.vue';
import BaseIframeContainerContent from './base/base-iframe-container/content.vue';
import BaseIframeContainerStyle from './base/base-iframe-container/style.vue';
import BaseTabContainerIndex from './base/base-tab-container/index.vue';
import BaseTabContainerContent from './base/base-tab-container/content.vue';
import BaseTabContainerStyle from './base/base-tab-container/style.vue';

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
  const name = (component as any)?.name ?? (component as any)?.__name;
  return typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
}

function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function getMaterialNameAliases(name: string): string[] {
  const names = new Set<string>();

  const appendAlias = (candidate: string) => {
    const normalized = candidate.trim();
    if (!normalized) {
      return;
    }

    names.add(normalized);
  };

  appendAlias(name);
  const kebabName = toKebabCase(name);
  if (kebabName !== name) {
    appendAlias(kebabName);
  }

  return Array.from(names);
}

function getPathDerivedMaterialAliases(modulePath: string): string[] {
  const normalizedPath = modulePath.replace(/\\/g, '/');
  const match = normalizedPath.match(/^\.\/([^/]+)\/(.+)\/(index|content|style)\.vue$/);
  if (!match) {
    return [];
  }

  const namespace = toKebabCase(match[1] || '');
  const materialPath = match[2];
  const section = match[3];
  if (!(namespace && materialPath && section)) {
    return [];
  }

  const materialName = materialPath
    .split('/')
    .filter(Boolean)
    .map((segment) => toKebabCase(segment))
    .map((segment, index) => {
      if (index === 0 && segment.startsWith(`${namespace}-`)) {
        return segment.slice(namespace.length + 1);
      }
      return segment;
    })
    .join('-');
  if (!materialName) {
    return [];
  }

  // 路径兜底策略：按目录前缀生成规范名（如 base-*/cms-*）。
  return getMaterialNameAliases(`${namespace}-${materialName}-${section}`);
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
  mod: MaterialModule | undefined,
  modulePath?: string
) {
  if (!mod?.default) {
    return;
  }

  const aliasNames = new Set<string>();
  const name = tryGetComponentName(mod);
  if (name) {
    for (const aliasName of getMaterialNameAliases(name)) {
      aliasNames.add(aliasName);
    }
  }
  if (modulePath) {
    for (const aliasName of getPathDerivedMaterialAliases(modulePath)) {
      aliasNames.add(aliasName);
    }
  }

  if (aliasNames.size === 0) {
    return;
  }

  for (const aliasName of aliasNames) {
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
 * - 组件 defineOptions({ name }) 建议与 cmptConfig 对齐；
 *   若未对齐，将按文件路径自动推导目录前缀别名进行兜底注册。
 */
export function useMaterials() {
  const materialsMap: Record<string, Component> = {};

  const indexModules = {
    ...import.meta.glob<MaterialModule>('./*/**/index.vue', { eager: true }),
  };
  const contentModules = {
    ...import.meta.glob<MaterialModule>('./*/**/content.vue', { eager: true }),
  };
  const styleModules = {
    ...import.meta.glob<MaterialModule>('./*/**/style.vue', { eager: true }),
  };

  for (const [path, mod] of Object.entries(indexModules) as [string, MaterialModule][]) {
    registerMaterialComponent(materialsMap, mod, path);
  }
  for (const [path, mod] of Object.entries(contentModules) as [string, MaterialModule][]) {
    registerMaterialComponent(materialsMap, mod, path);
  }
  for (const [path, mod] of Object.entries(styleModules) as [string, MaterialModule][]) {
    registerMaterialComponent(materialsMap, mod, path);
  }

  // 透明占位模块兜底注册：
  // 某些开发缓存场景下，新增文件可能短时间未进入 import.meta.glob 结果。
  registerMaterialComponentByName(
    materialsMap,
    'base-transparent-placeholder-index',
    TransparentPlaceholderIndex as Component
  );
  registerMaterialComponentByName(
    materialsMap,
    'base-transparent-placeholder-content',
    TransparentPlaceholderContent as Component
  );
  registerMaterialComponentByName(
    materialsMap,
    'base-transparent-placeholder-style',
    TransparentPlaceholderStyle as Component
  );
  registerMaterialComponentByName(
    materialsMap,
    'base-iframe-container-index',
    BaseIframeContainerIndex as Component
  );
  registerMaterialComponentByName(
    materialsMap,
    'base-iframe-container-content',
    BaseIframeContainerContent as Component
  );
  registerMaterialComponentByName(
    materialsMap,
    'base-iframe-container-style',
    BaseIframeContainerStyle as Component
  );
  registerMaterialComponentByName(
    materialsMap,
    'base-tab-container-index',
    BaseTabContainerIndex as Component
  );
  registerMaterialComponentByName(
    materialsMap,
    'base-tab-container-content',
    BaseTabContainerContent as Component
  );
  registerMaterialComponentByName(
    materialsMap,
    'base-tab-container-style',
    BaseTabContainerStyle as Component
  );

  for (const [name, component] of Object.entries(customMaterialComponents)) {
    materialsMap[name] = component;
  }

  return { materialsMap };
}
