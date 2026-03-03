<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

const model = defineModel<{
  dictCode: string
  dictName: string
}>({ required: true })

const formRef = ref<FormInstance>()

defineExpose({
  resetFields: () => formRef.value?.resetFields?.()
})
</script>

<template>
  <el-form ref="formRef" label-position="top" :model="model">
    <el-form-item label="字典编码" prop="dictCode">
      <el-input
        v-model.trim="model.dictCode"
        placeholder="请输入字典编码"
        clearable
        maxlength="50"
      />
    </el-form-item>

    <el-form-item label="字典名称" prop="dictName">
      <el-input
        v-model.trim="model.dictName"
        placeholder="请输入字典名称"
        clearable
        maxlength="50"
      />
    </el-form-item>
  </el-form>
</template>
