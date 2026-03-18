import type { Component } from 'vue';

import type { PortalMaterialCategoryInput } from '../registry/materials-registry.types';

interface PortalMaterialConfigSection {
  name?: string;
  [key: string]: unknown;
}

export interface PortalMaterialConfig {
  index?: PortalMaterialConfigSection;
  content?: PortalMaterialConfigSection;
  style?: PortalMaterialConfigSection;
  [key: string]: unknown;
}

export interface PortalMaterialSectionAliases {
  index?: string[];
  content?: string[];
  style?: string[];
}

export interface PortalMaterialComponents {
  index: Component;
  content?: Component;
  style?: Component;
}

export interface PortalMaterialDescriptor {
  id: string;
  type: string;
  name: string;
  icon: string;
  width?: number;
  height?: number;
  config: PortalMaterialConfig;
  components: PortalMaterialComponents;
  category?: PortalMaterialCategoryInput;
  aliases?: PortalMaterialSectionAliases;
}

export interface PortalMaterialExtension {
  category?: PortalMaterialCategoryInput;
  materials?: PortalMaterialDescriptor[];
}

export function definePortalMaterialCategory<const T extends PortalMaterialCategoryInput>(
  category: T
): T {
  return category;
}

export function definePortalMaterial<const T extends PortalMaterialDescriptor>(material: T): T {
  return material;
}

type DefinedPortalMaterialExtension<T extends PortalMaterialExtension> = Omit<T, 'materials'> &
  PortalMaterialExtension & {
    materials: T['materials'] extends PortalMaterialDescriptor[]
      ? T['materials']
      : PortalMaterialDescriptor[];
  };

export function definePortalMaterialExtension<const T extends PortalMaterialExtension>(
  extension: T
): DefinedPortalMaterialExtension<T> {
  return {
    ...extension,
    materials: extension.materials ? [...extension.materials] : []
  } as DefinedPortalMaterialExtension<T>;
}
