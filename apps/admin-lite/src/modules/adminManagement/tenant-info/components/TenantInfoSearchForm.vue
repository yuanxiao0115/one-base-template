<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance } from 'element-plus';

const model = defineModel<{
  tenantName: string;
  id: string;
  contactName: string;
  tenantState: string | number;
}>({ required: true });

const formRef = ref<FormInstance>();

defineExpose({
  resetFields: () => {
    formRef.value?.resetFields?.();
  }
});
</script>

<template>
  <el-form ref="formRef" label-position="top" :model class="tenant-info-search-form">
    <el-form-item label="租户ID" prop="id">
      <el-input v-model.trim="model.id" clearable placeholder="请输入租户ID" />
    </el-form-item>
    <el-form-item label="租户名称" prop="tenantName">
      <el-input v-model.trim="model.tenantName" clearable placeholder="请输入租户名称" />
    </el-form-item>
    <el-form-item label="联系人" prop="contactName">
      <el-input v-model.trim="model.contactName" clearable placeholder="请输入联系人" />
    </el-form-item>
    <el-form-item label="租户状态" prop="tenantState">
      <el-select v-model="model.tenantState" clearable placeholder="请选择状态" class="w-full">
        <el-option label="正常" :value="0" />
        <el-option label="停用" :value="1" />
        <el-option label="过期" :value="2" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.tenant-info-search-form {
  width: 100%;
}
</style>
