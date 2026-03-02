export async function confirmDeletePosition(postName: string) {
  await obConfirm.warn(`是否确认删除职位「${postName}」？`, '删除确认')
}

export function isConfirmCancelled(error: unknown): boolean {
  return error === 'cancel' || error === 'close'
}
