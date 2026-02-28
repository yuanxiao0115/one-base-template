import type { App, VNode } from 'vue';
import { ElMessage, type MessageHandler, type MessageOptions, type MessageProps } from 'element-plus';

type MessageStyle = 'el' | 'antd';
type MessageType = Extract<MessageProps['type'], 'primary' | 'success' | 'warning' | 'info' | 'error'>;
type MessageContent = string | VNode | (() => VNode);

export interface MessageParams extends Omit<MessageOptions, 'message' | 'type' | 'customClass'> {
  /**
   * 消息类型，默认 `info`。
   */
  type?: MessageType;
  /**
   * 消息风格，`antd` 会挂载统一类名（便于后续按项目定制）；`el` 使用 Element 原生。
   */
  customClass?: MessageStyle;
  /**
   * 兼容老项目参数，Element Plus v2 当前未消费该选项。
   */
  center?: boolean;
}

export interface ObMessageFn {
  (content: MessageContent, params?: MessageParams): MessageHandler;
  primary: (content: MessageContent, params?: Omit<MessageParams, 'type'>) => MessageHandler;
  success: (content: MessageContent, params?: Omit<MessageParams, 'type'>) => MessageHandler;
  warning: (content: MessageContent, params?: Omit<MessageParams, 'type'>) => MessageHandler;
  info: (content: MessageContent, params?: Omit<MessageParams, 'type'>) => MessageHandler;
  error: (content: MessageContent, params?: Omit<MessageParams, 'type'>) => MessageHandler;
  closeAll: () => void;
}

function resolveAppendToTarget(appendTo: MessageOptions['appendTo']) {
  if (appendTo) return appendTo;
  if (typeof document !== 'undefined') return document.body;
  return undefined;
}

function showMessage(content: MessageContent, params: MessageParams = {}): MessageHandler {
  const {
    type = 'info',
    icon,
    dangerouslyUseHTMLString = false,
    customClass = 'antd',
    duration = 2000,
    showClose = false,
    offset = 20,
    appendTo,
    grouping = true,
    onClose,
    placement,
    plain,
    zIndex
  } = params;

  return ElMessage({
    message: content,
    type,
    icon,
    dangerouslyUseHTMLString,
    duration,
    showClose,
    offset,
    appendTo: resolveAppendToTarget(appendTo),
    grouping,
    placement,
    plain,
    zIndex,
    customClass: customClass === 'antd' ? 'ob-message' : '',
    onClose: () => {
      onClose?.();
    }
  });
}

function createTypedMessage(type: MessageType) {
  return (content: MessageContent, params: Omit<MessageParams, 'type'> = {}) => {
    return showMessage(content, { ...params, type });
  };
}

export const closeAllMessage = (): void => {
  ElMessage.closeAll();
};

export const message: ObMessageFn = Object.assign(showMessage, {
  primary: createTypedMessage('primary'),
  success: createTypedMessage('success'),
  warning: createTypedMessage('warning'),
  info: createTypedMessage('info'),
  error: createTypedMessage('error'),
  closeAll: closeAllMessage
});

export function registerMessageUtils(app: App) {
  app.config.globalProperties.$obMessage = message;
  app.config.globalProperties.$closeAllMessage = closeAllMessage;
}
