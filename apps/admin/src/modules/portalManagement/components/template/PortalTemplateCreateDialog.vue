<script setup lang="ts">
  import { computed, nextTick, reactive, ref, watch } from "vue";
  import type { FormInstance, FormRules } from "element-plus";

  type TemplateDialogMode = "create" | "edit" | "copy";

  interface TemplateDialogValue {
    templateName?: string;
    description?: string;
    templateType?: number;
    isOpen?: number;
  }

  const props = defineProps<{
    modelValue: boolean;
    loading?: boolean;
    mode?: TemplateDialogMode;
    initialValue?: TemplateDialogValue;
    title?: string;
    submitText?: string;
  }>();

  const emit = defineEmits<{
    (e: "update:modelValue", v: boolean): void;
    (
      e: "submit",
      payload: {
        templateName: string;
        description: string;
        templateType: number;
        isOpen: number;
      }
    ): void;
  }>();

  defineOptions({
    name: "PortalTemplateCreateDialog",
  });

  const visible = computed({
    get: () => props.modelValue,
    set: (v: boolean) => emit("update:modelValue", v),
  });

  const dialogMode = computed<TemplateDialogMode>(() => props.mode ?? "create");

  const dialogTitle = computed(() => {
    if (props.title) {
      return props.title;
    }
    if (dialogMode.value === "edit") {
      return "编辑门户模板";
    }
    if (dialogMode.value === "copy") {
      return "复制门户模板";
    }
    return "新增门户模板";
  });

  const submitButtonText = computed(() => {
    if (props.submitText) {
      return props.submitText;
    }
    if (dialogMode.value === "edit") {
      return "保存";
    }
    if (dialogMode.value === "copy") {
      return "复制";
    }
    return "创建并配置";
  });

  const formRef = ref<FormInstance>();
  const form = reactive({
    templateName: "",
    description: "",
    templateType: 0, // 0=左侧导航模板（老项目默认）
    isOpen: 0, // 0=普通门户，1=匿名门户
  });

  const rules: FormRules = {
    templateName: [
      {
        required: true,
        message: "请输入门户名称",
        trigger: "blur",
      },
    ],
  };

  watch(
    () => visible.value,
    (v) => {
      if (!v) {
        return;
      }
      const source = props.initialValue ?? {};
      form.templateName = (source.templateName ?? "").trim();
      form.description = source.description ?? "";
      form.templateType = Number(source.templateType) || 0;
      form.isOpen = Number(source.isOpen) || 0;
      nextTick(() => formRef.value?.clearValidate());
    }
  );

  function onCancel() {
    visible.value = false;
  }

  async function onSubmit() {
    const ok = await formRef.value?.validate().catch(() => false);
    if (!ok) {
      return;
    }

    const templateName = form.templateName.trim();
    if (!templateName) {
      return;
    }

    emit("submit", {
      templateName,
      description: form.description.trim(),
      templateType: Number(form.templateType) || 0,
      isOpen: Number(form.isOpen) || 0,
    });
  }
</script>

<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="560px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules label-position="top" class="form">
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
        <el-button type="primary" :loading @click="onSubmit">{{ submitButtonText }}</el-button>
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
