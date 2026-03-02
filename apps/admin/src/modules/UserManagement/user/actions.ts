import type { CorporateUserRecord } from './api'

type UserTypeOption = {
  value: number
  label: string
}

export type UserBindOption = {
  id: string
  nickName: string
  userAccount: string
  phone: string
}

export function isConfirmCancelled(error: unknown): boolean {
  return error === 'cancel' || error === 'close'
}

export async function confirmUserStatusAction(actionLabel: '启用' | '停用', userNames: string) {
  await obConfirm.warn(`您确认要${actionLabel}用户 ${userNames} 吗？`, '确认')
}

export async function confirmResetUserPassword(userName: string) {
  await obConfirm.warn(`您确认要重置用户 ${userName} 的密码吗？`, '确认')
}

export function createUserTypeLabelMap(options: ReadonlyArray<UserTypeOption>): Record<number, string> {
  return Object.fromEntries(options.map((item) => [item.value, item.label]))
}

export function resolveUserTypeLabel(value: number, labelMap: Record<number, string>): string {
  return labelMap[value] || '--'
}

export function mapCorporateUsersToBindOptions(records: CorporateUserRecord[]): UserBindOption[] {
  return (records || []).map((item) => ({
    id: item.userId || item.id,
    nickName: item.userName || item.nickName,
    userAccount: item.userName,
    phone: item.phone
  }))
}

export function downloadUserImportTemplate(filename = '组织用户导入模板.xlsx') {
  const link = document.createElement('a')
  link.href = `/${filename}`
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
