import type { Component } from 'vue';
import { portalMaterialsRegistry } from '../registry/materials-registry';
import TransparentPlaceholderIndex from './base/transparent-placeholder/index.vue';
import TransparentPlaceholderContent from './base/transparent-placeholder/content.vue';
import TransparentPlaceholderStyle from './base/transparent-placeholder/style.vue';
import BaseIframeContainerIndex from './base/base-iframe-container/index.vue';
import BaseIframeContainerContent from './base/base-iframe-container/content.vue';
import BaseIframeContainerStyle from './base/base-iframe-container/style.vue';
import BaseTabContainerIndex from './base/base-tab-container/index.vue';
import BaseTabContainerContent from './base/base-tab-container/content.vue';
import BaseTabContainerStyle from './base/base-tab-container/style.vue';
import AppEntranceIndex from './base/app-entrance/index.vue';
import AppEntranceContent from './base/app-entrance/content.vue';
import AppEntranceStyle from './base/app-entrance/style.vue';
import ImageLinkListIndex from './base/image-link-list/index.vue';
import ImageLinkListContent from './base/image-link-list/content.vue';
import ImageLinkListStyle from './base/image-link-list/style.vue';
import BaseButtonGroupIndex from './base/base-button-group/index.vue';
import BaseButtonGroupContent from './base/base-button-group/content.vue';
import BaseButtonGroupStyle from './base/base-button-group/style.vue';
import BaseSearchBoxIndex from './base/base-search-box/index.vue';
import BaseSearchBoxContent from './base/base-search-box/content.vue';
import BaseSearchBoxStyle from './base/base-search-box/style.vue';
import BaseNoticeIndex from './base/base-notice/index.vue';
import BaseNoticeContent from './base/base-notice/content.vue';
import BaseNoticeStyle from './base/base-notice/style.vue';
import BaseCardListIndex from './base/base-card-list/index.vue';
import BaseCardListContent from './base/base-card-list/content.vue';
import BaseCardListStyle from './base/base-card-list/style.vue';
import BaseFormIndex from './base/base-form/index.vue';
import BaseFormContent from './base/base-form/content.vue';
import BaseFormStyle from './base/base-form/style.vue';
import BaseStatIndex from './base/base-stat/index.vue';
import BaseStatContent from './base/base-stat/content.vue';
import BaseStatStyle from './base/base-stat/style.vue';
import BaseFileListIndex from './base/base-file-list/index.vue';
import BaseFileListContent from './base/base-file-list/content.vue';
import BaseFileListStyle from './base/base-file-list/style.vue';
import BaseTimelineIndex from './base/base-timeline/index.vue';
import BaseTimelineContent from './base/base-timeline/content.vue';
import BaseTimelineStyle from './base/base-timeline/style.vue';

interface MaterialModule {
  default?: Component;
}

interface StaticMaterialFallback {
  name: string;
  component: Component;
  aliases?: string[];
}

const STATIC_MATERIAL_FALLBACKS: StaticMaterialFallback[] = [
  {
    name: 'base-transparent-placeholder-index',
    component: TransparentPlaceholderIndex as Component,
  },
  {
    name: 'base-transparent-placeholder-content',
    component: TransparentPlaceholderContent as Component,
  },
  {
    name: 'base-transparent-placeholder-style',
    component: TransparentPlaceholderStyle as Component,
  },
  {
    name: 'base-iframe-container-index',
    component: BaseIframeContainerIndex as Component,
  },
  {
    name: 'base-iframe-container-content',
    component: BaseIframeContainerContent as Component,
  },
  {
    name: 'base-iframe-container-style',
    component: BaseIframeContainerStyle as Component,
  },
  {
    name: 'base-tab-container-index',
    component: BaseTabContainerIndex as Component,
  },
  {
    name: 'base-tab-container-content',
    component: BaseTabContainerContent as Component,
  },
  {
    name: 'base-tab-container-style',
    component: BaseTabContainerStyle as Component,
  },
  {
    name: 'app-entrance-index',
    aliases: ['base-app-entrance-index'],
    component: AppEntranceIndex as Component,
  },
  {
    name: 'app-entrance-content',
    aliases: ['base-app-entrance-content'],
    component: AppEntranceContent as Component,
  },
  {
    name: 'app-entrance-style',
    aliases: ['base-app-entrance-style'],
    component: AppEntranceStyle as Component,
  },
  {
    name: 'image-link-list-index',
    aliases: ['base-image-link-list-index'],
    component: ImageLinkListIndex as Component,
  },
  {
    name: 'image-link-list-content',
    aliases: ['base-image-link-list-content'],
    component: ImageLinkListContent as Component,
  },
  {
    name: 'image-link-list-style',
    aliases: ['base-image-link-list-style'],
    component: ImageLinkListStyle as Component,
  },
  {
    name: 'base-button-group-index',
    component: BaseButtonGroupIndex as Component,
  },
  {
    name: 'base-button-group-content',
    component: BaseButtonGroupContent as Component,
  },
  {
    name: 'base-button-group-style',
    component: BaseButtonGroupStyle as Component,
  },
  {
    name: 'base-search-box-index',
    component: BaseSearchBoxIndex as Component,
  },
  {
    name: 'base-search-box-content',
    component: BaseSearchBoxContent as Component,
  },
  {
    name: 'base-search-box-style',
    component: BaseSearchBoxStyle as Component,
  },
  {
    name: 'base-notice-index',
    component: BaseNoticeIndex as Component,
  },
  {
    name: 'base-notice-content',
    component: BaseNoticeContent as Component,
  },
  {
    name: 'base-notice-style',
    component: BaseNoticeStyle as Component,
  },
  {
    name: 'base-card-list-index',
    component: BaseCardListIndex as Component,
  },
  {
    name: 'base-card-list-content',
    component: BaseCardListContent as Component,
  },
  {
    name: 'base-card-list-style',
    component: BaseCardListStyle as Component,
  },
  {
    name: 'base-form-index',
    component: BaseFormIndex as Component,
  },
  {
    name: 'base-form-content',
    component: BaseFormContent as Component,
  },
  {
    name: 'base-form-style',
    component: BaseFormStyle as Component,
  },
  {
    name: 'base-stat-index',
    component: BaseStatIndex as Component,
  },
  {
    name: 'base-stat-content',
    component: BaseStatContent as Component,
  },
  {
    name: 'base-stat-style',
    component: BaseStatStyle as Component,
  },
  {
    name: 'base-file-list-index',
    component: BaseFileListIndex as Component,
  },
  {
    name: 'base-file-list-content',
    component: BaseFileListContent as Component,
  },
  {
    name: 'base-file-list-style',
    component: BaseFileListStyle as Component,
  },
  {
    name: 'base-timeline-index',
    component: BaseTimelineIndex as Component,
  },
  {
    name: 'base-timeline-content',
    component: BaseTimelineContent as Component,
  },
  {
    name: 'base-timeline-style',
    component: BaseTimelineStyle as Component,
  },
];

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

function resolveSectionName(config: unknown, section: 'index' | 'content' | 'style'): string | null {
  const sectionConfig = asRecord(asRecord(config)[section]);
  const name = sectionConfig.name;
  return typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
}

function resolveRegistryComponentNames(): string[] {
  const names = new Set<string>();

  for (const category of portalMaterialsRegistry.categories) {
    for (const material of category.cmptList) {
      const config = asRecord(material.cmptConfig);
      const indexName = resolveSectionName(config, 'index');
      const contentName = resolveSectionName(config, 'content');
      const styleName = resolveSectionName(config, 'style');

      if (indexName) {
        names.add(indexName);
      }
      if (contentName) {
        names.add(contentName);
      }
      if (styleName) {
        names.add(styleName);
      }
    }
  }

  return Array.from(names);
}

function patchMissingNamesByBasePrefix(materialsMap: Record<string, Component>, missingNames: string[]): string[] {
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

function verifyRegistryCoverage(materialsMap: Record<string, Component>) {
  if (!import.meta.env.DEV) {
    return;
  }

  const requiredNames = resolveRegistryComponentNames();
  const initialMissingNames = requiredNames.filter((name) => !materialsMap[name]);
  if (initialMissingNames.length === 0) {
    return;
  }

  const resolvedAliases = patchMissingNamesByBasePrefix(materialsMap, initialMissingNames);
  const finalMissingNames = requiredNames.filter((name) => !materialsMap[name]);
  if (finalMissingNames.length === 0) {
    if (resolvedAliases.length > 0) {
      console.warn('[portal-engine] 检测到 base 前缀命名差异，已自动补齐别名。', {
        aliases: resolvedAliases,
      });
    }
    return;
  }

  console.error('[portal-engine] 物料组件注册缺失，请检查 useMaterials 注册与组件 name。', {
    missingNames: finalMissingNames,
    resolvedAliases,
    availableCount: Object.keys(materialsMap).length,
    availableSample: Object.keys(materialsMap)
      .filter((name) => /-(index|content|style)$/.test(name))
      .sort()
      .slice(0, 40),
  });
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

  // 静态兜底注册：
  // 某些开发缓存场景下，新增文件可能短时间未进入 import.meta.glob 结果。
  for (const fallback of STATIC_MATERIAL_FALLBACKS) {
    registerMaterialComponentByName(materialsMap, fallback.name, fallback.component, fallback.aliases);
  }

  for (const [name, component] of Object.entries(customMaterialComponents)) {
    materialsMap[name] = component;
  }

  verifyRegistryCoverage(materialsMap);

  return { materialsMap };
}
