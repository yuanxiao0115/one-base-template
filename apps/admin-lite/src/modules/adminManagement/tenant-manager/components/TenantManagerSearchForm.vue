<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance } from 'element-plus';

const model = defineModel<{
  tenantName: string;
  isEnable: string | boolean;
}>({ required: true });

const formRef = ref<FormInstance>();

defineExpose({
  resetFields: () => {
    formRef.value?.resetFields?.();
  }
});
</script>

<template>
  <el-form ref="formRef" label-position="top" :model class="tenant-manager-search-form">
    <el-form-item label="租户名称" prop="tenantName">
      <el-input v-model.trim="model.tenantName" clearable placeholder="请输入租户名称" />
    </el-form-item>
    <el-form-item label="状态" prop="isEnable">
      <el-select v-model="model.isEnable" clearable placeholder="请选择状态" class="w-full">
        <el-option label="已启用" :value="true" />
        <el-option label="已停用" :value="false" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.tenant-manager-search-form {
  width: 100%;
}
</style>
