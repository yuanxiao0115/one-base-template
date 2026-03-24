import type { Ref } from 'vue';
import { message } from '@one-base-template/ui';
import { userApi } from '../api';
import type { UserListRecord } from '../types';
import { confirmWarn, isConfirmCancelled } from '../../shared/confirm';

interface UseUserStatusActionsOptions {
  selectedList: Ref<UserListRecord[]>;
  onSearch: (goFirstPage?: boolean) => Promise<void>;
}

type UserStatusAction = '停用' | '启用';

async function confirmUserStatusAction(actionLabel: UserStatusAction, userNames: string) {
  await confirmWarn(`您确认要${actionLabel}用户 ${userNames} 吗？`, '确认');
}

async function confirmResetUserPassword(userName: string) {
  await confirmWarn(`您确认要重置用户 ${userName} 的密码吗？`, '确认');
}

async function updateUserStatus(actionLabel: UserStatusAction, ids: string[], isEnable: boolean) {
  const response = await userApi.updateStatus({
    isEnable,
    ids
  });

  if (response.code !== 200) {
    throw new Error(response.message || `${actionLabel}用户失败`);
  }
}

export function useUserStatusActions(options: UseUserStatusActionsOptions) {
  const { selectedList, onSearch } = options;

  async function handleSingleStatus(row: UserListRecord) {
    const nextStatus = !row.isEnable;
    const actionLabel: UserStatusAction = nextStatus ? '启用' : '停用';

    try {
      await confirmUserStatusAction(actionLabel, row.nickName);
      await updateUserStatus(actionLabel, [row.id], nextStatus);
      message.success(`${actionLabel}成功`);
      await onSearch(false);
    } catch (error) {
      if (isConfirmCancelled(error)) {
        return;
      }
      const errorMessage = error instanceof Error ? error.message : `${actionLabel}用户失败`;
      message.error(errorMessage);
    }
  }

  async function handleBatchStatus(isEnable: boolean) {
    const rows = selectedList.value;
    if (rows.length === 0) {
      message.warning('请先选择用户');
      return;
    }

    const actionLabel: UserStatusAction = isEnable ? '启用' : '停用';
    const userNames = rows.map((item) => item.nickName).join('、');

    try {
      await confirmUserStatusAction(actionLabel, userNames);
      await updateUserStatus(
        actionLabel,
        rows.map((item) => item.id),
        isEnable
      );
      message.success(`${actionLabel}成功`);
      await onSearch(false);
    } catch (error) {
      if (isConfirmCancelled(error)) {
        return;
      }
      const errorMessage = error instanceof Error ? error.message : `${actionLabel}用户失败`;
      message.error(errorMessage);
    }
  }

  async function handleResetPassword(row: UserListRecord) {
    try {
      await confirmResetUserPassword(row.nickName);

      const response = await userApi.resetPassword({ id: row.id });
      if (response.code !== 200) {
        throw new Error(response.message || '重置密码失败');
      }

      message.success('重置密码成功');
      await onSearch(false);
    } catch (error) {
      if (isConfirmCancelled(error)) {
        return;
      }
      const errorMessage = error instanceof Error ? error.message : '重置密码失败';
      message.error(errorMessage);
    }
  }

  return {
    handleSingleStatus,
    handleBatchStatus,
    handleResetPassword
  };
}
