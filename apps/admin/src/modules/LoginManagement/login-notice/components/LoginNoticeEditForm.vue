<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { LoginNoticeFormModel } from '../types';
import { isHttpUrl } from '../../shared/utils';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    pickingUsers?: boolean;
  }>(),
  {
    disabled: false,
    pickingUsers: false
  }
);

const emit = defineEmits<{
  pickUsers: [];
}>();

const model = defineModel<LoginNoticeFormModel>({ required: true });
const formRef = ref<FormInstance>();

const formRules = computed<FormRules<LoginNoticeFormModel>>(() => ({
  title: [
    {
      required: true,
      message: '请输入标题',
      trigger: ['blur', 'change']
    }
  ],
  content: [
    {
      required: true,
      message: '请输入信息内容',
      trigger: ['blur', 'change']
    }
  ],
  frequency: [
    {
      required: true,
      message: '请选择频率',
      trigger: ['blur', 'change']
    }
  ],
  time: [
    {
      validator: (_, value, callback) => {
        if (Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
          callback();
          return;
        }
        callback(new Error('请选择通知时间范围'));
      },
      trigger: ['change', 'blur']
    }
  ],
  userPopUps: [
    {
      validator: (_, value, callback) => {
        if (model.value.notificationScope === 0) {
          callback();
          return;
        }

        if (Array.isArray(value) && value.length > 0) {
          callback();
          return;
        }

        callback(new Error('指定用户范围时必须选择用户'));
      },
      trigger: ['change', 'blur']
    }
  ],
  linkUrl: [
    {
      validator: (_, value, callback) => {
        if (model.value.showBtn !== 1) {
          callback();
          return;
        }

        if (!value) {
          callback(new Error('展示按钮时必须填写跳转链接'));
          return;
        }

        if (!isHttpUrl(value)) {
          callback(new Error('请输入正确的 http/https 链接'));
          return;
        }
        callback();
      },
      trigger: ['blur', 'change']
    }
  ]
}));

const selectedUserText = computed(() => {
  if (!Array.isArray(model.value.userPopUps) || model.value.userPopUps.length === 0) {
    return '';
  }
  return model.value.userPopUps.map((item) => item.nickName).join(', ');
});

function triggerPickUsers() {
  if (props.disabled) {
    return;
  }
  emit('pickUsers');
}

defineExpose({
  validate: (...args: Parameters<NonNullable<FormInstance['validate']>>) => {
    const [callback] = args;
    if (callback) {
      return formRef.value?.validate?.(callback);
    }
    return formRef.value?.validate?.();
  },
  clearValidate: (...args: Parameters<NonNullable<FormInstance['clearValidate']>>) =>
    formRef.value?.clearValidate?.(...args),
  resetFields: (...args: Parameters<NonNullable<FormInstance['resetFields']>>) =>
    formRef.value?.resetFields?.(...args)
});
</script>

<template>
  <el-form ref="formRef" :model :rules="formRules" :disabled="props.disabled" label-position="top">
    <el-form-item label="标题" prop="title">
      <el-input v-model="model.title" maxlength="100" show-word-limit placeholder="请输入标题" />
    </el-form-item>

    <el-form-item label="信息内容" prop="content">
      <el-input
        v-model="model.content"
        type="textarea"
        :rows="4"
        maxlength="500"
        show-word-limit
        placeholder="请输入信息内容"
      />
    </el-form-item>

    <el-form-item label="频率" prop="frequency">
      <el-select v-model="model.frequency" clearable placeholder="请选择频率">
        <el-option value="login" label="登录后提醒" />
        <el-option value="day" label="每天" />
        <el-option value="week" label="每周" />
        <el-option value="month" label="每月" />
        <el-option value="once" label="仅一次" />
      </el-select>
    </el-form-item>

    <el-form-item label="时间范围" prop="time">
      <el-date-picker
        v-model="model.time"
        type="datetimerange"
        value-format="YYYY-MM-DD HH:mm:ss"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
      />
    </el-form-item>

    <el-form-item label="通知范围" prop="notificationScope">
      <el-radio-group v-model="model.notificationScope">
        <el-radio :value="0">全部用户</el-radio>
        <el-radio :value="1">指定用户</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item v-if="model.notificationScope === 1" label="用户范围" prop="userPopUps">
      <el-input :model-value="selectedUserText" readonly placeholder="请点击按钮选择用户">
        <template #append>
          <el-button :loading="props.pickingUsers" @click="triggerPickUsers">选择用户</el-button>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item label="通知类型" prop="notificationType">
      <el-select v-model="model.notificationType" clearable placeholder="请选择通知类型">
        <el-option :value="0" label="右下角" />
        <el-option :value="1" label="中央" />
        <el-option :value="2" label="漂浮" />
      </el-select>
    </el-form-item>

    <el-form-item label="弹窗尺寸" prop="popSize">
      <el-select v-model="model.popSize" clearable placeholder="请选择弹窗尺寸">
        <el-option value="0" label="小（600x400）" />
        <el-option value="1" label="中（900x600）" />
        <el-option value="2" label="大（1200x800）" />
      </el-select>
    </el-form-item>

    <el-form-item label="展示标题" prop="showTitle">
      <el-radio-group v-model="model.showTitle">
        <el-radio :value="0">否</el-radio>
        <el-radio :value="1">是</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="展示内容" prop="showContent">
      <el-radio-group v-model="model.showContent">
        <el-radio :value="0">否</el-radio>
        <el-radio :value="1">是</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="展示按钮" prop="showBtn">
      <el-radio-group v-model="model.showBtn">
        <el-radio :value="0">否</el-radio>
        <el-radio :value="1">是</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item v-if="model.showBtn === 1" label="跳转链接" prop="linkUrl">
      <el-input v-model="model.linkUrl" placeholder="请输入 http/https 链接" />
    </el-form-item>

    <el-form-item label="背景素材 ID" prop="backgroundId">
      <el-input v-model="model.backgroundId" placeholder="请输入背景素材 id（可选）" />
    </el-form-item>
  </el-form>
</template>
