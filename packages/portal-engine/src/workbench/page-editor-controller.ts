import { ref, watch, type Ref, type WatchStopHandle } from 'vue'

import type { PortalPreviewRuntimeData } from '../editor/preview-bridge'
import { isPreviewPageReadyMessage, sendPreviewPageRuntimeToWindow } from '../editor/preview-bridge'
import {
  buildPortalPageLayoutForSave,
  createDefaultPortalPageSettingsV2,
  normalizePortalPageSettingsV2,
  type PortalPageSettingsV2,
} from '../schema/page-settings'
import type { BizResponse } from '../schema/types'
import { usePortalPageLayoutStore, type PortalLayoutItem } from '../stores/pageLayout'
import type { PortalPreviewMode } from '../utils/preview'

interface PageLayoutJson {
  settings?: unknown
  component?: unknown
}

export interface PortalPageEditorTabDetail {
  id?: string
  tabName?: string
  pageLayout?: string
}

export interface PortalPageEditorApi {
  tab: {
    detail: (params: { id: string }) => Promise<BizResponse<PortalPageEditorTabDetail>>
    update: (payload: {
      id: string
      tabName: string
      pageLayout: string
    }) => Promise<BizResponse<unknown>>
  }
}

export interface PortalPageEditorNotifier {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
}

export interface PortalPageEditorLayoutStore {
  layoutItems: PortalLayoutItem[]
  reset: () => void
  updateLayoutItems: (items: PortalLayoutItem[]) => void
  deselectLayoutItem: () => void
}

export interface CreatePageEditorControllerOptions {
  tabId: Readonly<Ref<string>>
  templateId: Readonly<Ref<string>>
  api: PortalPageEditorApi
  notify: PortalPageEditorNotifier
  resolvePreviewHref: (payload: {
    tabId: string
    templateId: string
    previewMode: PortalPreviewMode
  }) => string
  pageLayoutStore?: PortalPageEditorLayoutStore
  openWindow?: (href: string, name: string) => Window | null
  sendPreviewRuntimeToWindow?: (
    targetWindow: Window,
    payload: {
      origin: string
      data: PortalPreviewRuntimeData
    }
  ) => boolean
  getRuntimeWindow?: () => Window | null
}

const PREVIEW_WINDOW_NAME = 'portal-page-preview'
const PREVIEW_RUNTIME_SYNC_DELAY = 160
const PREVIEW_RUNTIME_BOOTSTRAP_DELAYS = [180, 520] as const

function normalizeBizOk(res: BizResponse<unknown> | null | undefined): boolean {
  const code = res?.code
  return res?.success === true || code === 0 || code === 200 || String(code) === '0' || String(code) === '200'
}

function normalizeLayoutItems(input: unknown): PortalLayoutItem[] {
  if (!Array.isArray(input)) {
    return []
  }
  return input
    .map((raw) => {
      if (!raw || typeof raw !== 'object') {
        return null
      }
      const item = raw as Record<string, unknown>
      const idRaw = item.i
      const id = typeof idRaw === 'string' || typeof idRaw === 'number' ? String(idRaw) : ''
      if (!id) {
        return null
      }
      return {
        i: id,
        x: Number(item.x) || 0,
        y: Number(item.y) || 0,
        w: Number(item.w) || 1,
        h: Number(item.h) || 1,
        component: item.component as PortalLayoutItem['component'],
      } satisfies PortalLayoutItem
    })
    .filter(Boolean) as PortalLayoutItem[]
}

function applyPageSettings(input: unknown, fallbackTitle: string): PortalPageSettingsV2 {
  const normalized = normalizePortalPageSettingsV2(input)
  if (!normalized.basic.pageTitle.trim()) {
    normalized.basic.pageTitle = fallbackTitle || '页面'
  }
  return normalized
}

function toPlainData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function createPageEditorController(options: CreatePageEditorControllerOptions) {
  const pageLayoutStore = options.pageLayoutStore || usePortalPageLayoutStore()
  const resolveWindow = options.getRuntimeWindow || (() => (typeof window === 'undefined' ? null : window))
  const sendRuntime = options.sendPreviewRuntimeToWindow || sendPreviewPageRuntimeToWindow

  const loading = ref(false)
  const saving = ref(false)
  const previewLoading = ref(false)
  const tabName = ref('')
  const pageSettingData = ref<PortalPageSettingsV2>(createDefaultPortalPageSettingsV2())

  const previewWindowRef = ref<Window | null>(null)
  const stopHandles: WatchStopHandle[] = []

  let listenerWindow: Window | null = null
  let previewRuntimeSyncTimer: ReturnType<typeof setTimeout> | null = null
  let previewRuntimeBootstrapTimers: Array<ReturnType<typeof setTimeout>> = []

  function getOrigin(): string {
    return resolveWindow()?.location?.origin || ''
  }

  function getPreviewWindow(): Window | null {
    const targetWindow = previewWindowRef.value
    if (!targetWindow || targetWindow.closed) {
      previewWindowRef.value = null
      return null
    }
    return targetWindow
  }

  function clearPreviewRuntimeSyncTimer() {
    if (!previewRuntimeSyncTimer) {
      return
    }
    clearTimeout(previewRuntimeSyncTimer)
    previewRuntimeSyncTimer = null
  }

  function clearPreviewRuntimeBootstrapTimers() {
    if (previewRuntimeBootstrapTimers.length === 0) {
      return
    }
    for (const timer of previewRuntimeBootstrapTimers) {
      clearTimeout(timer)
    }
    previewRuntimeBootstrapTimers = []
  }

  function postPreviewRuntimeMessage(): boolean {
    if (!options.tabId.value) {
      return false
    }
    const targetWindow = getPreviewWindow()
    if (!targetWindow) {
      return false
    }

    const ok = sendRuntime(targetWindow, {
      origin: getOrigin(),
      data: {
        tabId: options.tabId.value,
        templateId: options.templateId.value,
        settings: toPlainData(pageSettingData.value),
        component: toPlainData(pageLayoutStore.layoutItems),
      },
    })

    if (!ok) {
      previewWindowRef.value = null
      return false
    }
    return true
  }

  function queuePreviewRuntimeSync() {
    clearPreviewRuntimeSyncTimer()
    previewRuntimeSyncTimer = setTimeout(() => {
      previewRuntimeSyncTimer = null
      postPreviewRuntimeMessage()
    }, PREVIEW_RUNTIME_SYNC_DELAY)
  }

  function pushPreviewRuntimeBootstrapSync() {
    postPreviewRuntimeMessage()
    clearPreviewRuntimeBootstrapTimers()
    previewRuntimeBootstrapTimers = PREVIEW_RUNTIME_BOOTSTRAP_DELAYS.map((delay) =>
      setTimeout(() => {
        postPreviewRuntimeMessage()
      }, delay)
    )
  }

  function openPreviewWindow(href: string): Window | null {
    const existing = getPreviewWindow()
    if (existing) {
      try {
        existing.location.href = href
      } catch {
        previewWindowRef.value = null
      }
      existing.focus()
      return existing
    }

    const opened =
      options.openWindow?.(href, PREVIEW_WINDOW_NAME) ||
      resolveWindow()?.open(href, PREVIEW_WINDOW_NAME) ||
      null
    if (!opened) {
      options.notify.warning('预览窗口被浏览器拦截，请允许弹窗后重试')
      return null
    }
    previewWindowRef.value = opened
    return opened
  }

  function onPreviewWindowMessage(event: MessageEvent) {
    const origin = getOrigin()
    if (origin && event.origin !== origin) {
      return
    }

    const readyMessage = isPreviewPageReadyMessage(event.data)
    if (!readyMessage.matched) {
      return
    }
    if (readyMessage.tabId && readyMessage.tabId !== options.tabId.value) {
      return
    }
    if (readyMessage.templateId && readyMessage.templateId !== options.templateId.value) {
      return
    }

    const source = event.source as Window | null
    if (!source || typeof source.postMessage !== 'function') {
      return
    }
    previewWindowRef.value = source
    pushPreviewRuntimeBootstrapSync()
  }

  function mount() {
    if (listenerWindow) {
      return
    }
    const runtimeWindow = resolveWindow()
    if (!runtimeWindow) {
      return
    }
    runtimeWindow.addEventListener('message', onPreviewWindowMessage)
    listenerWindow = runtimeWindow
  }

  function unmount() {
    clearPreviewRuntimeSyncTimer()
    clearPreviewRuntimeBootstrapTimers()
    listenerWindow?.removeEventListener('message', onPreviewWindowMessage)
    listenerWindow = null
    previewWindowRef.value = null
  }

  async function loadTabDetail(id: string) {
    if (!id) {
      pageLayoutStore.reset()
      tabName.value = '新建页面'
      pageSettingData.value = applyPageSettings(null, tabName.value)
      return
    }

    loading.value = true
    try {
      const res = await options.api.tab.detail({ id })
      if (!normalizeBizOk(res)) {
        options.notify.error(res?.message || '加载页面失败')
        pageLayoutStore.reset()
        return
      }

      const tab = res?.data
      tabName.value = tab?.tabName || '页面编辑'

      if (tab?.pageLayout) {
        try {
          const parsed = JSON.parse(tab.pageLayout) as PageLayoutJson
          pageSettingData.value = applyPageSettings(parsed.settings, tabName.value)
          pageLayoutStore.updateLayoutItems(normalizeLayoutItems(parsed.component))
        } catch {
          pageSettingData.value = applyPageSettings(null, tabName.value)
          pageLayoutStore.updateLayoutItems([])
        }
      } else {
        pageSettingData.value = applyPageSettings(null, tabName.value)
        pageLayoutStore.updateLayoutItems([])
      }

      pageLayoutStore.deselectLayoutItem()
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : '加载页面失败'
      options.notify.error(text)
      pageSettingData.value = applyPageSettings(null, tabName.value)
      pageLayoutStore.reset()
    } finally {
      loading.value = false
    }
  }

  async function savePage() {
    if (!options.tabId.value) {
      options.notify.warning('缺少 tabId，无法保存')
      return false
    }
    if (saving.value) {
      return false
    }

    saving.value = true
    try {
      pageSettingData.value = applyPageSettings(pageSettingData.value, tabName.value)
      const pageLayout = buildPortalPageLayoutForSave(pageSettingData.value, pageLayoutStore.layoutItems)
      const res = await options.api.tab.update({
        id: options.tabId.value,
        tabName: tabName.value || '页面',
        pageLayout: JSON.stringify(pageLayout),
      })
      if (!normalizeBizOk(res)) {
        options.notify.error(res?.message || '保存失败')
        return false
      }

      options.notify.success('保存成功')
      return true
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : '保存失败'
      options.notify.error(text)
      return false
    } finally {
      saving.value = false
    }
  }

  async function previewPage() {
    if (!options.tabId.value) {
      options.notify.warning('缺少 tabId，无法预览')
      return
    }
    if (previewLoading.value) {
      return
    }

    previewLoading.value = true
    try {
      const ok = await savePage()
      if (!ok) {
        return
      }

      const previewWindow = openPreviewWindow(
        options.resolvePreviewHref({
          tabId: options.tabId.value,
          templateId: options.templateId.value,
          previewMode: 'live',
        })
      )
      if (!previewWindow) {
        return
      }
      previewWindowRef.value = previewWindow
      pushPreviewRuntimeBootstrapSync()
    } finally {
      previewLoading.value = false
    }
  }

  function dispose() {
    for (const stop of stopHandles.splice(0)) {
      stop()
    }
    unmount()
  }

  stopHandles.push(
    watch(
      () => options.tabId.value,
      async (id) => {
        await loadTabDetail(id)
      },
      { immediate: true }
    )
  )

  stopHandles.push(
    watch(
      () => [pageSettingData.value, pageLayoutStore.layoutItems, options.tabId.value, options.templateId.value] as const,
      () => {
        queuePreviewRuntimeSync()
      },
      { deep: true }
    )
  )

  return {
    loading,
    saving,
    previewLoading,
    tabName,
    pageSettingData,
    previewWindowRef,
    loadTabDetail,
    savePage,
    previewPage,
    mount,
    unmount,
    dispose,
  }
}

export type PageEditorController = ReturnType<typeof createPageEditorController>
