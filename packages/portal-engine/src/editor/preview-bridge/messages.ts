export const PORTAL_PREVIEW_MESSAGE_SHELL_DETAILS = 'preview-shell-details';
export const PORTAL_PREVIEW_MESSAGE_VIEWPORT = 'preview-viewport';
export const PORTAL_PREVIEW_MESSAGE_PAGE_RUNTIME = 'preview-page-runtime';
export const PORTAL_PREVIEW_MESSAGE_PAGE_READY = 'preview-page-ready';

export interface PortalPreviewShellDetailsData {
  templateId: string;
  tabId: string;
  details: string;
}

export interface PortalPreviewViewportData {
  templateId: string;
  tabId: string;
  width: number;
  height: number;
}

export interface PortalPreviewRuntimeData {
  templateId: string;
  tabId: string;
  settings: unknown;
  component: unknown[];
}

export interface PortalPreviewReadyData {
  tabId: string;
  templateId: string;
}

export interface PortalPreviewMessage<TType extends string, TData> {
  type: TType;
  data: TData;
}

export type PortalPreviewShellDetailsMessage = PortalPreviewMessage<
  typeof PORTAL_PREVIEW_MESSAGE_SHELL_DETAILS,
  PortalPreviewShellDetailsData
>;

export type PortalPreviewViewportMessage = PortalPreviewMessage<
  typeof PORTAL_PREVIEW_MESSAGE_VIEWPORT,
  PortalPreviewViewportData
>;

export type PortalPreviewRuntimeMessage = PortalPreviewMessage<
  typeof PORTAL_PREVIEW_MESSAGE_PAGE_RUNTIME,
  PortalPreviewRuntimeData
>;

export type PortalPreviewReadyMessage = PortalPreviewMessage<
  typeof PORTAL_PREVIEW_MESSAGE_PAGE_READY,
  PortalPreviewReadyData
>;

function normalizeString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

function toObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  return value as Record<string, unknown>;
}

export function buildPreviewShellDetailsMessage(data: PortalPreviewShellDetailsData): PortalPreviewShellDetailsMessage {
  return {
    type: PORTAL_PREVIEW_MESSAGE_SHELL_DETAILS,
    data,
  };
}

export function buildPreviewViewportMessage(data: PortalPreviewViewportData): PortalPreviewViewportMessage {
  return {
    type: PORTAL_PREVIEW_MESSAGE_VIEWPORT,
    data,
  };
}

export function buildPreviewRuntimeMessage(data: PortalPreviewRuntimeData): PortalPreviewRuntimeMessage {
  return {
    type: PORTAL_PREVIEW_MESSAGE_PAGE_RUNTIME,
    data,
  };
}

export function isPreviewPageReadyMessage(input: unknown): {
  matched: boolean;
  tabId: string;
  templateId: string;
} {
  const messageLike = toObject(input);
  if (!messageLike) {
    return {
      matched: false,
      tabId: '',
      templateId: '',
    };
  }

  if (messageLike.type !== PORTAL_PREVIEW_MESSAGE_PAGE_READY) {
    return {
      matched: false,
      tabId: '',
      templateId: '',
    };
  }

  const dataLike = toObject(messageLike.data);
  if (!dataLike) {
    return {
      matched: false,
      tabId: '',
      templateId: '',
    };
  }

  return {
    matched: true,
    tabId: normalizeString(dataLike.tabId),
    templateId: normalizeString(dataLike.templateId),
  };
}
