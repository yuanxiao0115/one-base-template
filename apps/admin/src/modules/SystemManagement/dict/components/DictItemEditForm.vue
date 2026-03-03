<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { CrudFormLike } from '@one-base-template/ui'
import type { DictItemForm } from '../form'

const props = defineProps<{
  rules: FormRules<DictItemForm>
  disabled: boolean
}>()

const model = defineModel<DictItemForm>({ required: true })
const formRef = ref<FormInstance>()

defineExpose<CrudFormLike>({
  validate: (...args) => {
    const [callback] = args
    if (callback) {
      return formRef.value?.validate?.(callback)
    }
    return formRef.value?.validate?.()
  },
  clearValidate: (...args) => formRef.value?.clearValidate?.(...args),
  resetFields: (...args) => formRef.value?.resetFields?.(...args)
})
</script>

<template>
  <el-form
    ref="formRef"
    :model="model"
    :rules="props.rules"
    label-position="top"
    :disabled="props.disabled"
  >
    <el-form-item label="字段名称" prop="itemName">
      <el-input v-model.trim="model.itemName" maxlength="50" show-word-limit placeholder="请输入字段名称" />
    </el-form-item>

    <el-form-item label="字段键值" prop="itemValue">
      <el-input v-model.trim="model.itemValue" maxlength="50" show-word-limit placeholder="请输入字段键值" />
    </el-form-item>

    <el-form-item label="展示序位" prop="sort">
      <el-input-number v-model="model.sort" class="w-full" :min="0" :max="9999" />
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
