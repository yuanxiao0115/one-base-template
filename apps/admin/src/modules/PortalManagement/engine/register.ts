import {
  type PortalEngineContext,
  setPortalCmsApi,
  setPortalCmsNavigation,
  setPortalPageSettingsApi,
  type PortalCmsNavigation
} from '@one-base-template/portal-engine';

import { cmsApi, portalApi } from '../api';
import { getPortalEngineAdminContext, resetPortalEngineAdminContextForTesting } from './context';

export interface PortalEngineAdminRegisterOptions {
  cmsNavigation?: Partial<PortalCmsNavigation>;
  registerDemoMaterial?: boolean;
}

let initialized = false;
let demoMaterialRegistered = false;
let demoMaterialLoadingPromise: Promise<void> | null = null;
let demoMaterialModulePromise: Promise<
  typeof import('../materials/examples/quick-register-demo/register')
> | null = null;

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

  if (options.registerDemoMaterial) {
    ensureDemoMaterialRegistered(context);
  }

  return context;
}

export function resetPortalEngineAdminSetupForTesting() {
  cleanupDemoMaterialRegistration(getPortalEngineAdminContext());
  initialized = false;
  resetPortalEngineAdminContextForTesting();
}
