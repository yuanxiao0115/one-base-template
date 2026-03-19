<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <PortalDataSourceCard v-model="sectionData.dataSource" :show-page-params="false" />

      <ObCard title="字段映射">
        <el-form-item label="标题字段 key">
          <el-input
            v-model.trim="sectionData.stat.titleKey"
            maxlength="40"
            show-word-limit
            placeholder="例如：title"
          />
        </el-form-item>

        <el-form-item label="数值字段 key">
          <el-input
            v-model.trim="sectionData.stat.valueKey"
            maxlength="40"
            show-word-limit
            placeholder="例如：value"
          />
        </el-form-item>

        <el-form-item label="单位字段 key">
          <el-input
            v-model.trim="sectionData.stat.unitKey"
            maxlength="40"
            show-word-limit
            placeholder="例如：unit"
          />
        </el-form-item>

        <el-form-item label="趋势字段 key">
          <el-input
            v-model.trim="sectionData.stat.trendKey"
            maxlength="40"
            show-word-limit
            placeholder="例如：trend"
          />
        </el-form-item>

        <el-form-item label="主键字段 key">
          <el-input
            v-model.trim="sectionData.stat.idKey"
            maxlength="40"
            show-word-limit
            placeholder="例如：id"
          />
        </el-form-item>

        <el-form-item label="最大显示数">
          <el-input-number
            v-model="sectionData.stat.maxDisplayCount"
            :min="1"
            :max="24"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="统计卡片跳转">
        <PortalActionLinkField v-model="sectionData.stat.link" />
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

interface BaseStatContentData {
  container: UnifiedContainerContentConfigModel;
  dataSource: PortalDataSourceModel;
  stat: {
    titleKey: string;
    valueKey: string;
    unitKey: string;
    trendKey: string;
    idKey: string;
    maxDisplayCount: number;
    linkPath?: string;
    linkParamKey?: string;
    linkValueKey?: string;
    openType?: PortalLinkConfig['openType'];
    link: PortalLinkConfig;
  };
}

const BASE_STAT_CONTENT_CONTAINER_DEFAULTS = mergeUnifiedContainerContentConfig({
  title: '统计卡片',
  subtitle: '支持静态与接口统计数据'
});

const BASE_STAT_CONTENT_DATA_SOURCE_DEFAULTS = {
  ...createDefaultPortalDataSourceModel(),
  staticRowsJson: '[{"id":"1","title":"访问量","value":3280,"unit":"次","trend":"+12.5%"}]'
};

const BASE_STAT_CONTENT_STAT_DEFAULTS = {
  titleKey: 'title',
  valueKey: 'value',
  unitKey: 'unit',
  trendKey: 'trend',
  idKey: 'id',
  maxDisplayCount: 8
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseStatContentData>({
  name: 'base-stat-content',
  sections: {
    container: {
      defaultValue: BASE_STAT_CONTENT_CONTAINER_DEFAULTS
    },
    dataSource: {
      defaultValue: BASE_STAT_CONTENT_DATA_SOURCE_DEFAULTS
    },
    stat: {
      defaultValue: BASE_STAT_CONTENT_STAT_DEFAULTS
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
  sectionData.dataSource = { ...BASE_STAT_CONTENT_DATA_SOURCE_DEFAULTS };
}

sectionData.stat = {
  titleKey:
    typeof sectionData.stat?.titleKey === 'string' && sectionData.stat.titleKey.trim()
      ? sectionData.stat.titleKey
      : BASE_STAT_CONTENT_STAT_DEFAULTS.titleKey,
  valueKey:
    typeof sectionData.stat?.valueKey === 'string' && sectionData.stat.valueKey.trim()
      ? sectionData.stat.valueKey
      : BASE_STAT_CONTENT_STAT_DEFAULTS.valueKey,
  unitKey:
    typeof sectionData.stat?.unitKey === 'string' && sectionData.stat.unitKey.trim()
      ? sectionData.stat.unitKey
      : BASE_STAT_CONTENT_STAT_DEFAULTS.unitKey,
  trendKey:
    typeof sectionData.stat?.trendKey === 'string' && sectionData.stat.trendKey.trim()
      ? sectionData.stat.trendKey
      : BASE_STAT_CONTENT_STAT_DEFAULTS.trendKey,
  idKey:
    typeof sectionData.stat?.idKey === 'string' && sectionData.stat.idKey.trim()
      ? sectionData.stat.idKey
      : BASE_STAT_CONTENT_STAT_DEFAULTS.idKey,
  maxDisplayCount:
    Number(sectionData.stat?.maxDisplayCount) > 0
      ? Number(sectionData.stat.maxDisplayCount)
      : BASE_STAT_CONTENT_STAT_DEFAULTS.maxDisplayCount,
  link: mergePortalLinkConfig(
    sectionData.stat?.link || {
      path: sectionData.stat?.linkPath,
      paramKey: sectionData.stat?.linkParamKey,
      valueKey: sectionData.stat?.linkValueKey,
      openType: sectionData.stat?.openType
    }
  )
};

defineOptions({
  name: 'base-stat-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
