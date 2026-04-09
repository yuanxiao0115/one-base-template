import { ref, type Ref } from 'vue';
import type { DialogHostCloseReason, DialogHostOpenOptions, DialogHostQueueItem } from './types';

const dialogHostQueue = ref<DialogHostQueueItem[]>([]);
let dialogHostIdSeed = 0;

function createDialogHostId() {
  dialogHostIdSeed += 1;
  return `ob-dialog-host-${dialogHostIdSeed}`;
}

function normalizeDialogHostItem(options: DialogHostOpenOptions): DialogHostQueueItem {
  const normalizedId = options.id?.trim() || createDialogHostId();

  return {
    id: normalizedId,
    title: options.title || '',
    container: options.container || 'dialog',
    width: options.width ?? 760,
    size: options.size ?? 400,
    appendToBody: options.appendToBody ?? true,
    destroyOnClose: options.destroyOnClose ?? true,
    closeOnClickModal: options.closeOnClickModal ?? false,
    closeOnPressEscape: options.closeOnPressEscape ?? true,
    showClose: options.showClose ?? true,
    className: options.className || '',
    payload: options.payload,
    showFooter: options.showFooter ?? false,
    showCancelButton: options.showCancelButton ?? true,
    showConfirmButton: options.showConfirmButton ?? true,
    cancelText: options.cancelText || '取消',
    confirmText: options.confirmText || '确定',
    loading: options.loading ?? false,
    contentRenderer: options.contentRenderer,
    headerRenderer: options.headerRenderer,
    footerRenderer: options.footerRenderer,
    component: options.component,
    componentProps: options.componentProps || {},
    beforeClose: options.beforeClose,
    beforeConfirm: options.beforeConfirm,
    onClose: options.onClose,
    onClosed: options.onClosed,
    onConfirm: options.onConfirm,
    visible: true,
    closeReason: 'cancel',
    confirming: false
  };
}

export function getDialogHostQueue(): Ref<DialogHostQueueItem[]> {
  return dialogHostQueue;
}

export function openDialog(options: DialogHostOpenOptions): string {
  const item = normalizeDialogHostItem(options);
  dialogHostQueue.value = dialogHostQueue.value.filter((dialog) => dialog.id !== item.id);
  dialogHostQueue.value.push(item);
  return item.id;
}

export function closeDialog(id: string, reason: DialogHostCloseReason = 'api') {
  const target = dialogHostQueue.value.find((item) => item.id === id);
  if (!target) {
    return;
  }
  target.closeReason = reason;
  target.visible = false;
}

export function closeAllDialogs(reason: DialogHostCloseReason = 'api') {
  dialogHostQueue.value.forEach((item) => {
    item.closeReason = reason;
    item.visible = false;
  });
}

export function removeDialog(id: string) {
  dialogHostQueue.value = dialogHostQueue.value.filter((item) => item.id !== id);
}
