<script setup lang="ts">
  import { computed } from "vue";

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      showAlpha?: boolean;
      placeholder?: string;
    }>(),
    {
      modelValue: "",
      showAlpha: false,
      placeholder: "#FFFFFF",
    }
  );

  const emit = defineEmits<(event: "update:modelValue", value: string) => void>();

  function isTransparentColor(value: string): boolean {
    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized) {
      return false;
    }

    if (normalized === "transparent") {
      return true;
    }

    const rgbaAlphaMatch = normalized.match(
      /^rgba\(\s*[0-9.]+\s*,\s*[0-9.]+\s*,\s*[0-9.]+\s*,\s*([0-9.]+)\s*\)$/
    );
    if (!rgbaAlphaMatch) {
      return false;
    }

    const alphaValue = Number(rgbaAlphaMatch[1]);
    return Number.isFinite(alphaValue) && alphaValue <= 0;
  }

  const modelValueText = computed(() => String(props.modelValue || "").trim());
  const isTransparentValue = computed(() => isTransparentColor(modelValueText.value));

  const pickerValue = computed(() => {
    const value = modelValueText.value;
    if (!value) {
      return props.showAlpha ? "rgba(255,255,255,1)" : "#FFFFFF";
    }

    if (isTransparentColor(value)) {
      return props.showAlpha ? "rgba(255,255,255,0)" : "#FFFFFF";
    }

    return value;
  });

  function normalizeColor(value: string): string {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return "";
    }

    if (isTransparentColor(trimmed)) {
      return "transparent";
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
    emit("update:modelValue", normalizeColor(value || ""));
  }

  function onInput(value: string) {
    emit("update:modelValue", value);
  }

  function onBlur(event: FocusEvent) {
    const next = normalizeColor((event.target as HTMLInputElement | null)?.value || "");
    emit("update:modelValue", next);
  }

  function setTransparentColor() {
    emit("update:modelValue", "transparent");
  }
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

    <div class="portal-color-field__actions">
      <el-button
        link
        type="primary"
        size="small"
        class="portal-color-field__transparent-btn"
        :class="{ 'is-active': isTransparentValue }"
        @click="setTransparentColor"
      >
        透明
      </el-button>
    </div>
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

  .portal-color-field__actions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    margin-top: -2px;
  }

  .portal-color-field__transparent-btn {
    padding: 0;
  }

  .portal-color-field__transparent-btn.is-active {
    font-weight: 600;
  }
</style>
