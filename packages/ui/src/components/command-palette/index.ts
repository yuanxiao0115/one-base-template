export { default as CommandPalette } from './CommandPalette.vue';
export { default as CommandPaletteFooter } from './CommandPaletteFooter.vue';
export { default as CommandPaletteHistory } from './CommandPaletteHistory.vue';
export { default as CommandPaletteResult } from './CommandPaletteResult.vue';
export {
  buildCommandPaletteItemsFromMenus,
  filterCommandPaletteItems,
  normalizeCommandPaletteKeyword,
  useCommandPalette
} from './useCommandPalette';
export type {
  BuildCommandPaletteItemsOptions,
  CommandPaletteItem,
  CommandPaletteNavigatePayload,
  CommandPaletteMenuItems,
  UseCommandPaletteOptions
} from './types';
