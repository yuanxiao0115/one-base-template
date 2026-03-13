<script setup lang="ts">
  import {
    createDefaultPortalLinkConfig,
    mergePortalLinkConfig,
    type PortalLinkConfig,
    type PortalLinkOpenType,
  } from './portal-link';

  withDefaults(
    defineProps<{
      pathLabel?: string;
      pathPlaceholder?: string;
      paramKeyLabel?: string;
      paramKeyPlaceholder?: string;
      valueKeyLabel?: string;
      valueKeyPlaceholder?: string;
      openTypeLabel?: string;
      pathMaxlength?: number;
      keyMaxlength?: number;
    }>(),
    {
      pathLabel: '跳转路径',
      pathPlaceholder: '例如：/portal/detail 或 https://example.com',
      paramKeyLabel: '参数 key',
      paramKeyPlaceholder: '例如：id',
      valueKeyLabel: '参数取值字段 key',
      valueKeyPlaceholder: '例如：id / code',
      openTypeLabel: '打开方式',
      pathMaxlength: 240,
      keyMaxlength: 60,
    }
  );

  const modelValue = defineModel<PortalLinkConfig>({
    default: () => createDefaultPortalLinkConfig(),
  });

  modelValue.value = mergePortalLinkConfig(modelValue.value);

  const OPEN_TYPE_OPTIONS: Array<{ label: string; value: PortalLinkOpenType }> = [
    { label: 'router（站内）', value: 'router' },
    { label: 'newTab（新窗口）', value: 'newTab' },
    { label: 'current（当前窗口）', value: 'current' },
  ];

  defineOptions({
    name: 'PortalActionLinkField',
  });
</script>

<template>
  <el-form-item :label="pathLabel">
    <el-input
      v-model.trim="modelValue.path"
      type="textarea"
      :autosize="{ minRows: 2, maxRows: 3 }"
      :maxlength="pathMaxlength"
      show-word-limit
      :placeholder="pathPlaceholder"
    />
  </el-form-item>

  <el-form-item :label="paramKeyLabel">
    <el-input
      v-model.trim="modelValue.paramKey"
      type="textarea"
      :autosize="{ minRows: 2, maxRows: 3 }"
      :maxlength="keyMaxlength"
      show-word-limit
      :placeholder="paramKeyPlaceholder"
    />
  </el-form-item>

  <el-form-item :label="valueKeyLabel">
    <el-input
      v-model.trim="modelValue.valueKey"
      type="textarea"
      :autosize="{ minRows: 2, maxRows: 3 }"
      :maxlength="120"
      show-word-limit
      :placeholder="valueKeyPlaceholder"
    />
  </el-form-item>

  <el-form-item :label="openTypeLabel">
    <el-select v-model="modelValue.openType">
      <el-option v-for="option in OPEN_TYPE_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
    </el-select>
  </el-form-item>
</template>
