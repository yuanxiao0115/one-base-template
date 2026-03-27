<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance } from 'element-plus';
import type { StarterCrudStatus } from '../api';
import type { StarterCrudSearchForm } from '../form';

const props = defineProps<{
  statusOptions: ReadonlyArray<{ label: string; value: StarterCrudStatus }>;
}>();

const model = defineModel<StarterCrudSearchForm>({ required: true });
const formRef = ref<FormInstance>();

defineExpose({
  resetFields: () => formRef.value?.resetFields?.()
});
</script>

<template>
  <el-form ref="formRef" label-position="top" :model="model">
    <el-form-item label="负责人" prop="owner">
      <el-input v-model.trim="model.owner" clearable maxlength="20" placeholder="请输入负责人" />
    </el-form-item>

    <el-form-item label="状态" prop="status">
      <el-select v-model="model.status" clearable placeholder="请选择状态" class="w-full">
        <el-option
          v-for="item in props.statusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
