<script setup lang="ts">
  import { computed } from 'vue';

  export interface PortalSpacingValue {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  type SpacingEdge = keyof PortalSpacingValue;

  const props = withDefaults(
    defineProps<{
      modelValue?: Partial<PortalSpacingValue>;
      min?: number;
      max?: number;
      step?: number;
      controlsPosition?: '' | 'right';
      columns?: 1 | 2 | 4;
      topLabel?: string;
      rightLabel?: string;
      bottomLabel?: string;
      leftLabel?: string;
    }>(),
    {
      modelValue: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
      min: 0,
      max: 600,
      step: 1,
      controlsPosition: 'right',
      columns: 2,
      topLabel: '上',
      rightLabel: '右',
      bottomLabel: '下',
      leftLabel: '左',
    }
  );

  const emit = defineEmits<(event: 'update:modelValue', value: PortalSpacingValue) => void>();

  function normalizeNumber(value: unknown): number {
    const next = Number(value);
    return Number.isFinite(next) ? next : 0;
  }

  const spacingValue = computed<PortalSpacingValue>(() => ({
    top: normalizeNumber(props.modelValue?.top),
    right: normalizeNumber(props.modelValue?.right),
    bottom: normalizeNumber(props.modelValue?.bottom),
    left: normalizeNumber(props.modelValue?.left),
  }));

  function updateEdge(edge: SpacingEdge, value: number | undefined) {
    emit('update:modelValue', {
      ...spacingValue.value,
      [edge]: normalizeNumber(value),
    });
  }

  const onTopChange = (value: number | undefined) => updateEdge('top', value);
  const onRightChange = (value: number | undefined) => updateEdge('right', value);
  const onBottomChange = (value: number | undefined) => updateEdge('bottom', value);
  const onLeftChange = (value: number | undefined) => updateEdge('left', value);

  const gridClass = computed(() => `portal-spacing-field--cols-${props.columns}`);

  defineOptions({
    name: 'PortalSpacingField',
  });
</script>

<template>
  <div class="portal-spacing-field" :class="gridClass">
    <div class="portal-spacing-field__item">
      <span class="portal-spacing-field__label">{{ topLabel }}</span>
      <el-input-number
        :model-value="spacingValue.top"
        :min="min"
        :max="max"
        :step="step"
        :controls-position="controlsPosition"
        @update:model-value="onTopChange"
      />
    </div>

    <div class="portal-spacing-field__item">
      <span class="portal-spacing-field__label">{{ rightLabel }}</span>
      <el-input-number
        :model-value="spacingValue.right"
        :min="min"
        :max="max"
        :step="step"
        :controls-position="controlsPosition"
        @update:model-value="onRightChange"
      />
    </div>

    <div class="portal-spacing-field__item">
      <span class="portal-spacing-field__label">{{ bottomLabel }}</span>
      <el-input-number
        :model-value="spacingValue.bottom"
        :min="min"
        :max="max"
        :step="step"
        :controls-position="controlsPosition"
        @update:model-value="onBottomChange"
      />
    </div>

    <div class="portal-spacing-field__item">
      <span class="portal-spacing-field__label">{{ leftLabel }}</span>
      <el-input-number
        :model-value="spacingValue.left"
        :min="min"
        :max="max"
        :step="step"
        :controls-position="controlsPosition"
        @update:model-value="onLeftChange"
      />
    </div>
  </div>
</template>

<style scoped>
  .portal-spacing-field {
    width: min(100%, 420px);
    display: grid;
    gap: 8px 12px;
  }

  .portal-spacing-field--cols-1 {
    grid-template-columns: minmax(0, 1fr);
  }

  .portal-spacing-field--cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .portal-spacing-field--cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .portal-spacing-field__item {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .portal-spacing-field__item :deep(.el-input-number) {
    width: 100%;
    min-width: 0;
  }

  .portal-spacing-field__label {
    min-width: 1em;
    font-size: 12px;
    line-height: 1;
    color: #64748b;
    text-align: center;
    flex: 0 0 auto;
  }

  @media (width <= 640px) {
    .portal-spacing-field--cols-2,
    .portal-spacing-field--cols-4 {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
