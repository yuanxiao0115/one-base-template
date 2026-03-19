<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { CrudFormLike } from '@one-base-template/ui';
import type { ColumnForm, ColumnTreeOption } from '../form';

const props = defineProps<{
  rules: FormRules<ColumnForm>;
  disabled: boolean;
  columnTreeOptions: ColumnTreeOption[];
}>();

const model = defineModel<ColumnForm>({ required: true });
const formRef = ref<FormInstance>();

function handleParentChange(value: string | undefined) {
  if (value && model.value.id && value === model.value.id) {
    model.value.parentCategoryId = '';
  }
}

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
    <el-form-item label="上级栏目" prop="parentCategoryId">
      <el-tree-select
        v-model="model.parentCategoryId"
        class="w-full"
        :data="props.columnTreeOptions"
        clearable
        check-strictly
        default-expand-all
        node-key="value"
        value-key="value"
        placeholder="不选择则为顶级栏目"
        @change="handleParentChange"
      />
    </el-form-item>

    <el-form-item label="栏目名称" prop="categoryName">
      <el-input
        v-model.trim="model.categoryName"
        maxlength="50"
        show-word-limit
        placeholder="请输入栏目名称"
      />
    </el-form-item>

    <el-form-item label="是否显示" prop="isShow">
      <el-radio-group v-model="model.isShow">
        <el-radio :value="1">显示</el-radio>
        <el-radio :value="0">隐藏</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="排序" prop="sort">
      <el-input-number v-model="model.sort" class="w-full" :min="0" :max="9999" />
    </el-form-item>
  </el-form>
</template>
