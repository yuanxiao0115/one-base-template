import {
  registerAdminSimpleContainerMaterial,
  resetAdminSimpleContainerMaterialForTesting
} from './simple-container/register';

let initialized = false;

export function registerPortalExternalMaterialsForAdmin() {
  if (initialized) {
    return;
  }

  registerAdminSimpleContainerMaterial();
  initialized = true;
}

export function resetPortalExternalMaterialsForAdminTesting() {
  if (!initialized) {
    return;
  }

  resetAdminSimpleContainerMaterialForTesting();
  initialized = false;
}
