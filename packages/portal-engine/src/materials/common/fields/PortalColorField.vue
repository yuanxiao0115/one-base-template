<script setup lang="ts">
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      showAlpha?: boolean;
      placeholder?: string;
    }>(),
    {
      modelValue: '',
      showAlpha: false,
      placeholder: '#FFFFFF',
    }
  );

  const emit = defineEmits<(event: 'update:modelValue', value: string) => void>();

  const pickerValue = computed(() => {
    const value = String(props.modelValue || '').trim();
    if (value) {
      return value;
    }
    return props.showAlpha ? 'rgba(255,255,255,1)' : '#FFFFFF';
  });

  function normalizeColor(value: string): string {
    const trimmed = String(value || '').trim();
    if (!trimmed) {
      return '';
    }

    const noHashHex = /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/;
    if (noHashHex.test(trimmed)) {
      return `#${trimmed.toUpperCase()}`;
    }

    if (/^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{8}$/.test(trimmed)) {
      return trimmed.toUpperCase();
    }

    return trimmed;
  }

  function onPickerChange(value: string | null) {
    emit('update:modelValue', normalizeColor(value || ''));
  }

  function onInput(value: string) {
    emit('update:modelValue', value);
  }

  function onBlur(event: FocusEvent) {
    const next = normalizeColor((event.target as HTMLInputElement | null)?.value || '');
    emit('update:modelValue', next);
  }

  defineOptions({
    name: 'PortalColorField',
  });
</script>

<template>
  <div class="portal-color-field">
    <el-color-picker
      class="portal-color-field__picker"
      :model-value="pickerValue"
      :show-alpha="showAlpha"
      @change="onPickerChange"
    />

    <el-input
      class="portal-color-field__input"
      :model-value="modelValue"
      :placeholder="placeholder"
      maxlength="32"
      @input="onInput"
      @blur="onBlur"
    >
      <template #prefix>
        <span class="portal-color-field__prefix">HEX</span>
      </template>
    </el-input>
  </div>
</template>

<style scoped>
  .portal-color-field {
    width: min(100%, 320px);
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr);
    gap: 8px;
    align-items: center;
  }

  .portal-color-field__picker {
    width: 76px;
  }

  .portal-color-field__picker :deep(.el-color-picker__trigger) {
    width: 76px;
    height: 32px;
    border-radius: 4px;
  }

  .portal-color-field__input {
    width: 100%;
  }

  .portal-color-field__prefix {
    font-size: 11px;
    color: #64748b;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
</style>
