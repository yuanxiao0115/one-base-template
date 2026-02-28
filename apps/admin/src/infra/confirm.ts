import { ElMessageBox, type ElMessageBoxOptions, type MessageBoxData } from 'element-plus'

const SECONDARY_CONFIRM_CLASS = 'ob-secondary-confirm'
const DEFAULT_TITLES = {
  warning: '操作确认',
  success: '成功信息',
  error: '失败信息'
} as const

const DEFAULT_CONFIRM_OPTIONS: ElMessageBoxOptions = {
  type: 'warning',
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  showClose: true
}

export type ConfirmTone = 'warning' | 'success' | 'error'

function mergeSecondaryClass(customClass?: string): string {
  if (!customClass || !customClass.trim()) {
    return SECONDARY_CONFIRM_CLASS
  }

  const classNames = customClass
    .split(/\s+/)
    .map(item => item.trim())
    .filter(Boolean)

  if (classNames.includes(SECONDARY_CONFIRM_CLASS)) {
    return classNames.join(' ')
  }

  return [...classNames, SECONDARY_CONFIRM_CLASS].join(' ')
}

function openSecondaryConfirmWithTone(
  message: ElMessageBoxOptions['message'],
  tone: ConfirmTone,
  title?: ElMessageBoxOptions['title'],
  options: ElMessageBoxOptions = {}
): Promise<MessageBoxData> {
  return ElMessageBox.confirm(message, title, {
    ...DEFAULT_CONFIRM_OPTIONS,
    ...options,
    type: tone,
    customClass: mergeSecondaryClass(options.customClass)
  })
}

export const obConfirm = {
  warn(message: ElMessageBoxOptions['message'], title: ElMessageBoxOptions['title'] = DEFAULT_TITLES.warning, options: ElMessageBoxOptions = {}) {
    return openSecondaryConfirmWithTone(message, 'warning', title, options)
  },
  success(
    message: ElMessageBoxOptions['message'],
    title: ElMessageBoxOptions['title'] = DEFAULT_TITLES.success,
    options: ElMessageBoxOptions = {}
  ) {
    return openSecondaryConfirmWithTone(message, 'success', title, options)
  },
  error(message: ElMessageBoxOptions['message'], title: ElMessageBoxOptions['title'] = DEFAULT_TITLES.error, options: ElMessageBoxOptions = {}) {
    return openSecondaryConfirmWithTone(message, 'error', title, options)
  }
}

// 兼容历史页面：逐步从 confirm 迁移到 obConfirm
export const confirm = obConfirm

export const openSecondaryConfirm = obConfirm.warn
