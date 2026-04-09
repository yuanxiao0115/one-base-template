import type { Component, VNodeChild } from 'vue';

export type DialogHostContainer = 'dialog' | 'drawer';

export type DialogHostCloseReason = 'cancel' | 'confirm' | 'api';

export type DialogHostClassName = string | string[] | Record<string, boolean>;

export interface DialogHostActionContext {
  id: string;
  payload?: unknown;
}

export interface DialogHostBeforeCloseContext extends DialogHostActionContext {
  reason: DialogHostCloseReason;
}

export interface DialogHostRenderContext extends DialogHostActionContext {
  close: (reason?: DialogHostCloseReason) => void;
  confirm: () => Promise<void>;
}

export type DialogHostRenderer = (context: DialogHostRenderContext) => VNodeChild;

export interface DialogHostOpenOptions {
  id?: string;
  title?: string;
  container?: DialogHostContainer;
  width?: number | string;
  size?: number | string;
  appendToBody?: boolean;
  destroyOnClose?: boolean;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  showClose?: boolean;
  className?: DialogHostClassName;
  payload?: unknown;
  showFooter?: boolean;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  cancelText?: string;
  confirmText?: string;
  loading?: boolean;
  contentRenderer?: DialogHostRenderer;
  headerRenderer?: DialogHostRenderer;
  footerRenderer?: DialogHostRenderer;
  component?: Component;
  componentProps?: Record<string, unknown>;
  beforeClose?: (context: DialogHostBeforeCloseContext) => boolean | void | Promise<boolean | void>;
  beforeConfirm?: (context: DialogHostActionContext) => boolean | void | Promise<boolean | void>;
  onClose?: (context: DialogHostBeforeCloseContext) => void | Promise<void>;
  onClosed?: (context: DialogHostBeforeCloseContext) => void | Promise<void>;
  onConfirm?: (context: DialogHostActionContext) => void | Promise<void>;
}

export interface DialogHostQueueItem {
  id: string;
  title: string;
  container: DialogHostContainer;
  width: number | string;
  size: number | string;
  appendToBody: boolean;
  destroyOnClose: boolean;
  closeOnClickModal: boolean;
  closeOnPressEscape: boolean;
  showClose: boolean;
  className: DialogHostClassName;
  payload?: unknown;
  showFooter: boolean;
  showCancelButton: boolean;
  showConfirmButton: boolean;
  cancelText: string;
  confirmText: string;
  loading: boolean;
  contentRenderer?: DialogHostRenderer;
  headerRenderer?: DialogHostRenderer;
  footerRenderer?: DialogHostRenderer;
  component?: Component;
  componentProps: Record<string, unknown>;
  beforeClose?: DialogHostOpenOptions['beforeClose'];
  beforeConfirm?: DialogHostOpenOptions['beforeConfirm'];
  onClose?: DialogHostOpenOptions['onClose'];
  onClosed?: DialogHostOpenOptions['onClosed'];
  onConfirm?: DialogHostOpenOptions['onConfirm'];
  visible: boolean;
  closeReason: DialogHostCloseReason;
  confirming: boolean;
}
