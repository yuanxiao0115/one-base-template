<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="轮播样式">
        <el-form-item label="高度(px)">
          <el-input-number v-model="sectionData.carousel.height" :min="160" :max="1200" controls-position="right" />
        </el-form-item>

        <el-form-item label="圆角(px)">
          <el-input-number v-model="sectionData.carousel.borderRadius" :min="0" :max="64" controls-position="right" />
        </el-form-item>

        <el-form-item label="图片填充">
          <el-select v-model="sectionData.carousel.imageFit">
            <el-option label="cover" value="cover" />
            <el-option label="contain" value="contain" />
            <el-option label="fill" value="fill" />
            <el-option label="none" value="none" />
            <el-option label="scale-down" value="scale-down" />
          </el-select>
        </el-form-item>

        <el-form-item label="遮罩背景">
          <PortalColorField v-model="sectionData.carousel.overlayBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="内容对齐">
          <el-segmented
            v-model="sectionData.carousel.contentAlign"
            :options="[
              { label: '左', value: 'left' },
              { label: '中', value: 'center' },
              { label: '右', value: 'right' }
            ]"
          />
        </el-form-item>

        <el-form-item label="内容横向内边距(px)">
          <el-input-number v-model="sectionData.carousel.contentPaddingX" :min="0" :max="120" controls-position="right" />
        </el-form-item>

        <el-form-item label="内容纵向内边距(px)">
          <el-input-number v-model="sectionData.carousel.contentPaddingY" :min="0" :max="120" controls-position="right" />
        </el-form-item>
      </ObCard>

      <ObCard title="标题文字">
        <el-form-item label="标题颜色">
          <PortalColorField v-model="sectionData.carousel.titleColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题字号(px)">
          <el-input-number v-model="sectionData.carousel.titleFontSize" :min="14" :max="56" controls-position="right" />
        </el-form-item>

        <el-form-item label="副标题颜色">
          <PortalColorField v-model="sectionData.carousel.subtitleColor" show-alpha />
        </el-form-item>

        <el-form-item label="副标题字号(px)">
          <el-input-number v-model="sectionData.carousel.subtitleFontSize" :min="12" :max="40" controls-position="right" />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import { ObCard } from '@one-base-template/ui';
  import { useSchemaConfig } from '../../../composables/useSchemaConfig';
  import PortalColorField from '../../common/fields/PortalColorField.vue';
  import { UnifiedContainerStyleConfig, mergeUnifiedContainerStyleConfig } from '../../common/unified-container';
  import type { UnifiedContainerStyleConfigModel } from '../../common/unified-container';

  type ContentAlignType = 'left' | 'center' | 'right';
  type FitType = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

  interface BaseCarouselStyleData {
    container: UnifiedContainerStyleConfigModel;
    carousel: {
      height: number;
      borderRadius: number;
      overlayBgColor: string;
      titleColor: string;
      subtitleColor: string;
      titleFontSize: number;
      subtitleFontSize: number;
      contentAlign: ContentAlignType;
      contentPaddingX: number;
      contentPaddingY: number;
      imageFit: FitType;
    };
  }

  const props = defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['schemaChange']);

  const { sectionData } = useSchemaConfig<BaseCarouselStyleData>({
    name: 'base-carousel-style',
    sections: {
      container: {},
      carousel: {},
    },
    schema: props.schema,
    onChange: (newSchema) => {
      emit('schemaChange', 'style', newSchema);
    },
  });

  sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
  sectionData.carousel = {
    height: Number(sectionData.carousel?.height) > 0 ? Number(sectionData.carousel.height) : 260,
    borderRadius: Number.isFinite(Number(sectionData.carousel?.borderRadius)) ? Number(sectionData.carousel.borderRadius) : 10,
    overlayBgColor: sectionData.carousel?.overlayBgColor || 'rgba(15, 23, 42, 0.35)',
    titleColor: sectionData.carousel?.titleColor || '#ffffff',
    subtitleColor: sectionData.carousel?.subtitleColor || 'rgba(255,255,255,0.9)',
    titleFontSize: Number(sectionData.carousel?.titleFontSize) > 0 ? Number(sectionData.carousel.titleFontSize) : 20,
    subtitleFontSize: Number(sectionData.carousel?.subtitleFontSize) > 0
      ? Number(sectionData.carousel.subtitleFontSize)
      : 14,
    contentAlign:
      sectionData.carousel?.contentAlign === 'center' || sectionData.carousel?.contentAlign === 'right'
        ? sectionData.carousel.contentAlign
        : 'left',
    contentPaddingX: Number.isFinite(Number(sectionData.carousel?.contentPaddingX))
      ? Number(sectionData.carousel.contentPaddingX)
      : 20,
    contentPaddingY: Number.isFinite(Number(sectionData.carousel?.contentPaddingY))
      ? Number(sectionData.carousel.contentPaddingY)
      : 16,
    imageFit:
      sectionData.carousel?.imageFit === 'fill' ||
      sectionData.carousel?.imageFit === 'contain' ||
      sectionData.carousel?.imageFit === 'cover' ||
      sectionData.carousel?.imageFit === 'none' ||
      sectionData.carousel?.imageFit === 'scale-down'
        ? sectionData.carousel.imageFit
        : 'cover',
  };

  defineOptions({
    name: 'base-carousel-style',
  });
</script>

<style scoped>
  .style-config {
    padding: 2px 0 8px;
  }
</style>
