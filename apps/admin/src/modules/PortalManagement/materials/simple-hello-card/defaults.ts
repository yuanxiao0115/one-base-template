import type {
  PortalMaterialCategoryInput,
  PortalMaterialConfig
} from '@one-base-template/portal-engine';

export const PORTAL_SIMPLE_HELLO_CARD_MATERIAL_ID = 'portal-simple-hello-card';
export const PORTAL_SIMPLE_HELLO_CARD_MATERIAL_TYPE = 'portal-simple-hello-card';

export const PORTAL_SIMPLE_HELLO_CARD_INDEX_NAME = 'portal-simple-hello-card-index';
export const PORTAL_SIMPLE_HELLO_CARD_CONTENT_NAME = 'portal-simple-hello-card-content';
export const PORTAL_SIMPLE_HELLO_CARD_STYLE_NAME = 'portal-simple-hello-card-style';

export const PORTAL_SIMPLE_HELLO_CARD_CATEGORY: PortalMaterialCategoryInput = {
  id: 'portal-admin',
  title: '管理端示例',
  name: '管理端示例',
  cmptTypeName: '管理端示例'
};

export interface PortalSimpleHelloCardBasicConfig {
  title: string;
  description: string;
  showBadge: boolean;
  badgeText: string;
}

export interface PortalSimpleHelloCardStyleConfig {
  backgroundColor: string;
  titleColor: string;
  descriptionColor: string;
  badgeBackgroundColor: string;
  badgeTextColor: string;
  borderColor: string;
  borderRadius: number;
  paddingY: number;
  paddingX: number;
}

export interface PortalSimpleHelloCardSchema {
  content?: {
    basic?: Partial<PortalSimpleHelloCardBasicConfig>;
  };
  style?: {
    card?: Partial<PortalSimpleHelloCardStyleConfig>;
  };
}

const DEFAULT_PORTAL_SIMPLE_HELLO_CARD_BASIC_CONFIG: PortalSimpleHelloCardBasicConfig = {
  title: '简易欢迎卡片',
  description: '这是一个最小注册示例物料，可直接拖拽到画布查看效果。',
  showBadge: true,
  badgeText: 'DEMO'
};

const DEFAULT_PORTAL_SIMPLE_HELLO_CARD_STYLE_CONFIG: PortalSimpleHelloCardStyleConfig = {
  backgroundColor: '#eff6ff',
  titleColor: '#1e293b',
  descriptionColor: '#475569',
  badgeBackgroundColor: '#2563eb',
  badgeTextColor: '#ffffff',
  borderColor: '#cbd5e1',
  borderRadius: 8,
  paddingY: 16,
  paddingX: 16
};

function normalizeText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeNumber(value: unknown, fallback: number, min: number, max: number): number {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, normalized));
}

export function createDefaultPortalSimpleHelloCardBasicConfig(): PortalSimpleHelloCardBasicConfig {
  return { ...DEFAULT_PORTAL_SIMPLE_HELLO_CARD_BASIC_CONFIG };
}

export function createDefaultPortalSimpleHelloCardStyleConfig(): PortalSimpleHelloCardStyleConfig {
  return { ...DEFAULT_PORTAL_SIMPLE_HELLO_CARD_STYLE_CONFIG };
}

export function mergePortalSimpleHelloCardBasicConfig(
  value?: Partial<PortalSimpleHelloCardBasicConfig> | null
): PortalSimpleHelloCardBasicConfig {
  const merged = {
    ...DEFAULT_PORTAL_SIMPLE_HELLO_CARD_BASIC_CONFIG,
    ...value
  };
  return {
    title: normalizeText(merged.title, DEFAULT_PORTAL_SIMPLE_HELLO_CARD_BASIC_CONFIG.title),
    description: normalizeText(
      merged.description,
      DEFAULT_PORTAL_SIMPLE_HELLO_CARD_BASIC_CONFIG.description
    ),
    showBadge: merged.showBadge === true,
    badgeText: normalizeText(
      merged.badgeText,
      DEFAULT_PORTAL_SIMPLE_HELLO_CARD_BASIC_CONFIG.badgeText
    )
  };
}

export function mergePortalSimpleHelloCardStyleConfig(
  value?: Partial<PortalSimpleHelloCardStyleConfig> | null
): PortalSimpleHelloCardStyleConfig {
  const merged = {
    ...DEFAULT_PORTAL_SIMPLE_HELLO_CARD_STYLE_CONFIG,
    ...value
  };
  return {
    backgroundColor: normalizeText(
      merged.backgroundColor,
      DEFAULT_PORTAL_SIMPLE_HELLO_CARD_STYLE_CONFIG.backgroundColor
    ),
    titleColor: normalizeText(
      merged.titleColor,
      DEFAULT_PORTAL_SIMPLE_HELLO_CARD_STYLE_CONFIG.titleColor
    ),
    descriptionColor: normalizeText(
      merged.descriptionColor,
      DEFAULT_PORTAL_SIMPLE_HELLO_CARD_STYLE_CONFIG.descriptionColor
    ),
    badgeBackgroundColor: normalizeText(
      merged.badgeBackgroundColor,
      DEFAULT_PORTAL_SIMPLE_HELLO_CARD_STYLE_CONFIG.badgeBackgroundColor
    ),
    badgeTextColor: normalizeText(
      merged.badgeTextColor,
      DEFAULT_PORTAL_SIMPLE_HELLO_CARD_STYLE_CONFIG.badgeTextColor
    ),
    borderColor: normalizeText(
      merged.borderColor,
      DEFAULT_PORTAL_SIMPLE_HELLO_CARD_STYLE_CONFIG.borderColor
    ),
    borderRadius: normalizeNumber(
      merged.borderRadius,
      DEFAULT_PORTAL_SIMPLE_HELLO_CARD_STYLE_CONFIG.borderRadius,
      0,
      40
    ),
    paddingY: normalizeNumber(
      merged.paddingY,
      DEFAULT_PORTAL_SIMPLE_HELLO_CARD_STYLE_CONFIG.paddingY,
      0,
      48
    ),
    paddingX: normalizeNumber(
      merged.paddingX,
      DEFAULT_PORTAL_SIMPLE_HELLO_CARD_STYLE_CONFIG.paddingX,
      0,
      48
    )
  };
}

export function createPortalSimpleHelloCardMaterialConfig(): PortalMaterialConfig {
  return {
    index: {
      name: PORTAL_SIMPLE_HELLO_CARD_INDEX_NAME
    },
    content: {
      name: PORTAL_SIMPLE_HELLO_CARD_CONTENT_NAME,
      basic: createDefaultPortalSimpleHelloCardBasicConfig()
    },
    style: {
      name: PORTAL_SIMPLE_HELLO_CARD_STYLE_NAME,
      card: createDefaultPortalSimpleHelloCardStyleConfig()
    }
  };
}
