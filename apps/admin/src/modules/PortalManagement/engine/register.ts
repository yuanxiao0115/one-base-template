import {
  registerMaterialExtensions,
  type PortalEngineContext,
  type PortalMaterialExtension,
  setPortalCmsApi,
  setPortalCmsNavigation,
  setPortalPageSettingsApi,
  type PortalCmsNavigation
} from '@one-base-template/portal-engine';

import { cmsApi, portalApi } from '../api';
import { PORTAL_ADMIN_MATERIAL_EXTENSIONS } from '../materials/extensions';
import { getPortalEngineAdminContext, resetPortalEngineAdminContextForTesting } from './context';

export interface PortalEngineAdminRegisterOptions {
  cmsNavigation?: Partial<PortalCmsNavigation>;
  materialExtensions?: PortalMaterialExtension[];
  registerDemoMaterial?: boolean;
}

let initialized = false;
const registeredMaterialExtensionSignatures = new Set<string>();
let demoMaterialRegistered = false;
let demoMaterialLoadingPromise: Promise<void> | null = null;
let demoMaterialModulePromise: Promise<
  typeof import('../materials/examples/quick-register-demo/register')
> | null = null;

function resolveSectionName(config: unknown, section: 'index' | 'content' | 'style'): string {
  if (!config || typeof config !== 'object') {
    return '';
  }
  const sectionConfig = (config as Record<string, unknown>)[section];
  if (!sectionConfig || typeof sectionConfig !== 'object') {
    return '';
  }
  const name = (sectionConfig as Record<string, unknown>).name;
  return typeof name === 'string' ? name.trim() : '';
}

function resolveComponentName(component: unknown): string {
  if (!component || typeof component !== 'object') {
    return '';
  }
  const namedComponent = component as { name?: unknown; __name?: unknown };
  const name = namedComponent.name ?? namedComponent.__name;
  return typeof name === 'string' ? name.trim() : '';
}

function resolveMaterialExtensionSignature(extension: PortalMaterialExtension): string {
  const category = extension.category
    ? {
        id: extension.category.id,
        name: extension.category.name,
        title: extension.category.title,
        cmptTypeName: extension.category.cmptTypeName
      }
    : null;

  const materials = (Array.isArray(extension.materials) ? extension.materials : [])
    .map((material) => ({
      id: material.id,
      type: material.type,
      name: material.name,
      icon: material.icon,
      width: material.width,
      height: material.height,
      indexName: resolveSectionName(material.config, 'index'),
      contentName: resolveSectionName(material.config, 'content'),
      styleName: resolveSectionName(material.config, 'style'),
      indexComponentName: resolveComponentName(material.components.index),
      contentComponentName: resolveComponentName(material.components.content),
      styleComponentName: resolveComponentName(material.components.style),
      indexAliases: material.aliases?.index ?? [],
      contentAliases: material.aliases?.content ?? [],
      styleAliases: material.aliases?.style ?? []
    }))
    .sort((a, b) => `${a.type}::${a.id}`.localeCompare(`${b.type}::${b.id}`));

  return JSON.stringify({
    category,
    materials
  });
}

function registerMaterialExtensionsIfNeeded(
  context: PortalEngineContext,
  extensions: PortalMaterialExtension[]
) {
  if (!extensions.length) {
    return;
  }

  const pending = extensions.filter((extension) => {
    const signature = resolveMaterialExtensionSignature(extension);
    if (registeredMaterialExtensionSignatures.has(signature)) {
      return false;
    }
    registeredMaterialExtensionSignatures.add(signature);
    return true;
  });

  if (!pending.length) {
    return;
  }

  try {
    registerMaterialExtensions(context, pending);
  } catch (error: unknown) {
    pending.forEach((extension) => {
      registeredMaterialExtensionSignatures.delete(resolveMaterialExtensionSignature(extension));
    });
    throw error;
  }
}

function getDemoMaterialModule() {
  if (!demoMaterialModulePromise) {
    demoMaterialModulePromise = import('../materials/examples/quick-register-demo/register');
  }
  return demoMaterialModulePromise;
}

function ensureDemoMaterialRegistered(context: PortalEngineContext) {
  if (demoMaterialRegistered || demoMaterialLoadingPromise) {
    return;
  }

  demoMaterialLoadingPromise = getDemoMaterialModule()
    .then((mod) => {
      mod.registerPortalAdminQuickDemoMaterial(context);
      demoMaterialRegistered = true;
    })
    .catch((error: unknown) => {
      console.warn('[PortalManagement] 注册示例物料失败', error);
    })
    .finally(() => {
      demoMaterialLoadingPromise = null;
    });
}

function cleanupDemoMaterialRegistration(context: PortalEngineContext) {
  if (!(demoMaterialRegistered || demoMaterialLoadingPromise)) {
    return;
  }

  demoMaterialRegistered = false;
  demoMaterialLoadingPromise = null;

  void getDemoMaterialModule()
    .then((mod) => {
      mod.unregisterPortalAdminQuickDemoMaterial(context);
    })
    .catch((error: unknown) => {
      console.warn('[PortalManagement] 卸载示例物料失败', error);
    });
}

export function setupPortalEngineForAdmin(
  options: PortalEngineAdminRegisterOptions = {}
): PortalEngineContext {
  const context = getPortalEngineAdminContext();

  if (!initialized) {
    setPortalCmsApi(
      {
        getCategoryTree: cmsApi.getCategoryTree,
        getUserArticlesByCategory: cmsApi.getUserArticlesByCategory,
        getUserCarouselsByCategory: cmsApi.getUserCarouselsByCategory
      },
      context
    );

    setPortalPageSettingsApi(
      {
        getTabDetail: ({ id }) => portalApi.tab.detail({ id }),
        updateTab: (payload) => portalApi.tab.update(payload)
      },
      context
    );

    initialized = true;
  }

  if (options.cmsNavigation) {
    setPortalCmsNavigation(options.cmsNavigation, context);
  }

  registerMaterialExtensionsIfNeeded(context, [
    ...PORTAL_ADMIN_MATERIAL_EXTENSIONS,
    ...(options.materialExtensions ?? [])
  ]);

  if (options.registerDemoMaterial) {
    ensureDemoMaterialRegistered(context);
  }

  return context;
}

export function resetPortalEngineAdminSetupForTesting() {
  cleanupDemoMaterialRegistration(getPortalEngineAdminContext());
  initialized = false;
  registeredMaterialExtensionSignatures.clear();
  resetPortalEngineAdminContextForTesting();
}
