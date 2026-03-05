<script setup lang="ts">
  import { ref } from "vue";
  import type { FormInstance } from "element-plus";

  const model = defineModel<{
    roleName: string;
  }>({ required: true });

  const formRef = ref<FormInstance>();

  defineExpose({
    resetFields: () => formRef.value?.resetFields?.(),
  });
</script>

<template>
  <el-form ref="formRef" label-position="top" :model>
    <el-form-item label="角色名称" prop="roleName">
      <el-input v-model.trim="model.roleName" clearable placeholder="请输入角色名称" />
    </el-form-item>
  </el-form>
</template>
