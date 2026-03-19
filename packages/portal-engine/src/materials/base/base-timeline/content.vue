<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <PortalDataSourceCard v-model="sectionData.dataSource" :show-page-params="false" />

      <ObCard title="字段映射">
        <el-form-item label="时间字段 key">
          <el-input
            v-model.trim="sectionData.timeline.timeKey"
            maxlength="40"
            show-word-limit
            placeholder="例如：publishTime"
          />
        </el-form-item>

        <el-form-item label="标题字段 key">
          <el-input
            v-model.trim="sectionData.timeline.titleKey"
            maxlength="40"
            show-word-limit
            placeholder="例如：title"
          />
        </el-form-item>

        <el-form-item label="内容字段 key">
          <el-input
            v-model.trim="sectionData.timeline.contentKey"
            maxlength="40"
            show-word-limit
            placeholder="例如：content"
          />
        </el-form-item>

        <el-form-item label="主键字段 key">
          <el-input
            v-model.trim="sectionData.timeline.idKey"
            maxlength="40"
            show-word-limit
            placeholder="例如：id"
          />
        </el-form-item>

        <el-form-item label="最大显示数">
          <el-input-number
            v-model="sectionData.timeline.maxDisplayCount"
            :min="1"
            :max="40"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="时间线跳转（可选）">
        <PortalActionLinkField
          v-model="sectionData.timeline.link"
          path-label="跳转路径"
          path-placeholder="例如：/portal/news/detail"
          param-key-label="参数 key"
          value-key-label="参数取值字段 key"
          value-key-placeholder="例如：id"
        />
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ObCard } from '@one-base-template/ui';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import PortalActionLinkField from '../common/PortalActionLinkField.vue';
import PortalDataSourceCard from '../common/PortalDataSourceCard.vue';
import {
  createDefaultPortalDataSourceModel,
  mergePortalDataSourceModel,
  type PortalDataSourceModel
} from '../common/portal-data-source';
import { mergePortalLinkConfig, type PortalLinkConfig } from '../common/portal-link';
import {
  UnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';

interface BaseTimelineContentData {
  container: UnifiedContainerContentConfigModel;
  dataSource: PortalDataSourceModel;
  timeline: {
    timeKey: string;
    titleKey: string;
    contentKey: string;
    idKey: string;
    maxDisplayCount: number;
    linkPath?: string;
    linkParamKey?: string;
    linkValueKey?: string;
    openType?: PortalLinkConfig['openType'];
    link: PortalLinkConfig;
  };
}

const BASE_TIMELINE_CONTENT_CONTAINER_DEFAULTS = mergeUnifiedContainerContentConfig({
  title: '时间轴',
  subtitle: '支持静态与接口时间线数据'
});

const BASE_TIMELINE_CONTENT_DATA_SOURCE_DEFAULTS = {
  ...createDefaultPortalDataSourceModel(),
  staticRowsJson:
    '[{"id":"1","time":"2026-03-10","title":"发布通知","content":"门户基础物料版本发布"}]'
};

const BASE_TIMELINE_CONTENT_TIMELINE_DEFAULTS = {
  timeKey: 'time',
  titleKey: 'title',
  contentKey: 'content',
  idKey: 'id',
  maxDisplayCount: 10
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseTimelineContentData>({
  name: 'base-timeline-content',
  sections: {
    container: {
      defaultValue: BASE_TIMELINE_CONTENT_CONTAINER_DEFAULTS
    },
    dataSource: {
      defaultValue: BASE_TIMELINE_CONTENT_DATA_SOURCE_DEFAULTS
    },
    timeline: {
      defaultValue: BASE_TIMELINE_CONTENT_TIMELINE_DEFAULTS
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
sectionData.dataSource = mergePortalDataSourceModel(sectionData.dataSource);
if (!sectionData.dataSource.staticRowsJson.trim()) {
  sectionData.dataSource = { ...BASE_TIMELINE_CONTENT_DATA_SOURCE_DEFAULTS };
}

sectionData.timeline = {
  timeKey:
    typeof sectionData.timeline?.timeKey === 'string' && sectionData.timeline.timeKey.trim()
      ? sectionData.timeline.timeKey
      : BASE_TIMELINE_CONTENT_TIMELINE_DEFAULTS.timeKey,
  titleKey:
    typeof sectionData.timeline?.titleKey === 'string' && sectionData.timeline.titleKey.trim()
      ? sectionData.timeline.titleKey
      : BASE_TIMELINE_CONTENT_TIMELINE_DEFAULTS.titleKey,
  contentKey:
    typeof sectionData.timeline?.contentKey === 'string' && sectionData.timeline.contentKey.trim()
      ? sectionData.timeline.contentKey
      : BASE_TIMELINE_CONTENT_TIMELINE_DEFAULTS.contentKey,
  idKey:
    typeof sectionData.timeline?.idKey === 'string' && sectionData.timeline.idKey.trim()
      ? sectionData.timeline.idKey
      : BASE_TIMELINE_CONTENT_TIMELINE_DEFAULTS.idKey,
  maxDisplayCount:
    Number(sectionData.timeline?.maxDisplayCount) > 0
      ? Number(sectionData.timeline.maxDisplayCount)
      : BASE_TIMELINE_CONTENT_TIMELINE_DEFAULTS.maxDisplayCount,
  link: mergePortalLinkConfig(
    sectionData.timeline?.link || {
      path: sectionData.timeline?.linkPath,
      paramKey: sectionData.timeline?.linkParamKey,
      valueKey: sectionData.timeline?.linkValueKey,
      openType: sectionData.timeline?.openType
    }
  )
};

if (!sectionData.timeline.link.paramKey.trim()) {
  sectionData.timeline.link.paramKey = 'id';
}
if (!sectionData.timeline.link.valueKey.trim()) {
  sectionData.timeline.link.valueKey = sectionData.timeline.idKey;
}

defineOptions({
  name: 'base-timeline-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
