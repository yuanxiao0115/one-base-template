<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance } from 'element-plus';
import type { PermissionTypeOption } from '../api';

const props = defineProps<{
  resourceTypeOptions: PermissionTypeOption[]
}>();

const model = defineModel<{
  resourceName: string
  resourceType: string
}>({ required: true });

const formRef = ref<FormInstance>();

defineExpose({
  resetFields: () => formRef.value?.resetFields?.()
});
</script>

<template>
  <el-form ref="formRef" label-position="top" :model>
    <el-form-item label="权限类型" prop="resourceType">
      <el-select v-model="model.resourceType" clearable placeholder="请选择权限类型" class="w-full">
        <el-option
          v-for="item in props.resourceTypeOptions"
          :key="item.key"
          :label="item.value"
          :value="item.key"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
