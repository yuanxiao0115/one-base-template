<script setup lang="ts">
  import { computed } from 'vue';
  import PortalColorField from './PortalColorField.vue';

  export interface PortalBorderFieldValue {
    style: string;
    color: string;
    width: number;
    radius: number;
  }

  export interface PortalBorderStyleOption {
    label: string;
    value: string;
  }

  const props = withDefaults(
    defineProps<{
      modelValue?: Partial<PortalBorderFieldValue>;
      styleOptions?: PortalBorderStyleOption[];
      noneStyleValue?: string;
      hideColorWidthWhenNone?: boolean;
      colorShowAlpha?: boolean;
      styleLabel?: string;
      colorLabel?: string;
      widthLabel?: string;
      radiusLabel?: string;
      widthMin?: number;
      widthMax?: number;
      radiusMin?: number;
      radiusMax?: number;
    }>(),
    {
      modelValue: () => ({ style: 'solid', color: '#e5e7eb', width: 1, radius: 12 }),
      styleOptions: () => [
        { label: '无边框', value: 'none' },
        { label: '实线', value: 'solid' },
        { label: '虚线', value: 'dashed' },
        { label: '点线', value: 'dotted' },
      ],
      noneStyleValue: 'none',
      hideColorWidthWhenNone: true,
      colorShowAlpha: true,
      styleLabel: '边框样式',
      colorLabel: '边框颜色',
      widthLabel: '边框宽度(px)',
      radiusLabel: '圆角(px)',
      widthMin: 1,
      widthMax: 20,
      radiusMin: 0,
      radiusMax: 64,
    }
  );

  const emit = defineEmits<(event: 'update:modelValue', value: PortalBorderFieldValue) => void>();

  function toNumber(value: unknown, fallback: number): number {
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
  }

  const borderValue = computed<PortalBorderFieldValue>(() => ({
    style: typeof props.modelValue?.style === 'string' ? props.modelValue.style : 'solid',
    color: typeof props.modelValue?.color === 'string' ? props.modelValue.color : '#e5e7eb',
    width: toNumber(props.modelValue?.width, 1),
    radius: toNumber(props.modelValue?.radius, 12),
  }));

  function updateValue(next: Partial<PortalBorderFieldValue>) {
    emit('update:modelValue', {
      ...borderValue.value,
      ...next,
    });
  }

  const showColorAndWidth = computed(() => {
    if (!props.hideColorWidthWhenNone) {
      return true;
    }
    return borderValue.value.style !== props.noneStyleValue;
  });

  const onStyleChange = (value: string) => updateValue({ style: value });
  const onColorChange = (value: string) => updateValue({ color: value });
  const onWidthChange = (value: number | undefined) => updateValue({ width: toNumber(value, borderValue.value.width) });
  const onRadiusChange = (value: number | undefined) => updateValue({ radius: toNumber(value, borderValue.value.radius) });

  defineOptions({
    name: 'PortalBorderField',
  });
</script>

<template>
  <el-form-item :label="styleLabel">
    <el-select :model-value="borderValue.style" @update:model-value="onStyleChange">
      <el-option v-for="option in styleOptions" :key="option.value" :label="option.label" :value="option.value" />
    </el-select>
  </el-form-item>

  <template v-if="showColorAndWidth">
    <el-form-item :label="colorLabel">
      <PortalColorField :model-value="borderValue.color" :show-alpha="colorShowAlpha" @update:model-value="onColorChange" />
    </el-form-item>

    <el-form-item :label="widthLabel">
      <el-input-number
        :model-value="borderValue.width"
        :min="widthMin"
        :max="widthMax"
        controls-position="right"
        @update:model-value="onWidthChange"
      />
    </el-form-item>
  </template>

  <el-form-item :label="radiusLabel">
    <el-input-number
      :model-value="borderValue.radius"
      :min="radiusMin"
      :max="radiusMax"
      controls-position="right"
      @update:model-value="onRadiusChange"
    />
  </el-form-item>
</template>
