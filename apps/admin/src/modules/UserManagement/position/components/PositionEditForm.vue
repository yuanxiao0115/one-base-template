<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { CrudFormLike } from '@one-base-template/ui'
import type { PositionForm } from '../form'

const props = defineProps<{
  rules: FormRules<PositionForm>
  disabled: boolean
}>()
const model = defineModel<PositionForm>({ required: true })

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
    <el-form-item label="职位名称" prop="postName">
      <el-input v-model.trim="model.postName" maxlength="30" show-word-limit placeholder="请输入职位名称" />
    </el-form-item>

    <el-form-item label="显示排序" prop="sort">
      <el-input-number v-model="model.sort" class="w-full" :min="0" :max="9999" />
    </el-form-item>

    <el-form-item label="职位描述" prop="remark">
      <el-input
        v-model.trim="model.remark"
        type="textarea"
        :rows="4"
        maxlength="200"
        show-word-limit
        placeholder="请输入职位描述"
      />
    </el-form-item>
  </el-form>
</template>
