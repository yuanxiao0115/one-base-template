<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { UploadProps } from 'element-plus';
import type { AppUser } from '@one-base-template/core';
import { message } from '@one-base-template/ui';
import authAccountService from '@/services/auth/auth-account-service';
import {
  buildAvatarFallbackText,
  isAvatarHidden,
  setAvatarHidden
} from '@/services/auth/auth-avatar-preference-service';
import AvatarCropDialog from './AvatarCropDialog.vue';

const props = defineProps<{
  modelValue: boolean;
  user: AppUser | null;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'refresh'): void;
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

const userName = computed(() => props.user?.nickName || props.user?.name || '--');
const userAccount = computed(() => props.user?.userAccount || '--');
const tenantName = computed(() => props.user?.tenantName || '--');
const mail = computed(() => props.user?.mail || '--');
const phone = computed(() => props.user?.phone || '--');

const avatarFallback = computed(() => {
  return buildAvatarFallbackText(props.user?.nickName, props.user?.name, props.user?.userAccount);
});

const avatarSrc = computed(() => {
  const avatarVersion = avatarDisplayVersion.value;

  const userId = props.user?.id;
  if (isAvatarHidden(userId)) {
    return '';
  }

  if (userId) {
    return `/cmict/file/user/avatar/${String(userId)}?timestamp=${avatarTimestamp.value}&version=${avatarVersion}`;
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', String(userId));

    const response = await authAccountService.uploadAvatar(formData);
    if (response.code !== 200) {
      throw new Error(response.message || '头像上传失败');
    }

    setAvatarHidden(userId, false);
    avatarDisplayVersion.value += 1;
    avatarTimestamp.value = Date.now();
    emit('refresh');
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
  if (!setAvatarHidden(userId, true)) {
    message.error('未获取到用户信息，无法清空头像');
    return;
  }

  avatarDisplayVersion.value += 1;
  avatarTimestamp.value = Date.now();
  emit('refresh');
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
