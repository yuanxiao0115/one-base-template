<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { CrudFormLike } from '@one-base-template/ui';
import type { StarterCrudStatus } from '../api';
import type { StarterCrudForm } from '../form';

const props = defineProps<{
  rules: FormRules<StarterCrudForm>;
  disabled: boolean;
  statusOptions: ReadonlyArray<{ label: string; value: StarterCrudStatus }>;
}>();

const model = defineModel<StarterCrudForm>({ required: true });
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
    label-position="top"
    :model="model"
    :rules="props.rules"
    :disabled="props.disabled"
  >
    <el-form-item label="示例编码" prop="code">
      <el-input v-model.trim="model.code" maxlength="30" clearable placeholder="请输入示例编码" />
    </el-form-item>

    <el-form-item label="示例名称" prop="name">
      <el-input v-model.trim="model.name" maxlength="30" clearable placeholder="请输入示例名称" />
    </el-form-item>

    <el-form-item label="负责人" prop="owner">
      <el-input v-model.trim="model.owner" maxlength="20" clearable placeholder="请输入负责人" />
    </el-form-item>

    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="model.status">
        <el-radio-button v-for="item in props.statusOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="备注" prop="remark" class="ob-crud-container__item--full">
      <el-input
        v-model.trim="model.remark"
        type="textarea"
        :rows="4"
        maxlength="200"
        show-word-limit
        placeholder="请输入备注"
      />
    </el-form-item>
  </el-form>
</template>
