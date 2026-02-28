<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

const model = defineModel<{
  orgName: string
}>({ required: true })

const formRef = ref<FormInstance>()

defineExpose({
  resetFields: () => {
    formRef.value?.resetFields?.()
  }
})
</script>

<template>
  <el-form ref="formRef" label-position="top" :model="model" class="org-search-form">
    <el-form-item label="组织名称" prop="orgName">
      <el-input v-model.trim="model.orgName" clearable placeholder="请输入组织名称" class="w-full" />
    </el-form-item>
  </el-form>
</template>

<style scoped>
.org-search-form {
  width: 100%;
}
</style>
