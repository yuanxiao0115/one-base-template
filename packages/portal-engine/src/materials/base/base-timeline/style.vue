<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="时间线样式">
        <el-form-item label="连线颜色">
          <PortalColorField v-model="sectionData.timeline.lineColor" show-alpha />
        </el-form-item>

        <el-form-item label="圆点颜色">
          <PortalColorField v-model="sectionData.timeline.pointColor" show-alpha />
        </el-form-item>

        <el-form-item label="时间颜色">
          <PortalColorField v-model="sectionData.timeline.timeColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题颜色">
          <PortalColorField v-model="sectionData.timeline.titleColor" show-alpha />
        </el-form-item>

        <el-form-item label="内容颜色">
          <PortalColorField v-model="sectionData.timeline.contentColor" show-alpha />
        </el-form-item>
      </ObCard>

      <ObCard title="排版参数">
        <el-form-item label="时间字号(px)">
          <el-input-number v-model="sectionData.timeline.timeFontSize" :min="12" :max="24" controls-position="right" />
        </el-form-item>

        <el-form-item label="标题字号(px)">
          <el-input-number v-model="sectionData.timeline.titleFontSize" :min="12" :max="28" controls-position="right" />
        </el-form-item>

        <el-form-item label="内容字号(px)">
          <el-input-number v-model="sectionData.timeline.contentFontSize" :min="12" :max="24" controls-position="right" />
        </el-form-item>

        <el-form-item label="行间距(px)">
          <el-input-number v-model="sectionData.timeline.rowGap" :min="0" :max="36" controls-position="right" />
        </el-form-item>

        <el-form-item label="时间列宽(px)">
          <el-input-number v-model="sectionData.timeline.timeWidth" :min="80" :max="220" controls-position="right" />
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

  const props = defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['schemaChange']);

  const { sectionData } = useSchemaConfig<BaseTimelineStyleData>({
    name: 'base-timeline-style',
    sections: {
      container: {},
      timeline: {},
    },
    schema: props.schema,
    onChange: (newSchema) => {
      emit('schemaChange', 'style', newSchema);
    },
  });

  sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
  sectionData.timeline = {
    lineColor: sectionData.timeline?.lineColor || '#cbd5e1',
    pointColor: sectionData.timeline?.pointColor || '#2563eb',
    timeColor: sectionData.timeline?.timeColor || '#64748b',
    titleColor: sectionData.timeline?.titleColor || '#0f172a',
    contentColor: sectionData.timeline?.contentColor || '#475569',
    timeFontSize: Number(sectionData.timeline?.timeFontSize) > 0 ? Number(sectionData.timeline.timeFontSize) : 12,
    titleFontSize: Number(sectionData.timeline?.titleFontSize) > 0 ? Number(sectionData.timeline.titleFontSize) : 14,
    contentFontSize: Number(sectionData.timeline?.contentFontSize) > 0 ? Number(sectionData.timeline.contentFontSize) : 12,
    rowGap: Number.isFinite(Number(sectionData.timeline?.rowGap)) ? Number(sectionData.timeline.rowGap) : 14,
    timeWidth: Number(sectionData.timeline?.timeWidth) > 0 ? Number(sectionData.timeline.timeWidth) : 120,
  };

  defineOptions({
    name: 'base-timeline-style',
  });
</script>

<style scoped>
  .style-config {
    padding: 2px 0 8px;
  }
</style>
