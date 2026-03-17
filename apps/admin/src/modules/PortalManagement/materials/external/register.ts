import {
  registerAdminSimpleContainerMaterial,
  resetAdminSimpleContainerMaterialForTesting
} from './simple-container/register';

interface PortalExternalMaterialRegistration {
  key: string;
  register: () => void;
  reset: () => void;
}

const EXTERNAL_MATERIALS: PortalExternalMaterialRegistration[] = [
  {
    key: 'admin-simple-container',
    register: registerAdminSimpleContainerMaterial,
    reset: resetAdminSimpleContainerMaterialForTesting
  }
];

const registeredMaterialKeys = new Set<string>();

export function registerPortalExternalMaterialsForAdmin() {
  for (const item of EXTERNAL_MATERIALS) {
    if (registeredMaterialKeys.has(item.key)) {
      continue;
    }

    item.register();
    registeredMaterialKeys.add(item.key);
  }
}

export function resetPortalExternalMaterialsForAdminTesting() {
  for (const item of EXTERNAL_MATERIALS) {
    if (!registeredMaterialKeys.has(item.key)) {
      continue;
    }

    item.reset();
    registeredMaterialKeys.delete(item.key);
  }
}
