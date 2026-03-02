import type { DictItem } from './api'

export function buildDictLabelMap(items: DictItem[]): Record<string, string> {
  return Object.fromEntries(
    (items || []).map((item) => [String(item.itemValue || ''), item.itemName || ''])
  )
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function isConfirmCancelled(error: unknown): boolean {
  return error === 'cancel' || error === 'close'
}

export async function confirmDeleteOrgByName(orgName: string) {
  await obConfirm.prompt(
    `此操作不可逆，请输入组织名称「${orgName}」确认删除`,
    '删除确认',
    {
      inputPlaceholder: '请输入组织名称',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        const text = (value || '').trim()
        if (!text) return '请输入组织名称'
        if (text !== orgName) return '输入的组织名称与目标不一致'
        return true
      }
    }
  )
}
