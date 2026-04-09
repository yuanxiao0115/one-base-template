<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { MessageCategoryRecord, MessageTemplateFormModel } from '../types';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    categories?: MessageCategoryRecord[];
  }>(),
  {
    disabled: false,
    categories: () => []
  }
);

const model = defineModel<MessageTemplateFormModel>({ required: true });
const formRef = ref<FormInstance>();

const formRules = computed<FormRules<MessageTemplateFormModel>>(() => ({
  title: [
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
    <el-form-item label="模板名称" prop="title">
      <el-input v-model="model.title" maxlength="50" show-word-limit placeholder="请输入模板名称" />
    </el-form-item>

    <el-form-item label="消息分类" prop="cateId">
      <el-select v-model="model.cateId" clearable filterable placeholder="请选择消息分类">
        <el-option
          v-for="item in props.categories"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="模板内容" prop="content">
      <el-input
        v-model="model.content"
        type="textarea"
        :rows="8"
        maxlength="2000"
        show-word-limit
        placeholder="请输入模板内容"
      />
    </el-form-item>
  </el-form>
</template>
