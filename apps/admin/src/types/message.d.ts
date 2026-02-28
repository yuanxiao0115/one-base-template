import type { closeAllMessage, ObMessageFn } from '@/utils/message';

declare module 'vue' {
  interface ComponentCustomProperties {
    /**
     * 全局消息提示工具（兼容老项目 message.ts 调用风格）。
     */
    $obMessage: ObMessageFn;
    /**
     * 关闭全部消息提示。
     */
    $closeAllMessage: typeof closeAllMessage;
  }
}

export {};

