<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    meg?: string;
    type?: string;
  }>(),
  {
    title: '政数小灵',
    meg: '',
    type: ''
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

function closeDialog() {
  emit('update:modelValue', false);
}
</script>

<template>
  <el-dialog :model-value="props.modelValue" :title="props.title" width="760px" @close="closeDialog">
    <div class="chat-model-compat">
      <p class="chat-model-compat__desc">AI 助手组件在 admin-lite 中已迁移为轻量版本，后续可按需接入真实大模型服务。</p>
      <p class="chat-model-compat__label">当前透传类型：{{ props.type || '-' }}</p>
      <p class="chat-model-compat__label">当前透传内容：</p>
      <el-input :model-value="props.meg" type="textarea" :rows="8" readonly />
    </div>
    <template #footer>
      <el-button @click="closeDialog">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.chat-model-compat {
  display: grid;
  gap: 10px;
}

.chat-model-compat__desc {
  margin: 0;
  color: var(--el-text-color-regular);
}

.chat-model-compat__label {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
