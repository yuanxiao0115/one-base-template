import { reactive, ref } from 'vue';
import type { CrudFormLike } from '@one-base-template/ui';
import { sm4EncryptBase64 } from '@/infra/sczfw/crypto';
import { message } from '@one-base-template/ui';
import { userApi } from '../api';
import type { CorporateUserRecord, UserListRecord } from '../types';
import {
  defaultUserAccountForm,
  type UserAccountForm as UserAccountFormModel,
  type UserBindForm
} from '../form';
import {
  canTriggerKeywordSearch,
  DEFAULT_MIN_KEYWORD_LENGTH,
  normalizeKeyword
} from '../../shared/keywordSearch';

interface UserBindOption {
  id: string;
  nickName: string;
  userAccount: string;
  phone: string;
}

interface UseUserDialogStateOptions {
  onSearch: (goFirstPage?: boolean) => Promise<void>;
}

function getBindOptionsFromCorporateUsers(records: CorporateUserRecord[]): UserBindOption[] {
  return records.map((item) => ({
    id: item.userId,
    nickName: item.userName,
    userAccount: item.userName,
    phone: item.phone
  }));
}

export function useUserDialogState(options: UseUserDialogStateOptions) {
  const { onSearch } = options;

  const accountFormRef = ref<CrudFormLike>();
  const bindFormRef = ref<CrudFormLike>();

  const accountVisible = ref(false);
  const accountSubmitting = ref(false);
  const accountForm = reactive<UserAccountFormModel>({
    ...defaultUserAccountForm
  });

  const bindVisible = ref(false);
  const bindLoading = ref(false);
  const bindSubmitting = ref(false);
  const bindTargetUserId = ref('');
  const bindSelectedUsers = ref<UserBindOption[]>([]);
  const bindForm = reactive<UserBindForm>({
    userIds: []
  });
  let bindDialogRequestToken = 0;

  function resetAccountForm() {
    Object.assign(accountForm, defaultUserAccountForm);
  }

  function openAccountDialog(row: UserListRecord) {
    resetAccountForm();
    accountForm.userId = row.id;
    accountForm.nickName = row.nickName;
    accountForm.phone = row.phone;
    accountForm.userAccount = row.userAccount;
    accountForm.newUsername = row.userAccount;
    accountVisible.value = true;
  }

  function closeAccountDialog() {
    resetAccountForm();
    accountVisible.value = false;
  }

  async function submitAccountDialog() {
    if (accountSubmitting.value) {
      return;
    }

    const isValid = await accountFormRef.value?.validate?.();
    if (isValid === false) {
      return;
    }

    if (accountForm.isReset === 1 && accountForm.newPassword !== accountForm.newPasswordRepeat) {
      message.error('两次密码输入不一致');
      return;
    }

    accountSubmitting.value = true;
    try {
      const response = await userApi.changeUserAccount({
        userId: sm4EncryptBase64(accountForm.userId),
        newUsername: sm4EncryptBase64(accountForm.newUsername),
        isReset: accountForm.isReset,
        newPassword:
          accountForm.isReset === 1 && accountForm.newPassword
            ? sm4EncryptBase64(accountForm.newPassword)
            : ''
      });

      if (response.code !== 200) {
        throw new Error(response.message || '修改账号失败');
      }

      message.success('修改账号成功');
      closeAccountDialog();
      await onSearch(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '修改账号失败';
      message.error(errorMessage);
    } finally {
      accountSubmitting.value = false;
    }
  }

  function resetBindForm() {
    bindForm.userIds = [];
    bindSelectedUsers.value = [];
  }

  function handleBindSearchError(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '加载用户列表失败';
    message.error(errorMessage);
  }

  async function fetchBindUsers(keyword: string): Promise<UserBindOption[]> {
    const normalizedKeyword = normalizeKeyword(keyword);
    if (!canTriggerKeywordSearch(normalizedKeyword, DEFAULT_MIN_KEYWORD_LENGTH)) {
      return [];
    }

    const response = await userApi.searchUsers({ nickName: normalizedKeyword });
    if (response.code !== 200) {
      throw new Error(response.message || '加载用户列表失败');
    }

    const rows = Array.isArray(response.data) ? response.data : [];
    return rows.map((item) => ({
      id: item.id,
      nickName: item.nickName,
      userAccount: item.userAccount,
      phone: item.phone
    }));
  }

  async function openBindDialog(row: UserListRecord) {
    const requestToken = ++bindDialogRequestToken;
    bindTargetUserId.value = row.id;
    bindVisible.value = true;
    bindLoading.value = true;
    resetBindForm();

    try {
      const response = await userApi.detail({ id: row.id });
      if (
        requestToken !== bindDialogRequestToken ||
        !bindVisible.value ||
        bindTargetUserId.value !== row.id
      ) {
        return;
      }
      if (response.code !== 200) {
        throw new Error(response.message || '加载关联账号失败');
      }

      const detail = response.data as {
        corporateUserList?: CorporateUserRecord[];
      };
      const corporateUsers = Array.isArray(detail.corporateUserList)
        ? detail.corporateUserList
        : [];
      const users: UserBindOption[] = getBindOptionsFromCorporateUsers(corporateUsers);

      bindSelectedUsers.value = users;
      bindForm.userIds = users
        .map((item) => item.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
    } catch (error) {
      if (requestToken !== bindDialogRequestToken) {
        return;
      }
      const errorMessage = error instanceof Error ? error.message : '加载关联账号失败';
      message.error(errorMessage);
    } finally {
      if (requestToken === bindDialogRequestToken) {
        bindLoading.value = false;
      }
    }
  }

  function closeBindDialog() {
    bindDialogRequestToken += 1;
    resetBindForm();
    bindLoading.value = false;
    bindVisible.value = false;
    bindTargetUserId.value = '';
  }

  async function submitBindDialog() {
    if (bindSubmitting.value) {
      return;
    }

    const isValid = await bindFormRef.value?.validate?.();
    if (isValid === false) {
      return;
    }

    bindSubmitting.value = true;
    try {
      const response = await userApi.updateCorporateUser({
        corporateUserId: bindTargetUserId.value,
        userIds: bindForm.userIds
      });

      if (response.code !== 200) {
        throw new Error(response.message || '关联账号保存失败');
      }

      message.success('关联账号保存成功');
      closeBindDialog();
      await onSearch(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '关联账号保存失败';
      message.error(errorMessage);
    } finally {
      bindSubmitting.value = false;
    }
  }

  return {
    refs: {
      accountFormRef,
      bindFormRef
    },
    dialogs: {
      accountVisible,
      accountSubmitting,
      accountForm,
      bindVisible,
      bindLoading,
      bindSubmitting,
      bindTargetUserId,
      bindSelectedUsers,
      bindForm
    },
    actions: {
      openAccountDialog,
      closeAccountDialog,
      submitAccountDialog,
      fetchBindUsers,
      handleBindSearchError,
      openBindDialog,
      closeBindDialog,
      submitBindDialog
    }
  };
}
