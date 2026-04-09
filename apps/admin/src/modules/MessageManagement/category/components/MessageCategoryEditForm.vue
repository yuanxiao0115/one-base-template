<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { MessageCategoryFormModel } from '../types';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
  }>(),
  {
    disabled: false
  }
);

const model = defineModel<MessageCategoryFormModel>({ required: true });
const formRef = ref<FormInstance>();

const formRules = computed<FormRules<MessageCategoryFormModel>>(() => ({
  name: [
    {
      required: true,
      message: '请输入分类名称',
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
    <el-form-item label="分类名称" prop="name">
      <el-input v-model="model.name" maxlength="30" show-word-limit placeholder="请输入分类名称" />
    </el-form-item>
  </el-form>
</template>
