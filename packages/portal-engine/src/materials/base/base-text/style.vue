<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="文本样式">
        <el-form-item label="对齐方式">
          <el-segmented
            v-model="sectionData.text.align"
            :options="[
              { label: '左', value: 'left' },
              { label: '中', value: 'center' },
              { label: '右', value: 'right' },
              { label: '两端', value: 'justify' }
            ]"
          />
        </el-form-item>

        <el-form-item label="文字颜色">
          <ObColorField v-model="sectionData.text.textColor" show-alpha />
        </el-form-item>

        <el-form-item label="背景色">
          <ObColorField v-model="sectionData.text.backgroundColor" show-alpha />
        </el-form-item>

        <el-form-item label="字号(px)">
          <el-input-number
            v-model="sectionData.text.fontSize"
            :min="12"
            :max="64"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="字重">
          <el-input-number
            v-model="sectionData.text.fontWeight"
            :min="300"
            :max="900"
            :step="100"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="行高">
          <el-input-number
            v-model="sectionData.text.lineHeight"
            :min="1"
            :max="3"
            :step="0.1"
            :precision="1"
          />
        </el-form-item>

        <el-form-item label="字间距(px)">
          <el-input-number
            v-model="sectionData.text.letterSpacing"
            :min="0"
            :max="30"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="内边距(px)">
          <el-input-number
            v-model="sectionData.text.padding"
            :min="0"
            :max="120"
            controls-position="right"
          />
        </el-form-item>

        <PortalBorderField
          v-model="textBorderValue"
          :width-min="0"
          :width-max="20"
          :radius-max="60"
          :hide-color-width-when-none="false"
        />

        <el-form-item label="最大行数(0为不限制)">
          <el-input-number
            v-model="sectionData.text.maxLines"
            :min="0"
            :max="20"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ObCard, ObColorField } from '@one-base-template/ui';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import PortalBorderField from '../../common/fields/PortalBorderField.vue';
import {
  UnifiedContainerStyleConfig,
  mergeUnifiedContainerStyleConfig
} from '../../common/unified-container';
import type { UnifiedContainerStyleConfigModel } from '../../common/unified-container';

type AlignType = 'left' | 'center' | 'right' | 'justify';
type BorderStyleType = 'none' | 'solid' | 'dashed' | 'dotted';

interface BaseTextStyleData {
  container: UnifiedContainerStyleConfigModel;
  text: {
    align: AlignType;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    letterSpacing: number;
    textColor: string;
    backgroundColor: string;
    padding: number;
    borderStyle: BorderStyleType;
    borderWidth: number;
    borderColor: string;
    borderRadius: number;
    maxLines: number;
  };
}

const BASE_TEXT_STYLE_DEFAULTS: BaseTextStyleData['text'] = {
  align: 'left',
  fontSize: 15,
  fontWeight: 400,
  lineHeight: 1.7,
  letterSpacing: 0,
  textColor: '#334155',
  backgroundColor: 'transparent',
  padding: 0,
  borderStyle: 'none',
  borderWidth: 0,
  borderColor: '#e2e8f0',
  borderRadius: 0,
  maxLines: 0
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseTextStyleData>({
  name: 'base-text-style',
  sections: {
    container: {},
    text: {
      defaultValue: BASE_TEXT_STYLE_DEFAULTS
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.text = {
  align:
    sectionData.text?.align === 'center' ||
    sectionData.text?.align === 'right' ||
    sectionData.text?.align === 'justify'
      ? sectionData.text.align
      : BASE_TEXT_STYLE_DEFAULTS.align,
  fontSize:
    Number(sectionData.text?.fontSize) > 0
      ? Number(sectionData.text.fontSize)
      : BASE_TEXT_STYLE_DEFAULTS.fontSize,
  fontWeight: Number.isFinite(Number(sectionData.text?.fontWeight))
    ? Number(sectionData.text.fontWeight)
    : BASE_TEXT_STYLE_DEFAULTS.fontWeight,
  lineHeight:
    Number(sectionData.text?.lineHeight) > 0
      ? Number(sectionData.text.lineHeight)
      : BASE_TEXT_STYLE_DEFAULTS.lineHeight,
  letterSpacing: Number.isFinite(Number(sectionData.text?.letterSpacing))
    ? Number(sectionData.text.letterSpacing)
    : BASE_TEXT_STYLE_DEFAULTS.letterSpacing,
  textColor: sectionData.text?.textColor || BASE_TEXT_STYLE_DEFAULTS.textColor,
  backgroundColor: sectionData.text?.backgroundColor || BASE_TEXT_STYLE_DEFAULTS.backgroundColor,
  padding: Number.isFinite(Number(sectionData.text?.padding))
    ? Number(sectionData.text.padding)
    : BASE_TEXT_STYLE_DEFAULTS.padding,
  borderStyle: sectionData.text?.borderStyle || BASE_TEXT_STYLE_DEFAULTS.borderStyle,
  borderWidth: Number.isFinite(Number(sectionData.text?.borderWidth))
    ? Number(sectionData.text.borderWidth)
    : BASE_TEXT_STYLE_DEFAULTS.borderWidth,
  borderColor: sectionData.text?.borderColor || BASE_TEXT_STYLE_DEFAULTS.borderColor,
  borderRadius: Number.isFinite(Number(sectionData.text?.borderRadius))
    ? Number(sectionData.text.borderRadius)
    : BASE_TEXT_STYLE_DEFAULTS.borderRadius,
  maxLines: Number.isFinite(Number(sectionData.text?.maxLines))
    ? Number(sectionData.text.maxLines)
    : BASE_TEXT_STYLE_DEFAULTS.maxLines
};

const textBorderValue = computed({
  get: () => ({
    style: sectionData.text.borderStyle,
    color: sectionData.text.borderColor,
    width: Number(sectionData.text.borderWidth) || 0,
    radius: Number(sectionData.text.borderRadius) || 0
  }),
  set: (value) => {
    sectionData.text.borderStyle = value.style as BorderStyleType;
    sectionData.text.borderColor = value.color;
    sectionData.text.borderWidth = Number(value.width) || 0;
    sectionData.text.borderRadius = Number(value.radius) || 0;
  }
});

defineOptions({
  name: 'base-text-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
