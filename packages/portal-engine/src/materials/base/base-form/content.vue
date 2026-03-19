<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="字段配置">
        <el-form-item label="字段 JSON">
          <el-input
            v-model="sectionData.form.fieldsJson"
            type="textarea"
            :autosize="{ minRows: 8, maxRows: 16 }"
            maxlength="12000"
            show-word-limit
            placeholder='例如：[{"id":"field-name","label":"姓名","fieldKey":"name","type":"text","required":true,"placeholder":"请输入姓名"}]'
          />
        </el-form-item>
      </ObCard>

      <ObCard title="提交配置">
        <el-form-item label="提交按钮文案">
          <el-input
            v-model.trim="sectionData.form.submitText"
            maxlength="20"
            show-word-limit
            placeholder="例如：提交"
          />
        </el-form-item>

        <el-form-item label="重置按钮文案">
          <el-input
            v-model.trim="sectionData.form.resetText"
            maxlength="20"
            show-word-limit
            placeholder="例如：重置"
          />
        </el-form-item>

        <el-form-item label="提交接口地址">
          <el-input
            v-model.trim="sectionData.form.apiUrl"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            maxlength="260"
            show-word-limit
            placeholder="可选，留空时仅本地提示成功"
          />
        </el-form-item>

        <el-form-item label="请求方法">
          <el-select v-model="sectionData.form.method">
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
        </el-form-item>

        <el-form-item label="请求头 JSON">
          <el-input
            v-model.trim="sectionData.form.headersJson"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            maxlength="1000"
            show-word-limit
            placeholder='例如：{"Authorization":"Bearer xxx"}'
          />
        </el-form-item>

        <el-form-item label="额外请求体 JSON">
          <el-input
            v-model.trim="sectionData.form.extraBodyJson"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            maxlength="1000"
            show-word-limit
            placeholder='例如：{"channel":"portal"}'
          />
        </el-form-item>

        <el-form-item label="成功字段路径">
          <el-input
            v-model.trim="sectionData.form.successPath"
            maxlength="60"
            show-word-limit
            placeholder="例如：code"
          />
        </el-form-item>

        <el-form-item label="成功期望值">
          <el-input
            v-model.trim="sectionData.form.successValue"
            maxlength="40"
            show-word-limit
            placeholder="例如：200"
          />
        </el-form-item>

        <el-form-item label="成功提示文案">
          <el-input
            v-model.trim="sectionData.form.successMessage"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            maxlength="80"
            show-word-limit
            placeholder="例如：提交成功"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="提交后跳转（可选）">
        <PortalActionLinkField v-model="sectionData.form.link" />
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ObCard } from '@one-base-template/ui';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import PortalActionLinkField from '../common/PortalActionLinkField.vue';
import {
  UnifiedContainerContentConfig,
  createDefaultUnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';
import { mergePortalLinkConfig, type PortalLinkConfig } from '../common/portal-link';

type SubmitMethodType = 'POST' | 'PUT' | 'PATCH';

interface BaseFormContentData {
  container: UnifiedContainerContentConfigModel;
  form: {
    fieldsJson: string;
    submitText: string;
    resetText: string;
    apiUrl: string;
    method: SubmitMethodType;
    headersJson: string;
    extraBodyJson: string;
    successPath: string;
    successValue: string;
    successMessage: string;
    linkPath?: string;
    linkParamKey?: string;
    linkValueKey?: string;
    openType?: PortalLinkConfig['openType'];
    link: PortalLinkConfig;
  };
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseFormContentData>({
  name: 'base-form-content',
  sections: {
    container: {},
    form: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
sectionData.form = {
  fieldsJson:
    typeof sectionData.form?.fieldsJson === 'string' && sectionData.form.fieldsJson.trim()
      ? sectionData.form.fieldsJson
      : '[{"id":"field-name","label":"姓名","fieldKey":"name","type":"text","required":true,"placeholder":"请输入姓名"},{"id":"field-phone","label":"手机号","fieldKey":"mobile","type":"text","required":true,"placeholder":"请输入手机号"}]',
  submitText:
    typeof sectionData.form?.submitText === 'string' && sectionData.form.submitText.trim()
      ? sectionData.form.submitText
      : '提交',
  resetText:
    typeof sectionData.form?.resetText === 'string' && sectionData.form.resetText.trim()
      ? sectionData.form.resetText
      : '重置',
  apiUrl: typeof sectionData.form?.apiUrl === 'string' ? sectionData.form.apiUrl : '',
  method:
    sectionData.form?.method === 'PUT' || sectionData.form?.method === 'PATCH'
      ? sectionData.form.method
      : 'POST',
  headersJson:
    typeof sectionData.form?.headersJson === 'string' ? sectionData.form.headersJson : '{}',
  extraBodyJson:
    typeof sectionData.form?.extraBodyJson === 'string' ? sectionData.form.extraBodyJson : '{}',
  successPath:
    typeof sectionData.form?.successPath === 'string' && sectionData.form.successPath.trim()
      ? sectionData.form.successPath
      : 'code',
  successValue:
    typeof sectionData.form?.successValue === 'string' && sectionData.form.successValue.trim()
      ? sectionData.form.successValue
      : '200',
  successMessage:
    typeof sectionData.form?.successMessage === 'string' && sectionData.form.successMessage.trim()
      ? sectionData.form.successMessage
      : '提交成功',
  link: mergePortalLinkConfig(
    sectionData.form?.link || {
      path: sectionData.form?.linkPath,
      paramKey: sectionData.form?.linkParamKey,
      valueKey: sectionData.form?.linkValueKey,
      openType: sectionData.form?.openType
    }
  )
};

const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
if (!sectionData.container.title.trim()) {
  sectionData.container.title = '表单组件';
}
if (!sectionData.container.subtitle.trim()) {
  sectionData.container.subtitle = '支持字段配置与接口提交';
}
if (!sectionData.container.externalLinkText.trim()) {
  sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
}

defineOptions({
  name: 'base-form-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
