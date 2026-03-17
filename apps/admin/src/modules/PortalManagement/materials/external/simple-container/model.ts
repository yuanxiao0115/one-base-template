import type {
  PortalLayoutItem,
  UnifiedContainerContentConfigModel,
  UnifiedContainerStyleConfigModel
} from '@one-base-template/portal-engine';

export const ADMIN_SIMPLE_CONTAINER_MATERIAL_ID = 'admin-simple-container';
export const ADMIN_SIMPLE_CONTAINER_MATERIAL_TYPE = 'admin-simple-container';

export const ADMIN_SIMPLE_CONTAINER_INDEX_NAME = 'admin-simple-container-index';
export const ADMIN_SIMPLE_CONTAINER_CONTENT_NAME = 'admin-simple-container-content';
export const ADMIN_SIMPLE_CONTAINER_STYLE_NAME = 'admin-simple-container-style';

export const ADMIN_SIMPLE_CONTAINER_TAB_ID = 'admin-simple-container-tab-1';

export interface AdminSimpleContainerTab {
  id: string;
  title: string;
  layoutItems: PortalLayoutItem[];
}

export interface AdminSimpleContainerBodyStyle {
  backgroundColor: string;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

export const DEFAULT_ADMIN_SIMPLE_CONTAINER_BODY_STYLE: AdminSimpleContainerBodyStyle = {
  backgroundColor: 'transparent',
  borderStyle: 'none',
  borderColor: '#dbe3f0',
  borderWidth: 0,
  borderRadius: 8,
  paddingTop: 8,
  paddingRight: 8,
  paddingBottom: 8,
  paddingLeft: 8
};

export const adminSimpleContainerConfig = {
  index: {
    name: ADMIN_SIMPLE_CONTAINER_INDEX_NAME
  },
  content: {
    name: ADMIN_SIMPLE_CONTAINER_CONTENT_NAME,
    container: {
      showTitle: true,
      title: '容器组件',
      subtitle: '用于承载多个门户组件',
      icon: '',
      showExternalLink: false,
      externalLinkText: '更多',
      externalLinkUrl: '',
      openExternalInNewTab: true
    },
    tabs: [
      {
        id: ADMIN_SIMPLE_CONTAINER_TAB_ID,
        title: '容器内容',
        layoutItems: []
      }
    ],
    activeTabId: ADMIN_SIMPLE_CONTAINER_TAB_ID
  },
  style: {
    name: ADMIN_SIMPLE_CONTAINER_STYLE_NAME,
    container: {
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
      linkFontSize: 13
    },
    body: DEFAULT_ADMIN_SIMPLE_CONTAINER_BODY_STYLE
  }
} as const;

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function normalizeTab(raw: unknown, fallbackId: string): AdminSimpleContainerTab | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const id =
    typeof record.id === 'string' && record.id.trim().length > 0 ? record.id.trim() : fallbackId;

  const title =
    typeof record.title === 'string' && record.title.trim().length > 0
      ? record.title.trim()
      : '容器内容';

  return {
    id,
    title,
    layoutItems: Array.isArray(record.layoutItems) ? (record.layoutItems as PortalLayoutItem[]) : []
  };
}

export function ensureAdminSimpleContainerTabs(value: unknown): AdminSimpleContainerTab[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [
      {
        id: ADMIN_SIMPLE_CONTAINER_TAB_ID,
        title: '容器内容',
        layoutItems: []
      }
    ];
  }

  const first = normalizeTab(value[0], ADMIN_SIMPLE_CONTAINER_TAB_ID);
  if (!first) {
    return [
      {
        id: ADMIN_SIMPLE_CONTAINER_TAB_ID,
        title: '容器内容',
        layoutItems: []
      }
    ];
  }

  return [first];
}

export function resolveAdminSimpleContainerActiveTabId(
  tabs: AdminSimpleContainerTab[],
  rawActiveTabId: unknown
): string {
  const activeTabId = typeof rawActiveTabId === 'string' ? rawActiveTabId.trim() : '';
  if (activeTabId && tabs.some((tab) => tab.id === activeTabId)) {
    return activeTabId;
  }

  return tabs[0]?.id || ADMIN_SIMPLE_CONTAINER_TAB_ID;
}

export function mergeAdminSimpleContainerBodyStyle(value: unknown): AdminSimpleContainerBodyStyle {
  const record = toRecord(value);

  const borderStyle =
    record.borderStyle === 'solid' ||
    record.borderStyle === 'dashed' ||
    record.borderStyle === 'dotted' ||
    record.borderStyle === 'none'
      ? record.borderStyle
      : DEFAULT_ADMIN_SIMPLE_CONTAINER_BODY_STYLE.borderStyle;

  const numberOrDefault = (raw: unknown, fallback: number) => {
    const num = Number(raw);
    return Number.isFinite(num) ? num : fallback;
  };

  return {
    backgroundColor:
      typeof record.backgroundColor === 'string' && record.backgroundColor
        ? record.backgroundColor
        : DEFAULT_ADMIN_SIMPLE_CONTAINER_BODY_STYLE.backgroundColor,
    borderStyle,
    borderColor:
      typeof record.borderColor === 'string' && record.borderColor
        ? record.borderColor
        : DEFAULT_ADMIN_SIMPLE_CONTAINER_BODY_STYLE.borderColor,
    borderWidth: Math.max(0, numberOrDefault(record.borderWidth, 0)),
    borderRadius: Math.max(
      0,
      numberOrDefault(record.borderRadius, DEFAULT_ADMIN_SIMPLE_CONTAINER_BODY_STYLE.borderRadius)
    ),
    paddingTop: Math.max(
      0,
      numberOrDefault(record.paddingTop, DEFAULT_ADMIN_SIMPLE_CONTAINER_BODY_STYLE.paddingTop)
    ),
    paddingRight: Math.max(
      0,
      numberOrDefault(record.paddingRight, DEFAULT_ADMIN_SIMPLE_CONTAINER_BODY_STYLE.paddingRight)
    ),
    paddingBottom: Math.max(
      0,
      numberOrDefault(record.paddingBottom, DEFAULT_ADMIN_SIMPLE_CONTAINER_BODY_STYLE.paddingBottom)
    ),
    paddingLeft: Math.max(
      0,
      numberOrDefault(record.paddingLeft, DEFAULT_ADMIN_SIMPLE_CONTAINER_BODY_STYLE.paddingLeft)
    )
  };
}

export interface AdminSimpleContainerSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    tabs?: unknown;
    activeTabId?: string;
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    body?: Partial<AdminSimpleContainerBodyStyle>;
  };
}
