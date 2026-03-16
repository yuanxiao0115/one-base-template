export { default as MenuIconSelectorInput } from './MenuIconSelectorInput.vue';
export { default as UnifiedContainerDisplay } from './UnifiedContainerDisplay.vue';
export { default as UnifiedContainerContentConfig } from './UnifiedContainerContentConfig.vue';
export { default as UnifiedContainerStyleConfig } from './UnifiedContainerStyleConfig.vue';

export {
  DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG,
  DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG,
  createDefaultUnifiedContainerContentConfig,
  createDefaultUnifiedContainerStyleConfig,
  mergeUnifiedContainerContentConfig,
  mergeUnifiedContainerStyleConfig
} from './unified-container.defaults';

export type {
  UnifiedContainerBorderStyle,
  UnifiedContainerContentConfig as UnifiedContainerContentConfigModel,
  UnifiedContainerSubtitleLayout,
  UnifiedContainerStyleConfig as UnifiedContainerStyleConfigModel
} from './unified-container.types';
