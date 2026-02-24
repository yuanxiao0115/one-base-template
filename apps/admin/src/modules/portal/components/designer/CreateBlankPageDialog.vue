<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

defineOptions({
  name: 'CreateBlankPageDialog',
});

const props = defineProps<{
  modelValue: boolean;
  title?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'submit', payload: { tabName: string }): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const formRef = ref<FormInstance>();
const form = reactive({
  tabName: '',
});

const rules: FormRules = {
  tabName: [{ required: true, message: '请输入页面名称', trigger: 'blur' }],
};

watch(
  () => visible.value,
  (v) => {
    if (!v) return;
    form.tabName = '';
    nextTick(() => formRef.value?.clearValidate());
  }
);

function onCancel() {
  visible.value = false;
}

async function onSubmit() {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return;
  const tabName = form.tabName.trim();
  if (!tabName) return;
  emit('submit', { tabName });
}
</script>

<template>
  <el-dialog v-model="visible" :title="title || '新建空白页'" width="520px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="页面名称" prop="tabName">
        <el-input v-model="form.tabName" placeholder="例如：首页" maxlength="32" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="onSubmit">创建并编辑</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

