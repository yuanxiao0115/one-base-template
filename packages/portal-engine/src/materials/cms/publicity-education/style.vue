<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="标签样式">
        <el-form-item label="文字颜色">
          <ObColorField v-model="sectionData.publicity.tabTextColor" show-alpha />
        </el-form-item>

        <el-form-item label="激活文字颜色">
          <ObColorField v-model="sectionData.publicity.tabActiveTextColor" show-alpha />
        </el-form-item>

        <el-form-item label="背景色">
          <ObColorField v-model="sectionData.publicity.tabBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="激活背景色">
          <ObColorField v-model="sectionData.publicity.tabActiveBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="激活边框色">
          <ObColorField v-model="sectionData.publicity.tabActiveBorderColor" show-alpha />
        </el-form-item>

        <el-form-item label="字号(px)">
          <el-input-number
            v-model="sectionData.publicity.tabFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="标签间距(px)">
          <el-input-number
            v-model="sectionData.publicity.tabGap"
            :min="0"
            :max="24"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="标签纵向内边距(px)">
          <el-input-number
            v-model="sectionData.publicity.tabPaddingY"
            :min="0"
            :max="24"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="标签横向内边距(px)">
          <el-input-number
            v-model="sectionData.publicity.tabPaddingX"
            :min="0"
            :max="40"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="轮播样式">
        <el-form-item label="轮播高度(px)">
          <el-input-number
            v-model="sectionData.publicity.carouselHeight"
            :min="120"
            :max="480"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="轮播圆角(px)">
          <el-input-number
            v-model="sectionData.publicity.carouselBorderRadius"
            :min="0"
            :max="40"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="轮播标题颜色">
          <ObColorField v-model="sectionData.publicity.carouselTitleColor" show-alpha />
        </el-form-item>

        <el-form-item label="轮播标题背景色">
          <ObColorField v-model="sectionData.publicity.carouselTitleBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="轮播标题字号(px)">
          <el-input-number
            v-model="sectionData.publicity.carouselTitleFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="文章列表样式">
        <el-form-item label="圆点颜色">
          <ObColorField v-model="sectionData.publicity.dotColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题颜色">
          <ObColorField v-model="sectionData.publicity.listTitleColor" show-alpha />
        </el-form-item>

        <el-form-item label="时间颜色">
          <ObColorField v-model="sectionData.publicity.listTimeColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题字号(px)">
          <el-input-number
            v-model="sectionData.publicity.listTitleFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="时间字号(px)">
          <el-input-number
            v-model="sectionData.publicity.listTimeFontSize"
            :min="12"
            :max="22"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="分割线颜色">
          <ObColorField v-model="sectionData.publicity.listDividerColor" show-alpha />
        </el-form-item>

        <el-form-item label="悬停背景色">
          <ObColorField v-model="sectionData.publicity.listHoverBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="行内边距(px)">
          <el-input-number
            v-model="sectionData.publicity.listRowPaddingY"
            :min="0"
            :max="30"
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

interface PublicityStyleConfig {
  tabTextColor: string;
  tabActiveTextColor: string;
  tabBgColor: string;
  tabActiveBgColor: string;
  tabActiveBorderColor: string;
  tabFontSize: number;
  tabGap: number;
  tabPaddingY: number;
  tabPaddingX: number;
  carouselHeight: number;
  carouselBorderRadius: number;
  carouselTitleColor: string;
  carouselTitleBgColor: string;
  carouselTitleFontSize: number;
  dotColor: string;
  listTitleColor: string;
  listTimeColor: string;
  listTitleFontSize: number;
  listTimeFontSize: number;
  listDividerColor: string;
  listHoverBgColor: string;
  listRowPaddingY: number;
}

interface PublicityEducationStyleData {
  container: UnifiedContainerStyleConfigModel;
  publicity: PublicityStyleConfig;
}

const DEFAULT_PUBLICITY_STYLE: PublicityStyleConfig = {
  tabTextColor: '#606266',
  tabActiveTextColor: '#409eff',
  tabBgColor: 'transparent',
  tabActiveBgColor: 'transparent',
  tabActiveBorderColor: '#409eff',
  tabFontSize: 14,
  tabGap: 8,
  tabPaddingY: 10,
  tabPaddingX: 8,
  carouselHeight: 220,
  carouselBorderRadius: 4,
  carouselTitleColor: '#ffffff',
  carouselTitleBgColor: 'linear-gradient(180deg, rgb(0 0 0 / 0%) 0%, rgb(0 0 0 / 72%) 100%)',
  carouselTitleFontSize: 14,
  dotColor: '#7a7d83',
  listTitleColor: '#303133',
  listTimeColor: '#909399',
  listTitleFontSize: 15,
  listTimeFontSize: 14,
  listDividerColor: '#ebeef5',
  listHoverBgColor: '#f7f8fa',
  listRowPaddingY: 12
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<PublicityEducationStyleData>({
  name: 'cms-publicity-education-style',
  sections: {
    container: {},
    publicity: {
      defaultValue: DEFAULT_PUBLICITY_STYLE
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.publicity = {
  tabTextColor: sectionData.publicity?.tabTextColor || DEFAULT_PUBLICITY_STYLE.tabTextColor,
  tabActiveTextColor:
    sectionData.publicity?.tabActiveTextColor || DEFAULT_PUBLICITY_STYLE.tabActiveTextColor,
  tabBgColor: sectionData.publicity?.tabBgColor || DEFAULT_PUBLICITY_STYLE.tabBgColor,
  tabActiveBgColor:
    sectionData.publicity?.tabActiveBgColor || DEFAULT_PUBLICITY_STYLE.tabActiveBgColor,
  tabActiveBorderColor:
    sectionData.publicity?.tabActiveBorderColor || DEFAULT_PUBLICITY_STYLE.tabActiveBorderColor,
  tabFontSize:
    Number(sectionData.publicity?.tabFontSize) > 0
      ? Number(sectionData.publicity.tabFontSize)
      : DEFAULT_PUBLICITY_STYLE.tabFontSize,
  tabGap: Number.isFinite(Number(sectionData.publicity?.tabGap))
    ? Number(sectionData.publicity.tabGap)
    : DEFAULT_PUBLICITY_STYLE.tabGap,
  tabPaddingY: Number.isFinite(Number(sectionData.publicity?.tabPaddingY))
    ? Number(sectionData.publicity.tabPaddingY)
    : DEFAULT_PUBLICITY_STYLE.tabPaddingY,
  tabPaddingX: Number.isFinite(Number(sectionData.publicity?.tabPaddingX))
    ? Number(sectionData.publicity.tabPaddingX)
    : DEFAULT_PUBLICITY_STYLE.tabPaddingX,
  carouselHeight:
    Number(sectionData.publicity?.carouselHeight) > 0
      ? Number(sectionData.publicity.carouselHeight)
      : DEFAULT_PUBLICITY_STYLE.carouselHeight,
  carouselBorderRadius: Number.isFinite(Number(sectionData.publicity?.carouselBorderRadius))
    ? Number(sectionData.publicity.carouselBorderRadius)
    : DEFAULT_PUBLICITY_STYLE.carouselBorderRadius,
  carouselTitleColor:
    sectionData.publicity?.carouselTitleColor || DEFAULT_PUBLICITY_STYLE.carouselTitleColor,
  carouselTitleBgColor:
    sectionData.publicity?.carouselTitleBgColor || DEFAULT_PUBLICITY_STYLE.carouselTitleBgColor,
  carouselTitleFontSize:
    Number(sectionData.publicity?.carouselTitleFontSize) > 0
      ? Number(sectionData.publicity.carouselTitleFontSize)
      : DEFAULT_PUBLICITY_STYLE.carouselTitleFontSize,
  dotColor: sectionData.publicity?.dotColor || DEFAULT_PUBLICITY_STYLE.dotColor,
  listTitleColor: sectionData.publicity?.listTitleColor || DEFAULT_PUBLICITY_STYLE.listTitleColor,
  listTimeColor: sectionData.publicity?.listTimeColor || DEFAULT_PUBLICITY_STYLE.listTimeColor,
  listTitleFontSize:
    Number(sectionData.publicity?.listTitleFontSize) > 0
      ? Number(sectionData.publicity.listTitleFontSize)
      : DEFAULT_PUBLICITY_STYLE.listTitleFontSize,
  listTimeFontSize:
    Number(sectionData.publicity?.listTimeFontSize) > 0
      ? Number(sectionData.publicity.listTimeFontSize)
      : DEFAULT_PUBLICITY_STYLE.listTimeFontSize,
  listDividerColor:
    sectionData.publicity?.listDividerColor || DEFAULT_PUBLICITY_STYLE.listDividerColor,
  listHoverBgColor:
    sectionData.publicity?.listHoverBgColor || DEFAULT_PUBLICITY_STYLE.listHoverBgColor,
  listRowPaddingY: Number.isFinite(Number(sectionData.publicity?.listRowPaddingY))
    ? Number(sectionData.publicity.listRowPaddingY)
    : DEFAULT_PUBLICITY_STYLE.listRowPaddingY
};

defineOptions({
  name: 'cms-publicity-education-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
