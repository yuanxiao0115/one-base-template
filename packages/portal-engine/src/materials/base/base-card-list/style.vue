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
    list: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.list = {
  columns: Math.min(4, Math.max(1, Number(sectionData.list?.columns) || 3)),
  gap: Number.isFinite(Number(sectionData.list?.gap)) ? Number(sectionData.list.gap) : 12,
  cardPadding: Number.isFinite(Number(sectionData.list?.cardPadding))
    ? Number(sectionData.list.cardPadding)
    : 12,
  cardRadius: Number.isFinite(Number(sectionData.list?.cardRadius))
    ? Number(sectionData.list.cardRadius)
    : 10,
  cardBorderColor: sectionData.list?.cardBorderColor || '#e2e8f0',
  cardBgColor: sectionData.list?.cardBgColor || '#ffffff',
  imageHeight:
    Number(sectionData.list?.imageHeight) > 0 ? Number(sectionData.list.imageHeight) : 120,
  titleColor: sectionData.list?.titleColor || '#0f172a',
  descriptionColor: sectionData.list?.descriptionColor || '#64748b',
  dateColor: sectionData.list?.dateColor || '#94a3b8',
  titleFontSize:
    Number(sectionData.list?.titleFontSize) > 0 ? Number(sectionData.list.titleFontSize) : 14,
  descriptionFontSize:
    Number(sectionData.list?.descriptionFontSize) > 0
      ? Number(sectionData.list.descriptionFontSize)
      : 12,
  dateFontSize:
    Number(sectionData.list?.dateFontSize) > 0 ? Number(sectionData.list.dateFontSize) : 12
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
