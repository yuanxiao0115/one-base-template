<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { CrudFormLike } from '@one-base-template/ui';
import type { DictForm } from '../form';

const props = defineProps<{
  rules: FormRules<DictForm>;
  disabled: boolean;
}>();

const model = defineModel<DictForm>({ required: true });
const formRef = ref<FormInstance>();

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
    :rules="props.rules"
    label-position="top"
    :disabled="props.disabled"
  >
    <el-form-item label="字典编码" prop="dictCode">
      <el-input
        v-model.trim="model.dictCode"
        maxlength="50"
        show-word-limit
        placeholder="请输入字典编码"
      />
    </el-form-item>

    <el-form-item label="字典名称" prop="dictName">
      <el-input
        v-model.trim="model.dictName"
        maxlength="50"
        show-word-limit
        placeholder="请输入字典名称"
      />
    </el-form-item>

    <el-form-item label="描述" prop="remark" class="ob-crud-container__item--full">
      <el-input
        v-model.trim="model.remark"
        type="textarea"
        :rows="4"
        maxlength="200"
        show-word-limit
        placeholder="请输入描述"
      />
    </el-form-item>
  </el-form>
</template>
