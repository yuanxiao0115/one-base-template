<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

defineOptions({
  name: 'PortalTemplateCreateDialog',
});

const props = defineProps<{
  modelValue: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'submit', payload: { templateName: string; description: string; templateType: number; isOpen: number }): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const formRef = ref<FormInstance>();
const form = reactive({
  templateName: '',
  description: '',
  templateType: 0, // 0=左侧导航模板（老项目默认）
  isOpen: 0, // 0=普通门户，1=匿名门户
});

const rules: FormRules = {
  templateName: [{ required: true, message: '请输入门户名称', trigger: 'blur' }],
};

watch(
  () => visible.value,
  (v) => {
    if (!v) return;
    form.templateName = '';
    form.description = '';
    form.templateType = 0;
    form.isOpen = 0;
    nextTick(() => formRef.value?.clearValidate());
  }
);

function onCancel() {
  visible.value = false;
}

async function onSubmit() {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return;

  const templateName = form.templateName.trim();
  if (!templateName) return;

  emit('submit', {
    templateName,
    description: form.description.trim(),
    templateType: Number(form.templateType) || 0,
    isOpen: Number(form.isOpen) || 0,
  });
}
</script>

<template>
  <el-dialog v-model="visible" title="新增门户模板" width="560px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="form">
      <el-form-item label="门户名称" prop="templateName">
        <el-input
          v-model="form.templateName"
          placeholder="例如：综合门户"
          maxlength="32"
          show-word-limit
          autocomplete="off"
          @keydown.enter.prevent="onSubmit"
        />
      </el-form-item>

      <el-form-item label="模板布局">
        <el-radio-group v-model="form.templateType">
          <el-radio-button :value="0">左侧导航</el-radio-button>
          <el-radio-button :value="1">顶部导航</el-radio-button>
          <el-radio-button :value="2">全屏左导航</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="门户类型">
        <el-radio-group v-model="form.isOpen">
          <el-radio-button :value="0">普通门户</el-radio-button>
          <el-radio-button :value="1">匿名门户</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="可选：用于说明门户用途、适用对象等"
          maxlength="120"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="onSubmit">创建并配置</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.form {
  padding-top: 4px;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
