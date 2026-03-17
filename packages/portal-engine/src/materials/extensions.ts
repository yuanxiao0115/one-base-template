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
  materials: PortalMaterialDescriptor[];
}
