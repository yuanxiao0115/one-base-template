<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { DocumentMaterialSheetStyleValue } from '../../materials/sheet-style';
import type { DocumentSheetStyle } from '../../schema/sheet';

defineOptions({
  name: 'SheetStyleEditor'
});

const props = defineProps<{
  modelValue: DocumentSheetStyle | null;
  defaultStyle: DocumentMaterialSheetStyleValue | null;
}>();

const emit = defineEmits<{
  (e: 'apply', value: DocumentMaterialSheetStyleValue): void;
}>();

interface SheetStyleFormState {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  horizontalAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  wrap: boolean;
}

const form = reactive<SheetStyleFormState>({
  backgroundColor: '#ffffff',
  textColor: '#0f172a',
  borderColor: '#cbd5e1',
  fontSize: 12,
  fontWeight: 'normal',
  horizontalAlign: 'left',
  verticalAlign: 'middle',
  wrap: true
});

function applySourceToForm() {
  const source = props.modelValue ?? props.defaultStyle;
  form.backgroundColor = source?.backgroundColor ?? '#ffffff';
  form.textColor = source?.textColor ?? '#0f172a';
  form.borderColor = source?.border?.top?.color ?? '#cbd5e1';
  form.fontSize = source?.fontSize ?? 12;
  form.fontWeight = source?.fontWeight === 'bold' ? 'bold' : 'normal';
  form.horizontalAlign = source?.horizontalAlign ?? 'left';
  form.verticalAlign = source?.verticalAlign ?? 'middle';
  form.wrap = source?.wrap ?? true;
}

watch(
  () => [props.modelValue, props.defaultStyle],
  () => {
    applySourceToForm();
  },
  { immediate: true, deep: true }
);

function handleApply() {
  emit('apply', {
    backgroundColor: form.backgroundColor,
    textColor: form.textColor,
    fontSize: Math.max(10, Math.round(form.fontSize)),
    fontWeight: form.fontWeight,
    horizontalAlign: form.horizontalAlign,
    verticalAlign: form.verticalAlign,
    wrap: form.wrap,
    border: {
      top: { color: form.borderColor, style: 'solid', width: 1 },
      right: { color: form.borderColor, style: 'solid', width: 1 },
      bottom: { color: form.borderColor, style: 'solid', width: 1 },
      left: { color: form.borderColor, style: 'solid', width: 1 }
    }
  });
}
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <strong>单元格样式</strong>
      <button type="button" @click="handleApply">应用到当前物料区域</button>
    </div>
    <label class="row">
      <span>背景色</span>
      <input v-model="form.backgroundColor" type="color" />
    </label>
    <label class="row">
      <span>文字色</span>
      <input v-model="form.textColor" type="color" />
    </label>
    <label class="row">
      <span>边框线色</span>
      <input v-model="form.borderColor" type="color" />
    </label>
    <label class="row">
      <span>字号</span>
      <input v-model.number="form.fontSize" type="number" min="10" max="32" />
    </label>
    <label class="row">
      <span>字重</span>
      <select v-model="form.fontWeight">
        <option value="normal">常规</option>
        <option value="bold">加粗</option>
      </select>
    </label>
    <label class="row">
      <span>水平对齐</span>
      <select v-model="form.horizontalAlign">
        <option value="left">左对齐</option>
        <option value="center">居中</option>
        <option value="right">右对齐</option>
      </select>
    </label>
    <label class="row">
      <span>垂直对齐</span>
      <select v-model="form.verticalAlign">
        <option value="top">顶部</option>
        <option value="middle">居中</option>
        <option value="bottom">底部</option>
      </select>
    </label>
    <label class="row checkbox-row">
      <input v-model="form.wrap" type="checkbox" />
      <span>自动换行</span>
    </label>
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid #d8dee8;
  background: #fff;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.panel-head button {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  cursor: pointer;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #334155;
  font-size: 12px;
}

.row input,
.row select {
  min-width: 96px;
}

.row input[type='number'],
.row select {
  padding: 4px 6px;
  border: 1px solid #cbd5e1;
  background: #fff;
}

.row input[type='color'] {
  width: 36px;
  height: 24px;
  padding: 0;
  border: 1px solid #cbd5e1;
  background: #fff;
}

.checkbox-row {
  justify-content: flex-start;
}
</style>
