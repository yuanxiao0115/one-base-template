<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { CrudFormLike } from '@one-base-template/ui';
import type { PermissionTypeOption } from '../types';
import type { MenuPermissionForm, ParentOption } from '../form';
import MenuIconInput from './MenuIconInput.vue';

const props = defineProps<{
  rules: FormRules<MenuPermissionForm>;
  disabled: boolean;
  parentOptions: ParentOption[];
  resourceTypeOptions: PermissionTypeOption[];
}>();

const model = defineModel<MenuPermissionForm>({ required: true });
const formRef = ref<FormInstance>();

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
      <el-select v-model="model.parentId" class="w-full" placeholder="请选择上级权限">
        <el-option
          v-for="item in props.parentOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          :disabled="item.disabled"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="权限类型" prop="resourceType">
      <el-select v-model="model.resourceType" class="w-full" placeholder="请选择权限类型">
        <el-option
          v-for="item in props.resourceTypeOptions"
          :key="item.key"
          :label="item.value"
          :value="Number(item.key)"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="权限名称" prop="resourceName">
      <el-input
        v-model.trim="model.resourceName"
        maxlength="30"
        show-word-limit
        placeholder="请输入权限名称"
      />
    </el-form-item>

    <el-form-item label="权限标识" prop="permissionCode">
      <el-input v-model.trim="model.permissionCode" placeholder="例如：system:permission:list" />
    </el-form-item>

    <el-form-item label="访问路径" prop="url">
      <el-input v-model.trim="model.url" placeholder="例如：/system/permission" />
    </el-form-item>

    <el-form-item label="组件路径" prop="component">
      <el-input v-model.trim="model.component" placeholder="例如：system/permission/index" />
    </el-form-item>

    <el-form-item label="图标" prop="icon">
      <MenuIconInput
        v-model="model.icon"
        :disabled="props.disabled"
        placeholder="支持 iconfont class、ep:*、ri:*、url 或 minio id"
      />
    </el-form-item>

    <el-form-item label="跳转地址" prop="redirect">
      <el-input v-model.trim="model.redirect" placeholder="可选" />
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

    <el-form-item label="缓存路由" prop="routeCache">
      <el-select v-model="model.routeCache" class="w-full">
        <el-option label="否" :value="0" />
        <el-option label="是" :value="1" />
      </el-select>
    </el-form-item>

    <el-form-item label="打开方式" prop="openMode">
      <el-select v-model="model.openMode" class="w-full">
        <el-option label="内部" :value="0" />
        <el-option label="外部" :value="1" />
      </el-select>
    </el-form-item>

    <el-form-item label="图片地址" prop="image">
      <el-input v-model.trim="model.image" placeholder="可选" />
    </el-form-item>

    <el-form-item label="备注" prop="remark" class="ob-crud-container__item--full">
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
