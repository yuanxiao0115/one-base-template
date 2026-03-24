<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FormInstance, FormItemRule, FormRules } from 'element-plus';
import type { CrudFormLike } from '@one-base-template/ui';
import type { TenantInfoForm } from '../types';

const props = defineProps<{
  rules: FormRules<TenantInfoForm>;
  disabled: boolean;
  mode: 'create' | 'detail' | 'edit';
  checkFieldUnique: (params: {
    id?: string;
    tenantName?: string;
    contactPhone?: string;
  }) => Promise<boolean>;
}>();

const model = defineModel<TenantInfoForm>({ required: true });

const formRef = ref<FormInstance>();

const uniqueTenantNameRule: FormItemRule = {
  trigger: 'blur',
  validator: (_, value, callback) => {
    const tenantName = String(value || '').trim();
    if (!tenantName || props.mode === 'detail') {
      callback();
      return;
    }

    void props
      .checkFieldUnique({
        id: model.value.id || undefined,
        tenantName,
        contactPhone: model.value.contactPhone
      })
      .then((isUnique) => {
        if (!isUnique) {
          callback(new Error('已存在相同租户名称或联系方式'));
          return;
        }

        callback();
      })
      .catch((error: unknown) => {
        callback(new Error(error instanceof Error ? error.message : '租户唯一性校验失败'));
      });
  }
};

const uniqueContactPhoneRule: FormItemRule = {
  trigger: 'blur',
  validator: (_, value, callback) => {
    const contactPhone = String(value || '').trim();
    if (!contactPhone || props.mode === 'detail') {
      callback();
      return;
    }

    void props
      .checkFieldUnique({
        id: model.value.id || undefined,
        tenantName: model.value.tenantName,
        contactPhone
      })
      .then((isUnique) => {
        if (!isUnique) {
          callback(new Error('已存在相同租户名称或联系方式'));
          return;
        }

        callback();
      })
      .catch((error: unknown) => {
        callback(new Error(error instanceof Error ? error.message : '租户唯一性校验失败'));
      });
  }
};

const mergedRules = computed<FormRules<TenantInfoForm>>(() => {
  const baseRules = props.rules || {};
  const tenantNameRules = Array.isArray(baseRules.tenantName)
    ? [...baseRules.tenantName]
    : baseRules.tenantName
      ? [baseRules.tenantName]
      : [];
  const contactPhoneRules = Array.isArray(baseRules.contactPhone)
    ? [...baseRules.contactPhone]
    : baseRules.contactPhone
      ? [baseRules.contactPhone]
      : [];

  return {
    ...baseRules,
    tenantName: [...tenantNameRules, uniqueTenantNameRule],
    contactPhone: [...contactPhoneRules, uniqueContactPhoneRule]
  };
});

defineExpose<CrudFormLike>({
  validate: (...args) => {
    const [callback] = args;
    if (callback) {
      return formRef.value?.validate?.(callback);
    }
    return formRef.value?.validate?.();
  },
  clearValidate: (...args) => formRef.value?.clearValidate?.(...args),
  resetFields: (...args) => formRef.value?.resetFields?.(...args)
});
</script>

<template>
  <el-form
    ref="formRef"
    :model
    :rules="mergedRules"
    label-position="top"
    :disabled="props.disabled"
  >
    <el-form-item label="租户名称" prop="tenantName">
      <el-input v-model.trim="model.tenantName" maxlength="18" show-word-limit />
    </el-form-item>

    <el-form-item label="联系人" prop="contactName">
      <el-input v-model.trim="model.contactName" maxlength="18" show-word-limit />
    </el-form-item>

    <el-form-item label="联系方式" prop="contactPhone">
      <el-input v-model.trim="model.contactPhone" maxlength="11" />
    </el-form-item>

    <el-form-item label="最大用户数" prop="maxNumber">
      <el-input-number v-model="model.maxNumber" class="w-full" :min="1" :max="999999" />
    </el-form-item>

    <el-form-item label="租户状态" prop="tenantState">
      <el-select v-model="model.tenantState" class="w-full">
        <el-option label="正常" :value="0" />
        <el-option label="停用" :value="1" />
      </el-select>
    </el-form-item>

    <el-form-item label="管理员账号" prop="managerAccount">
      <el-input v-model.trim="model.managerAccount" maxlength="32" />
    </el-form-item>

    <el-form-item label="到期时间" prop="expireTime">
      <el-date-picker
        v-model="model.expireTime"
        type="datetime"
        class="w-full"
        value-format="YYYY-MM-DD HH:mm:ss"
        format="YYYY-MM-DD HH:mm:ss"
      />
    </el-form-item>

    <el-form-item label="备注" prop="remark">
      <el-input
        v-model.trim="model.remark"
        type="textarea"
        :rows="4"
        maxlength="200"
        show-word-limit
      />
    </el-form-item>
  </el-form>
</template>
