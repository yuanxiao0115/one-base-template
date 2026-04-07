<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type {
  AccountCenterAvatarUrlResolver,
  AccountCenterChangePassword,
  AccountCenterCheckPassword,
  AccountCenterEncryptPassword,
  AccountCenterIsAvatarHidden,
  AccountCenterResolveSuccess,
  AccountCenterResponse,
  AccountCenterSetAvatarHidden,
  AccountCenterUploadAvatar,
  AccountCenterUser
} from './types';
import UserProfileDialog from './UserProfileDialog.vue';
import ChangePasswordDialog from './ChangePasswordDialog.vue';

function buildAvatarFallbackText(...candidates: Array<string | null | undefined>): string {
  const value =
    candidates
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .find((item) => item.length > 0) || '用户';

  const chars = Array.from(value);
  return chars.slice(-2).join('') || '用户';
}

function identityEncryptPassword(plainText: string): string {
  return plainText;
}

function defaultResolveSuccess(response: AccountCenterResponse): boolean {
  const code = response?.code;
  return code === 200 || code === 0 || String(code) === '200' || String(code) === '0';
}

function defaultAvatarUrlResolver(params: {
  userId: string;
  timestamp: number;
  version: number;
}): string {
  return `/cmict/file/user/avatar/${params.userId}?timestamp=${params.timestamp}&version=${params.version}`;
}

function defaultCheckPassword(): Promise<AccountCenterResponse<boolean>> {
  return Promise.resolve({
    code: 500,
    data: false,
    message: '未配置密码校验能力'
  });
}

function defaultChangePassword(): Promise<AccountCenterResponse<boolean>> {
  return Promise.resolve({
    code: 500,
    data: false,
    message: '未配置修改密码能力'
  });
}

function defaultUploadAvatar(): Promise<AccountCenterResponse> {
  return Promise.resolve({
    code: 500,
    message: '未配置头像上传能力'
  });
}

const props = withDefaults(
  defineProps<{
    user?: AccountCenterUser | null;
    showProfileDialog?: boolean;
    showChangePassword?: boolean;
    showPersonalization?: boolean;
    uploadAvatar?: AccountCenterUploadAvatar;
    checkPassword?: AccountCenterCheckPassword;
    changePassword?: AccountCenterChangePassword;
    encryptPassword?: AccountCenterEncryptPassword;
    passwordPattern?: RegExp;
    passwordRuleMessage?: string;
    isAvatarHidden?: AccountCenterIsAvatarHidden;
    setAvatarHidden?: AccountCenterSetAvatarHidden;
    avatarUrlResolver?: AccountCenterAvatarUrlResolver;
    resolveSuccess?: AccountCenterResolveSuccess;
  }>(),
  {
    user: null,
    showProfileDialog: true,
    showChangePassword: true,
    showPersonalization: true,
    uploadAvatar: undefined,
    checkPassword: undefined,
    changePassword: undefined,
    encryptPassword: undefined,
    passwordPattern: undefined,
    passwordRuleMessage: '密码长度8-20位，至少包含大小写字母、数字、特殊字符中的3种及以上',
    isAvatarHidden: undefined,
    setAvatarHidden: undefined,
    avatarUrlResolver: undefined,
    resolveSuccess: undefined
  }
);

const emit = defineEmits<{
  (event: 'logout'): void;
  (event: 'open-personalization'): void;
  (event: 'refresh-user'): void;
}>();

const profileDialogVisible = ref(false);
const changePasswordDialogVisible = ref(false);
const avatarTimestamp = ref(Date.now());
const avatarDisplayVersion = ref(0);
const avatarLoadErrorMap = ref<Record<string, boolean>>({});

const userName = computed(() => props.user?.name ?? '未登录');
const userDisplayName = computed(
  () => props.user?.nickName || props.user?.name || props.user?.userAccount || userName.value
);
const userId = computed(() => {
  const id = props.user?.id;
  return id == null ? '' : String(id);
});

const isAvatarHidden = computed<AccountCenterIsAvatarHidden>(
  () => props.isAvatarHidden ?? (() => false)
);

const setAvatarHidden = computed<AccountCenterSetAvatarHidden>(
  () => props.setAvatarHidden ?? (() => false)
);

const avatarUrlResolver = computed<AccountCenterAvatarUrlResolver>(
  () => props.avatarUrlResolver ?? defaultAvatarUrlResolver
);

const resolveSuccess = computed<AccountCenterResolveSuccess>(
  () => props.resolveSuccess ?? defaultResolveSuccess
);

const encryptPassword = computed<AccountCenterEncryptPassword>(
  () => props.encryptPassword ?? identityEncryptPassword
);

const canUseProfileDialog = computed(() => {
  return props.showProfileDialog && Boolean(props.uploadAvatar);
});

const canUseChangePasswordDialog = computed(() => {
  return props.showChangePassword && Boolean(props.checkPassword) && Boolean(props.changePassword);
});

const userAvatar = computed(() => {
  const user = props.user;
  if (!user) {
    return '';
  }

  if (isAvatarHidden.value(user.id)) {
    return '';
  }

  const currentUserId = userId.value;
  if (currentUserId && avatarLoadErrorMap.value[currentUserId]) {
    return '';
  }

  if (currentUserId) {
    return avatarUrlResolver.value({
      userId: currentUserId,
      timestamp: avatarTimestamp.value,
      version: avatarDisplayVersion.value
    });
  }
  return user.avatarUrl || user.avatar || '';
});

const userAvatarFallback = computed(() => {
  return buildAvatarFallbackText(props.user?.nickName, props.user?.name, props.user?.userAccount);
});

watch(
  () => props.user?.id,
  () => {
    avatarTimestamp.value = Date.now();
    avatarDisplayVersion.value += 1;

    const currentUserId = userId.value;
    if (currentUserId) {
      delete avatarLoadErrorMap.value[currentUserId];
    }
  }
);

function onAvatarImageError() {
  const currentUserId = userId.value;
  if (!currentUserId) {
    return;
  }
  avatarLoadErrorMap.value[currentUserId] = true;
}

function openProfileDialog() {
  profileDialogVisible.value = true;
}

function openChangePasswordDialog() {
  changePasswordDialogVisible.value = true;
}

function openPersonalization() {
  emit('open-personalization');
}

function onLogout() {
  emit('logout');
}

function onProfileRefresh() {
  avatarTimestamp.value = Date.now();
  emit('refresh-user');
}

function onAvatarUpdated() {
  avatarTimestamp.value = Date.now();
  avatarDisplayVersion.value += 1;
}

const uploadAvatar = computed<AccountCenterUploadAvatar>(
  () => props.uploadAvatar ?? defaultUploadAvatar
);
const checkPassword = computed<AccountCenterCheckPassword>(
  () => props.checkPassword ?? defaultCheckPassword
);
const changePassword = computed<AccountCenterChangePassword>(
  () => props.changePassword ?? defaultChangePassword
);
</script>

<template>
  <el-dropdown class="ob-account-center">
    <span class="ob-account-center__user-trigger">
      <span class="ob-account-center__avatar" role="img" :aria-label="userDisplayName">
        <img
          v-if="userAvatar"
          class="ob-account-center__avatar-image"
          :src="userAvatar"
          :alt="userDisplayName"
          @error="onAvatarImageError"
        />
        <span v-else class="ob-account-center__avatar-text">{{ userAvatarFallback }}</span>
      </span>
      <span class="ob-account-center__user-name" :title="userDisplayName">{{
        userDisplayName
      }}</span>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-if="canUseProfileDialog" @click="openProfileDialog">
          用户信息
        </el-dropdown-item>
        <el-dropdown-item v-if="canUseChangePasswordDialog" @click="openChangePasswordDialog">
          修改密码
        </el-dropdown-item>
        <el-dropdown-item v-if="props.showPersonalization" @click="openPersonalization">
          个性设置
        </el-dropdown-item>
        <el-dropdown-item divided @click="onLogout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <UserProfileDialog
    v-if="canUseProfileDialog"
    v-model="profileDialogVisible"
    :user="props.user"
    :upload-avatar="uploadAvatar"
    :is-avatar-hidden="isAvatarHidden"
    :set-avatar-hidden="setAvatarHidden"
    :avatar-url-resolver="avatarUrlResolver"
    :resolve-success="resolveSuccess"
    @refresh="onProfileRefresh"
    @avatar-updated="onAvatarUpdated"
  />
  <ChangePasswordDialog
    v-if="canUseChangePasswordDialog"
    v-model="changePasswordDialogVisible"
    :check-password="checkPassword"
    :change-password="changePassword"
    :encrypt-password="encryptPassword"
    :password-pattern="props.passwordPattern"
    :password-rule-message="props.passwordRuleMessage"
    :resolve-success="resolveSuccess"
  />
</template>

<style scoped>
.ob-account-center__user-trigger {
  cursor: pointer;
  user-select: none;
  color: #fff;
  padding: 2px 10px;
  border-radius: 999px;
  transition: background-color 150ms ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ob-account-center__user-trigger:hover {
  background: rgb(255 255 255 / 14%);
}

.ob-account-center__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--one-color-primary-light-1, var(--el-color-primary-light-9));
  color: var(--one-color-primary, var(--el-color-primary));
  overflow: hidden;
}

.ob-account-center__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ob-account-center__avatar-text {
  font-size: 12px;
  line-height: 1;
  font-weight: 600;
}

.ob-account-center__user-name {
  font-size: 14px;
  color: #fff;
  max-width: 180px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
