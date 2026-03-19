<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="网格与卡片">
        <el-form-item label="列数">
          <el-input-number
            v-model="sectionData.list.columns"
            :min="1"
            :max="4"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="间距(px)">
          <el-input-number
            v-model="sectionData.list.gap"
            :min="0"
            :max="40"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="卡片内边距(px)">
          <el-input-number
            v-model="sectionData.list.cardPadding"
            :min="0"
            :max="48"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="卡片圆角(px)">
          <el-input-number
            v-model="sectionData.list.cardRadius"
            :min="0"
            :max="40"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="卡片背景色">
          <ObColorField v-model="sectionData.list.cardBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="卡片边框色">
          <ObColorField v-model="sectionData.list.cardBorderColor" show-alpha />
        </el-form-item>

        <el-form-item label="图片高度(px)">
          <el-input-number
            v-model="sectionData.list.imageHeight"
            :min="60"
            :max="260"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="文本样式">
        <el-form-item label="标题颜色">
          <ObColorField v-model="sectionData.list.titleColor" show-alpha />
        </el-form-item>

        <el-form-item label="描述颜色">
          <ObColorField v-model="sectionData.list.descriptionColor" show-alpha />
        </el-form-item>

        <el-form-item label="日期颜色">
          <ObColorField v-model="sectionData.list.dateColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题字号(px)">
          <el-input-number
            v-model="sectionData.list.titleFontSize"
            :min="12"
            :max="32"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="描述字号(px)">
          <el-input-number
            v-model="sectionData.list.descriptionFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="日期字号(px)">
          <el-input-number
            v-model="sectionData.list.dateFontSize"
            :min="12"
            :max="22"
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

interface BaseCardListStyleData {
  container: UnifiedContainerStyleConfigModel;
  list: {
    columns: number;
    gap: number;
    cardPadding: number;
    cardRadius: number;
    cardBorderColor: string;
    cardBgColor: string;
    imageHeight: number;
    titleColor: string;
    descriptionColor: string;
    dateColor: string;
    titleFontSize: number;
    descriptionFontSize: number;
    dateFontSize: number;
  };
}

const BASE_CARD_LIST_STYLE_DEFAULTS: BaseCardListStyleData['list'] = {
  columns: 3,
  gap: 12,
  cardPadding: 12,
  cardRadius: 10,
  cardBorderColor: '#e2e8f0',
  cardBgColor: '#ffffff',
  imageHeight: 120,
  titleColor: '#0f172a',
  descriptionColor: '#64748b',
  dateColor: '#94a3b8',
  titleFontSize: 14,
  descriptionFontSize: 12,
  dateFontSize: 12
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseCardListStyleData>({
  name: 'base-card-list-style',
  sections: {
    container: {},
    list: {
      defaultValue: BASE_CARD_LIST_STYLE_DEFAULTS
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.list = {
  columns: Math.min(
    4,
    Math.max(1, Number(sectionData.list?.columns) || BASE_CARD_LIST_STYLE_DEFAULTS.columns)
  ),
  gap: Number.isFinite(Number(sectionData.list?.gap))
    ? Number(sectionData.list.gap)
    : BASE_CARD_LIST_STYLE_DEFAULTS.gap,
  cardPadding: Number.isFinite(Number(sectionData.list?.cardPadding))
    ? Number(sectionData.list.cardPadding)
    : BASE_CARD_LIST_STYLE_DEFAULTS.cardPadding,
  cardRadius: Number.isFinite(Number(sectionData.list?.cardRadius))
    ? Number(sectionData.list.cardRadius)
    : BASE_CARD_LIST_STYLE_DEFAULTS.cardRadius,
  cardBorderColor:
    sectionData.list?.cardBorderColor || BASE_CARD_LIST_STYLE_DEFAULTS.cardBorderColor,
  cardBgColor: sectionData.list?.cardBgColor || BASE_CARD_LIST_STYLE_DEFAULTS.cardBgColor,
  imageHeight:
    Number(sectionData.list?.imageHeight) > 0
      ? Number(sectionData.list.imageHeight)
      : BASE_CARD_LIST_STYLE_DEFAULTS.imageHeight,
  titleColor: sectionData.list?.titleColor || BASE_CARD_LIST_STYLE_DEFAULTS.titleColor,
  descriptionColor:
    sectionData.list?.descriptionColor || BASE_CARD_LIST_STYLE_DEFAULTS.descriptionColor,
  dateColor: sectionData.list?.dateColor || BASE_CARD_LIST_STYLE_DEFAULTS.dateColor,
  titleFontSize:
    Number(sectionData.list?.titleFontSize) > 0
      ? Number(sectionData.list.titleFontSize)
      : BASE_CARD_LIST_STYLE_DEFAULTS.titleFontSize,
  descriptionFontSize:
    Number(sectionData.list?.descriptionFontSize) > 0
      ? Number(sectionData.list.descriptionFontSize)
      : BASE_CARD_LIST_STYLE_DEFAULTS.descriptionFontSize,
  dateFontSize:
    Number(sectionData.list?.dateFontSize) > 0
      ? Number(sectionData.list.dateFontSize)
      : BASE_CARD_LIST_STYLE_DEFAULTS.dateFontSize
};

defineOptions({
  name: 'base-card-list-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
