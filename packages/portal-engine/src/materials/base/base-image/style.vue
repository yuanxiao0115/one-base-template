<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="图片样式">
        <el-form-item label="高度(px)">
          <el-input-number v-model="sectionData.image.height" :min="80" :max="1200" controls-position="right" />
        </el-form-item>

        <el-form-item label="宽度模式">
          <el-select v-model="sectionData.image.widthMode">
            <el-option label="铺满容器" value="full" />
            <el-option label="自定义宽度" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="sectionData.image.widthMode === 'custom'" label="宽度(px)">
          <el-input-number v-model="sectionData.image.width" :min="120" :max="1600" controls-position="right" />
        </el-form-item>

        <el-form-item label="图片填充">
          <el-select v-model="sectionData.image.objectFit">
            <el-option label="cover" value="cover" />
            <el-option label="contain" value="contain" />
            <el-option label="fill" value="fill" />
            <el-option label="none" value="none" />
            <el-option label="scale-down" value="scale-down" />
          </el-select>
        </el-form-item>

        <el-form-item label="背景色">
          <PortalColorField v-model="sectionData.image.backgroundColor" show-alpha />
        </el-form-item>

        <PortalBorderField
          v-model="imageBorderValue"
          :width-min="0"
          :width-max="20"
          :radius-max="80"
          :hide-color-width-when-none="false"
        />

        <el-form-item label="阴影">
          <el-input
            v-model.trim="sectionData.image.boxShadow"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            maxlength="120"
            show-word-limit
            placeholder="例如：0 12px 32px rgba(15, 23, 42, 0.12)"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="图片说明样式">
        <el-form-item label="说明文字颜色">
          <PortalColorField v-model="sectionData.image.captionColor" show-alpha />
        </el-form-item>

        <el-form-item label="说明字号(px)">
          <el-input-number v-model="sectionData.image.captionFontSize" :min="12" :max="40" controls-position="right" />
        </el-form-item>

        <el-form-item label="说明上间距(px)">
          <el-input-number v-model="sectionData.image.captionMarginTop" :min="0" :max="100" controls-position="right" />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { ObCard } from '@one-base-template/ui';
  import { useSchemaConfig } from '../../../composables/useSchemaConfig';
  import PortalBorderField from '../../common/fields/PortalBorderField.vue';
  import PortalColorField from '../../common/fields/PortalColorField.vue';
  import { UnifiedContainerStyleConfig, mergeUnifiedContainerStyleConfig } from '../../common/unified-container';
  import type { UnifiedContainerStyleConfigModel } from '../../common/unified-container';

  type BorderStyleType = 'none' | 'solid' | 'dashed' | 'dotted';
  type WidthModeType = 'full' | 'custom';
  type FitType = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

  interface BaseImageStyleData {
    container: UnifiedContainerStyleConfigModel;
    image: {
      height: number;
      widthMode: WidthModeType;
      width: number;
      objectFit: FitType;
      backgroundColor: string;
      borderStyle: BorderStyleType;
      borderWidth: number;
      borderColor: string;
      borderRadius: number;
      boxShadow: string;
      captionColor: string;
      captionFontSize: number;
      captionMarginTop: number;
    };
  }

  const props = defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['schemaChange']);

  const { sectionData } = useSchemaConfig<BaseImageStyleData>({
    name: 'base-image-style',
    sections: {
      container: {},
      image: {},
    },
    schema: props.schema,
    onChange: (newSchema) => {
      emit('schemaChange', 'style', newSchema);
    },
  });

  sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
  sectionData.image = {
    height: Number(sectionData.image?.height) > 0 ? Number(sectionData.image.height) : 220,
    widthMode: sectionData.image?.widthMode === 'custom' ? 'custom' : 'full',
    width: Number(sectionData.image?.width) > 0 ? Number(sectionData.image.width) : 320,
    objectFit:
      sectionData.image?.objectFit === 'fill' ||
      sectionData.image?.objectFit === 'contain' ||
      sectionData.image?.objectFit === 'cover' ||
      sectionData.image?.objectFit === 'none' ||
      sectionData.image?.objectFit === 'scale-down'
        ? sectionData.image.objectFit
        : 'cover',
    backgroundColor: sectionData.image?.backgroundColor || '#f8fafc',
    borderStyle: sectionData.image?.borderStyle || 'none',
    borderWidth: Number.isFinite(Number(sectionData.image?.borderWidth)) ? Number(sectionData.image.borderWidth) : 0,
    borderColor: sectionData.image?.borderColor || '#e2e8f0',
    borderRadius: Number.isFinite(Number(sectionData.image?.borderRadius)) ? Number(sectionData.image.borderRadius) : 8,
    boxShadow: sectionData.image?.boxShadow || 'none',
    captionColor: sectionData.image?.captionColor || '#475569',
    captionFontSize: Number(sectionData.image?.captionFontSize) > 0 ? Number(sectionData.image.captionFontSize) : 13,
    captionMarginTop: Number.isFinite(Number(sectionData.image?.captionMarginTop))
      ? Number(sectionData.image.captionMarginTop)
      : 8,
  };

  const imageBorderValue = computed({
    get: () => ({
      style: sectionData.image.borderStyle,
      color: sectionData.image.borderColor,
      width: Number(sectionData.image.borderWidth) || 0,
      radius: Number(sectionData.image.borderRadius) || 0,
    }),
    set: (value) => {
      sectionData.image.borderStyle = value.style as BorderStyleType;
      sectionData.image.borderColor = value.color;
      sectionData.image.borderWidth = Number(value.width) || 0;
      sectionData.image.borderRadius = Number(value.radius) || 0;
    },
  });

  defineOptions({
    name: 'base-image-style',
  });
</script>

<style scoped>
  .style-config {
    padding: 2px 0 8px;
  }
</style>
