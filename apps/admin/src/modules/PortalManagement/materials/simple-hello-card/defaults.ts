import type { PortalMaterialConfig } from '@one-base-template/portal-engine';

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

export const PORTAL_SIMPLE_HELLO_CARD_DEFAULTS: {
  content: { basic: PortalSimpleHelloCardBasicConfig };
  style: { card: PortalSimpleHelloCardStyleConfig };
} = {
  content: {
    basic: {
      title: '简易欢迎卡片',
      description: '这是一个最小注册示例物料，可直接拖拽到画布查看效果。',
      showBadge: true,
      badgeText: 'DEMO'
    }
  },
  style: {
    card: {
      backgroundColor: '#eff6ff',
      titleColor: '#1e293b',
      descriptionColor: '#475569',
      badgeBackgroundColor: '#2563eb',
      badgeTextColor: '#ffffff',
      borderColor: '#cbd5e1',
      borderRadius: 8,
      paddingY: 16,
      paddingX: 16
    }
  }
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

export function mergePortalSimpleHelloCardBasicConfig(
  value?: Partial<PortalSimpleHelloCardBasicConfig> | null
): PortalSimpleHelloCardBasicConfig {
  const fallback = PORTAL_SIMPLE_HELLO_CARD_DEFAULTS.content.basic;
  const merged = {
    ...fallback,
    ...value
  };
  return {
    title: normalizeText(merged.title, fallback.title),
    description: normalizeText(merged.description, fallback.description),
    showBadge: merged.showBadge === true,
    badgeText: normalizeText(merged.badgeText, fallback.badgeText)
  };
}

export function mergePortalSimpleHelloCardStyleConfig(
  value?: Partial<PortalSimpleHelloCardStyleConfig> | null
): PortalSimpleHelloCardStyleConfig {
  const fallback = PORTAL_SIMPLE_HELLO_CARD_DEFAULTS.style.card;
  const merged = {
    ...fallback,
    ...value
  };
  return {
    backgroundColor: normalizeText(merged.backgroundColor, fallback.backgroundColor),
    titleColor: normalizeText(merged.titleColor, fallback.titleColor),
    descriptionColor: normalizeText(merged.descriptionColor, fallback.descriptionColor),
    badgeBackgroundColor: normalizeText(merged.badgeBackgroundColor, fallback.badgeBackgroundColor),
    badgeTextColor: normalizeText(merged.badgeTextColor, fallback.badgeTextColor),
    borderColor: normalizeText(merged.borderColor, fallback.borderColor),
    borderRadius: normalizeNumber(merged.borderRadius, fallback.borderRadius, 0, 40),
    paddingY: normalizeNumber(merged.paddingY, fallback.paddingY, 0, 48),
    paddingX: normalizeNumber(merged.paddingX, fallback.paddingX, 0, 48)
  };
}

export function createPortalSimpleHelloCardMaterialConfig(): PortalMaterialConfig {
  const defaults = PORTAL_SIMPLE_HELLO_CARD_DEFAULTS;
  return {
    index: {
      name: 'portal-simple-hello-card-index'
    },
    content: {
      name: 'portal-simple-hello-card-content',
      basic: { ...defaults.content.basic }
    },
    style: {
      name: 'portal-simple-hello-card-style',
      card: { ...defaults.style.card }
    }
  };
}
