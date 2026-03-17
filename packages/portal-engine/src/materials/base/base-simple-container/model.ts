import type {
  UnifiedContainerContentConfigModel,
  UnifiedContainerStyleConfigModel
} from '../../common/unified-container';

export const BASE_SIMPLE_CONTAINER_INDEX_NAME = 'base-simple-container-index';
export const BASE_SIMPLE_CONTAINER_CONTENT_NAME = 'base-simple-container-content';
export const BASE_SIMPLE_CONTAINER_STYLE_NAME = 'base-simple-container-style';

export const BASE_SIMPLE_CONTAINER_TAB_ID = 'simple-container-tab-1';

export interface BaseSimpleContainerTab<TLayoutItem = unknown> {
  id: string;
  title: string;
  layoutItems: TLayoutItem[];
}

export interface BaseSimpleContainerBodyStyle {
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

export interface BaseSimpleContainerSchema {
  content?: {
    name?: string;
    container?: Partial<UnifiedContainerContentConfigModel>;
    tabs?: unknown;
    activeTabId?: string;
  };
  style?: {
    name?: string;
    container?: Partial<UnifiedContainerStyleConfigModel>;
    body?: Partial<BaseSimpleContainerBodyStyle>;
  };
}

export const DEFAULT_BASE_SIMPLE_CONTAINER_BODY_STYLE: BaseSimpleContainerBodyStyle = {
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

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function normalizeSingleTab<TLayoutItem = unknown>(
  raw: unknown,
  fallbackId: string
): BaseSimpleContainerTab<TLayoutItem> | null {
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
    layoutItems: Array.isArray(record.layoutItems) ? (record.layoutItems as TLayoutItem[]) : []
  };
}

export function ensureBaseSimpleContainerTabs<TLayoutItem = unknown>(
  value: unknown
): BaseSimpleContainerTab<TLayoutItem>[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [
      {
        id: BASE_SIMPLE_CONTAINER_TAB_ID,
        title: '容器内容',
        layoutItems: []
      }
    ];
  }

  const first = normalizeSingleTab<TLayoutItem>(value[0], BASE_SIMPLE_CONTAINER_TAB_ID);
  if (!first) {
    return [
      {
        id: BASE_SIMPLE_CONTAINER_TAB_ID,
        title: '容器内容',
        layoutItems: []
      }
    ];
  }

  return [first];
}

export function resolveBaseSimpleContainerActiveTabId<TLayoutItem = unknown>(
  tabs: BaseSimpleContainerTab<TLayoutItem>[],
  rawActiveTabId: unknown
): string {
  const activeTabId = typeof rawActiveTabId === 'string' ? rawActiveTabId.trim() : '';
  if (activeTabId && tabs.some((tab) => tab.id === activeTabId)) {
    return activeTabId;
  }

  return tabs[0]?.id || BASE_SIMPLE_CONTAINER_TAB_ID;
}

export function mergeBaseSimpleContainerBodyStyle(value: unknown): BaseSimpleContainerBodyStyle {
  const record = toRecord(value);

  const borderStyle =
    record.borderStyle === 'solid' ||
    record.borderStyle === 'dashed' ||
    record.borderStyle === 'dotted' ||
    record.borderStyle === 'none'
      ? record.borderStyle
      : DEFAULT_BASE_SIMPLE_CONTAINER_BODY_STYLE.borderStyle;

  const toNumberOrDefault = (raw: unknown, fallback: number) => {
    const num = Number(raw);
    return Number.isFinite(num) ? num : fallback;
  };

  return {
    backgroundColor:
      typeof record.backgroundColor === 'string' && record.backgroundColor
        ? record.backgroundColor
        : DEFAULT_BASE_SIMPLE_CONTAINER_BODY_STYLE.backgroundColor,
    borderStyle,
    borderColor:
      typeof record.borderColor === 'string' && record.borderColor
        ? record.borderColor
        : DEFAULT_BASE_SIMPLE_CONTAINER_BODY_STYLE.borderColor,
    borderWidth: Math.max(0, toNumberOrDefault(record.borderWidth, 0)),
    borderRadius: Math.max(
      0,
      toNumberOrDefault(record.borderRadius, DEFAULT_BASE_SIMPLE_CONTAINER_BODY_STYLE.borderRadius)
    ),
    paddingTop: Math.max(
      0,
      toNumberOrDefault(record.paddingTop, DEFAULT_BASE_SIMPLE_CONTAINER_BODY_STYLE.paddingTop)
    ),
    paddingRight: Math.max(
      0,
      toNumberOrDefault(record.paddingRight, DEFAULT_BASE_SIMPLE_CONTAINER_BODY_STYLE.paddingRight)
    ),
    paddingBottom: Math.max(
      0,
      toNumberOrDefault(
        record.paddingBottom,
        DEFAULT_BASE_SIMPLE_CONTAINER_BODY_STYLE.paddingBottom
      )
    ),
    paddingLeft: Math.max(
      0,
      toNumberOrDefault(record.paddingLeft, DEFAULT_BASE_SIMPLE_CONTAINER_BODY_STYLE.paddingLeft)
    )
  };
}

export function createBaseSimpleContainerChildItemId(): string {
  return `simple-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
