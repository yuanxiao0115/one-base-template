import type { ComponentConfig } from './utils/component-factory';

export type PortalMaterialItem = ComponentConfig;

export interface PortalMaterialCategory {
  id: string;
  name?: string;
  cmptTypeName?: string;
  title?: string;
  cmptList: PortalMaterialItem[];
  [key: string]: unknown;
}

export interface PortalMaterialCategoryInput {
  id: string;
  name?: string;
  cmptTypeName?: string;
  title?: string;
}

export type PortalMaterialConflictStrategy = 'reject' | 'replace';

export interface RegisterPortalMaterialOptions {
  category: PortalMaterialCategoryInput;
  strategy?: PortalMaterialConflictStrategy;
  index?: number;
}

export interface UnregisterPortalMaterialOptions {
  categoryId?: string;
  id?: string;
  type?: string;
}

export interface PortalMaterialRegistry {
  categories: PortalMaterialCategory[];
}

export interface PortalMaterialRegistryController extends PortalMaterialRegistry {
  registerPortalMaterial: (
    material: PortalMaterialItem,
    options: RegisterPortalMaterialOptions
  ) => void;
  unregisterPortalMaterial: (options: UnregisterPortalMaterialOptions) => boolean;
}
