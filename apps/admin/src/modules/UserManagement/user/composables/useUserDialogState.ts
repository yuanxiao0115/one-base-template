import { nextTick, reactive, ref } from 'vue'
import type { CrudFormLike } from '@one-base-template/ui'
import { sm4EncryptBase64 } from '@/infra/sczfw/crypto'
import { message } from '@/utils/message'
import {
  userApi,
  type CorporateUserRecord,
  type UserListRecord
} from '../api'
import {
  defaultUserAccountForm,
  type UserAccountForm as UserAccountFormModel,
  type UserBindForm
} from '../form'
import type { UserBindOption } from '../components/UserBindAccountForm.vue'

type BindFormExpose = CrudFormLike & {
  loadOptions?: (keyword?: string) => Promise<void>
  setSelectedUsers?: (users: UserBindOption[]) => void
}

type UseUserDialogStateOptions = {
  onSearch: (goFirstPage?: boolean) => Promise<void>
}

function getBindOptionsFromCorporateUsers(records: CorporateUserRecord[]): UserBindOption[] {
  return (records || []).map((item) => ({
    id: item.userId || item.id,
    nickName: item.userName || item.nickName,
    userAccount: item.userName,
    phone: item.phone
  }))
}

export function useUserDialogState(options: UseUserDialogStateOptions) {
  const { onSearch } = options

  const accountFormRef = ref<CrudFormLike>()
  const bindFormRef = ref<BindFormExpose>()

  const accountVisible = ref(false)
  const accountSubmitting = ref(false)
  const accountForm = reactive<UserAccountFormModel>({
    ...defaultUserAccountForm
  })

  const bindVisible = ref(false)
  const bindLoading = ref(false)
  const bindSubmitting = ref(false)
  const bindTargetUserId = ref('')
  const bindForm = reactive<UserBindForm>({
    userIds: []
  })

  function resetAccountForm() {
    Object.assign(accountForm, defaultUserAccountForm)
  }

  function openAccountDialog(row: UserListRecord) {
    resetAccountForm()
    accountForm.userId = row.id
    accountForm.nickName = row.nickName
    accountForm.phone = row.phone
    accountForm.userAccount = row.userAccount
    accountForm.newUsername = row.userAccount
    accountVisible.value = true
  }

  function closeAccountDialog() {
    resetAccountForm()
    accountVisible.value = false
  }

  async function submitAccountDialog() {
    if (accountSubmitting.value) return

    const isValid = await accountFormRef.value?.validate?.()
    if (isValid === false) return

    if (accountForm.isReset === 1 && accountForm.newPassword !== accountForm.newPasswordRepeat) {
      message.error('两次密码输入不一致')
      return
    }

    accountSubmitting.value = true
    try {
      const response = await userApi.changeUserAccount({
        userId: sm4EncryptBase64(accountForm.userId),
        newUsername: sm4EncryptBase64(accountForm.newUsername),
        isReset: accountForm.isReset,
        newPassword: accountForm.isReset === 1 && accountForm.newPassword
          ? sm4EncryptBase64(accountForm.newPassword)
          : ''
      })

      if (response.code !== 200) {
        throw new Error(response.message || '修改账号失败')
      }

      message.success('修改账号成功')
      closeAccountDialog()
      await onSearch(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '修改账号失败'
      message.error(errorMessage)
    } finally {
      accountSubmitting.value = false
    }
  }

  function resetBindForm() {
    bindForm.userIds = []
  }

  async function fetchBindUsers(keyword: string): Promise<UserBindOption[]> {
    const response = await userApi.searchUsers({ nickName: keyword })
    if (response.code !== 200) {
      throw new Error(response.message || '加载用户列表失败')
    }

    return (response.data || []).map((item) => ({
      id: item.id,
      nickName: item.nickName,
      userAccount: item.userAccount,
      phone: item.phone
    }))
  }

  async function openBindDialog(row: UserListRecord) {
    bindTargetUserId.value = row.id
    bindVisible.value = true
    bindLoading.value = true
    resetBindForm()

    try {
      const response = await userApi.detail({ id: row.id })
      if (response.code !== 200) {
        throw new Error(response.message || '加载关联账号失败')
      }

      const users = getBindOptionsFromCorporateUsers(response.data.corporateUserList)

      bindForm.userIds = users.map((item) => item.id).filter(Boolean)

      await nextTick()
      bindFormRef.value?.setSelectedUsers?.(users)
      await bindFormRef.value?.loadOptions?.('')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载关联账号失败'
      message.error(errorMessage)
    } finally {
      bindLoading.value = false
    }
  }

  function closeBindDialog() {
    resetBindForm()
    bindVisible.value = false
    bindTargetUserId.value = ''
  }

  async function submitBindDialog() {
    if (bindSubmitting.value) return

    const isValid = await bindFormRef.value?.validate?.()
    if (isValid === false) return

    bindSubmitting.value = true
    try {
      const response = await userApi.updateCorporateUser({
        corporateUserId: bindTargetUserId.value,
        userIds: bindForm.userIds
      })

      if (response.code !== 200) {
        throw new Error(response.message || '关联账号保存失败')
      }

      message.success('关联账号保存成功')
      closeBindDialog()
      await onSearch(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '关联账号保存失败'
      message.error(errorMessage)
    } finally {
      bindSubmitting.value = false
    }
  }

  async function checkUserAccountUnique(params: {
    userId?: string
    userAccount?: string
  }, checkFieldUnique: (params: { userId?: string; userAccount?: string }) => Promise<boolean>) {
    return checkFieldUnique(params)
  }

  return {
    accountFormRef,
    bindFormRef,
    accountVisible,
    accountSubmitting,
    accountForm,
    bindVisible,
    bindLoading,
    bindSubmitting,
    bindForm,
    openAccountDialog,
    closeAccountDialog,
    submitAccountDialog,
    fetchBindUsers,
    openBindDialog,
    closeBindDialog,
    submitBindDialog,
    checkUserAccountUnique
  }
}
