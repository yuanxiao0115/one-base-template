<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { UploadProps } from 'element-plus';
import { message } from '../../feedback/message';
import AvatarCropDialog from './AvatarCropDialog.vue';
import type {
  AccountCenterAvatarUrlResolver,
  AccountCenterIsAvatarHidden,
  AccountCenterResponse,
  AccountCenterSetAvatarHidden,
  AccountCenterUploadAvatar,
  AccountCenterUser
} from './types';

function buildAvatarFallbackText(...candidates: Array<string | null | undefined>): string {
  const value =
    candidates
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .find((item) => item.length > 0) || '用户';

  const chars = Array.from(value);
  return chars.slice(-2).join('') || '用户';
}

function defaultAvatarUrlResolver(params: {
  userId: string;
  timestamp: number;
  version: number;
}): string {
  return `/cmict/file/user/avatar/${params.userId}?timestamp=${params.timestamp}&version=${params.version}`;
}

function defaultResolveSuccess(response: AccountCenterResponse): boolean {
  const code = response?.code;
  return code === 200 || code === 0 || String(code) === '200' || String(code) === '0';
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    user?: AccountCenterUser | null;
    uploadAvatar: AccountCenterUploadAvatar;
    isAvatarHidden?: AccountCenterIsAvatarHidden;
    setAvatarHidden?: AccountCenterSetAvatarHidden;
    avatarUrlResolver?: AccountCenterAvatarUrlResolver;
    resolveSuccess?: (response: AccountCenterResponse) => boolean;
  }>(),
  {
    user: null,
    isAvatarHidden: undefined,
    setAvatarHidden: undefined,
    avatarUrlResolver: undefined,
    resolveSuccess: undefined
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'refresh'): void;
  (event: 'avatar-updated'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const uploadLoading = ref(false);
const avatarTimestamp = ref(Date.now());
const cropVisible = ref(false);
const cropSourceFile = ref<File | null>(null);
const avatarDisplayVersion = ref(0);

const isAvatarHidden = computed<AccountCenterIsAvatarHidden>(
  () => props.isAvatarHidden ?? (() => false)
);

const setAvatarHidden = computed<AccountCenterSetAvatarHidden>(
  () => props.setAvatarHidden ?? (() => false)
);

const avatarUrlResolver = computed<AccountCenterAvatarUrlResolver>(
  () => props.avatarUrlResolver ?? defaultAvatarUrlResolver
);

const resolveSuccess = computed<(response: AccountCenterResponse) => boolean>(
  () => props.resolveSuccess ?? defaultResolveSuccess
);

const userName = computed(() => props.user?.nickName || props.user?.name || '--');
const userAccount = computed(() => props.user?.userAccount || '--');
const tenantName = computed(() => props.user?.tenantName || '--');
const mail = computed(() => props.user?.mail || '--');
const phone = computed(() => props.user?.phone || '--');

const avatarFallback = computed(() => {
  return buildAvatarFallbackText(props.user?.nickName, props.user?.name, props.user?.userAccount);
});

const avatarSrc = computed(() => {
  const userId = props.user?.id;
  if (isAvatarHidden.value(userId)) {
    return '';
  }

  if (userId) {
    return avatarUrlResolver.value({
      userId: String(userId),
      timestamp: avatarTimestamp.value,
      version: avatarDisplayVersion.value
    });
  }

  return props.user?.avatarUrl || props.user?.avatar || '';
});

watch(
  () => props.user?.id,
  () => {
    avatarTimestamp.value = Date.now();
  }
);

const beforeUploadAvatar: UploadProps['beforeUpload'] = (file) => {
  if (!file.type.startsWith('image/')) {
    message.error('仅支持上传图片文件');
    return false;
  }

  cropSourceFile.value = file;
  cropVisible.value = true;
  return false;
};

async function submitAvatar(file: File) {
  const userId = props.user?.id;
  if (!userId) {
    message.error('未获取到用户信息，无法上传头像');
    return;
  }

  uploadLoading.value = true;
  try {
    const response = await props.uploadAvatar({
      file,
      userId: String(userId)
    });
    if (!resolveSuccess.value(response)) {
      throw new Error(response.message || '头像上传失败');
    }

    setAvatarHidden.value(userId, false);
    avatarDisplayVersion.value += 1;
    avatarTimestamp.value = Date.now();
    emit('refresh');
    emit('avatar-updated');
    message.success('头像更新成功');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '头像上传失败';
    message.error(errorMessage);
  } finally {
    uploadLoading.value = false;
  }
}

function clearAvatar() {
  const userId = props.user?.id;
  if (!setAvatarHidden.value(userId, true)) {
    message.error('未获取到用户信息，无法清空头像');
    return;
  }

  avatarDisplayVersion.value += 1;
  avatarTimestamp.value = Date.now();
  emit('refresh');
  emit('avatar-updated');
  message.success('头像已清空');
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="用户信息"
    width="560"
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
  >
    <div class="user-profile-dialog">
      <div class="user-profile-dialog__avatar-block">
        <el-avatar :size="72" :src="avatarSrc">{{ avatarFallback }}</el-avatar>
        <div class="user-profile-dialog__avatar-actions">
          <el-upload
            :show-file-list="false"
            :before-upload="beforeUploadAvatar"
            :disabled="uploadLoading"
          >
            <el-button
              class="user-profile-dialog__upload-btn"
              size="small"
              :loading="uploadLoading"
              :disabled="uploadLoading"
            >
              修改头像
            </el-button>
          </el-upload>
          <el-button
            class="user-profile-dialog__clear-btn"
            size="small"
            text
            type="danger"
            :disabled="uploadLoading || !avatarSrc"
            @click="clearAvatar"
          >
            清空头像
          </el-button>
        </div>
      </div>

      <el-form label-width="90px" label-position="left">
        <el-form-item label="账号">
          <el-input :model-value="userAccount" readonly />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input :model-value="userName" readonly />
        </el-form-item>
        <el-form-item label="所属租户">
          <el-input :model-value="tenantName" readonly />
        </el-form-item>
        <el-form-item label="Email">
          <el-input :model-value="mail" readonly />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input :model-value="phone" readonly />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="user-profile-dialog__footer">
        <el-button type="primary" @click="visible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>

  <AvatarCropDialog v-model="cropVisible" :source-file="cropSourceFile" @confirm="submitAvatar" />
</template>

<style scoped>
.user-profile-dialog {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.user-profile-dialog__avatar-block {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-profile-dialog__upload-btn {
  min-width: 84px;
}

.user-profile-dialog__avatar-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.user-profile-dialog__clear-btn {
  padding-left: 4px;
  padding-right: 4px;
}

.user-profile-dialog__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
