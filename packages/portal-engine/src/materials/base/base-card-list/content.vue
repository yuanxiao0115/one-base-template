<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <PortalDataSourceCard v-model="sectionData.dataSource" />

      <ObCard title="字段映射">
        <el-form-item label="标题字段 key">
          <el-input v-model.trim="sectionData.list.titleKey" maxlength="40" show-word-limit placeholder="例如：title" />
        </el-form-item>

        <el-form-item label="描述字段 key">
          <el-input
            v-model.trim="sectionData.list.descriptionKey"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            maxlength="80"
            show-word-limit
            placeholder="例如：description"
          />
        </el-form-item>

        <el-form-item label="图片字段 key">
          <el-input v-model.trim="sectionData.list.imageKey" maxlength="40" show-word-limit placeholder="例如：cover" />
        </el-form-item>

        <el-form-item label="日期字段 key">
          <el-input v-model.trim="sectionData.list.dateKey" maxlength="40" show-word-limit placeholder="例如：publishTime" />
        </el-form-item>

        <el-form-item label="主键字段 key">
          <el-input v-model.trim="sectionData.list.idKey" maxlength="40" show-word-limit placeholder="例如：id" />
        </el-form-item>

        <el-form-item label="每页条数">
          <el-input-number v-model="sectionData.list.pageSize" :min="1" :max="100" controls-position="right" />
        </el-form-item>

        <el-form-item label="显示分页">
          <el-switch v-model="sectionData.list.showPagination" />
        </el-form-item>
      </ObCard>

      <ObCard title="卡片跳转">
        <PortalActionLinkField v-model="sectionData.list.link" />
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
    type PortalDataSourceModel,
  } from '../common/portal-data-source';
  import { mergePortalLinkConfig, type PortalLinkConfig } from '../common/portal-link';
  import {
    UnifiedContainerContentConfig,
    createDefaultUnifiedContainerContentConfig,
    mergeUnifiedContainerContentConfig,
  } from '../../common/unified-container';
  import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';

  interface BaseCardListContentData {
    container: UnifiedContainerContentConfigModel;
    dataSource: PortalDataSourceModel;
    list: {
      titleKey: string;
      descriptionKey: string;
      imageKey: string;
      dateKey: string;
      idKey: string;
      pageSize: number;
      showPagination: boolean;
      linkPath?: string;
      linkParamKey?: string;
      linkValueKey?: string;
      openType?: PortalLinkConfig['openType'];
      link: PortalLinkConfig;
    };
  }

  const props = defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['schemaChange']);

  const { sectionData } = useSchemaConfig<BaseCardListContentData>({
    name: 'base-card-list-content',
    sections: {
      container: {},
      dataSource: {},
      list: {},
    },
    schema: props.schema,
    onChange: (newSchema) => {
      emit('schemaChange', 'content', newSchema);
    },
  });

  sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
  sectionData.dataSource = mergePortalDataSourceModel(sectionData.dataSource);
  if (!sectionData.dataSource.staticRowsJson.trim()) {
    sectionData.dataSource = {
      ...createDefaultPortalDataSourceModel(),
      staticRowsJson:
        '[{"id":"1","title":"示例卡片一","description":"这是一个卡片描述","cover":"","publishTime":"2026-03-10"}]',
    };
  }

  sectionData.list = {
    titleKey: typeof sectionData.list?.titleKey === 'string' && sectionData.list.titleKey.trim() ? sectionData.list.titleKey : 'title',
    descriptionKey:
      typeof sectionData.list?.descriptionKey === 'string' && sectionData.list.descriptionKey.trim()
        ? sectionData.list.descriptionKey
        : 'description',
    imageKey: typeof sectionData.list?.imageKey === 'string' && sectionData.list.imageKey.trim() ? sectionData.list.imageKey : 'cover',
    dateKey: typeof sectionData.list?.dateKey === 'string' && sectionData.list.dateKey.trim() ? sectionData.list.dateKey : 'publishTime',
    idKey: typeof sectionData.list?.idKey === 'string' && sectionData.list.idKey.trim() ? sectionData.list.idKey : 'id',
    pageSize: Number(sectionData.list?.pageSize) > 0 ? Number(sectionData.list.pageSize) : 6,
    showPagination: sectionData.list?.showPagination !== false,
    link: mergePortalLinkConfig(
      sectionData.list?.link || {
        path: sectionData.list?.linkPath,
        paramKey: sectionData.list?.linkParamKey,
        valueKey: sectionData.list?.linkValueKey,
        openType: sectionData.list?.openType,
      }
    ),
  };

  if (!sectionData.list.link.path.trim()) {
    sectionData.list.link.path = '/portal/content/detail';
  }
  if (!sectionData.list.link.paramKey.trim()) {
    sectionData.list.link.paramKey = 'id';
  }
  if (!sectionData.list.link.valueKey.trim()) {
    sectionData.list.link.valueKey = sectionData.list.idKey;
  }

  const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
  if (!sectionData.container.title.trim()) {
    sectionData.container.title = '卡片列表';
  }
  if (!sectionData.container.subtitle.trim()) {
    sectionData.container.subtitle = '支持静态与接口数据映射';
  }
  if (!sectionData.container.externalLinkText.trim()) {
    sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
  }

  defineOptions({
    name: 'base-card-list-content',
  });
</script>

<style scoped>
  .content-config {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
