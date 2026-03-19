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

function mergeWithDefaults<T extends Record<string, unknown>>(defaults: T, value: unknown): T {
  return {
    ...defaults,
    ...toRecord(value)
  };
}

export function mergePortalSimpleHelloCardBasicConfig(value?: unknown) {
  return mergeWithDefaults(PORTAL_SIMPLE_HELLO_CARD_DEFAULTS.content.basic, value);
}

export function mergePortalSimpleHelloCardStyleConfig(value?: unknown) {
  return mergeWithDefaults(PORTAL_SIMPLE_HELLO_CARD_DEFAULTS.style.card, value);
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
