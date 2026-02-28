<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

const model = defineModel<{
  postName: string
}>({ required: true })

const formRef = ref<FormInstance>()

defineExpose({
  resetFields: () => {
    formRef.value?.resetFields?.()
  }
})
</script>

<template>
  <el-form ref="formRef" label-position="top" :model="model" class="position-search-form">
    <el-form-item label="职位名称" prop="postName">
      <el-input v-model.trim="model.postName" clearable placeholder="请输入职位名称" class="w-full" />
    </el-form-item>
  </el-form>
</template>

<style scoped>
.position-search-form {
  width: 100%;
}
</style>
