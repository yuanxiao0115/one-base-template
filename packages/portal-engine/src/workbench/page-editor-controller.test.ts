import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { BizResponse } from '../schema/types'
import { PORTAL_PREVIEW_MESSAGE_PAGE_READY } from '../editor/preview-bridge'
import type { PortalLayoutItem } from '../stores/pageLayout'

import { createPageEditorController } from './page-editor-controller'

function ok<T>(data: T): BizResponse<T> {
  return {
    code: 0,
    data,
  }
}

async function flushPromises() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('page editor controller', () => {
  function createController() {
    const tabId = ref('tab-1')
    const templateId = ref('tpl-1')
    let layoutItems: PortalLayoutItem[] = []
    const pageLayoutStore = {
      get layoutItems() {
        return layoutItems
      },
      reset: vi.fn(() => {
        layoutItems = []
      }),
      updateLayoutItems: vi.fn((next: PortalLayoutItem[]) => {
        layoutItems = next
      }),
      deselectLayoutItem: vi.fn(),
    }
    const previewWindow = {
      closed: false,
      location: {
        href: '',
      },
      focus: vi.fn(),
      postMessage: vi.fn(),
    } as unknown as Window
    const openWindow = vi.fn().mockReturnValue(previewWindow)
    const sendPreviewRuntimeToWindow = vi.fn().mockReturnValue(true)
    const notify = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    }
    const resolvePreviewHref = vi.fn().mockImplementation(({ tabId, templateId, previewMode }) => {
      return `/portal/preview?tabId=${tabId}&templateId=${templateId}&previewMode=${String(previewMode)}`
    })
    const api = {
      tab: {
        detail: vi.fn().mockResolvedValue(
          ok({
            id: 'tab-1',
            tabName: '页面A',
            pageLayout: JSON.stringify({
              settings: {
                basic: {
                  pageTitle: '',
                },
              },
              component: [
                {
                  i: 'item-1',
                  x: 0,
                  y: 0,
                  w: 12,
                  h: 8,
                },
              ],
            }),
          })
        ),
        update: vi.fn().mockResolvedValue(ok(true)),
      },
    }

    const controller = createPageEditorController({
      tabId,
      templateId,
      api,
      notify,
      openWindow,
      sendPreviewRuntimeToWindow,
      resolvePreviewHref,
      pageLayoutStore,
    })

    return {
      controller,
      tabId,
      templateId,
      api,
      notify,
      openWindow,
      sendPreviewRuntimeToWindow,
      resolvePreviewHref,
      previewWindow,
      pageLayoutStore,
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应自动加载页面详情并在保存时提交标准化 pageLayout', async () => {
    const { controller, api, notify } = createController()
    await flushPromises()

    expect(api.tab.detail).toHaveBeenCalledWith({ id: 'tab-1' })
    expect(controller.tabName.value).toBe('页面A')

    const success = await controller.savePage()

    expect(success).toBe(true)
    expect(api.tab.update).toHaveBeenCalledTimes(1)
    const firstUpdateCall = api.tab.update.mock.calls[0]
    expect(firstUpdateCall).toBeDefined()
    const payload = firstUpdateCall![0] as {
      id: string
      tabName: string
      pageLayout: string
    }
    expect(payload.id).toBe('tab-1')
    expect(payload.tabName).toBe('页面A')
    const parsed = JSON.parse(payload.pageLayout) as {
      settings?: {
        basic?: {
          pageTitle?: string
        }
      }
      component?: unknown[]
    }
    expect(parsed.settings?.basic?.pageTitle).toBe('页面A')
    expect(parsed.component).toHaveLength(1)
    expect(notify.success).toHaveBeenCalledWith('保存成功')
    controller.dispose()
  })

  it('预览时应打开窗口并在收到 ready 消息后再次同步运行时', async () => {
    const { controller, openWindow, sendPreviewRuntimeToWindow, resolvePreviewHref, previewWindow } = createController()
    await flushPromises()
    controller.mount()

    await controller.previewPage()

    expect(resolvePreviewHref).toHaveBeenCalledWith({
      tabId: 'tab-1',
      templateId: 'tpl-1',
      previewMode: 'live',
    })
    expect(openWindow).toHaveBeenCalledWith(
      '/portal/preview?tabId=tab-1&templateId=tpl-1&previewMode=live',
      'portal-page-preview'
    )
    const syncCountBeforeReady = sendPreviewRuntimeToWindow.mock.calls.length
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        source: previewWindow,
        data: {
          type: PORTAL_PREVIEW_MESSAGE_PAGE_READY,
          data: {
            tabId: 'tab-1',
            templateId: 'tpl-1',
          },
        },
      })
    )
    expect(sendPreviewRuntimeToWindow.mock.calls.length).toBeGreaterThan(syncCountBeforeReady)
    controller.dispose()
  })
})
