<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="卡片样式">
        <el-form-item label="卡片背景色">
          <ObColorField v-model="sectionData.list.cardBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="卡片边框色">
          <ObColorField v-model="sectionData.list.cardBorderColor" show-alpha />
        </el-form-item>

        <el-form-item label="卡片圆角(px)">
          <el-input-number
            v-model="sectionData.list.cardRadius"
            :min="0"
            :max="40"
            controls-position="right"
          />
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

      <ObCard title="文本与标签">
        <el-form-item label="标题颜色">
          <ObColorField v-model="sectionData.list.titleColor" show-alpha />
        </el-form-item>

        <el-form-item label="描述颜色">
          <ObColorField v-model="sectionData.list.descriptionColor" show-alpha />
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

        <el-form-item label="标签背景色">
          <ObColorField v-model="sectionData.list.tagBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="标签文字色">
          <ObColorField v-model="sectionData.list.tagTextColor" show-alpha />
        </el-form-item>
      </ObCard>

      <ObCard title="间距">
        <el-form-item label="行间距(px)">
          <el-input-number
            v-model="sectionData.list.rowGap"
            :min="0"
            :max="32"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="列间距(px)">
          <el-input-number
            v-model="sectionData.list.columnGap"
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

interface ImageLinkListStyleData {
  container: UnifiedContainerStyleConfigModel;
  list: {
    cardBgColor: string;
    cardBorderColor: string;
    cardRadius: number;
    imageHeight: number;
    titleColor: string;
    descriptionColor: string;
    tagBgColor: string;
    tagTextColor: string;
    titleFontSize: number;
    descriptionFontSize: number;
    rowGap: number;
    columnGap: number;
  };
}

const IMAGE_LINK_LIST_STYLE_DEFAULTS: ImageLinkListStyleData['list'] = {
  cardBgColor: 'transparent',
  cardBorderColor: 'transparent',
  cardRadius: 0,
  imageHeight: 140,
  titleColor: '#0f172a',
  descriptionColor: '#64748b',
  tagBgColor: '#e0f2fe',
  tagTextColor: '#0369a1',
  titleFontSize: 15,
  descriptionFontSize: 12,
  rowGap: 16,
  columnGap: 16
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<ImageLinkListStyleData>({
  name: 'image-link-list-style',
  sections: {
    container: {},
    list: {
      defaultValue: IMAGE_LINK_LIST_STYLE_DEFAULTS
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.list = {
  cardBgColor: sectionData.list?.cardBgColor || IMAGE_LINK_LIST_STYLE_DEFAULTS.cardBgColor,
  cardBorderColor:
    sectionData.list?.cardBorderColor || IMAGE_LINK_LIST_STYLE_DEFAULTS.cardBorderColor,
  cardRadius: Number.isFinite(Number(sectionData.list?.cardRadius))
    ? Number(sectionData.list.cardRadius)
    : IMAGE_LINK_LIST_STYLE_DEFAULTS.cardRadius,
  imageHeight:
    Number(sectionData.list?.imageHeight) > 0
      ? Number(sectionData.list.imageHeight)
      : IMAGE_LINK_LIST_STYLE_DEFAULTS.imageHeight,
  titleColor: sectionData.list?.titleColor || IMAGE_LINK_LIST_STYLE_DEFAULTS.titleColor,
  descriptionColor:
    sectionData.list?.descriptionColor || IMAGE_LINK_LIST_STYLE_DEFAULTS.descriptionColor,
  tagBgColor: sectionData.list?.tagBgColor || IMAGE_LINK_LIST_STYLE_DEFAULTS.tagBgColor,
  tagTextColor: sectionData.list?.tagTextColor || IMAGE_LINK_LIST_STYLE_DEFAULTS.tagTextColor,
  titleFontSize:
    Number(sectionData.list?.titleFontSize) > 0
      ? Number(sectionData.list.titleFontSize)
      : IMAGE_LINK_LIST_STYLE_DEFAULTS.titleFontSize,
  descriptionFontSize:
    Number(sectionData.list?.descriptionFontSize) > 0
      ? Number(sectionData.list.descriptionFontSize)
      : IMAGE_LINK_LIST_STYLE_DEFAULTS.descriptionFontSize,
  rowGap: Number.isFinite(Number(sectionData.list?.rowGap))
    ? Number(sectionData.list.rowGap)
    : IMAGE_LINK_LIST_STYLE_DEFAULTS.rowGap,
  columnGap: Number.isFinite(Number(sectionData.list?.columnGap))
    ? Number(sectionData.list.columnGap)
    : IMAGE_LINK_LIST_STYLE_DEFAULTS.columnGap
};

defineOptions({
  name: 'image-link-list-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
