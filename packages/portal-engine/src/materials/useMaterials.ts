import type { Component } from 'vue';

interface MaterialModule {
  default?: Component;
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

  return { materialsMap };
}
