<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance } from 'element-plus';

const model = defineModel<{
  categoryName: string;
  isShow: string;
}>({ required: true });

const formRef = ref<FormInstance>();

defineExpose({
  resetFields: () => formRef.value?.resetFields?.()
});
</script>

<template>
  <el-form ref="formRef" label-position="top" :model>
    <el-form-item label="显示状态" prop="isShow">
      <el-select v-model="model.isShow" clearable placeholder="请选择显示状态" class="w-full">
        <el-option label="显示" value="1" />
        <el-option label="隐藏" value="0" />
      </el-select>
    </el-form-item>
  </el-form>
</template>
