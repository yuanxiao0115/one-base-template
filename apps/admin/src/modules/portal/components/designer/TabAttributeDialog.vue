<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

import type { PortalTab } from '../../types';

defineOptions({
  name: 'PortalTabAttributeDialog',
});

type DialogMode = 'create' | 'edit';

const props = defineProps<{
  modelValue: boolean;
  mode: DialogMode;
  loading?: boolean;
  initial?: Partial<PortalTab>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'submit', payload: {
    tabName: string;
    tabType: number;
    sort: number;
    tabUrl?: string;
    tabUrlOpenMode?: number;
    tabUrlSsoType?: number;
  }): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const mode = computed(() => props.mode);

const title = computed(() => (props.mode === 'create' ? '新建页面' : '属性设置'));

const formRef = ref<FormInstance>();

const form = reactive({
  tabName: '',
  tabType: 2,
  sort: 1,
  tabUrl: '',
  tabUrlOpenMode: 1,
  tabUrlSsoType: 1,
});

const tabTypeOptions = [
  { key: 1, label: '导航组' },
  { key: 2, label: '空白页' },
  { key: 3, label: '链接' },
];

const openModeOptions = [
  { key: 1, label: 'iframe内嵌' },
  { key: 2, label: '浏览器新页签' },
];

const ssoTypeOptions = [
  { key: 1, label: '不拼接' },
  { key: 4, label: '拼接token' },
  { key: 3, label: '拼接ticket' },
];

const rules: FormRules = {
  tabName: [{ required: true, message: '请输入页面名称', trigger: 'blur' }],
  tabType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序序号', trigger: 'blur' }],
  tabUrl: [
    {
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (form.tabType !== 3) return callback();
        const v = typeof value === 'string' ? value.trim() : '';
        if (!v) return callback(new Error('请输入地址'));
        callback();
      },
    },
  ],
  tabUrlOpenMode: [
    {
      trigger: 'change',
      validator: (_rule, value, callback) => {
        if (form.tabType !== 3) return callback();
        if (!value) return callback(new Error('请选择打开方式'));
        callback();
      },
    },
  ],
  tabUrlSsoType: [
    {
      trigger: 'change',
      validator: (_rule, value, callback) => {
        if (form.tabType !== 3) return callback();
        if (!value) return callback(new Error('请选择单点方式'));
        callback();
      },
    },
  ],
};

function hydrateFromInitial(initial: Partial<PortalTab> | undefined) {
  form.tabName = typeof initial?.tabName === 'string' ? initial.tabName : '';
  form.tabType = typeof initial?.tabType === 'number' ? initial.tabType : 2;
  form.sort = Number(initial?.sort ?? initial?.tabOrder ?? initial?.order ?? 1) || 1;

  form.tabUrl = typeof initial?.tabUrl === 'string' ? initial.tabUrl : '';
  form.tabUrlOpenMode = typeof initial?.tabUrlOpenMode === 'number' ? initial.tabUrlOpenMode : 1;
  form.tabUrlSsoType = typeof initial?.tabUrlSsoType === 'number' ? initial.tabUrlSsoType : 1;
}

watch(
  () => visible.value,
  (v) => {
    if (!v) return;
    hydrateFromInitial(props.initial);
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

  emit('submit', {
    tabName,
    tabType: Number(form.tabType),
    sort: Number(form.sort) || 1,
    tabUrl: form.tabType === 3 ? form.tabUrl.trim() : undefined,
    tabUrlOpenMode: form.tabType === 3 ? form.tabUrlOpenMode : undefined,
    tabUrlSsoType: form.tabType === 3 ? form.tabUrlSsoType : undefined,
  });
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="640px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="名称" prop="tabName">
        <el-input v-model="form.tabName" placeholder="请输入页面名称" maxlength="32" show-word-limit />
      </el-form-item>

      <el-form-item label="类型" prop="tabType">
        <el-radio-group v-model="form.tabType" :disabled="mode === 'edit'">
          <el-radio v-for="opt in tabTypeOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="form.tabType === 3">
        <el-form-item label="地址" prop="tabUrl">
          <el-input v-model="form.tabUrl" placeholder="请输入链接地址" maxlength="500" show-word-limit />
        </el-form-item>

        <el-form-item label="打开方式" prop="tabUrlOpenMode">
          <el-radio-group v-model="form.tabUrlOpenMode">
            <el-radio v-for="opt in openModeOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="单点方式" prop="tabUrlSsoType">
          <el-radio-group v-model="form.tabUrlSsoType">
            <el-radio v-for="opt in ssoTypeOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>

      <el-form-item label="同级序号" prop="sort">
        <el-input-number v-model="form.sort" controls-position="right" :min="1" :value-on-clear="1" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="onSubmit">{{ mode === 'create' ? '创建' : '保存' }}</el-button>
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
