<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { LoginPageFormModel } from '../types';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
  }>(),
  {
    disabled: false
  }
);

const model = defineModel<LoginPageFormModel>({ required: true });
const formRef = ref<FormInstance>();

const formRules = computed<FormRules<LoginPageFormModel>>(() => ({
  modelName: [
    {
      required: true,
      message: '请输入模板名称',
      trigger: ['blur', 'change']
    }
  ]
}));

defineExpose({
  validate: (...args: Parameters<NonNullable<FormInstance['validate']>>) => {
    const [callback] = args;
    if (callback) {
      return formRef.value?.validate?.(callback);
    }
    return formRef.value?.validate?.();
  },
  clearValidate: (...args: Parameters<NonNullable<FormInstance['clearValidate']>>) =>
    formRef.value?.clearValidate?.(...args),
  resetFields: (...args: Parameters<NonNullable<FormInstance['resetFields']>>) =>
    formRef.value?.resetFields?.(...args)
});
</script>

<template>
  <el-form ref="formRef" :model :rules="formRules" :disabled="props.disabled" label-position="top">
    <el-form-item label="模板名称" prop="modelName">
      <el-input
        v-model="model.modelName"
        maxlength="50"
        show-word-limit
        placeholder="请输入模板名称"
      />
    </el-form-item>

    <el-form-item label="Logo 文字" prop="webLogoText">
      <el-input
        v-model="model.webLogoText"
        maxlength="30"
        show-word-limit
        placeholder="请输入 Logo 文案"
      />
    </el-form-item>

    <el-form-item label="Logo 素材 ID" prop="webLoginLogoId">
      <el-input v-model="model.webLoginLogoId" placeholder="请输入 logo 素材 id" />
    </el-form-item>

    <el-form-item label="背景素材 ID（可多选）" prop="loginPageFodderIds">
      <el-select
        v-model="model.loginPageFodderIds"
        multiple
        filterable
        allow-create
        default-first-option
        clearable
        collapse-tags
        collapse-tags-tooltip
        placeholder="输入 fodderId 后按回车确认"
      />
    </el-form-item>

    <el-form-item label="登录框位置" prop="boxLocation">
      <el-radio-group v-model="model.boxLocation">
        <el-radio value="right">右侧</el-radio>
        <el-radio value="center">居中</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="登录框透明度" prop="boxOpacity">
      <el-slider v-model="model.boxOpacity" :min="0" :max="100" :step="1" />
    </el-form-item>
  </el-form>
</template>
