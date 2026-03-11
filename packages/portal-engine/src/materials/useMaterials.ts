import type { Component } from 'vue';

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

function getMaterialNameAliases(name: string): string[] {
  if (name.startsWith('pb-')) {
    return [name, `cms-${name.slice(3)}`];
  }
  if (name.startsWith('cms-')) {
    return [name, `pb-${name.slice(4)}`];
  }
  return [name];
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

/**
 * 动态加载物料组件映射
 *
 * 约定：
 * - 每个物料目录提供：index.vue / content.vue / style.vue
 * - defineOptions({ name }) 必须与 cmptConfig.index/content/style.name 对齐
 */
export function useMaterials() {
  const materialsMap: Record<string, Component> = {};

  const indexModules = import.meta.glob<MaterialModule>('./cms/**/index.vue', {
    eager: true,
  });
  const contentModules = import.meta.glob<MaterialModule>('./cms/**/content.vue', {
    eager: true,
  });
  const styleModules = import.meta.glob<MaterialModule>('./cms/**/style.vue', {
    eager: true,
  });

  for (const mod of Object.values(indexModules) as MaterialModule[]) {
    registerMaterialComponent(materialsMap, mod);
  }
  for (const mod of Object.values(contentModules) as MaterialModule[]) {
    registerMaterialComponent(materialsMap, mod);
  }
  for (const mod of Object.values(styleModules) as MaterialModule[]) {
    registerMaterialComponent(materialsMap, mod);
  }

  for (const [name, component] of Object.entries(customMaterialComponents)) {
    materialsMap[name] = component;
  }

  return { materialsMap };
}
