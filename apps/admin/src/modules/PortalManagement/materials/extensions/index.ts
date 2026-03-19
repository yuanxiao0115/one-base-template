import {
  definePortalMaterialExtension,
  type PortalMaterialDescriptor,
  type PortalMaterialExtension
} from '@one-base-template/portal-engine';

interface PortalAdminMaterialModule {
  PORTAL_ADMIN_MATERIAL?: PortalMaterialDescriptor;
  default?: PortalMaterialDescriptor;
}

const portalAdminMaterialModules = import.meta.glob<PortalAdminMaterialModule>('../*/material.ts', {
  eager: true
});

function resolvePortalAdminMaterial(
  modulePath: string,
  moduleValue: PortalAdminMaterialModule
): PortalMaterialDescriptor {
  const material = moduleValue.PORTAL_ADMIN_MATERIAL ?? moduleValue.default;
  if (!material) {
    throw new Error(`[PortalManagement] ${modulePath} 缺少 PORTAL_ADMIN_MATERIAL 导出`);
  }
  return material;
}

function collectPortalAdminMaterials(): PortalMaterialDescriptor[] {
  const materials = Object.entries(portalAdminMaterialModules)
    .map(([modulePath, moduleValue]) => resolvePortalAdminMaterial(modulePath, moduleValue))
    .sort((a, b) => a.type.localeCompare(b.type));

  const typeSet = new Set<string>();
  materials.forEach((material) => {
    if (typeSet.has(material.type)) {
      throw new Error(`[PortalManagement] 物料 type 重复: ${material.type}`);
    }
    typeSet.add(material.type);
  });

  return materials;
}

const portalAdminMaterials = collectPortalAdminMaterials();

export const PORTAL_ADMIN_MATERIAL_EXTENSIONS = [
  definePortalMaterialExtension({
    materials: portalAdminMaterials
  })
] satisfies PortalMaterialExtension[];
