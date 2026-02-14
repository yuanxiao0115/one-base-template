import type { Component } from 'vue';

type MaterialModule = { default?: Component };

function tryGetComponentName(mod: unknown): string | null {
  const component = (mod as MaterialModule | undefined)?.default;
  const name = (component as any)?.name;
  return typeof name === 'string' && name.length > 0 ? name : null;
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

  const indexModules = import.meta.glob<MaterialModule>('./**/index.vue', { eager: true });
  const contentModules = import.meta.glob<MaterialModule>('./**/content.vue', { eager: true });
  const styleModules = import.meta.glob<MaterialModule>('./**/style.vue', { eager: true });

  for (const mod of Object.values(indexModules)) {
    const name = tryGetComponentName(mod);
    if (name && mod.default) materialsMap[name] = mod.default;
  }
  for (const mod of Object.values(contentModules)) {
    const name = tryGetComponentName(mod);
    if (name && mod.default) materialsMap[name] = mod.default;
  }
  for (const mod of Object.values(styleModules)) {
    const name = tryGetComponentName(mod);
    if (name && mod.default) materialsMap[name] = mod.default;
  }

  return { materialsMap };
}

