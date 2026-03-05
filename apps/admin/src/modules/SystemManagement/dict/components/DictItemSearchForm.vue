<script setup lang="ts">
  import { ref } from "vue";
  import type { FormInstance } from "element-plus";

  const model = defineModel<{
    dictId: string;
    itemName: string;
    itemValue: string;
  }>({ required: true });

  const formRef = ref<FormInstance>();

  defineExpose({
    resetFields: () => formRef.value?.resetFields?.(),
  });
</script>

<template>
  <el-form ref="formRef" label-position="top" :model>
    <el-form-item label="字段名称" prop="itemName">
      <el-input v-model.trim="model.itemName" placeholder="请输入字段名称" clearable maxlength="50" />
    </el-form-item>

    <el-form-item label="字段键值" prop="itemValue">
      <el-input v-model.trim="model.itemValue" placeholder="请输入字段键值" clearable maxlength="50" />
    </el-form-item>
  </el-form>
</template>
