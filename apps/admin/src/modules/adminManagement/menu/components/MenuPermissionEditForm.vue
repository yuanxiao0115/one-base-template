<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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

const ROOT_PARENT_ID = '0';
const SYSTEM_RESOURCE_TYPE = 1;
const MENU_RESOURCE_TYPE = 2;

const isRootParent = computed(() => model.value.parentId === ROOT_PARENT_ID);

const availableResourceTypeOptions = computed(() => {
  if (isRootParent.value) {
    return props.resourceTypeOptions.filter((item) => Number(item.key) === SYSTEM_RESOURCE_TYPE);
  }

  return props.resourceTypeOptions.filter((item) => Number(item.key) !== SYSTEM_RESOURCE_TYPE);
});

const resourceTypeDisabled = computed(() => props.disabled || isRootParent.value);

const showComponentField = computed(
  () => model.value.resourceType === MENU_RESOURCE_TYPE && model.value.openMode === 0
);

// 父级切换时，强制收敛权限类型规则：顶级只能是系统，子级不能是系统。
watch(
  () => model.value.parentId,
  (parentId) => {
    if (parentId === ROOT_PARENT_ID) {
      model.value.resourceType = SYSTEM_RESOURCE_TYPE;
      return;
    }

    if (model.value.resourceType === SYSTEM_RESOURCE_TYPE) {
      const fallbackType = availableResourceTypeOptions.value[0];
      model.value.resourceType = fallbackType ? Number(fallbackType.key) : MENU_RESOURCE_TYPE;
    }
  },
  { immediate: true }
);

// 资源类型候选变化时，自动修正非法值，避免表单保留不可选状态。
watch(
  availableResourceTypeOptions,
  (options) => {
    if (options.length === 0) {
      return;
    }

    const currentType = Number(model.value.resourceType);
    const typeInOptions = options.some((item) => Number(item.key) === currentType);
    if (!typeInOptions) {
      model.value.resourceType = Number(options[0]?.key || MENU_RESOURCE_TYPE);
    }
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
      <el-tree-select
        v-model="model.parentId"
        class="w-full"
        node-key="value"
        default-expand-all
        check-strictly
        :data="props.parentOptions"
        :props="{
          label: 'label',
          children: 'children',
          disabled: 'disabled'
        }"
        placeholder="请选择上级权限"
      />
    </el-form-item>

    <el-form-item label="权限类型" prop="resourceType">
      <el-select
        v-model="model.resourceType"
        class="w-full"
        placeholder="请选择权限类型"
        :disabled="resourceTypeDisabled"
      >
        <el-option
          v-for="item in availableResourceTypeOptions"
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

    <el-form-item v-if="showComponentField" label="组件路径" prop="component">
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
