import type { Component } from 'vue';

import { getPortalMaterialRegistryController } from '../registry/materials-registry';
import type { PortalEngineContext } from '../runtime/context';
import { getDefaultPortalEngineContext, readPortalEngineContextValue } from '../runtime/context';

export interface MaterialModule {
  default?: Component;
}

export type PortalMaterialComponentSection = 'index' | 'content' | 'style';

export interface StaticMaterialFallback {
  name: string;
  component: Component;
  section: PortalMaterialComponentSection;
  aliases?: string[];
}

export interface RegisterPortalMaterialComponentOptions {
  name: string;
  component: Component;
  aliases?: string[];
  strategy?: 'reject' | 'replace';
}

interface CreatePortalMaterialsMapOptions {
  context?: PortalEngineContext;
  sections: PortalMaterialComponentSection[];
  modulesBySection: Partial<Record<PortalMaterialComponentSection, Record<string, MaterialModule>>>;
  staticFallbacks?: StaticMaterialFallback[];
}

const PORTAL_CUSTOM_MATERIAL_COMPONENTS_CONTEXT_KEY = Symbol(
  'portal-engine.custom-material-components'
);

function createCustomMaterialComponents() {
  return {} as Record<string, Component>;
}

function getCustomMaterialComponents(
  context: PortalEngineContext = getDefaultPortalEngineContext()
) {
  return readPortalEngineContextValue<Record<string, Component>>(
    PORTAL_CUSTOM_MATERIAL_COMPONENTS_CONTEXT_KEY,
    context,
    createCustomMaterialComponents
  );
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

  return getMaterialNameAliases(`${namespace}-${materialName}-${section}`);
}

function resolveRegisterNames(name: string, aliases: string[] = []): string[] {
  return Array.from(new Set([...getMaterialNameAliases(name), ...aliases]));
}

export function registerPortalMaterialComponent(
  options: RegisterPortalMaterialComponentOptions,
  context: PortalEngineContext = getDefaultPortalEngineContext()
) {
  const strategy = options.strategy === 'replace' ? 'replace' : 'reject';
  const names = resolveRegisterNames(options.name, options.aliases);
  const customMaterialComponents = getCustomMaterialComponents(context);

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

export function unregisterPortalMaterialComponent(
  name: string,
  aliases: string[] = [],
  context: PortalEngineContext = getDefaultPortalEngineContext()
): boolean {
  const names = resolveRegisterNames(name, aliases);
  const customMaterialComponents = getCustomMaterialComponents(context);
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
  component: Component,
  aliases: string[] = []
) {
  for (const aliasName of resolveRegisterNames(name, aliases)) {
    materialsMap[aliasName] = component;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function resolveSectionName(
  config: unknown,
  section: PortalMaterialComponentSection
): string | null {
  const sectionConfig = asRecord(asRecord(config)[section]);
  const name = sectionConfig.name;
  return typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
}

function resolveRegistryComponentNames(
  sections: PortalMaterialComponentSection[],
  context: PortalEngineContext
): string[] {
  const names = new Set<string>();
  const sectionSet = new Set(sections);
  const registry = getPortalMaterialRegistryController(context);

  for (const category of registry.categories) {
    for (const material of category.cmptList) {
      const config = asRecord(material.cmptConfig);

      if (sectionSet.has('index')) {
        const indexName = resolveSectionName(config, 'index');
        if (indexName) {
          names.add(indexName);
        }
      }

      if (sectionSet.has('content')) {
        const contentName = resolveSectionName(config, 'content');
        if (contentName) {
          names.add(contentName);
        }
      }

      if (sectionSet.has('style')) {
        const styleName = resolveSectionName(config, 'style');
        if (styleName) {
          names.add(styleName);
        }
      }
    }
  }

  return Array.from(names);
}

function patchMissingNamesByBasePrefix(
  materialsMap: Record<string, Component>,
  missingNames: string[]
): string[] {
  const resolved: string[] = [];

  for (const missingName of missingNames) {
    const peerName = missingName.startsWith('base-') ? missingName.slice(5) : `base-${missingName}`;
    if (!peerName || !materialsMap[peerName]) {
      continue;
    }
    materialsMap[missingName] = materialsMap[peerName];
    resolved.push(`${missingName} <= ${peerName}`);
  }

  return resolved;
}

function verifyRegistryCoverage(
  materialsMap: Record<string, Component>,
  sections: PortalMaterialComponentSection[],
  context: PortalEngineContext
) {
  if (!import.meta.env.DEV) {
    return;
  }

  const requiredNames = resolveRegistryComponentNames(sections, context);
  const initialMissingNames = requiredNames.filter((name) => !materialsMap[name]);
  if (initialMissingNames.length === 0) {
    return;
  }

  const resolvedAliases = patchMissingNamesByBasePrefix(materialsMap, initialMissingNames);
  const finalMissingNames = requiredNames.filter((name) => !materialsMap[name]);
  if (finalMissingNames.length === 0) {
    if (resolvedAliases.length > 0) {
      console.warn('[portal-engine] 检测到 base 前缀命名差异，已自动补齐别名。', {
        aliases: resolvedAliases
      });
    }
    return;
  }

  console.error('[portal-engine] 物料组件注册缺失，请检查 useMaterials 注册与组件 name。', {
    missingNames: finalMissingNames,
    resolvedAliases,
    sections,
    availableCount: Object.keys(materialsMap).length,
    availableSample: Object.keys(materialsMap)
      .filter((name) => /-(index|content|style)$/.test(name))
      .sort()
      .slice(0, 40)
  });
}

export function createPortalMaterialsMap(options: CreatePortalMaterialsMapOptions) {
  const context = options.context ?? getDefaultPortalEngineContext();
  const materialsMap: Record<string, Component> = {};

  for (const section of options.sections) {
    const modules = options.modulesBySection[section] ?? {};
    for (const [path, mod] of Object.entries(modules) as [string, MaterialModule][]) {
      registerMaterialComponent(materialsMap, mod, path);
    }
  }

  for (const fallback of options.staticFallbacks ?? []) {
    registerMaterialComponentByName(
      materialsMap,
      fallback.name,
      fallback.component,
      fallback.aliases
    );
  }

  for (const [name, component] of Object.entries(getCustomMaterialComponents(context))) {
    materialsMap[name] = component;
  }

  verifyRegistryCoverage(materialsMap, options.sections, context);

  return materialsMap;
}
