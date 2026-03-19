<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="时间线样式">
        <el-form-item label="连线颜色">
          <ObColorField v-model="sectionData.timeline.lineColor" show-alpha />
        </el-form-item>

        <el-form-item label="圆点颜色">
          <ObColorField v-model="sectionData.timeline.pointColor" show-alpha />
        </el-form-item>

        <el-form-item label="时间颜色">
          <ObColorField v-model="sectionData.timeline.timeColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题颜色">
          <ObColorField v-model="sectionData.timeline.titleColor" show-alpha />
        </el-form-item>

        <el-form-item label="内容颜色">
          <ObColorField v-model="sectionData.timeline.contentColor" show-alpha />
        </el-form-item>
      </ObCard>

      <ObCard title="排版参数">
        <el-form-item label="时间字号(px)">
          <el-input-number
            v-model="sectionData.timeline.timeFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="标题字号(px)">
          <el-input-number
            v-model="sectionData.timeline.titleFontSize"
            :min="12"
            :max="28"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="内容字号(px)">
          <el-input-number
            v-model="sectionData.timeline.contentFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="行间距(px)">
          <el-input-number
            v-model="sectionData.timeline.rowGap"
            :min="0"
            :max="36"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="时间列宽(px)">
          <el-input-number
            v-model="sectionData.timeline.timeWidth"
            :min="80"
            :max="220"
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

interface BaseTimelineStyleData {
  container: UnifiedContainerStyleConfigModel;
  timeline: {
    lineColor: string;
    pointColor: string;
    timeColor: string;
    titleColor: string;
    contentColor: string;
    timeFontSize: number;
    titleFontSize: number;
    contentFontSize: number;
    rowGap: number;
    timeWidth: number;
  };
}

const BASE_TIMELINE_STYLE_DEFAULTS: BaseTimelineStyleData['timeline'] = {
  lineColor: '#cbd5e1',
  pointColor: '#2563eb',
  timeColor: '#64748b',
  titleColor: '#0f172a',
  contentColor: '#475569',
  timeFontSize: 12,
  titleFontSize: 14,
  contentFontSize: 12,
  rowGap: 14,
  timeWidth: 120
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseTimelineStyleData>({
  name: 'base-timeline-style',
  sections: {
    container: {},
    timeline: {
      defaultValue: BASE_TIMELINE_STYLE_DEFAULTS
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.timeline = {
  lineColor: sectionData.timeline?.lineColor || BASE_TIMELINE_STYLE_DEFAULTS.lineColor,
  pointColor: sectionData.timeline?.pointColor || BASE_TIMELINE_STYLE_DEFAULTS.pointColor,
  timeColor: sectionData.timeline?.timeColor || BASE_TIMELINE_STYLE_DEFAULTS.timeColor,
  titleColor: sectionData.timeline?.titleColor || BASE_TIMELINE_STYLE_DEFAULTS.titleColor,
  contentColor: sectionData.timeline?.contentColor || BASE_TIMELINE_STYLE_DEFAULTS.contentColor,
  timeFontSize:
    Number(sectionData.timeline?.timeFontSize) > 0
      ? Number(sectionData.timeline.timeFontSize)
      : BASE_TIMELINE_STYLE_DEFAULTS.timeFontSize,
  titleFontSize:
    Number(sectionData.timeline?.titleFontSize) > 0
      ? Number(sectionData.timeline.titleFontSize)
      : BASE_TIMELINE_STYLE_DEFAULTS.titleFontSize,
  contentFontSize:
    Number(sectionData.timeline?.contentFontSize) > 0
      ? Number(sectionData.timeline.contentFontSize)
      : BASE_TIMELINE_STYLE_DEFAULTS.contentFontSize,
  rowGap: Number.isFinite(Number(sectionData.timeline?.rowGap))
    ? Number(sectionData.timeline.rowGap)
    : BASE_TIMELINE_STYLE_DEFAULTS.rowGap,
  timeWidth:
    Number(sectionData.timeline?.timeWidth) > 0
      ? Number(sectionData.timeline.timeWidth)
      : BASE_TIMELINE_STYLE_DEFAULTS.timeWidth
};

defineOptions({
  name: 'base-timeline-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
