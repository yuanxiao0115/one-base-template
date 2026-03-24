<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  title: string;
  loading: boolean;
  labelName: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:labelName', value: string): void;
  (e: 'confirm'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const nameValue = computed({
  get: () => props.labelName,
  set: (value: string) => emit('update:labelName', value)
});

function onCancel() {
  visible.value = false;
}

function onConfirm() {
  emit('confirm');
}
</script>

<template>
  <ObCrudContainer
    v-model="visible"
    container="dialog"
    mode="create"
    :title="props.title"
    :loading="props.loading"
    confirm-text="保存"
    :dialog-width="520"
    :close-on-click-modal="false"
    @cancel="onCancel"
    @close="onCancel"
    @confirm="onConfirm"
  >
    <el-form label-position="top">
      <el-form-item label="分类名称">
        <el-input
          v-model.trim="nameValue"
          maxlength="24"
          show-word-limit
          placeholder="请输入分类名称"
          @keydown.enter.prevent="onConfirm"
        />
      </el-form-item>
    </el-form>
  </ObCrudContainer>
</template>
