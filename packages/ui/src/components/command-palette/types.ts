import type { AppMenuItem } from '@one-base-template/core';

export interface CommandPaletteItem {
  id: string;
  path: string;
  title: string;
  icon?: string;
  external: boolean;
  parentTitles: string[];
  searchText: string;
}

export interface BuildCommandPaletteItemsOptions {
  includeExternal?: boolean;
  excludePaths?: string[];
}

export interface UseCommandPaletteOptions {
  historyKeyBase?: string;
  maxHistory?: number;
  suggestionLimit?: number;
}

export interface CommandPaletteNavigatePayload {
  path: string;
  external: boolean;
  item: CommandPaletteItem;
}

export type CommandPaletteMenuItems = AppMenuItem[];
