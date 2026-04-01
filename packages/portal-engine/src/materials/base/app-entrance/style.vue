<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="卡片样式">
        <el-form-item label="卡片背景色">
          <ObColorField v-model="sectionData.entrance.cardBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="卡片悬停色">
          <ObColorField v-model="sectionData.entrance.cardHoverBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="卡片边框色">
          <ObColorField v-model="sectionData.entrance.cardBorderColor" show-alpha />
        </el-form-item>

        <el-form-item label="卡片圆角(px)">
          <el-input-number
            v-model="sectionData.entrance.cardRadius"
            :min="0"
            :max="40"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="卡片内边距(px)">
          <el-input-number
            v-model="sectionData.entrance.cardPadding"
            :min="0"
            :max="48"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="文本与图标">
        <el-form-item label="标题颜色">
          <ObColorField v-model="sectionData.entrance.titleColor" show-alpha />
        </el-form-item>

        <el-form-item label="描述颜色">
          <ObColorField v-model="sectionData.entrance.descriptionColor" show-alpha />
        </el-form-item>

        <el-form-item label="图标颜色">
          <ObColorField v-model="sectionData.entrance.iconColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题字号(px)">
          <el-input-number
            v-model="sectionData.entrance.titleFontSize"
            :min="12"
            :max="32"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="描述字号(px)">
          <el-input-number
            v-model="sectionData.entrance.descriptionFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="图标尺寸(px)">
          <el-input-number
            v-model="sectionData.entrance.iconSize"
            :min="14"
            :max="48"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="图片高度(px)">
          <el-input-number
            v-model="sectionData.entrance.imageHeight"
            :min="40"
            :max="220"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="角标与间距">
        <el-form-item label="角标背景色">
          <ObColorField v-model="sectionData.entrance.badgeBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="角标文字色">
          <ObColorField v-model="sectionData.entrance.badgeTextColor" show-alpha />
        </el-form-item>

        <el-form-item label="行间距(px)">
          <el-input-number
            v-model="sectionData.entrance.rowGap"
            :min="0"
            :max="32"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="列间距(px)">
          <el-input-number
            v-model="sectionData.entrance.columnGap"
            :min="0"
            :max="32"
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

interface AppEntranceStyleData {
  container: UnifiedContainerStyleConfigModel;
  entrance: {
    cardBgColor: string;
    cardHoverBgColor: string;
    cardBorderColor: string;
    cardRadius: number;
    cardPadding: number;
    iconColor: string;
    titleColor: string;
    descriptionColor: string;
    badgeBgColor: string;
    badgeTextColor: string;
    titleFontSize: number;
    descriptionFontSize: number;
    iconSize: number;
    imageHeight: number;
    rowGap: number;
    columnGap: number;
  };
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<AppEntranceStyleData>({
  name: 'app-entrance-style',
  sections: {
    container: {},
    entrance: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.entrance = {
  cardBgColor: sectionData.entrance?.cardBgColor || 'transparent',
  cardHoverBgColor: sectionData.entrance?.cardHoverBgColor || 'transparent',
  cardBorderColor: sectionData.entrance?.cardBorderColor || 'transparent',
  cardRadius: Number.isFinite(Number(sectionData.entrance?.cardRadius))
    ? Number(sectionData.entrance.cardRadius)
    : 10,
  cardPadding: Number.isFinite(Number(sectionData.entrance?.cardPadding))
    ? Number(sectionData.entrance.cardPadding)
    : 12,
  iconColor: sectionData.entrance?.iconColor || '#606266',
  titleColor: sectionData.entrance?.titleColor || '#303133',
  descriptionColor: sectionData.entrance?.descriptionColor || '#86909c',
  badgeBgColor: sectionData.entrance?.badgeBgColor || '#dbeafe',
  badgeTextColor: sectionData.entrance?.badgeTextColor || '#1d4ed8',
  titleFontSize:
    Number(sectionData.entrance?.titleFontSize) > 0
      ? Number(sectionData.entrance.titleFontSize)
      : 14,
  descriptionFontSize:
    Number(sectionData.entrance?.descriptionFontSize) > 0
      ? Number(sectionData.entrance.descriptionFontSize)
      : 12,
  iconSize: Number(sectionData.entrance?.iconSize) > 0 ? Number(sectionData.entrance.iconSize) : 20,
  imageHeight:
    Number(sectionData.entrance?.imageHeight) > 0 ? Number(sectionData.entrance.imageHeight) : 60,
  rowGap: Number.isFinite(Number(sectionData.entrance?.rowGap))
    ? Number(sectionData.entrance.rowGap)
    : 16,
  columnGap: Number.isFinite(Number(sectionData.entrance?.columnGap))
    ? Number(sectionData.entrance.columnGap)
    : 50
};

defineOptions({
  name: 'app-entrance-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
