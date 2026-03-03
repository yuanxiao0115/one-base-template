<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { CrudFormLike } from '@one-base-template/ui'
import type { RoleForm } from '../form'

const props = defineProps<{
  rules: FormRules<RoleForm>
  disabled: boolean
}>()

const model = defineModel<RoleForm>({ required: true })
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
    <el-form-item label="角色名称" prop="roleName">
      <el-input v-model.trim="model.roleName" maxlength="30" show-word-limit placeholder="请输入角色名称" />
    </el-form-item>

    <el-form-item label="角色编码" prop="roleCode">
      <el-input v-model.trim="model.roleCode" maxlength="50" show-word-limit placeholder="请输入角色编码" />
    </el-form-item>

    <el-form-item label="角色描述" prop="remark">
      <el-input
        v-model.trim="model.remark"
        type="textarea"
        :rows="4"
        maxlength="200"
        show-word-limit
        placeholder="请输入角色描述"
      />
    </el-form-item>
  </el-form>
</template>
