import type { PortalMaterialConfig } from '@one-base-template/portal-engine';

export const PORTAL_SIMPLE_HELLO_CARD_DEFAULTS = {
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
} as const;

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

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

export function mergePortalSimpleHelloCardBasicConfig(value?: unknown) {
  const fallback = PORTAL_SIMPLE_HELLO_CARD_DEFAULTS.content.basic;
  const input = toRecord(value);
  const merged = {
    ...fallback,
    ...input
  };
  return {
    title: normalizeText(merged.title, fallback.title),
    description: normalizeText(merged.description, fallback.description),
    showBadge: merged.showBadge === true,
    badgeText: normalizeText(merged.badgeText, fallback.badgeText)
  };
}

export function mergePortalSimpleHelloCardStyleConfig(value?: unknown) {
  const fallback = PORTAL_SIMPLE_HELLO_CARD_DEFAULTS.style.card;
  const input = toRecord(value);
  const merged = {
    ...fallback,
    ...input
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
