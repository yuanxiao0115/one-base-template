import { describe, expect, it, vi } from 'vitest';

import {
  PORTAL_PREVIEW_MESSAGE_PAGE_RUNTIME,
  PORTAL_PREVIEW_MESSAGE_PAGE_READY,
  PORTAL_PREVIEW_MESSAGE_SHELL_DETAILS,
  PORTAL_PREVIEW_MESSAGE_VIEWPORT,
  isPreviewPageReadyMessage,
} from './messages';
import {
  sendPreviewPageRuntimeToWindow,
  sendPreviewRuntime,
  sendPreviewShellDetails,
  sendPreviewViewport,
  type PortalPreviewFrameTarget,
} from './sender';

function createFrameTarget() {
  const postMessageToFrame = vi.fn().mockReturnValue(true);
  return {
    target: {
      postMessageToFrame,
    } satisfies PortalPreviewFrameTarget,
    postMessageToFrame,
  };
}

describe('preview bridge sender', () => {
  it('应通过 frame target 发送壳层配置消息', () => {
    const { target, postMessageToFrame } = createFrameTarget();

    const ok = sendPreviewShellDetails(target, {
      templateId: 'tpl-1',
      tabId: 'tab-1',
      details: '{"shell":{}}',
    });

    expect(ok).toBe(true);
    expect(postMessageToFrame).toHaveBeenCalledWith({
      type: PORTAL_PREVIEW_MESSAGE_SHELL_DETAILS,
      data: {
        templateId: 'tpl-1',
        tabId: 'tab-1',
        details: '{"shell":{}}',
      },
    });
  });

  it('应通过 frame target 发送视口消息', () => {
    const { target, postMessageToFrame } = createFrameTarget();

    const ok = sendPreviewViewport(target, {
      templateId: 'tpl-2',
      tabId: 'tab-2',
      width: 1440,
      height: 900,
    });

    expect(ok).toBe(true);
    expect(postMessageToFrame).toHaveBeenCalledWith({
      type: PORTAL_PREVIEW_MESSAGE_VIEWPORT,
      data: {
        templateId: 'tpl-2',
        tabId: 'tab-2',
        width: 1440,
        height: 900,
      },
    });
  });

  it('应通过 frame target 发送页面运行时消息', () => {
    const { target, postMessageToFrame } = createFrameTarget();
    const settings = { basic: { pageTitle: '首页' } };
    const component = [{ i: '1', x: 0, y: 0, w: 12, h: 6 }];

    const ok = sendPreviewRuntime(target, {
      templateId: 'tpl-3',
      tabId: 'tab-3',
      settings,
      component,
    });

    expect(ok).toBe(true);
    expect(postMessageToFrame).toHaveBeenCalledWith({
      type: PORTAL_PREVIEW_MESSAGE_PAGE_RUNTIME,
      data: {
        templateId: 'tpl-3',
        tabId: 'tab-3',
        settings,
        component,
      },
    });
  });

  it('frame target 缺失时应返回 false', () => {
    expect(
      sendPreviewShellDetails(null, {
        templateId: 'tpl-1',
        tabId: 'tab-1',
        details: '{}',
      })
    ).toBe(false);
  });

  it('应向预览窗口发送运行时消息', () => {
    const postMessage = vi.fn();
    const targetWindow = {
      postMessage,
    } as unknown as Window;

    const ok = sendPreviewPageRuntimeToWindow(targetWindow, {
      origin: 'https://portal.example.com',
      data: {
        templateId: 'tpl-4',
        tabId: 'tab-4',
        settings: { basic: { pageTitle: 'test' } },
        component: [],
      },
    });

    expect(ok).toBe(true);
    expect(postMessage).toHaveBeenCalledWith(
      {
        type: PORTAL_PREVIEW_MESSAGE_PAGE_RUNTIME,
        data: {
          templateId: 'tpl-4',
          tabId: 'tab-4',
          settings: { basic: { pageTitle: 'test' } },
          component: [],
        },
      },
      'https://portal.example.com'
    );
  });

  it('应识别 preview ready 消息', () => {
    const ok = isPreviewPageReadyMessage({
      type: PORTAL_PREVIEW_MESSAGE_PAGE_READY,
      data: {
        tabId: 'tab-5',
        templateId: 'tpl-5',
      },
    });

    expect(ok).toEqual({
      matched: true,
      tabId: 'tab-5',
      templateId: 'tpl-5',
    });
  });
});
