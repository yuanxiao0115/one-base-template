import { createPortalEngineContext, type PortalEngineContext } from '@one-base-template/portal-engine';

let portalEngineAdminContext: PortalEngineContext = createPortalEngineContext({
  appId: 'apps-admin-portal-management',
});

export function getPortalEngineAdminContext() {
  return portalEngineAdminContext;
}

export function resetPortalEngineAdminContextForTesting() {
  portalEngineAdminContext = createPortalEngineContext({
    appId: 'apps-admin-portal-management',
  });
  return portalEngineAdminContext;
}
