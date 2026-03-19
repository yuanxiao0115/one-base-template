<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <el-form
      ref="formRef"
      :model="formModel"
      label-position="left"
      :label-width="`${formStyle.labelWidth}px`"
      class="base-form"
    >
      <el-form-item
        v-for="field in normalizedFields"
        :key="field.id"
        :label="field.label"
        :required="field.required"
        :style="fieldStyleObj"
      >
        <el-input
          v-if="field.type === 'text'"
          :model-value="getTextModelValue(field.fieldKey)"
          :placeholder="field.placeholder"
          :style="inputStyleObj"
          @update:model-value="setFieldValue(field.fieldKey, $event)"
        />

        <el-input
          v-else-if="field.type === 'textarea'"
          :model-value="getTextModelValue(field.fieldKey)"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 6 }"
          :placeholder="field.placeholder"
          @update:model-value="setFieldValue(field.fieldKey, $event)"
        />

        <el-input-number
          v-else-if="field.type === 'number'"
          :model-value="getNumberModelValue(field.fieldKey)"
          controls-position="right"
          :style="inputStyleObj"
          @update:model-value="setFieldValue(field.fieldKey, $event)"
        />

        <el-select
          v-else-if="field.type === 'select'"
          :model-value="getSelectModelValue(field.fieldKey)"
          :placeholder="field.placeholder"
          :style="inputStyleObj"
          @update:model-value="setFieldValue(field.fieldKey, $event)"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <el-date-picker
          v-else-if="field.type === 'date'"
          :model-value="getDateModelValue(field.fieldKey)"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="field.placeholder"
          :style="inputStyleObj"
          @update:model-value="setFieldValue(field.fieldKey, $event)"
        />

        <el-input
          v-else
          :model-value="getTextModelValue(field.fieldKey)"
          :placeholder="field.placeholder"
          :style="inputStyleObj"
          @update:model-value="setFieldValue(field.fieldKey, $event)"
        />
      </el-form-item>

      <div class="base-form__actions" :style="actionStyleObj">
        <el-button :style="submitButtonStyle" :loading="submitting" @click="submitForm">{{
          submitText
        }}</el-button>
        <el-button @click="resetForm">{{ resetText }}</el-button>
      </div>
    </el-form>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, type CSSProperties } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance } from 'element-plus';
import { UnifiedContainerDisplay } from '../../common/unified-container';
import type {
  UnifiedContainerContentConfigModel,
  UnifiedContainerStyleConfigModel
} from '../../common/unified-container';
import { message } from '../../cms/common/message';
import {
  mergePortalLinkConfig,
  openPortalLink,
  resolvePortalLink,
  type PortalLinkConfig
} from '../common/portal-link';
import {
  parseJsonArray,
  parseJsonObject,
  resolveValueByPath,
  toNonNegativeNumber,
  toPositiveNumber
} from '../common/material-utils';

type SubmitMethodType = 'POST' | 'PUT' | 'PATCH';
type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'date';

interface FormFieldOption {
  label: string;
  value: string;
}

interface FormField {
  id: string;
  label: string;
  fieldKey: string;
  type: FieldType;
  required: boolean;
  placeholder: string;
  options: FormFieldOption[];
}

type TextModelValue = string | number | null | undefined;
type NumberModelValue = number | null | undefined;
type SelectModelValue = string | number | boolean | Record<string, unknown> | null | undefined;
type DateModelValue = string | number | Date | string[] | number[] | Date[] | null | undefined;

interface BaseFormSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    form?: {
      fieldsJson?: string;
      submitText?: string;
      resetText?: string;
      apiUrl?: string;
      method?: SubmitMethodType;
      headersJson?: string;
      extraBodyJson?: string;
      successPath?: string;
      successValue?: string;
      successMessage?: string;
      linkPath?: string;
      linkParamKey?: string;
      linkValueKey?: string;
      openType?: PortalLinkConfig['openType'];
      link?: Partial<PortalLinkConfig>;
    };
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    form?: {
      labelWidth?: number;
      fieldGap?: number;
      inputHeight?: number;
      buttonAlign?: 'left' | 'center' | 'right';
      buttonGap?: number;
      primaryColor?: string;
    };
  };
}

const props = defineProps<{
  schema: BaseFormSchema;
}>();

let router: ReturnType<typeof useRouter> | null = null;
try {
  router = useRouter();
} catch {
  router = null;
}

const formRef = ref<FormInstance>();
const submitting = ref(false);
const formModel = reactive<Record<string, unknown>>({});

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);
const formConfig = computed(() => props.schema?.content?.form || {});
const formLinkConfig = computed(() =>
  mergePortalLinkConfig(
    formConfig.value.link || {
      path: formConfig.value.linkPath,
      paramKey: formConfig.value.linkParamKey,
      valueKey: formConfig.value.linkValueKey,
      openType: formConfig.value.openType
    }
  )
);

const formStyle = computed(() => {
  const style = props.schema?.style?.form || {};
  return {
    labelWidth: Math.max(60, toPositiveNumber(style.labelWidth, 88)),
    fieldGap: toNonNegativeNumber(style.fieldGap, 12),
    inputHeight: Math.max(30, toPositiveNumber(style.inputHeight, 40)),
    buttonAlign:
      style.buttonAlign === 'center' || style.buttonAlign === 'right' ? style.buttonAlign : 'left',
    buttonGap: toNonNegativeNumber(style.buttonGap, 10),
    primaryColor: style.primaryColor || '#2563eb'
  };
});

const normalizedFields = computed<FormField[]>(() => {
  const fields = parseJsonArray(formConfig.value.fieldsJson);
  return fields
    .map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return null;
      }

      const source = item as Record<string, unknown>;
      const type =
        source.type === 'textarea' ||
        source.type === 'number' ||
        source.type === 'select' ||
        source.type === 'date'
          ? source.type
          : 'text';

      const options = Array.isArray(source.options)
        ? (source.options
            .map((option) => {
              if (!option || typeof option !== 'object' || Array.isArray(option)) {
                return null;
              }
              const optionValue = option as Record<string, unknown>;
              return {
                label: String(optionValue.label || optionValue.value || ''),
                value: String(optionValue.value || optionValue.label || '')
              };
            })
            .filter(Boolean) as FormFieldOption[])
        : [];

      return {
        id: String(source.id || `field-${index + 1}`),
        label: String(source.label || `字段${index + 1}`),
        fieldKey: String(source.fieldKey || `field${index + 1}`),
        type,
        required: source.required === true,
        placeholder: String(source.placeholder || ''),
        options
      } satisfies FormField;
    })
    .filter(Boolean) as FormField[];
});

watch(
  normalizedFields,
  (fields) => {
    const nextKeys = new Set(fields.map((field) => field.fieldKey));

    fields.forEach((field) => {
      if (formModel[field.fieldKey] !== undefined) {
        return;
      }
      formModel[field.fieldKey] = '';
    });

    Object.keys(formModel).forEach((key) => {
      if (!nextKeys.has(key)) {
        delete formModel[key];
      }
    });
  },
  { immediate: true }
);

const submitText = computed(() => String(formConfig.value.submitText || '提交'));
const resetText = computed(() => String(formConfig.value.resetText || '重置'));

const fieldStyleObj = computed<CSSProperties>(() => ({
  marginBottom: `${formStyle.value.fieldGap}px`
}));

const inputStyleObj = computed<CSSProperties>(() => ({
  '--el-input-height': `${formStyle.value.inputHeight}px`,
  '--el-input-border-radius': '8px',
  width: '100%'
}));

const actionStyleObj = computed<CSSProperties>(() => ({
  display: 'flex',
  justifyContent: resolveJustifyContent(formStyle.value.buttonAlign),
  gap: `${formStyle.value.buttonGap}px`,
  marginTop: '4px'
}));

function resolveJustifyContent(align: string): CSSProperties['justifyContent'] {
  if (align === 'center') {
    return 'center';
  }
  if (align === 'right') {
    return 'flex-end';
  }
  return 'flex-start';
}

const submitButtonStyle = computed<CSSProperties>(() => ({
  borderColor: formStyle.value.primaryColor,
  backgroundColor: formStyle.value.primaryColor,
  color: '#fff'
}));

function setFieldValue(fieldKey: string, value: unknown) {
  formModel[fieldKey] = value;
}

function getTextModelValue(fieldKey: string): TextModelValue {
  const value = formModel[fieldKey];
  if (typeof value === 'string' || typeof value === 'number' || value == null) {
    return value;
  }
  return String(value);
}

function getNumberModelValue(fieldKey: string): NumberModelValue {
  const value = formModel[fieldKey];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return value;
  }
  return null;
}

function getSelectModelValue(fieldKey: string): SelectModelValue {
  const value = formModel[fieldKey];
  if (value == null) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
    return value as Record<string, unknown>;
  }
  return String(value);
}

function isDateArray(value: unknown): value is string[] | number[] | Date[] {
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every(
    (item) => typeof item === 'string' || typeof item === 'number' || item instanceof Date
  );
}

function getDateModelValue(fieldKey: string): DateModelValue {
  const value = formModel[fieldKey];
  if (value == null) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
    return value;
  }
  if (isDateArray(value)) {
    return value;
  }
  return undefined;
}

function validateForm(): boolean {
  for (const field of normalizedFields.value) {
    if (!field.required) {
      continue;
    }
    const value = formModel[field.fieldKey];
    if (value === null || value === undefined || String(value).trim() === '') {
      message.warning(`${field.label}不能为空`);
      return false;
    }
  }
  return true;
}

async function submitForm() {
  if (submitting.value || !validateForm()) {
    return;
  }

  const payload = {
    ...parseJsonObject(formConfig.value.extraBodyJson),
    ...formModel
  };

  const apiUrl = String(formConfig.value.apiUrl || '').trim();
  if (!apiUrl) {
    message.success(String(formConfig.value.successMessage || '提交成功'));
    return;
  }

  submitting.value = true;
  try {
    const method: SubmitMethodType =
      formConfig.value.method === 'PUT' || formConfig.value.method === 'PATCH'
        ? formConfig.value.method
        : 'POST';
    const headersJson = parseJsonObject(formConfig.value.headersJson);
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    Object.entries(headersJson).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      headers[key] = String(value);
    });

    const response = await fetch(apiUrl, {
      method,
      headers,
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    const contentType = response.headers.get('content-type') || '';
    const responsePayload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(`提交失败（HTTP ${response.status}）`);
    }

    const successPath = String(formConfig.value.successPath || '').trim();
    const successValue = String(formConfig.value.successValue || '').trim();
    if (successPath) {
      const actual = resolveValueByPath(responsePayload, successPath);
      if (successValue && String(actual) !== successValue) {
        throw new Error('提交失败：返回状态不匹配');
      }
    }

    message.success(String(formConfig.value.successMessage || '提交成功'));

    const link = resolvePortalLink(
      formLinkConfig.value,
      resolveValueByPath(responsePayload, formLinkConfig.value.valueKey || 'id')
    );
    openPortalLink({
      link,
      openType: formLinkConfig.value.openType,
      routerPush: router ? (nextLink: string) => router!.push(nextLink) : null
    });
  } catch (error) {
    const msg = error instanceof Error && error.message ? error.message : '提交失败';
    message.error(msg);
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  normalizedFields.value.forEach((field) => {
    formModel[field.fieldKey] = '';
  });
  formRef.value?.clearValidate?.();
}

defineOptions({
  name: 'base-form-index'
});
</script>

<style scoped>
.base-form {
  width: 100%;
}

.base-form :deep(.el-form-item__content) {
  width: 100%;
}
</style>
