<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { message } from '../../feedback/message';
import type {
  AccountCenterChangePassword,
  AccountCenterCheckPassword,
  AccountCenterEncryptPassword,
  AccountCenterResponse
} from './types';

interface PasswordFormModel {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const DEFAULT_PASSWORD_REGEX =
  /^(?![A-Za-z]+$)(?![A-Z\d]+$)(?![A-Z\W_]+$)(?![a-z\d]+$)(?![a-z\W_]+$)(?![\d\W_]+$)\S{8,20}$/;

function identityEncryptPassword(plainText: string): string {
  return plainText;
}

function defaultResolveSuccess(response: AccountCenterResponse): boolean {
  const code = response?.code;
  return code === 200 || code === 0 || String(code) === '200' || String(code) === '0';
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    checkPassword: AccountCenterCheckPassword;
    changePassword: AccountCenterChangePassword;
    encryptPassword?: AccountCenterEncryptPassword;
    passwordPattern?: RegExp;
    passwordRuleMessage?: string;
    resolveSuccess?: (response: AccountCenterResponse) => boolean;
  }>(),
  {
    encryptPassword: undefined,
    passwordPattern: () =>
      /^(?![A-Za-z]+$)(?![A-Z\d]+$)(?![A-Z\W_]+$)(?![a-z\d]+$)(?![a-z\W_]+$)(?![\d\W_]+$)\S{8,20}$/,
    passwordRuleMessage: '密码长度8-20位，至少包含大小写字母、数字、特殊字符中的3种及以上',
    resolveSuccess: undefined
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'success'): void;
}>();

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const form = reactive<PasswordFormModel>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const encryptPassword = computed<AccountCenterEncryptPassword>(
  () => props.encryptPassword ?? identityEncryptPassword
);

const passwordPattern = computed<RegExp>(() => props.passwordPattern ?? DEFAULT_PASSWORD_REGEX);

const resolveSuccess = computed<(response: AccountCenterResponse) => boolean>(
  () => props.resolveSuccess ?? defaultResolveSuccess
);

watch(
  () => props.modelValue,
  (nextVisible) => {
    visible.value = nextVisible;
    if (!nextVisible) {
      resetForm();
    }
  },
  { immediate: true }
);

watch(visible, (nextVisible) => {
  emit('update:modelValue', nextVisible);
  if (!nextVisible) {
    resetForm();
  }
});

function validateOldPassword(_rule: unknown, value: string, callback: (error?: Error) => void) {
  if (!value) {
    callback(new Error('请输入旧密码'));
    return;
  }

  props
    .checkPassword({
      oldPassword: encryptPassword.value(value.trim())
    })
    .then((response) => {
      if (resolveSuccess.value(response) && response.data) {
        callback();
        return;
      }
      callback(new Error(response.message || '原始密码不正确'));
    })
    .catch((error) => {
      const errorMessage = error instanceof Error ? error.message : '旧密码校验失败';
      callback(new Error(errorMessage));
    });
}

function validateNewPassword(_rule: unknown, value: string, callback: (error?: Error) => void) {
  if (!value) {
    callback(new Error('请输入新密码'));
    return;
  }

  if (value === form.oldPassword) {
    callback(new Error('新密码不能与原密码相同'));
    return;
  }

  passwordPattern.value.lastIndex = 0;
  if (!passwordPattern.value.test(value)) {
    callback(new Error(props.passwordRuleMessage));
    return;
  }

  callback();
}

function validateConfirmPassword(_rule: unknown, value: string, callback: (error?: Error) => void) {
  if (!value) {
    callback(new Error('请确认新密码'));
    return;
  }

  if (value !== form.newPassword) {
    callback(new Error('两次输入的新密码不一致'));
    return;
  }

  callback();
}

const rules: FormRules<PasswordFormModel> = {
  oldPassword: [
    {
      validator: validateOldPassword,
      trigger: 'blur'
    }
  ],
  newPassword: [
    {
      validator: validateNewPassword,
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    {
      validator: validateConfirmPassword,
      trigger: 'blur'
    }
  ]
};

function resetForm() {
  form.oldPassword = '';
  form.newPassword = '';
  form.confirmPassword = '';
  formRef.value?.clearValidate();
}

async function onSubmit() {
  if (submitting.value) {
    return;
  }

  const validator = formRef.value;
  if (!validator) {
    return;
  }

  const valid = await validator.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitting.value = true;
  try {
    const response = await props.changePassword({
      oldPassword: encryptPassword.value(form.oldPassword.trim()),
      newPassword: encryptPassword.value(form.newPassword.trim())
    });
    if (!resolveSuccess.value(response)) {
      throw new Error(response.message || '修改密码失败');
    }

    message.success('密码修改成功');
    emit('success');
    visible.value = false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '修改密码失败';
    message.error(errorMessage);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="修改密码"
    width="520"
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" label-position="left">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input v-model.trim="form.oldPassword" show-password type="password" maxlength="20" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model.trim="form.newPassword" show-password type="password" maxlength="20" />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model.trim="form.confirmPassword"
          show-password
          type="password"
          maxlength="20"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="change-password-dialog__footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.change-password-dialog__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
