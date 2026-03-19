<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="网格与卡片">
        <el-form-item label="列数">
          <el-input-number
            v-model="sectionData.stat.columns"
            :min="1"
            :max="6"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="间距(px)">
          <el-input-number
            v-model="sectionData.stat.gap"
            :min="0"
            :max="32"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="卡片内边距(px)">
          <el-input-number
            v-model="sectionData.stat.cardPadding"
            :min="0"
            :max="48"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="卡片圆角(px)">
          <el-input-number
            v-model="sectionData.stat.cardRadius"
            :min="0"
            :max="40"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="卡片背景色">
          <ObColorField v-model="sectionData.stat.cardBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="卡片边框色">
          <ObColorField v-model="sectionData.stat.cardBorderColor" show-alpha />
        </el-form-item>
      </ObCard>

      <ObCard title="文字样式">
        <el-form-item label="标题颜色">
          <ObColorField v-model="sectionData.stat.titleColor" show-alpha />
        </el-form-item>

        <el-form-item label="数值颜色">
          <ObColorField v-model="sectionData.stat.valueColor" show-alpha />
        </el-form-item>

        <el-form-item label="单位颜色">
          <ObColorField v-model="sectionData.stat.unitColor" show-alpha />
        </el-form-item>

        <el-form-item label="趋势颜色">
          <ObColorField v-model="sectionData.stat.trendColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题字号(px)">
          <el-input-number
            v-model="sectionData.stat.titleFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="数值字号(px)">
          <el-input-number
            v-model="sectionData.stat.valueFontSize"
            :min="14"
            :max="48"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="单位字号(px)">
          <el-input-number
            v-model="sectionData.stat.unitFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="趋势字号(px)">
          <el-input-number
            v-model="sectionData.stat.trendFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ObCard, ObColorField } from '@one-base-template/ui';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import {
  UnifiedContainerStyleConfig,
  mergeUnifiedContainerStyleConfig
} from '../../common/unified-container';
import type { UnifiedContainerStyleConfigModel } from '../../common/unified-container';

interface BaseStatStyleData {
  container: UnifiedContainerStyleConfigModel;
  stat: {
    columns: number;
    gap: number;
    cardPadding: number;
    cardRadius: number;
    cardBgColor: string;
    cardBorderColor: string;
    titleColor: string;
    valueColor: string;
    unitColor: string;
    trendColor: string;
    titleFontSize: number;
    valueFontSize: number;
    unitFontSize: number;
    trendFontSize: number;
  };
}

const BASE_STAT_STYLE_DEFAULTS: BaseStatStyleData['stat'] = {
  columns: 4,
  gap: 12,
  cardPadding: 12,
  cardRadius: 10,
  cardBgColor: '#f8fafc',
  cardBorderColor: '#e2e8f0',
  titleColor: '#64748b',
  valueColor: '#0f172a',
  unitColor: '#334155',
  trendColor: '#16a34a',
  titleFontSize: 12,
  valueFontSize: 24,
  unitFontSize: 12,
  trendFontSize: 12
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseStatStyleData>({
  name: 'base-stat-style',
  sections: {
    container: {},
    stat: {
      defaultValue: BASE_STAT_STYLE_DEFAULTS
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.stat = {
  columns: Math.min(
    6,
    Math.max(1, Number(sectionData.stat?.columns) || BASE_STAT_STYLE_DEFAULTS.columns)
  ),
  gap: Number.isFinite(Number(sectionData.stat?.gap))
    ? Number(sectionData.stat.gap)
    : BASE_STAT_STYLE_DEFAULTS.gap,
  cardPadding: Number.isFinite(Number(sectionData.stat?.cardPadding))
    ? Number(sectionData.stat.cardPadding)
    : BASE_STAT_STYLE_DEFAULTS.cardPadding,
  cardRadius: Number.isFinite(Number(sectionData.stat?.cardRadius))
    ? Number(sectionData.stat.cardRadius)
    : BASE_STAT_STYLE_DEFAULTS.cardRadius,
  cardBgColor: sectionData.stat?.cardBgColor || BASE_STAT_STYLE_DEFAULTS.cardBgColor,
  cardBorderColor: sectionData.stat?.cardBorderColor || BASE_STAT_STYLE_DEFAULTS.cardBorderColor,
  titleColor: sectionData.stat?.titleColor || BASE_STAT_STYLE_DEFAULTS.titleColor,
  valueColor: sectionData.stat?.valueColor || BASE_STAT_STYLE_DEFAULTS.valueColor,
  unitColor: sectionData.stat?.unitColor || BASE_STAT_STYLE_DEFAULTS.unitColor,
  trendColor: sectionData.stat?.trendColor || BASE_STAT_STYLE_DEFAULTS.trendColor,
  titleFontSize:
    Number(sectionData.stat?.titleFontSize) > 0
      ? Number(sectionData.stat.titleFontSize)
      : BASE_STAT_STYLE_DEFAULTS.titleFontSize,
  valueFontSize:
    Number(sectionData.stat?.valueFontSize) > 0
      ? Number(sectionData.stat.valueFontSize)
      : BASE_STAT_STYLE_DEFAULTS.valueFontSize,
  unitFontSize:
    Number(sectionData.stat?.unitFontSize) > 0
      ? Number(sectionData.stat.unitFontSize)
      : BASE_STAT_STYLE_DEFAULTS.unitFontSize,
  trendFontSize:
    Number(sectionData.stat?.trendFontSize) > 0
      ? Number(sectionData.stat.trendFontSize)
      : BASE_STAT_STYLE_DEFAULTS.trendFontSize
};

defineOptions({
  name: 'base-stat-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
