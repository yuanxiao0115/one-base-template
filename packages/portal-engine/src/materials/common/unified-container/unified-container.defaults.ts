import type {
  UnifiedContainerBorderStyle,
  UnifiedContainerContentConfig,
  UnifiedContainerSubtitleLayout,
  UnifiedContainerStyleConfig,
} from './unified-container.types';

const BORDER_STYLE_SET = new Set<UnifiedContainerBorderStyle>(['none', 'solid', 'dashed', 'dotted']);
const SUBTITLE_LAYOUT_SET = new Set<UnifiedContainerSubtitleLayout>(['below', 'inline']);

const UNIFIED_CONTAINER_STYLE_NUMERIC_KEYS = [
  'borderWidth',
  'borderRadius',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'headerPaddingTop',
  'headerPaddingRight',
  'headerPaddingBottom',
  'headerPaddingLeft',
  'contentTopGap',
  'titleFontSize',
  'subtitleFontSize',
  'linkFontSize',
] as const satisfies readonly (keyof UnifiedContainerStyleConfig)[];

export const DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG: UnifiedContainerContentConfig = {
  showTitle: true,
  title: '模块标题',
  subtitle: '',
  subtitleLayout: 'below',
  icon: '',
  showExternalLink: false,
  externalLinkText: '更多',
  externalLinkUrl: '',
  openExternalInNewTab: true,
};

export const DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG: UnifiedContainerStyleConfig = {
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb',
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: 12,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  boxShadow: 'none',
  headerBackgroundColor: 'transparent',
  headerDividerColor: 'rgba(15, 23, 42, 0.08)',
  headerPaddingTop: 0,
  headerPaddingRight: 0,
  headerPaddingBottom: 10,
  headerPaddingLeft: 0,
  contentTopGap: 12,
  titleColor: '#0f172a',
  titleFontSize: 18,
  subtitleColor: '#64748b',
  subtitleFontSize: 13,
  iconColor: '#2563eb',
  linkColor: '#2563eb',
  linkFontSize: 13,
};

function toSafeString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function toSafeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function toSafeNonNegativeNumber(value: unknown, fallback: number): number {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return fallback;
  }
  return numberValue < 0 ? 0 : numberValue;
}

function toSafeBorderStyle(value: unknown, fallback: UnifiedContainerBorderStyle): UnifiedContainerBorderStyle {
  return typeof value === 'string' && BORDER_STYLE_SET.has(value as UnifiedContainerBorderStyle)
    ? (value as UnifiedContainerBorderStyle)
    : fallback;
}

function toSafeSubtitleLayout(value: unknown, fallback: UnifiedContainerSubtitleLayout): UnifiedContainerSubtitleLayout {
  return typeof value === 'string' && SUBTITLE_LAYOUT_SET.has(value as UnifiedContainerSubtitleLayout)
    ? (value as UnifiedContainerSubtitleLayout)
    : fallback;
}

export function createDefaultUnifiedContainerContentConfig(): UnifiedContainerContentConfig {
  return { ...DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG };
}

export function createDefaultUnifiedContainerStyleConfig(): UnifiedContainerStyleConfig {
  return { ...DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG };
}

export function mergeUnifiedContainerContentConfig(
  value?: Partial<UnifiedContainerContentConfig> | null
): UnifiedContainerContentConfig {
  const merged = {
    ...DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG,
    ...(value ?? {}),
  } satisfies UnifiedContainerContentConfig;

  return {
    showTitle: toSafeBoolean(merged.showTitle, DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG.showTitle),
    title: toSafeString(merged.title, DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG.title),
    subtitle: toSafeString(merged.subtitle, DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG.subtitle),
    subtitleLayout: toSafeSubtitleLayout(
      merged.subtitleLayout,
      DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG.subtitleLayout
    ),
    icon: toSafeString(merged.icon, DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG.icon),
    showExternalLink: toSafeBoolean(
      merged.showExternalLink,
      DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG.showExternalLink
    ),
    externalLinkText: toSafeString(merged.externalLinkText, DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG.externalLinkText),
    externalLinkUrl: toSafeString(merged.externalLinkUrl, DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG.externalLinkUrl),
    openExternalInNewTab: toSafeBoolean(
      merged.openExternalInNewTab,
      DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG.openExternalInNewTab
    ),
  };
}

export function mergeUnifiedContainerStyleConfig(
  value?: Partial<UnifiedContainerStyleConfig> | null
): UnifiedContainerStyleConfig {
  const merged = {
    ...DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG,
    ...(value ?? {}),
  } satisfies UnifiedContainerStyleConfig;

  const normalized: UnifiedContainerStyleConfig = {
    ...merged,
    backgroundColor: toSafeString(merged.backgroundColor, DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG.backgroundColor),
    borderColor: toSafeString(merged.borderColor, DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG.borderColor),
    borderStyle: toSafeBorderStyle(merged.borderStyle, DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG.borderStyle),
    boxShadow: toSafeString(merged.boxShadow, DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG.boxShadow),
    headerBackgroundColor: toSafeString(
      merged.headerBackgroundColor,
      DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG.headerBackgroundColor
    ),
    headerDividerColor: toSafeString(merged.headerDividerColor, DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG.headerDividerColor),
    titleColor: toSafeString(merged.titleColor, DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG.titleColor),
    subtitleColor: toSafeString(merged.subtitleColor, DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG.subtitleColor),
    iconColor: toSafeString(merged.iconColor, DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG.iconColor),
    linkColor: toSafeString(merged.linkColor, DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG.linkColor),
  };

  UNIFIED_CONTAINER_STYLE_NUMERIC_KEYS.forEach((key) => {
    normalized[key] = toSafeNonNegativeNumber(merged[key], DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG[key]);
  });

  if (normalized.borderStyle === 'none') {
    normalized.borderWidth = 0;
  }

  return normalized;
}
