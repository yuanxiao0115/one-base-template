<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { CrudFormLike } from '@one-base-template/ui';
import type { MenuPermissionForm } from '../form';
import MenuIconInput from './MenuIconInput.vue';

const props = defineProps<{
  rules: FormRules<MenuPermissionForm>;
  disabled: boolean;
}>();

const model = defineModel<MenuPermissionForm>({ required: true });
const formRef = ref<FormInstance>();

const ROOT_PARENT_ID = '0';
const SYSTEM_RESOURCE_TYPE = 1;

watch(
  () => model.value.parentId,
  () => {
    model.value.parentId = ROOT_PARENT_ID;
  },
  { immediate: true }
);

watch(
  () => model.value.resourceType,
  () => {
    model.value.resourceType = SYSTEM_RESOURCE_TYPE;
  },
  { immediate: true }
);

defineExpose<CrudFormLike>({
  validate: (...args) => {
    const [callback] = args;
    if (callback) {
      return formRef.value?.validate?.(callback);
    }
    return formRef.value?.validate?.();
  },
  clearValidate: (...args) => formRef.value?.clearValidate?.(...args),
  resetFields: (...args) => formRef.value?.resetFields?.(...args)
});
</script>

<template>
  <el-form
    ref="formRef"
    :model
    :rules="props.rules"
    label-position="top"
    :disabled="props.disabled"
  >
    <el-form-item label="上级权限" prop="parentId">
      <el-select v-model="model.parentId" class="w-full" disabled>
        <el-option label="顶级权限（系统）" value="0" />
      </el-select>
    </el-form-item>

    <el-form-item label="权限类型" prop="resourceType">
      <el-select v-model="model.resourceType" class="w-full" disabled>
        <el-option label="系统" :value="1" />
      </el-select>
    </el-form-item>

    <el-form-item label="权限名称" prop="resourceName">
      <el-input
        v-model.trim="model.resourceName"
        maxlength="30"
        show-word-limit
        placeholder="请输入系统名称"
      />
    </el-form-item>

    <el-form-item label="权限标识" prop="permissionCode">
      <el-input v-model.trim="model.permissionCode" placeholder="例如：system:admin" />
    </el-form-item>

    <el-form-item label="访问路径" prop="url">
      <el-input v-model.trim="model.url" placeholder="例如：/system" />
    </el-form-item>

    <el-form-item label="图标" prop="icon">
      <MenuIconInput
        v-model="model.icon"
        :disabled="props.disabled"
        placeholder="支持 iconfont class、ep:*、ri:*、url 或 minio id"
      />
    </el-form-item>

    <el-form-item label="排序" prop="sort">
      <el-input-number v-model="model.sort" class="w-full" :min="0" :max="9999" />
    </el-form-item>

    <el-form-item label="状态" prop="hidden">
      <el-select v-model="model.hidden" class="w-full">
        <el-option label="显示" :value="0" />
        <el-option label="隐藏" :value="1" />
      </el-select>
    </el-form-item>

    <el-form-item label="备注" prop="remark">
      <el-input
        v-model.trim="model.remark"
        type="textarea"
        :rows="3"
        maxlength="200"
        show-word-limit
        placeholder="可选"
      />
    </el-form-item>
  </el-form>
</template>
